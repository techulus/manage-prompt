import { WorkflowItem } from "@/components/console/workflow-item";
import PageTitle from "@/components/layout/page-title";
import { getWorkflowsForOwner } from "@/utils/useWorkflow";
import { auth } from "@clerk/nextjs/app-beta";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: {
    search: string;
  };
}

export default async function Workflows({ searchParams }: Props) {
  const { userId, orgId } = auth();

  const workflows = await getWorkflowsForOwner({
    orgId: orgId!,
    userId: userId!,
    search: searchParams.search,
  });

  return (
    <>
      <PageTitle
        title={
          searchParams.search ? `Search '${searchParams.search}'` : "Workflows"
        }
        backUrl={searchParams.search ? "/console/workflows" : undefined}
      />
      <ul
        role="list"
        className="divide-y divide-gray-200 border-b border-gray-200"
      >
        {workflows.length === 0 && (
          <div className="p-6">
            <Link
              href="/console/workflows/new"
              className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0v6m0-6h6m-6 0h-6"
                />
              </svg>
              <span className="mt-2 block text-sm font-semibold text-gray-900">
                Create a new workflow
              </span>
            </Link>
          </div>
        )}

        {workflows.map((workflow) => (
          // @ts-ignore React server component
          <WorkflowItem key={workflow.id} workflow={workflow} />
        ))}
      </ul>
    </>
  );
}
