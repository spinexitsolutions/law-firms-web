"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Loader2, Search, Calendar, Landmark, User } from "lucide-react";
import { EASE } from "../motion";
import { fmtDate } from "@/lib/format";
import { inputCls } from "./ContactForm";

type Result = {
  reference: string;
  title: string;
  practiceArea: string;
  attorney: string;
  status: string;
  stage: number;
  stages: string[];
  court: string;
  nextHearing: string;
  publicNote: string;
  updatedAt: string;
};

export function CaseStatus() {
  const [ref, setRef] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [res, setRes] = useState<Result | null>(null);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    setRes(null);
    const r = await fetch("/api/public/case-status", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reference: ref, email }),
    });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (r.ok) setRes(j);
    else setErr(j.error ?? "Something went wrong");
  }

  return (
    <div className="grid gap-10 md:grid-cols-12">
      <form onSubmit={lookup} className="md:col-span-5">
        <div className="space-y-4 rounded-[var(--radius)] bg-ink p-6 text-paper md:p-8">
          <p className="eyebrow text-paper/50">Secure lookup</p>
          <input
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder="Matter reference — e.g. AV-2026-0142"
            className={`${inputCls(true)} tabular-nums uppercase`}
            required
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Registered email"
            className={inputCls(true)}
            required
          />
          <button className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-accent font-medium text-ink">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Check status
          </button>
          {err && <p className="text-sm text-red-300">{err}</p>}
          <p className="text-xs text-paper/40">
            Demo: <span className="tabular-nums">AV-2026-0142</span> · gc@meridian.example.com
          </p>
        </div>
      </form>

      <div className="md:col-span-7">
        <AnimatePresence mode="wait">
          {res ? (
            <motion.div
              key={res.reference}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="rounded-[var(--radius)] border hairline bg-white/60 p-6 md:p-8"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="tabular-nums text-sm text-muted">{res.reference}</span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium capitalize text-emerald-800">{res.status}</span>
              </div>
              <h2 className="display-sm mt-3">{res.title}</h2>
              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                <p className="flex items-center gap-2"><User className="h-4 w-4 text-muted" /> {res.attorney}</p>
                <p className="flex items-center gap-2"><Landmark className="h-4 w-4 text-muted" /> {res.court || "—"}</p>
                <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted" /> {res.nextHearing ? fmtDate(res.nextHearing) : "No date"}</p>
              </div>

              <ol className="mt-10">
                {res.stages.map((s, i) => {
                  const state = i < res.stage ? "done" : i === res.stage ? "now" : "todo";
                  return (
                    <motion.li
                      key={s}
                      className="relative flex gap-4 pb-6 last:pb-0"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.12, ease: EASE, duration: 0.5 }}
                    >
                      {i < res.stages.length - 1 && (
                        <span className="absolute left-[11px] top-7 h-[calc(100%-20px)] w-px bg-ink/10">
                          <motion.span
                            className="block w-px bg-ink"
                            initial={{ height: 0 }}
                            animate={{ height: i < res.stage ? "100%" : 0 }}
                            transition={{ delay: 0.4 + i * 0.12, duration: 0.5 }}
                          />
                        </span>
                      )}
                      <span
                        className={`relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[10px] ${
                          state === "done" ? "border-ink bg-ink text-paper" : state === "now" ? "border-accent bg-accent text-ink" : "hairline bg-paper"
                        }`}
                      >
                        {state === "done" ? "✓" : i + 1}
                        {state === "now" && <span className="absolute inset-0 animate-ping rounded-full bg-accent/50" />}
                      </span>
                      <div>
                        <p className={state === "todo" ? "text-muted" : "font-medium"}>{s}</p>
                        {state === "now" && <p className="mt-1 text-sm text-ink/70">{res.publicNote}</p>}
                      </div>
                    </motion.li>
                  );
                })}
              </ol>
              <p className="mt-8 text-xs text-muted">Last updated {fmtDate(res.updatedAt.slice(0, 10))}</p>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid h-full min-h-[320px] place-items-center rounded-[var(--radius)] border border-dashed hairline p-10 text-center text-muted"
            >
              <p className="max-w-xs">Your matter&apos;s live progress — stage, next hearing and the latest note from your lawyer — will appear here.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
