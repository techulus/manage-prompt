import { Prisma, Workflow, WorkflowRun } from "@prisma/client";
import { prisma } from "./db";

export async function getWorkflowById(id: number): Promise<Workflow | null> {
  const workflow: Workflow | null = await prisma.workflow.findUnique({
    where: {
      id,
    },
  });

  return workflow;
}

export async function getWorkflowsForOwner({
  orgId,
  userId,
  search,
}: {
  orgId: string;
  userId: string;
  search?: string;
}): Promise<Workflow[]> {
  const dbQuery: Prisma.WorkflowFindManyArgs = {
    where: {
      ownerId: {
        equals: orgId ?? userId ?? "",
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  };

  if (search) {
    dbQuery.where!["name"] = {
      search,
    };
  }

  const workflows: Workflow[] = await prisma.workflow.findMany(dbQuery);

  return workflows;
}

// TODO: Add pagination
export async function getWorkflowAndRuns(id: number) {
  const workflow: Workflow | null = await prisma.workflow.findUnique({
    where: {
      id,
    },
  });

  const workflowRuns: WorkflowRun[] = await prisma.workflowRun.findMany({
    where: {
      workflowId: id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    workflow,
    workflowRuns,
  };
}
