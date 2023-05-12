import { OpenAIModel } from "@/data/workflow";
import { Configuration, OpenAIApi } from "openai";

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

export async function getCompletion(model: OpenAIModel, content: string) {
  switch (model) {
    case "gpt-3.5-turbo":
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

      return chatData.choices[0].message?.content;

    case "text-davinci-003":
    case "text-davinci-edit-001":
      const { data } = await openai.createCompletion({
        model,
        prompt: content,
        temperature: 0.7,
        max_tokens: 512,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      if (!data.choices) throw new Error("No choices returned from OpenAI");

      return data.choices[0].text;
  }
}
