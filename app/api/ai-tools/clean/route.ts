import { del, list } from "@vercel/blob";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_: Request) {
  let hasMore = true;
  let cursor: string | undefined;

  console.log("Starting to delete blobs");
  while (hasMore) {
    const listResult = await list({
      cursor,
    });

    console.log(`Deleting ${listResult.blobs.length} blobs`);
    for (const blob of listResult.blobs) {
      await del(blob.url);
    }

    hasMore = listResult.hasMore;
    cursor = listResult.cursor;
  }
  console.log("Finished deleting blobs");

  return NextResponse.json({
    message: "ok",
  });
}
