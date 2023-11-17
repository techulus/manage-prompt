import { prisma } from "@/lib/utils/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
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
