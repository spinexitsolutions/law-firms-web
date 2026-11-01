"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check, Loader2 } from "lucide-react";
import { EASE } from "../motion";

export const PRACTICE_CHOICES = [
  "Corporate & M&A",
  "Litigation & Disputes",
  "Arbitration",
  "Real Estate",
  "Family & Private Client",
  "White-Collar & Criminal",
  "Tax",
  "IP & Technology",
  "Other",
];

export function Field({
  label,
  dark,
  children,
}: {
  label: string;
  dark?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="group relative block">
      <span className={`mb-1.5 block text-xs ${dark ? "text-paper/50" : "text-muted"}`}>{label}</span>
      {children}
    </label>
  );
}

export const inputCls = (dark?: boolean) =>
  `w-full rounded-2xl border px-4 py-3.5 text-[15px] outline-none transition-all duration-300 ${
    dark
      ? "border-white/12 bg-white/5 text-paper placeholder:text-paper/30 focus:border-accent focus:bg-white/10"
      : "border-line bg-white/60 placeholder:text-ink/30 focus:border-ink focus:bg-white"
  }`;

export function ContactForm({
  dark,
  presetArea,
  source = "Contact",
  compact,
}: {
  dark?: boolean;
  presetArea?: string;
  source?: string;
  compact?: boolean;
}) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    practiceArea: presetArea ?? "",
    message: "",
    website: "",
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setState("loading");
    const r = await fetch("/api/public/lead", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...form, source }),
    });
    if (r.ok) setState("done");
    else {
      setError((await r.json().catch(() => ({}))).error ?? "Something went wrong");
      setState("idle");
    }
  }

  return (
    <div className="relative mt-6">
      <AnimatePresence mode="wait">
        {state === "done" ? (
          <motion.div
            key="ok"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="flex flex-col items-start gap-4 py-8"
          >
            <motion.span
              className="grid h-16 w-16 place-items-center rounded-full bg-accent text-ink"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
            >
              <Check className="h-7 w-7" />
            </motion.span>
            <h4 className="display-sm">Thank you, {form.name.split(" ")[0]}.</h4>
            <p className={dark ? "text-paper/60" : "text-muted"}>
              Your message is with our partners. Expect a reply within one business day — strictly confidential.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={submit}
            exit={{ opacity: 0, y: -10 }}
            className={`grid gap-4 ${compact ? "" : "sm:grid-cols-2"}`}
          >
            <Field label="Full name" dark={dark}>
              <input required value={form.name} onChange={set("name")} className={inputCls(dark)} placeholder="Your name" autoComplete="name" />
            </Field>
            <Field label="Email" dark={dark}>
              <input required type="email" value={form.email} onChange={set("email")} className={inputCls(dark)} placeholder="you@example.com" autoComplete="email" />
            </Field>
            <Field label="Phone" dark={dark}>
              <input value={form.phone} onChange={set("phone")} className={inputCls(dark)} placeholder="+91" autoComplete="tel" inputMode="tel" />
            </Field>
            <Field label="Area of law" dark={dark}>
              <select value={form.practiceArea} onChange={set("practiceArea")} className={`${inputCls(dark)} appearance-none`}>
                <option value="">Select…</option>
                {PRACTICE_CHOICES.map((p) => (
                  <option key={p} value={p} className="text-ink">
                    {p}
                  </option>
                ))}
              </select>
            </Field>
            <div className={compact ? "" : "sm:col-span-2"}>
              <Field label="How can we help?" dark={dark}>
                <textarea
                  rows={compact ? 3 : 5}
                  value={form.message}
                  onChange={set("message")}
                  className={`${inputCls(dark)} resize-none`}
                  placeholder="A short description of your matter. Please don't include highly sensitive details yet."
                />
              </Field>
            </div>
            <input tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} className="hidden" aria-hidden />
            <div className={`flex flex-col gap-3 ${compact ? "" : "sm:col-span-2 sm:flex-row sm:items-center sm:justify-between"}`}>
              <p className={`text-xs ${dark ? "text-paper/40" : "text-muted"}`}>
                Submitting this form does not create an advocate–client relationship.
              </p>
              <button
                disabled={state === "loading"}
                className="group flex h-14 shrink-0 items-center justify-center gap-3 rounded-full bg-accent pl-6 pr-2 font-medium text-ink transition-transform active:scale-[0.98] disabled:opacity-70"
              >
                {state === "loading" ? "Sending…" : "Send message"}
                <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-paper transition-transform duration-500 group-hover:rotate-45">
                  {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />}
                </span>
              </button>
            </div>
            {error && <p className="text-sm text-red-500 sm:col-span-2">{error}</p>}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
