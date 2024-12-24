import { UnauthorizedResponse } from "@/lib/utils/api";
import { prisma } from "@/lib/utils/db";
import { ragChat } from "@/lib/utils/rag-chat";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: { token: string } },
) {
  const tokenData = await prisma.chatBotUserSession.findUnique({
    where: {
      id: params.token,
    },
    cacheStrategy: {
      ttl: 3600,
    },
  });
  if (!tokenData) {
    return UnauthorizedResponse();
  }

  const { chatbotId, sessionId, ownerId } = tokenData;

  const messages = await ragChat.history.getMessages({
    amount: 50,
    sessionId: `${ownerId}:${chatbotId}:${sessionId}`,
  });

  return NextResponse.json(messages);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { token: string } },
) {
  const tokenData = await prisma.chatBotUserSession.findUnique({
    where: {
      id: params.token,
    },
    cacheStrategy: {
      ttl: 3600,
    },
  });
  if (!tokenData) {
    return UnauthorizedResponse();
  }

  const { chatbotId, sessionId, ownerId } = tokenData;

  await ragChat.history.deleteMessages({
    sessionId: `${ownerId}:${chatbotId}:${sessionId}`,
  });

  return NextResponse.json({ success: true });
}
