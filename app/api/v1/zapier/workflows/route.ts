import {
  ErrorCodes,
  ErrorResponse,
  UnauthorizedResponse,
} from "@/lib/utils/api";
import { prisma } from "@/lib/utils/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
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
    });
    if (!key) {
      return UnauthorizedResponse();
    }

    const workflows = await prisma.workflow.findMany({
      where: {
        ownerId: key.ownerId,
      },
    });

    const mappedWorkflows = [
      {
        key: "id",
        label: "Workflow",
        choices: workflows.reduce((acc: Record<string, string>, workflow) => {
          acc[workflow.shortId] = workflow.name;
          return acc;
        }, {}),
        required: true,
        dynamic: true,
      },
    ];

    return NextResponse.json({ workflows: mappedWorkflows });
  } catch (error) {
    console.error(error);
    return ErrorResponse(
      "Failed to fetch workflows",
      500,
      ErrorCodes.InternalServerError,
    );
  }
}
