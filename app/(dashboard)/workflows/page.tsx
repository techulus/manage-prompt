import { ImportWorkflowDialog } from "@/components/console/workflow/workflow-import";
import { WorkflowItem } from "@/components/console/workflow/workflow-item";
import EmptyState from "@/components/core/empty-state";
import PageTitle from "@/components/layout/page-title";
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
import { cn } from "@/lib/utils";
import { getWorkflowsForOwner, LIMIT } from "@/lib/utils/useWorkflow";

interface Props {
  searchParams: Promise<{
    search: string;
    page: string;
  }>;
}

export default async function Workflows(props: Props) {
  const searchParams = await props.searchParams;
  const { ownerId } = await owner();

  const currentPage = searchParams.page
    ? Number.parseInt(searchParams.page)
    : 1;

  const { workflows, count } = await getWorkflowsForOwner({
    ownerId,
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
        backUrl={searchParams.search ? "/workflows" : undefined}
        actionLabel="New"
        actionLink="/workflows/new"
      />
      <div className="flex max-w-7xl px-4 xl:px-0 sm:mx-auto py-4 space-x-4 items-center -mt-8">
        <form className="flex-1" action="/workflows">
          <label htmlFor="search" className="sr-only">
            Search workflows
          </label>
          <div className="relative text-gray-600 dark:text-gray-400 focus-within:text-gray-800 dark:focus-within:text-gray-200">
            <Input name="search" placeholder="Search Workflows" type="search" />
          </div>
        </form>

        <ImportWorkflowDialog />
      </div>
      <div className="mx-auto mt-8 flex max-w-7xl flex-col">
        {workflows.length === 0 ? (
          <div>
            {searchParams.search ? (
              <div className="text-center p-8 block text-sm font-semibold text-gray-900 dark:text-gray-300 w-full">
                We couldn&apos;t find any workflows matching{" "}
                {`"${searchParams.search}"`}
              </div>
            ) : null}

            <EmptyState
              label="workflow"
              show={workflows.length === 0}
              createLink="/workflows/new"
            />
          </div>
        ) : null}

        {workflows?.length ? (
          <div className="divide-y border rounded-md overflow-hidden">
            {workflows.map((workflow) => (
              // @ts-ignore
              <WorkflowItem key={workflow.id} workflow={workflow} />
            ))}
          </div>
        ) : null}

        {workflows?.length > 0 && totalPages > 1 ? (
          <div className="py-4">
            <Pagination>
              <PaginationContent>
                {currentPage > 1 ? (
                  <PaginationItem>
                    <PaginationPrevious
                      href={`/workflows?page=${currentPage - 1}`}
                    />
                  </PaginationItem>
                ) : null}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, idx) => {
                  const pageNumber = idx + 1;
                  return (
                    <PaginationItem key={`page-${pageNumber}`}>
                      <PaginationLink
                        href={`/workflows?page=${pageNumber}`}
                        className={cn(
                          pageNumber === currentPage &&
                            "text-primary font-semibold",
                        )}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                {(currentPage - 1) * LIMIT + workflows.length < count ? (
                  <PaginationItem>
                    <PaginationNext
                      href={`/workflows?page=${currentPage + 1}`}
                    />
                  </PaginationItem>
                ) : null}
              </PaginationContent>
            </Pagination>
          </div>
        ) : null}
      </div>
    </>
  );
}
