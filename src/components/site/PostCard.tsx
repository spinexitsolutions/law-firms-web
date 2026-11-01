import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/types";
import { fmtDate } from "@/lib/format";

export function PostCard({ p }: { p: Post }) {
  return (
    <Link href={`/insights/${p.slug}`} className="group block" data-cursor="Read">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius)]">
        <Image src={p.cover} alt="" fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition-transform duration-[1.4s] group-hover:scale-105" />
        <span className="absolute left-4 top-4 rounded-full bg-paper/90 px-3 py-1 text-xs backdrop-blur">{p.category}</span>
      </div>
      <p className="mt-4 text-xs text-muted">
        {fmtDate(p.publishedAt)} · {p.readMinutes} min read · {p.author}
      </p>
      <h3 className="mt-2 font-display text-[1.75rem] leading-[1.08] tracking-tight transition-colors group-hover:text-accent">{p.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-muted">{p.excerpt}</p>
    </Link>
  );
}
