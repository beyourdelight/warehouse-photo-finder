import { NextResponse } from "next/server";
import { list } from "@vercel/blob";

export async function GET() {
  const { blobs } = await list({ prefix: "products/", limit: 200 });

  const items = blobs
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .slice(0, 10)
    .map((b) => {
      const match = b.pathname.match(/^products\/(\d{4})\//);
      return { url: b.url, code: match?.[1] ?? "", uploadedAt: b.uploadedAt };
    })
    .filter((item) => item.code);

  return NextResponse.json({ items });
}
