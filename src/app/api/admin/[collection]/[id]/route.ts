import { NextRequest, NextResponse } from "next/server";
import { getOne, logActivity, remove, update } from "@/lib/db";
import { getCollectionDef, slugify } from "@/lib/admin-schema";
import { bad, requireAdmin } from "@/lib/api";
import type { CollectionKey } from "@/lib/types";

type Ctx = { params: Promise<{ collection: string; id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { collection, id } = await ctx.params;
  if (!getCollectionDef(collection)) return bad("Unknown collection", 404);
  const rec = await getOne(collection as CollectionKey, id);
  return rec ? NextResponse.json(rec) : bad("Not found", 404);
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { collection, id } = await ctx.params;
  const def = getCollectionDef(collection);
  if (!def) return bad("Unknown collection", 404);
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return bad("Invalid JSON");
  delete body.id;
  delete body.createdAt;
  if (def.slugFrom && body.slug === "" && typeof body[def.slugFrom] === "string") {
    body.slug = slugify(body[def.slugFrom] as string);
  }
  const rec = await update(collection as CollectionKey, id, body as never);
  if (!rec) return bad("Not found", 404);
  await logActivity(collection, `${def.singular} updated: ${String((rec as unknown as Record<string, unknown>)[def.titleField] ?? "")}`);
  return NextResponse.json(rec);
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { collection, id } = await ctx.params;
  const def = getCollectionDef(collection);
  if (!def) return bad("Unknown collection", 404);
  const ok = await remove(collection as CollectionKey, id);
  if (!ok) return bad("Not found", 404);
  await logActivity(collection, `${def.singular} deleted`);
  return NextResponse.json({ ok: true });
}
