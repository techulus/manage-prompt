import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  if (body.workflowId === process.env.MP_DEMO_WORKFLOW_ID) {
    console.log("Received request for demo workflow");
    return NextResponse.json({
      success: true,
      ttl: 60 * 60 * 24,
    });
  }

  console.log("Received request for workflow", body.workflowId);
  return NextResponse.error();
}
