import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import { getDB } from "@/lib/db";
import { Reveal, SplitWords } from "@/components/site/motion";
import { PostCard } from "@/components/site/PostCard";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = (await getDB()).attorneys.find((x) => x.slug === slug);
  return p ? { title: p.name, description: `${p.role} — ${p.bio.slice(0, 140)}` } : {};
}

export default async function AttorneyPage({ params }: Props) {
  const { slug } = await params;
  const db = await getDB();
  const p = db.attorneys.find((x) => x.slug === slug && x.published);
  if (!p) notFound();
  const posts = db.posts.filter((x) => x.published && x.author === p.name);

  const lists: [string, string[]][] = [
    ["Practice areas", p.practiceAreas],
    ["Education", p.education],
    ["Bar admissions", p.barAdmissions],
    ["Languages", p.languages],
  ];

  return (
    <>
      <section className="container-x grid gap-10 pb-20 pt-28 md:grid-cols-12 md:gap-16 md:pt-40">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-28">
            <Reveal className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius)]">
              <Image src={p.image} alt={p.name} fill priority sizes="(min-width:768px) 40vw, 100vw" className="object-cover" />
            </Reveal>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <a href={`mailto:${p.email}`} className="flex h-12 items-center justify-center gap-2 rounded-full border hairline text-sm hover:bg-ink hover:text-paper">
                <Mail className="h-4 w-4" /> Email
              </a>
              <a href={`tel:${p.phone.replace(/\s/g, "")}`} className="flex h-12 items-center justify-center gap-2 rounded-full border hairline text-sm hover:bg-ink hover:text-paper">
                <Phone className="h-4 w-4" /> Call
              </a>
            </div>
          </div>
        </div>
        <div className="md:col-span-7">
          <p className="eyebrow text-muted">{p.role}</p>
          <h1 className="display-lg mt-4">
            <SplitWords text={p.name} afterIntro />
          </h1>
          <Reveal>
            <p className="mt-8 font-display text-[clamp(1.4rem,2.4vw,2rem)] leading-snug tracking-tight">{p.bio}</p>
          </Reveal>
          <dl className="mt-14 border-t hairline">
            {lists.filter(([, v]) => v.length).map(([k, v]) => (
              <Reveal key={k} className="grid gap-2 border-b hairline py-6 sm:grid-cols-3">
                <dt className="eyebrow text-muted">{k}</dt>
                <dd className="space-y-1 sm:col-span-2">
                  {v.map((x) => (
                    <p key={x}>{x}</p>
                  ))}
                </dd>
              </Reveal>
            ))}
          </dl>
          <Link
            href={`/book?attorney=${encodeURIComponent(p.name)}`}
            className="group mt-10 inline-flex h-14 items-center gap-3 rounded-full bg-ink pl-6 pr-2 font-medium text-paper"
          >
            Book a consultation with {p.name.split(" ")[0]}
            <span className="grid h-10 w-10 place-items-center rounded-full bg-accent text-ink transition-transform group-hover:rotate-45">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </section>
      {posts.length > 0 && (
        <section className="container-x pb-24">
          <h2 className="display-sm mb-8">Writing by {p.name.split(" ")[0]}</h2>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((x) => (
              <PostCard key={x.id} p={x} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
