"use client";

import { useLenis } from "lenis/react";

export function BackToTop() {
  const lenis = useLenis();
  return (
    <button
      onClick={() => (lenis ? lenis.scrollTo(0, { duration: 1.6 }) : window.scrollTo({ top: 0, behavior: "smooth" }))}
      className="rounded-full border border-white/15 px-3 py-1.5 hover:bg-white/10 hover:text-paper"
    >
      Back to top ↑
    </button>
  );
}
