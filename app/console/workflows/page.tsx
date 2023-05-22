import { WorkflowItem } from "@/components/console/workflow-item";
import PageTitle from "@/components/layout/page-title";
import { LIMIT, getWorkflowsForOwner } from "@/utils/useWorkflow";
import { auth } from "@clerk/nextjs/app-beta";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: {
    search: string;
    page: string;
  };
}

export default async function Workflows({ searchParams }: Props) {
  const { userId, orgId } = auth();

  const currentPage = searchParams.page ? parseInt(searchParams.page) : 1;
  const { workflows, count } = await getWorkflowsForOwner({
    orgId: orgId!,
    userId: userId!,
    search: searchParams.search,
    page: currentPage,
  });

  return (
    <>
      <PageTitle
        title={
          searchParams.search ? `Search '${searchParams.search}'` : "Workflows"
        }
        backUrl={searchParams.search ? "/console/workflows" : undefined}
        createLink="/console/workflows/new"
      />

      <form
        action="/console/workflows"
        className="flex flex-1 justify-center lg:justify-end mt-4 border-b border-gray-200 dark:border-gray-800 pb-4"
      >
        <div className="w-full px-2 lg:px-6">
          <label htmlFor="search" className="sr-only">
            Search workflows
          </label>
          <div className="relative text-gray-600 dark:text-gray-400 focus-within:text-gray-800 dark:focus-within:text-gray-200">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
            </div>
            <input
              id="search"
              name="search"
              className="block w-full rounded-md border-0 bg-gray-200 dark:bg-gray-900 bg-opacity-25 py-1.5 pl-10 pr-3 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:bg-white dark:focus:bg-gray-800 focus:outline focus:outline-gray-200 dark:focus:outline-gray-600  focus:outline-none focus:ring-0 focus:placeholder:text-gray-500 dark:focus:placeholder:text-gray-400 sm:text-sm sm:leading-6"
              placeholder="Search Workflows"
              type="search"
            />
          </div>
        </div>
      </form>

      <ul
        role="list"
        className="divide-y divide-gray-200 dark:divide-gray-800 border-b border-gray-200 dark:border-gray-800"
      >
        {workflows.length === 0 && (
          <div className="p-6">
            <Link
              href="/console/workflows/new"
              className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center hover:border-gray-400 dark:hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg
                className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0v6m0-6h6m-6 0h-6"
                />
              </svg>
              <span className="mt-2 block text-sm font-semibold text-gray-900 dark:text-gray-300">
                Create a new workflow
              </span>
            </Link>
          </div>
        )}

        {workflows.map((workflow) => (
          // @ts-ignore React server component
          <WorkflowItem key={workflow.id} workflow={workflow} />
        ))}
      </ul>

      <nav className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 px-4 py-3 sm:px-6">
        <div className="hidden sm:block">
          <p className="text-sm text-gray-700 dark:text-gray-400">
            Showing{" "}
            <span className="font-medium">{(currentPage - 1) * LIMIT + 1}</span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(currentPage * LIMIT, count)}
            </span>{" "}
            of <span className="font-medium">{count}</span> workflows
          </p>
        </div>

        <div className="flex flex-1 justify-between sm:justify-end">
          {currentPage > 1 ? (
            <form action="/console/workflows">
              <input type="hidden" name="page" value={currentPage - 1} />
              <button
                type="submit"
                className="relative inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 focus-visible:outline-offset-0"
              >
                Previous
              </button>
            </form>
          ) : null}

          {(currentPage - 1) * LIMIT + workflows.length < count ? (
            <form action="/console/workflows">
              <input type="hidden" name="page" value={currentPage + 1} />
              <button
                type="submit"
                className="relative ml-3 inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 focus-visible:outline-offset-0"
              >
                Next
              </button>
            </form>
          ) : null}
        </div>
      </nav>
    </>
  );
}
