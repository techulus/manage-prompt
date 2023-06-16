import { WorkflowComposer } from "@/components/console/workflow-composer";
import { WorkflowRunItem } from "@/components/console/workflow-run-item";
import { ContentBlock } from "@/components/core/content-block";
import { ActionButton, DeleteButton } from "@/components/form/button";
import PageTitle from "@/components/layout/page-title";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LIMIT, getWorkflowAndRuns } from "@/lib/utils/useWorkflow";
import { PauseCircleIcon, PlayCircleIcon } from "@heroicons/react/20/solid";
import { Terminal } from "lucide-react";
import {
  deleteWorkflow,
  makeWorkflowPrivate,
  makeWorkflowPublic,
  toggleWorkflowState,
} from "../actions";

interface Props {
  params: {
    id: string;
  };
  searchParams: {
    page: string;
  };
}

export const dynamic = "force-dynamic";

export default async function WorkflowDetails({ params, searchParams }: Props) {
  const currentPage = searchParams.page ? parseInt(searchParams.page) : 1;
  const { workflow, workflowRuns, count } = await getWorkflowAndRuns(
    Number(params.id),
    currentPage
  );

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  return (
    <div className="relative">
      <PageTitle
        title={workflow.name}
        backUrl="/console/workflows"
        actionLabel="Edit"
        actionLink={`/console/workflows/${workflow.id}/edit`}
      />

      {!workflow.published ? (
        <Alert variant="destructive" className="mx-auto max-w-7xl mt-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            This workflow is not published and hence cannot be run.
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Toolbar*/}
      <ContentBlock>
        <div className="hidden md:flex h-12 flex-col justify-center border-b border-gray-200 dark:border-gray-800">
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
                            className="mr-2 h-5 w-5"
                            aria-hidden="true"
                          />
                        }
                        label="Deactivate"
                        className="hover:bg-orange-50 hover:text-orange-600 dark:hover:text-orange-500"
                      />
                    ) : (
                      <ActionButton
                        icon={
                          <PlayCircleIcon
                            className="mr-2 h-5 w-5"
                            aria-hidden="true"
                          />
                        }
                        label="Activate"
                        className="hover:bg-green-50 hover:text-green-600 dark:hover:text-green-500"
                      />
                    )}
                  </form>

                  {workflow.publicUrl ? (
                    <form action={makeWorkflowPrivate}>
                      <input
                        className="hidden"
                        type="text"
                        name="id"
                        defaultValue={workflow.id}
                      />
                      <ActionButton
                        icon={
                          <PlayCircleIcon
                            className="mr-2 h-5 w-5"
                            aria-hidden="true"
                          />
                        }
                        label="Make private"
                        className="hover:bg-orange-50 hover:text-orange-600 dark:hover:text-orange-500"
                      />
                    </form>
                  ) : (
                    <form action={makeWorkflowPublic}>
                      <input
                        className="hidden"
                        type="text"
                        name="id"
                        defaultValue={workflow.id}
                      />
                      <ActionButton
                        icon={
                          <PlayCircleIcon
                            className="mr-2 h-5 w-5"
                            aria-hidden="true"
                          />
                        }
                        label="Make public"
                        className="hover:bg-orange-50 hover:text-orange-600 dark:hover:text-orange-500"
                      />
                    </form>
                  )}
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
      </ContentBlock>

      <ContentBlock>
        <WorkflowComposer workflow={workflow} />
      </ContentBlock>

      {workflowRuns.length ? (
        <ContentBlock>
          <ul
            role="list"
            className="border-t divide-y divide-gray-200 dark:divide-gray-800 border-b border-gray-200 dark:border-gray-800"
          >
            {workflowRuns.map((run) => (
              // @ts-ignore React server component
              <WorkflowRunItem key={run.id} workflowRun={run} />
            ))}
          </ul>

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
                of <span className="font-medium">{count}</span> workflow runs
              </p>
            </div>

            <div className="flex flex-1 justify-between sm:justify-end">
              {currentPage > 1 ? (
                <form action={`/console/workflows/${workflow.id}`}>
                  <input type="hidden" name="page" value={currentPage - 1} />
                  <button
                    type="submit"
                    className="relative inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 focus-visible:outline-offset-0"
                  >
                    Previous
                  </button>
                </form>
              ) : null}

              {(currentPage - 1) * LIMIT + workflowRuns.length < count ? (
                <form action={`/console/workflows/${workflow.id}`}>
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
        </ContentBlock>
      ) : null}
    </div>
  );
}
