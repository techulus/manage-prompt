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
import {
  WorkflowBranchSchema,
  WorkflowSchema,
  WorkflowTestSchema,
  translateInputs,
} from "@/lib/utils/workflow";
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

  redirect(`/workflows/${created.id}`);
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

  revalidatePath("/workflows");
  revalidatePath(`/workflows/${id}/edit`);
  redirect(`/workflows/${id}`);
}

export async function deleteWorkflow(formData: FormData) {
  const id = Number(formData.get("id"));

  await prisma.workflow.delete({
    where: {
      id,
    },
  });

  redirect("/workflows");
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

  redirect(`/workflows/${id}`);
}

export async function runWorkflow(formData: FormData) {
  const { userId, ownerId } = await owner();

  const id = Number(formData.get("id"));
  const branch = formData.get("branch") as string;
  let inputValues: Record<string, string> = {};

  let redirectUrl = `/workflows/${id}`;

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

    const workflowBranch = branch
      ? await prisma.workflowBranch.findFirst({
          where: {
            shortId: branch,
            workflowId: id,
          },
        })
      : null;

    if (workflowBranch) {
      workflow.model = workflowBranch.model;
      workflow.template = workflowBranch.template;

      redirectUrl = `/workflows/${id}?branch=${workflowBranch.shortId}`;
    }

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
          branchId: workflowBranch?.shortId,
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
    ]);
  } catch (error) {
    console.error(error);
    return {
      error:
        error instanceof Error ? error?.message : "Oops! Something went wrong.",
    };
  }

  redirect(redirectUrl);
}

export async function createWorkflowBranch(formData: FormData) {
  const { userId, ownerId } = await owner();
  if (!userId || !ownerId) {
    return {
      error: "User is missing",
    };
  }

  const id = Number(formData.get("id"));
  const branchShortId = formData.get("branchShortId") as string;
  const model = formData.get("model") as string;
  const template = formData.get("template") as string;
  const instruction = (formData.get("instruction") as string) ?? "";
  const modelSettings = (formData.get("modelSettings") as string) ?? null;

  const validationResult = WorkflowBranchSchema.safeParse({
    shortId: branchShortId,
    model,
    modelSettings,
    template,
    instruction,
  });

  if (!validationResult.success) {
    return {
      error: fromZodError(validationResult.error).toString(),
    };
  }

  const inputs = (formData.get("inputs") as string) ?? "";

  const workflow = await prisma.workflow.findUnique({
    where: {
      id,
    },
  });
  if (!workflow) {
    return {
      error: "Workflow not found",
    };
  }

  if (inputs !== JSON.stringify(workflow.inputs)) {
    return {
      error: "Inputs mismatch",
    };
  }

  await prisma.workflowBranch.create({
    data: {
      workflow: {
        connect: {
          id,
        },
      },
      shortId: branchShortId ?? createId(),
      model,
      modelSettings: modelSettings ? JSON.parse(modelSettings) : null,
      template,
      instruction,
    },
  });

  redirect(`/workflows/${id}/branches`);
}

export async function updateWorkflowBranch(formData: FormData) {
  const id = Number(formData.get("id"));
  const branchId = Number(formData.get("branchId"));
  const branchShortId = formData.get("branchShortId") as string;
  const model = formData.get("model") as string;
  const template = formData.get("template") as string;
  const instruction = (formData.get("instruction") as string) ?? "";
  const modelSettings = (formData.get("modelSettings") as string) ?? null;

  const validationResult = WorkflowBranchSchema.safeParse({
    shortId: branchShortId,
    model,
    modelSettings,
    template,
    instruction,
  });

  if (!validationResult.success) {
    return {
      error: fromZodError(validationResult.error).toString(),
    };
  }

  await prisma.workflowBranch.update({
    where: {
      id: branchId,
    },
    data: {
      shortId: branchShortId,
      model,
      modelSettings: modelSettings ? JSON.parse(modelSettings) : null,
      template,
      instruction,
    },
  });

  redirect(`/workflows/${id}/branches`);
}

export async function deleteWorkflowBranch(formData: FormData) {
  const workflowId = Number(formData.get("workflowId"));
  const id = Number(formData.get("id"));

  await prisma.workflowBranch.delete({
    where: {
      id,
    },
  });

  redirect(`/workflows/${workflowId}/branches`);
}

