"use server";

import { auth } from "@clerk/nextjs";
import { prisma } from "../utils/db";

export type UserSetting = {
  theme?: string;
  chat_model?: string;
};

export const updateSettings = async (settings: UserSetting) => {
  const { userId } = auth();
  if (!userId) throw new Error("User not found");

  const currentSettings = await getSettings();

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      settings: {
        ...(currentSettings ?? {}),
        ...settings,
      },
    },
  });
};

export const getSettings = async (): Promise<UserSetting> => {
  const { userId } = auth();
  if (!userId) throw new Error("User not found");

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      settings: true,
    },
  });

  return (user?.settings ?? {}) as UserSetting;
};
