"use server";

import { WorkflowInput } from "@/data/workflow";
import { owner } from "@/lib/hooks/useOwner";
import { getCompletion } from "@/lib/utils/ai";
import { prisma } from "@/lib/utils/db";
import {
  hasExceededSpendLimit,
  isSubscriptionActive,
  reportUsage,
} from "@/lib/utils/stripe";
import { EventName, logEvent } from "@/lib/utils/tinybird";
import { WorkflowSchema } from "@/lib/utils/workflow";
import { createId } from "@paralleldrive/cuid2";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { fromZodError } from "zod-validation-error";

export async function createWorkflow(formData: FormData) {
  const { userId, ownerId } = owner();

  const name = formData.get("name") as string;
  const model = formData.get("model") as string;
  const template = formData.get("template") as string;
  const instruction = (formData.get("instruction") as string) ?? "";
  const modelSettings = (formData.get("modelSettings") as string) ?? null;

  let inputs: WorkflowInput[] = [];
  try {
    inputs = JSON.parse((formData.get("inputs") as string) ?? "");
  } catch (e) {
    inputs = [];
  }

  const validationResult = WorkflowSchema.safeParse({
    name,
    model,
    modelSettings,
    template,
    instruction,
    inputs,
  });

  if (!validationResult.success) {
    return {
      error: fromZodError(validationResult.error).toString(),
    };
  }

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
      shortId: `wf_${createId()}`,
      name,
      model,
      modelSettings: modelSettings ? JSON.parse(modelSettings) : null,
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
  const modelSettings = (formData.get("modelSettings") as string) ?? null;

  let inputs: WorkflowInput[] = [];
  try {
    inputs = JSON.parse((formData.get("inputs") as string) ?? "");
  } catch (e) {
    inputs = [];
  }

  const validationResult = WorkflowSchema.safeParse({
    name,
    model,
    modelSettings,
    template,
    instruction,
    inputs,
  });

  if (!validationResult.success) {
    return {
      error: fromZodError(validationResult.error).toString(),
    };
  }

  await prisma.workflow.update({
    where: {
      id,
    },
    data: {
      published: true,
      name,
      model,
      modelSettings: modelSettings ? JSON.parse(modelSettings) : null,
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

  try {
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

    if (
      await hasExceededSpendLimit(
        organization?.spendLimit,
        organization?.stripe?.customerId
      )
    ) {
      throw "Spend limit exceeded";
    }

    const workflow = await prisma.workflow.findUnique({
      where: {
        id,
      },
      select: {
        modelSettings: true,
      },
    });

    const response = await getCompletion(
      model,
      content,
      workflow.modelSettings
    );

    const { result, rawResult, totalTokenCount } = response;

    if (!result) throw "No result returned from OpenAI";

    await Promise.all([
      prisma.workflowRun.create({
        data: {
          result,
          rawRequest: JSON.parse(JSON.stringify({ model, content })),
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
        ownerId,
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
  } catch (error) {
    console.error(error);
    return {
      error:
        error instanceof Error ? error?.message : "Oops! Something went wrong.",
    };
  }

  redirect(`/console/workflows/${id}`);
}
