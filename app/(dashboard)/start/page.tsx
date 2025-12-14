import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/hooks/useOwner";
import { prisma } from "@/lib/utils/db";

export default async function Start() {
  const user = await getUser();

  if (!user) {
    return notFound();
  }

  await prisma.organization.upsert({
    where: {
      id: user.id,
    },
    update: {},
    create: {
      id: user.id,
      name: "Personal",
      rawData: {},
      credits: 250,
      createdBy: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  const organizationToUser = await prisma.organizationToUser.findFirst({
    where: {
      userId: user.id,
    },
  });

  if (!organizationToUser) {
    await prisma.organizationToUser.create({
      data: {
        organization: {
          connect: {
            id: user.id,
          },
        },
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });
  }

  redirect("/workflows");
}
