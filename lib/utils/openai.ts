import { OpenAI } from "openai";
import { ChatCompletion } from "openai/resources";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anyscale = new OpenAI({
  baseURL: "https://api.endpoints.anyscale.com/v1",
  apiKey: process.env.ANYSCALE_TOKEN,
});

export const getCompletion = async (
  model: string,
  content: string
): Promise<{
  result: string | undefined;
  rawResult: ChatCompletion;
  totalTokenCount: number;
}> => {
  switch (model) {
    case "gpt-3.5-turbo":
    case "gpt-4-1106-preview":
    case "gpt-4-0125-preview":
    case "gpt-4":
      const openAiCompletion = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: "user",
            content,
          },
        ],
        temperature: 0.7,
        max_tokens: 512,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      if (!openAiCompletion.choices)
        throw new Error("No choices returned from OpenAI");

      return {
        result: openAiCompletion.choices[0].message?.content ?? "",
        rawResult: openAiCompletion,
        totalTokenCount: openAiCompletion.usage?.total_tokens ?? 0,
      };
    case "mistralai/Mixtral-8x7B-Instruct-v0.1":
    case "meta-llama/Llama-2-70b-chat-hf":
    case "google/gemma-7b-it":
      const anyscaleCompletion = await anyscale.chat.completions.create({
        model,
        messages: [
          {
            role: "user",
            content,
          },
        ],
        temperature: 0.7,
        max_tokens: 512,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      if (!anyscaleCompletion.choices)
        throw new Error("No choices returned from OpenAI");

      return {
        result: anyscaleCompletion.choices[0].message?.content ?? "",
        rawResult: anyscaleCompletion,
        totalTokenCount: anyscaleCompletion.usage?.total_tokens ?? 0,
      };
    default:
      throw "Unsupported model";
  }
};

export const getStreamingCompletion = async (
  model: string,
  content: string
) => {
  switch (model) {
    case "gpt-3.5-turbo":
    case "gpt-4-1106-preview":
    case "gpt-4-0125-preview":
    case "gpt-4":
      const chatData = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: "user",
            content,
          },
        ],
        temperature: 0.7,
        max_tokens: 512,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: true,
      });

      return chatData;
    case "mistralai/Mixtral-8x7B-Instruct-v0.1":
    case "meta-llama/Llama-2-70b-chat-hf":
    case "google/gemma-7b-it":
      const anyscaleCompletion = await anyscale.chat.completions.create({
        stream: true,
        model,
        messages: [
          {
            role: "user",
            content,
          },
        ],
        temperature: 0.7,
        max_tokens: 512,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      return anyscaleCompletion;
    default:
      throw new Error("Unsupported model");
  }
};
