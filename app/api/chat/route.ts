import { owner } from "@/lib/hooks/useOwner";
import { ragChat } from "@/lib/utils/rag-chat";
// @ts-ignore
import { aiUseChatAdapter } from "@upstash/rag-chat/nextjs";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { ownerId } = await owner();

  const { messages } = await req.json();
  const lastMessage = messages[messages.length - 1].content;

  const response = await ragChat.chat(lastMessage, {
    namespace: ownerId,
    streaming: true,
    sessionId: ownerId,
    ratelimit: new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, "10 s"),
    }),
  });

  return aiUseChatAdapter(response);
}
