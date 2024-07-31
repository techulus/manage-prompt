"use server";

import { prisma } from "../utils/db";
import { owner } from "./useOwner";

export type UserSetting = {};

export const updateSettings = async (settings: UserSetting) => {
  const { userId } = await owner();
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
  const { userId } = await owner();
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
