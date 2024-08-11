import { UnauthorizedResponse } from "@/lib/utils/api";
import { prisma } from "@/lib/utils/db";
import { decryptChatbotToken, ragChat } from "@/lib/utils/rag-chat";
import { reportUsage } from "@/lib/utils/stripe";
// @ts-ignore
import { aiUseChatAdapter } from "@upstash/rag-chat/nextjs";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest } from "next/server";
import Stripe from "stripe";

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } },
) {
  const tokenData = decryptChatbotToken(params.token);
  if (!tokenData) {
    return UnauthorizedResponse();
  }

  const { chatbotId, sessionId, ownerId } = tokenData;

  const { messages } = await req.json();
  const lastMessage = messages[messages.length - 1].content;

  const organization = await prisma.organization.findUnique({
    where: {
      id: ownerId,
    },
    include: {
      stripe: true,
    },
    cacheStrategy: {
      ttl: 300,
    },
  });

  const response = await ragChat.chat(lastMessage, {
    streaming: true,
    namespace: `${ownerId}-${chatbotId}`,
    sessionId: `${ownerId}:${chatbotId}:${sessionId}`,
    ratelimit: new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, "10 s"),
    }),
    onChunk: async (chunk) => {
      if (chunk.totalTokens && organization) {
        await reportUsage(
          ownerId,
          organization?.stripe as Stripe.Subscription | null,
          chunk.totalTokens,
        );
      }
    },
  });

  return aiUseChatAdapter(response);
}
