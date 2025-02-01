import { WorkflowComposer } from "@/components/console/workflow/workflow-composer";
import {
  WorkflowRunItem,
  type WorkflowRunWithUser,
} from "@/components/console/workflow/workflow-run-item";
import PageSection from "@/components/core/page-section";
import { ActionButton, DeleteButton } from "@/components/form/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { CardHeader } from "@/components/ui/card";
import { owner } from "@/lib/hooks/useOwner";
import { prisma } from "@/lib/utils/db";
import { getWorkflowAndRuns } from "@/lib/utils/useWorkflow";
import { PauseCircleIcon, PlayCircleIcon } from "@heroicons/react/20/solid";
import { DownloadIcon } from "@radix-ui/react-icons";
import { Terminal } from "lucide-react";
import Link from "next/link";
import { deleteWorkflow, toggleWorkflowState } from "../actions";

interface Props {
  params: Promise<{
    workflowId: string;
  }>;
}

export default async function WorkflowEditor(props: Props) {
  const params = await props.params;
  const { ownerId } = await owner();

  const { workflow, workflowRuns } = await getWorkflowAndRuns({
    id: Number(params.workflowId),
  });

  const apiSecretKey = await prisma.secretKey.findFirst({
    where: {
      ownerId,
    },
  });

  return (
    <>
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
        <WorkflowComposer
          workflow={workflow}
          apiSecretKey={apiSecretKey?.key}
        />
      </PageSection>

      {workflowRuns?.length ? (
        <PageSection>
          <CardHeader>
            <h3 className="text-lg font-semibold">Last Run</h3>
          </CardHeader>
          <ul className="divide-y">
            <WorkflowRunItem
              workflowRun={workflowRuns[0] as WorkflowRunWithUser}
            />
          </ul>
        </PageSection>
      ) : null}
    </>
  );
}
