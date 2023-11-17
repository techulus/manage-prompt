"use server";

import { owner } from "@/lib/hooks/useOwner";
import { prisma } from "@/lib/utils/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function purgeWorkflowData() {
  const { ownerId } = owner();

  if (ownerId) {
    throw new Error("User and org ID not found");
  }

  await prisma.workflow.deleteMany({
    where: {
      organization: {
        id: {
          equals: ownerId,
        },
      },
    },
  });

  revalidatePath("/console/settings");
  revalidatePath(`/console/workflows`);
  redirect("/console/settings");
}

export async function updateTheme(formData: FormData) {
  const theme = String(formData.get("theme")) ?? "light";

  cookies().set("theme", theme, { httpOnly: true });
}
