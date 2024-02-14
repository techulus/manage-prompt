import { WorkflowInput } from "@/data/workflow";
import { owner } from "@/lib/hooks/useOwner";
import { prisma } from "@/lib/utils/db";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: { workflowId: string } }
) {
  const { ownerId } = owner();

  const workflow = await prisma.workflow.findUnique({
    where: {
      shortId: params.workflowId,
      ownerId,
    },
  });
  if (!workflow || !workflow?.published) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  let body: any = {};
  const inputs = (workflow?.inputs ?? []) as WorkflowInput[];
  if (inputs) {
    for (const input of inputs) {
      body[input.name] = "value";
    }
  }

  return NextResponse.json({
    method: "POST",
    url: `https://${process.env.APP_BASE_URL}/api/run/${params.workflowId}`,
    queryString: [],
    headers: [
      {
        name: "Authorization",
        value: "Bearer your-secret-token",
      },
      {
        name: "Content-Type",
        value: "application/json",
      },
    ],
    postData: {
      mimeType: "application/json",
      text: JSON.stringify(body),
    },
  });
}
