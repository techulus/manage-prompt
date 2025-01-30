import { Badge } from "@/components/ui/badge";
import { type AIModel, AIModelToLabel } from "@/data/workflow";
import { getWorkflowUsage } from "@/lib/utils/analytics";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import type { Workflow } from "@prisma/client";
import classNames from "classnames";

interface Props {
  workflow: Pick<
    Workflow,
    | "id"
    | "name"
    | "createdAt"
    | "updatedAt"
    | "published"
    | "model"
    | "ownerId"
  > & {
    user: {
      name: string;
    };
  };
}

export async function WorkflowItem({ workflow }: Props) {
  const usage = await getWorkflowUsage(workflow.id);

  return (
    <div className="relative flex items-center space-x-4 p-4 bg-seconday rounded-lg border border-gray-200 hover:border-gray-400 dark:border-gray-800 dark:hover:border-gray-700 bg-white dark:bg-gray-950">
      <div className="min-w-0 flex-auto">
        <div className="flex items-center gap-x-2">
          <span
            className={classNames(
              workflow.published
                ? "bg-green-100 dark:bg-green-900"
                : "bg-gray-100 dark:bg-card",
              "h-4 w-4 flex items-center justify-center rounded-full",
            )}
            aria-hidden="true"
          >
            <span
              className={classNames(
                workflow.published ? "bg-green-400" : "bg-red-500",
                "h-2 w-2 rounded-full",
              )}
            />
          </span>
          <h2 className="min-w-0 font-medium">
            <a
              href={`/console/workflows/${workflow.id}`}
              className="flex gap-x-2"
            >
              <span className="truncate">{workflow.name}</span>
              <span className="absolute inset-0" />
            </a>
          </h2>
        </div>
        <div className="mt-1 ml-6 flex items-center gap-x-2.5">
          <p className="truncate">
            {Number(usage?.tokens ?? 0).toLocaleString()} tokens
          </p>
          <svg
            viewBox="0 0 2 2"
            className="h-0.5 w-0.5 flex-none fill-gray-300"
          >
            <circle r={1} cx={1} cy={1} />
          </svg>
          <p className="whitespace-nowrap">
            {Number(usage?.runs ?? 0).toLocaleString()} runs
          </p>
        </div>
      </div>
      <Badge
        variant={
          AIModelToLabel[workflow.model as AIModel]
            .toLowerCase()
            .includes("deprecated")
            ? "destructive"
            : "outline"
        }
      >
        {AIModelToLabel[workflow.model as AIModel]}
      </Badge>
      <ChevronRightIcon aria-hidden="true" className="h-5 w-5 flex-none" />
    </div>
  );
}
