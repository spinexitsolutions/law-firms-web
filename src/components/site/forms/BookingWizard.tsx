"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Loader2, MapPin, Phone, Video } from "lucide-react";
import { EASE } from "../motion";
import { Field, inputCls, PRACTICE_CHOICES } from "./ContactForm";

const SLOTS = ["10:00", "11:00", "12:00", "14:30", "15:30", "16:30", "17:30"];
const MODES = [
  { key: "video", label: "Video call", icon: Video, note: "Secure link sent by email" },
  { key: "in-person", label: "In person", icon: MapPin, note: "At our nearest office" },
  { key: "phone", label: "Phone call", icon: Phone, note: "We call you" },
] as const;

const STEPS = ["Matter", "Time", "Details", "Confirm"];

export function BookingWizard({ attorney, area }: { attorney?: string; area?: string }) {
  const [step, setStep] = useState(area && PRACTICE_CHOICES.includes(area) ? 1 : 0);
  const [dir, setDir] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [f, setF] = useState({
    practiceArea: area && PRACTICE_CHOICES.includes(area) ? area : "",
    date: "",
    time: "",
    mode: "video" as (typeof MODES)[number]["key"],
    name: "",
    email: "",
    phone: "",
    message: attorney ? `I'd like to speak with ${attorney}.` : "",
  });

  const days = useMemo(() => {
    const out: { iso: string; d: Date }[] = [];
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    for (let i = 1; out.length < 12 && i < 30; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      if (d.getDay() === 0) continue;
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      out.push({ iso, d });
    }
    return out;
  }, []);

  const canNext = [
    !!f.practiceArea,
    !!f.date && !!f.time,
    f.name.trim().length > 1 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email),
    true,
  ][step];

  const go = (n: number) => {
    setDir(n > step ? 1 : -1);
    setStep(n);
  };

  async function submit() {
    setBusy(true);
    setError("");
    const r = await fetch("/api/public/book", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(f),
    });
    setBusy(false);
    if (r.ok) setDone(true);
    else setError((await r.json().catch(() => ({}))).error ?? "Something went wrong");
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="flex flex-col items-center py-16 text-center"
      >
        <motion.div
          className="grid h-24 w-24 place-items-center rounded-full bg-accent text-ink"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.2 }}
        >
          <Check className="h-10 w-10" />
        </motion.div>
        <h2 className="display-md mt-8">Request received.</h2>
        <p className="lede mt-4 max-w-lg text-ink/70">
          We&apos;ve pencilled in <b>{fmt(f.date)}</b> at <b>{f.time}</b> ({f.mode.replace("-", " ")}). A partner&apos;s office will confirm by email
          within one business day.
        </p>
        <Link href="/" className="mt-10 h-12 rounded-full bg-ink px-6 leading-[3rem] text-paper">
          Back to home
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="rounded-[var(--radius)] border hairline bg-white/50 p-5 backdrop-blur md:p-10">
      {/* progress */}
      <div className="mb-10 grid grid-cols-4 gap-2">
        {STEPS.map((label, i) => (
          <button key={label} onClick={() => i < step && go(i)} className="text-left" disabled={i > step}>
            <div className="h-1 overflow-hidden rounded-full bg-ink/10">
              <motion.div className="h-full bg-ink" animate={{ width: i <= step ? "100%" : "0%" }} transition={{ duration: 0.6, ease: EASE }} />
            </div>
            <span className={`mt-2 block text-xs ${i <= step ? "text-ink" : "text-muted"}`}>
              <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span> <span className="hidden sm:inline">{label}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="relative min-h-[360px] overflow-hidden">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40, filter: "blur(6px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: dir * -40, filter: "blur(6px)" }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            {step === 0 && (
              <div>
                <h2 className="display-sm">What is your matter about?</h2>
                <div className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {PRACTICE_CHOICES.map((p) => (
                    <button
                      key={p}
                      onClick={() => setF({ ...f, practiceArea: p })}
                      className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all ${
                        f.practiceArea === p ? "border-ink bg-ink text-paper" : "hairline hover:border-ink/40"
                      }`}
                    >
                      {p}
                      {f.practiceArea === p && <Check className="h-4 w-4 text-accent" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="display-sm">Pick a time that suits you.</h2>
                <p className="mt-2 text-sm text-muted">All times IST. Sundays closed.</p>
                <div className="no-scrollbar -mx-5 mt-6 flex gap-2 overflow-x-auto px-5 pb-2 md:mx-0 md:flex-wrap md:px-0">
                  {days.map(({ iso, d }) => (
                    <button
                      key={iso}
                      onClick={() => setF({ ...f, date: iso })}
                      className={`flex w-16 shrink-0 flex-col items-center rounded-2xl border py-3 transition-all ${
                        f.date === iso ? "border-ink bg-ink text-paper" : "hairline hover:border-ink/40"
                      }`}
                    >
                      <span className="text-[11px] uppercase opacity-60">{d.toLocaleDateString("en-IN", { weekday: "short" })}</span>
                      <span className="font-display text-2xl leading-tight">{d.getDate()}</span>
                      <span className="text-[11px] opacity-60">{d.toLocaleDateString("en-IN", { month: "short" })}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {SLOTS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setF({ ...f, time: t })}
                      className={`rounded-full border px-4 py-2 tabular-nums text-sm transition-all ${
                        f.time === t ? "border-accent bg-accent text-ink" : "hairline hover:border-ink/40"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="mt-8 grid gap-2 sm:grid-cols-3">
                  {MODES.map((m) => (
                    <button
                      key={m.key}
                      onClick={() => setF({ ...f, mode: m.key })}
                      className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
                        f.mode === m.key ? "border-ink bg-ink text-paper" : "hairline hover:border-ink/40"
                      }`}
                    >
                      <m.icon className="mt-0.5 h-5 w-5 shrink-0" />
                      <span>
                        <span className="block font-medium">{m.label}</span>
                        <span className="text-xs opacity-60">{m.note}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="display-sm">A little about you.</h2>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <Field label="Full name">
                    <input className={inputCls()} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" />
                  </Field>
                  <Field label="Email">
                    <input type="email" className={inputCls()} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" />
                  </Field>
                  <Field label="Phone (optional)">
                    <input className={inputCls()} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} inputMode="tel" autoComplete="tel" />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Brief summary (optional)">
                      <textarea rows={4} className={`${inputCls()} resize-none`} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
                    </Field>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="display-sm">Confirm your request.</h2>
                <dl className="mt-8 divide-y divide-[var(--line)] rounded-2xl border hairline">
                  {[
                    ["Matter", f.practiceArea],
                    ["When", `${fmt(f.date)} · ${f.time} IST`],
                    ["How", MODES.find((m) => m.key === f.mode)?.label],
                    ["Name", f.name],
                    ["Email", f.email],
                    ["Phone", f.phone || "—"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 px-5 py-4">
                      <dt className="text-sm text-muted">{k}</dt>
                      <dd className="text-right font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 text-xs text-muted">
                  Your first consultation is confidential. Booking does not by itself create an advocate–client relationship.
                </p>
                {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => go(step - 1)}
          disabled={step === 0}
          className="flex h-12 items-center gap-2 rounded-full px-4 text-sm disabled:opacity-0"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        {step < 3 ? (
          <button
            onClick={() => canNext && go(step + 1)}
            disabled={!canNext}
            className="flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-sm font-medium text-paper transition-opacity disabled:opacity-30"
          >
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={busy}
            className="flex h-12 items-center gap-2 rounded-full bg-accent px-6 text-sm font-medium text-ink"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Confirm booking
          </button>
        )}
      </div>
    </div>
  );
}

function fmt(iso: string) {
  if (!iso) return "";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
}
