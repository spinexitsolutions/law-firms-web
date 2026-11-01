import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { connection } from "next/server";
import { createSeed } from "./seed";
import type { Activity, CollectionKey, DB, Settings } from "./types";

/**
 * Tiny JSON-file database. Zero setup: the file is created from the seed on
 * first read. On read-only hosts (e.g. Vercel) it falls back to /tmp.
 * Swap this module for Postgres/Prisma later without touching the UI.
 */
const DATA_DIR =
  process.env.DATA_DIR ||
  (process.env.VERCEL ? "/tmp/lexdata" : path.join(process.cwd(), "data"));
const FILE = path.join(DATA_DIR, "db.json");

let cache: DB | null = null;
let cacheMtime = 0;
let writeQueue: Promise<void> = Promise.resolve();

function mergeSettings(base: Settings, saved: Partial<Settings>): Settings {
  // Shallow-per-group merge so newly-added settings keys get defaults.
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(saved ?? {})) {
    const b = (base as unknown as Record<string, unknown>)[k];
    out[k] =
      b && typeof b === "object" && !Array.isArray(b) && v && typeof v === "object" && !Array.isArray(v)
        ? { ...(b as object), ...(v as object) }
        : v;
  }
  return out as unknown as Settings;
}

async function load(): Promise<DB> {
  // Route handlers and pages can live in separate module instances, so the
  // in-memory cache is only trusted while the file on disk is unchanged.
  if (cache) {
    const m = await fs.stat(FILE).then((st) => st.mtimeMs).catch(() => 0);
    if (m === cacheMtime || m === 0) return cache;
  }
  const seed = createSeed();
  try {
    const raw = await fs.readFile(FILE, "utf8");
    cacheMtime = (await fs.stat(FILE)).mtimeMs;
    const parsed = JSON.parse(raw) as Partial<DB>;
    cache = { ...seed, ...parsed, settings: mergeSettings(seed.settings, parsed.settings ?? {}) } as DB;
  } catch {
    cache = seed;
    await persist();
  }
  return cache;
}

async function persist() {
  const snapshot = JSON.stringify(cache, null, 2);
  writeQueue = writeQueue.then(async () => {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      const tmp = FILE + ".tmp";
      await fs.writeFile(tmp, snapshot, "utf8");
      await fs.rename(tmp, FILE);
      cacheMtime = (await fs.stat(FILE)).mtimeMs;
    } catch (e) {
      console.error("[db] persist failed", e);
    }
  });
  return writeQueue;
}

/** Read the whole DB (request-time, never prerendered). */
export async function getDB(): Promise<DB> {
  await connection();
  return load();
}

export async function getSettings(): Promise<Settings> {
  return (await getDB()).settings;
}

export async function updateSettings(patch: Partial<Settings>) {
  const db = await load();
  db.settings = mergeSettings(db.settings, patch);
  await persist();
  return db.settings;
}

export async function list<K extends CollectionKey>(key: K): Promise<DB[K]> {
  return (await load())[key];
}

export async function getOne<K extends CollectionKey>(key: K, id: string) {
  return ((await load())[key] as { id: string }[]).find((r) => r.id === id) as
    | DB[K][number]
    | undefined;
}

export async function create<K extends CollectionKey>(
  key: K,
  data: Partial<DB[K][number]>,
): Promise<DB[K][number]> {
  const db = await load();
  const ts = new Date().toISOString();
  const rec = { ...data, id: randomUUID().slice(0, 8), createdAt: ts, updatedAt: ts } as DB[K][number];
  (db[key] as unknown[]).unshift(rec);
  await persist();
  return rec;
}

export async function update<K extends CollectionKey>(
  key: K,
  id: string,
  data: Partial<DB[K][number]>,
) {
  const db = await load();
  const arr = db[key] as { id: string }[];
  const i = arr.findIndex((r) => r.id === id);
  if (i < 0) return null;
  arr[i] = { ...arr[i], ...data, id, updatedAt: new Date().toISOString() };
  await persist();
  return arr[i] as DB[K][number];
}

export async function remove<K extends CollectionKey>(key: K, id: string) {
  const db = await load();
  const arr = db[key] as { id: string }[];
  const i = arr.findIndex((r) => r.id === id);
  if (i < 0) return false;
  arr.splice(i, 1);
  await persist();
  return true;
}

export async function logActivity(type: string, text: string) {
  const db = await load();
  const a: Activity = { id: randomUUID().slice(0, 8), at: new Date().toISOString(), type, text };
  db.activity = [a, ...db.activity].slice(0, 200);
  await persist();
}

export async function resetDB() {
  cache = createSeed();
  await persist();
}

export async function exportDB() {
  return load();
}
