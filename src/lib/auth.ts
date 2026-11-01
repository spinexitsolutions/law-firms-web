import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "av_admin";
const SECRET = process.env.AUTH_SECRET || "dev-only-change-me-aurelian-vale-secret";
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@aurelianvale.law";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function sign(payload: string) {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function checkCredentials(email: string, password: string) {
  const a = Buffer.from(`${email.trim().toLowerCase()}:${password}`);
  const b = Buffer.from(`${ADMIN_EMAIL.toLowerCase()}:${ADMIN_PASSWORD}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function createToken(email: string) {
  const payload = Buffer.from(JSON.stringify({ email, exp: Date.now() + MAX_AGE * 1000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token?: string | null): { email: string } | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (expected.length !== sig.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (data.exp < Date.now()) return null;
    return { email: data.email };
  } catch {
    return null;
  }
}

export async function getSession() {
  const jar = await cookies();
  return verifyToken(jar.get(ADMIN_COOKIE)?.value);
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE,
};
