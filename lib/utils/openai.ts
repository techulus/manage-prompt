import { OpenAIModel } from "@/data/workflow";
import {
  Configuration,
  CreateChatCompletionResponse,
  CreateCompletionResponse,
  CreateEditResponse,
  OpenAIApi,
} from "openai";

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

export const getCompletion = async (
  model: OpenAIModel,
  content: string,
  instruction?: string
): Promise<{
  result: string | undefined;
  rawResult:
    | CreateChatCompletionResponse
    | CreateCompletionResponse
    | CreateEditResponse
    | undefined;
}> => {
  console.log("OPENAI: Request ->", {
    model,
    content,
    instruction,
  });

  switch (model) {
    case "gpt-3.5-turbo":
    case "gpt-4-1106-preview":
      const { data: chatData } = await openai.createChatCompletion({
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
        result: chatData.choices[0].message?.content,
        rawResult: chatData,
      };

    case "text-davinci-003":
      try {
        const { data: textData } = await openai.createCompletion({
          model,
          prompt: content,
          temperature: 0.7,
          max_tokens: 512,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        });

        if (!textData.choices)
          throw new Error("No choices returned from OpenAI");

        return { result: textData.choices[0].text, rawResult: textData };
      } catch (e: any) {
        console.error(e?.response?.data);
        throw new Error("Request failed");
      }

    case "code-davinci-edit-001":
    case "text-davinci-edit-001":
      if (!instruction) throw new Error("Instruction is missing");

      try {
        const { data: editData } = await openai.createEdit({
          model,
          input: content,
          instruction,
          temperature: 0.7,
          top_p: 1,
        });

        if (!editData.choices)
          throw new Error("No choices returned from OpenAI");

        return { result: editData.choices[0].text, rawResult: editData };
      } catch (e: any) {
        console.error(e?.response?.data);
        throw new Error("Request failed");
      }
  }

  return { result: undefined, rawResult: undefined };
};
