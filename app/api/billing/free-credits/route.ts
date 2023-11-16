import { NextResponse } from "next/server";

export async function GET(req: Request) {
  console.log("GET /api/billing/free-credits", req.headers);
  return NextResponse.json({
    success: true,
  });
}
