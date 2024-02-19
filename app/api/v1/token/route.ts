import { prisma } from "@/lib/utils/db";
import { redis } from "@/lib/utils/redis";
import { isSubscriptionActive } from "@/lib/utils/stripe";
import { Ratelimit } from "@upstash/ratelimit";
import { NextResponse } from "next/server";
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
    const keyRateLimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(key.rateLimitPerSecond, "1 s"),
      analytics: true,
      prefix: "mp_ratelimit",
    });
    const {
      success: keyRateLimitSuccess,
      limit,
      remaining,
    } = await keyRateLimit.limit(`key_${key.id}`);
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

    await redis.set(
      pub_token,
      {
        ownerId: organization?.id,
      },
      {
        ex: 60,
      }
    );

    return NextResponse.json(
      { success: true, token: pub_token, ttl: 60 },
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
      "Failed to run workflow",
      500,
      ErrorCodes.InternalServerError
    );
  }
}
