import { createHash } from "node:crypto";
import type { Prisma, Workflow } from "@/generated/prisma-client/client";
import { prisma } from "@/lib/utils/db";
import { owner } from "../hooks/useOwner";
import { redisStore } from "./redis";

export const LIMIT = 25;

export async function getWorkflowsForOwner({
  ownerId,
  search,
  page = 1,
}: {
  ownerId: string;
  search?: string;
  page?: number;
}) {
  const dbQuery: Prisma.WorkflowFindManyArgs = {
    where: {
      ownerId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: LIMIT,
    skip: (page - 1) * LIMIT,
  };

  if (search) {
    dbQuery.where!.name = {
      search,
    };
  }

  const [workflows, count] = await prisma.$transaction([
    prisma.workflow.findMany(dbQuery),
    prisma.workflow.count({
      where: {
        ownerId,
      },
    }),
  ]);

  return { workflows, count };
}

export async function getWorkflowAndRuns({
  id,
  page = 1,
  skipWorkflowRun = false,
  branch,
}: {
  id: number;
  page?: number;
  skipWorkflowRun?: boolean;
  branch?: string;
}) {
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

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  if (branch) {
    const branchWorkflow = await prisma.workflowBranch.findFirst({
      where: {
        shortId: branch,
        workflowId: id,
      },
    });

    if (!branchWorkflow) {
      throw new Error("Branch workflow not found");
    }

    workflow.model = branchWorkflow.model;
    workflow.template = branchWorkflow.template;
  }

  if (!workflow) throw new Error("Workflow not found");

  const [workflowRuns, count] = skipWorkflowRun
    ? [[], 0]
    : await prisma.$transaction([
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
