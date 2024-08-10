import { ModelSettings } from "@/components/console/workflow-model-settings";
import { modelToProviderId } from "@/data/workflow";
import { anthropic } from "@ai-sdk/anthropic";
import { createAzure } from "@ai-sdk/azure";
import { createOpenAI } from "@ai-sdk/openai";
import { UserKey } from "@prisma/client";
import { generateText, LanguageModel, streamText } from "ai";
import { getUserKeyFor } from "./encryption";

export const getCompletion = async (
  model: string,
  content: string,
  settings?: ModelSettings,
  userKeys: UserKey[] = []
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

  let completion = null;
  switch (model) {
    case "mistralai/Mixtral-8x7B-Instruct-v0.1":
    case "meta-llama/Llama-2-70b-chat-hf":
    case "google/gemma-7b-it":
      const groq = createOpenAI({
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: process.env.GROQ_TOKEN,
      });
      completion = await generateText({
        model: groq(modelToProviderId[model] ?? model),
        ...modelParams,
      });
      break;
    case "claude-3-5-sonnet-20240620":
      completion = await generateText({
        model: anthropic(modelToProviderId[model] ?? model),
        ...modelParams,
      });
      break;
    default:
      const userOpenApiKey = getUserKeyFor("openai", userKeys);
      if (userOpenApiKey) {
        const openai = createOpenAI({
          apiKey: userOpenApiKey,
        });
        completion = await generateText({
          model: openai(modelToProviderId[model] ?? model),
          ...modelParams,
        });
      } else {
        const azure = createAzure({
          resourceName: process.env.AZURE_RESOURCE_NAME,
          apiKey: process.env.AZURE_API_KEY,
        });
        completion = await generateText({
          model: azure(modelToProviderId[model] ?? model) as LanguageModel,
          ...modelParams,
        });
      }
  }

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
  onFinish?: (evt: any) => Promise<void>
) => {
  const modelParams = {
    prompt: content,
    temperature: settings?.temperature ?? 0.5,
    maxTokens: settings?.maxTokens ?? 1024,
    topP: settings?.topP ?? 1,
    frequencyPenalty: settings?.frequencyPenalty ?? 0,
    presencePenalty: settings?.presencePenalty ?? 0,
  };

  let completion = null;

  switch (model) {
    case "mistralai/Mixtral-8x7B-Instruct-v0.1":
    case "meta-llama/Llama-2-70b-chat-hf":
    case "google/gemma-7b-it":
      const groq = createOpenAI({
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: process.env.GROQ_TOKEN,
      });
      completion = await streamText({
        model: groq(modelToProviderId[model] ?? model),
        ...modelParams,
        onFinish,
      });
      break;
    case "claude-3-5-sonnet-20240620":
      completion = await streamText({
        model: anthropic(modelToProviderId[model] ?? model),
        ...modelParams,
        onFinish,
      });
      break;
    default:
      const userOpenApiKey = getUserKeyFor("openai", userKeys);
      if (userOpenApiKey) {
        const openai = createOpenAI({
          apiKey: userOpenApiKey,
        });
        completion = await streamText({
          model: openai(modelToProviderId[model] ?? model),
          ...modelParams,
          onFinish,
        });
      } else {
        const azure = createAzure({
          resourceName: process.env.AZURE_RESOURCE_NAME,
          apiKey: process.env.AZURE_API_KEY,
        });
        completion = await streamText({
          model: azure(modelToProviderId[model] ?? model) as LanguageModel,
          ...modelParams,
          onFinish,
        });
      }
  }

  return completion.toTextStreamResponse({
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
};
