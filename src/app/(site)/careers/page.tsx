import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { getDB } from "@/lib/db";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/motion";

export const metadata: Metadata = { title: "Careers" };

export default async function CareersPage() {
  const db = await getDB();
  const jobs = db.jobs.filter((j) => j.open);
  return (
    <>
      <PageHeader
        eyebrow="Careers"
        title="Do the best work of your career."
        intro="We hire for judgment, curiosity and kindness — and then give people real responsibility, early."
        image={db.settings.about.image}
      />
      <section className="container-x py-20 md:py-28">
        <h2 className="display-sm mb-8">Open positions</h2>
        <ul className="border-t hairline">
          {jobs.map((j, i) => (
            <Reveal as="li" key={j.id} delay={i * 0.06} className="border-b hairline">
              <a
                href={`mailto:${db.settings.brand.email}?subject=${encodeURIComponent("Application: " + j.title)}`}
                className="group grid gap-3 py-8 md:grid-cols-12 md:items-center"
              >
                <h3 className="font-serif text-3xl transition-transform duration-500 group-hover:translate-x-2 md:col-span-5 md:text-4xl">{j.title}</h3>
                <p className="text-sm text-muted md:col-span-2">{j.location}</p>
                <p className="text-sm text-muted md:col-span-2">{j.type}</p>
                <p className="text-sm text-ink/70 md:col-span-2">{j.description}</p>
                <span className="grid h-12 w-12 place-items-center rounded-full border hairline transition-all group-hover:rotate-45 group-hover:bg-accent md:col-span-1 md:justify-self-end">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </a>
            </Reveal>
          ))}
          {!jobs.length && <p className="py-10 text-muted">No openings right now — write to us anyway.</p>}
        </ul>
      </section>
    </>
  );
}
