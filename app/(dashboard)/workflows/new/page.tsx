import { WorkflowForm } from "@/components/console/workflow/workflow-form";
import PageSection from "@/components/core/page-section";
import PageTitle from "@/components/layout/page-title";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CardContent, CardHeader } from "@/components/ui/card";
import { Terminal } from "lucide-react";
import { createWorkflow } from "../actions";

export default function CreateWorkflow() {
  return (
    <>
      <PageTitle title="Create Workflow" backUrl="/workflows" />

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
          <WorkflowForm action={createWorkflow} />
        </CardContent>
      </PageSection>
    </>
  );
}
