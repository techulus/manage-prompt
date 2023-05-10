"use server";

import prisma from "@/utils/db";
import { auth } from "@clerk/nextjs";
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

export async function saveWorkflow(formData: FormData) {
  const { userId, orgId } = auth();

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
      model: formData.get("model") as string,
      template: formData.get("template") as string,
      inputs,
    },
  });

  revalidatePath("/console/workflows");
  redirect("/console/workflows");
}
