import { updateWorkflowBranch } from "@/app/(dashboard)/workflows/actions";
import { WorkflowForm } from "@/components/console/workflow/workflow-form";
import PageSection from "@/components/core/page-section";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CardContent, CardHeader } from "@/components/ui/card";
import { prisma } from "@/lib/utils/db";
import { Terminal } from "lucide-react";

interface Props {
  params: Promise<{
    workflowId: string;
    branchId: string;
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

  const workflowBranch = await prisma.workflowBranch.findUnique({
    where: {
      shortId_workflowId: {
        workflowId: +params.workflowId,
        shortId: params.branchId,
      },
    },
  });
  if (!workflowBranch) {
    return <div>Branch not found</div>;
  }

  const workflowItem = {
    ...workflow,
    model: workflowBranch.model,
    template: workflowBranch.template,
  };

  return (
    <PageSection topInset>
      <CardHeader>
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            The inputs must match the inputs of the parent workflow.
          </AlertDescription>
        </Alert>
      </CardHeader>
      <CardContent>
        <WorkflowForm
          workflow={workflowItem}
          action={updateWorkflowBranch}
          branchId={workflowBranch.id}
          branchShortId={workflowBranch.shortId}
          branchMode
        />
      </CardContent>
    </PageSection>
  );
}
