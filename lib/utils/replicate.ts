import Replicate from "replicate";
import { owner } from "../hooks/useOwner";
import { prisma } from "./db";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function runModel(
  name: `${string}/${string}:${string}`,
  image: string,
  input: any = {}
) {
  return await replicate.run(name, {
    input: {
      image,
      ...input,
    },
  });
}

export async function runModelWithPrompt(
  name: `${string}/${string}:${string}`,
  prompt: string,
  input: any = {}
) {
  return await replicate.run(name, {
    input: {
      prompt,
      ...input,
    },
  });
}

export async function createOrder({
  inputUrl,
  outputUrl,
  type,
}: {
  inputUrl: string;
  outputUrl: string;
  type: string;
}) {
  const { userId } = owner();
  const user = userId
    ? await prisma.user.findUnique({
        where: {
          id: userId,
        },
      })
    : null;

  return await prisma.imageOrder.create({
    data: {
      email: user?.email,
      inputUrl,
      outputUrl,
      type,
      paymentStatus: "pending",
    },
  });
}

export async function createPromptOrder({
  inputPrompt,
  inputData,
  outputUrl,
  type,
}: {
  inputPrompt: string;
  inputData: any;
  outputUrl: string;
  type: string;
}) {
  const { userId } = owner();
  const user = userId
    ? await prisma.user.findUnique({
        where: {
          id: userId,
        },
      })
    : null;

  return await prisma.imageOrder.create({
    data: {
      email: user?.email,
      inputUrl: "",
      inputPrompt,
      inputData,
      outputUrl,
      type,
      paymentStatus: "pending",
    },
  });
}
