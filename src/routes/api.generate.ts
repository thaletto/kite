import { createFileRoute } from "@tanstack/react-router";
import { agent } from "@/lib/agent";
import { minuteRateLimit, dailyRateLimit } from "@/lib/rate-limit";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";
import { pipeJsonRender, SPEC_DATA_PART_TYPE } from "@json-render/core";
import { useRequest } from "nitro/context";
import type { RequestLogger } from "evlog";
import { route, routerEnabled } from "@/lib/router";

function userTexts(messages: UIMessage[]): string[] {
  return messages
    .filter((m) => m.role === "user")
    .map((m) =>
      m.parts
        .flatMap((p) => (p.type === "text" ? [p.text] : []))
        .join("\n")
        .trim(),
    )
    .filter((t) => t.length > 0);
}

/**
 * Jev router fast path. Returns null to hand the request to the LLM agent:
 * when the router is off, when the truth table says fallback, or when the
 * TypeSafe call fails (logged as an error, never read as an answer).
 */
async function tryRouter(messages: UIMessage[], log: RequestLogger) {
  if (!routerEnabled()) return null;
  const texts = userTexts(messages);
  const latest = texts.at(-1);
  if (!latest) return null;
  try {
    const result = await route(latest, texts.slice(0, -1), (trace) =>
      log.set({ jev: trace }),
    );
    if (result.kind === "fallback") {
      log.set({ jevFallback: result.reason });
      return null;
    }
    return result;
  } catch (error) {
    log.error(error instanceof Error ? error : new Error(String(error)), {
      step: "jev-router",
    });
    return null;
  }
}

export const Route = createFileRoute("/api/generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const req = useRequest();
        const log = req.context!.log as RequestLogger;

        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0] ?? "anonymous";

        const [minuteResult, dailyResult] = await Promise.all([
          minuteRateLimit.limit(ip),
          dailyRateLimit.limit(ip),
        ]);

        log.set({ ip, minuteResult, dailyResult });

        if (!minuteResult.success || !dailyResult.success) {
          const isMinuteLimit = !minuteResult.success;
          log.set({ status: 429, message: "Rate limit exceeded" });
          return new Response(
            JSON.stringify({
              error: "Rate limit exceeded",
              message: isMinuteLimit
                ? "Too many requests. Please wait a moment before trying again."
                : "Daily limit reached. Please try again tomorrow.",
            }),
            {
              status: 429,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        const body = await request.json();
        const uiMessages: UIMessage[] = body.messages;

        if (
          !uiMessages ||
          !Array.isArray(uiMessages) ||
          uiMessages.length === 0
        ) {
          return new Response(
            JSON.stringify({ error: "messages array is required" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        const routed = await tryRouter(uiMessages, log);
        if (routed) {
          const stream = createUIMessageStream({
            execute: ({ writer }) => {
              const id = crypto.randomUUID();
              writer.write({ type: "text-start", id });
              writer.write({ type: "text-delta", id, delta: routed.text });
              writer.write({ type: "text-end", id });
              writer.write({
                type: SPEC_DATA_PART_TYPE,
                data: { type: "flat", spec: routed.spec },
              });
            },
          });
          log.set({ message: "message routed by Jev" });
          return createUIMessageStreamResponse({ stream });
        }

        const modelMessages = await convertToModelMessages(uiMessages);
        const result = await agent.stream({ messages: modelMessages });

        const stream = createUIMessageStream({
          execute: async ({ writer }) => {
            writer.merge(pipeJsonRender(result.toUIMessageStream()));
          },
        });

        log.set({
          message: "message generated",
        });

        return createUIMessageStreamResponse({ stream });
      },
    },
  },
});
