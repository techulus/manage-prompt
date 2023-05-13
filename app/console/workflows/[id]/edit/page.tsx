import PageTitle from "@/components/layout/page-title";
// import { experimental_useFormStatus as useFormStatus } from "react-dom";
import { WorkflowForm } from "@/components/console/workflow-form";
import { getWorkflowById } from "@/utils/useWorkflow";
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

  // doesn't work, https://github.com/vercel/next.js/issues/49232
  // const { pending } = useFormStatus();

  return (
    <>
      <PageTitle
        title={`Update ${workflow?.name}`}
        backUrl="/console/workflows"
      />
      <form className="px-6" action={updateWorkflow}>
        <WorkflowForm workflow={workflow} />

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
