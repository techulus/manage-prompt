import { owner } from "@/lib/hooks/useOwner";
import { prisma } from "@/lib/utils/db";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { Configuration, OpenAIApi } from "openai-edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

// export const runtime = "edge"; // Prisma doesn't run on the edge

export async function POST(req: Request) {
  const { userId, ownerId } = owner();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  let { prompt } = await req.json();

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are an AI writing assistant that continues existing text based on context from prior text. " +
          "Give more weight/priority to the later characters than the beginning ones. " +
          "Limit your response to no more than 200 characters, but make sure to construct complete sentences.",
        // we're disabling markdown for now until we can figure out a way to stream markdown text with proper formatting: https://github.com/steven-tey/novel/discussions/7
        // "Use Markdown formatting when appropriate.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: true,
    n: 1,
  });

  await prisma.organization.update({
    where: {
      id: ownerId,
    },
    data: {
      credits: {
        decrement: 1,
      },
    },
  });

  const stream = OpenAIStream(response);

  return new StreamingTextResponse(stream);
}
