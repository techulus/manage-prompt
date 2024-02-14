import { WorkflowItem } from "@/components/console/workflow-item";
import { ContentBlock } from "@/components/core/content-block";
import PageTitle from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { owner } from "@/lib/hooks/useOwner";
import { LIMIT, getWorkflowsForOwner } from "@/lib/utils/useWorkflow";
import Link from "next/link";

interface Props {
  searchParams: {
    search: string;
    page: string;
  };
}

export default async function Workflows({ searchParams }: Props) {
  const { userId, orgId } = owner();

  const currentPage = searchParams.page ? parseInt(searchParams.page) : 1;
  const { workflows, count } = await getWorkflowsForOwner({
    orgId: orgId!,
    userId: userId!,
    search: searchParams.search,
    page: currentPage,
  });

  const totalPages = Math.ceil(count / LIMIT);

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
        <ul role="list" className="divide-y border-b">
          {workflows.length === 0 ? (
            <div className="p-6">
              <Link
                href="/console/workflows/new"
                className={buttonVariants({ variant: "default" })}
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
      </ContentBlock>

      {workflows?.length > 0 && totalPages > 1 ? (
        <div className="py-4">
          <Pagination>
            <PaginationContent>
              {currentPage > 1 ? (
                <PaginationItem>
                  <PaginationPrevious
                    href={`/console/workflows?page=${currentPage - 1}`}
                  />
                </PaginationItem>
              ) : null}
              {new Array(Math.min(totalPages, 5)).fill(0).map((_, idx) => (
                <PaginationItem key={idx}>
                  <PaginationLink href={`/console/workflows?page=${idx + 1}`}>
                    {idx + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              {(currentPage - 1) * LIMIT + workflows.length < count ? (
                <PaginationItem>
                  <PaginationNext
                    href={`/console/workflows?page=${currentPage + 1}`}
                  />
                </PaginationItem>
              ) : null}
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}
    </>
  );
}
