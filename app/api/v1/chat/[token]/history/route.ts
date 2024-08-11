import { decryptChatbotToken, ragChat } from "@/lib/utils/rag-chat";
import { NextRequest, NextResponse } from "next/server";
import { UnauthorizedResponse } from "@/lib/utils/api";

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } },
) {
  const tokenData = decryptChatbotToken(params.token);
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
  req: NextRequest,
  { params }: { params: { token: string } },
) {
  const tokenData = decryptChatbotToken(params.token);
  if (!tokenData) {
    return UnauthorizedResponse();
  }

  const { chatbotId, sessionId, ownerId } = tokenData;

  await ragChat.history.deleteMessages({
    sessionId: `${ownerId}:${chatbotId}:${sessionId}`,
  });

  return NextResponse.json({ success: true });
}
