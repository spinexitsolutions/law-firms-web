"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { EASE, SplitWords } from "./motion";

export function PageHeader({
  eyebrow,
  title,
  intro,
  image,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  image?: string;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1.25]);

  return (
    <header ref={ref} className="relative">
      <div className="container-x pb-12 pt-32 md:pb-20 md:pt-44">
        <motion.p
          className="tag text-ink/70"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          {eyebrow}
        </motion.p>
        <h1 className="display-lg mt-5 max-w-5xl">
          <SplitWords text={title} afterIntro />
        </h1>
        {intro && (
          <motion.p
            className="lede mt-6 max-w-2xl text-ink/70"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
          >
            {intro}
          </motion.p>
        )}
        {children}
      </div>
      {image && (
        <motion.div
          className="container-x"
          initial={{ opacity: 0, clipPath: "inset(20% 6% 0% 6% round 40px)" }}
          animate={{ opacity: 1, clipPath: "inset(0% 0% 0% 0% round 0px)" }}
          transition={{ duration: 1.4, ease: EASE, delay: 0.2 }}
        >
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius)] sm:aspect-[21/9]">
            <motion.div className="absolute inset-0" style={{ y, scale }}>
              <Image src={image} alt="" fill priority sizes="100vw" className="object-cover" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </header>
  );
}
