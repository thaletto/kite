import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: LandingPage });

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConceptItem {
  term: string;
  tag: string;
  description: string;
}

interface StepItem {
  n: string;
  heading: string;
  body: string;
}

interface CompareRow {
  aspect: string;
  agui: string;
  a2ui: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const aguiConcepts: ConceptItem[] = [
  {
    term: "Agent",
    tag: "Core",
    description:
      "An AI process that reasons, decides, and acts across multiple steps  not just answering a single question.",
  },
  {
    term: "UI Events",
    tag: "Protocol",
    description:
      "Structured messages emitted in real time: text deltas, tool calls, state updates. Your UI listens and renders.",
  },
  {
    term: "Run",
    tag: "Lifecycle",
    description:
      "A single end-to-end execution. One run spans many model turns, tool calls, and intermediate states.",
  },
  {
    term: "Tool Call",
    tag: "Action",
    description:
      "When an agent invokes a function search, code exec, API call and waits for its result before continuing.",
  },
];

const a2uiConcepts: ConceptItem[] = [
  {
    term: "UI Component",
    tag: "Unit",
    description:
      "The atomic deliverable of A2UI. An agent returns a fully-formed UI fragment a card, form, or chart ready to mount.",
  },
  {
    term: "Component Schema",
    tag: "Contract",
    description:
      "A typed manifest describing what props a UI component accepts, enabling agents to generate valid, renderable output.",
  },
  {
    term: "Render Target",
    tag: "Context",
    description:
      "The surface where agent-generated components land a chat thread, a dashboard slot, an inbox pane.",
  },
  {
    term: "Action Callback",
    tag: "Interaction",
    description:
      "How users interact with agent-generated UI. Button presses and form submits route back to the agent as new events.",
  },
];

const compareRows: CompareRow[] = [
  {
    aspect: "Connects",
    agui: "Agent ↔ UI (human in the loop)",
    a2ui: "Agent → UI component (agent drives layout)",
  },
  {
    aspect: "Transport",
    agui: "SSE / HTTP streaming",
    a2ui: "HTTP / JSON component payloads",
  },
  {
    aspect: "Events",
    agui: "Text delta, tool call, state snapshot",
    a2ui: "Component tree, prop patch, action callback",
  },
  {
    aspect: "Auth",
    agui: "Handled by your backend",
    a2ui: "Inherited from the AG-UI session",
  },
  {
    aspect: "Primary goal",
    agui: "Real-time rendering in a frontend",
    a2ui: "Agent-authored UI fragments users can interact with",
  },
];

const howItWorksSteps: StepItem[] = [
  {
    n: "01",
    heading: "User sends a message",
    body: "Your frontend posts the message to a backend that starts an agent run.",
  },
  {
    n: "02",
    heading: "Agent emits events",
    body: "As it works, the agent streams typed events: text tokens, tool calls, state snapshots.",
  },
  {
    n: "03",
    heading: "UI consumes the stream",
    body: "Each event type maps to a UI update no polling, no custom glue.",
  },
  {
    n: "04",
    heading: "Agent emits a UI component via A2UI",
    body: "When a response warrants rich UI, the agent returns a typed component payload. The frontend mounts it directly.",
  },
  {
    n: "05",
    heading: "Run completes",
    body: "A terminal event signals the end. The UI settles into its finished state.",
  },
];

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useEnterOnMount(delay = 60) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, []);
  return visible;
}

function useStaggerVisible(count: number, baseDelay = 0, step = 65) {
  const [flags, setFlags] = useState<boolean[]>(() => Array(count).fill(false));
  useEffect(() => {
    const timers = Array.from({ length: count }, (_, i) =>
      setTimeout(
        () =>
          setFlags((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          }),
        baseDelay + i * step,
      ),
    );
    return () => timers.forEach(clearTimeout);
  }, []);
  return flags;
}

// ─── Primitives ───────────────────────────────────────────────────────────────

