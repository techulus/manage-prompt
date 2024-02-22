import { ContentBlock } from "@/components/core/content-block";
import PageTitle from "@/components/layout/page-title";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { getManagePromptToken } from "@/lib/utils/manageprompt";
import { buildMetadata } from "@/lib/utils/metadata";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { Metadata } from "next";
import Link from "next/link";
import TextAreaForm from "../../../components/ai-tools/text-area-input-form";

const title = "AI Text Summarizer";
const description =
  "Use AI to summarise your text and generate a short summary.";

export const metadata: Metadata = buildMetadata(title, description);
export const dynamic = "force-dynamic";

export default async function ProofRead() {
  const token = await getManagePromptToken(300);
  const streamUrl = `${process.env.APP_BASE_URL}/api/v1/run/${process.env.MANAGEPROMPT_SUMMARISE_WORKFLOW_ID}/stream?token=${token}`;

  return (
    <>
      <PageTitle title={title} subTitle={description}>
        <div className="flex">
          <Button variant="link" className="px-0">
            <ArrowLeftIcon
              className="mr-3 h-5 w-5 text-primary"
              aria-hidden="true"
            />
            <Link href="/ai-tools">View all tools</Link>
          </Button>
        </div>
      </PageTitle>

      <div className="hidden md:block h-8"></div>

      <ContentBlock>
        <CardContent>
          <TextAreaForm streamUrl={streamUrl} />
        </CardContent>
      </ContentBlock>
    </>
  );
}
