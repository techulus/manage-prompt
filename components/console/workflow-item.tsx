import {
  ChevronRightIcon,
  GlobeAltIcon,
  PencilIcon,
  PlayIcon,
  UserIcon,
} from "@heroicons/react/20/solid";
import { Workflow } from "@prisma/client";
import classNames from "classnames";
import Link from "next/link";

interface Props {
  workflow: Workflow;
}

export async function WorkflowItem({ workflow }: Props) {
  return (
    <li
      key={workflow.id}
      className="relative py-5 pl-4 pr-6 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900 sm:py-6 sm:pl-6 lg:pl-8 xl:pl-6"
    >
      <div className="flex items-center justify-between space-x-4">
        <Link
          href={`/console/workflows/${workflow.id}`}
          className="min-w-0 space-y-3"
        >
          <div className="flex items-center space-x-3">
            <span
              className={classNames(
                workflow.published
                  ? "bg-green-100 dark:bg-green-900"
                  : "bg-gray-100 dark:bg-gray-900",
                "h-4 w-4 flex items-center justify-center rounded-full"
              )}
              aria-hidden="true"
            >
              <span
                className={classNames(
                  workflow.published ? "bg-green-400" : "bg-gray-400",
                  "h-2 w-2 rounded-full"
                )}
              />
            </span>

            <h2 className="font-semibold">
              <span className="absolute inset-0" aria-hidden="true" />
              {workflow.name}{" "}
              <span className="sr-only">
                {workflow.published ? "Published" : "Draft"}
              </span>
            </h2>
          </div>
          <div className="group relative flex items-center space-x-2.5">
            <UserIcon className="h-4 w-4 inline text-gray-400" />
            <span className="truncate text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-300">
              {workflow.createdBy}
            </span>
            {workflow.publicUrl ? (
              <GlobeAltIcon className="h-4 w-4 inline text-orange-400 dark:text-orange-500" />
            ) : null}
          </div>
        </Link>
        <div className="sm:hidden">
          <ChevronRightIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </div>
        <div className="hidden flex-shrink-0 flex-col items-end space-y-3 sm:flex">
          <p className="flex items-center space-x-4 text-blue-500 hover:text-blue-900 dark:hover:text-blue-400">
            {workflow.published ? (
              <Link
                href={`/console/workflows/${workflow.id}`}
                className="relative text-sm font-medium"
              >
                <PlayIcon className="h-3 w-3 inline mr-1 -mt-0.5" />
                Run
              </Link>
            ) : (
              <Link
                href={`/console/workflows/${workflow.id}/edit`}
                className="relative text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                <PencilIcon className="h-3 w-3 inline mr-1 -mt-0.5" />
                Edit
              </Link>
            )}
          </p>
          <p className="flex space-x-2 text-sm text-gray-500">
            <span>{workflow.model}</span>
            <span aria-hidden="true">&middot;</span>
            <span>
              Last updated {new Date(workflow.updatedAt).toLocaleDateString()}
            </span>
          </p>
        </div>
      </div>
    </li>
  );
}
