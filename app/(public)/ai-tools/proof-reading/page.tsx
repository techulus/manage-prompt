import type { Metadata } from "next";
import { AIStreamTextLayout } from "@/components/ai-tools/stream-page-layout";
import { getManagePromptToken } from "@/lib/utils/manageprompt";
import { buildMetadata } from "@/lib/utils/metadata";

const title = "AI Proof Reading";
const description =
  "Use AI to proofread your text and correct any grammatical errors.";

export const metadata: Metadata = buildMetadata(title, description);
export const dynamic = "force-dynamic";

export default async function ProofRead() {
  const token = await getManagePromptToken(300);
  const streamUrl = `${process.env.APP_BASE_URL}/api/v1/run/${process.env.MANAGEPROMPT_PROOFREAD_WORKFLOW_ID}/stream?token=${token}`;

  return (
    <AIStreamTextLayout
      title={title}
      subTitle={description}
      streamUrl={streamUrl}
    />
  );
}
