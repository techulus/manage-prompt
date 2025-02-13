import { prisma } from "./db";

export type WorkflowRunStat = {
  date: number | string;
  total: number;
  tokens: number;
};

export async function getWorkflowUsage(id: number | string): Promise<{
  runs: number;
  tokens: number;
}> {
  const workflowRuns = await prisma.workflowRun.findMany({
    select: {
      totalTokenCount: true,
    },
    where: {
      workflowId: Number(id),
      createdAt: {
        gte: new Date(new Date().setDate(new Date().getDate() - 30)),
      },
    },
  });

  return {
    runs: workflowRuns.length,
    tokens: workflowRuns.reduce((acc, val) => acc + val?.totalTokenCount, 0),
  };
}

export async function getWorkflowRunStats(
  id: number,
): Promise<WorkflowRunStat[]> {
  const result: WorkflowRunStat[] = await prisma.$queryRaw`
  WITH date_series AS (
    SELECT generate_series(
      NOW()::DATE - INTERVAL '30 days', 
      NOW()::DATE, 
      '1 day'::INTERVAL
    )::DATE AS date
  )
  SELECT 
    ds.date,
    COALESCE(COUNT(wr.id)::INTEGER, 0) AS "total",
    COALESCE(SUM(wr."totalTokenCount")::INTEGER, 0) AS "tokens"
  FROM date_series ds
  LEFT JOIN "WorkflowRun" wr ON DATE(wr."createdAt") = ds.date AND wr."workflowId" = ${id}
  GROUP BY ds.date
  ORDER BY ds.date ASC;
`;

  return result;
}
