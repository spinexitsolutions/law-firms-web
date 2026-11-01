import type { Metadata } from "next";
import { getDB } from "@/lib/db";
import { PageHeader } from "@/components/site/PageHeader";
import { AttorneyGrid } from "@/components/site/FilterGrid";
import { Cta } from "@/components/site/home/Sections";

export const metadata: Metadata = { title: "Our People" };

export default async function AttorneysPage() {
  const db = await getDB();
  const people = db.attorneys.filter((p) => p.published).sort((a, b) => a.order - b.order);
  return (
    <>
      <PageHeader
        eyebrow="Our people"
        title="Senior attention. Every single matter."
        intro="Our partners lead from the front. Meet the advocates and consultants who will know your matter by heart."
      />
      <section className="container-x pb-24 md:pb-36">
        <AttorneyGrid people={people} />
      </section>
      <Cta s={db.settings} />
    </>
  );
}
