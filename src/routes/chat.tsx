import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import { createFileRoute } from "@tanstack/react-router";
import "@copilotkit/react-ui/styles.css";
import {
  useButton,
  useCard,
  useInput,
  useCheckbox,
  useSelect,
  useTable,
  useTabs,
  useSwitch,
  useSeparator,
  useRow,
} from "#/components/chat/useComponent";

export const Route = createFileRoute("/chat")({
  component: App,
});

function App() {
  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      agent="default"
      enableInspector={true}
    >
      <Chat />
    </CopilotKit>
  );
}

function Chat() {
  useButton();
  useCard();
  useInput();
  useCheckbox();
  useSelect();
  useTable();
  useTabs();
  useSwitch();
  useSeparator();
  useRow();

  return (
    <main className="relative z-10 bg-background h-full w-full flex-col overflow-hidden">
      <div className="mx-auto flex min-h-0 h-full w-full max-w-4xl flex-col px-4">
        <CopilotChat
          className="flex-1 bg-background!"
          suggestions={[
            {
              title: "Create a pizza card",
              message: `Create a card of popular italian pizza, mention it's preparation steps`,
            },
            {
              title: "Create a dropdown of top countries",
              message: "Create a dropdown of top countries",
            },
          ]}
        />
      </div>
    </main>
  );
}
