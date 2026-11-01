"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowUpRight, Phone, Mail } from "lucide-react";
import { useSettings } from "./SettingsContext";
import { EASE } from "./motion";

/**
 * "Dynamic island" navigation.
 * A floating glass pill that compacts on scroll-down, shows the current
 * section, has an inline link rail on desktop with a sliding highlight,
 * a scroll-progress ring on the menu button, and morphs (shared layout)
 * into a full menu sheet with image previews.
 */
export function Navbar({ menuImages }: { menuImages: string[] }) {
  const s = useSettings();
  const pathname = usePathname();
  const items = s.nav.items.filter((i) => i.visible);
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [hovered, setHovered] = useState<string | null>(null);
  const [preview, setPreview] = useState(0);
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setAtTop(y < 40);
    if (y > 220 && y > prev + 4) setCompact(true);
    else if (y < prev - 4 || y < 220) setCompact(false);
  });

  // close on route change (derived during render, no effect needed)
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const current =
    items.find((i) => i.href !== "/" && pathname.startsWith(i.href))?.label ?? (pathname === "/" ? "Home" : "");

  const top = s.announcement.enabled && atTop ? 48 : 12;

  return (
    <>
      {/* backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70] bg-ink/40 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.header
        className="pointer-events-none fixed inset-x-0 z-[80] flex justify-center px-3"
        animate={{ top: open ? 12 : top }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <motion.nav
          layout
          aria-label="Primary"
          className="glass pointer-events-auto relative overflow-hidden text-paper shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] ring-1 ring-white/10"
          style={{ borderRadius: open ? 30 : 999 }}
          transition={{ layout: { duration: 0.65, ease: [0.76, 0, 0.24, 1] } }}
          data-open={open}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {!open ? (
              <motion.div
                key="pill"
                layout="position"
                className="flex h-14 items-center gap-1 pl-2 pr-2"
                initial={{ opacity: 0, filter: "blur(6px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(6px)" }}
                transition={{ duration: 0.35 }}
              >
                <Link href="/" className="flex items-center gap-2.5 rounded-full pr-2" aria-label={s.brand.name}>
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-paper font-serif text-lg text-ink">
                    {s.brand.shortName}
                  </span>
                  <motion.span
                    className="overflow-hidden whitespace-nowrap font-serif text-lg"
                    animate={{ width: compact ? 0 : "auto", opacity: compact ? 0 : 1 }}
                    transition={{ duration: 0.5, ease: EASE }}
                  >
                    {s.brand.name}
                  </motion.span>
                </Link>

                {/* current section chip (mobile + compact) */}
                <AnimatePresence initial={false}>
                  {current && (
                    <motion.span
                      key={current}
                      className="mx-1 hidden whitespace-nowrap rounded-full bg-white/10 px-3 py-1 text-xs text-paper/80 max-lg:inline-block"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                    >
                      {current}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* desktop rail */}
                <motion.ul
                  className="mx-2 hidden items-center lg:flex"
                  animate={{ width: compact ? 0 : "auto", opacity: compact ? 0 : 1 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  onMouseLeave={() => setHovered(null)}
                >
                  {items.slice(0, 5).map((i) => {
                    const active = pathname.startsWith(i.href);
                    return (
                      <li key={i.href} className="relative">
                        <Link
                          href={i.href}
                          onMouseEnter={() => setHovered(i.href)}
                          className={`relative z-10 block whitespace-nowrap px-3.5 py-2 text-[13px] tracking-tight transition-colors ${
                            active || hovered === i.href ? "text-paper" : "text-paper/60"
                          }`}
                        >
                          {i.label}
                        </Link>
                        {(hovered ? hovered === i.href : active) && (
                          <motion.span
                            layoutId="nav-hover"
                            className="absolute inset-0 rounded-full bg-white/12"
                            transition={{ type: "spring", stiffness: 400, damping: 32 }}
                          />
                        )}
                      </li>
                    );
                  })}
                </motion.ul>

                <Link
                  href={s.nav.ctaHref}
                  className="hidden h-10 items-center gap-1.5 whitespace-nowrap rounded-full bg-accent px-4 text-[13px] font-medium text-ink transition-transform hover:scale-[1.03] active:scale-95 sm:flex"
                >
                  {s.nav.ctaLabel}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>

                <MenuButton progress={progress} onClick={() => setOpen(true)} open={false} />
              </motion.div>
            ) : (
              <motion.div
                key="sheet"
                layout="position"
                className="w-[calc(100vw-24px)] max-w-[1180px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
              >
                <div className="flex h-14 items-center justify-between pl-2 pr-2">
                  <Link href="/" className="flex items-center gap-2.5">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-paper font-serif text-lg text-ink">
                      {s.brand.shortName}
                    </span>
                    <span className="font-serif text-lg">{s.brand.name}</span>
                  </Link>
                  <MenuButton progress={progress} onClick={() => setOpen(false)} open />
                </div>

                <div className="grid max-h-[calc(100svh-100px)] gap-8 overflow-y-auto px-5 pb-6 pt-4 md:grid-cols-[1.3fr_1fr] md:px-8 md:pb-8">
                  <ul className="flex flex-col">
                    {items.map((i, idx) => (
                      <motion.li
                        key={i.href}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: EASE, delay: 0.2 + idx * 0.05 }}
                        className="border-b border-white/10"
                      >
                        <Link
                          href={i.href}
                          onMouseEnter={() => setPreview(idx)}
                          className="group flex items-baseline gap-4 py-3 md:py-3.5"
                        >
                          <span className="font-mono text-xs text-paper/40">{String(idx + 1).padStart(2, "0")}</span>
                          <span
                            className={`font-serif text-[clamp(2rem,5.5vw,3.6rem)] leading-none tracking-tight transition-all duration-500 group-hover:translate-x-2 group-hover:italic ${
                              pathname.startsWith(i.href) ? "text-accent" : ""
                            }`}
                          >
                            {i.label}
                          </span>
                          <ArrowUpRight className="ml-auto h-5 w-5 -translate-x-2 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100" />
                        </Link>
                      </motion.li>
                    ))}
                  </ul>

                  <motion.div
                    className="flex flex-col gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: EASE, delay: 0.35 }}
                  >
                    <div className="relative hidden aspect-[4/3] overflow-hidden rounded-[22px] md:block">
                      <AnimatePresence mode="popLayout">
                        <motion.div
                          key={preview}
                          className="absolute inset-0"
                          initial={{ clipPath: "inset(100% 0 0 0)", scale: 1.15 }}
                          animate={{ clipPath: "inset(0% 0 0 0)", scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.8, ease: EASE }}
                        >
                          <Image
                            src={menuImages[preview % menuImages.length]}
                            alt=""
                            fill
                            sizes="480px"
                            className="object-cover"
                          />
                        </motion.div>
                      </AnimatePresence>
                      <span className="absolute bottom-3 left-3 rounded-full bg-ink/60 px-3 py-1 text-xs backdrop-blur">
                        {items[preview]?.label}
                      </span>
                    </div>
                    <div className="grid gap-3 rounded-[22px] bg-white/5 p-5 text-sm">
                      <p className="eyebrow text-paper/50">Speak to a partner</p>
                      <a href={`tel:${s.brand.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-accent">
                        <Phone className="h-4 w-4" /> {s.brand.phone}
                      </a>
                      <a href={`mailto:${s.brand.email}`} className="flex items-center gap-2 hover:text-accent">
                        <Mail className="h-4 w-4" /> {s.brand.email}
                      </a>
                      <p className="text-paper/50">{s.brand.hours}</p>
                      <Link
                        href={s.nav.ctaHref}
                        className="mt-2 flex h-12 items-center justify-center gap-2 rounded-full bg-accent font-medium text-ink"
                      >
                        {s.nav.ctaLabel} <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      </motion.header>
    </>
  );
}

function MenuButton({
  progress,
  onClick,
  open,
}: {
  progress: ReturnType<typeof useSpring>;
  onClick: () => void;
  open: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      className="relative ml-1 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
    >
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 40 40">
        <motion.circle
          cx="20"
          cy="20"
          r="18.5"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.5"
          strokeLinecap="round"
          style={{ pathLength: progress }}
        />
      </svg>
      <span className="relative block h-3 w-4">
        <motion.span
          className="absolute left-0 h-[1.5px] w-full rounded bg-paper"
          animate={open ? { top: 5, rotate: 45 } : { top: 2, rotate: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
        />
        <motion.span
          className="absolute left-0 h-[1.5px] rounded bg-paper"
          animate={open ? { top: 5, rotate: -45, width: "100%" } : { top: 8, rotate: 0, width: "60%" }}
          transition={{ duration: 0.4, ease: EASE }}
        />
      </span>
    </button>
  );
}
