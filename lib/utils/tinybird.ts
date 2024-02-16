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
    }
  )
    .then((res) => res.json())
    .then((data) => console.log("[TinyBird] Log Event:", data));
}

export type WorkflowRunStat = { hour: number; total: number };

export async function getWorkflowRunsByHour(
  id: number | string
): Promise<WorkflowRunStat[]> {
  const entries = await fetch(
    `https://api.us-east.aws.tinybird.co/v0/pipes/workflow_runs_count_by_hour.json?token=${process.env.TINYBIRD_TOKEN}&workflow_id=${id}`
  )
    .then((res) => res.json())
    .then(({ data }) => data as WorkflowRunStat[]);

  const now = new Date();
  const last24Hours = Array.from({ length: 24 }, (_, i) => {
    const d = new Date(now);
    d.setHours(d.getUTCHours() - i);
    return d.getHours();
  });

  return last24Hours.map((hour) => {
    const entry = entries.find((e) => e.hour === hour);
    return entry || { hour, total: 0 };
  });
}
