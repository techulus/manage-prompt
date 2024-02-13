import { owner } from "@/lib/hooks/useOwner";
import { getSettings } from "@/lib/hooks/user";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { Configuration, OpenAIApi } from "openai-edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

// export const runtime = "edge"; // Prisma doesn't run on the edge

export async function POST(req: Request) {
  const { userId, ownerId } = owner();

  if (!ownerId || !userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages } = await req.json();

  const settings = await getSettings();
  const model = settings?.chat_model ?? "gpt-4-1106-preview";
  console.log(`Sending Chat request for model ${model}`);

  const response = await openai.createChatCompletion({
    model,
    stream: true,
    messages,
  });

  const stream = OpenAIStream(response);

  return new StreamingTextResponse(stream);
}
