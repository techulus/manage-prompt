import { type WorkflowInput, modelToProvider } from "@/data/workflow";
import { getStreamingCompletion } from "@/lib/utils/ai";
import {
  ErrorCodes,
  ErrorResponse,
  UnauthorizedResponse,
} from "@/lib/utils/api";
import { ByokService } from "@/lib/utils/byok-service";
import { prisma } from "@/lib/utils/db";
import { redis } from "@/lib/utils/redis";
import { reportUsage } from "@/lib/utils/stripe";
import {
  cacheWorkflowResult,
  getWorkflowCachedResult,
} from "@/lib/utils/useWorkflow";
import { translateInputs } from "@/lib/utils/workflow";
import { waitUntil } from "@vercel/functions";
import { createDataStreamResponse } from "ai";
import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

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
  props: { params: Promise<{ workflowId: string }> },
) {
  const params = await props.params;
  const searchParams = req.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return UnauthorizedResponse();
  }

  try {
    const validateToken: { ownerId: string } | null = await redis.get(token);
    if (!validateToken) {
      return UnauthorizedResponse();
    }
    await redis.del(token);

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

      return createDataStreamResponse({
        status: 200,
        statusText: "OK",
        async execute(dataStream) {
          for (const chunk of chunks) {
            dataStream.writeData(chunk);
          }
        },
      });
    }

    const model = workflow.model;
    const inputs = workflow.inputs as unknown as WorkflowInput[];
    const content = await translateInputs({
      inputs,
      inputValues: body,
      template: workflow.template,
    });

    const byokService = new ByokService();
    const isEligibleForByokDiscount = !!byokService.get(
      modelToProvider[model],
      workflow.organization.UserKeys,
    );

    const onFinish = async (evt: any) => {
      const output = evt.text ?? "";

      const inputWordCount = content.split(" ").length;
      const outWordCount = output.split(" ").length;
      let totalTokens = Math.floor(
        !Number.isNaN(evt?.usage?.totalTokens)
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
          prisma.workflowRun.create({
            data: {
              result: output,
              rawRequest: JSON.parse(JSON.stringify({ model, content })),
              rawResult: JSON.parse(JSON.stringify({ result: output })),
              totalTokenCount: totalTokens ?? 0,
              user: {
                connect: {
                  id: validateToken.ownerId,
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
