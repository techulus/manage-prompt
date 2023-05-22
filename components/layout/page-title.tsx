import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import classNames from "classnames";
import Link from "next/link";

interface Props {
  title: string;
  createLink?: string;
  backUrl?: string;
}

export default function PageTitle({ title, backUrl, createLink }: Props) {
  return (
    <div className="flex justify-between border-b border-gray-200 dark:border-gray-800 pb-4 pl-4 pr-6 pt-4 sm:pl-6 lg:pl-8 xl:border-t-0 xl:pl-6 xl:py-8 dark:bg-black dark:text-white">
      <div className="flex items-center">
        {backUrl && (
          <Link
            href={backUrl}
            className="flex items-center text-md font-medium text-gray-600 hover:text-gray-900 mr-2"
          >
            <ArrowLeftIcon
              className={classNames(
                "flex-shrink-0 h-6 w-6 text-gray-600 hover:text-gray-900",
                "dark:text-gray-400 dark:hover:text-gray-300"
              )}
              aria-hidden="true"
            />
          </Link>
        )}

        <h1 className="flex-1 text-lg font-bold">{title}</h1>
      </div>

      {createLink ? (
        <Link
          href={createLink}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          New Workflow
        </Link>
      ) : null}
    </div>
  );
}
