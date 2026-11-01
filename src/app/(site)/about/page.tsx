import type { Metadata } from "next";
import Image from "next/image";
import { getDB } from "@/lib/db";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/motion";
import { Cta, Marquee, Stats } from "@/components/site/home/Sections";

export const metadata: Metadata = { title: "The Firm" };

const MILESTONES = [
  ["1998", "Founded in New Delhi by two advocates with a single conference room."],
  ["2006", "Opened our Mumbai office to serve a growing corporate practice."],
  ["2013", "Launched a dedicated arbitration and white-collar defence group."],
  ["2019", "Bengaluru office opens, anchoring our IP & technology practice."],
  ["2026", "64 advocates and consultants. Tier 1 for Dispute Resolution."],
];

export default async function AboutPage() {
  const db = await getDB();
  const s = db.settings;
  return (
    <>
      <PageHeader eyebrow="The firm" title={s.about.title} intro={s.about.intro} image={s.about.image} />

      <section className="container-x grid gap-10 py-20 md:grid-cols-12 md:py-32">
        <p className="eyebrow text-muted md:col-span-4">Who we are</p>
        <Reveal className="md:col-span-8">
          <p className="font-serif text-[clamp(1.6rem,3.2vw,2.8rem)] leading-[1.15] tracking-tight">{s.about.body}</p>
        </Reveal>
      </section>

      <Stats s={s} />

      <section className="container-x py-20 md:py-32">
        <h2 className="display-md mb-14 max-w-3xl">What we hold ourselves to.</h2>
        <div className="grid gap-px overflow-hidden rounded-[var(--radius)] border hairline bg-line sm:grid-cols-2 lg:grid-cols-4">
          {s.about.values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.08} className="group bg-paper p-8 transition-colors duration-500 hover:bg-ink hover:text-paper">
              <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-16 font-serif text-4xl">{v.title}</h3>
              <p className="mt-3 text-sm opacity-70">{v.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-paper-2/70 py-20 md:py-32">
        <div className="container-x">
          <h2 className="display-md mb-12">Since {s.brand.founded}.</h2>
          <ol className="relative border-l hairline pl-8 md:pl-12">
            {MILESTONES.map(([y, t], i) => (
              <Reveal as="li" key={y} delay={i * 0.06} className="relative pb-12 last:pb-0">
                <span className="absolute -left-[calc(2rem+5px)] top-3 h-2.5 w-2.5 rounded-full bg-accent md:-left-[calc(3rem+5px)]" />
                <p className="font-serif text-5xl md:text-7xl">{y}</p>
                <p className="mt-2 max-w-xl text-muted">{t}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-x py-20 md:py-32">
        <h2 className="display-md mb-12">Three cities. One firm.</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {s.offices.map((o, i) => (
            <Reveal key={o.city} delay={i * 0.1}>
              <div className="group relative aspect-[4/5] overflow-hidden rounded-[var(--radius)]">
                <Image src={o.image} alt={o.city} fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover transition-transform duration-[1.4s] group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
                <div className="absolute inset-x-6 bottom-6 text-paper">
                  <h3 className="font-serif text-4xl">{o.city}</h3>
                  <p className="mt-2 text-sm text-paper/70">{o.address}</p>
                  <p className="mt-1 text-sm text-paper/70">{o.phone}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <Marquee items={s.marquee} />
      <Cta s={s} />
    </>
  );
}