export async function mergeWorkflowBranch(formData: FormData) {
  const workflowId = Number(formData.get("workflowId"));
  const id = Number(formData.get("id"));

  const workflowBranch = await prisma.workflowBranch.update({
    where: {
      id,
    },
    data: {
      status: "merged",
    },
  });

  await prisma.workflow.update({
    where: {
      id: workflowId,
    },
    data: {
      model: workflowBranch?.model,
      template: workflowBranch?.template,
      modelSettings: workflowBranch?.modelSettings as unknown as Record<
        string,
        string | number | boolean | null
      >,
    },
  });

  redirect(`/workflows/${workflowId}/branches`);
}

export async function createTest(formData: FormData) {
  const id = Number(formData.get("id"));
  const input = formData.get("input") as string;
  const condition = formData.get("condition") as string;
  const output = (formData.get("output") as string) ?? "";

  console.log({ id, input, output, condition });

  const validationResult = WorkflowTestSchema.safeParse({
    id,
    input,
    output,
    condition,
  });

  if (!validationResult.success) {
    return {
      error: fromZodError(validationResult.error).toString(),
    };
  }

  await prisma.workflowTest.create({
    data: {
      workflow: {
        connect: {
          id,
        },
      },
      input,
      output,
      condition,
    },
  });

  redirect(`/workflows/${id}/tests`);
}

export async function deleteTest(formData: FormData) {
  const workflowId = Number(formData.get("workflowId"));
  const id = Number(formData.get("id"));

  await prisma.workflowTest.delete({
    where: {
      id,
    },
  });

  redirect(`/workflows/${workflowId}/tests`);
}

export async function runTests(formData: FormData) {
  const { userId, ownerId } = await owner();
  const id = Number(formData.get("id"));
  const branch = formData.get("branch") as string;

  const tests = await prisma.workflowTest.findMany({
    where: {
      workflowId: id,
    },
  });

  const workflow = await prisma.workflow.findUnique({
    include: {
      organization: {
        select: {
          stripe: true,
          UserKeys: true,
        },
      },
    },
    where: {
      id,
    },
  });

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  if (branch) {
    const workflowBranch = await prisma.workflowBranch.findFirst({
      where: {
        shortId: branch,
        workflowId: +id,
      },
    });

    if (workflowBranch) {
      workflow.model = workflowBranch.model;
      workflow.template = workflowBranch.template;
    }
  }

  await prisma.workflowTest.updateMany({
    where: {
      workflowId: id,
    },
    data: {
      status: "running",
    },
  });
  revalidatePath(`/workflows/${id}/tests`);

  for (const test of tests) {
    const inputs = workflow.inputs as unknown as WorkflowInput[];
    const model = workflow.model;

    const content = await translateInputs({
      inputs,
      inputValues: JSON.parse(test.input as unknown as string) as Record<
        string,
        string
      >,
      template: workflow.template,
    });

    const response = await getCompletion(
      model,
      content,
      JSON.parse(JSON.stringify(workflow.modelSettings)),
    );

    let { result, rawResult, totalTokenCount } = response;
    if (!result) throw "No result returned from OpenAI";

    let testPassed = false;
    switch (test.condition) {
      case "equals":
        testPassed = result === test.output;
        break;
      case "notEquals":
        testPassed = result !== test.output;
        break;
      case "contains":
        testPassed = result.includes(test.output);
        break;
      case "doesNotContain":
        testPassed = !result.includes(test.output);
        break;
      case "isGreaterThan":
        testPassed = Number(result) > Number(test.output);
        break;
      case "isLessThan":
        testPassed = Number(result) < Number(test.output);
        break;
      case "isValidJson":
        try {
          JSON.parse(result);
          testPassed = true;
        } catch (e) {
          testPassed = false;
        }
        break;
    }

    const isEligibleForByokDiscount = !!new ByokService().get(
      modelToProvider[model],
      workflow.organization?.UserKeys,
    );
    if (isEligibleForByokDiscount) {
      totalTokenCount = Math.floor(totalTokenCount * 0.3);
    }

    const [run] = await Promise.all([
      prisma.workflowRun.create({
        data: {
          result,
          rawRequest: JSON.parse(JSON.stringify({ model, content })),
          rawResult: JSON.parse(JSON.stringify(rawResult)),
          branchId: branch,
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
        workflow.organization?.stripe
          ?.subscription as unknown as Stripe.Subscription,
        totalTokenCount,
      ),
    ]);

    await prisma.workflowTest.update({
      where: {
        id: test.id,
      },
      data: {
        status: testPassed ? "pass" : "fail",
        workflowRunId: run.id,
      },
    });

    revalidatePath(`/workflows/${id}/tests`);
  }
}
