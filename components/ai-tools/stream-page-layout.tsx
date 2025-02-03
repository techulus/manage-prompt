import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import PageSection from "../core/page-section";
import PageTitle from "../layout/page-title";
import { Button } from "../ui/button";
import { CardContent } from "../ui/card";
import TextAreaForm from "./text-area-input-form";

export function AIStreamTextLayout({
  title,
  subTitle,
  streamUrl,
}: {
  title: string;
  subTitle: string;
  streamUrl: string;
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
          <TextAreaForm streamUrl={streamUrl} />
        </CardContent>
      </PageSection>
    </>
  );
}
