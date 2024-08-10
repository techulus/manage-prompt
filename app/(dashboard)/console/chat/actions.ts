"use server";

import { owner } from "@/lib/hooks/useOwner";
import { prisma } from "@/lib/utils/db";
import { ragChat } from "@/lib/utils/rag-chat";
import { reportUsage } from "@/lib/utils/stripe";
import Stripe from "stripe";

export async function addContext(payload: FormData) {
  const { ownerId } = await owner();
  const type = payload.get("type");
  const source = payload.get("url") as string;

  const options = {
    namespace: ownerId,
  };

  if (type === "pdf") {
    await ragChat.context.add({
      type: "pdf",
      fileSource: source,
      options,
    });
  }

  if (type === "html") {
    await ragChat.context.add({
      type: "html",
      source,
      options,
    });
  }
}

export async function getChatHistory() {
  const { ownerId } = await owner();

  return ragChat.history.getMessages({
    amount: 10,
    sessionId: ownerId,
  });
}

export async function clearChatHistory() {
  const { ownerId } = await owner();

  await ragChat.history.deleteMessages({
    sessionId: ownerId,
  });
}

export async function clearContextData() {
  const { ownerId } = await owner();

  await ragChat.context.deleteEntireContext({
    namespace: ownerId,
  });
}

export async function reportChatUsage(totalTokens: number) {
  const { ownerId } = await owner();

  const organization = await prisma.organization.findUnique({
    where: {
      id: ownerId,
    },
    include: {
      stripe: true,
    },
  });

  await reportUsage(
    ownerId,
    organization?.stripe?.subscription as unknown as Stripe.Subscription,
    totalTokens
  );
}
