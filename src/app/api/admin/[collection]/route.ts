import { NextRequest, NextResponse } from "next/server";
import { create, list, logActivity } from "@/lib/db";
import { getCollectionDef, slugify } from "@/lib/admin-schema";
import { bad, requireAdmin } from "@/lib/api";
import type { CollectionKey } from "@/lib/types";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ collection: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { collection } = await ctx.params;
  if (!getCollectionDef(collection)) return bad("Unknown collection", 404);
  return NextResponse.json(await list(collection as CollectionKey));
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ collection: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { collection } = await ctx.params;
  const def = getCollectionDef(collection);
  if (!def) return bad("Unknown collection", 404);
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return bad("Invalid JSON");
  const data: Record<string, unknown> = { ...def.defaults, ...body };
  delete data.id;
  if (def.slugFrom && !data.slug && typeof data[def.slugFrom] === "string") {
    data.slug = slugify(data[def.slugFrom] as string);
  }
  for (const f of def.fields) if (f.required && !data[f.name]) return bad(`${f.label} is required`);
  const rec = await create(collection as CollectionKey, data as never);
  await logActivity(collection, `${def.singular} created: ${String(data[def.titleField] ?? "")}`);
  return NextResponse.json(rec, { status: 201 });
}
