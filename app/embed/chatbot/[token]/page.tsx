import ChatView from "@/components/console/chatbot/chat-view";

export default function ChatbotEmbed({
  params: { token },
}: {
  params: { token: string };
}) {
  return <ChatView token={token} isEmbed />;
}
