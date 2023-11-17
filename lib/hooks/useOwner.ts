import { auth } from "@clerk/nextjs";

type Result = {
  ownerId: string;
  userId: string;
  orgId: string;
};

export function owner(): Result {
  const { userId, orgId } = auth();
  return { ownerId: orgId ?? userId ?? "", userId, orgId } as Result;
}
