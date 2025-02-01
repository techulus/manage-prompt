import { type WorkflowInput, modelToProvider } from "@/data/workflow";
import { getCompletion } from "@/lib/utils/ai";
import {
  ErrorCodes,
  ErrorResponse,
  UnauthorizedResponse,
} from "@/lib/utils/api";
import { ByokService } from "@/lib/utils/byok-service";
import { prisma } from "@/lib/utils/db";
import { validateRateLimit } from "@/lib/utils/ratelimit";
import {
  hasExceededSpendLimit,
  isSubscriptionActive,
  reportUsage,
} from "@/lib/utils/stripe";
import {
  cacheWorkflowResult,
  getWorkflowCachedResult,
} from "@/lib/utils/useWorkflow";
import { translateInputs } from "@/lib/utils/workflow";
import { waitUntil } from "@vercel/functions";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

export const maxDuration = 120;

export async function POST(req: Request, props: { params: Promise<{ workflowId: string }> }) {
  const params = await props.params;
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
            UserKeys: true,
          },
        },
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

    const workflow = await prisma.workflow.findUnique({
      where: {
        shortId: params.workflowId,
        ownerId: key.ownerId,
      },
    });
    if (!workflow || !workflow?.published) {
      return ErrorResponse("Workflow not found", 404);
    }

    const body = (await req.json().catch(() => {})) ?? {};
    const cachedResult = await getWorkflowCachedResult(
      params.workflowId,
      JSON.stringify(body),
    );

    if (cachedResult) {
      return NextResponse.json({
        success: true,
        result: cachedResult,
      });
    }

    const inputs = workflow.inputs as unknown as WorkflowInput[];
    const model = workflow.model;
    const content = await translateInputs({
      inputs,
      inputValues: body,
      template: workflow.template,
    });

    const response = await getCompletion(
      model,
      content,
      JSON.parse(JSON.stringify(workflow.modelSettings)),
      organization.UserKeys,
    );

    let { result, rawResult, totalTokenCount } = response;
    if (!result) {
      return ErrorResponse(
        "Failed to run workflow",
        500,
        ErrorCodes.InternalServerError,
      );
    }

    const byokService = new ByokService();
    const isEligibleForByokDiscount = !!byokService.get(
      modelToProvider[model],
      organization.UserKeys,
    );
    if (isEligibleForByokDiscount) {
      totalTokenCount = Math.floor(totalTokenCount * 0.3);
    }

    waitUntil(
      Promise.all([
        reportUsage(
          organization?.id,
          organization?.stripe?.subscription as unknown as Stripe.Subscription,
          totalTokenCount,
        ),
        prisma.workflowRun.create({
          data: {
            result,
            rawRequest: JSON.parse(JSON.stringify({ model, content })),
            rawResult: JSON.parse(JSON.stringify(rawResult)),
            totalTokenCount,
            user: {
              connect: {
                id: key.ownerId,
              },
            },
            workflow: {
              connect: {
                id: workflow.id,
              },
            },
          },
        }),
        workflow.cacheControlTtl
          ? cacheWorkflowResult(
              params.workflowId,
              JSON.stringify(body),
              result,
              workflow.cacheControlTtl,
            )
          : null,
      ]),
    );

    return NextResponse.json(
      { success: true, result },
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
      "Failed to run workflow",
      500,
      ErrorCodes.InternalServerError,
    );
  }
}
