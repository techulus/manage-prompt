import { prisma } from "@/lib/utils/db";
import { validateRateLimit } from "@/lib/utils/ratelimit";
import { redis } from "@/lib/utils/redis";
import { getUpcomingInvoice, isSubscriptionActive } from "@/lib/utils/stripe";
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
  SpendLimitReached = "spend_limit_reached",
  InternalServerError = "internal_server_error",
}

export const dynamic = "force-dynamic";

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

    // Spend limit
    if (organization.spendLimit && organization?.stripe?.customerId) {
      const invoice = await getUpcomingInvoice(
        organization?.stripe?.customerId
      );
      if (invoice.amount_due / 100 > organization.spendLimit) {
        return ErrorResponse(
          "Spend limit exceeded. Please increase your spend limit to continue using the service.",
          402,
          ErrorCodes.SpendLimitReached
        );
      }
    }

    const pub_token = `pub_tok_${randomBytes(16).toString("hex")}`;

    const searchParams = req.nextUrl.searchParams;

    const ttlFromQuery = Number(searchParams.get("ttl") ?? 60);
    const ttl = Number.isNaN(ttlFromQuery)
      ? 60
      : Math.min(Math.max(ttlFromQuery, 1), 300);

    await Promise.all([
      redis.set(
        pub_token,
        {
          ownerId: organization?.id,
        },
        {
          ex: ttl,
        }
      ),
      prisma.secretKey.update({
        where: {
          key: token,
        },
        data: {
          lastUsed: new Date(),
        },
      }),
    ]);

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
      "Failed to create token, please try again or contact support.",
      500,
      ErrorCodes.InternalServerError
    );
  }
}
