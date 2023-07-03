"use server";

import { OpenAIModel, WorkflowInput } from "@/data/workflow";
import { prisma } from "@/lib/utils/db";
import { getCompletion } from "@/lib/utils/openai";
import { WorkflowSchema } from "@/lib/utils/workflow";
import { auth, clerkClient } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import slugify from "slugify";

export async function saveWorkflow(formData: FormData) {
  const { userId, orgId } = auth();
  const user = await clerkClient.users.getUser(userId!);

  const name = formData.get("name") as string;
  const model = formData.get("model") as string;
  const template = formData.get("template") as string;
  const instruction = (formData.get("instruction") as string) ?? "";

  let inputs: WorkflowInput[] = [];
  try {
    inputs = JSON.parse((formData.get("inputs") as string) ?? "");
  } catch (e) {
    inputs = [];
  }

  // validate form data
  await WorkflowSchema.validate({
    name,
    model,
    template,
    instruction,
    inputs,
  });

  await prisma.workflow.create({
    data: {
      user: {
        connect: {
          id: userId!,
        },
      },
      organization: {
        connect: {
          id: orgId ?? userId ?? "",
        },
      },
      published: true,
      name,
      model,
      template,
      instruction,
      inputs,
    },
  });

  revalidatePath(`/console/workflows`);
  redirect("/console/workflows");
}

export async function updateWorkflow(formData: FormData) {
  const id = Number(formData.get("id"));

  const name = formData.get("name") as string;
  const model = formData.get("model") as string;
  const template = formData.get("template") as string;
  const instruction = (formData.get("instruction") as string) ?? "";

  let inputs: WorkflowInput[] = [];
  try {
    inputs = JSON.parse((formData.get("inputs") as string) ?? "");
  } catch (e) {
    inputs = [];
  }

  // validate form data
  await WorkflowSchema.validate({
    name,
    model,
    template,
    instruction,
    inputs,
  });

  await prisma.workflow.update({
    where: {
      id,
    },
    data: {
      published: true,
      name,
      model,
      template,
      instruction,
      inputs,
    },
  });

  revalidatePath(`/console/workflows/${id}`);
  revalidatePath(`/console/workflows`);
  redirect(`/console/workflows/${id}`);
}

export async function deleteWorkflow(formData: FormData) {
  const id = Number(formData.get("id"));

  await prisma.workflow.delete({
    where: {
      id,
    },
  });

  revalidatePath(`/console/workflows/${id}`);
  revalidatePath(`/console/workflows`);
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

  revalidatePath(`/console/workflows/${id}`);
  revalidatePath(`/console/workflows`);
  redirect(`/console/workflows/${id}`);
}

export async function makeWorkflowPublic(formData: FormData) {
  const id = Number(formData.get("id"));

  const workflow = await prisma.workflow.findUnique({
    where: {
      id,
    },
  });

  await prisma.workflow.update({
    where: {
      id,
    },
    data: {
      publicUrl: slugify(`${id}-${workflow?.name}`, { lower: true }),
    },
  });

  revalidatePath(`/console/workflows/${id}`);
  revalidatePath(`/console/workflows`);
  redirect(`/console/workflows/${id}`);
}

export async function makeWorkflowPrivate(formData: FormData) {
  const id = Number(formData.get("id"));

  await prisma.workflow.update({
    where: {
      id,
    },
    data: {
      publicUrl: null,
    },
  });

  revalidatePath(`/console/workflows/${id}`);
  revalidatePath(`/console/workflows`);
  redirect(`/console/workflows/${id}`);
}

export async function runWorkflow(formData: FormData) {
  const id = Number(formData.get("id"));
  const model = formData.get("model") as OpenAIModel;
  const content = formData.get("content") as string;
  const instruction = formData.get("instruction") as string;
  const userId = formData.get("userId") as string;

  if (!id) throw "ID is missing";

  const { result, rawResult } = await getCompletion(
    model,
    content,
    instruction
  );

  if (!result) throw "No result returned from OpenAI";

  await prisma.workflowRun.create({
    data: {
      result,
      rawRequest: JSON.parse(JSON.stringify({ model, content, instruction })),
      rawResult: JSON.parse(JSON.stringify(rawResult)),
      user: {
        connect: {
          id: userId,
        },
      },
      workflow: {
        connect: {
          id,
        },
      },
    },
  });

  revalidatePath(`/console/workflows/${id}`);
  redirect(`/console/workflows/${id}`);
}

export async function copyWorkflow(formData: FormData) {
  const id = Number(formData.get("id"));
  const userId = formData.get("userId") as string;
  const orgId = formData.get("orgId") as string;

  if (!id) throw "ID is missing";

  const workflow = await prisma.workflow.findUnique({
    where: {
      id,
    },
  });

  if (!workflow) throw "Workflow not found";

  const { name, model, template, instruction, inputs } = workflow;

  const { id: newId } = await prisma.workflow.create({
    data: {
      name: `${name} (copy)`,
      model,
      template,
      instruction,
      inputs: JSON.parse(JSON.stringify(inputs)),
      published: true,
      user: {
        connect: {
          id: userId!,
        },
      },
      organization: {
        connect: {
          id: orgId ?? userId ?? "",
        },
      },
    },
  });

  revalidatePath(`/console/workflows/${newId}`);
  redirect(`/console/workflows/${newId}`);
}
