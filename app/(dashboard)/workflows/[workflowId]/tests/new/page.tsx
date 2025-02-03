import { WorkflowTestForm } from "@/components/console/workflow/workflow-tests-form";
import PageSection from "@/components/core/page-section";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CardContent, CardHeader } from "@/components/ui/card";
import { prisma } from "@/lib/utils/db";
import { Terminal } from "lucide-react";
import { createTest } from "../../../actions";

export default async function CreateWorkflowTest(props: {
  params: Promise<{
    workflowId: string;
  }>;
}) {
  const { workflowId } = await props.params;

  const workflow = await prisma.workflow.findUnique({
    where: {
      id: +workflowId,
    },
  });

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  return (
    <PageSection topInset>
      <CardHeader>
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            A workflow is an AI prompt with a pre-defined set of inputs &
            configuration. It can be run using our API or the console.
          </AlertDescription>
        </Alert>
      </CardHeader>
      <CardContent>
        <WorkflowTestForm workflow={workflow} action={createTest} />
      </CardContent>
    </PageSection>
  );
}
