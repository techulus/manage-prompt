import PageTitle from "@/components/layout/page-title";
import { WorkflowModel } from "@/data/workflow";
import prisma from "@/utils/db";
import { auth } from "@clerk/nextjs/app-beta";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// TODO Validate
// const WorkflowSchema = Yup.object().shape({
//   name: Yup.string()
//     .required("Name cannot be empty")
//     .min(2, "Name too Short!")
//     .max(75, "Name too Long!"),
//   template: Yup.string()
//     .required("Template cannot be empty")
//     .min(2, "Template too Short!")
//     .max(9669, "Template too Long!"),
//   model: Yup.mixed<WorkflowModel>()
//     .oneOf(Object.values(WorkflowModel))
//     .required("Select valid model"),
//   inputs: Yup.array().of(
//     Yup.object().shape({
//       name: Yup.string(),
//     })
//   ),
// });

export default function CreateWorkflow() {
  const { userId, orgId } = auth();

  async function saveWorkflow(formData: FormData) {
    "use server";

    // parse template and extract variables
    const inputs = Array.from(
      (formData.get("template") as string).matchAll(/{{\s*(?<name>\w+)\s*}}/g)
    ).reduce((acc: string[], match) => {
      const { name } = match.groups as { name: string };
      if (!acc.includes(name)) {
        acc.push(name);
      }
      return acc;
    }, []);

    await prisma.workflow.create({
      data: {
        createdBy: userId ?? "",
        ownerId: orgId ?? userId ?? "",
        name: formData.get("name") as string,
        model: formData.get("model") as WorkflowModel,
        template: formData.get("template") as string,
        inputs,
      },
    });

    revalidatePath("/console/workflows");
    redirect("/console/workflows");
  }

  return (
    <>
      <PageTitle title="Create Workflow" />
      <form className="px-6" action={saveWorkflow}>
        <div className="space-y-12 sm:space-y-16">
          <div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              A workflow is a programmable AI prompt with a pre-defined set of
              inputs.
            </p>

            <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
              <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
                >
                  Name
                </label>
                <div className="mt-2 sm:col-span-2 sm:mt-0">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:max-w-xs sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
                <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                  <label
                    htmlFor="template"
                    className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
                  >
                    Template
                  </label>
                  <div className="mt-2 sm:col-span-2 sm:mt-0">
                    <textarea
                      id="template"
                      name="template"
                      rows={3}
                      className="block w-full max-w-2xl rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    />
                    <p className="mt-3 text-sm leading-6 text-gray-600">
                      Write the prompt template, you can insert varibles using
                      this syntax <span>{`{{ variable }}`}</span>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                <label
                  htmlFor="model"
                  className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
                >
                  Model
                </label>
                <div className="mt-2 sm:col-span-2 sm:mt-0">
                  <select
                    id="model"
                    name="model"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:max-w-xs sm:text-sm sm:leading-6 capitalize"
                  >
                    {Object.keys(WorkflowModel).map((model) => (
                      <option key={model} value={String(WorkflowModel[model])}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button
            type="button"
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Save
          </button>
        </div>
      </form>
    </>
  );
}
