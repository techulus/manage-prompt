import { DownloadIcon } from "@radix-ui/react-icons";
import { PauseCircleIcon, PlayCircleIcon, Terminal } from "lucide-react";
import Link from "next/link";
import { WorkflowBranchPicker } from "@/components/console/workflow/workflow-branch-picker";
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
import { deleteWorkflow, toggleWorkflowState } from "../actions";

interface Props {
  params: Promise<{
    workflowId: string;
  }>;
  searchParams: Promise<{
    branch: string;
  }>;
}

export default async function WorkflowEditor(props: Props) {
  const [params, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ]);

  const { ownerId } = await owner();

  const [{ workflow, workflowRuns }, apiSecretKey, branches] =
    await Promise.all([
      getWorkflowAndRuns({
        id: Number(params.workflowId),
        branch: searchParams.branch,
      }),
      prisma.secretKey.findFirst({
        where: {
          ownerId,
        },
      }),
      prisma.workflowBranch.findMany({
        select: {
          shortId: true,
        },
        where: {
          workflowId: +params.workflowId,
          status: "open",
        },
      }),
    ]);

  return (
    <>
      {/* Toolbar*/}
      <PageSection bottomMargin className="-mt-4">
        <div className="flex flex-col justify-center">
          <div className="flex justify-between">
            {/* Left buttons */}
            <div className="isolate inline-flex sm:space-x-3">
              <span className="inline-flex space-x-1">
                <WorkflowBranchPicker branches={branches} workflow={workflow} />

                <Link
                  href={`/workflows/${workflow.id}/export`}
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                  prefetch={false}
                >
                  <DownloadIcon className="mr-1 h-4 w-4" aria-hidden="true" />
                  Export
                </Link>
              </span>
            </div>

            {/* Right buttons */}
            <nav aria-label="Pagination">
              <span className="isolate inline-flex sm:space-x-3">
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
                      size="sm"
                      icon={
                        <PauseCircleIcon
                          className="mr-1 h-4 w-4"
                          aria-hidden="true"
                        />
                      }
                      label="Deactivate"
                    />
                  ) : (
                    <ActionButton
                      size="sm"
                      icon={
                        <PlayCircleIcon
                          className="mr-1 h-4 w-4"
                          aria-hidden="true"
                        />
                      }
                      label="Activate"
                    />
                  )}
                </form>

                <form action={deleteWorkflow}>
                  <input
                    className="hidden"
                    type="text"
                    name="id"
                    defaultValue={workflow.id}
                  />
                  <DeleteButton size="sm" compact />
                </form>
              </span>
            </nav>
          </div>
        </div>
      </PageSection>

      {!workflow.published ? (
        <Alert variant="destructive" className="mx-auto max-w-7xl mt-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            This workflow is not active and hence cannot be run.
          </AlertDescription>
        </Alert>
      ) : null}

      <PageSection>
        <WorkflowComposer
          workflow={workflow}
          apiSecretKey={apiSecretKey?.key}
          branch={searchParams.branch}
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
