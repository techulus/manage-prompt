import { prisma } from "@/lib/utils/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.error();
  }

  const order = await prisma.imageOrder.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!order?.outputUrl) {
    return NextResponse.error();
  }

  return NextResponse.redirect(order.outputUrl);
}
