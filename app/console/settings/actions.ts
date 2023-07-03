"use server";

import { prisma } from "@/lib/utils/db";
import { auth } from "@clerk/nextjs/app-beta";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function purgeWorkflowData() {
  const { userId, orgId } = auth();

  if (!userId && !orgId) {
    throw new Error("User and org ID not found");
  }

  await prisma.workflow.deleteMany({
    where: {
      organization: {
        id: {
          equals: orgId ?? userId ?? "",
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
