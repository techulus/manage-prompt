"use server";

import { type WorkflowInput, modelToProvider } from "@/data/workflow";
import { owner } from "@/lib/hooks/useOwner";
import { getCompletion } from "@/lib/utils/ai";
import { ByokService } from "@/lib/utils/byok-service";
import { prisma } from "@/lib/utils/db";
import {
  hasExceededSpendLimit,
  isSubscriptionActive,
  reportUsage,
} from "@/lib/utils/stripe";
import { EventName, logEvent } from "@/lib/utils/tinybird";
import { WorkflowSchema, translateInputs } from "@/lib/utils/workflow";
import { createId } from "@paralleldrive/cuid2";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type Stripe from "stripe";
import { fromZodError } from "zod-validation-error";

export async function createWorkflow(formData: FormData) {
  const { userId, ownerId } = await owner();
  if (!userId || !ownerId) {
    return {
      error: "User is missing",
    };
  }

  const name = formData.get("name") as string;
  const model = formData.get("model") as string;
  const template = formData.get("template") as string;
  const instruction = (formData.get("instruction") as string) ?? "";
  const modelSettings = (formData.get("modelSettings") as string) ?? null;
  const cacheControlTtl = Number(formData.get("cacheControlTtl")) ?? 0;

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
    cacheControlTtl,
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
      cacheControlTtl,
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
  const cacheControlTtl = Number(formData.get("cacheControlTtl")) ?? 0;

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
    cacheControlTtl,
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
      cacheControlTtl,
    },
  });

  revalidatePath("/console/workflows");
  revalidatePath(`/console/workflows/${id}/edit`);
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
  const { userId, ownerId } = await owner();

  const id = Number(formData.get("id"));
  let inputValues: Record<string, string> = {};

  try {
    inputValues = JSON.parse(formData.get("inputs") as string);
  } catch (e) {
    throw "Invalid input values";
  }

  try {
    if (!id) throw "ID is missing";
    if (!userId || !ownerId) throw "User/Owner ID is missing";

    const organization = await prisma.organization.findUnique({
      include: {
        stripe: true,
        UserKeys: true,
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
      organization?.credits !== 0 &&
      (await hasExceededSpendLimit(
        organization?.spendLimit,
        organization?.stripe?.customerId,
      ))
    ) {
      throw "Spend limit exceeded";
    }

    const workflow = await prisma.workflow.findUnique({
      where: {
        id,
      },
      select: {
        modelSettings: true,
        template: true,
        model: true,
        inputs: true,
      },
    });

    if (!workflow) throw "Workflow not found";

    const inputs = workflow.inputs as unknown as WorkflowInput[];
    const model = workflow.model;
    const content = await translateInputs({
      inputs,
      inputValues,
      template: workflow.template,
    });

    const response = await getCompletion(
      model,
      content,
      JSON.parse(JSON.stringify(workflow.modelSettings)),
      organization?.UserKeys,
    );

    let { result, rawResult, totalTokenCount } = response;
    if (!result) throw "No result returned from OpenAI";

    const byokService = new ByokService();
    const isEligibleForByokDiscount = !!byokService.get(
      modelToProvider[model],
      organization?.UserKeys,
    );
    if (isEligibleForByokDiscount) {
      totalTokenCount = Math.floor(totalTokenCount * 0.3);
    }

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
        totalTokenCount,
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
