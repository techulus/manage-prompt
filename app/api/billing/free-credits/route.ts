import { prisma } from "@/lib/utils/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // get the bearer token from the header
  const authToken = (req.headers.get("authorization") || "")
    .split("Bearer ")
    .at(1);

  // if not found OR the bearer token does NOT equal the CRON_SECRET
  if (!authToken || authToken != process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: "Unauthorized" },
      {
        status: 401,
      }
    );
  }

  await prisma.organization.updateMany({
    data: {
      credits: 100,
    },
  });

  console.log("Cron job ran successfully");

  return NextResponse.json({
    success: true,
  });
}
