import "server-only";
import { NextResponse } from "next/server";
import { getSession } from "./auth";

export async function requireAdmin() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

export function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export function clean(v: unknown, max = 5000) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
