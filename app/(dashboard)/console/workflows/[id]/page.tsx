import { WorkflowComposer } from "@/components/console/workflow/workflow-composer";
import { WorkflowRunItem } from "@/components/console/workflow/workflow-run-item";
import { WorkflowUsageCharts } from "@/components/console/workflow/workflow-usage-charts";
import PageSection from "@/components/core/page-section";
import { ActionButton, DeleteButton } from "@/components/form/button";
import PageTitle from "@/components/layout/page-title";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { CardHeader } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { AIModel, AIModelToLabel } from "@/data/workflow";
import { owner } from "@/lib/hooks/useOwner";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/utils/db";
import { getWorkflowRunStats } from "@/lib/utils/tinybird";
import { getWorkflowAndRuns, LIMIT } from "@/lib/utils/useWorkflow";
import { PauseCircleIcon, PlayCircleIcon } from "@heroicons/react/20/solid";
import { DownloadIcon } from "@radix-ui/react-icons";
import { Terminal } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { deleteWorkflow, toggleWorkflowState } from "../actions";

interface Props {
  params: {
    id: string;
  };
  searchParams: {
    page: string;
  };
}

export const maxDuration = 120;

export default async function WorkflowDetails({ params, searchParams }: Props) {
  const { ownerId } = await owner();
  if (!ownerId) {
    redirect("/sign-in");
  }

  const currentPage = searchParams.page ? parseInt(searchParams.page) : 1;
  const { workflow, workflowRuns, count } = await getWorkflowAndRuns(
    Number(params.id),
    currentPage,
  );
  const totalPages = Math.ceil(count / LIMIT);
  const usageData = await getWorkflowRunStats(workflow.id);

  const apiSecretKey = await prisma.secretKey.findFirst({
    where: {
      ownerId,
    },
  });

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  return (
    <div className="relative">
      <PageTitle
        title={workflow.name}
        subTitle={AIModelToLabel[workflow.model as AIModel]}
        backUrl="/console/workflows"
        actionLabel="Edit"
        actionLink={`/console/workflows/${workflow.id}/edit`}
      />

      {!workflow.published ? (
        <Alert variant="destructive" className="mx-auto max-w-7xl mt-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            This workflow is not active and hence cannot be run.
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Toolbar*/}
      <PageSection topInset bottomMargin>
        <div className="flex h-12 flex-col justify-center">
          <div className="px-4 sm:px-6 lg:px-8 lg:-mx-4">
            <div className="flex justify-between py-3">
              {/* Left buttons */}
              <div className="isolate inline-flex sm:space-x-3">
                <span className="inline-flex space-x-1">
                  <form action={toggleWorkflowState}>
                    <input
                      className="hidden"
                      type="text"
                      name="id"
                      defaultValue={workflow.id}
                    />
                    <input
                      className="hidden"
                      type="number"
                      name="published"
                      defaultValue={workflow.published ? 1 : 0}
                    />
                    {workflow.published ? (
                      <ActionButton
                        icon={
                          <PauseCircleIcon
                            className="mr-2 h-4 w-4"
                            aria-hidden="true"
                          />
                        }
                        label="Deactivate"
                      />
                    ) : (
                      <ActionButton
                        icon={
                          <PlayCircleIcon
                            className="mr-2 h-4 w-4"
                            aria-hidden="true"
                          />
                        }
                        label="Activate"
                      />
                    )}
                  </form>

                  <Link
                    href={`/console/workflows/${workflow.id}/export`}
                    className={buttonVariants({ variant: "ghost" })}
                    prefetch={false}
                  >
                    <DownloadIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                    Export
                  </Link>
                </span>
              </div>

              {/* Right buttons */}
              <nav aria-label="Pagination">
                <span className="isolate inline-flex">
                  <form action={deleteWorkflow}>
                    <input
                      className="hidden"
                      type="text"
                      name="id"
                      defaultValue={workflow.id}
                    />
                    <DeleteButton />
                  </form>
                </span>
              </nav>
            </div>
          </div>
        </div>
      </PageSection>

      <PageSection>
        <CardHeader>
          <h3 className="text-lg font-semibold">Usage (Last 24 hours)</h3>
          <WorkflowUsageCharts usageData={usageData} />
        </CardHeader>
      </PageSection>

      <PageSection>
        <WorkflowComposer
          workflow={workflow}
          apiSecretKey={apiSecretKey?.key}
        />
      </PageSection>

      {workflowRuns.length ? (
        <PageSection>
          <ul role="list" className="divide-y">
            {workflowRuns.map((run) => (
              // @ts-ignore React server component
              <WorkflowRunItem key={run.id} workflowRun={run} />
            ))}
          </ul>
        </PageSection>
      ) : null}

      {workflowRuns?.length > 0 && totalPages > 1 ? (
        <div className="py-4">
          <Pagination>
            <PaginationContent>
              {currentPage > 1 ? (
                <PaginationItem>
                  <PaginationPrevious
                    href={`/console/workflows/${params.id}?page=${
                      currentPage - 1
                    }`}
                  />
                </PaginationItem>
              ) : null}
              {new Array(Math.min(totalPages, 5)).fill(0).map((_, idx) => (
                <PaginationItem key={idx}>
                  <PaginationLink
                    href={`/console/workflows/${params.id}?page=${idx + 1}`}
                    className={cn(
                      idx + 1 === currentPage && "text-primary font-semibold",
                    )}
                  >
                    {idx + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              {(currentPage - 1) * LIMIT + workflowRuns.length < count ? (
                <PaginationItem>
                  <PaginationNext
                    href={`/console/workflows/${params.id}?page=${
                      currentPage + 1
                    }`}
                  />
                </PaginationItem>
              ) : null}
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}
    </div>
  );
}
