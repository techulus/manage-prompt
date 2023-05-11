"use server";

import { OpenAIModel } from "@/data/workflow";
import prisma from "@/utils/db";
import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as Yup from "yup";

const WorkflowSchema = Yup.object().shape({
  name: Yup.string()
    .required("Name cannot be empty")
    .min(2, "Name too Short!")
    .max(75, "Name too Long!"),
  template: Yup.string()
    .required("Template cannot be empty")
    .min(2, "Template too Short!")
    .max(9669, "Template too Long!"),
  model: Yup.mixed<OpenAIModel>()
    .oneOf(Object.values(OpenAIModel))
    .required("Select valid model"),
  inputs: Yup.array().of(
    Yup.object().shape({
      name: Yup.string(),
    })
  ),
});

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

  // validate form data
  await WorkflowSchema.validate({
    name: formData.get("name") as string,
    model: formData.get("model") as string,
    template: formData.get("template") as string,
    inputs,
  });

  await prisma.workflow.create({
    data: {
      createdBy: userId ?? "",
      ownerId: orgId ?? userId ?? "",
      published: true,
      name: formData.get("name") as string,
      model: formData.get("model") as string,
      template: formData.get("template") as string,
      inputs,
    },
  });

  revalidatePath("/console/workflows");
  redirect("/console/workflows");
}

export async function updateWorkflow(formData: FormData) {
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

  // validate form data
  await WorkflowSchema.validate({
    name: formData.get("name") as string,
    model: formData.get("model") as string,
    template: formData.get("template") as string,
    inputs,
  });

  await prisma.workflow.update({
    where: {
      id: Number(formData.get("id")),
    },
    data: {
      published: true,
      name: formData.get("name") as string,
      model: formData.get("model") as string,
      template: formData.get("template") as string,
      inputs,
    },
  });

  revalidatePath("/console/workflows");
  redirect("/console/workflows");
}
