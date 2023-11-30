import { prisma } from "@/lib/utils/db";
import { createHash } from "crypto";
import { NextResponse } from "next/server";
import sharp from "sharp";

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

  if (!order) {
    return NextResponse.error();
  }

  // Fetch image from url using fetch
  const imageBuf = await fetch(order.outputUrl).then(async (res) =>
    Buffer.from(await res.arrayBuffer())
  );

  const overlayBuf = await fetch(
    "https://manageprompt.com/images/logo.png"
  ).then(async (res) => Buffer.from(await res.arrayBuffer()));

  const image = await sharp(imageBuf)
    .composite([{ input: overlayBuf, gravity: "northeast", blend: "overlay" }])
    .toFormat("png")
    .png({ quality: 100 })
    .toBuffer();

  return new Response(image, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
      ETag: `"${createHash("md5").update(image).digest("hex")}"`,
    },
  });
}
