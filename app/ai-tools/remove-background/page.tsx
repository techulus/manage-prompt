import { AIImageProcessingPage } from "@/components/ai-tools/page-layout";
import { buildMetadata } from "@/lib/utils/metadata";
import { createOrder, runModel } from "@/lib/utils/replicate";
import { del } from "@vercel/blob";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import input from "./input.jpeg";
import output from "./output.png";

export const dynamic = "force-dynamic";

const title = "AI Image Background Removal";
const description =
  "Discover the ultimate solution for removing image backgrounds seamlessly with our cutting-edge AI-powered tool. Effortlessly transform your photos with just a few clicks, saving time and ensuring professional, stunning results. Say goodbye to tedious manual editing – experience the power of AI background removal today!";

export const metadata: Metadata = buildMetadata(title, description);

export default async function ImageUpscale() {
  async function renderImage(image: string) {
    "use server";

    console.log("starting replicate", image);
    const output = await runModel(
      "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
      image
    );

    // @ts-ignore
    const outputUrl = output as unknown as string;
    console.log("replicate done", outputUrl);

    const order = await createOrder({
      inputUrl: image,
      outputUrl: outputUrl,
      type: "remove-background",
    });

    await del(image);

    redirect(`/ai-tools/order/${order.id}`);
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
