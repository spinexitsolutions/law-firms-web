"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Settings } from "@/lib/types";
import { EASE } from "./motion";

const KEY = "av-intro-seen";

/**
 * Full-screen intro. Three styles (admin-selectable):
 *  - curtain:  words cycle, counter climbs, ink curtain lifts with a curved edge
 *  - split:    the screen splits horizontally and slides apart
 *  - monogram: a drawn monogram expands and dissolves into the page
 */
export function Intro({ settings, onDone }: { settings: Settings; onDone: () => void }) {
  const { intro, brand } = settings;
  const [phase, setPhase] = useState<"play" | "exit" | "gone">("play");
  const [wordIdx, setWordIdx] = useState(0);
  const [count, setCount] = useState(0);
  const words = intro.words.length ? intro.words : [brand.name];
  const dur = Math.max(1200, Math.min(intro.durationMs || 2600, 8000));

  useEffect(() => {
    const seen = intro.oncePerSession && sessionStorage.getItem(KEY);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduced) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage only exists after mount
      setPhase("gone");
      onDone();
      return;
    }
    document.documentElement.style.overflow = "hidden";
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * 100));
      setWordIdx(Math.min(words.length - 1, Math.floor(p * words.length)));
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setPhase("exit");
        sessionStorage.setItem(KEY, "1");
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== "exit") return;
    const t = setTimeout(() => onDone(), 350);
    const t2 = setTimeout(() => {
      setPhase("gone");
      document.documentElement.style.overflow = "";
    }, 1400);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [phase, onDone]);

  if (phase === "gone") return null;

  const exiting = phase === "exit";

  return (
    <div className="av-intro fixed inset-0 z-[100] pointer-events-auto" aria-hidden>
      {intro.style === "split" ? (
        <>
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2 bg-ink"
            animate={exiting ? { y: "-100%" } : { y: 0 }}
            transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 h-1/2 bg-ink"
            animate={exiting ? { y: "100%" } : { y: 0 }}
            transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
          />
        </>
      ) : intro.style === "monogram" ? (
        <motion.div
          className="absolute inset-0 bg-ink"
          animate={exiting ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 1, ease: EASE, delay: 0.25 }}
        />
      ) : (
        <motion.div
          className="absolute inset-0 bg-ink"
          style={{ borderBottomLeftRadius: "50% 0%", borderBottomRightRadius: "50% 0%" }}
          animate={
            exiting
              ? { y: "-110%", borderBottomLeftRadius: "50% 18%", borderBottomRightRadius: "50% 18%" }
              : { y: 0 }
          }
          transition={{ duration: 1.15, ease: [0.76, 0, 0.24, 1] }}
        />
      )}

      {/* content layer */}
      <motion.div
        className="absolute inset-0 flex flex-col justify-between p-5 text-paper md:p-10"
        animate={exiting ? { opacity: 0, y: -40 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <div className="flex items-center justify-between">
          <span className="eyebrow text-paper/60">{brand.tagline}</span>
          <span className="eyebrow text-paper/60">Est. {brand.founded}</span>
        </div>

        <div className="flex flex-col items-center justify-center gap-8">
          {intro.style === "monogram" ? (
            <motion.svg
              viewBox="0 0 120 120"
              className="h-28 w-28 md:h-36 md:w-36"
              animate={exiting ? { scale: 14, opacity: 0 } : { scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
            >
              <motion.circle
                cx="60"
                cy="60"
                r="56"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="1.2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: dur / 1000, ease: "easeInOut" }}
              />
              <text x="60" y="73" textAnchor="middle" fill="currentColor" style={{ fontFamily: "var(--font-serif)", fontSize: 40 }}>
                {brand.shortName}
              </text>
            </motion.svg>
          ) : (
            <motion.div
              className="h-px bg-accent"
              initial={{ width: 0 }}
              animate={{ width: "min(60vw, 420px)" }}
              transition={{ duration: dur / 1000, ease: "easeInOut" }}
            />
          )}
          <div className="relative h-[1.1em] overflow-hidden text-center font-serif text-[clamp(3rem,12vw,9rem)] leading-none tracking-tight">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={wordIdx}
                className="block italic"
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                {words[wordIdx]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <span className="font-serif text-2xl md:text-4xl">{brand.name}</span>
          <span className="font-mono text-5xl tabular-nums tracking-tighter md:text-7xl">
            {String(count).padStart(3, "0")}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
