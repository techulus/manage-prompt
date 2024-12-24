import { AIImageProcessingPage } from "@/components/ai-tools/page-layout";
import { buildMetadata } from "@/lib/utils/metadata";
import { createPrediction, createPredictionOrder } from "@/lib/utils/replicate";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import input from "./input.jpeg";
import output from "./output.png";

const title = "AI Image Background Removal";
const description =
  "Discover the ultimate solution for removing image backgrounds seamlessly with our cutting-edge AI-powered tool. Effortlessly transform your photos with just a few clicks, saving time and ensuring professional, stunning results. Say goodbye to tedious manual editing – experience the power of AI background removal today!";

export const metadata: Metadata = buildMetadata(title, description);

export default async function ImageUpscale() {
  async function renderImage(image: string) {
    "use server";

    console.log("creating prediction", image);
    const prediction = await createPrediction(
      "fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
      {
        image,
      },
    );
    console.log("prediction created", prediction);

    await createPredictionOrder({
      predictionId: prediction.id,
      inputUrl: image,
      type: "remove-background",
    });

    redirect(`/ai-tools/processing/${prediction.id}`);
  }

  return (
    <AIImageProcessingPage
      title={String(metadata.title)}
      subTitle={String(metadata.description)}
      input={input}
      output={output}
      renderImage={renderImage}
    />
  );
}
