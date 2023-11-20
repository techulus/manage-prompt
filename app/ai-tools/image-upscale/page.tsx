import { FileUploader } from "@/components/ai-tools/image-upload";
import { ContentBlock } from "@/components/core/content-block";
import PageTitle from "@/components/layout/page-title";
import { CardContent } from "@/components/ui/card";
import { createOrder, runModel } from "@/lib/utils/replicate";
import { getAppBaseUrl } from "@/lib/utils/url";
import { del } from "@vercel/blob";
import { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import input from "./input.jpg";
import output from "./output.png";

export const dynamic = "force-dynamic";

const title = "Image Upscaling";
const description =
  "Witness a leap in image quality with our state-of-the-art AI Image Upscaling Tool. Enhance the details and sharpness of your pictures effortlessly. Uncover a new realm of visual clarity as our advanced algorithms redefine image resolution.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    images: [
      {
        url: "https://cdn.capture.techulus.in/e1ab7054-dabc-48d6-a33f-c18038aac1c8/fb7402dd8aef88fa5931ff8e2f6575fb/image?url=https%3A%2F%2Fmanageprompt.com%2Fai-tools%2Fimage-upscale&delay=1&vw=1200&vh=630",
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
  },
  metadataBase: new URL(getAppBaseUrl()),
};

export default async function ImageUpscale() {
  async function renderImage(image: string) {
    "use server";

    console.log("starting replicate", image);
    const output = await runModel(
      "nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
      image,
      {
        scale: 2,
        face_enhance: true,
      }
    );

    // @ts-ignore
    const outputUrl = output as unknown as string;
    console.log("replicate done", outputUrl);

    const order = await createOrder({
      inputUrl: image,
      outputUrl: outputUrl,
      type: "image-upscale",
    });

    await del(image);

    redirect(`/ai-tools/order/${order.id}`);
  }

  return (
    <>
      <PageTitle
        title={String(metadata.title)}
        subTitle="AI-Powered Image Upscaling Tool"
      />

      <ContentBlock>
        <CardContent>
          <div className="flex flex-col mt-4">
            <FileUploader onUploadComplete={renderImage} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              <div className="flex flex-col items-center justify-center">
                <p className="text-lg text-bold pt-2">Before</p>
                <Image src={input} alt={title} />
              </div>
              <div className="flex flex-col items-center justify-center">
                <p className="text-lg text-bold pt-2">After</p>
                <Image src={output} alt={title} />
              </div>
            </div>
          </div>
        </CardContent>
      </ContentBlock>
    </>
  );
}
