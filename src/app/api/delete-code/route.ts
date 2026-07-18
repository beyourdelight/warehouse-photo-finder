import { NextRequest, NextResponse } from "next/server";
import { del, list } from "@vercel/blob";

const CODE_RE = /^\d{4}$/;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const code = body?.code;

  if (typeof code !== "string" || !CODE_RE.test(code)) {
    return NextResponse.json({ error: "invalid code" }, { status: 400 });
  }

  const { blobs } = await list({ prefix: `products/${code}/` });
  if (blobs.length > 0) {
    await del(blobs.map((b) => b.url));
  }

  return NextResponse.json({ ok: true, deleted: blobs.length });
}
