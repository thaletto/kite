import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import { createFileRoute } from "@tanstack/react-router";
import { useComponent } from "@copilotkit/react-core/v2";
import "@copilotkit/react-ui/styles.css";
import { Button } from "#/components/ui/button";
import { z } from "zod";

export const Route = createFileRoute("/chat")({
  component: App,
});

function App() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent="default">
      <Chat />
    </CopilotKit>
  );
}

function Chat() {
  useComponent({
    name: "button",
    description: "clickable button",
    parameters: z.object({ text: z.string() }),
    render: ({ text }: { text: string }) => <Button>{text}</Button>,
  });

  return (
    <main className="relative z-10 bg-background h-full w-full flex-col overflow-hidden">
      <div className="mx-auto flex min-h-0 h-full w-full max-w-4xl flex-col px-4">
        <CopilotChat className="flex-1 bg-background!" />
      </div>
    </main>
  );
}
