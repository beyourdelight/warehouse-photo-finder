import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, AUTH_COOKIE_MAX_AGE, createAuthToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const appPassword = process.env.APP_PASSWORD;
  const authSecret = process.env.AUTH_SECRET;

  if (!appPassword || !authSecret) {
    return NextResponse.json(
      { error: "ยังไม่ได้ตั้งค่า APP_PASSWORD / AUTH_SECRET บนเซิร์ฟเวอร์" },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => null);
  const password = body?.password;

  if (typeof password !== "string" || password !== appPassword) {
    return NextResponse.json({ error: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }

  const token = await createAuthToken(authSecret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE,
  });
  return res;
}
