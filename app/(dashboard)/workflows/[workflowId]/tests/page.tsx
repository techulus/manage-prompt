import { CheckCircle, CircleOff, CircleSlash, GitBranch } from "lucide-react";
import Link from "next/link";
import { WorkflowBranchPicker } from "@/components/console/workflow/workflow-branch-picker";
import EmptyState from "@/components/core/empty-state";
import { Spinner } from "@/components/core/loaders";
import PageSection from "@/components/core/page-section";
import { ActionButton, DeleteButton } from "@/components/form/button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { WorkflowTestCondition } from "@/data/workflow";
import { prisma } from "@/lib/utils/db";
import { deleteTest, runTests } from "../../actions";

interface Props {
  params: Promise<{
    workflowId: string;
  }>;
  searchParams: Promise<{
    branch: string;
  }>;
}

export default async function WorkflowTests(props: Props) {
  const [params, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ]);

  const [workflow, tests, branches] = await Promise.all([
    prisma.workflow.findUnique({
      where: {
        id: +params.workflowId,
      },
    }),
    prisma.workflowTest.findMany({
      include: {
        workflowRun: true,
      },
      where: {
        workflowId: +params.workflowId,
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
  if (!workflow) {
    throw new Error("Workflow not found");
  }

  return (
    <>
      {/* Toolbar*/}
      <PageSection bottomMargin className="-mt-4">
        <div className="flex flex-col justify-center">
          <div className="flex justify-between">
            <div className="isolate inline-flex sm:space-x-3">
              <span className="inline-flex space-x-1">
                <WorkflowBranchPicker branches={branches} workflow={workflow} />
              </span>
            </div>

            <nav aria-label="Pagination">
              <span className="isolate inline-flex sm:space-x-3">
                <Link
                  href={`/workflows/${params.workflowId}/tests/new`}
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  New
                </Link>

                <form action={runTests}>
                  <input type="hidden" name="id" value={params.workflowId} />
                  {searchParams.branch ? (
                    <input
                      type="hidden"
                      name="branch"
                      value={searchParams.branch}
                    />
                  ) : null}
                  <ActionButton
                    variant="default"
                    size="sm"
                    label="Run"
                    loadingLabel="Running"
                  />
                </form>
              </span>
            </nav>
          </div>
        </div>
      </PageSection>

      <PageSection>
        <EmptyState
          show={!tests.length}
          label="test"
          createLink={`/workflows/${params.workflowId}/tests/new`}
        />

        <div className="flex flex-col w-full divide-y">
          {tests.map((test) => (
            <div key={test.id} className="flex flex-col p-4">
              <div className="flex items-center">
                {test.status === "pass" ? (
                  <CheckCircle className="text-green-500" />
                ) : null}

                {test.status === "fail" ? (
                  <CircleSlash className="text-red-500" />
                ) : null}

                {test.status === "running" ? (
                  <Spinner className="text-orange-500" />
                ) : null}

                {test.status === "pending" ? (
                  <CircleOff className="text-gray-500" />
                ) : null}

                <span className="ml-2 text-gray-500">
                  <GitBranch className="h-4 w-4 inline mr-2" />
                  {test.workflowRun?.branchId ?? "main"}
                </span>

                <div className="ml-auto flex items-center">
                  <form action={deleteTest}>
                    <input type="hidden" name="id" value={test.id} />
                    <input
                      type="hidden"
                      name="workflowId"
                      value={params.workflowId}
                    />
                    <DeleteButton size="sm" compact />
                  </form>
                </div>
              </div>

              <div className="mt-2 font-mono text-xs whitespace-pre-wrap break-words">
                <Badge className="mr-2">Expected</Badge>
                Result for inputs{" "}
                <span className="font-mono text-xs">
                  {String(test.input) === "{}" ? "(empty)" : String(test.input)}
                </span>{" "}
                {WorkflowTestCondition[test.condition]} {test.output ?? ""}
              </div>

              {test.workflowRun ? (
                <div className="mt-2 font-mono text-xs whitespace-pre-wrap break-words">
                  <Badge className="mr-2">Actual</Badge>
                  {String(test.workflowRun.result)}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </PageSection>
    </>
  );
}
