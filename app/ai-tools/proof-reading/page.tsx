import { ContentBlock } from "@/components/core/content-block";
import PageTitle from "@/components/layout/page-title";
import { CardContent } from "@/components/ui/card";
import { getManagePromptToken } from "@/lib/utils/manageprompt";
import { buildMetadata } from "@/lib/utils/metadata";
import { Metadata } from "next";
import ProofReadForm from "./form";

const title = "AI Proof Reading";
const description =
  "Use AI to proofread your text and correct any grammatical errors.";

export const metadata: Metadata = buildMetadata(title, description);
export const dynamic = "force-dynamic";

export default async function ProofRead() {
  const token = await getManagePromptToken(300);
  const streamUrl = `${process.env.APP_BASE_URL}/api/v1/run/${process.env.MANAGEPROMPT_PROOFREAD_WORKFLOW_ID}/stream?token=${token}`;

  return (
    <>
      <PageTitle title={title} subTitle={description} />

      <div className="hidden md:block h-8"></div>

      <ContentBlock>
        <CardContent>
          <ProofReadForm streamUrl={streamUrl} />
        </CardContent>
      </ContentBlock>
    </>
  );
}
