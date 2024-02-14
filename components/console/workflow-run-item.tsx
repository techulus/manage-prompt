import { WorkflowRun } from "@prisma/client";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { Button, buttonVariants } from "../ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";

type WorkflowRunWithUser = Pick<
  WorkflowRun,
  "result" | "id" | "createdAt" | "rawResult"
> & {
  user: {
    first_name: string | null;
  };
};

interface Props {
  workflowRun: WorkflowRunWithUser;
}

export async function WorkflowRunItem({ workflowRun }: Props) {
  const { result, user, createdAt, rawResult } = workflowRun;
  const model = (rawResult as any)?.model as string;
  const totalTokens = (rawResult as any)?.usage.total_tokens as number;

  return (
    <li
      key={workflowRun.id}
      className="relative overflow-x-scroll px-6 py-5 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600 hover:bg-gray-50 dark:hover:bg-card"
    >
      <div className="flex justify-between space-x-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-gray-900 dark:text-gray-100 space-x-2">
            <span>{user?.first_name ?? "API"}</span>

            {model ? (
              <>
                <span aria-hidden="true">&middot;</span>
                <span className="text-gray-600 dark:text-gray-400 font-normal">
                  {model}
                </span>
                <span aria-hidden="true">&middot;</span>
                <span className="text-gray-600 dark:text-gray-400 font-normal">
                  {totalTokens} tokens
                </span>
              </>
            ) : null}
          </p>
        </div>
        <time
          dateTime={new Date(createdAt).toISOString()}
          className="flex-shrink-0 whitespace-nowrap text-sm text-gray-500"
        >
          {new Date(createdAt).toLocaleTimeString()}
        </time>
      </div>
      <div className="mt-1 text-gray-600 dark:text-gray-200">
        <ReactMarkdown className="prose dark:prose-invert max-w-none prose-a:text-blue-600 dark:prose-a:text-blue-500">
          {result}
        </ReactMarkdown>
      </div>

      <Drawer>
        <DrawerTrigger
          className={buttonVariants({ variant: "link", className: "pl-0" })}
        >
          View Raw Response
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{model}</DrawerTitle>
          </DrawerHeader>

          <pre className="p-4 bg-secondary overflow-scroll">
            {JSON.stringify(rawResult, null, 2)}
          </pre>

          <DrawerFooter>
            <DrawerClose>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </li>
  );
}
