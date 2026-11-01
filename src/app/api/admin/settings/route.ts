import { NextRequest, NextResponse } from "next/server";
import { getSettings, logActivity, updateSettings } from "@/lib/db";
import { bad, requireAdmin } from "@/lib/api";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return NextResponse.json(await getSettings());
}

export async function PUT(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return bad("Invalid JSON");
  const s = await updateSettings(body);
  await logActivity("settings", `Site settings updated (${Object.keys(body).join(", ")})`);
  return NextResponse.json(s);
}
