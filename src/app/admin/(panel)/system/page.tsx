import { getDB } from "@/lib/db";
import { COLLECTIONS } from "@/lib/admin-schema";
import { SystemPanel } from "@/components/admin/SystemPanel";

export const metadata = { title: "Backup & reset" };

export default async function SystemPage() {
  const db = await getDB();
  const counts = COLLECTIONS.map((c) => ({ label: c.label, n: (db[c.key] as unknown[]).length }));
  return <SystemPanel counts={counts} />;
}
