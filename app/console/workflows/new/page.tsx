import { WorkflowForm } from "@/components/console/workflow-form";
import PageTitle from "@/components/layout/page-title";
import Link from "next/link";
import { saveWorkflow } from "../actions";

export default function CreateWorkflow() {
  // doesn't work, https://github.com/vercel/next.js/issues/49232
  // const { pending } = useFormStatus();

  return (
    <>
      <PageTitle title="Create Workflow" backUrl="/console/workflows" />
      <form className="px-6" action={saveWorkflow}>
        <WorkflowForm />

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <Link
            href="/console/workflows"
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            // disabled={pending}
          >
            {/* {pending ? <Spinner message="Saving..." /> : "Save"} */}
            Save
          </button>
        </div>
      </form>
    </>
  );
}
