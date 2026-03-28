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
    <main className="relative z-10 bg-[#FFF] h-full w-full flex-col overflow-hidden">
      <div className="mx-auto flex min-h-0 h-full w-full max-w-4xl flex-col px-4">
        <CopilotChat
          className=""
          suggestions={[
            {
              title: "Compare today's weather of New York and Los Angles",
              message: `Compare today's weather of New York and Los Angles`,
            },
            {
              title: "Tell me the top 5 news today",
              message: "Tell me the top 5 news today",
            },
          ]}
        />
      </div>
    </main>
  );
}
