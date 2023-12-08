import { prisma } from "@/lib/utils/db";
import { getPrediction, updatePredictionOrder } from "@/lib/utils/replicate";
import { del } from "@vercel/blob";
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
    const order = await prisma.imageOrder.findUnique({
      where: {
        predictionId: id,
      },
    });

    if (!order) {
      return NextResponse.error();
    }

    let outputUrl = "";
    switch (order.type) {
      case "photo-realistic-image-creator":
        outputUrl = (prediction.output as unknown as string[])[0];
        break;
      case "image-upscale":
      case "remove-background":
        outputUrl = prediction.output as unknown as string;
        break;
      case "black-and-white-to-color":
        outputUrl = (prediction.output as unknown as { image: string }[])[0]
          .image;
        break;
      default:
        break;
    }

    if (!outputUrl) {
      return NextResponse.error();
    }

    console.log("updating order", id, outputUrl);
    await updatePredictionOrder(id, outputUrl);

    if (order.inputUrl) {
      console.log("deleting input", order.inputUrl);
      await del(order.inputUrl);
    }

    return NextResponse.json({
      order_id: order.id,
      status: prediction.status,
    });
  }

  return NextResponse.json({
    status: prediction.status,
  });
}
