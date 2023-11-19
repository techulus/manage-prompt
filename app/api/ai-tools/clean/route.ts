import { del, list } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(_: Request) {
  let hasMore = true;
  let cursor;

  while (hasMore) {
    const listResult = await list({
      cursor,
    });

    for (const blob of listResult.blobs) {
      await del(blob.url);
    }

    hasMore = listResult.hasMore;
    cursor = listResult.cursor;
  }

  return NextResponse.json({
    message: "ok",
  });
}
