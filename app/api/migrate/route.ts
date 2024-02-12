import { prisma } from "@/lib/utils/db";
import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";

export async function GET(_: Request) {
  const workflows = await prisma.workflow.findMany();

  for (const workflow of workflows) {
    await prisma.workflow.update({
      where: {
        id: workflow.id,
      },
      data: {
        shortId: `wf_${randomBytes(16).toString("hex")}`,
      },
    });
  }

  return NextResponse.json({
    message: "ok",
  });
}
