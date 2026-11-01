"use client";

export type Rec = Record<string, unknown> & { id: string };

async function handle<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  return data as T;
}

export const adminApi = {
  create: (key: string, data: Record<string, unknown>) =>
    fetch(`/api/admin/${key}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => handle<Rec>(r)),
  update: (key: string, id: string, data: Record<string, unknown>) =>
    fetch(`/api/admin/${key}/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => handle<Rec>(r)),
  remove: (key: string, id: string) =>
    fetch(`/api/admin/${key}/${id}`, { method: "DELETE" }).then((r) => handle<{ ok: boolean }>(r)),
};
