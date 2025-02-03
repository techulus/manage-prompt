import { ContentDeleteWarningAlert } from "@/components/ai-tools/content-deletion-warning-alert";
import PageSection from "@/components/core/page-section";
import { ActionButton } from "@/components/form/button";
import PageTitle from "@/components/layout/page-title";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { buildMetadata } from "@/lib/utils/metadata";
import { createPrediction, createPredictionOrder } from "@/lib/utils/replicate";
import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import output from "./output.png";

const title = "Photo Realistic Image Creator";
const description =
  "This tool lets you create a photo-realistic image from a natural language text description.";

export const metadata: Metadata = buildMetadata(title, description);

export default async function ImageUpscale() {
  async function renderImage(formData: FormData) {
    "use server";

    const prompt = formData.get("prompt") as string;

    console.log("creating prediction", prompt);
    const prediction = await createPrediction(
      "70e29df26dc5c2b06cf19532965867447f912b609b380138bee7f62c6980e772",
      {
        prompt,
        cn_type1: "ImagePrompt",
        cn_type2: "ImagePrompt",
        cn_type3: "ImagePrompt",
        cn_type4: "ImagePrompt",
        sharpness: 2,
        image_seed: 50403806253646856,
        uov_method: "Disabled",
        image_number: 1,
        guidance_scale: 4,
        refiner_switch: 0.5,
        negative_prompt: "",
        style_selections:
          "Fooocus V2,Fooocus Enhance,Fooocus Sharp,Fooocus Photograph",
        outpaint_selections: "",
        performance_selection: "Speed",
        aspect_ratios_selection: "1152×896",
      }
    );
    console.log("prediction created", prediction);

    const order = await createPredictionOrder({
      predictionId: prediction.id,
      inputPrompt: prompt,
      type: "photo-realistic-image-creator",
    });
    console.log("order created", order);

    redirect(`/ai-tools/processing/${prediction.id}`);
  }

  return (
    <>
      <PageTitle
        title={title}
        subTitle="Create a photo-realistic image from a natural language text description."
      >
        <div className="flex">
          <Button variant="link" className="px-0">
            <ArrowLeftIcon
              className="mr-3 h-5 w-5 text-primary"
              aria-hidden="true"
            />
            <Link href="/ai-tools" prefetch={false}>
              View all tools
            </Link>
          </Button>
        </div>
      </PageTitle>

      <PageSection topInset>
        <CardContent>
          <div className="flex flex-col">
            <ContentDeleteWarningAlert />

            <form action={renderImage}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex flex-col w-full">
                    <div className="space-y-3">
                      <Label className="text-md font-semibold">
                        Describe your Image
                      </Label>
                      <Textarea
                        name="prompt"
                        placeholder="A unicorn flying with its wings"
                      />

                      <p className="text-sm leading-5 text-gray-600 dark:text-gray-400">
                        By using this service, you agree to our{" "}
                        <Link
                          prefetch={false}
                          href="/terms"
                          className="text-primary hover:underline"
                        >
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          prefetch={false}
                          href="/privacy"
                          className="text-primary hover:underline"
                        >
                          {" "}
                          Privacy Policy
                        </Link>
                        .
                      </p>
                    </div>

                    <ActionButton
                      className="mt-4 max-w-md"
                      variant="default"
                      label="Create Image"
                      loadingLabel="Creating Image"
                    />
                  </div>
                </div>

                <Image className="mt-6" src={output} alt={title} />
              </div>
            </form>
          </div>
        </CardContent>
      </PageSection>
    </>
  );
}
