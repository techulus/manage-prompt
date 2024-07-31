import { auth } from "@/auth";
import { User } from "@prisma/client";
import { prisma } from "../utils/db";

type Result = {
  ownerId: string | null;
  userId: string | null;
  orgId: string | null;
};

export async function owner(): Promise<Result> {
  const session = await auth();
  return {
    ownerId: session?.user?.id,
    userId: session?.user?.id,
    orgId: null,
  } as Result;
}

export async function getUser(): Promise<User | null> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("User not found");
  }

  return await prisma.user.findUnique({
    where: {
      id: session?.user?.id,
    },
  });
}
