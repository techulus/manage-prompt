import { WorkflowRunItem } from "@/components/console/workflow/workflow-run-item";
import PageSection from "@/components/core/page-section";
import PageTitle from "@/components/layout/page-title";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { type AIModel, AIModelToLabel } from "@/data/workflow";
import { cn } from "@/lib/utils";
import { LIMIT, getWorkflowAndRuns } from "@/lib/utils/useWorkflow";

interface Props {
  params: Promise<{
    workflowId: string;
  }>;
  searchParams: Promise<{
    page: string;
  }>;
}

export const maxDuration = 120;

export default async function WorkflowDetails(props: Props) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const currentPage = searchParams.page
    ? Number.parseInt(searchParams.page)
    : 1;
  const { workflow, count, workflowRuns } = await getWorkflowAndRuns({
    id: Number(params.workflowId),
    page: currentPage,
  });
  const totalPages = Math.ceil(count / LIMIT);

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  return (
    (<div className="relative">
      <PageTitle
        title={workflow.name}
        subTitle={AIModelToLabel[workflow.model as AIModel]}
        backUrl="/workflows"
        actionLabel="Edit"
        actionLink={`/workflows/${workflow.id}/edit`}
      />
      <PageSection topInset>
        <ul className="divide-y">
          {workflowRuns.map((run) => (
            // @ts-ignore React server component
            (<WorkflowRunItem key={run.id} workflowRun={run} />)
          ))}
        </ul>
      </PageSection>
      {totalPages > 1 ? (
        <div className="py-4">
          <Pagination>
            <PaginationContent>
              {currentPage > 1 ? (
                <PaginationItem>
                  <PaginationPrevious
                    href={`/workflows/${params.workflowId}?page=${
                      currentPage - 1
                    }`}
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
                          "text-primary font-semibold"
                      )}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              {(currentPage - 1) * LIMIT + workflowRuns.length < count ? (
                <PaginationItem>
                  <PaginationNext
                    href={`/workflows/${params.workflowId}?page=${
                      currentPage + 1
                    }`}
                  />
                </PaginationItem>
              ) : null}
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}
    </div>)
  );
}
