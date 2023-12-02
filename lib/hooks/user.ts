"use server";

import { prisma } from "../utils/db";
import { owner } from "./useOwner";

export type UserSetting = {
  chat_model?: string;
};

export const updateSettings = async (settings: UserSetting) => {
  const { userId } = owner();
  if (!userId) return;

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
  const { userId } = owner();
  if (!userId) return {};

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
