import { getWorkflowRunStats } from "@/lib/utils/tinybird";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { Workflow } from "@prisma/client";
import classNames from "classnames";
import Link from "next/link";
import { WorkflowStatsAreaChart } from "../core/area-chart";
import { Badge } from "../ui/badge";

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
      first_name: string;
    };
  };
}

export async function WorkflowItem({ workflow }: Props) {
  const usageData = await getWorkflowRunStats(workflow.id);

  return (
    <li
      key={workflow.id}
      className="relative py-5 pl-4 pr-6 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-slate-900 rounded-md"
    >
      <div className="flex items-center justify-between space-x-4">
        <Link
          href={`/console/workflows/${workflow.id}`}
          className="min-w-0 space-y-3"
          prefetch={false}
        >
          <div className="flex items-center space-x-3">
            <span
              className={classNames(
                workflow.published
                  ? "bg-green-100 dark:bg-green-900"
                  : "bg-gray-100 dark:bg-card",
                "h-4 w-4 flex items-center justify-center rounded-full"
              )}
              aria-hidden="true"
            >
              <span
                className={classNames(
                  workflow.published ? "bg-green-400" : "bg-red-500",
                  "h-2 w-2 rounded-full"
                )}
              />
            </span>

            <h2 className="text-lg font-semibold">
              <span className="absolute inset-0" aria-hidden="true" />
              {workflow.name}{" "}
              <span className="sr-only">
                {workflow.published ? "Published" : "Draft"}
              </span>
            </h2>
          </div>
          <div className="group relative flex items-center space-x-2.5 pl-6">
            <Badge variant="outline">{workflow.model}</Badge>
            <span className="hidden sm:block" aria-hidden="true">
              &middot;
            </span>
            <span className="hidden sm:block text-sm">
              {workflow.user?.first_name}
            </span>
          </div>
        </Link>

        <div className="sm:hidden">
          <ChevronRightIcon
            className="h-4 w-4 text-gray-400"
            aria-hidden="true"
          />
        </div>

        <WorkflowStatsAreaChart chartData={usageData} />
      </div>
    </li>
  );
}
