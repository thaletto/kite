import { useJsonRenderMessage } from "@json-render/react";
import {SPEC_DATA_PART, SPEC_DATA_PART_TYPE, type SpecDataPart} from "@json-render/core"
import type { UIMessage } from "ai";
import { Streamdown } from "streamdown";
import { ExplorerRenderer } from "@/lib/render/renderer";
import ToolCallDisplay from "./tools";


type AppDataParts = { [SPEC_DATA_PART]: SpecDataPart };
type AppMessage = UIMessage<unknown, AppDataParts>;

export default function MessageBubble({
	message,
	isLast,
	isStreaming,
}: {
	message: AppMessage;
	isLast: boolean;
	isStreaming: boolean;
}) {
	const isUser = message.role === "user";
	const { spec, text, hasSpec } = useJsonRenderMessage(message.parts);

	// Build ordered segments from parts, collapsing adjacent text and adjacent tools.
	// Spec data parts are tracked so the rendered UI appears inline where the AI
	// placed it rather than always at the bottom.
	const segments: Array<
		| { kind: "text"; text: string }
		| {
				kind: "tools";
				tools: Array<{
					toolCallId: string;
					toolName: string;
					state: string
					output?: unknown;
				}>
		  }
		| { kind: "spec" }
	> = [];

	let specInserted = false;

	for (const part of message.parts) {
		if (part.type === "text") {
			if (!part.text.trim()) continue;
			const last = segments[segments.length - 1];
			if (last?.kind === "text") {
				last.text += part.text;
			} else {
				segments.push({ kind: "text", text: part.text });
			}
		} else if (part.type.startsWith("tool-")) {
			const tp = part as {
				type: string;
				toolCallId: string;
				state: string;
				output?: unknown;
			}
			const last = segments[segments.length - 1];
			if (last?.kind === "tools") {
				last.tools.push({
					toolCallId: tp.toolCallId,
					toolName: tp.type.replace(/^tool-/, ""),
					state: tp.state,
					output: tp.output,
				})
			} else {
				segments.push({
					kind: "tools",
					tools: [
						{
							toolCallId: tp.toolCallId,
							toolName: tp.type.replace(/^tool-/, ""),
							state: tp.state,
							output: tp.output,
						},
					],
				})
			}
		} else if (part.type === SPEC_DATA_PART_TYPE && !specInserted) {
			// First spec data part — mark where the rendered UI should appear
			segments.push({ kind: "spec" });
			specInserted = true;
		}
	}

	const hasAnything = segments.length > 0 || hasSpec;
	const showLoader = isLast && isStreaming && message.role === "assistant" && !hasAnything;

	if (isUser) {
		return (
			<div className="flex justify-end">
				{text && (
					<div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap bg-primary text-primary-foreground rounded-tr-md">
						{text}
					</div>
				)}
			</div>
		)
	}

	// If there's a spec but no spec segment was inserted (edge case),
	// append it so it still renders.
	const specRenderedInline = specInserted;
	const showSpecAtEnd = hasSpec && !specRenderedInline;

	return (
		<div className="w-full flex flex-col gap-3">
			{segments.map((seg, i) => {
				if (seg.kind === "text") {
					const isLastSegment = i === segments.length - 1;
					return (
						<div
							key={`text-${i}`}
							className="text-sm leading-relaxed [&_p+p]:mt-3 [&_ul]:mt-2 [&_ol]:mt-2 [&_pre]:mt-2"
						>
							<Streamdown
                                mode="streaming"
								isAnimating={isLast && isStreaming && isLastSegment}
							>
								{seg.text}
							</Streamdown>
						</div>
					)
                }
				
				if (seg.kind === "spec") {
					if (!hasSpec) return null;
					return (
                        <div key="spec" className="w-full">
							<ExplorerRenderer spec={spec} loading={isLast && isStreaming} />
						</div>
					)
				}
				return (
					<div key={`tool-${i}`} className="flex flex-col gap-1">
						{seg.tools.map((t) => (
							<ToolCallDisplay
								key={t.toolCallId}
								toolName={t.toolName}
								state={t.state}
								result={t.output}
							/>
						))}
					</div>
				)
			})}

			{/* Loading indicator */}
			{showLoader && (
				<div className="text-sm text-muted-foreground animate-shimmer">
					Thinking...
				</div>
			)}

			{/* Fallback: render spec at end if no inline position was found */}
			{showSpecAtEnd && (
				<div className="w-full">
					<ExplorerRenderer spec={spec} loading={isLast && isStreaming} />
				</div>
			)}
		</div>
	)
}
