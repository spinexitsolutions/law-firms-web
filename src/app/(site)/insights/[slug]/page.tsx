import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDB } from "@/lib/db";
import { fmtDate } from "@/lib/format";
import { SplitWords } from "@/components/site/motion";
import { ReadingProgress, ShareButtons } from "@/components/site/ReadingProgress";
import { PostCard } from "@/components/site/PostCard";
import { ImageReveal } from "@/components/site/motion";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = (await getDB()).posts.find((x) => x.slug === slug);
  return p ? { title: p.title, description: p.excerpt, openGraph: { images: [p.cover] } } : {};
}

function Markdown({ text }: { text: string }) {
  return (
    <div className="prose-legal">
      {text.split(/\n{2,}/).map((block, i) => {
        const b = block.trim();
        if (b.startsWith("## ")) return <h2 key={i}>{b.slice(3)}</h2>;
        if (b.startsWith("- "))
          return (
            <ul key={i} className="mb-5 list-disc pl-6">
              {b.split("\n").map((l, k) => (
                <li key={k} className="mb-1 text-[1.05rem] leading-relaxed">{l.replace(/^- /, "")}</li>
              ))}
            </ul>
          );
        return <p key={i}>{b}</p>;
      })}
    </div>
  );
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const db = await getDB();
  const p = db.posts.find((x) => x.slug === slug && x.published);
  if (!p) notFound();
  const author = db.attorneys.find((a) => a.name === p.author);
  const related = db.posts.filter((x) => x.published && x.id !== p.id).slice(0, 3);

  return (
    <article>
      <ReadingProgress />
      <header className="container-x max-w-5xl pb-10 pt-32 md:pt-44">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
          <Link href="/insights" className="hover:text-ink">← Insights</Link>
          <span className="rounded-full bg-ink px-3 py-1 text-paper">{p.category}</span>
          <span>{fmtDate(p.publishedAt)}</span>
          <span>· {p.readMinutes} min read</span>
        </div>
        <h1 className="display-md mt-6">
          <SplitWords text={p.title} afterIntro stagger={0.03} />
        </h1>
        <p className="lede mt-6 text-ink/70">{p.excerpt}</p>
      </header>
      <div className="container-x">
        <ImageReveal className="relative aspect-[16/9] overflow-hidden rounded-[var(--radius)]">
          <Image src={p.cover} alt="" fill priority sizes="100vw" className="object-cover" />
        </ImageReveal>
      </div>
      <div className="container-x grid max-w-6xl gap-12 py-16 md:grid-cols-12 md:py-24">
        <aside className="md:col-span-3">
          <div className="md:sticky md:top-28">
            {author ? (
              <Link href={`/attorneys/${author.slug}`} className="flex items-center gap-3">
                <span className="relative h-12 w-12 overflow-hidden rounded-full">
                  <Image src={author.image} alt="" fill sizes="48px" className="object-cover" />
                </span>
                <span>
                  <span className="block text-sm font-medium">{author.name}</span>
                  <span className="text-xs text-muted">{author.role}</span>
                </span>
              </Link>
            ) : (
              <p className="text-sm">{p.author}</p>
            )}
            <div className="mt-6">
              <ShareButtons title={p.title} />
            </div>
          </div>
        </aside>
        <div className="md:col-span-8 md:col-start-5">
          <Markdown text={p.body} />
          <p className="mt-12 rounded-2xl bg-paper-2 p-5 text-sm text-muted">
            This article is for general information only and is not legal advice. For advice on your situation,{" "}
            <Link href="/book" className="text-ink underline">book a consultation</Link>.
          </p>
        </div>
      </div>
      {related.length > 0 && (
        <section className="container-x border-t hairline py-20">
          <h2 className="display-sm mb-10">Keep reading</h2>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <PostCard key={r.id} p={r} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
