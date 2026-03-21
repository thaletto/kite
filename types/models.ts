import { AnthropicProviderOptions } from "@ai-sdk/anthropic";
import { GatewayModelId } from "@ai-sdk/gateway";
import { GoogleGenerativeAIProviderOptions } from "@ai-sdk/google";
import { OpenAIResponsesProviderOptions } from "@ai-sdk/openai";
import { LanguageModel } from "ai";

export interface AvailableModel {
  id: GatewayModelId;
  name: string;
}

export interface ModelOptions {
  model: LanguageModel;
  headers?: Record<string, string>;
  openAIProviderOptions?: OpenAIResponsesProviderOptions;
  googleProviderOptions?: GoogleGenerativeAIProviderOptions;
  anthropicProviderOptions?: AnthropicProviderOptions;
}

export type Metadata = {
  model: string
}
