import { NextRequest, NextResponse } from "next/server";
import { create, list, logActivity } from "@/lib/db";
import { bad, clean, isEmail } from "@/lib/api";

export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => null);
  const email = clean(b?.email, 160).toLowerCase();
  if (!isEmail(email)) return bad("Please enter a valid email");
  const subs = await list("subscribers");
  if (!subs.some((s) => s.email === email)) {
    await create("subscribers", { email, source: clean(b?.source, 40) || "Website" });
    await logActivity("subscriber", `New subscriber: ${email}`);
  }
  return NextResponse.json({ ok: true });
}
