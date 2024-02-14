"use server";

import { AiModel, WorkflowInput } from "@/data/workflow";
import { owner } from "@/lib/hooks/useOwner";
import { prisma } from "@/lib/utils/db";
import { getCompletion } from "@/lib/utils/openai";
import { isSubscriptionActive, reportUsage } from "@/lib/utils/stripe";
import { WorkflowSchema } from "@/lib/utils/workflow";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import Stripe from "stripe";

export async function saveWorkflow(formData: FormData) {
  const { userId, ownerId } = owner();

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
          id: ownerId,
        },
      },
      published: true,
      shortId: `wf_${randomBytes(16).toString("hex")}`,
      name,
      model,
      template,
      instruction,
      inputs,
    },
  });

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

  redirect(`/console/workflows/${id}`);
}

export async function deleteWorkflow(formData: FormData) {
  const id = Number(formData.get("id"));

  await prisma.workflow.delete({
    where: {
      id,
    },
  });

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

  redirect(`/console/workflows/${id}`);
}

export async function runWorkflow(formData: FormData) {
  const { userId, ownerId } = owner();

  const id = Number(formData.get("id"));
  const model = formData.get("model") as AiModel;
  const content = formData.get("content") as string;
  const instruction = formData.get("instruction") as string;

  if (!id) throw "ID is missing";
  if (!userId && !ownerId) throw "User/Owner ID is missing";

  const organization = await prisma.organization.findUnique({
    include: {
      stripe: true,
    },
    where: {
      id: ownerId,
    },
  });

  if (
    organization?.credits === 0 &&
    !isSubscriptionActive(organization?.stripe?.subscription)
  )
    throw "No credits remaining";

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

  await reportUsage(
    organization?.stripe?.subscription as unknown as Stripe.Subscription,
    rawResult?.usage?.total_tokens ?? 0
  );

  redirect(`/console/workflows/${id}`);
}
