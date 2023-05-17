import { WorkflowComposer } from "@/components/console/workflow-composer";
import { WorkflowRunItem } from "@/components/console/workflow-run-item";
import { ActionButton, DeleteButton } from "@/components/form/button";
import PageTitle from "@/components/layout/page-title";
import { getWorkflowAndRuns } from "@/utils/useWorkflow";
import {
  PauseCircleIcon,
  PencilIcon,
  PlayCircleIcon,
} from "@heroicons/react/20/solid";
import Link from "next/link";
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
}

export const dynamic = "force-dynamic";

export default async function WorkflowDetails({ params }: Props) {
  const { workflow, workflowRuns } = await getWorkflowAndRuns(
    Number(params.id)
  );

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  return (
    <div className="relative">
      <PageTitle title={workflow.name} backUrl="/console/workflows" />

      {/* Toolbar*/}
      <div className="hidden md:flex h-16 flex-col justify-center border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between py-3">
            {/* Left buttons */}
            <div className="isolate inline-flex rounded-md sm:space-x-3">
              <span className="inline-flex">
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
                          className="-ml-0.5 h-5 w-5 text-gray-400 hover:text-orange-400"
                          aria-hidden="true"
                        />
                      }
                      label="Deactivate"
                      className="hover:bg-orange-50"
                    />
                  ) : (
                    <ActionButton
                      icon={
                        <PlayCircleIcon
                          className="-ml-0.5 h-5 w-5 text-gray-400 hover:text-orange-400"
                          aria-hidden="true"
                        />
                      }
                      label="Activate"
                      className="hover:bg-green-50"
                    />
                  )}
                </form>

                <Link
                  href={`/console/workflows/${workflow.id}/edit`}
                  className="relative -ml-px hidden items-center gap-x-1.5 rounded-full bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:z-10 hover:bg-gray-50 focus:z-10 sm:inline-flex"
                >
                  <PencilIcon
                    className="-ml-0.5 h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                  Edit
                </Link>

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
                          className="-ml-0.5 h-5 w-5 text-gray-400 hover:text-orange-400"
                          aria-hidden="true"
                        />
                      }
                      label="Make private"
                      className="hover:bg-orange-50"
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
                          className="-ml-0.5 h-5 w-5 text-gray-400 hover:text-orange-400"
                          aria-hidden="true"
                        />
                      }
                      label="Make public"
                      className="hover:bg-orange-50"
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

      <WorkflowComposer workflow={workflow} />

      <ul
        role="list"
        className="border-t divide-y divide-gray-200 border-b border-gray-200"
      >
        {workflowRuns.map((run) => (
          // @ts-ignore React server component
          <WorkflowRunItem key={run.id} workflowRun={run} />
        ))}
      </ul>
    </div>
  );
}
