"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ArrowDown } from "lucide-react";
import type { Settings } from "@/lib/types";
import { EASE, Magnetic, SplitWords } from "../motion";
import { useIntro } from "../IntroContext";

export function Hero({ s }: { s: Settings }) {
  const { done } = useIntro();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.25]);
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const cardRadius = useTransform(scrollYProgress, [0, 1], [s.theme.radius, s.theme.radius * 2]);

  const words = s.hero.rotatingWords.length ? s.hero.rotatingWords : ["clarity"];
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!done) return;
    const id = setInterval(() => setW((v) => (v + 1) % words.length), 2600);
    return () => clearInterval(id);
  }, [done, words.length]);

  return (
    <section ref={ref} className="relative overflow-hidden pb-10 pt-28 md:pb-16 md:pt-36">
      <div className="container-x">
        <motion.div style={{ y: titleY, opacity: titleOpacity }}>
          <motion.div
            className="flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={done ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <span className="eyebrow text-muted">{s.hero.eyebrow}</span>
          </motion.div>

          <h1 className="display-xl mt-6 max-w-[14ch] md:mt-8 md:max-w-none">
            <SplitWords text={s.hero.titleTop} afterIntro delay={0.1} />
            <br />
            <span className="relative inline-flex h-[1em] overflow-hidden pb-[0.12em] align-bottom italic text-accent">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={words[w]}
                  className="inline-block"
                  initial={{ y: done ? "100%" : "110%", opacity: 0 }}
                  animate={done ? { y: "0%", opacity: 1 } : undefined}
                  exit={{ y: "-100%", opacity: 0, transition: { duration: 0.45, ease: EASE } }}
                  transition={{ duration: 0.85, ease: EASE, delay: w === 0 && done ? 0.45 : 0.15 }}
                >
                  {words[w]}
                </motion.span>
              </AnimatePresence>
            </span>{" "}
            <SplitWords text={s.hero.titleBottom} afterIntro delay={0.55} />
          </h1>
        </motion.div>

        <div className="mt-10 grid gap-8 md:mt-14 md:grid-cols-12 md:items-start">
          <motion.div
            className="md:col-span-5"
            initial={{ opacity: 0, y: 24 }}
            animate={done ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 1, ease: EASE, delay: 0.8 }}
          >
            <p className="lede max-w-md text-ink/70">{s.hero.subtitle}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Magnetic>
                <Link
                  href={s.hero.primaryHref}
                  className="group flex h-14 items-center justify-center gap-3 rounded-full bg-ink pl-6 pr-2 text-[15px] font-medium text-paper"
                >
                  {s.hero.primaryCta}
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-accent text-ink transition-transform duration-500 group-hover:rotate-45">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </Link>
              </Magnetic>
              <Link
                href={s.hero.secondaryHref}
                className="flex h-14 items-center justify-center rounded-full border border-line px-6 text-[15px] transition-colors hover:bg-ink hover:text-paper"
              >
                {s.hero.secondaryCta}
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-3 text-sm text-muted">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              Partners available today · avg. response under 2 hrs
            </div>
          </motion.div>

          <motion.div
            className="relative md:col-span-7"
            initial={{ opacity: 0, clipPath: "inset(30% 0% 0% 0% round 28px)" }}
            animate={done ? { opacity: 1, clipPath: "inset(0% 0% 0% 0% round 0px)" } : undefined}
            transition={{ duration: 1.5, ease: EASE, delay: 0.35 }}
          >
            <motion.div
              className="relative aspect-[4/5] overflow-hidden sm:aspect-[16/11]"
              style={{ borderRadius: cardRadius }}
              data-cursor="Explore"
            >
              <motion.div className="absolute inset-0" style={{ scale: imgScale, y: imgY }}>
                <Image src={s.hero.image} alt="" fill priority sizes="(min-width:768px) 60vw, 100vw" className="object-cover" />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
              <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 text-paper md:inset-x-6 md:bottom-6">
                <div className="glass rounded-2xl px-4 py-3">
                  <p className="font-serif text-3xl leading-none">
                    {s.stats[1]?.value.toLocaleString("en-IN")}
                    {s.stats[1]?.suffix}
                  </p>
                  <p className="mt-1 text-xs text-paper/70">{s.stats[1]?.label}</p>
                </div>
                <div className="hidden items-center gap-2 text-xs text-paper/80 sm:flex">
                  <ArrowDown className="h-3.5 w-3.5 animate-bounce" /> Scroll to explore
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
