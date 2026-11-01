"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Plus, ArrowLeft, ArrowRight, Star } from "lucide-react";
import type { Attorney, CaseResult, Faq, PracticeArea, Post, Settings, Testimonial } from "@/lib/types";
import { fmtDate } from "@/lib/format";
import { Counter, EASE, ImageReveal, Magnetic, Reveal, ScrollWord, SplitWords } from "../motion";

/* ───────────────────────── Section heading ───────────────────────── */
export function SectionHead({
  index,
  eyebrow,
  title,
  aside,
  dark,
}: {
  index?: string;
  eyebrow: string;
  title: string;
  aside?: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div className="mb-12 grid gap-6 md:mb-16 md:grid-cols-12 md:items-end">
      <div className="md:col-span-8">
        <Reveal>
          <p className={`eyebrow flex items-center gap-3 ${dark ? "text-paper/50" : "text-muted"}`}>
            {index && <span className="text-accent">{index}</span>}
            <span className={`h-px w-8 ${dark ? "bg-paper/30" : "bg-ink/25"}`} />
            {eyebrow}
          </p>
        </Reveal>
        <h2 className="display-md mt-4">
          <SplitWords text={title} />
        </h2>
      </div>
      {aside && <Reveal className="md:col-span-4 md:justify-self-end">{aside}</Reveal>}
    </div>
  );
}

/* ───────────────────────── Marquee ───────────────────────── */
export function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <section className="border-y hairline overflow-hidden py-6" aria-label="Recognition">
      <div className="flex w-max animate-marquee gap-12 hover:[animation-play-state:paused]">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-12 whitespace-nowrap font-serif text-2xl text-ink/70 md:text-3xl">
            {t}
            <span className="text-accent">✦</span>
          </span>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── Statement (scroll-linked words) ───────────────────────── */
