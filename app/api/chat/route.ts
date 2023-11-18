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

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      settings: true,
    },
  });

  const { messages } = await req.json();

  // @ts-ignore
  const model = user?.settings?.chat_model ?? "gpt-4-1106-preview";
  console.log(`Sending Chat request for model ${model}`);

  const response = await openai.createChatCompletion({
    model,
    stream: true,
    messages,
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
