import ChatView from "@/components/console/chatbot/chat-view";

export default async function ChatbotEmbed(
  props: {
    params: Promise<{ token: string }>;
  }
) {
  const params = await props.params;

  const {
    token
  } = params;

  return <ChatView token={token} isEmbed />;
}
