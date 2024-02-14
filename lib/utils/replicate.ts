import Replicate from "replicate";
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

export async function createPrediction(version: string, input: any = {}) {
  return await replicate.predictions.create({
    version,
    input,
  });
}

export async function getPrediction(id: string) {
  return await replicate.predictions.get(id);
}

export async function createPredictionOrder({
  predictionId,
  inputPrompt,
  inputUrl = "",
  inputData = null,
  type,
}: {
  predictionId: string;
  inputPrompt?: string;
  inputUrl?: string;
  inputData?: any;
  type: string;
}) {
  return await prisma.imageOrder.create({
    data: {
      predictionId,
      inputUrl,
      inputPrompt,
      inputData,
      type,
    },
  });
}

export async function updatePredictionOrder(id: string, outputUrl: string) {
  return await prisma.imageOrder.update({
    where: {
      predictionId: id,
    },
    data: {
      outputUrl,
    },
  });
}
