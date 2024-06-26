import { WorkflowInput } from "@/data/workflow";
import { getStreamingCompletion } from "@/lib/utils/ai";
import { prisma } from "@/lib/utils/db";
import { redis } from "@/lib/utils/redis";
import { reportUsage } from "@/lib/utils/stripe";
import { EventName, logEvent } from "@/lib/utils/tinybird";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const maxDuration = 120;
export const runtime = "edge";

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
  req: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  const searchParams = req.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return UnauthorizedResponse();
  }

  try {
    const validateToken: { ownerId: string } | null = await redis.get(token);
    if (!validateToken) {
      return UnauthorizedResponse();
    } else {
      await redis.del(token);
    }

    const workflow = await prisma.workflow.findUnique({
      include: {
        organization: {
          include: {
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

    if (workflow.ownerId !== validateToken.ownerId) {
      return UnauthorizedResponse();
    }

    const body = (await req.json().catch(() => {})) ?? {};

    let content = workflow.template;
    const model = workflow.model;
    // const instruction = workflow.instruction ?? "";
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

    const onFinish = async (evt: any) => {
      const inputWordCount = content.split(" ").length;
      const outWordCount = (evt.text ?? "").split(" ").length;
      const totalTokens = Math.floor(
        !isNaN(evt?.usage?.totalTokens)
          ? evt?.usage?.totalTokens
          : (inputWordCount + outWordCount) * 0.6
      );

      await Promise.all([
        reportUsage(
          workflow?.organization?.id,
          workflow?.organization?.stripe
            ?.subscription as unknown as Stripe.Subscription,
          totalTokens
        ),
        logEvent(EventName.RunWorkflow, {
          workflow_id: workflow.id,
          owner_id: workflow.ownerId,
          model,
          total_tokens: totalTokens,
        }),
      ]);
    };

    const response = await getStreamingCompletion(
      model,
      content,
      workflow.modelSettings,
      onFinish
    );

    return response;
  } catch (error) {
    console.error(error);
    return ErrorResponse(
      "Failed to run workflow",
      500,
      ErrorCodes.InternalServerError
    );
  }
}
