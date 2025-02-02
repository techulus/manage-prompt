import { WorkflowForm } from "@/components/console/workflow/workflow-form";
import PageSection from "@/components/core/page-section";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CardContent, CardHeader } from "@/components/ui/card";
import { prisma } from "@/lib/utils/db";
import { Terminal } from "lucide-react";
import { createWorkflowBranch } from "../../../actions";

interface Props {
  params: Promise<{
    workflowId: string;
  }>;
}

export default async function CreateWorkflowBranch(props: Props) {
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
          workflow={workflow}
          action={createWorkflowBranch}
          branchMode
        />
      </CardContent>
    </PageSection>
  );
}
