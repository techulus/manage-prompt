import { WorkflowItem } from "@/components/console/workflow-item";
import { ContentBlock } from "@/components/core/content-block";
import PageTitle from "@/components/layout/page-title";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { owner } from "@/lib/hooks/useOwner";
import { LIMIT, getWorkflowsForOwner } from "@/lib/utils/useWorkflow";
import Link from "next/link";

interface Props {
  searchParams: {
    search: string;
    page: string;
  };
}

export const dynamic = "force-dynamic";

export default async function Workflows({ searchParams }: Props) {
  const { userId, orgId } = owner();

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
        actionLabel="New Workflow"
        actionLink="/console/workflows/new"
      />

      <form
        action="/console/workflows"
        className="flex flex-1 justify-center lg:justify-end mx-4 py-4 xl:pt-4 xl:pb-0 xl:m-0"
      >
        <div className="w-full max-w-7xl mx-auto">
          <label htmlFor="search" className="sr-only">
            Search workflows
          </label>
          <div className="relative text-gray-600 dark:text-gray-400 focus-within:text-gray-800 dark:focus-within:text-gray-200">
            <Input name="search" placeholder="Search Workflows" type="search" />
          </div>
        </div>
      </form>

      <ContentBlock>
        <ul
          role="list"
          className="divide-y divide-gray-200 dark:divide-gray-800 border-b border-gray-200 dark:border-gray-800"
        >
          {workflows.length === 0 ? (
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
                {searchParams.search ? (
                  <span className="mt-4 block text-sm font-semibold text-gray-900 dark:text-gray-300">
                    We couldn&apos;t find any workflows matching{" "}
                    {`"${searchParams.search}"`}
                  </span>
                ) : null}
                <span className="mt-2 block text-sm font-semibold text-gray-900 dark:text-gray-300">
                  Create a new workflow
                </span>
              </Link>
            </div>
          ) : null}

          {workflows.map((workflow) => (
            // @ts-ignore React server component
            <WorkflowItem key={workflow.id} workflow={workflow} />
          ))}
        </ul>

        {workflows.length > 0 && !searchParams.search ? (
          <nav className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 px-4 py-3 sm:px-6">
            <div className="hidden sm:block">
              <p className="text-sm text-gray-700 dark:text-gray-400">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * LIMIT + 1}
                </span>{" "}
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
                  <Button type="submit" variant="ghost">
                    Previous
                  </Button>
                </form>
              ) : null}

              {(currentPage - 1) * LIMIT + workflows.length < count ? (
                <form action="/console/workflows">
                  <input type="hidden" name="page" value={currentPage + 1} />
                  <Button type="submit" variant="ghost">
                    Next
                  </Button>
                </form>
              ) : null}
            </div>
          </nav>
        ) : null}
      </ContentBlock>
    </>
  );
}
