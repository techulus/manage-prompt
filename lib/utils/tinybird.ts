export enum EventName {
  RunWorkflow = "run_workflow",
}

export async function logEvent(eventName: string, payload: any) {
  await fetch(
    `https://api.us-east.aws.tinybird.co/v0/events?name=${eventName}`,
    {
      method: "POST",
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        ...payload,
      }),
      headers: {
        Authorization: `Bearer ${process.env.TINYBIRD_TOKEN}`,
      },
    },
  )
    .then((res) => res.json())
    .then((data) => console.log("[TinyBird] Log Event:", data));
}

export type WorkflowRunStat = {
  hour: number | string;
  total: number;
  tokens: number;
};

export async function getWorkflowUsage(id: number | string): Promise<{
  runs: number;
  tokens: number;
}> {
  const entries = await fetch(
    `https://api.us-east.aws.tinybird.co/v0/pipes/workflow_runs_count_by_hour.json?token=${process.env.TINYBIRD_TOKEN}&workflow_id=${id}`,
    { next: { revalidate: 300 } },
  )
    .then((res) => res.json())
    .then(({ data }) => data as WorkflowRunStat[]);

  return entries.reduce(
    (acc, val) => {
      acc.runs += val.total;
      acc.tokens += val.tokens;
      return acc;
    },
    {
      runs: 0,
      tokens: 0,
    },
  );
}

export async function getWorkflowRunStats(
  id: number | string,
): Promise<WorkflowRunStat[]> {
  const entries = await fetch(
    `https://api.us-east.aws.tinybird.co/v0/pipes/workflow_runs_count_by_hour.json?token=${process.env.TINYBIRD_TOKEN}&workflow_id=${id}`,
    { next: { revalidate: 300 } },
  )
    .then((res) => res.json())
    .then(({ data }) => data as WorkflowRunStat[]);

  const now = new Date();
  const last24Hours = Array.from({ length: 24 }, (_, i) => {
    const d = new Date(now);
    d.setHours(d.getUTCHours() - i);
    return d.getHours();
  });

  return (last24Hours ?? [])
    .map(
      (hour) =>
        entries?.find((e) => e.hour === hour) || { hour, total: 0, tokens: 0 },
    )
    .reverse();
}
