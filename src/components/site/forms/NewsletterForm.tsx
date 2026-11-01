"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    const r = await fetch("/api/public/newsletter", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, source: "Footer" }),
    });
    if (r.ok) setState("done");
    else {
      setErr((await r.json()).error ?? "Something went wrong");
      setState("error");
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 max-w-md">
      <div className="relative flex h-14 items-center rounded-full border border-white/15 bg-white/5 pl-5 pr-1.5 focus-within:border-accent">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          aria-label="Email address"
          className="h-full flex-1 bg-transparent text-[15px] outline-none placeholder:text-paper/35"
          disabled={state === "done"}
        />
        <button
          disabled={state === "loading" || state === "done"}
          className="grid h-11 w-11 place-items-center rounded-full bg-accent text-ink transition-transform hover:scale-105 disabled:opacity-80"
          aria-label="Subscribe"
        >
          <AnimatePresence mode="wait" initial={false}>
            {state === "done" ? (
              <motion.span key="c" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <Check className="h-4 w-4" />
              </motion.span>
            ) : (
              <motion.span key="a" initial={{ x: -8, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 8, opacity: 0 }}>
                <ArrowRight className="h-4 w-4" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
      <p className="mt-3 h-5 text-xs text-paper/50">
        {state === "done" ? "Welcome aboard — check your inbox." : state === "error" ? err : "Unsubscribe anytime."}
      </p>
    </form>
  );
}
