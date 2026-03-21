import { streamText, UIMessage, convertToModelMessages } from "ai";
import { DEFAULT_MODEL } from "@/ai/constants";
import { NextResponse } from "next/server";
import { getModelOptions } from "@/ai/gateway";
import { checkBotId } from "botid/server";
import { SYSTEM_PROMPT } from "@/ai/prompt";

export async function POST(req: Request) {
    const checkResult = await checkBotId();
    if (checkResult.isBot) {
        return NextResponse.json({ error: `Bot detected` }, { status: 403 });
    }

    const {
        messages,
        modelId = DEFAULT_MODEL,
    }: { messages: UIMessage[]; modelId?: string } = await req.json();
    const { model: languageModel } = getModelOptions(modelId);

    const result = streamText({
        model: languageModel,
        system: SYSTEM_PROMPT,
        messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
}
