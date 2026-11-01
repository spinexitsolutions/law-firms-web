import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, checkCredentials, cookieOptions, createToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email = "", password = "" } = await req.json().catch(() => ({}));
  if (!checkCredentials(String(email), String(password))) {
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, createToken(String(email).toLowerCase()), cookieOptions);
  return res;
}
