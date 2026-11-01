"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  return <motion.div className="fixed inset-x-0 top-0 z-[90] h-[3px] origin-left bg-accent" style={{ scaleX }} />;
}

export function ShareButtons({ title }: { title: string }) {
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) await navigator.share({ title, url }).catch(() => {});
    else {
      await navigator.clipboard.writeText(url);
      alert("Link copied");
    }
  };
  return (
    <button onClick={share} className="h-11 rounded-full border hairline px-5 text-sm hover:bg-ink hover:text-paper">
      Share article ↗
    </button>
  );
}
