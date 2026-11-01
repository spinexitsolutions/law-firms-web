import { getDB } from "@/lib/db";
import { LeadsBoard } from "@/components/admin/LeadsBoard";
import type { Rec } from "@/components/admin/api";

export const metadata = { title: "Leads" };

export default async function LeadsPage() {
  const db = await getDB();
  return <LeadsBoard initial={structuredClone(db.leads) as unknown as Rec[]} />;
}
