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
  searchParams: {
    search: string;
    page: string;
  };
}

export default async function Workflows({ searchParams }: Props) {
  const { userId, orgId } = await owner();

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
        actionLabel="New"
        actionLink="/console/workflows/new"
      />

      <div className="flex max-w-7xl px-4 xl:px-0 sm:mx-auto py-4 space-x-4 items-center -mt-8">
        <form className="flex-1" action="/console/workflows">
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
              createLink="/console/workflows/new"
            />
          </div>
        ) : null}

        {workflows?.length ? (
          <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:px-0">
            {workflows.map((workflow) => (
              // @ts-ignore React server component
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
                      href={`/console/workflows?page=${currentPage - 1}`}
                    />
                  </PaginationItem>
                ) : null}
                {new Array(Math.min(totalPages, 5)).fill(0).map((_, idx) => (
                  <PaginationItem key={idx}>
                    <PaginationLink
                      href={`/console/workflows?page=${idx + 1}`}
                      className={cn(
                        idx + 1 === currentPage && "text-primary font-semibold",
                      )}
                    >
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
      </div>
    </>
  );
}
