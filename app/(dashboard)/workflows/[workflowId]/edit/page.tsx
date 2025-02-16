import { WorkflowForm } from "@/components/console/workflow/workflow-form";
import PageSection from "@/components/core/page-section";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CardContent, CardHeader } from "@/components/ui/card";
import { prisma } from "@/lib/utils/db";
import { Terminal } from "lucide-react";
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
      <CardHeader>
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            Any changes you make on main branch will be instantly rolled out to
            all users.
          </AlertDescription>
        </Alert>
      </CardHeader>
      <CardContent>
        <WorkflowForm workflow={workflow} action={updateWorkflow} />
      </CardContent>
    </PageSection>
  );
}
