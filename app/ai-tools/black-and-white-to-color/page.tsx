import { FileUploader } from "@/components/ai-tools/image-upload";
import { ContentBlock } from "@/components/core/content-block";
import PageTitle from "@/components/layout/page-title";
import { CardContent } from "@/components/ui/card";
import { owner } from "@/lib/hooks/useOwner";
import { prisma } from "@/lib/utils/db";
import { del } from "@vercel/blob";
import { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import Replicate from "replicate";
import input from "./input.jpg";
import output from "./output.png";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export const metadata: Metadata = {
  title: "Color old black and white photos",
  description:
    "Using AI to colorize old black and white photos. Bring old photos back to life.",
};

export default async function BlackAndWhiteToColor() {
  const { userId } = owner();

  async function renderImage(image: string) {
    "use server";

    console.log("starting replicate", image);
    const output = await replicate.run(
      "cjwbw/bigcolor:9451bfbf652b21a9bccc741e5c7046540faa5586cfa3aa45abc7dbb46151a4f7",
      {
        input: {
          mode: "Multi-modal class vector c",
          image,
          classes: "88",
        },
      }
    );

    // @ts-ignore
    const outputUrl = output[0].image;
    console.log("replicate done", outputUrl);

    const user = userId
      ? await prisma.user.findUnique({
          where: {
            id: userId,
          },
        })
      : null;

    const order = await prisma.imageOrder.create({
      data: {
        email: user?.email,
        inputUrl: image,
        outputUrl: outputUrl,
        type: "black-and-white-to-color",
        paymentStatus: "pending",
      },
    });

    await del(image);

    redirect(`/ai-tools/order/${order.id}`);
  }

  return (
    <>
      <PageTitle
        title={String(metadata.title)}
        subTitle={String(metadata.description)}
      />

      <ContentBlock>
        <CardContent>
          <div className="flex flex-col mt-4">
            <FileUploader onUploadComplete={renderImage} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              <div className="flex flex-col items-center justify-center">
                <p className="text-lg text-bold pt-2">Input</p>
                <Image src={input} alt="Bring Old Photos Back To Life" />
              </div>
              <div className="flex flex-col items-center justify-center">
                <p className="text-lg text-bold pt-2">Output</p>
                <Image src={output} alt="Bring Old Photos Back To Life" />
              </div>
            </div>
          </div>
        </CardContent>
      </ContentBlock>
    </>
  );
}
