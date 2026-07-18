import { NextRequest, NextResponse } from "next/server";
import { list } from "@vercel/blob";

const PAGE_SIZE = 30;

export async function GET(req: NextRequest) {
  const offset = Number(req.nextUrl.searchParams.get("offset") ?? "0") || 0;

  const { blobs } = await list({ prefix: "products/", limit: 1000 });

  const sorted = blobs
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .map((b) => {
      const match = b.pathname.match(/^products\/(\d{4})\//);
      return { url: b.url, code: match?.[1] ?? "", uploadedAt: b.uploadedAt };
    })
    .filter((item) => item.code);

  const items = sorted.slice(offset, offset + PAGE_SIZE);
  const hasMore = offset + PAGE_SIZE < sorted.length;

  return NextResponse.json({ items, hasMore, nextOffset: offset + PAGE_SIZE });
}
