import { prisma } from "@/lib/utils/db";
import { validateRateLimit } from "@/lib/utils/ratelimit";
import { redis } from "@/lib/utils/redis";
import {
  hasExceededSpendLimit,
  isSubscriptionActive,
} from "@/lib/utils/stripe";
import { createId } from "@paralleldrive/cuid2";
import { NextRequest, NextResponse } from "next/server";
import {
  ErrorCodes,
  ErrorResponse,
  UnauthorizedResponse,
} from "@/lib/utils/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
      cacheStrategy: {
        ttl: 300,
      },
    });
    if (!key) {
      return UnauthorizedResponse();
    }

    // Rate limit
    const rateLimitKey =
      req.headers.get("x-user-id") ?? `key_${key.ownerId}_${key.id}`;
    const {
      success: keyRateLimitSuccess,
      limit,
      remaining,
    } = await validateRateLimit(rateLimitKey, key.rateLimitPerSecond);
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
        ErrorCodes.InvalidBilling,
      );
    }

    // Spend limit
    if (
      organization?.credits === 0 &&
      (await hasExceededSpendLimit(
        organization?.spendLimit,
        organization?.stripe?.customerId,
      ))
    ) {
      return ErrorResponse(
        "Spend limit exceeded. Please increase your spend limit to continue using the service.",
        402,
        ErrorCodes.SpendLimitReached,
      );
    }

    const pub_token = `pub_tok_${createId()}`;

    const searchParams = req.nextUrl.searchParams;

    const ttlFromQuery = Number(searchParams.get("ttl") ?? 60);
    const ttl = Number.isNaN(ttlFromQuery)
      ? 60
      : Math.min(Math.max(ttlFromQuery, 1), 300);

    await redis.set(
      pub_token,
      {
        ownerId: organization?.id,
      },
      {
        ex: ttl,
      },
    );

    return NextResponse.json(
      { success: true, token: pub_token, ttl },
      {
        headers: {
          "x-ratelimit-limit": limit.toString(),
          "x-ratelimit-remaining": remaining.toString(),
        },
      },
    );
  } catch (error) {
    console.error(error);
    return ErrorResponse(
      "Failed to create token, please try again or contact support.",
      500,
      ErrorCodes.InternalServerError,
    );
  }
}
