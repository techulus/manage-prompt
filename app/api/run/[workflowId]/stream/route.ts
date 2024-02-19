import { WorkflowInput } from "@/data/workflow";
import { prisma } from "@/lib/utils/db";
import { runStreamingLlamaModel } from "@/lib/utils/llama";
import { runStreamingMixtralModel } from "@/lib/utils/mixtral";
import { getStreamingCompletion } from "@/lib/utils/openai";
import { redis } from "@/lib/utils/redis";
import { reportUsage } from "@/lib/utils/stripe";
import { EventName, logEvent } from "@/lib/utils/tinybird";
import { MAX_GLOBAL_RATE_LIMIT_RPS } from "@/lib/utils/workflow";
import { Ratelimit } from "@upstash/ratelimit";
import { OpenAIStream, ReplicateStream, StreamingTextResponse } from "ai";
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

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    }
  );
}

type AuthWebhookResponse = {
  success: boolean;
  ttl?: number;
};

export async function POST(
  req: Request,
  { params }: { params: { workflowId: string } }
) {
  // Global Rate limit
  const keyRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(MAX_GLOBAL_RATE_LIMIT_RPS, "1 s"),
    analytics: true,
    prefix: "mp_ratelimit",
  });
  const { success: globalRateLimit } = await keyRateLimit.limit(`global`);
  if (!globalRateLimit) {
    return ErrorResponse("Rate limit exceeded", 429);
  }

  try {
    const workflow = await prisma.workflow.findUnique({
      include: {
        organization: {
          select: {
            stripe: true,
          },
        },
      },
      where: {
        shortId: params.workflowId,
      },
    });
    if (!workflow || !workflow?.published) {
      return ErrorResponse("Workflow not found", 404);
    }

    if (!workflow.authWebhookUrl) {
      return UnauthorizedResponse();
    }

    // Workflow Rate limit
    const keyRateLimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(workflow.rateLimitPerSecond, "1 s"),
      analytics: true,
      prefix: "mp_ratelimit",
    });
    const { success: workflowRateLimit } = await keyRateLimit.limit(
      `streaming:workflow:${workflow.id}`
    );
    if (!workflowRateLimit) {
      return ErrorResponse("Rate limit exceeded", 429);
    }

    const body = (await req.json().catch(() => {})) ?? {};

    const authResultCacheKey = `streaming-auth:${workflow.shortId}:${workflow.authWebhookUrl}`;
    const authResultCached: AuthWebhookResponse | null = await redis.get(
      authResultCacheKey
    );

    if (authResultCached && !authResultCached.success) {
      return UnauthorizedResponse();
    } else {
      const authResult = await fetch(workflow.authWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workflowId: workflow.shortId,
          body,
          headers: req.headers,
        }),
      });

      if (!authResult.ok) {
        console.error("Failed to authenticate request", authResult.status);
        return UnauthorizedResponse();
      }

      const authResultBody: AuthWebhookResponse = await authResult.json();
      if (!authResultBody.success) {
        console.error("Failed to authenticate request", authResultBody);
        return UnauthorizedResponse();
      } else if (authResultBody.ttl) {
        await redis.set(authResultCacheKey, JSON.stringify(authResultBody), {
          ex: authResultBody.ttl,
        });
      }
    }

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

    let wordCount = content.split(" ").length;
    let totalTokenCount = Math.floor(wordCount * 0.6);

    const callbacks = {
      onToken: () => {
        totalTokenCount++;
      },
      onFinal: async () => {
        await Promise.all([
          reportUsage(
            workflow?.organization?.stripe
              ?.subscription as unknown as Stripe.Subscription,
            totalTokenCount
          ),
          logEvent(EventName.RunWorkflow, {
            workflow_id: workflow.id,
            owner_id: workflow.ownerId,
            model,
            total_tokens: totalTokenCount,
          }),
        ]);
      },
    };

    let stream;
    switch (model) {
      case "llama-2-70b-chat":
        stream = await ReplicateStream(
          await runStreamingLlamaModel(content, instruction),
          callbacks
        );
        break;
      case "mixtral-8x7b-instruct-v0.1":
        stream = await ReplicateStream(
          await runStreamingMixtralModel(content),
          callbacks
        );
        break;
      default:
        stream = OpenAIStream(
          await getStreamingCompletion(model, content),
          callbacks
        );
    }

    return new StreamingTextResponse(stream!, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  } catch (error) {
    console.error(error);
    return ErrorResponse(
      "Failed to run workflow",
      500,
      ErrorCodes.InternalServerError
    );
  }
}
