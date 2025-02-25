import { UnauthorizedResponse } from "@/lib/utils/api";
import { prisma } from "@/lib/utils/db";
import { ragChat } from "@/lib/utils/rag-chat";
// @ts-ignore
import { aiUseChatAdapter } from "@upstash/rag-chat/nextjs";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { type NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    },
  );
}

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ token: string }> },
) {
  const params = await props.params;
  const tokenData = await prisma.chatBotUserSession.findUnique({
    where: {
      id: params.token,
    },
  });
  if (!tokenData) {
    return UnauthorizedResponse();
  }

  const { chatbotId, sessionId, ownerId } = tokenData;

  const { messages } = await req.json();
  const lastMessage = messages[messages.length - 1].content;

  const response = await ragChat.chat(lastMessage, {
    streaming: true,
    namespace: `${ownerId}-${chatbotId}`,
    sessionId: `${ownerId}:${chatbotId}:${sessionId}`,
    ratelimit: new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, "10 s"),
    }),
  });

  return aiUseChatAdapter(response);
}
