import {
  type WorkflowInput,
  WorkflowInputTypeToZapierFieldType,
} from "@/data/workflow";
import {
  ErrorCodes,
  ErrorResponse,
  UnauthorizedResponse,
} from "@/lib/utils/api";
import { prisma } from "@/lib/utils/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
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

    const workflow = await prisma.workflow.findUnique({
      where: {
        shortId: params.workflowId,
        ownerId: key.ownerId,
      },
    });
    if (!workflow) {
      return ErrorResponse("Workflow not found", 404);
    }

    const inputs = workflow.inputs as unknown as WorkflowInput[];

    const fields = inputs.map((input) => ({
      key: input.name,
      label: input.label,
      type: WorkflowInputTypeToZapierFieldType[input.type ?? "text"],
      required: true,
    }));

    return NextResponse.json({ fields });
  } catch (error) {
    console.error(error);
    return ErrorResponse(
      "Failed to fetch workflow inputs",
      500,
      ErrorCodes.InternalServerError,
    );
  }
}
