import { WorkflowComposer } from "@/components/console/workflow/workflow-composer";
import { WorkflowUsageCharts } from "@/components/console/workflow/workflow-usage-charts";
import PageSection from "@/components/core/page-section";
import { ActionButton, DeleteButton } from "@/components/form/button";
import PageTitle from "@/components/layout/page-title";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardHeader } from "@/components/ui/card";
import { type AIModel, AIModelToLabel } from "@/data/workflow";
import { owner } from "@/lib/hooks/useOwner";
import { getWorkflowRunStats } from "@/lib/utils/analytics";
import { prisma } from "@/lib/utils/db";
import { getWorkflowAndRuns } from "@/lib/utils/useWorkflow";
import { PauseCircleIcon, PlayCircleIcon } from "@heroicons/react/20/solid";
import { DownloadIcon } from "@radix-ui/react-icons";
import { Terminal } from "lucide-react";
import Link from "next/link";
import { deleteWorkflow, toggleWorkflowState } from "../actions";

interface Props {
  params: {
    workflowId: string;
  };
}

export const maxDuration = 120;

export default async function WorkflowDetails({ params }: Props) {
  const { ownerId } = await owner();

  const { workflow } = await getWorkflowAndRuns({
    id: Number(params.workflowId),
    skipWorkflowRun: false,
  });

  const usageData = await getWorkflowRunStats(workflow.id);
  const totalTokensConsumed = usageData.reduce(
    (acc, run) => acc + run.tokens,
    0
  );

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
        backUrl="/workflows"
        actionLabel="Edit"
        actionLink={`/workflows/${workflow.id}/edit`}
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
                    href={`/workflows/${workflow.id}/export`}
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
          <h3 className="text-lg font-semibold">Usage (Last 30 days)</h3>
        </CardHeader>
        <CardContent>
          <div className="flex-row items-center space-x-2">
            <WorkflowUsageCharts usageData={usageData} />

            <div className="flex flex-col md:flex-row justify-between space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Total Tokens</span>
                <span className="text-2xl font-semibold">
                  {totalTokensConsumed.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Estimated Cost</span>
                <span className="text-2xl font-semibold">
                  $
                  {(totalTokensConsumed * 0.00001)
                    .toPrecision(2)
                    .toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </PageSection>

      <PageSection>
        <WorkflowComposer
          workflow={workflow}
          apiSecretKey={apiSecretKey?.key}
        />
      </PageSection>
    </div>
  );
}
