import { AIStreamTextLayout } from "@/components/ai-tools/stream-page-layout";
import { getManagePromptToken } from "@/lib/utils/manageprompt";
import { buildMetadata } from "@/lib/utils/metadata";
import { Metadata } from "next";

const title = "AI Text Summarizer";
const description =
  "Use AI to summarise your text and generate a short summary.";

export const metadata: Metadata = buildMetadata(title, description);
export const dynamic = "force-dynamic";

export default async function ProofRead() {
  const token = await getManagePromptToken(300);
  const streamUrl = `${process.env.APP_BASE_URL}/api/v1/run/${process.env.MANAGEPROMPT_SUMMARISE_WORKFLOW_ID}/stream?token=${token}`;

  return (
    <AIStreamTextLayout
      title={title}
      subTitle={description}
      streamUrl={streamUrl}
    />
  );
}
