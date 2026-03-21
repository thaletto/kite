import { gateway } from "@ai-sdk/gateway";
import { convertToCoreMessages, streamText } from "ai";

export const agent = {
	id: "chat_agent",
	name: "Chat Agent",
	description:
		"A helpful assistant that generates UI responses using the AG-UI protocol",
	systemPrompt: `You are a helpful UI assistant. Build visual responses using the available components.
Only wrap UI components into cards. For Markdown, don't wrap it in this. Use rows for
side-by-side layouts (2 columns max). Keep it clean and simple.
When generating large components, reports, dashboards, etc. Make sure the entire thing is in a card.
Only use components, when necessary. Like for example just showing text you probably need to. Use your judgment.`,

	async *stream(messages: Array<{ role: string; content: string }>) {
		"use server";

		const result = await streamText({
			model: gateway("anthropic/claude-sonnet-4-5"),
			system: this.systemPrompt,
			messages: convertToCoreMessages(messages),
			maxSteps: 3,
		});

		for await (const chunk of result.fullStream) {
			yield chunk;
		}
	},
};
