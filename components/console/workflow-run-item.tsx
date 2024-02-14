import { WorkflowRun } from "@prisma/client";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";

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

  return (
    <li
      key={workflowRun.id}
      className="relative overflow-x-scroll px-6 py-5 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600 hover:bg-gray-50 dark:hover:bg-card"
    >
      <div className="flex justify-between space-x-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100 space-x-2">
            <span>{user?.first_name ?? "API"}</span>

            {model ? (
              <>
                <span aria-hidden="true">&middot;</span>
                <span className="text-gray-600 dark:text-gray-400 font-normal">
                  {model}
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
        <ReactMarkdown className="text-sm prose dark:prose-invert max-w-none prose-a:text-blue-600 dark:prose-a:text-blue-500">
          {result}
        </ReactMarkdown>
      </div>
    </li>
  );
}
