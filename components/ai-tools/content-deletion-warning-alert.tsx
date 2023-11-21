import { AlertOctagonIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

export const ContentDeleteWarningAlert = () => (
  <Alert className="my-6">
    <AlertOctagonIcon className="h-5 w-5" />
    <AlertTitle className="text-lg">Heads up!</AlertTitle>
    <AlertDescription>
      <p>
        All uploaded content and processed images are are automatically deleted
        after an hour.
      </p>
      <p className="font-bold">
        Please make sure that you download your processed images before the hour
        is up.
      </p>
    </AlertDescription>
  </Alert>
);
