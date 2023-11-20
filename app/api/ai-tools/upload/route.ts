import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export type BlobUploadResult = {
  message: string;
  url: string;
};

export async function PUT(request: Request) {
  const body = await request.blob();

  console.log("Starting upload...");
  const { url } = await put("blob.png", body, {
    access: "public",
  });
  console.log("Upload completed,", url);

  return NextResponse.json<BlobUploadResult>({
    message: "ok",
    url,
  });
}
