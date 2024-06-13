"use server";

import { owner } from "@/lib/hooks/useOwner";
import { prisma } from "@/lib/utils/db";
import {
  createOrRetrieveCustomer,
  getCheckoutSession,
} from "@/lib/utils/stripe";
import { MAX_RATE_LIMIT_RPS } from "@/lib/utils/workflow";
import { init } from "@paralleldrive/cuid2";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

const createId = init({
  length: 32,
});

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

  await prisma.secretKey.create({
    data: {
      key: `sk_${createId()}`,
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

export async function updateRateLimit(data: FormData) {
  const id = data.get("id");
  const rateLimitPerSecond = Number(data.get("rateLimitPerSecond"));

  const result = z
    .object({
      rateLimitPerSecond: z.number().min(1).max(MAX_RATE_LIMIT_RPS),
    })
    .safeParse({
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

export async function updateSpendLimit(data: FormData) {
  const id = data.get("id") as string;
  const spendLimit = Number(data.get("spendLimit"));

  const result = z
    .object({
      spendLimit: z.number().min(10).max(10000),
    })
    .safeParse({
      spendLimit,
    });
  if (!result.success) {
    return {
      error: fromZodError(result.error).toString(),
    };
  }

  await prisma.organization.update({
    where: {
      id,
    },
    data: {
      spendLimit,
    },
  });

  redirect(`/console/settings`);
}

export async function removeSpendLimit(data: FormData) {
  const id = data.get("id") as string;

  await prisma.organization.update({
    where: {
      id,
    },
    data: {
      spendLimit: null,
    },
  });

  revalidatePath(`/console/settings`);
}

export async function updateKeyName(data: FormData) {
  const id = data.get("id");
  const name = data.get("keyName") as string;

  const result = z
    .object({
      name: z.string().min(3).max(50),
    })
    .safeParse({
      name,
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
      name,
    },
  });

  redirect(`/console/settings`);
}