const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

function FadeUp({
  children,
  visible,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  visible: boolean;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
        // Named properties only never `transition: all`
        transition: `opacity 340ms ${EASE_OUT} ${delay}ms, transform 340ms ${EASE_OUT} ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── ConceptCard ──────────────────────────────────────────────────────────────

function ConceptCard({
  term,
  tag,
  description,
  visible,
  accent,
}: ConceptItem & { visible: boolean; accent?: string }) {
  const lineRef = useRef<HTMLDivElement>(null);

  function handleMouseEnter() {
    if (lineRef.current) {
      lineRef.current.style.transform = "scaleX(1)";
    }
  }
  function handleMouseLeave() {
    if (lineRef.current) {
      lineRef.current.style.transform = "scaleX(0)";
    }
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transition: `opacity 280ms ${EASE_OUT}, transform 280ms ${EASE_OUT}`,
      }}
      className="group relative overflow-hidden border-r border-b border-border bg-background p-5 hover:bg-muted/30"
    >
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <span className="font-serif text-[1.0625rem] text-foreground">
          {term}
        </span>
        <Badge
          variant="secondary"
          className="shrink-0 rounded-sm px-1.5 py-0 font-mono text-[9px] uppercase tracking-widest"
          style={accent ? { background: accent + "18", color: accent } : {}}
        >
          {tag}
        </Badge>
      </div>
      <p className="text-[0.8375rem] leading-relaxed text-muted-foreground">
        {description}
      </p>
      {/* Slide-in underline: transform-origin left, ease-out 200ms */}
      <div
        ref={lineRef}
        aria-hidden
        style={{
          position: "absolute",
          bottom: 0,
          left: "20px",
          right: "20px",
          height: "1px",
          background: accent ?? "hsl(var(--foreground))",
          transformOrigin: "left center",
          transform: "scaleX(0)",
          transition: `transform 200ms ${EASE_OUT}`,
        }}
      />
    </div>
  );
}

// ─── StepRow ──────────────────────────────────────────────────────────────────

function StepRow({
  n,
  heading,
  body,
  visible,
}: StepItem & { visible: boolean }) {
  return (
    <li
      className="flex gap-5"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-10px)",
        transition: `opacity 300ms ${EASE_OUT}, transform 300ms ${EASE_OUT}`,
      }}
    >
      <span className="w-7 shrink-0 pt-0.5 font-mono text-[10px] tracking-wider text-muted-foreground/50">
        {n}
      </span>
      <div>
        <p className="mb-1 text-[0.9375rem] font-medium text-foreground">
          {heading}
        </p>
        <p className="text-[0.8375rem] leading-relaxed text-muted-foreground">
          {body}
        </p>
      </div>
    </li>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-6 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function LandingPage() {
  const heroVisible = useEnterOnMount(60);
  const aguiVisible = useStaggerVisible(aguiConcepts.length, 300, 65);
  const a2uiVisible = useStaggerVisible(a2uiConcepts.length, 500, 65);
  const stepsVisible = useStaggerVisible(howItWorksSteps.length, 700, 75);
  const compareVisible = useStaggerVisible(compareRows.length, 900, 55);

  return (
    <>
      {/* ── Global styles injected once ─────────────────────────────────── */}
      <style>{`
              /* Grid border collapse: 1px gap with background trick */
              .concept-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                border-top: 1px solid hsl(var(--border));
                border-left: 1px solid hsl(var(--border));
              }
              @media (max-width: 520px) {
                .concept-grid { grid-template-columns: 1fr; }
              }

              /* Compare table rows */
              .compare-row {
                display: grid;
                grid-template-columns: 130px 1fr 1fr;
                gap: 0;
                border-bottom: 1px solid hsl(var(--border));
                transition: background 120ms ease;
              }
              .compare-row:last-child { border-bottom: none; }
              @media (hover: hover) and (pointer: fine) {
                .compare-row:hover { background: hsl(var(--muted) / 0.4); }
              }
              .compare-cell {
                padding: 14px 16px;
                font-size: 0.8375rem;
                line-height: 1.55;
                border-right: 1px solid hsl(var(--border));
              }
              .compare-cell:last-child { border-right: none; }
              @media (max-width: 580px) {
                .compare-row  { grid-template-columns: 1fr; }
                .compare-cell { border-right: none; border-bottom: 1px solid hsl(var(--border) / 0.5); }
                .compare-cell:last-child { border-bottom: none; }
              }

              /* CTA bar backdrop */
              .cta-bar {
                position: fixed;
                bottom: 0; left: 0; right: 0;
                display: flex;
                justify-content: center;
                padding: 14px 24px;
                background: hsl(var(--background) / 0.88);
                backdrop-filter: blur(14px);
                -webkit-backdrop-filter: blur(14px);
                border-top: 1px solid hsl(var(--border));
                z-index: 50;
              }

              /* Active state on CTA — scale(0.97) gives tactile press feedback */
              .cta-primary:active { transform: scale(0.97); }

              /* prefers-reduced-motion: keep opacity fades, remove transforms */
              @media (prefers-reduced-motion: reduce) {
                [style*="translateY"],
                [style*="translateX"] {
                  transform: none !important;
                  transition: opacity 200ms ease !important;
                }
              }
            `}</style>

      <main className="mx-auto max-w-180 px-5 pb-36 pt-16">
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <FadeUp visible={heroVisible}>
          <span className="mb-4 block font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Open Protocols · Agent Infrastructure
          </span>
          <h1 className="mb-5 font-serif text-[clamp(2.6rem,6vw,4rem)] font-normal leading-[1.08] tracking-[-0.02em] text-foreground">
            AG-UI & A2UI
          </h1>
          <p className="max-w-135 text-[1.0625rem] leading-[1.72] text-muted-foreground">
            Two complementary open protocols for the agentic web.{" "}
            <strong className="font-medium text-foreground">AG-UI</strong>{" "}
            connects agents to human interfaces via a real-time event stream.{" "}
            <strong className="font-medium text-foreground">A2UI</strong> lets
            agents author rich UI components that users can interact with
            directly no hand-written JSX required.
          </p>
        </FadeUp>

        {/* ── Callout ──────────────────────────────────────────────────────── */}
        <FadeUp visible={heroVisible} delay={160}>
          <blockquote className="my-10 border-l-2 border-foreground py-1 pl-5">
            <p className="font-serif text-[1.125rem] italic leading-[1.55] text-foreground">
              AG-UI is{" "}
              <span className="not-italic">HTTP for agents and UIs</span>. A2UI
              is{" "}
              <span className="not-italic">
                the component layer agents write
              </span>
              .
            </p>
          </blockquote>
        </FadeUp>

        <Separator className="my-10" />

        {/* ── AG-UI Concepts ───────────────────────────────────────────────── */}
        <section>
          <FadeUp visible={heroVisible} delay={80}>
            <div className="mb-1 flex items-center gap-3">
              <SectionLabel>AG-UI · Key Concepts</SectionLabel>
              <div
                className="mb-6 h-px flex-1 opacity-30"
                style={{ background: "var(--agui-accent)" }}
              />
            </div>
          </FadeUp>

          <div className="concept-grid">
            {aguiConcepts.map((c, i) => (
              <ConceptCard
                key={c.term}
                {...c}
                visible={aguiVisible[i]}
                accent="var(--agui-accent)"
              />
            ))}
          </div>
        </section>

        <Separator className="my-10" />

        {/* ── A2UI Concepts ────────────────────────────────────────────────── */}
        <section>
          <FadeUp visible={heroVisible} delay={100}>
            <div className="mb-1 flex items-center gap-3">
              <SectionLabel>A2UI · Key Concepts</SectionLabel>
              <div
                className="mb-6 h-px flex-1 opacity-30"
                style={{ background: "var(--a2ui-accent)" }}
              />
            </div>
          </FadeUp>

          <div className="concept-grid">
            {a2uiConcepts.map((c, i) => (
              <ConceptCard
                key={c.term}
                {...c}
                visible={a2uiVisible[i]}
                accent="var(--a2ui-accent)"
              />
            ))}
          </div>
        </section>

        <Separator className="my-10" />

        {/* ── How They Work Together ───────────────────────────────────────── */}
        <section>
          <FadeUp visible={heroVisible} delay={80}>
            <SectionLabel>How They Work Together</SectionLabel>
          </FadeUp>
          <ol className="space-y-7">
            {howItWorksSteps.map((s, i) => (
              <StepRow key={s.n} {...s} visible={stepsVisible[i]} />
            ))}
          </ol>
        </section>

        <Separator className="my-10" />

        {/* ── Protocol Comparison ──────────────────────────────────────────── */}
        <section>
          <FadeUp visible={heroVisible} delay={80}>
            <SectionLabel>Protocol Comparison</SectionLabel>
          </FadeUp>

          <Card className="overflow-hidden p-0">
            {/* Header row */}
            <div className="compare-row bg-muted/50">
              <div className="compare-cell font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Aspect
              </div>
              <div
                className="compare-cell font-mono text-[10px] uppercase tracking-widest"
                style={{ color: "var(--agui-accent)" }}
              >
                AG-UI
              </div>
              <div
                className="compare-cell font-mono text-[10px] uppercase tracking-widest"
                style={{ color: "var(--a2ui-accent)" }}
              >
                A2UI
              </div>
            </div>

            {compareRows.map((row, i) => (
              <div
                key={row.aspect}
                className="compare-row"
                style={{
                  opacity: compareVisible[i] ? 1 : 0,
                  transform: compareVisible[i]
                    ? "translateY(0)"
                    : "translateY(6px)",
                  transition: `opacity 260ms ${EASE_OUT}, transform 260ms ${EASE_OUT}`,
                }}
              >
                <div className="compare-cell font-medium text-foreground">
                  {row.aspect}
                </div>
                <div className="compare-cell text-muted-foreground">
                  {row.agui}
                </div>
                <div className="compare-cell text-muted-foreground">
                  {row.a2ui}
                </div>
              </div>
            ))}
          </Card>
        </section>

        <Separator className="my-10" />

        {/* ── Why It Matters ───────────────────────────────────────────────── */}
        <section>
          <FadeUp visible={heroVisible} delay={80}>
            <SectionLabel>Why It Matters</SectionLabel>
            <div className="space-y-4 text-[0.9rem] leading-[1.75] text-muted-foreground">
              <p>
                Without shared protocols, every team reinvents the same bridges:
                custom event formats between agent and UI, bespoke RPC schemes
                between agents, fragile one-off integrations that break when
                either side changes.
              </p>
              <p>
                AG-UI standardises the event contract between an agent and any
                frontend. A2UI standardises how agents author and deliver UI
                components that users can interact with. Adopt one or both they
                compose cleanly.
              </p>
              <p>
                The result: agents that don't just answer in plain text, but
                return rich, interactive interfaces charts, forms, summaries
                built at runtime, not hardcoded in your codebase.
              </p>
            </div>
          </FadeUp>
        </section>
      </main>

      {/* ── Sticky CTA bar ───────────────────────────────────────────────────── */}
      <div className="cta-bar">
        <div className="flex w-full max-w-sm gap-3">
          <Link to="/chat" className="w-full">
            <Button
              size="lg"
              className="cta-primary w-full h-12 flex-1 font-medium cursor-pointer"
              style={{
                // Named transition only  never `all`
                transition: `transform 130ms ${EASE_OUT}, background 130ms ease, opacity 130ms ease`,
              }}
            >
              Try Chat &rarr;
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
