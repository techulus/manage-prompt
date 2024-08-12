import { modelToProvider, WorkflowInput } from "@/data/workflow";
import { getStreamingCompletion } from "@/lib/utils/ai";
import {
  ErrorCodes,
  ErrorResponse,
  UnauthorizedResponse,
} from "@/lib/utils/api";
import { prisma } from "@/lib/utils/db";
import { getUserKeyFor } from "@/lib/utils/encryption";
import { redis } from "@/lib/utils/redis";
import { reportUsage } from "@/lib/utils/stripe";
import { EventName, logEvent } from "@/lib/utils/tinybird";
import {
  cacheWorkflowResult,
  getWorkflowCachedResult,
} from "@/lib/utils/useWorkflow";
import { waitUntil } from "@vercel/functions";
import { StreamingTextResponse } from "ai";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const maxDuration = 120;

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    },
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: { workflowId: string } },
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
            UserKeys: true,
          },
        },
      },
      where: {
        shortId: params.workflowId,
      },
      cacheStrategy: {
        ttl: 60,
      },
    });
    if (!workflow || !workflow?.published) {
      return ErrorResponse("Workflow not found", 404);
    }
    if (workflow.ownerId !== validateToken.ownerId) {
      return UnauthorizedResponse();
    }

    const body = (await req.json().catch(() => {})) ?? {};
    const cachedResult = await getWorkflowCachedResult(
      params.workflowId,
      JSON.stringify(body),
    );

    if (cachedResult) {
      const chunks = cachedResult.split(" ");

      const stream = new ReadableStream({
        async start(controller) {
          for (const chunk of chunks) {
            const bytes = new TextEncoder().encode(chunk + " ");
            controller.enqueue(bytes);
            await new Promise((r) =>
              setTimeout(r, Math.floor(Math.random() * 40) + 10),
            );
          }
          controller.close();
        },
      });

      return new StreamingTextResponse(stream);
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
          ErrorCodes.MissingInput,
        );
      }
      content = workflow.template.replace(
        `{{${input.name}}}`,
        body[input.name],
      );
    }

    const isEligibleForByokDiscount = !!getUserKeyFor(
      modelToProvider[model],
      workflow.organization.UserKeys,
    );

    const onFinish = async (evt: any) => {
      const output = evt.text ?? "";

      const inputWordCount = content.split(" ").length;
      const outWordCount = output.split(" ").length;
      let totalTokens = Math.floor(
        !isNaN(evt?.usage?.totalTokens)
          ? evt?.usage?.totalTokens
          : (inputWordCount + outWordCount) * 0.6,
      );

      if (isEligibleForByokDiscount) {
        totalTokens = Math.floor(totalTokens * 0.3);
      }

      waitUntil(
        Promise.all([
          reportUsage(
            workflow?.organization?.id,
            workflow?.organization?.stripe
              ?.subscription as unknown as Stripe.Subscription,
            totalTokens,
          ),
          logEvent(EventName.RunWorkflow, {
            workflow_id: workflow.id,
            owner_id: workflow.ownerId,
            model,
            total_tokens: totalTokens,
          }),
          workflow.cacheControlTtl
            ? cacheWorkflowResult(
                params.workflowId,
                JSON.stringify(body),
                output,
                workflow.cacheControlTtl,
              )
            : null,
        ]),
      );
    };

    const response = await getStreamingCompletion(
      model,
      content,
      JSON.parse(JSON.stringify(workflow.modelSettings)),
      workflow.organization.UserKeys,
      onFinish,
    );

    return response;
  } catch (error) {
    console.error(error);
    return ErrorResponse(
      "Failed to run workflow",
      500,
      ErrorCodes.InternalServerError,
    );
  }
}
