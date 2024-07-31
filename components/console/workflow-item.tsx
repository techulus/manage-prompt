import { cn } from "@/lib/utils";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { Workflow } from "@prisma/client";
import classNames from "classnames";
import Link from "next/link";
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
      name: string;
    };
  };
}

export async function WorkflowItem({ workflow }: Props) {
  return (
    <div
      key={workflow.id}
      className={cn(
        "relative flex justify-between space-x-3 rounded-lg border border-gray-200 px-3 py-2 shadow-sm hover:border-gray-400 dark:border-gray-800 dark:hover:border-gray-700 bg-white dark:bg-gray-950"
      )}
    >
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
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{workflow.model}</Badge>
              <span className="hidden sm:block" aria-hidden="true">
                &middot;
              </span>
              <span className="hidden sm:block text-sm">
                {workflow.user?.name}
              </span>
            </div>
          </h2>
        </div>
      </Link>

      <div className="sm:hidden">
        <ChevronRightIcon
          className="h-4 w-4 text-gray-400"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
