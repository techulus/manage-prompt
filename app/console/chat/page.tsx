import ChatForm from "@/components/chat/chat-form";
import PageTitle from "@/components/layout/page-title";
import { WorkflowModels } from "@/data/workflow";
import { getSettings } from "@/lib/hooks/user";

export default async function Chat() {
  const settings = await getSettings();

  return (
    <>
      <PageTitle title="Chat" />
      <ChatForm defaultModel={settings?.chat_model ?? WorkflowModels.gpt4} />
    </>
  );
}
