import { WorkflowBranchItem } from "@/components/console/workflow/workflow-branch-item";
import EmptyState from "@/components/core/empty-state";
import PageSection from "@/components/core/page-section";
import { prisma } from "@/lib/utils/db";

interface Props {
  params: Promise<{
    workflowId: string;
  }>;
}

export default async function WorkflowBranches(props: Props) {
  const params = await props.params;

  const branches = await prisma.workflowBranch.findMany({
    where: {
      workflowId: +params.workflowId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <PageSection topInset>
      <EmptyState
        label="branch"
        show={!branches?.length}
        createLink={`/workflows/${params.workflowId}/branches/new`}
      />

      <ul className="divide-y">
        {branches?.map((branch) => (
          <WorkflowBranchItem key={branch.id} branch={branch} />
        ))}
      </ul>
    </PageSection>
  );
}
