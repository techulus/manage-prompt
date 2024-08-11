import { WorkflowForm } from "@/components/console/workflow/workflow-form";
import PageSection from "@/components/core/page-section";
import PageTitle from "@/components/layout/page-title";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CardContent, CardHeader } from "@/components/ui/card";
import { getWorkflowById } from "@/lib/utils/useWorkflow";
import { Terminal } from "lucide-react";
import { updateWorkflow } from "../../actions";

interface Props {
  params: {
    id: string;
  };
}

export default async function EditWorkflow({ params }: Props) {
  const workflow = await getWorkflowById(Number(params.id));

  if (!workflow) {
    return <div>Workflow not found</div>;
  }

  return (
    <>
      <PageTitle
        title={`Update ${workflow?.name}`}
        backUrl="/console/workflows"
      />

      <PageSection topInset>
        <CardHeader>
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
              Updates to the workflow may take upto a minute to reflect in the
              API.
            </AlertDescription>
          </Alert>
        </CardHeader>
        <CardContent>
          <WorkflowForm workflow={workflow} action={updateWorkflow} />
        </CardContent>
      </PageSection>
    </>
  );
}
