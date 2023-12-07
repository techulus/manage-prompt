import { getPrediction, updatePredictionOrder } from "@/lib/utils/replicate";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.error();
  }

  const prediction = await getPrediction(id);
  console.log("replicate status", prediction.status);

  if (prediction.status === "succeeded") {
    // @ts-ignore
    const outputUrl = (prediction.output as unknown as string[])[0];
    console.log("replicate done", outputUrl);

    const order = await updatePredictionOrder(id, outputUrl);

    return NextResponse.json({
      order_id: order.id,
      status: prediction.status,
    });
  }

  return NextResponse.json({
    status: prediction.status,
  });
}