import { NextRequest, NextResponse } from "next/server";
import { create, logActivity } from "@/lib/db";
import { bad, clean, isEmail } from "@/lib/api";

export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => null);
  if (!b) return bad("Invalid request");
  const name = clean(b.name, 120);
  const email = clean(b.email, 160);
  const date = clean(b.date, 10);
  const time = clean(b.time, 5);
  const mode = ["in-person", "video", "phone"].includes(b.mode) ? b.mode : "video";
  if (!name) return bad("Please tell us your name");
  if (!isEmail(email)) return bad("Please enter a valid email");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return bad("Please choose a date and time");
  const practiceArea = clean(b.practiceArea, 80) || "Other";
  const phone = clean(b.phone, 40);
  const message = clean(b.message, 4000);
  const appt = await create("appointments", {
    name, email, phone, practiceArea, date, time, mode,
    status: "requested", attorney: "", notes: message,
  });
  await create("leads", {
    name, email, phone, practiceArea, message,
    source: "Website · Booking", stage: "consultation", value: 0, assignedTo: "",
    notes: `Consultation requested for ${date} ${time} (${mode}).`,
  });
  await logActivity("appointment", `Consultation requested by ${name} — ${date} ${time}`);
  return NextResponse.json({ ok: true, id: appt.id });
}
