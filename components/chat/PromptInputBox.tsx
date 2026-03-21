import {
  PromptInput,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
} from "@/components/ai-elements/prompt-input";
import { cn } from "@/lib/utils";
import { AvailableModel } from "@/types/models";
import type { ChatStatus } from "ai";
import { DEFAULT_MODEL } from "@/ai/constants";

interface Props {
  handleSubmit: () => void;
  className?: string;
  input: string;
  setInput: (value: string) => void;
  modelId: string;
  setModelId: (value: string) => void;
  models: AvailableModel[];
  status: ChatStatus;
}

export function PromptInputBox({
  handleSubmit,
  className,
  input,
  setInput,
  modelId,
  setModelId,
  models,
  status,
}: Props) {
  return (
    <PromptInput
      onSubmit={() => handleSubmit()}
      className={cn(className, "relative")}
    >
      <PromptInputTextarea
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
        }}
      />
      <PromptInputToolbar className="border-t border-border">
        <div className="flex items-center gap-2">
          <label
            htmlFor="model-select"
            className="sr-only"
          >
            Select AI Model
          </label>
          <PromptInputModelSelect
            value={modelId}
            onValueChange={(value) => setModelId(value)}
          >
            <PromptInputModelSelectTrigger
              id="model-select"
              aria-label="Select AI Model"
              aria-haspopup="listbox"
              aria-expanded="false"
            >
              <PromptInputModelSelectValue placeholder={DEFAULT_MODEL} />
            </PromptInputModelSelectTrigger>
            <PromptInputModelSelectContent
              role="listbox"
              aria-label="AI Model Options"
            >
              {models.map((model) => (
                <PromptInputModelSelectItem
                  key={model.id}
                  value={model.id}
                  role="option"
                  aria-selected={modelId === model.id}
                >
                  {model.name}
                </PromptInputModelSelectItem>
              ))}
            </PromptInputModelSelectContent>
          </PromptInputModelSelect>
        </div>
        <PromptInputSubmit
          className="absolute right-1 bottom-1"
          disabled={false}
          status={status}
          aria-label="Send message"
          title="Send message"
          tabIndex={0}
        />
      </PromptInputToolbar>
    </PromptInput>
  );
}
