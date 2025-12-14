import { NextResponse } from "next/server";
import type { WorkflowInput } from "@/data/workflow";
import { getCompletion } from "@/lib/utils/ai";
import {
  ErrorCodes,
  ErrorResponse,
  UnauthorizedResponse,
} from "@/lib/utils/api";
import { prisma } from "@/lib/utils/db";
import { validateRateLimit } from "@/lib/utils/ratelimit";
import {
  cacheWorkflowResult,
  getWorkflowCachedResult,
} from "@/lib/utils/useWorkflow";
import { translateInputs } from "@/lib/utils/workflow";

export const maxDuration = 120;

export async function POST(
  req: Request,
  props: { params: Promise<{ workflowId: string }> },
) {
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
    if (organization?.credits === 0) {
      return ErrorResponse(
        "Invalid billing. Please contact support.",
        402,
        ErrorCodes.InvalidBilling,
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

    const { result, rawResult, totalTokenCount } = response;
    if (!result) {
      return ErrorResponse(
        "Failed to run workflow",
        500,
        ErrorCodes.InternalServerError,
      );
    }

    Promise.all([
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
      prisma.organization.update({
        where: {
          id: organization.id,
        },
        data: {
          credits: {
            decrement: 1,
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
    ]).catch((error) => {
      console.error(error);
    });

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
