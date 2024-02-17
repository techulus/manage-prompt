"use server";

import { WorkflowInput } from "@/data/workflow";
import { owner } from "@/lib/hooks/useOwner";
import { prisma } from "@/lib/utils/db";
import { runLlamaModel } from "@/lib/utils/llama";
import { runMixtralModel } from "@/lib/utils/mixtral";
import { getCompletion } from "@/lib/utils/openai";
import { isSubscriptionActive, reportUsage } from "@/lib/utils/stripe";
import { EventName, logEvent } from "@/lib/utils/tinybird";
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

  const created = await prisma.workflow.create({
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

  redirect(`/console/workflows/${created.id}`);
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
  const model = formData.get("model") as string;
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

  let response;
  switch (model) {
    case "llama-2-70b-chat":
      response = await runLlamaModel(content, instruction);
      break;
    case "mixtral-8x7b-instruct-v0.1":
      response = await runMixtralModel(content);
      break;
    default:
      response = await getCompletion(model, content);
  }

  const { result, rawResult, totalTokenCount } = response;

  if (!result) throw "No result returned from OpenAI";

  await Promise.all([
    prisma.workflowRun.create({
      data: {
        result,
        rawRequest: JSON.parse(JSON.stringify({ model, content, instruction })),
        rawResult: JSON.parse(JSON.stringify(rawResult)),
        totalTokenCount,
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
    }),
    reportUsage(
      organization?.stripe?.subscription as unknown as Stripe.Subscription,
      totalTokenCount
    ),
    logEvent(EventName.RunWorkflow, {
      workflow_id: id,
      owner_id: ownerId,
      model,
      total_tokens: totalTokenCount,
    }),
  ]);

  redirect(`/console/workflows/${id}`);
}
