import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getDB } from "@/lib/db";
import { getCollectionDef } from "@/lib/admin-schema";
import { CollectionManager } from "@/components/admin/CollectionManager";
import type { Rec } from "@/components/admin/api";

type Props = { params: Promise<{ collection: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection } = await params;
  return { title: getCollectionDef(collection)?.label ?? "Not found" };
}

export default async function CollectionPage({ params }: Props) {
  const { collection } = await params;
  const def = getCollectionDef(collection);
  if (!def) notFound();
  if (def.key === "leads") redirect("/admin/leads");
  const db = await getDB();
  const rows = structuredClone(db[def.key]) as unknown as Rec[];
  return <CollectionManager key={def.key} collection={def.key} initial={rows} />;
}
