import { useChat } from "@ai-sdk/react";
import { SPEC_DATA_PART, type SpecDataPart } from "@json-render/core";
import { createFileRoute } from "@tanstack/react-router";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ArrowDown, ArrowUp, Loader2, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import MessageBubble from "@/components/chat/message";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// =============================================================================
// Types
// =============================================================================

type AppDataParts = { [SPEC_DATA_PART]: SpecDataPart };
type AppMessage = UIMessage<unknown, AppDataParts>;

// =============================================================================
// Transport
// =============================================================================

const transport = new DefaultChatTransport({ api: "/api/generate" });

// =============================================================================
// Suggestions (shown in empty state)
// =============================================================================

const SUGGESTIONS = [
  {
    label: "Weather comparison",
    prompt: "Compare the weather in New York, London, and Tokyo",
  },
  {
    label: "GitHub repo stats",
    prompt: "Show me stats for the vercel/next.js and vercel/ai GitHub repos",
  },
  {
    label: "Crypto dashboard",
    prompt: "Build a crypto dashboard for Bitcoin, Ethereum, and Solana",
  },
  {
    label: "Hacker News top stories",
    prompt: "Show me the top 15 Hacker News stories right now",
  },
];

// =============================================================================
// Page
// =============================================================================

export const Route = createFileRoute("/")({ component: ChatPage });

function ChatPage() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const isStickToBottom = useRef(true);
  const isAutoScrolling = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, setMessages, status, error } =
    useChat<AppMessage>({ transport });

  const isStreaming = status === "streaming" || status === "submitted";
  const isEmpty = messages.length === 0;

  // Memoised so suggestion buttons never re-render due to parent re-renders
  const suggestions = useMemo(() => SUGGESTIONS, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const THRESHOLD = 80;

    const handleScroll = () => {
      // Skip state update entirely during programmatic scroll
      if (isAutoScrolling.current) {
        const { scrollTop, scrollHeight, clientHeight } = container;
        if (scrollTop + clientHeight >= scrollHeight - THRESHOLD) {
          isAutoScrolling.current = false;
        }
        return;
      }
      const { scrollTop, scrollHeight, clientHeight } = container;
      const atBottom = scrollTop + clientHeight >= scrollHeight - THRESHOLD;
      isStickToBottom.current = atBottom;
      // Batch: only call setState when the value actually changes
      setShowScrollButton((prev) => (prev === atBottom ? prev : !atBottom));
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !isStickToBottom.current) return;
    isAutoScrolling.current = true;
    container.scrollTop = container.scrollHeight;
    // Clear the flag in the same frame the browser confirms the position
    requestAnimationFrame(() => {
      isAutoScrolling.current = false;
    });
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    isStickToBottom.current = true;
    setShowScrollButton(false);
    isAutoScrolling.current = true;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, []);

  const handleSubmit = useCallback(
    async (text?: string) => {
      const message = text ?? input;
      if (!message.trim() || isStreaming) return;
      setInput("");
      await sendMessage({ text: message.trim() });
    },
    [input, isStreaming, sendMessage],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const handleClear = useCallback(() => {
    setMessages([]);
    setInput("");
    inputRef.current?.focus();
  }, [setMessages]);

  return (
    // `overflow-hidden` on root keeps the page from ever scrolling itself
    <div className="h-full flex flex-col overflow-hidden">
      {/* Messages area */}
      <main ref={scrollContainerRef} className="flex-1 overflow-auto">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center px-6 py-12">
            <div className="max-w-2xl w-full space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">
                  What would you like to explore?
                </h2>
                <p className="text-muted-foreground">
                  Ask about weather, GitHub repos, crypto prices, or Hacker News
                  — the agent will fetch real data and build a dashboard.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestions.map((s) => (
                  <Button
                    key={s.label}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSubmit(s.prompt)}
                    className="rounded-full"
                  >
                    <Sparkles className="h-3 w-3" />
                    {s.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-10 py-6 space-y-6">
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isLast={index === messages.length - 1}
                isStreaming={isStreaming}
              />
            ))}
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error.message}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Sticky input bar */}
      <div className="shrink-0 bg-background border-t px-6 pb-4 pt-3 relative">
        {/* Scroll-to-bottom pill */}
        {showScrollButton && !isEmpty && (
          <Button
            variant="outline"
            size="icon"
            onClick={scrollToBottom}
            aria-label="Scroll to bottom"
            className="absolute left-1/2 -translate-x-1/2 -top-10 z-10 h-8 w-8 rounded-full shadow-md"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        )}

        <div className="max-w-4xl mx-auto relative">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isEmpty
                ? "e.g., Compare weather in NYC, London, and Tokyo..."
                : "Ask a follow-up..."
            }
            rows={2}
            className="resize-none rounded-xl pr-24"
          />

          {/* Right-side action cluster */}
          <div className="absolute right-3 bottom-3 flex items-center gap-1.5">
            {!isEmpty && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="h-8 px-2.5 rounded-lg text-xs"
              >
                Start over
              </Button>
            )}

            <Button
              size="icon"
              onClick={() => handleSubmit()}
              disabled={!input.trim() || isStreaming}
              className="h-8 w-8 rounded-lg"
            >
              {isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
