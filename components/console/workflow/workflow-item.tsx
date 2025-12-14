import classNames from "classnames";
import { ChevronRightIcon, TestTube } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type AIModel, AIModelToLabel } from "@/data/workflow";
import type { Workflow } from "@/generated/prisma-client/client";
import { cn } from "@/lib/utils";
import { getWorkflowUsage } from "@/lib/utils/analytics";
import { prisma } from "@/lib/utils/db";

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
  >;
}

export async function WorkflowItem({ workflow }: Props) {
  const usage = await getWorkflowUsage(workflow.id);

  const tests = await prisma.workflowTest.findMany({
    select: {
      status: true,
    },
    where: {
      workflowId: workflow.id,
    },
  });

  const areTestsPassing = tests.every((test) => test.status === "pass");

  return (
    <div className="relative flex items-center space-x-4 p-4 bg-seconday bg-white hover:bg-gray-50 dark:bg-gray-950 dark:hover:bg-gray-900">
      <div className="min-w-0 flex-auto">
        <div className="flex items-center gap-x-2">
          <span
            className={classNames(
              workflow.published
                ? "bg-green-100 dark:bg-green-900"
                : "bg-gray-100 dark:bg-card",
              "h-4 w-4 flex items-center justify-center",
            )}
            aria-hidden="true"
          >
            <span
              className={classNames(
                workflow.published ? "bg-green-400" : "bg-red-500",
                "h-2 w-2",
              )}
            />
          </span>
          <h2 className="min-w-0 font-medium">
            <a href={`/workflows/${workflow.id}`} className="flex gap-x-2">
              <span className="truncate">{workflow.name}</span>
              <span className="absolute inset-0" />
            </a>
          </h2>
        </div>
        <div className="mt-1 ml-6 text-xs md:text-sm flex items-center gap-x-2.5 text-gray-500 dark:text-gray-400">
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

          {tests.length > 0 && (
            <>
              <svg
                viewBox="0 0 2 2"
                className="h-0.5 w-0.5 flex-none fill-gray-300"
              >
                <circle r={1} cx={1} cy={1} />
              </svg>
              <p
                className={cn(
                  "whitespace-nowrap font-medium inline-flex items-center",
                  areTestsPassing
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400",
                )}
              >
                <TestTube className="h-4 w-4" />
                {areTestsPassing ? "Passed" : "Failed"}
              </p>
            </>
          )}
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
