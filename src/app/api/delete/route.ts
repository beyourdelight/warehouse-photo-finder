import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const url = body?.url;

  if (typeof url !== "string" || !url.includes("/products/")) {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }

  await del(url);
  return NextResponse.json({ ok: true });
}
