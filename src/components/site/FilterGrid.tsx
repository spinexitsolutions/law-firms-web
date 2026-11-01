"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { Attorney, Post } from "@/lib/types";
import { AttorneyCard } from "./home/Sections";
import { PostCard } from "./PostCard";

function Chips({ all, value, onChange }: { all: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="no-scrollbar -mx-5 mb-10 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0">
      {["All", ...all].map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`relative shrink-0 rounded-full border hairline px-4 py-2 text-sm transition-colors ${value === c ? "text-paper" : "hover:bg-ink/5"}`}
        >
          {value === c && <motion.span layoutId="chip" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
          <span className="relative">{c}</span>
        </button>
      ))}
    </div>
  );
}

export function AttorneyGrid({ people }: { people: Attorney[] }) {
  const [f, setF] = useState("All");
  const cats = useMemo(() => [...new Set(people.flatMap((p) => p.practiceAreas))], [people]);
  const list = f === "All" ? people : people.filter((p) => p.practiceAreas.includes(f));
  return (
    <div>
      <Chips all={cats} value={f} onChange={setF} />
      <motion.div layout className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {list.map((p) => (
            <motion.div key={p.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.45 }}>
              <AttorneyCard p={p} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export function PostGrid({ posts }: { posts: Post[] }) {
  const [f, setF] = useState("All");
  const [q, setQ] = useState("");
  const cats = useMemo(() => [...new Set(posts.map((p) => p.category))], [posts]);
  const list = posts.filter(
    (p) => (f === "All" || p.category === f) && (!q || (p.title + p.excerpt).toLowerCase().includes(q.toLowerCase())),
  );
  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <Chips all={cats} value={f} onChange={setF} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search insights…"
          className="mb-10 h-11 w-full rounded-full border hairline bg-transparent px-5 text-sm outline-none focus:border-ink md:w-72"
        />
      </div>
      <motion.div layout className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((p) => (
            <motion.div key={p.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
              <PostCard p={p} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {!list.length && <p className="py-20 text-center text-muted">No articles match your search.</p>}
    </div>
  );
}
