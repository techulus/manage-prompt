import { NextRequest } from "next/server";
import { z } from "@/node_modules/zod";
import { fromZodError } from "@/node_modules/zod-validation-error";
import {
  ErrorCodes,
  ErrorResponse,
  UnauthorizedResponse,
} from "@/lib/utils/api";
import { prisma } from "@/lib/utils/db";
import { encrypt } from "@/lib/utils/encryption";
import { NextResponse } from "@/node_modules/next/server";

const ChatTokenRequestSchema = z.object({
  chatbotId: z.string(),
  sessionId: z.string(),
});

export async function POST(req: NextRequest) {
  const authorization = req.headers.get("authorization");
  if (!authorization) {
    return UnauthorizedResponse();
  }

  const token = authorization.split("Bearer ")[1];
  if (!token) {
    return UnauthorizedResponse();
  }

  const key = await prisma.secretKey.findUnique({
    where: {
      key: token,
    },
    cacheStrategy: {
      ttl: 300,
    },
  });
  if (!key) {
    return UnauthorizedResponse();
  }

  const ownerId = key.ownerId;
  const body = await req.json();
  const { chatbotId, sessionId } = body;

  const validationResult = ChatTokenRequestSchema.safeParse({
    chatbotId,
    sessionId,
  });

  if (!validationResult.success) {
    return ErrorResponse(
      fromZodError(validationResult.error).message,
      400,
      ErrorCodes.MissingInput,
    );
  }

  const chatBotToken = encrypt(
    JSON.stringify({
      ownerId,
      chatbotId,
      sessionId,
    }),
  );

  const base64EncodedToken = Buffer.from(JSON.stringify(chatBotToken)).toString(
    "base64url",
  );

  return NextResponse.json({ success: true, token: base64EncodedToken });
}
