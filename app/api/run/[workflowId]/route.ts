import { AiModel, WorkflowInput } from "@/data/workflow";
import { prisma } from "@/lib/utils/db";
import { getCompletion } from "@/lib/utils/openai";
import { isSubscriptionActive, reportUsage } from "@/lib/utils/stripe";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const UnauthorizedResponse = () =>
  NextResponse.json("Unauthorized", {
    status: 401,
  });

const ErrorResponse = (message: string, status = 400) =>
  NextResponse.json(
    {
      error: message,
      success: false,
    },
    {
      status,
    }
  );

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

    const ownerId = key.ownerId;

    const workflow = await prisma.workflow.findUnique({
      where: {
        shortId: params.workflowId,
        ownerId,
      },
    });
    if (!workflow) {
      return ErrorResponse("Workflow not found", 404);
    }

    const organization = key.organization;
    if (
      organization?.credits === 0 &&
      !isSubscriptionActive(organization?.stripe?.subscription)
    ) {
      return ErrorResponse(
        "You do not have any free credits left, please upgrade your plan.",
        402
      );
    }

    const body = (await req.json()) ?? {};

    let content = workflow.template;
    const model = workflow.model as AiModel;
    const instruction = workflow.instruction ?? "";
    const inputs = workflow.inputs as unknown as WorkflowInput[];
    // Handle inputs
    for (const input of inputs) {
      if (!body[input.name] || !body[input.name].trim()) {
        return ErrorResponse(`Missing input: ${input.name}`);
      }
      content = workflow.template.replace(
        `{{${input.name}}}`,
        body[input.name]
      );
    }

    const { result, rawResult } = await getCompletion(
      model,
      content,
      instruction
    );

    if (!result) {
      return ErrorResponse("Failed to run workflow", 500);
    }

    await reportUsage(
      organization?.stripe?.subscription as unknown as Stripe.Subscription,
      rawResult?.usage?.total_tokens ?? 0
    );

    await prisma.$transaction([
      prisma.workflowRun.create({
        data: {
          result,
          rawRequest: JSON.parse(
            JSON.stringify({ model, content, instruction })
          ),
          rawResult: JSON.parse(JSON.stringify(rawResult)),
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

    return NextResponse.json({ success: true, result: result });
  } catch (error) {
    console.error(error);
    return ErrorResponse("Failed to run workflow", 500);
  }
}
