"use server";

import { SUPPORTED_MODELS } from "@/ai/constants";
import { getAvailableModels } from "@/ai/gateway";

export async function getSupportedModels() {
  const allModels = await getAvailableModels();
  return {
    models: allModels.filter((model) => SUPPORTED_MODELS.includes(model.id)),
  };
}
