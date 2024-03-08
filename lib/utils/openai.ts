import { OpenAI } from "openai";
import {
  ChatCompletion,
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionCreateParamsStreaming,
} from "openai/resources";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anyscale = new OpenAI({
  baseURL: "https://api.endpoints.anyscale.com/v1",
  apiKey: process.env.ANYSCALE_TOKEN,
});

const groq = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_TOKEN,
});

export const getCompletion = async (
  model: string,
  content: string
): Promise<{
  result: string | undefined;
  rawResult: ChatCompletion;
  totalTokenCount: number;
}> => {
  const modelParams: Omit<ChatCompletionCreateParamsNonStreaming, "model"> = {
    messages: [
      {
        role: "user",
        content,
      },
    ],
    temperature: 0.5,
    max_tokens: 1024,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  };

  let completion: ChatCompletion | null = null;
  switch (model) {
    case "mistralai/Mixtral-8x7B-Instruct-v0.1":
      completion = await groq.chat.completions.create({
        model: "mixtral-8x7b-32768",
        ...modelParams,
      });
    case "meta-llama/Llama-2-70b-chat-hf":
      completion = await groq.chat.completions.create({
        model: "llama2-70b-4096",
        ...modelParams,
      });
    case "google/gemma-7b-it":
      completion = await anyscale.chat.completions.create({
        model,
        ...modelParams,
      });
    default:
      completion = await openai.chat.completions.create({
        model,
        ...modelParams,
      });
  }

  if (!completion?.choices) throw new Error("No choices returned from OpenAI");

  return {
    result: completion.choices[0].message?.content ?? "",
    rawResult: completion,
    totalTokenCount: completion.usage?.total_tokens ?? 0,
  };
};

export const getStreamingCompletion = async (
  model: string,
  content: string
) => {
  const modelParams: Omit<ChatCompletionCreateParamsStreaming, "model"> = {
    messages: [
      {
        role: "user",
        content,
      },
    ],
    temperature: 0.5,
    max_tokens: 1024,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: true,
  };

  switch (model) {
    case "mistralai/Mixtral-8x7B-Instruct-v0.1":
      return groq.chat.completions.create({
        model: "mixtral-8x7b-32768",
        ...modelParams,
      });
    case "meta-llama/Llama-2-70b-chat-hf":
      return groq.chat.completions.create({
        model: "llama2-70b-4096",
        ...modelParams,
      });
    case "google/gemma-7b-it":
      return anyscale.chat.completions.create({
        model,
        ...modelParams,
      });
    default:
      return openai.chat.completions.create({
        model,
        ...modelParams,
      });
  }
};
