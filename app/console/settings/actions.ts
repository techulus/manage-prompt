"use server";

import { owner } from "@/lib/hooks/useOwner";
import { prisma } from "@/lib/utils/db";
import {
  createOrRetrieveCustomer,
  getCheckoutSession,
} from "@/lib/utils/stripe";
import { MAX_RATE_LIMIT_RPS } from "@/lib/utils/workflow";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function redirectToBilling() {
  const { ownerId } = owner();

  if (!ownerId) {
    throw new Error("User and org ID not found");
  }

  const customer = await createOrRetrieveCustomer(ownerId);
  const url = await getCheckoutSession(customer);
  redirect(url);
}

export async function createSecretKey() {
  const { userId, ownerId } = owner();

  if (!ownerId || !userId) {
    throw new Error("User and org ID not found");
  }

  const apiKey = await prisma.secretKey.create({
    data: {
      key: `sk_${randomBytes(32).toString("hex")}`,
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
    },
  });
  console.log(apiKey);

  redirect(`/console/settings`);
}

export async function revokeSecretKey(data: FormData) {
  const id = data.get("id");
  if (!id) throw new Error("No ID provided");
  await prisma.secretKey.delete({
    where: {
      id: +id,
    },
  });
  redirect(`/console/settings`);
}

const RateLimitSettingsSchema = z.object({
  rateLimitPerSecond: z.number().min(1).max(MAX_RATE_LIMIT_RPS),
});

export async function updateRateLimit(data: FormData) {
  const id = data.get("id");
  const rateLimitPerSecond = Number(data.get("rateLimitPerSecond"));

  const result = RateLimitSettingsSchema.safeParse({
    rateLimitPerSecond,
  });
  if (!result.success) {
    return {
      error: fromZodError(result.error).toString(),
    };
  }

  await prisma.secretKey.update({
    where: {
      id: +id!,
    },
    data: {
      rateLimitPerSecond,
    },
  });

  redirect(`/console/settings`);
}
