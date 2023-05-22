import { prisma } from "@/utils/db";
import { auth } from "@clerk/nextjs/app-beta";
import { Prisma, Workflow, WorkflowRun } from "@prisma/client";

export const LIMIT = 15;

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
  page = 1,
}: {
  orgId: string;
  userId: string;
  search?: string;
  page?: number;
}): Promise<{
  workflows: Workflow[];
  count: number;
}> {
  const dbQuery: Prisma.WorkflowFindManyArgs = {
    where: {
      ownerId: {
        equals: orgId ?? userId ?? "",
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: LIMIT,
    skip: (page - 1) * LIMIT,
  };

  if (search) {
    dbQuery.where!["name"] = {
      search,
    };
  }

  const [workflows, count]: [Workflow[], number] = await prisma.$transaction([
    prisma.workflow.findMany(dbQuery),
    prisma.workflow.count({
      where: {
        ownerId: {
          equals: orgId ?? userId ?? "",
        },
      },
    }),
  ]);

  return { workflows, count };
}

// TODO: Add pagination
export async function getWorkflowAndRuns(id: number) {
  const { orgId, userId } = auth();
  const workflow: Workflow | null = await prisma.workflow.findFirst({
    where: {
      id: {
        equals: id,
      },
      ownerId: {
        equals: orgId ?? userId ?? "",
      },
    },
  });

  if (!workflow) throw new Error("Workflow not found");

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
