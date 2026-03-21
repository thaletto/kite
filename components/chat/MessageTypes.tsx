import React from "react";
import { Response } from "@/components/ai-elements/response";
import type { UIDataTypes, UIMessagePart, UITools } from "ai";
import { ActionBar } from "@/components/chat/ActionsBar";
import { Image } from "../ai-elements/image";
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from "../ai-elements/tool";

type Role = "user" | "system" | "assistant";

interface Props {
  isLastMessage: boolean;
  index: number;
  part: UIMessagePart<UIDataTypes, UITools>;
  role: Role;
  regenerate: () => Promise<void>;
}

export function MessageTypes({
  part,
  isLastMessage,
  index,
  role,
  regenerate,
}: Props) {
  switch (part.type) {
    case "text":
      return (
        <TextMessage
          index={index}
          text={part.text}
          role={role}
          isLastMessage={isLastMessage}
          regenerate={regenerate}
        />
      );
    case "file":
      return (
        <Image
          mediaType={part.mediaType || "image/png"}
          base64={part.url}
          uint8Array={new Uint8Array([])}
          alt="Uploaded file"
          className="h-[150px] aspect-square border"
        />
      );
    case "tool-image_generation":
      return (
        <ToolMessage
          part={part}
          index={index}
          role={role}
          isLastMessage={isLastMessage}
          regenerate={regenerate}
        />
      );
    default:
      return null;
  }
}

function TextMessage({
  index,
  text,
  role,
  isLastMessage,
  regenerate,
}: {
  index: number;
  text: string;
  role: Role;
  isLastMessage: boolean;
  regenerate: () => Promise<void>;
}) {
  return (
    <React.Fragment key={index}>
      <Response>{text}</Response>
      {role === "assistant" && isLastMessage && (
        <ActionBar
          regenerate={regenerate}
          copyContent={text}
          className="mt-1"
        />
      )}
    </React.Fragment>
  );
}

function ToolMessage({
  part,
  index,
  role,
  isLastMessage,
  regenerate,
}: {
  part: UIMessagePart<UIDataTypes, UITools>;
  index: number;
  role: Role;
  isLastMessage: boolean;
  regenerate: () => Promise<void>;
}) {
  if (part.type !== "tool-image_generation") return null;

  // Cast to tool type to access properties
  const toolPart = part as any;

  // Handle image generation tool results
  if (toolPart.toolName === "image_generation" && toolPart.state === "output-available") {
    const output = toolPart.output as any;
    if (output?.image) {
      return (
        <div className="space-y-2">
          <Image
            mediaType="image/webp"
            base64={output.image}
            uint8Array={new Uint8Array([])}
            alt="Generated image"
            className="h-[300px] w-auto border rounded-md"
          />
          {role === "assistant" && isLastMessage && (
            <ActionBar
              regenerate={regenerate}
              copyContent=""
              className="mt-1"
            />
          )}
        </div>
      );
    }
  }

  // Default tool display
  return (
    <Tool>
      <ToolHeader type={toolPart.toolName} state={toolPart.state} />
      <ToolContent>
        {toolPart.input && <ToolInput input={toolPart.input} />}
        <ToolOutput output={toolPart.output} errorText={toolPart.errorText} />
      </ToolContent>
    </Tool>
  );
}
