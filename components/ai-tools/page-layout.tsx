import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import PageSection from "../core/page-section";
import PageTitle from "../layout/page-title";
import { Button } from "../ui/button";
import { CardContent } from "../ui/card";
import { ContentDeleteWarningAlert } from "./content-deletion-warning-alert";
import { FileUploader } from "./image-upload";

export function AIImageProcessingPage({
  title,
  subTitle,
  renderImage,
  input,
  output,
}: {
  title: string;
  subTitle: string;
  renderImage: (image: string) => Promise<void>;
  input: StaticImageData;
  output: StaticImageData;
}) {
  return (
    <>
      <PageTitle title={title} subTitle={subTitle}>
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

            <FileUploader onUploadComplete={renderImage} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              <div className="flex flex-col items-center justify-center">
                <p className="text-lg text-bold py-8">Before</p>
                <Image src={input} alt={title} />
              </div>
              <div className="flex flex-col items-center justify-center">
                <p className="text-lg text-bold py-8">After</p>
                <Image src={output} alt={title} />
              </div>
            </div>
          </div>
        </CardContent>
      </PageSection>
    </>
  );
}
