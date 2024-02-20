import { prisma } from "@/lib/utils/db";
import { validateRateLimit } from "@/lib/utils/ratelimit";
import { redis } from "@/lib/utils/redis";
import { isSubscriptionActive } from "@/lib/utils/stripe";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";

const UnauthorizedResponse = () =>
  NextResponse.json(
    {
      error: "Unauthorized. Please provide a valid secret key.",
      success: false,
    },
    {
      status: 401,
    }
  );

const ErrorResponse = (message: string, status = 400, code?: string) =>
  NextResponse.json(
    {
      error: message,
      success: false,
      code,
    },
    {
      status,
    }
  );

enum ErrorCodes {
  InvalidBilling = "invalid_billing",
  InternalServerError = "internal_server_error",
}

export async function GET(req: NextRequest) {
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
        organization: {
          include: {
            stripe: true,
          },
        },
      },
    });
    if (!key) {
      return UnauthorizedResponse();
    }

    // Rate limit
    const {
      success: keyRateLimitSuccess,
      limit,
      remaining,
    } = await validateRateLimit(
      `key_${key.ownerId}_${key.id}`,
      key.rateLimitPerSecond
    );
    if (!keyRateLimitSuccess) {
      return ErrorResponse("Rate limit exceeded", 429);
    }

    // Check if the organization has valid billing
    const organization = key.organization;
    if (
      organization?.credits === 0 &&
      !isSubscriptionActive(organization?.stripe?.subscription)
    ) {
      return ErrorResponse(
        "Invalid billing. Please contact support.",
        402,
        ErrorCodes.InvalidBilling
      );
    }

    const pub_token = `pub_tok_${randomBytes(16).toString("hex")}`;

    const searchParams = req.nextUrl.searchParams;
    const ttl = searchParams.get("ttl");

    await redis.set(
      pub_token,
      {
        ownerId: organization?.id,
      },
      {
        ex: Math.min(parseInt(ttl ?? "60"), 300),
      }
    );

    return NextResponse.json(
      { success: true, token: pub_token, ttl },
      {
        headers: {
          "x-ratelimit-limit": limit.toString(),
          "x-ratelimit-remaining": remaining.toString(),
        },
      }
    );
  } catch (error) {
    console.error(error);
    return ErrorResponse(
      "Failed to create token, please try  or contact support.",
      500,
      ErrorCodes.InternalServerError
    );
  }
}
