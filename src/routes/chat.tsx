import { CopilotKit } from "@copilotkit/react-core";
import type {
	AssistantMessageProps,
	UserMessageProps,
} from "@copilotkit/react-ui";
import {
	AssistantMessage,
	CopilotChat,
	UserMessage,
} from "@copilotkit/react-ui";
import type { Message } from "@copilotkit/shared";
import { createFileRoute } from "@tanstack/react-router";
import "@copilotkit/react-ui/styles.css";
import { Card, CardContent } from "#/components/ui/card";

function ChatHeader() {
	return (
		<header className="flex items-center justify-between px-6 py-4">
			<h1 className="text-xl font-semibold tracking-tight text-foreground">
				Chat
			</h1>
			<div className="h-px w-full bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent" />
		</header>
	);
}

function CustomUserMessage({ message }: UserMessageProps) {
	return (
		<div className="flex w-full justify-end">
			<div className="max-w-[64ch] rounded-none bg-primary px-4 py-3 text-sm text-primary-foreground">
				<pre className="whitespace-pre-wrap text-[15px] leading-6">
					{message.content}
				</pre>
			</div>
		</div>
	);
}

function CustomAssistantMessage({
	message,
	isLoading,
	isGenerating,
}: AssistantMessageProps) {
	return (
		<div className="flex w-full justify-start">
			<Card className="max-w-full">
				<CardContent className="prose prose-sm max-w-none p-4">
					{isLoading || isGenerating ? (
						<p className="text-sm text-muted-foreground">Thinking...</p>
					) : (
						<pre className="whitespace-pre-wrap text-sm leading-5 text-foreground">
							{message.content}
						</pre>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

export const Route = createFileRoute("/chat")({
	component: ChatPage,
});

function ChatPage() {
	return (
		<CopilotKit runtimeUrl="/api/copilotkit" agent="chat_agent">
			<main className="relative z-10 flex h-dvh w-full flex-col overflow-hidden">
				<ChatHeader />
				<div className="mx-auto flex min-h-0 h-full w-full max-w-3xl flex-col px-4">
					<CopilotChat
						className="flex-1"
						AssistantMessage={CustomAssistantMessage}
						UserMessage={CustomUserMessage}
					/>
				</div>
			</main>
		</CopilotKit>
	);
}
