import { NextRequest, NextResponse } from "next/server";
import { list } from "@vercel/blob";

const CODE_RE = /^\d{4}$/;

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code") ?? "";

  if (!CODE_RE.test(code)) {
    return NextResponse.json({ error: "รหัสต้องเป็นตัวเลข 4 หลัก" }, { status: 400 });
  }

  const { blobs } = await list({ prefix: `products/${code}/` });
  const items = blobs
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .map((b) => ({ url: b.url, uploadedAt: b.uploadedAt }));

  return NextResponse.json({ code, items });
}
