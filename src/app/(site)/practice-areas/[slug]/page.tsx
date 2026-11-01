import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getDB } from "@/lib/db";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/motion";
import { AttorneyCard, FaqList } from "@/components/site/home/Sections";
import { ContactForm } from "@/components/site/forms/ContactForm";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = (await getDB()).practiceAreas.find((x) => x.slug === slug);
  return a ? { title: a.title, description: a.summary } : {};
}

export default async function PracticePage({ params }: Props) {
  const { slug } = await params;
  const db = await getDB();
  const areas = db.practiceAreas.filter((x) => x.published).sort((a, b) => a.order - b.order);
  const a = areas.find((x) => x.slug === slug);
  if (!a) notFound();
  const team = db.attorneys.filter((p) => p.published && p.practiceAreas.includes(a.title));
  const idx = areas.indexOf(a);
  const next = areas[(idx + 1) % areas.length];

  return (
    <>
      <PageHeader eyebrow={`Practice · ${String(idx + 1).padStart(2, "0")}`} title={a.title} intro={a.summary} image={a.image} />

      <section className="container-x grid gap-14 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-7">
          <Reveal>
            <p className="font-serif text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.2] tracking-tight">{a.description}</p>
          </Reveal>
          <h2 className="eyebrow mt-16 text-muted">What we do</h2>
          <ul className="mt-4 border-t hairline">
            {a.services.map((sv, i) => (
              <Reveal as="li" key={sv} delay={i * 0.05} className="flex items-baseline gap-6 border-b hairline py-5">
                <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-lg tracking-tight md:text-xl">{sv}</span>
              </Reveal>
            ))}
          </ul>
        </div>
        <aside className="md:col-span-5">
          <div className="sticky top-28 rounded-[var(--radius)] bg-ink p-6 text-paper md:p-8">
            <p className="eyebrow text-paper/50">Speak to a specialist</p>
            <h3 className="display-sm mt-2">Tell us what happened.</h3>
            <ContactForm dark presetArea={a.title} source="Practice page" compact />
          </div>
        </aside>
      </section>

      {team.length > 0 && (
        <section className="container-x pb-20">
          <h2 className="display-sm mb-8">The team</h2>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {team.map((p) => (
              <AttorneyCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}

      <section className="container-x pb-20">
        <FaqList faqs={db.faqs.filter((f) => f.published).slice(0, 4)} withHead={false} />
      </section>

      <Link href={`/practice-areas/${next.slug}`} className="group block bg-ink py-20 text-paper md:py-28" data-cursor="Next">
        <div className="container-x">
          <p className="eyebrow text-paper/50">Next practice</p>
          <p className="display-lg mt-3 transition-all duration-700 group-hover:translate-x-4 group-hover:italic group-hover:text-accent">
            {next.title} →
          </p>
        </div>
      </Link>
    </>
  );
}
