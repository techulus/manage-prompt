"use server";

import { OpenAIModel } from "@/data/workflow";
import prisma from "@/utils/db";
import { getCompletion } from "@/utils/openai";
import { auth, clerkClient } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import slugify from "slugify";
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

const parseInputs = (inputs: string) =>
  Array.from(inputs.matchAll(/{{\s*(?<name>\w+)\s*}}/g))
    .reduce((acc: string[], match) => {
      const { name } = match.groups as { name: string };
      if (!acc.includes(name)) {
        acc.push(name);
      }
      return acc;
    }, [])
    .map((input) => ({ name: slugify(input, { lower: true }) }));

export async function saveWorkflow(formData: FormData) {
  const { userId, orgId } = auth();
  const user = await clerkClient.users.getUser(userId!);

  // parse template and extract variables
  const inputs = parseInputs(formData.get("template") as string);

  // validate form data
  await WorkflowSchema.validate({
    name: formData.get("name") as string,
    model: formData.get("model") as string,
    template: formData.get("template") as string,
    inputs,
  });

  await prisma.workflow.create({
    data: {
      createdBy: `${user?.firstName} ${user?.lastName}`,
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
  const id = Number(formData.get("id"));

  // parse template and extract variables
  const inputs = parseInputs(formData.get("template") as string);

  // validate form data
  await WorkflowSchema.validate({
    name: formData.get("name") as string,
    model: formData.get("model") as string,
    template: formData.get("template") as string,
    inputs,
  });

  await prisma.workflow.update({
    where: {
      id,
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
  revalidatePath(`/console/workflows/${id}`);
  redirect(`/console/workflows/${id}`);
}

export async function deleteWorkflow(formData: FormData) {
  const id = Number(formData.get("id"));

  await prisma.workflow.delete({
    where: {
      id,
    },
  });

  revalidatePath("/console/workflows");
  redirect("/console/workflows");
}

export async function toggleWorkflowState(formData: FormData) {
  const id = Number(formData.get("id"));
  const published = Number(formData.get("published"));

  await prisma.workflow.update({
    where: {
      id,
    },
    data: {
      published: !published,
    },
  });

  revalidatePath("/console/workflows");
  revalidatePath(`/console/workflows/${id}`);
  redirect(`/console/workflows/${id}`);
}

export async function runWorkflow(formData: FormData) {
  const id = Number(formData.get("id"));
  const model = formData.get("model") as OpenAIModel;
  const content = formData.get("content") as string;
  const userId = formData.get("userId") as string;

  if (!id) throw "ID is missing";

  const result = await getCompletion(model, content);

  if (!result) throw "No result returned from OpenAI";

  const user = await clerkClient.users.getUser(userId!);

  await prisma.workflowRun.create({
    data: {
      workflowId: id,
      result,
      createdBy: `${user?.firstName} ${user?.lastName}`,
    },
  });

  revalidatePath(`/console/workflows/${id}`);
}
