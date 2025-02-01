import PageTitle from "@/components/layout/page-title";
import { type AIModel, AIModelToLabel } from "@/data/workflow";
import { getWorkflowAndRuns } from "@/lib/utils/useWorkflow";

export const fetchCache = "force-no-store";
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{
    workflowId: string;
  }>;
  children: React.ReactNode;
}

export default async function WorkflowLayout(props: Props) {
  const params = await props.params;

  const { workflow } = await getWorkflowAndRuns({
    id: +params.workflowId,
    skipWorkflowRun: true,
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
      {props.children}
    </div>
  );
}
