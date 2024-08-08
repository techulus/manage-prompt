"use server";

import { owner } from "@/lib/hooks/useOwner";
import { prisma } from "@/lib/utils/db";
import { encrypt } from "@/lib/utils/encryption";
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
  const { ownerId } = await owner();

  if (!ownerId) {
    throw new Error("User and org ID not found");
  }

  const customer = await createOrRetrieveCustomer(ownerId);
  const url = await getCheckoutSession(customer);
  redirect(url);
}

export async function createSecretKey() {
  const { userId, ownerId } = await owner();

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

export async function updateUserName(data: FormData) {
  const id = data.get("id") as string;
  const name = data.get("userName") as string;

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

  await prisma.user.update({
    where: {
      id,
    },
    data: {
      name,
    },
  });

  redirect("/console/settings");
}

export async function updateUserKey(data: FormData) {
  const { ownerId } = await owner();

  const provider = data.get("id") as string;
  const apiKey = data.get("apiKey") as string;

  const result = z
    .object({
      provider: z.string().min(3).max(10),
      apiKey: z.string().min(3).max(128),
    })
    .safeParse({
      provider,
      apiKey,
    });

  if (!result.success) {
    return {
      error: fromZodError(result.error).toString(),
    };
  }

  const encryptedData = encrypt(apiKey);

  await prisma.userKey.upsert({
    where: {
      id: `${provider}_${ownerId}`,
    },
    update: {
      data: encryptedData,
    },
    create: {
      id: `${provider}_${ownerId}`,
      provider,
      data: encryptedData,
      organization: {
        connect: {
          id: ownerId,
        },
      },
    },
  });

  redirect("/console/settings");
}

export async function revokeUserKey(data: FormData) {
  const { ownerId } = await owner();

  const provider = data.get("provider") as string;

  await prisma.userKey.delete({
    where: {
      id: `${provider}_${ownerId}`,
    },
  });

  redirect("/console/settings");
}
