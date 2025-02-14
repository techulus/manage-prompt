import { WorkflowForm } from "@/components/console/workflow/workflow-form";
import PageSection from "@/components/core/page-section";
import { CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/utils/db";
import { updateWorkflow } from "../../actions";

interface Props {
  params: Promise<{
    workflowId: string;
  }>;
}

export default async function EditWorkflow(props: Props) {
  const params = await props.params;

  const workflow = await prisma.workflow.findUnique({
    where: {
      id: +params.workflowId,
    },
  });

  if (!workflow) {
    return <div>Workflow not found</div>;
  }

  return (
    <PageSection topInset>
      <CardContent>
        <WorkflowForm workflow={workflow} action={updateWorkflow} />
      </CardContent>
    </PageSection>
  );
}
