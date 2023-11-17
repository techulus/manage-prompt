import { prisma } from "@/lib/utils/db";
import { Prisma, Workflow } from "@prisma/client";
import { owner } from "../hooks/useOwner";

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
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      published: true,
      model: true,
      ownerId: true,
      user: {
        select: {
          first_name: true,
        },
      },
    },
    where: {
      organization: {
        id: {
          equals: orgId ?? userId ?? "",
        },
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
        organization: {
          id: {
            equals: orgId ?? userId ?? "",
          },
        },
      },
    }),
  ]);

  return { workflows, count };
}

export async function getWorkflowAndRuns(id: number, page: number = 1) {
  const { ownerId } = owner();
  const workflow: Workflow | null = await prisma.workflow.findFirst({
    where: {
      id: {
        equals: id,
      },
      organization: {
        id: {
          equals: ownerId,
        },
      },
    },
  });

  if (!workflow) throw new Error("Workflow not found");

  const [workflowRuns, count] = await prisma.$transaction([
    prisma.workflowRun.findMany({
      select: {
        id: true,
        result: true,
        createdAt: true,
        rawResult: true,
        user: {
          select: {
            first_name: true,
          },
        },
      },
      where: {
        workflowId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: LIMIT,
      skip: (page - 1) * LIMIT,
    }),
    prisma.workflowRun.count({
      where: {
        workflowId: {
          equals: id,
        },
      },
    }),
  ]);

  return {
    workflow,
    workflowRuns,
    count,
  };
}
