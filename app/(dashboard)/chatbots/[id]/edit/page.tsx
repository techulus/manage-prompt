import { updateChatBot } from "@/app/(dashboard)/chatbots/actions";
import { ChatbotForm } from "@/components/console/chatbot/chatbot-form";
import PageSection from "@/components/core/page-section";
import PageTitle from "@/components/layout/page-title";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/utils/db";
import { Terminal } from "lucide-react";
import { notFound } from "next/navigation";

export default async function CreateChatbot({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const chatBot = await prisma.chatBot.findUnique({
    where: {
      id,
    },
  });

  if (!chatBot) {
    return notFound();
  }

  return (
    <>
      <PageTitle title={`Edit ${chatBot.name}`} backUrl={`/chatbots/${id}`} />

      <PageSection topInset>
        <CardContent>
          <Alert className="my-4">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Chatbot!?</AlertTitle>
            <AlertDescription>
              A chatbot can be used to automate conversations with your users.
              You can add more context to your chatbot using a website, PDF or
              text file.
            </AlertDescription>
          </Alert>
          <ChatbotForm action={updateChatBot} chatbot={chatBot} />
        </CardContent>
      </PageSection>
    </>
  );
}
