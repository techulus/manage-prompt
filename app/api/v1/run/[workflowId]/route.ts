import { WorkflowInput } from "@/data/workflow";
import { getCompletion } from "@/lib/utils/ai";
import { prisma } from "@/lib/utils/db";
import { validateRateLimit } from "@/lib/utils/ratelimit";
import {
  hasExceededSpendLimit,
  isSubscriptionActive,
  reportUsage,
} from "@/lib/utils/stripe";
import { EventName, logEvent } from "@/lib/utils/tinybird";
import {
  cacheWorkflowResult,
  getWorkflowCachedResult,
} from "@/lib/utils/useWorkflow";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const maxDuration = 120;

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
  MissingInput = "missing_input",
  WorkflowNotFound = "workflow_not_found",
  WorkflowRunFailed = "workflow_run_failed",
  InvalidBilling = "invalid_billing",
  InternalServerError = "internal_server_error",
  RequestBlocked = "request_blocked",
  SpendLimitReached = "spend_limit_reached",
}

export async function POST(
  req: Request,
  { params }: { params: { workflowId: string } }
) {
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
        ErrorCodes.InvalidBilling
      );
    }

    // Spend limit
    if (
      organization?.credits === 0 &&
      (await hasExceededSpendLimit(
        organization?.spendLimit,
        organization?.stripe?.customerId
      ))
    ) {
      return ErrorResponse(
        "Spend limit exceeded. Please increase your spend limit to continue using the service.",
        402,
        ErrorCodes.SpendLimitReached
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
      JSON.stringify(body)
    );

    if (cachedResult) {
      return NextResponse.json({
        success: true,
        result: cachedResult,
      });
    }

    let content = workflow.template;
    const model = workflow.model;
    const inputs = workflow.inputs as unknown as WorkflowInput[];
    // Handle inputs
    for (const input of inputs) {
      if (!body[input.name] || !body[input.name].trim()) {
        return ErrorResponse(
          `Missing input: ${input.name}`,
          400,
          ErrorCodes.MissingInput
        );
      }
      content = workflow.template.replace(
        `{{${input.name}}}`,
        body[input.name]
      );
    }

    const response = await getCompletion(
      model,
      content,
      JSON.parse(JSON.stringify(workflow.modelSettings))
    );

    const { result, totalTokenCount } = response;

    if (!result) {
      return ErrorResponse(
        "Failed to run workflow",
        500,
        ErrorCodes.InternalServerError
      );
    }

    await Promise.all([
      reportUsage(
        organization?.id,
        organization?.stripe?.subscription as unknown as Stripe.Subscription,
        totalTokenCount
      ),
      logEvent(EventName.RunWorkflow, {
        workflow_id: workflow.id,
        owner_id: key.ownerId,
        model,
        total_tokens: totalTokenCount,
      }),
      prisma.secretKey.update({
        where: {
          key: token,
        },
        data: {
          lastUsed: new Date(),
        },
      }),
      workflow.cacheControlTtl
        ? cacheWorkflowResult(
            params.workflowId,
            JSON.stringify(body),
            result,
            workflow.cacheControlTtl
          )
        : null,
    ]);

    return NextResponse.json(
      { success: true, result },
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
