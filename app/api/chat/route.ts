import { owner } from "@/lib/hooks/useOwner";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { Configuration, OpenAIApi } from "openai-edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export const runtime = "edge";

export async function POST(req: Request) {
  const { userId } = owner();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages } = await req.json();

  const response = await openai.createChatCompletion({
    model: "gpt-4-1106-preview",
    stream: true,
    messages,
  });

  const stream = OpenAIStream(response);

  return new StreamingTextResponse(stream);
}
