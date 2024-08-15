import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Terminal } from "lucide-react";
import Link from "next/link";

export default function ChatDeploy() {
  return (
    <div className="px-6 py-4">
      <p className="py-1">
        Deploying your chatbot mostly invloves generating a token for your user
        to interact with the chatbot and then using the token to authenticate
        and interact with the chatbot. Currently we offer a streaming API that
        is compatible with{" "}
        <Link
          target="_blank"
          rel="noopener noreferrer"
          href="https://sdk.vercel.ai/"
          className="text-primary underline"
        >
          Vercel AI SDK.
        </Link>
      </p>

      <Alert className="my-6">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription className="text-primary">
          Treat the token like a secure token, it should be shared only with the
          user who is interacting with the chatbot.
        </AlertDescription>
      </Alert>

      <Link
        className={buttonVariants({ variant: "default" })}
        target="_blank"
        rel="noopener noreferrer"
        href="https://manageprompt.readme.io/reference/chatbot-get-token"
      >
        View Deployment Instructions
      </Link>
    </div>
  );
}
