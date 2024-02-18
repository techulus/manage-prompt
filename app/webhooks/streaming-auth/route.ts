import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  if (body.workflowId === process.env.MP_DEMO_WORKFLOW_ID) {
    return NextResponse.json({
      success: true,
    });
  }

  return NextResponse.error();
}
