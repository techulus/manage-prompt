import { WorkflowForm } from "@/components/console/workflow-form";
import { ContentBlock } from "@/components/core/content-block";
import { SaveButton } from "@/components/form/button";
import PageTitle from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { getWorkflowById } from "@/lib/utils/useWorkflow";
import Link from "next/link";
import { updateWorkflow } from "../../actions";

interface Props {
  params: {
    id: string;
  };
}

export const dynamic = "force-dynamic";

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

      <form action={updateWorkflow}>
        <ContentBlock>
          <CardContent>
            <WorkflowForm workflow={workflow} />
          </CardContent>
          <CardFooter>
            <div className="flex items-center justify-end gap-x-6">
              <Link
                href="/console/workflows"
                className={buttonVariants({ variant: "link" })}
              >
                Cancel
              </Link>
              <SaveButton />
            </div>
          </CardFooter>
        </ContentBlock>
      </form>
    </>
  );
}
