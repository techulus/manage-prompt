import type { ModelSettings } from "@/components/console/workflow/workflow-model-settings";
import { modelToProviderId } from "@/data/workflow";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { UserKey } from "@prisma/client";
import { generateText, streamText } from "ai";
import { ByokService } from "./byok-service";

export const getCompletion = async (
  model: string,
  content: string,
  settings?: ModelSettings,
  userKeys: UserKey[] = [],
): Promise<{
  result: string | undefined;
  rawResult: any;
  totalTokenCount: number;
}> => {
  const modelParams = {
    prompt: content,
    temperature: settings?.temperature ?? 0.5,
    maxTokens: settings?.maxTokens ?? 1024,
    topP: settings?.topP ?? 1,
    frequencyPenalty: settings?.frequencyPenalty ?? 0,
    presencePenalty: settings?.presencePenalty ?? 0,
  };

  const userOpenRouterKey = new ByokService().get("openrouter", userKeys);
  const openrouter = createOpenRouter({
    apiKey: userOpenRouterKey ?? process.env.OPENROUTER_API_KEY,
  });

  const completion = await generateText({
    model: openrouter(modelToProviderId[model]),
    headers: {
      "HTTP-Referer": "https://manageprompt.com",
      "X-Title": "ManagePrompt",
    },
    ...modelParams,
  });

  if (!completion.text) throw new Error("No result returned from Provider");

  return {
    result: completion.text,
    rawResult: completion,
    totalTokenCount: completion.usage?.totalTokens ?? 0,
  };
};

export const getStreamingCompletion = async (
  model: string,
  content: string,
  settings?: ModelSettings,
  userKeys: UserKey[] = [],
  onFinish?: (evt: any) => Promise<void>,
) => {
  const modelParams = {
    prompt: content,
    temperature: settings?.temperature ?? 0.5,
    maxTokens: settings?.maxTokens ?? 1024,
    topP: settings?.topP ?? 1,
    frequencyPenalty: settings?.frequencyPenalty ?? 0,
    presencePenalty: settings?.presencePenalty ?? 0,
  };

  const userOpenRouterKey = new ByokService().get("openrouter", userKeys);
  const openrouter = createOpenRouter({
    apiKey: userOpenRouterKey ?? process.env.OPENROUTER_API_KEY,
  });

  const completion = streamText({
    model: openrouter(modelToProviderId[model]),
    headers: {
      "HTTP-Referer": "manageprompt.com",
      "X-Title": "ManagePrompt",
    },
    ...modelParams,
    onFinish,
  });

  return completion.toTextStreamResponse({
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
};
