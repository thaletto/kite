import { AvailableModel, ModelOptions } from "@/types/models";
import { createGatewayProvider } from "@ai-sdk/gateway";

const gateway = createGatewayProvider();

export async function getAvailableModels(): Promise<AvailableModel[]> {
  const response = await gateway.getAvailableModels();
  return [...response.models.map(({ id, name }) => ({ id, name }))];
}

export function getModelOptions(modelId: string): ModelOptions {
  if (modelId.startsWith('openai')) {
    return {
      model: modelId,
      openAIProviderOptions: {
        reasoningEffort: "low",
        reasoningSummary: "detailed",
      },
    };
  }
  if (modelId.startsWith('google')) {
    return {
      model: modelId,
      googleProviderOptions: {
        thinkingConfig: {
          thinkingBudget: 8192,
          includeThoughts: true
        }
      }
    }
  }

  return {
    model: modelId,
  };
}
