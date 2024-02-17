import { WorkflowInput } from "@/data/workflow";
import { prisma } from "@/lib/utils/db";
import { runLlamaModel } from "@/lib/utils/llama";
import { runMixtralModel } from "@/lib/utils/mixtral";
import { getCompletion } from "@/lib/utils/openai";
import { redis } from "@/lib/utils/redis";
import { isSubscriptionActive, reportUsage } from "@/lib/utils/stripe";
import { EventName, logEvent } from "@/lib/utils/tinybird";
import { Ratelimit } from "@upstash/ratelimit";
import { NextResponse } from "next/server";
import Stripe from "stripe";

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

    const workflow = await prisma.workflow.findUnique({
      where: {
        shortId: params.workflowId,
        ownerId: key.ownerId,
      },
    });
    if (!workflow || !workflow?.published) {
      return ErrorResponse("Workflow not found", 404);
    }

    const body = (await req.json()) ?? {};

    let content = workflow.template;
    const model = workflow.model;
    const instruction = workflow.instruction ?? "";
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

    let response;
    switch (model) {
      case "llama-2-70b-chat":
        response = await runLlamaModel(content, instruction);
        break;
      case "mistralai/mixtral-8x7b-instruct-v0.1":
        response = await runMixtralModel(content);
        break;
      default:
        response = await getCompletion(model, content, instruction);
    }

    const { result, rawResult, totalTokenCount } = response;

    if (!result) {
      return ErrorResponse(
        "Failed to run workflow",
        500,
        ErrorCodes.InternalServerError
      );
    }

    await Promise.all([
      reportUsage(
        organization?.stripe?.subscription as unknown as Stripe.Subscription,
        totalTokenCount
      ),
      logEvent(EventName.RunWorkflow, {
        workflow_id: workflow.id,
        owner_id: key.ownerId,
        model,
        total_tokens: totalTokenCount,
      }),
      prisma.workflowRun.create({
        data: {
          result,
          rawRequest: JSON.parse(
            JSON.stringify({ model, content, instruction })
          ),
          rawResult: JSON.parse(JSON.stringify(rawResult)),
          totalTokenCount,
          workflow: {
            connect: {
              id: workflow.id,
            },
          },
        },
      }),
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
      { success: true, result: result },
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
