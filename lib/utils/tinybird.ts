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
