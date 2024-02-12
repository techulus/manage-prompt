import { AIImageProcessingPage } from "@/components/ai-tools/page-layout";
import { buildMetadata } from "@/lib/utils/metadata";
import { createPrediction, createPredictionOrder } from "@/lib/utils/replicate";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import input from "./input.jpg";
import output from "./output.png";

const title = "AI Black and White Photo Colorizer";
const description =
  "Elevate your photos with our AI Black and White Photo Colorizer. Effortlessly bring vintage images to life in vibrant colors. Try our advanced tool for unparalleled results in photo transformation. Restore and revitalize your memories with ease – explore the future of photo coloring now!";

export const metadata: Metadata = buildMetadata(title, description);

export default async function BlackAndWhiteToColor() {
  async function renderImage(image: string) {
    "use server";

    console.log("creating prediction", image);
    const prediction = await createPrediction(
      "9451bfbf652b21a9bccc741e5c7046540faa5586cfa3aa45abc7dbb46151a4f7",
      {
        image,
      }
    );
    console.log("prediction created", prediction);

    await createPredictionOrder({
      predictionId: prediction.id,
      inputUrl: image,
      type: "black-and-white-to-color",
    });

    redirect(`/ai-tools/processing/${prediction.id}`);
  }

  return (
    <AIImageProcessingPage
      title={String(metadata.title)}
      input={input}
      output={output}
      renderImage={renderImage}
    />
  );
}
