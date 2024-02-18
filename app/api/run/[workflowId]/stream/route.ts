import { WorkflowInput } from "@/data/workflow";
import { prisma } from "@/lib/utils/db";
import { getStreamingCompletion } from "@/lib/utils/openai";
import { redis } from "@/lib/utils/redis";
import { reportUsage } from "@/lib/utils/stripe";
import { EventName, logEvent } from "@/lib/utils/tinybird";
import { Ratelimit } from "@upstash/ratelimit";
import { OpenAIStream, StreamingTextResponse } from "ai";
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

export async function POST(
  req: Request,
  { params }: { params: { workflowId: string } }
) {
  // Global Rate limit
  const keyRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(25, "1 s"),
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

    const body = (await req.json().catch(() => {})) ?? {};

    const result = await fetch(workflow.authWebhookUrl, {
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

    if (!result.ok) {
      return UnauthorizedResponse();
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

    let response;
    switch (model) {
      // case "llama-2-70b-chat":
      //   response = await runLlamaModel(content, instruction);
      //   break;
      // case "mixtral-8x7b-instruct-v0.1":
      //   response = await runMixtralModel(content);
      //   break;
      default:
        response = await getStreamingCompletion(model, content);
    }

    let wordCount = content.split(" ").length;
    let totalTokenCount = Math.floor(wordCount * 0.6);

    const stream = OpenAIStream(response, {
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
    });

    return new StreamingTextResponse(stream, {
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
