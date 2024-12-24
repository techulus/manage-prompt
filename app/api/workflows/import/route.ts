import { owner } from "@/lib/hooks/useOwner";
import { DateTime } from "@/lib/utils/datetime";
import { prisma } from "@/lib/utils/db";
import { WorkflowSchema } from "@/lib/utils/workflow";
import { createId } from "@paralleldrive/cuid2";
import { NextResponse } from "next/server";
import { fromZodError } from "zod-validation-error";

type UploadResult = {
  message?: string;
  success: boolean;
};

export async function PUT(request: Request) {
  const { userId, ownerId } = await owner();

  const body = await request.blob();
  const bodyString = await body.text();

  const workflow = {
    ...JSON.parse(bodyString),
    name: `Imported ${DateTime.fromJSDate(new Date()).toNiceFormat()}`,
  };
  workflow.id = undefined;

  const validationResult = WorkflowSchema.safeParse(workflow);

  if (!validationResult.success) {
    return NextResponse.json<UploadResult>({
      success: false,
      message: fromZodError(validationResult.error).toString(),
    });
  }

  workflow.modelSettings = workflow.modelSettings
    ? JSON.parse(workflow.modelSettings)
    : null;
  console.log("Importing workflow...", workflow);

  await prisma.workflow.create({
    data: {
      user: {
        connect: {
          id: userId,
        },
      },
      organization: {
        connect: {
          id: ownerId,
        },
      },
      published: true,
      shortId: `wf_${createId()}`,
      ...workflow,
    },
  });

  return NextResponse.json<UploadResult>({
    success: true,
  });
}
