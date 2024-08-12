import { prisma } from "@/lib/utils/db";
import { Prisma, Workflow } from "@prisma/client";
import { createHash } from "node:crypto";
import { owner } from "../hooks/useOwner";
import { redisStore } from "./redis";

export const LIMIT = 25;

export async function getWorkflowById(id: number): Promise<Workflow | null> {
  const workflow = await prisma.workflow.findUnique({
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
}) {
  const dbQuery: Prisma.WorkflowFindManyArgs = {
    include: {
      user: true,
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

  const [workflows, count] = await prisma.$transaction([
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
  const { ownerId } = await owner();
  if (!ownerId) throw new Error("Owner ID not found");

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
      include: {
        user: true,
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

export async function getWorkflowCachedResult(
  workflowId: string,
  body: string,
): Promise<string | null> {
  try {
    const inputHash = createHash("md5").update(body).digest("hex");
    const resultCacheKey = `run-cache:${workflowId}:${inputHash}`;
    const cachedResult: string | null = await redisStore.get(resultCacheKey);
    return cachedResult;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function cacheWorkflowResult(
  workflowId: string,
  body: string,
  result: string,
  ttl: number,
) {
  try {
    const inputHash = createHash("md5").update(body).digest("hex");
    const resultCacheKey = `run-cache:${workflowId}:${inputHash}`;
    await redisStore.set(resultCacheKey, result, {
      ex: ttl,
    });
  } catch (e) {
    console.error(e);
  }
}
