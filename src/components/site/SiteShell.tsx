"use client";

import { ReactLenis } from "lenis/react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Settings } from "@/lib/types";
import { Intro } from "./Intro";
import { IntroCtx } from "./IntroContext";
import { SettingsCtx } from "./SettingsContext";
import { Navbar } from "./Navbar";
import { EASE } from "./motion";

export function SiteShell({
  settings,
  menuImages,
  children,
}: {
  settings: Settings;
  menuImages: string[];
  children: ReactNode;
}) {
  const [introDone, setIntroDone] = useState(!settings.intro.enabled);
  const onDone = useCallback(() => setIntroDone(true), []);
  const pathname = usePathname();

  // Intro plays only when landing on the home page.
  const playIntro = settings.intro.enabled && pathname === "/";
  const done = introDone || !playIntro;

  const content = (
    <SettingsCtx.Provider value={settings}>
      <IntroCtx.Provider value={{ done }}>
        {playIntro && <Intro settings={settings} onDone={onDone} />}
        {settings.announcement.enabled && <Announcement s={settings} />}
        <Navbar menuImages={menuImages} />
        <div className={settings.theme.grain ? "grain" : undefined}>{children}</div>
        {settings.features.customCursor && <Cursor />}
        {settings.features.whatsappButton && <WhatsApp number={settings.brand.whatsapp} />}
        {done && <Consent settings={settings} />}
      </IntroCtx.Provider>
    </SettingsCtx.Provider>
  );

  return settings.features.smoothScroll ? (
    <ReactLenis root options={{ lerp: 0.1, smoothWheel: true }}>
      {content}
    </ReactLenis>
  ) : (
    content
  );
}

function Announcement({ s }: { s: Settings }) {
  return (
    <div className="relative z-[60] flex h-9 items-center justify-center bg-ink px-4 text-center text-[12px] text-paper/80">
      <Link href={s.announcement.href || "#"} className="group inline-flex items-center gap-2 truncate">
        <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-accent" />
        <span className="truncate">{s.announcement.text}</span>
        <span className="hidden transition-transform group-hover:translate-x-1 sm:inline">→</span>
      </Link>
    </div>
  );
}

/* ───────── custom cursor (fine pointers only) ───────── */
function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.3 });
  const [label, setLabel] = useState<string | null>(null);
  const [hover, setHover] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only capability check
    setEnabled(true);
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as HTMLElement | null;
      const labelled = t?.closest<HTMLElement>("[data-cursor]");
      setLabel(labelled?.dataset.cursor ?? null);
      setHover(!!t?.closest("a,button,[role=button],input,textarea,select,label"));
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [x, y]);

  if (!enabled) return null;
  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[120] hidden mix-blend-difference md:block"
      style={{ x: sx, y: sy }}
    >
      <motion.div
        className="grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-[11px] font-medium uppercase tracking-wider text-black"
        animate={{
          width: label ? 88 : hover ? 44 : 10,
          height: label ? 88 : hover ? 44 : 10,
          opacity: 1,
        }}
        transition={{ duration: 0.35, ease: EASE }}
      >
        {label && <span className="mix-blend-normal">{label}</span>}
      </motion.div>
    </motion.div>
  );
}

function WhatsApp({ number }: { number: string }) {
  return (
    <motion.a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-4 right-4 z-[65] grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_12px_40px_-10px_rgba(37,211,102,0.8)] md:bottom-6 md:right-6"
      initial={{ scale: 0, rotate: -45 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay: 1.5, type: "spring", stiffness: 260, damping: 18 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden>
        <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.43-9.43 2.52 0 4.89.98 6.67 2.77a9.36 9.36 0 0 1 2.76 6.67c0 5.2-4.23 9.43-9.44 9.43m8.03-17.46A11.27 11.27 0 0 0 12.05.72C5.8.72.7 5.8.7 12.07c0 2 .52 3.95 1.52 5.67L.6 23.62l6.02-1.58a11.33 11.33 0 0 0 5.42 1.38h.01c6.26 0 11.35-5.09 11.35-11.35 0-3.03-1.18-5.88-3.32-8.03" />
      </svg>
    </motion.a>
  );
}

/* ───────── Bar Council disclaimer → cookie notice ───────── */
function Consent({ settings }: { settings: Settings }) {
  const [step, setStep] = useState<"none" | "disclaimer" | "cookie">("none");

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reads localStorage after mount
      if (settings.disclaimer.enabled && !localStorage.getItem("av-disclaimer")) setStep("disclaimer");
      else if (settings.features.cookieBanner && !localStorage.getItem("av-cookie")) setStep("cookie");
    } catch {}
  }, [settings]);

  const accept = () => {
    try {
      localStorage.setItem("av-disclaimer", "1");
    } catch {}
    setStep(settings.features.cookieBanner && !safeGet("av-cookie") ? "cookie" : "none");
  };

  return (
    <AnimatePresence>
      {step === "disclaimer" && (
        <motion.div
          key="d"
          className="fixed inset-0 z-[110] flex items-end justify-center bg-ink/50 p-3 backdrop-blur-sm sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            role="dialog"
            aria-modal
            aria-labelledby="disc-title"
            className="w-full max-w-xl rounded-[28px] bg-paper p-6 shadow-2xl md:p-9"
            initial={{ y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <p className="eyebrow text-muted">Bar Council of India</p>
            <h2 id="disc-title" className="display-sm mt-2">
              {settings.disclaimer.title}
            </h2>
            <p className="mt-4 max-h-[40svh] overflow-y-auto text-[15px] leading-relaxed text-ink/75">
              {settings.disclaimer.body}
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={accept}
                className="h-12 flex-1 rounded-full bg-ink font-medium text-paper transition-transform active:scale-[0.98]"
              >
                I agree
              </button>
              <a
                href="https://www.google.com"
                className="grid h-12 flex-1 place-items-center rounded-full border border-line font-medium"
              >
                Leave website
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
      {step === "cookie" && (
        <motion.div
          key="c"
          className="glass fixed bottom-20 left-3 right-3 z-[90] rounded-[22px] p-4 text-sm text-paper md:bottom-6 md:left-6 md:right-auto md:max-w-sm"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.4 }}
        >
          <p className="text-paper/80">
            We use essential cookies only, to keep this site secure and working. See our{" "}
            <Link href="/privacy" className="underline">
              privacy policy
            </Link>
            .
          </p>
          <button
            onClick={() => {
              try {
                localStorage.setItem("av-cookie", "1");
              } catch {}
              setStep("none");
            }}
            className="mt-3 h-10 w-full rounded-full bg-paper font-medium text-ink"
          >
            Okay
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function safeGet(k: string) {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
}
