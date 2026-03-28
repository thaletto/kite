import {
  CopilotRuntime,
  copilotRuntimeNodeHttpEndpoint,
} from "@copilotkit/runtime";
import { createFileRoute } from "@tanstack/react-router";
import { BuiltInAgent } from "@copilotkit/runtime/v2";
import { createGateway } from "@ai-sdk/gateway";

const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY,
});

const agent = new BuiltInAgent({
  model: gateway("google/gemini-3.1-flash-lite-preview"),
  prompt: `You are helpful general assitant, your duty is to respond to the user in a general, friendly tone.
  try to the frontend tools as much as possible, and reduce normal text conversations,
  try to say your message via the frontend tools`,
});

const runtime = new CopilotRuntime({
  agents: {
    default: agent,
  },
  a2ui: {},
});

export const Route = createFileRoute("/api/copilotkit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const handler = copilotRuntimeNodeHttpEndpoint({
          runtime,
          endpoint: "/api/copilotkit",
        });

        const response = await handler(request);
        return (
          response ??
          new Response("Copilot Runtime Error", {
            status: 500,
            statusText: "error caused by `copilotRuntimeNodeHttpEndpoint`",
          })
        );
      },
    },
  },
});