export function Statement({ s }: { s: Settings }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = s.statement.text.split(" ");
  return (
    <section className="container-x py-24 md:py-40">
      <div ref={ref} className="mx-auto max-w-5xl">
        <p className="eyebrow mb-8 text-muted">Our conviction</p>
        <p className="font-serif text-[clamp(1.9rem,4.6vw,4rem)] leading-[1.08] tracking-[-0.02em]">
          {words.map((w, i) => {
            const start = i / words.length;
            return (
              <ScrollWord key={i} progress={scrollYProgress} range={[start, start + 1 / words.length]}>
                {w}
              </ScrollWord>
            );
          })}
        </p>
        <Reveal>
          <p className="mt-10 text-muted">{s.statement.signature}</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ───────────────────────── Practice list w/ cursor-follow image ───────────────────────── */
export function PracticeList({ areas }: { areas: PracticeArea[] }) {
  const [active, setActive] = useState<number | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 150, damping: 20 });
  const sy = useSpring(y, { stiffness: 150, damping: 20 });
  const wrap = useRef<HTMLDivElement>(null);

  return (
    <section className="container-x py-20 md:py-32" id="practice">
      <SectionHead
        index="01"
        eyebrow="Practice areas"
        title="Counsel for every chapter of business and life."
        aside={
          <Link href="/practice-areas" className="group inline-flex items-center gap-2 text-sm">
            <span className="link-underline">All practice areas</span>
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
          </Link>
        }
      />
      <div
        ref={wrap}
        className="relative"
        onPointerMove={(e) => {
          const r = wrap.current!.getBoundingClientRect();
          x.set(e.clientX - r.left);
          y.set(e.clientY - r.top);
        }}
        onPointerLeave={() => setActive(null)}
      >
        <ul className="border-t hairline">
          {areas.map((a, i) => (
            <li key={a.id} className="border-b hairline" onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}>
              <Link href={`/practice-areas/${a.slug}`} className="group relative block overflow-hidden" data-cursor="Open">
                <span className="absolute inset-0 origin-bottom scale-y-0 bg-ink transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100" />
                <div className="relative grid grid-cols-[auto_1fr_auto] items-center gap-4 py-6 transition-colors duration-500 group-hover:text-paper md:gap-10 md:px-6 md:py-9">
                  <span className="font-mono text-xs text-muted transition-colors group-hover:text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-serif text-[clamp(1.75rem,4.5vw,3.75rem)] leading-none tracking-tight transition-transform duration-700 group-hover:translate-x-2 md:group-hover:translate-x-4">
                      {a.title}
                    </h3>
                    <p className="mt-2 max-w-xl text-sm text-muted transition-colors group-hover:text-paper/60 md:text-[15px]">
                      {a.summary}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl md:hidden">
                      <Image src={a.image} alt="" fill sizes="56px" className="object-cover" />
                    </div>
                    <span className="hidden h-12 w-12 place-items-center rounded-full border border-current/20 transition-all duration-500 group-hover:rotate-45 group-hover:border-accent group-hover:bg-accent group-hover:text-ink md:grid">
                      <ArrowUpRight className="h-5 w-5" />
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {/* floating preview (desktop) */}
        <motion.div className="pointer-events-none absolute left-0 top-0 z-10 hidden md:block" style={{ x: sx, y: sy }}>
          <motion.div
            className="relative h-64 w-52 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl shadow-2xl lg:h-80 lg:w-64"
            animate={{ opacity: active === null ? 0 : 1, scale: active === null ? 0.6 : 1, rotate: active === null ? -8 : 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <AnimatePresence mode="popLayout">
              {active !== null && (
                <motion.div
                  key={active}
                  className="absolute inset-0"
                  initial={{ y: "100%" }}
                  animate={{ y: "0%" }}
                  exit={{ y: "-100%" }}
                  transition={{ duration: 0.55, ease: EASE }}
                >
                  <Image src={areas[active].image} alt="" fill sizes="260px" className="object-cover" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────────────────── Stats ───────────────────────── */
export function Stats({ s }: { s: Settings }) {
  return (
    <section className="bg-ink py-20 text-paper md:py-28">
      <div className="container-x grid grid-cols-2 gap-y-12 md:grid-cols-4">
        {s.stats.map((st, i) => (
          <Reveal key={i} delay={i * 0.08} className="border-l border-white/15 pl-5 md:pl-8">
            <Counter value={st.value} suffix={st.suffix} className="block font-serif text-[clamp(3rem,7vw,6rem)] leading-none tracking-tight" />
            <p className="mt-3 text-sm text-paper/60">{st.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── Approach (horizontal pin on desktop, stacked cards on mobile) ───────────────────────── */
export function Approach({ s }: { s: Settings }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const steps = s.approach.steps;
  const x = useTransform(scrollYProgress, [0.05, 0.95], ["0%", `-${((steps.length - 1) / (steps.length + 0.6)) * 100}%`]);
  const bar = useTransform(scrollYProgress, [0.05, 0.95], ["0%", "100%"]);

  return (
    <section className="bg-ink text-paper">
      {/* mobile: sticky stacking cards */}
      <div className="container-x pb-20 pt-4 md:hidden">
        <SectionHead index="02" eyebrow="Our approach" title={s.approach.title} dark />
        <div className="relative">
          {steps.map((st, i) => (
            <div key={i} className="sticky" style={{ top: 90 + i * 14 }}>
              <div
                className="mb-5 rounded-[var(--radius)] border border-white/10 p-6"
                style={{ background: `color-mix(in oklab, var(--ink) ${92 - i * 4}%, white)` }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-10 font-serif text-5xl">{st.title}</h3>
                <p className="mt-4 text-paper/65">{st.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* desktop: pinned horizontal track */}
      <div ref={ref} className="relative hidden md:block" style={{ height: `${steps.length * 75}vh` }}>
        <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
          <div className="container-x">
            <div className="mb-14 flex items-end justify-between gap-10">
              <div>
                <p className="eyebrow flex items-center gap-3 text-paper/50">
                  <span className="text-accent">02</span>
                  <span className="h-px w-8 bg-paper/30" /> Our approach
                </p>
                <h2 className="display-md mt-4 max-w-2xl">{s.approach.title}</h2>
              </div>
              <div className="h-px w-56 bg-white/15">
                <motion.div className="h-px bg-accent" style={{ width: bar }} />
              </div>
            </div>
          </div>
          <motion.div className="flex gap-6 pl-[max(2.5rem,calc((100vw-1440px)/2+3.5rem))]" style={{ x }}>
            {steps.map((st, i) => (
              <div
                key={i}
                className="group relative flex h-[52vh] w-[min(34vw,460px)] shrink-0 flex-col justify-between rounded-[var(--radius)] border border-white/10 bg-white/[0.03] p-9 transition-colors duration-500 hover:bg-white/[0.07]"
              >
                <span className="font-mono text-xs text-accent">
                  {String(i + 1).padStart(2, "0")} — {String(steps.length).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-serif text-6xl tracking-tight lg:text-7xl">{st.title}</h3>
                  <p className="mt-5 max-w-sm text-paper/60">{st.body}</p>
                </div>
                <span className="absolute right-8 top-6 font-serif text-[9rem] leading-none text-white/[0.04] transition-colors group-hover:text-accent/10">
                  {i + 1}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Image reveal (inset → full-bleed) ───────────────────────── */
export function RevealImage({ s }: { s: Settings }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const inset = useTransform(scrollYProgress, [0, 0.85], [14, 0]);
  const radius = useTransform(scrollYProgress, [0, 0.85], [40, 0]);
  const clip = useTransform([inset, radius], ([i, r]) => `inset(${i}% ${i}% ${i}% ${i}% round ${r}px)`);
  const scale = useTransform(scrollYProgress, [0, 1], [1.3, 1]);
  const textOpacity = useTransform(scrollYProgress, [0.55, 0.95], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.55, 0.95], [40, 0]);

  return (
    <section ref={ref} className="relative h-[160svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <motion.div className="absolute inset-0" style={{ clipPath: clip }}>
          <motion.div className="absolute inset-0" style={{ scale }}>
            <Image src={s.reveal.image} alt="" fill sizes="100vw" className="object-cover" />
          </motion.div>
          <div className="absolute inset-0 bg-ink/45" />
        </motion.div>
        <motion.div
          className="container-x absolute inset-x-0 bottom-12 text-paper md:bottom-20"
          style={{ opacity: textOpacity, y: textY }}
        >
          <p className="eyebrow text-paper/60">{s.reveal.eyebrow}</p>
          <h2 className="display-lg mt-4 max-w-4xl">{s.reveal.title}</h2>
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────────────────── Attorneys ───────────────────────── */
export function AttorneysRow({ people }: { people: Attorney[] }) {
  return (
    <section className="py-20 md:py-32">
      <div className="container-x">
        <SectionHead
          index="03"
          eyebrow="Our people"
          title="Partners who pick up the phone."
          aside={
            <Link href="/attorneys" className="group inline-flex items-center gap-2 text-sm">
              <span className="link-underline">Meet the full team</span>
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
            </Link>
          }
        />
      </div>
      <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 md:container-x md:grid md:grid-cols-3 md:gap-6 md:overflow-visible lg:grid-cols-4">
        {people.slice(0, 4).map((p, i) => (
          <Reveal key={p.id} delay={i * 0.08} className="w-[78vw] shrink-0 snap-start sm:w-[46vw] md:w-auto">
            <AttorneyCard p={p} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function AttorneyCard({ p }: { p: Attorney }) {
  return (
    <Link href={`/attorneys/${p.slug}`} className="group block" data-cursor="Profile">
      <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius)] bg-paper-2">
        <Image
          src={p.image}
          alt={p.name}
          fill
          sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 78vw"
          className="object-cover grayscale transition-all duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 group-hover:grayscale-0"
        />
        <div className="absolute inset-x-3 bottom-3 flex translate-y-3 items-center justify-between rounded-2xl bg-paper/90 px-4 py-3 opacity-0 backdrop-blur transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="text-xs text-muted">{p.practiceAreas[0]}</span>
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>
      <h3 className="mt-4 font-serif text-2xl leading-tight">{p.name}</h3>
      <p className="text-sm text-muted">{p.role}</p>
    </Link>
  );
}

/* ───────────────────────── Case results ───────────────────────── */
export function Results({ results }: { results: CaseResult[] }) {
  return (
    <section className="container-x py-20 md:py-32">
      <SectionHead index="04" eyebrow="Selected results" title="Outcomes, not hours." />
      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
        {results.map((r, i) => (
          <Reveal key={r.id} delay={(i % 2) * 0.1}>
            <TiltCard>
              <div className="flex h-full flex-col justify-between gap-12 rounded-[var(--radius)] border hairline bg-paper-2/60 p-7 transition-colors duration-500 hover:bg-ink hover:text-paper md:p-10">
                <div className="flex items-center justify-between text-xs">
                  <span className="rounded-full border border-current/20 px-3 py-1">{r.category}</span>
                  <span className="font-mono opacity-60">{r.year}</span>
                </div>
                <div>
                  <p className="font-serif text-[clamp(3rem,7vw,5.5rem)] leading-none tracking-tight text-accent">{r.amount}</p>
                  <h3 className="mt-4 text-xl font-medium tracking-tight">{r.title}</h3>
                  <p className="mt-2 text-sm opacity-60">{r.summary}</p>
                </div>
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
      <p className="mt-6 text-xs text-muted">
        Prior results do not guarantee a similar outcome. Client identities withheld for confidentiality.
      </p>
    </section>
  );
}

function TiltCard({ children }: { children: React.ReactNode }) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 20 });
  const sry = useSpring(ry, { stiffness: 200, damping: 20 });
  return (
    <motion.div
      className="h-full [perspective:1000px]"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        ry.set(((e.clientX - r.left) / r.width - 0.5) * 6);
        rx.set(-((e.clientY - r.top) / r.height - 0.5) * 6);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      <motion.div className="h-full" style={{ rotateX: srx, rotateY: sry }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ───────────────────────── Testimonials ───────────────────────── */
export function Testimonials({ items }: { items: Testimonial[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = items.length;
  useEffect(() => {
    if (paused || n < 2) return;
    const id = setTimeout(() => setI((v) => (v + 1) % n), 7000);
    return () => clearTimeout(id);
  }, [i, paused, n]);
  if (!n) return null;
  const t = items[i];

  return (
    <section
      className="bg-paper-2/70 py-20 md:py-32"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <div className="container-x">
        <p className="eyebrow flex items-center gap-3 text-muted">
          <span className="text-accent">05</span>
          <span className="h-px w-8 bg-ink/25" /> Client voices
        </p>
        <motion.div
          className="mt-10 min-h-[22rem] cursor-grab active:cursor-grabbing md:min-h-[20rem]"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60) setI((v) => (v + 1) % n);
            if (info.offset.x > 60) setI((v) => (v - 1 + n) % n);
          }}
        >
          <AnimatePresence mode="wait">
            <motion.figure
              key={t.id}
              initial="hidden"
              animate="show"
              exit="exit"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.025 } }, exit: { opacity: 0, transition: { duration: 0.3 } } }}
            >
              <blockquote className="font-serif text-[clamp(1.8rem,4.4vw,3.8rem)] leading-[1.08] tracking-[-0.02em]">
                <span className="text-accent">“</span>
                {t.quote.split(" ").map((w, k) => (
                  <motion.span
                    key={k}
                    className="inline-block"
                    variants={{
                      hidden: { opacity: 0, y: 12, filter: "blur(8px)" },
                      show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: EASE } },
                    }}
                  >
                    {w}&nbsp;
                  </motion.span>
                ))}
                <span className="text-accent">”</span>
              </blockquote>
              <motion.figcaption
                className="mt-8 flex items-center gap-4"
                variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { delay: 0.4 } } }}
              >
                <span className="grid h-12 w-12 place-items-center rounded-full bg-ink font-serif text-lg text-paper">
                  {t.name.charAt(0)}
                </span>
                <span>
                  <span className="block font-medium">{t.name}</span>
                  <span className="text-sm text-muted">{t.role}</span>
                </span>
                <span className="ml-auto hidden gap-0.5 text-accent sm:flex">
                  {Array.from({ length: t.rating }).map((_, k) => (
                    <Star key={k} className="h-4 w-4 fill-current" />
                  ))}
                </span>
              </motion.figcaption>
            </motion.figure>
          </AnimatePresence>
        </motion.div>

        <div className="mt-10 flex items-center gap-4">
          <button
            onClick={() => setI((v) => (v - 1 + n) % n)}
            aria-label="Previous"
            className="grid h-12 w-12 place-items-center rounded-full border hairline transition-colors hover:bg-ink hover:text-paper"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setI((v) => (v + 1) % n)}
            aria-label="Next"
            className="grid h-12 w-12 place-items-center rounded-full border hairline transition-colors hover:bg-ink hover:text-paper"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
          <div className="ml-4 flex flex-1 gap-2">
            {items.map((_, k) => (
              <button key={k} onClick={() => setI(k)} aria-label={`Testimonial ${k + 1}`} className="relative h-[3px] flex-1 overflow-hidden rounded bg-ink/10">
                {k === i && (
                  <motion.span
                    className="absolute inset-y-0 left-0 bg-ink"
                    initial={{ width: "0%" }}
                    animate={{ width: paused ? "100%" : "100%" }}
                    transition={{ duration: paused ? 0.3 : 7, ease: "linear" }}
                  />
                )}
                {k < i && <span className="absolute inset-0 bg-ink/40" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Insights ───────────────────────── */
export function InsightsGrid({ posts, title = "Thinking out loud." }: { posts: Post[]; title?: string }) {
  if (!posts.length) return null;
  const [lead, ...rest] = posts;
  return (
    <section className="container-x py-20 md:py-32">
      <SectionHead
        index="06"
        eyebrow="Insights"
        title={title}
        aside={
          <Link href="/insights" className="group inline-flex items-center gap-2 text-sm">
            <span className="link-underline">All insights</span>
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
          </Link>
        }
      />
      <div className="grid gap-10 md:grid-cols-12 md:gap-8">
        <Reveal className="md:col-span-7">
          <Link href={`/insights/${lead.slug}`} className="group block" data-cursor="Read">
            <ImageReveal className="relative aspect-[16/11] overflow-hidden rounded-[var(--radius)]">
              <Image src={lead.cover} alt="" fill sizes="(min-width:768px) 58vw, 100vw" className="object-cover transition-transform duration-[1.4s] group-hover:scale-105" />
            </ImageReveal>
            <div className="mt-5 flex items-center gap-3 text-xs text-muted">
              <span className="rounded-full bg-ink px-3 py-1 text-paper">{lead.category}</span>
              <span>{fmtDate(lead.publishedAt)}</span>
              <span>· {lead.readMinutes} min read</span>
            </div>
            <h3 className="mt-3 font-serif text-[clamp(1.8rem,3.4vw,2.8rem)] leading-[1.05] tracking-tight group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
              {lead.title}
            </h3>
            <p className="mt-3 max-w-xl text-muted">{lead.excerpt}</p>
          </Link>
        </Reveal>
        <div className="flex flex-col md:col-span-5">
          {rest.slice(0, 3).map((p, i) => (
            <Reveal key={p.id} delay={i * 0.08}>
              <Link href={`/insights/${p.slug}`} className="group grid grid-cols-[1fr_96px] gap-5 border-t hairline py-6 md:grid-cols-[1fr_120px]">
                <div>
                  <p className="text-xs text-muted">
                    {p.category} · {fmtDate(p.publishedAt)}
                  </p>
                  <h4 className="mt-2 font-serif text-2xl leading-tight transition-colors group-hover:text-accent">{p.title}</h4>
                </div>
                <div className="relative aspect-square overflow-hidden rounded-2xl">
                  <Image src={p.cover} alt="" fill sizes="120px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── FAQ ───────────────────────── */
export function FaqList({ faqs, withHead = true }: { faqs: Faq[]; withHead?: boolean }) {
  const [open, setOpen] = useState<string | null>(faqs[0]?.id ?? null);
  return (
    <section className={withHead ? "container-x py-20 md:py-32" : ""}>
      <div className={withHead ? "grid gap-10 md:grid-cols-12" : ""}>
        {withHead && (
          <div className="md:col-span-4">
            <p className="eyebrow flex items-center gap-3 text-muted">
              <span className="text-accent">07</span>
              <span className="h-px w-8 bg-ink/25" /> FAQ
            </p>
            <h2 className="display-md mt-4">
              <SplitWords text="Questions, answered plainly." />
            </h2>
          </div>
        )}
        <ul className={`${withHead ? "md:col-span-8" : ""} border-t hairline`}>
          {faqs.map((f) => {
            const isOpen = open === f.id;
            return (
              <li key={f.id} className="border-b hairline">
                <button
                  onClick={() => setOpen(isOpen ? null : f.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span className="text-lg font-medium tracking-tight md:text-xl">{f.question}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0, backgroundColor: isOpen ? "var(--ink)" : "rgba(0,0,0,0)", color: isOpen ? "var(--paper)" : "var(--ink)" }}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full border hairline"
                  >
                    <Plus className="h-4 w-4" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-7 text-ink/70">{f.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ───────────────────────── CTA ───────────────────────── */
export function Cta({ s }: { s: Settings }) {
  return (
    <section className="relative overflow-hidden bg-accent text-ink">
      <div className="pointer-events-none absolute inset-0 flex items-center opacity-[0.07]" aria-hidden>
        <div className="flex w-max animate-marquee whitespace-nowrap font-serif text-[30vw] leading-none">
          <span>Let&apos;s talk · Let&apos;s talk ·&nbsp;</span>
          <span>Let&apos;s talk · Let&apos;s talk ·&nbsp;</span>
        </div>
      </div>
      <div className="container-x relative grid gap-12 py-24 md:grid-cols-12 md:items-center md:py-36">
        <div className="md:col-span-8">
          <h2 className="display-lg">
            <SplitWords text={s.cta.title} />
          </h2>
          <Reveal>
            <p className="lede mt-6 max-w-xl text-ink/70">{s.cta.subtitle}</p>
          </Reveal>
        </div>
        <div className="flex md:col-span-4 md:justify-end">
          <Magnetic strength={0.45}>
            <Link
              href="/book"
              className="group relative grid h-44 w-44 place-items-center overflow-hidden rounded-full bg-ink text-center text-paper md:h-56 md:w-56"
            >
              <span className="absolute inset-0 origin-bottom scale-0 rounded-full bg-paper transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-100" />
              <span className="relative z-10 flex flex-col items-center gap-2 px-6 text-[15px] font-medium transition-colors duration-500 group-hover:text-ink">
                <ArrowUpRight className="h-6 w-6 transition-transform duration-500 group-hover:rotate-45" />
                {s.cta.button}
              </span>
            </Link>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
