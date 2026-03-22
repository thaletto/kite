import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import { createFileRoute } from "@tanstack/react-router";
import { CustomMessageRenderer } from "#/components/chat/message-renderer";
import "@copilotkit/react-ui/styles.css";

function ChatHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-4">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Chat
      </h1>
      <div className="h-px w-full bg-linear-to-r from-transparent via-muted-foreground/20 to-transparent" />
    </header>
  );
}

export const Route = createFileRoute("/chat")({
  component: ChatPage,
});

function ChatPage() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent="default">
      <main className="relative z-10 flex h-dvh w-full flex-col overflow-hidden">
        <ChatHeader />
        <div className="mx-auto flex min-h-0 h-full w-full max-w-4xl flex-col px-4">
          <CopilotChat
            className="flex-1"
            AssistantMessage={CustomMessageRenderer as any}
          />
        </div>
      </main>
    </CopilotKit>
  );
}
