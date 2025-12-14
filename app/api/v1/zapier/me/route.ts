import { NextResponse } from "next/server";
import {
  ErrorCodes,
  ErrorResponse,
  UnauthorizedResponse,
} from "@/lib/utils/api";
import { prisma } from "@/lib/utils/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
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
      include: {
        user: true,
      },
    });
    if (!key) {
      return UnauthorizedResponse();
    }

    return NextResponse.json({ email: key.user.email, name: key.user.name });
  } catch (error) {
    console.error(error);
    return ErrorResponse(
      "Failed to validate key",
      500,
      ErrorCodes.InternalServerError,
    );
  }
}
