import { prisma } from "@/lib/utils/db";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _: NextRequest,
  {
    params,
  }: {
    params: {
      id: string;
    };
  },
) {
  const id = params.id;
  const workflow = await prisma.workflow.findUnique({
    where: {
      id: +id,
    },
  });

  if (!workflow) {
    return NextResponse.error();
  }

  const exportData = {
    id: workflow.shortId,
    name: workflow.name,
    model: workflow.model,
    template: workflow.template,
    inputs: workflow.inputs,
    modelSettings: JSON.stringify(workflow.modelSettings),
  };

  return NextResponse.json(exportData, {
    headers: {
      "Content-Disposition": `attachment; filename="${workflow.shortId}.json"`,
      "cache-control": "no-store, max-age=0",
    },
  });
}
