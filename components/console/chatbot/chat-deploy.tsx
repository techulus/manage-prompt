"use client";

import { ApiCodeSnippet } from "@/components/code/snippet";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default function ChatDeploy({
  id,
  apiSecretKey,
}: {
  apiSecretKey: string;
  id: string;
}) {
  return (
    <div className="px-6 py-4">
      <p className="py-1">
        To deploy your chatbot, you need to generate a token for your chatbot.
        This token has to be generated for each user and will be identified
        using a unique session ID. The token will be used to authenticate the
        user with the chatbot and the chat history will be stored based on the
        session ID.
      </p>

      <Alert className="my-6">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription className="text-primary">
          Treat the token like a secure token, it should be shared only with the
          user who is interacting with the chatbot.
        </AlertDescription>
      </Alert>

      <p className="py-1">
        You can see the API request below to generate a token for your chatbot.
      </p>
      <ApiCodeSnippet
        har={{
          method: "POST",
          url: `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/v1/chat/token`,
          queryString: [],
          headers: [
            {
              name: "Authorization",
              value: `Bearer ${apiSecretKey ?? "api-secret-key"}`,
            },
            {
              name: "Content-Type",
              value: "application/json",
            },
          ],
          postData: {
            mimeType: "application/json",
            text: JSON.stringify({
              chatbotId: id,
              sessionId: "unique-session-id-for-your-user",
            }),
          },
        }}
      />
    </div>
  );
}
