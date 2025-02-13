import type { User } from "@prisma/client";
import { headers } from "next/headers";
import { auth } from "../auth";
import { prisma } from "../utils/db";

type Result = {
  ownerId: string;
  userId: string;
  orgId: string | null;
};

export async function owner(): Promise<Result> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("User not found");
  }

  return {
    ownerId: session.user.id,
    userId: session.user.id,
    orgId: null,
  } as Result;
}

export async function getUser(): Promise<User | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    throw new Error("User not found");
  }

  return await prisma.user.findUnique({
    where: {
      id: session?.user?.id,
    },
  });
}
