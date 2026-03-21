"use client";

import { DEFAULT_MODEL, SUGGESTIONS } from "@/ai/constants";
import { toast } from "sonner";
import { useChat } from "@ai-sdk-tools/store";
import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "../providers/session-provider";
import { useMessageToken } from "@/hooks/use-message-token";
import { encryptSessionToken, isEncryptedToken } from "@/lib/utils";

import {
    Conversation,
    ConversationContent,
    ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { getSupportedModels } from "@/functions/models";
import type { AvailableModel } from "@/types/models";
import { PromptInputBox } from "./PromptInputBox";
import { MessageTypes } from "./MessageTypes";
import { Suggestion } from "../ai-elements/suggestion";
import { Loader } from "../ai-elements/loader";

export function ChatConversation() {
    const [modelId, setModelId] = useState(DEFAULT_MODEL);
    const { token, count, increment, unLockMessaging } = useMessageToken();
    const session = useSession();
    const [input, setInput] = useState("");
    const { messages, sendMessage, setMessages, status, regenerate } = useChat({
        onError: (error) => {
            toast.error(`Communication error with the AI`);
            console.error("Error sending message:", error);
        },
    });

    const noMessage = useMemo(() => messages.length === 0, [messages]);

    function validateAndSubmitMessage(text: string) {
        if (!text.trim()) return;

        const isGuestToken = token && !isEncryptedToken(token);

        // Guest Mode
        if (!session && count >= 3 && isGuestToken) {
            toast.info("Please log in to send more message");
            return;
        }

        sendMessage({ text }, { body: { modelId } });
        setInput("");

        if (!session) increment();
    }

    useEffect(() => {
        if (session) {
            unLockMessaging(encryptSessionToken(session));
        }
    }, [session]);

    useEffect(() => {
        const onNewChat = () => setMessages([]);
        window.addEventListener("new-chat", onNewChat);
        return () => window.removeEventListener("new-chat", onNewChat);
    }, [setMessages]);

    const [models, setModels] = useState<AvailableModel[]>([]);

    useEffect(() => {
        async function fetchModels() {
            try {
                const result = await getSupportedModels();
                setModels(result.models);
            } catch (err) {
                console.error("Failed to fetch models:", err);
            }
        }
        fetchModels();
    }, []);

    return (
        <>
            <Conversation className="relative w-full flex flex-col">
                {noMessage && (
                    <section className="flex flex-col justify-start items-start flex-1 mx-auto w-full max-w-sm md:max-w-xl lg:max-w-4xl">
                        <h1 className="text-2xl font-bold font-sans w-full max-w-sm k">
                            {session?.user.name &&
                                `Hello ${session?.user.name}`}
                            <br />
                            <span className="text-zinc-500">
                                How can I help you?
                            </span>
                        </h1>
                    </section>
                )}

                {!noMessage && (
                    <>
                        <ConversationContent className="mx-auto max-w-sm md:max-w-xl lg:max-w-4xl">
                            {messages.map((message, messageIndex) => {
                                const isLastMessage =
                                    messageIndex === messages.length - 1;
                                return (
                                    <React.Fragment key={messageIndex}>
                                        <Message from={message.role}>
                                            <MessageContent variant="flat">
                                                {message.parts.map(
                                                    (part, i) => (
                                                        <MessageTypes
                                                            part={part}
                                                            key={i}
                                                            index={i}
                                                            isLastMessage={
                                                                isLastMessage
                                                            }
                                                            role={message.role}
                                                            regenerate={
                                                                regenerate
                                                            }
                                                        />
                                                    ),
                                                )}
                                            </MessageContent>
                                        </Message>
                                        {status === "submitted" &&
                                            isLastMessage && <Loader />}
                                    </React.Fragment>
                                );
                            })}
                        </ConversationContent>
                        <ConversationScrollButton />
                    </>
                )}
            </Conversation>

            {noMessage && (
                <section className="mx-auto w-full max-w-sm md:max-w-xl lg:max-w-4xl overflow-x-none grid grid-cols-2 gap-2">
                    {SUGGESTIONS.map((suggestion) => (
                        <Suggestion
                            key={suggestion}
                            onClick={() => validateAndSubmitMessage(suggestion)}
                            suggestion={suggestion}
                            className="text-xs py-6 rounded-md text-wrap border-border"
                        />
                    ))}
                </section>
            )}

            <PromptInputBox
                handleSubmit={() => validateAndSubmitMessage(input)}
                input={input}
                setInput={setInput}
                modelId={modelId}
                setModelId={setModelId}
                models={models}
                status={status}
                className="my-2 mx-auto max-w-sm md:max-w-xl lg:max-w-4xl rounded-xl border border-border"
            />
        </>
    );
}
