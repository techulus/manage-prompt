import { WorkflowForm } from "@/components/console/workflow-form";
import { SaveButton } from "@/components/form/button";
import PageTitle from "@/components/layout/page-title";
import Link from "next/link";
import { saveWorkflow } from "../actions";

export default function CreateWorkflow() {
  return (
    <>
      <PageTitle title="Create Workflow" backUrl="/console/workflows" />

      <div className="flex flex-col xl:mt-4 rounded-md mx-auto max-w-7xl lg:border border-gray-200 dark:border-gray-800">
        <form className="px-6" action={saveWorkflow}>
          <WorkflowForm />

          <div className="mt-6 flex items-center justify-end gap-x-6">
            <Link
              href="/console/workflows"
              className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-200"
            >
              Cancel
            </Link>
            <SaveButton />
          </div>
        </form>
      </div>
    </>
  );
}
