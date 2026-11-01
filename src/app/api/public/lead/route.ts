import { NextRequest, NextResponse } from "next/server";
import { create, logActivity } from "@/lib/db";
import { bad, clean, isEmail } from "@/lib/api";

export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => null);
  if (!b) return bad("Invalid request");
  if (b.website) return NextResponse.json({ ok: true }); // honeypot
  const name = clean(b.name, 120);
  const email = clean(b.email, 160);
  if (!name) return bad("Please tell us your name");
  if (!isEmail(email)) return bad("Please enter a valid email");
  await create("leads", {
    name,
    email,
    phone: clean(b.phone, 40),
    practiceArea: clean(b.practiceArea, 80) || "Other",
    message: clean(b.message, 4000),
    source: `Website · ${clean(b.source, 40) || "Contact"}`,
    stage: "new",
    value: 0,
    assignedTo: "",
    notes: "",
  });
  await logActivity("lead", `New lead from ${name} (${clean(b.practiceArea, 80) || "General"})`);
  return NextResponse.json({ ok: true });
}
