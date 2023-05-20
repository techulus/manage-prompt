"use server";

import { prisma } from "@/utils/db";
import { auth } from "@clerk/nextjs/app-beta";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function purgeWorkflowData() {
  const { userId, orgId } = auth();

  if (!userId && !orgId) {
    throw new Error("User and org ID not found");
  }

  await prisma.workflow.deleteMany({
    where: {
      ownerId: orgId ?? userId,
    },
  });

  revalidatePath("/console/settings");
  revalidatePath(`/console/workflows`);
  redirect("/console/settings");
}
