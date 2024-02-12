import { AIImageProcessingPage } from "@/components/ai-tools/page-layout";
import { buildMetadata } from "@/lib/utils/metadata";
import { createPrediction, createPredictionOrder } from "@/lib/utils/replicate";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import input from "./input.jpg";
import output from "./output.png";

const title = "AI Image Upscaling";
const description =
  "Witness a leap in image quality with our state-of-the-art AI Image Upscaling Tool. Enhance the details and sharpness of your pictures effortlessly. Uncover a new realm of visual clarity as our advanced algorithms redefine image resolution.";

export const metadata: Metadata = buildMetadata(title, description);

export default async function ImageUpscale() {
  async function renderImage(image: string) {
    "use server";

    console.log("creating prediction", image);
    const prediction = await createPrediction(
      "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
      {
        image,
        scale: 2,
        face_enhance: true,
      }
    );
    console.log("prediction created", prediction);

    await createPredictionOrder({
      predictionId: prediction.id,
      inputUrl: image,
      type: "image-upscale",
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
