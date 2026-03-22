import type { RenderMessageProps } from "@copilotkit/react-ui"
import { useChatKit } from "./chat-kit"
import { useJsonParser } from "@hashbrownai/react"
import { memo } from "react"

const AssistantMessageRenderer = memo(function AssistantMessageRenderer({
	message,
}: {
	message: RenderMessageProps["message"]
}) {
	const kit = useChatKit()
	const { value } = useJsonParser(
		typeof message.content === "string" ? message.content : "",
		kit.schema,
	)
	if (!value) return null

	return (
		<div className="flex w-full justify-start">
			<div className="w-full">
				{kit.render(value)}
			</div>
		</div>
	)
})

export function CustomMessageRenderer({ message }: RenderMessageProps) {
	if (message.role === "assistant") {
		return <AssistantMessageRenderer message={message} />
	}

	if (message.role === "tool") {
		return (
			<div className="mb-2 text-sm text-muted-foreground">
				{typeof message.content === "string"
					? message.content
					: JSON.stringify(message.content)}
			</div>
		)
	}

	return (
		<div className="flex w-full justify-end">
			<div className="max-w-[64ch] rounded-none bg-primary px-4 py-3 text-sm text-primary-foreground">
				<pre className="whitespace-pre-wrap">
					{typeof message.content === "string"
						? message.content
						: JSON.stringify(message.content)}
				</pre>
			</div>
		</div>
	)
}
