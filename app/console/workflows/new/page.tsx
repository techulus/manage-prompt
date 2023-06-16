import { WorkflowForm } from "@/components/console/workflow-form";
import { ContentBlock } from "@/components/core/content-block";
import { SaveButton } from "@/components/form/button";
import PageTitle from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import { CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { saveWorkflow } from "../actions";

export default function CreateWorkflow() {
  return (
    <>
      <PageTitle title="Create Workflow" backUrl="/console/workflows" />

      <form action={saveWorkflow}>
        <ContentBlock>
          <CardHeader>
            <p>
              A workflow is a AI prompt with a pre-defined set of inputs &
              configuration.
            </p>
          </CardHeader>
          <CardContent>
            <WorkflowForm />
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
