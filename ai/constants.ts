import { type GatewayModelId } from "@ai-sdk/gateway";

export const DEFAULT_MODEL: GatewayModelId[number] = "openai/gpt-5-mini";

export const SUPPORTED_MODELS: GatewayModelId[] = [
  "xai/grok-4-fast-reasoning",
  "xai/grok-4-fast-non-reasoning",
  "xai/grok-code-fast-1",
  "google/gemini-2.5-flash",
  "google/gemini-2.5-flash-image-preview",
  "openai/gpt-5-mini",
  "openai/gpt-5-nano",
  "openai/gpt-oss-120b",
  "openai/o4-mini",
  "openai/o3",
  "openai/o3-mini",
  "moonshotai/kimi-k2",
  "deepseek/deepseek-r1",
  "zai/glm-4.5",
  "perplexity/sonar",
  "alibaba/qwen-3-235b",
  "alibaba/qwen3-coder"
];

export const SUGGESTIONS = [
  "What happened before big bang?",
  "Why Trump is targeting India?",
  "What's the weather?",
];
