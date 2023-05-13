import { WorkflowComposer } from "@/components/console/workflow-composer";
import PageTitle from "@/components/layout/page-title";
import { prisma } from "@/utils/db";
import { Workflow } from "@prisma/client";

interface Props {
  params: {
    slug: string;
  };
}

export const dynamic = "force-dynamic";

export default async function PublicWorkflow({ params }: Props) {
  const workflow: Workflow | null = await prisma.workflow.findUnique({
    where: {
      publicUrl: params.slug! as string,
    },
  });

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  return (
    <div className="relative">
      <PageTitle title={workflow.name} backUrl="/console/workflows" />

      <WorkflowComposer workflow={workflow} />
    </div>
  );
}
