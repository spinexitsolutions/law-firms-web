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
import { ArrowUpRight, ArrowDown } from "lucide-react";
import type { Attorney, PracticeArea, Settings } from "@/lib/types";
import { EASE, Magnetic } from "../motion";
import { useIntro } from "../IntroContext";

/**
 * "The Stage" hero.
 * A dark full-height stage with a slowly drifting gallery of image columns
 * that reacts to the pointer, a rotating word set inside an accent capsule
 * that resizes itself, and a floating "speak to a partner" card.
 * On scroll the whole stage shrinks into a rounded card (Apple-style).
 */
export function Hero({
  s,
  attorneys,
  areas,
}: {
  s: Settings;
  attorneys: Attorney[];
  areas: PracticeArea[];
}) {
  const { done } = useIntro();
  const ref = useRef<HTMLElement>(null);

  /* scroll: stage shrinks into a card */
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.86]);
  const radius = useTransform(scrollYProgress, [0, 0.4], [0, 44]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const galleryY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  /* pointer parallax for the gallery + accent glow */
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const gx = useSpring(useTransform(px, [-1, 1], [24, -24]), { stiffness: 60, damping: 20 });
  const gy = useSpring(useTransform(py, [-1, 1], [18, -18]), { stiffness: 60, damping: 20 });
  const glowX = useSpring(useTransform(px, [-1, 1], ["15%", "85%"]), { stiffness: 40, damping: 20 });
  const glowY = useSpring(useTransform(py, [-1, 1], ["40%", "95%"]), { stiffness: 40, damping: 20 });

  /* rotating word */
  const words = s.hero.rotatingWords.length ? s.hero.rotatingWords : ["clarity"];
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!done) return;
    const id = setInterval(() => setW((v) => (v + 1) % words.length), 2400);
    return () => clearInterval(id);
  }, [done, words.length]);

  /* gallery columns */
  const pool = [s.hero.image, ...areas.map((a) => a.image), s.reveal.image, s.about.image].filter(Boolean);
  const cols = [0, 1, 2, 3].map((c) => {
    const imgs = pool.filter((_, i) => i % 4 === c);
    while (imgs.length < 3) imgs.push(pool[(c * 3 + imgs.length) % pool.length]);
    return imgs;
  });

  const show = (d: number) => ({
    initial: { opacity: 0, y: 30, filter: "blur(10px)" },
    animate: done ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined,
    transition: { duration: 1.1, ease: EASE, delay: d },
  });

  const team = attorneys.slice(0, 4);

  return (
    <section
      ref={ref}
      className="relative h-[100svh] min-h-[700px] bg-paper"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        px.set((e.clientX / window.innerWidth) * 2 - 1);
        py.set((e.clientY / window.innerHeight) * 2 - 1);
      }}
    >
      <motion.div
        className="relative h-full origin-top overflow-hidden bg-ink text-paper will-change-transform"
        style={{ scale, borderBottomLeftRadius: radius, borderBottomRightRadius: radius }}
      >
        {/* ── drifting gallery ── */}
        <motion.div className="absolute -inset-10" style={{ x: gx, y: gy }}>
          <motion.div
            className="absolute inset-0 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"
            style={{ y: galleryY }}
            initial={{ opacity: 0, scale: 1.15 }}
            animate={done ? { opacity: 1, scale: 1 } : undefined}
            transition={{ duration: 2, ease: EASE }}
          >
            {cols.map((imgs, c) => (
              <div key={c} className={`relative overflow-hidden ${c > 1 ? "hidden md:block" : ""}`}>
                <div
                  className={`flex flex-col gap-3 md:gap-4 ${c % 2 ? "col-down" : "col-up"}`}
                  style={{ ["--dur" as string]: `${70 + c * 12}s` }}
                >
                  {[...imgs, ...imgs].map((src, i) => (
                    <div key={i} className="relative aspect-[3/4] w-full shrink-0 overflow-hidden rounded-[18px]">
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="(min-width:768px) 25vw, 50vw"
                        priority={i < 2}
                        className="object-cover grayscale-[60%]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── atmosphere ── */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-ink/70" />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute h-[70vmax] w-[70vmax] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-3xl"
          style={{
            left: glowX,
            top: glowY,
            background: "radial-gradient(circle, var(--accent) 0%, transparent 60%)",
          }}
        />

        {/* ── content ── */}
        <motion.div
          className="container-x relative flex h-full flex-col justify-end pb-8 pt-28 md:pb-12"
          style={{ y: contentY, opacity: contentOpacity }}
        >
          <motion.div className="flex flex-wrap items-center gap-2 [@media(min-width:1024px)_and_(max-height:820px)]:hidden" {...show(0)}>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              Partners available today
            </span>
            <span className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-paper/70">{s.hero.eyebrow}</span>
          </motion.div>

          <h1 className="mt-6 max-w-[14ch] font-display text-[clamp(3rem,10vw,9.25rem)] lg:text-[min(7.4vw,12.5svh)] font-medium leading-[0.9] tracking-[-0.06em] md:mt-8">
            <Line text={s.hero.titleTop} done={done} delay={0.1} />{" "}
            <motion.span
              layout
              className="relative inline-flex items-center overflow-hidden rounded-[0.32em] bg-accent px-[0.22em] pb-[0.04em] align-bottom text-ink"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={done ? { opacity: 1, scale: 1 } : undefined}
              transition={{ layout: { duration: 0.6, ease: EASE }, duration: 0.9, ease: EASE, delay: 0.45 }}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={words[w]}
                  className="block"
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  exit={{ y: "-110%" }}
                  transition={{ duration: 0.6, ease: EASE }}
                >
                  {words[w]}
                </motion.span>
              </AnimatePresence>
            </motion.span>{" "}
            <Line text={s.hero.titleBottom} done={done} delay={0.6} className="text-paper/45" />
          </h1>

          <div className="mt-8 grid gap-6 md:mt-10 lg:grid-cols-12 lg:items-end [@media(max-height:820px)]:mt-6">
            <motion.div className="lg:col-span-6" {...show(0.8)}>
              <p className="lede max-w-xl text-paper/70">{s.hero.subtitle}</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Magnetic>
                  <Link
                    href={s.hero.primaryHref}
                    className="group flex h-14 items-center justify-center gap-3 rounded-full bg-accent pl-6 pr-2 text-[15px] font-semibold text-ink transition-shadow hover:shadow-[0_10px_40px_-8px_var(--accent)]"
                  >
                    {s.hero.primaryCta}
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-paper transition-transform duration-500 group-hover:rotate-45">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </Link>
                </Magnetic>
                <Link
                  href={s.hero.secondaryHref}
                  className="flex h-14 items-center justify-center rounded-full border border-white/20 px-6 text-[15px] font-medium backdrop-blur transition-colors hover:bg-paper hover:text-ink"
                >
                  {s.hero.secondaryCta}
                </Link>
              </div>
            </motion.div>

            {/* partner card */}
            <motion.div className="hidden sm:block lg:col-span-5 lg:col-start-8" {...show(1)}>
              <div className="rounded-[26px] border border-white/10 bg-white/[0.07] p-5 backdrop-blur-xl md:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex -space-x-3">
                    {team.map((p, i) => (
                      <motion.span
                        key={p.id}
                        className="relative h-11 w-11 overflow-hidden rounded-full ring-2 ring-ink"
                        initial={{ scale: 0 }}
                        animate={done ? { scale: 1 } : undefined}
                        transition={{ type: "spring", stiffness: 300, damping: 18, delay: 1.2 + i * 0.08 }}
                      >
                        <Image src={p.image} alt={p.name} fill sizes="44px" className="object-cover" />
                      </motion.span>
                    ))}
                  </div>
                  <div className="text-right">
                    <p className="font-display text-3xl font-medium leading-none tracking-tight">
                      {s.stats[2]?.value}
                      {s.stats[2]?.suffix}
                    </p>
                    <p className="mt-1 text-xs text-paper/55">{s.stats[2]?.label}</p>
                  </div>
                </div>
                <p className="mt-5 text-[15px] font-medium">Speak to a partner — avg. reply under 2 hours.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {areas.slice(0, 5).map((a) => (
                    <Link
                      key={a.id}
                      href={`/book?area=${encodeURIComponent(a.title)}`}
                      className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-paper/80 transition-colors hover:border-accent hover:bg-accent hover:text-ink"
                    >
                      {a.title}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* bottom rail */}
          <motion.div
            className="mt-8 flex items-center justify-between border-t border-white/10 pt-5 text-xs text-paper/50 md:mt-10 [@media(max-height:820px)]:mt-5 [@media(max-height:820px)]:pt-4"
            initial={{ opacity: 0 }}
            animate={done ? { opacity: 1 } : undefined}
            transition={{ delay: 1.3, duration: 1 }}
          >
            <span>
              {s.stats[1]?.value.toLocaleString("en-IN")}
              {s.stats[1]?.suffix} {s.stats[1]?.label.toLowerCase()} since {s.brand.founded}
            </span>
            <span className="flex items-center gap-2">
              Scroll
              <span className="grid h-7 w-7 place-items-center rounded-full border border-white/20">
                <ArrowDown className="h-3 w-3 animate-bounce" />
              </span>
            </span>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

function Line({ text, done, delay, className }: { text: string; done: boolean; delay: number; className?: string }) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((wd, i) => (
        <span key={i} className="-mb-[0.1em] inline-block overflow-hidden pb-[0.1em] align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "105%" }}
            animate={done ? { y: "0%" } : undefined}
            transition={{ duration: 1.1, ease: EASE, delay: delay + i * 0.07 }}
          >
            {wd}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
