import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { getDB } from "@/lib/db";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/motion";
import { Cta } from "@/components/site/home/Sections";

export const metadata: Metadata = { title: "Practice Areas" };

export default async function PracticeAreasPage() {
  const db = await getDB();
  const areas = db.practiceAreas.filter((a) => a.published).sort((a, b) => a.order - b.order);
  return (
    <>
      <PageHeader
        eyebrow="Practice areas"
        title="Depth in every discipline that matters."
        intro="Eight integrated practices, one standard of excellence. Most of our matters draw on more than one team — and that is precisely the point."
      />
      <section className="container-x grid gap-x-6 gap-y-14 pb-24 sm:grid-cols-2 lg:grid-cols-3 md:pb-36">
        {areas.map((a, i) => (
          <Reveal key={a.id} delay={(i % 3) * 0.08}>
            <Link href={`/practice-areas/${a.slug}`} className="group block" data-cursor="Open">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius)]">
                <Image
                  src={a.image}
                  alt=""
                  fill
                  sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/0 to-transparent" />
                <span className="absolute left-5 top-5 tabular-nums text-xs text-paper/80">{String(i + 1).padStart(2, "0")}</span>
                <span className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-paper text-ink transition-transform duration-500 group-hover:rotate-45">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
                <h2 className="absolute inset-x-5 bottom-5 font-display text-4xl leading-none text-paper">{a.title}</h2>
              </div>
              <p className="mt-4 text-muted">{a.summary}</p>
            </Link>
          </Reveal>
        ))}
      </section>
      <Cta s={db.settings} />
    </>
  );
}
