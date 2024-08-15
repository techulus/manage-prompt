import { createChatBot } from "@/app/(dashboard)/console/chatbots/actions";
import { ChatbotForm } from "@/components/console/chatbot/chatbot-form";
import PageSection from "@/components/core/page-section";
import PageTitle from "@/components/layout/page-title";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CardContent } from "@/components/ui/card";
import { Terminal } from "lucide-react";

export default function CreateChatbot() {
  return (
    <>
      <PageTitle title="Create Chatbot" backUrl="/console/chatbots" />

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
          <ChatbotForm action={createChatBot} />
        </CardContent>
      </PageSection>
    </>
  );
}
