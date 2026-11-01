import { NextRequest, NextResponse } from "next/server";
import { list } from "@/lib/db";
import { bad, clean } from "@/lib/api";
import { MATTER_STAGES } from "@/lib/types";

export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => null);
  const reference = clean(b?.reference, 40).toUpperCase();
  const email = clean(b?.email, 160).toLowerCase();
  if (!reference || !email) return bad("Enter your matter reference and registered email");
  await new Promise((r) => setTimeout(r, 500)); // slow down enumeration
  const m = (await list("matters")).find(
    (x) => x.reference.toUpperCase() === reference && x.clientEmail.toLowerCase() === email,
  );
  if (!m) return bad("We couldn't find a matter with those details. Please check and try again.", 404);
  return NextResponse.json({
    reference: m.reference,
    title: m.title,
    practiceArea: m.practiceArea,
    attorney: m.attorney,
    status: m.status,
    stage: m.stage,
    stages: MATTER_STAGES,
    court: m.court,
    nextHearing: m.nextHearing,
    publicNote: m.publicNote,
    updatedAt: m.updatedAt,
  });
}
