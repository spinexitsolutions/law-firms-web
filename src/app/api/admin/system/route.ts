import { NextRequest, NextResponse } from "next/server";
import { exportDB, resetDB } from "@/lib/db";
import { bad, requireAdmin } from "@/lib/api";

/** GET → full JSON backup. POST {action:"reset"} → restore demo content. */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return new NextResponse(JSON.stringify(await exportDB(), null, 2), {
    headers: {
      "content-type": "application/json",
      "content-disposition": `attachment; filename="backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = await req.json().catch(() => ({}));
  if (body.action !== "reset") return bad("Unknown action");
  await resetDB();
  return NextResponse.json({ ok: true });
}
