import { OpenAI } from "openai";
import { ChatCompletion } from "openai/resources";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
      });

      if (!chatData.choices) throw new Error("No choices returned from OpenAI");

      return {
        result: chatData.choices[0].message?.content ?? "",
        rawResult: chatData,
        totalTokenCount: chatData.usage?.total_tokens ?? 0,
      };
    default:
      throw new Error("Unsupported model");
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
    default:
      throw new Error("Unsupported model");
  }
};
