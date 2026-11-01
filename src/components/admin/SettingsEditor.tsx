"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, RotateCcw, Trash2 } from "lucide-react";
import type { Settings } from "@/lib/types";
import { ImageInput, TagsInput } from "./FieldInput";
import { useToast } from "./Toast";
import { Button, Card, cn, inputCls, Label, PageHeader, Switch } from "./ui";

type Group = keyof Settings;

const TABS: { key: string; label: string; groups: Group[] }[] = [
  { key: "brand", label: "Brand", groups: ["brand"] },
  { key: "theme", label: "Theme", groups: ["theme"] },
  { key: "intro", label: "Intro", groups: ["intro"] },
  { key: "nav", label: "Navigation", groups: ["nav"] },
  { key: "hero", label: "Hero", groups: ["hero"] },
  { key: "sections", label: "Home sections", groups: ["sections"] },
  { key: "content", label: "Content", groups: ["statement", "reveal", "marquee", "stats", "approach", "cta", "about"] },
  { key: "offices", label: "Offices", groups: ["offices"] },
  { key: "announcement", label: "Announcement", groups: ["announcement"] },
  { key: "disclaimer", label: "Disclaimer", groups: ["disclaimer"] },
  { key: "features", label: "Features", groups: ["features"] },
  { key: "seo", label: "SEO", groups: ["seo"] },
  { key: "legal", label: "Legal pages", groups: ["legal"] },
];

/* ───────── small building blocks ───────── */

function Text({
  label,
  value,
  onChange,
  help,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  help?: string;
  type?: string;
}) {
  return (
    <div>
      <Label help={help}>{label}</Label>
      <input type={type} className={inputCls} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Area({
  label,
  value,
  onChange,
  rows = 4,
  help,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  help?: string;
}) {
  return (
    <div className="sm:col-span-2">
      <Label help={help}>{label}</Label>
      <textarea
        rows={rows}
        className={cn(inputCls, "leading-relaxed")}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Toggle({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 sm:col-span-2">
      <div>
        <div className="text-[15px] font-medium">{label}</div>
        {desc && <div className="text-[13px] text-black/50">{desc}</div>}
      </div>
      <Switch checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

function Section({
  title,
  desc,
  children,
  aside,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[17px] font-semibold tracking-tight">{title}</h3>
          {desc && <p className="mt-0.5 text-[13.5px] text-black/50">{desc}</p>}
        </div>
        {aside}
      </div>
      <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">{children}</div>
    </Card>
  );
}

function move<T>(arr: T[], i: number, d: -1 | 1) {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

type ListField = { name: string; label: string; type?: "text" | "textarea" | "number" | "image" };

function ListEditor<T extends Record<string, unknown>>({
  items,
  onChange,
  fields,
  blank,
  itemLabel,
}: {
  items: T[];
  onChange: (v: T[]) => void;
  fields: ListField[];
  blank: T;
  itemLabel: (t: T, i: number) => string;
}) {
  return (
    <div className="space-y-3 sm:col-span-2">
      <AnimatePresence initial={false}>
        {items.map((it, i) => (
          <motion.div
            key={i}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl border border-black/[0.07] bg-[#fbfbfd] p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="text-[13px] font-semibold text-black/60">
                {i + 1}. {itemLabel(it, i)}
              </div>
              <div className="flex gap-0.5">
                <IconBtn label="Move up" onClick={() => onChange(move(items, i, -1))} disabled={i === 0}>
                  <ArrowUp className="size-3.5" />
                </IconBtn>
                <IconBtn label="Move down" onClick={() => onChange(move(items, i, 1))} disabled={i === items.length - 1}>
                  <ArrowDown className="size-3.5" />
                </IconBtn>
                <IconBtn label="Remove" danger onClick={() => onChange(items.filter((_, j) => j !== i))}>
                  <Trash2 className="size-3.5" />
                </IconBtn>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {fields.map((f) => {
                const v = it[f.name];
                const set = (nv: unknown) => onChange(items.map((x, j) => (j === i ? { ...x, [f.name]: nv } : x)));
                if (f.type === "textarea")
                  return (
                    <div key={f.name} className="sm:col-span-2">
                      <Label>{f.label}</Label>
                      <textarea rows={3} className={inputCls} value={String(v ?? "")} onChange={(e) => set(e.target.value)} />
                    </div>
                  );
                if (f.type === "image")
                  return (
                    <div key={f.name} className="sm:col-span-2">
                      <Label>{f.label}</Label>
                      <ImageInput value={String(v ?? "")} onChange={set} />
                    </div>
                  );
                return (
                  <div key={f.name}>
                    <Label>{f.label}</Label>
                    <input
                      type={f.type === "number" ? "number" : "text"}
                      className={inputCls}
                      value={String(v ?? "")}
                      onChange={(e) => set(f.type === "number" ? Number(e.target.value) : e.target.value)}
                    />
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <Button size="sm" onClick={() => onChange([...items, { ...blank }])}>
        <Plus className="size-3.5" /> Add
      </Button>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  label,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "grid size-8 place-items-center rounded-full text-black/50 transition hover:bg-black/[0.06] hover:text-black disabled:opacity-25",
        danger && "hover:bg-red-50 hover:text-red-600",
      )}
    >
      {children}
    </button>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <label className="relative size-[46px] shrink-0 cursor-pointer overflow-hidden rounded-xl ring-1 ring-black/10" style={{ background: value }}>
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />
        </label>
        <input className={cn(inputCls, "font-mono text-[14px] uppercase")} value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}

/* ───────── intro preview ───────── */

function IntroPreview({ intro, theme, brand }: { intro: Settings["intro"]; theme: Settings["theme"]; brand: string }) {
  const [k, setK] = useState(0);
  const dur = Math.max(0.8, intro.durationMs / 1000);
  const words = intro.words.length ? intro.words : [brand];
  return (
    <div className="sm:col-span-2">
      <div className="mb-2 flex items-center justify-between">
        <Label>Live preview</Label>
        <Button size="sm" variant="ghost" onClick={() => setK((x) => x + 1)}>
          <RotateCcw className="size-3.5" /> Replay
        </Button>
      </div>
      <div
        key={`${k}-${intro.style}`}
        className="relative aspect-[16/9] overflow-hidden rounded-2xl"
        style={{ background: theme.paper }}
      >
        {/* Fake "site" underneath */}
        <div className="absolute inset-0 flex flex-col justify-end p-5" style={{ color: theme.ink }}>
          <div className="font-serif text-[28px] leading-none">The law, argued with</div>
          <div className="font-serif text-[28px] italic leading-none" style={{ color: theme.accent }}>
            clarity
          </div>
        </div>
        {intro.enabled ? (
          intro.style === "split" ? (
            <>
              {[0, 1].map((h) => (
                <motion.div
                  key={h}
                  className={cn("absolute inset-x-0", h === 0 ? "top-0 h-1/2" : "bottom-0 h-1/2")}
                  style={{ background: theme.ink }}
                  initial={{ y: 0 }}
                  animate={{ y: h === 0 ? "-100%" : "100%" }}
                  transition={{ delay: dur * 0.7, duration: dur * 0.3, ease: [0.65, 0, 0.35, 1] }}
                />
              ))}
              <motion.div
                className="absolute inset-0 grid place-items-center font-serif text-2xl text-white"
                initial={{ opacity: 0, letterSpacing: "0.4em" }}
                animate={{ opacity: [0, 1, 1, 0], letterSpacing: ["0.4em", "0em", "0em", "0em"] }}
                transition={{ duration: dur * 0.75, times: [0, 0.35, 0.85, 1] }}
              >
                {brand}
              </motion.div>
              <motion.div
                className="absolute left-1/2 top-1/2 h-px -translate-x-1/2"
                style={{ background: theme.accent }}
                initial={{ width: 0 }}
                animate={{ width: ["0%", "60%", "100%"], opacity: [1, 1, 0] }}
                transition={{ duration: dur * 0.75 }}
              />
            </>
          ) : intro.style === "monogram" ? (
            <motion.div
              className="absolute inset-0 grid place-items-center"
              style={{ background: theme.ink }}
              initial={{ clipPath: "circle(150% at 50% 50%)" }}
              animate={{ clipPath: "circle(0% at 50% 50%)" }}
              transition={{ delay: dur * 0.7, duration: dur * 0.3, ease: [0.65, 0, 0.35, 1] }}
            >
              <motion.div
                className="grid size-20 place-items-center rounded-full border font-serif text-3xl italic"
                style={{ borderColor: theme.accent, color: theme.accent }}
                initial={{ scale: 0.6, opacity: 0, rotate: -20 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ duration: dur * 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                {brand.slice(0, 1)}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center gap-1"
              style={{ background: theme.ink }}
              initial={{ y: 0 }}
              animate={{ y: "-100%" }}
              transition={{ delay: dur * 0.75, duration: dur * 0.25, ease: [0.65, 0, 0.35, 1] }}
            >
              <div className="flex flex-wrap justify-center gap-x-2 px-4">
                {words.map((w, i) => (
                  <span key={i} className="overflow-hidden">
                    <motion.span
                      className="inline-block font-serif text-2xl text-white"
                      initial={{ y: "110%" }}
                      animate={{ y: 0 }}
                      transition={{ delay: 0.1 + i * ((dur * 0.4) / words.length), duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {w}
                    </motion.span>
                  </span>
                ))}
              </div>
              <motion.div
                className="mt-2 h-px"
                style={{ background: theme.accent }}
                initial={{ width: 0 }}
                animate={{ width: 120 }}
                transition={{ duration: dur * 0.6 }}
              />
            </motion.div>
          )
        ) : (
          <div className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] text-white">Intro disabled</div>
        )}
      </div>
    </div>
  );
}

/* ───────── main editor ───────── */

export function SettingsEditor({ initial }: { initial: Settings }) {
  const router = useRouter();
  const toast = useToast();
  const [orig, setOrig] = useState<Settings>(initial);
  const [s, setS] = useState<Settings>(initial);
  const [tab, setTab] = useState("brand");
  const [saving, setSaving] = useState(false);

  const dirtyGroups = useMemo(
    () => (Object.keys(s) as Group[]).filter((k) => JSON.stringify(s[k]) !== JSON.stringify(orig[k])),
    [s, orig],
  );

  function patch<G extends Group>(g: G, v: Partial<Settings[G]> | Settings[G]) {
    setS((prev) => ({
      ...prev,
      [g]: Array.isArray(prev[g]) ? v : { ...(prev[g] as object), ...(v as object) },
    }));
  }

  const save = async () => {
    setSaving(true);
    try {
      const body = Object.fromEntries(dirtyGroups.map((g) => [g, s[g]]));
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setOrig(data);
      setS(data);
      toast("Settings published to the live site");
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setSaving(false);
    }
  };

  const dirtyTabs = new Set(TABS.filter((t) => t.groups.some((g) => dirtyGroups.includes(g))).map((t) => t.key));

  const b = s.brand;
  const th = s.theme;

  return (
    <div className="pb-28">
      <PageHeader title="Site settings" description="Everything on the public website — changes go live the moment you save." />

      <div className="sticky top-14 z-20 -mx-4 mb-6 border-b border-black/[0.06] bg-[#f5f5f7]/85 px-4 py-2 backdrop-blur-xl lg:top-0 md:-mx-8 md:px-8">
        <div className="no-scrollbar flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "relative shrink-0 rounded-full px-3.5 py-1.5 text-[13.5px] font-medium transition-colors",
                tab === t.key ? "text-white" : "text-black/55 hover:text-black",
              )}
            >
              {tab === t.key && (
                <motion.span layoutId="settings-tab" className="absolute inset-0 rounded-full bg-[#1d1d1f]" transition={{ type: "spring", stiffness: 500, damping: 40 }} />
              )}
              <span className="relative">{t.label}</span>
              {dirtyTabs.has(t.key) && <span className="relative ml-1.5 inline-block size-1.5 -translate-y-0.5 rounded-full bg-[var(--accent)]" />}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-5"
        >
          {tab === "brand" && (
            <Section title="Brand & contact" desc="Shown in the navbar, footer, contact page and structured data.">
              <Text label="Firm name" value={b.name} onChange={(v) => patch("brand", { name: v })} />
              <Text label="Short name / monogram" value={b.shortName} onChange={(v) => patch("brand", { shortName: v })} />
              <Text label="Tagline" value={b.tagline} onChange={(v) => patch("brand", { tagline: v })} />
              <Text label="Founded" value={b.founded} onChange={(v) => patch("brand", { founded: v })} />
              <Text label="Email" type="email" value={b.email} onChange={(v) => patch("brand", { email: v })} />
              <Text label="Phone" value={b.phone} onChange={(v) => patch("brand", { phone: v })} />
              <Text label="WhatsApp number" help="Digits with country code, e.g. 919810012345" value={b.whatsapp} onChange={(v) => patch("brand", { whatsapp: v })} />
              <Text label="Office hours" value={b.hours} onChange={(v) => patch("brand", { hours: v })} />
              <Area label="Head office address" rows={2} value={b.address} onChange={(v) => patch("brand", { address: v })} />
              <Text label="LinkedIn URL" value={b.linkedin} onChange={(v) => patch("brand", { linkedin: v })} />
              <Text label="Instagram URL" value={b.instagram} onChange={(v) => patch("brand", { instagram: v })} />
              <Text label="X / Twitter URL" value={b.x} onChange={(v) => patch("brand", { x: v })} />
            </Section>
          )}

          {tab === "theme" && (
            <>
              <Section title="Colours & shape" desc="Applied site-wide as CSS variables.">
                <ColorField label="Accent" value={th.accent} onChange={(v) => patch("theme", { accent: v })} />
                <ColorField label="Ink (text & dark sections)" value={th.ink} onChange={(v) => patch("theme", { ink: v })} />
                <ColorField label="Paper (background)" value={th.paper} onChange={(v) => patch("theme", { paper: v })} />
                <div>
                  <Label>Corner radius · {th.radius}px</Label>
                  <input
                    type="range"
                    min={0}
                    max={48}
                    value={th.radius}
                    onChange={(e) => patch("theme", { radius: Number(e.target.value) })}
                    className="mt-3 w-full accent-[var(--accent)]"
                  />
                </div>
                <Toggle label="Film grain overlay" desc="A subtle analogue texture over the whole site." checked={th.grain} onChange={(v) => patch("theme", { grain: v })} />
                <div className="flex flex-wrap gap-2 sm:col-span-2">
                  {[
                    ["Brass", "#B38B59", "#0E0E0C", "#F3F0EA"],
                    ["Oxblood", "#7A2E2A", "#141210", "#F2EEE8"],
                    ["Sage", "#5F7A5E", "#101311", "#EEF0EA"],
                    ["Navy", "#3B5B8C", "#0B1020", "#F1F2F5"],
                    ["Mono", "#1A1A1A", "#0A0A0A", "#F5F5F2"],
                  ].map(([n, a, i, p]) => (
                    <button
                      key={n}
                      onClick={() => patch("theme", { accent: a, ink: i, paper: p })}
                      className="flex items-center gap-2 rounded-full border border-black/10 bg-white py-1.5 pl-1.5 pr-3 text-[13px] hover:border-black/30"
                    >
                      <span className="flex -space-x-1.5">
                        {[a, i, p].map((c) => (
                          <span key={c} className="size-5 rounded-full ring-2 ring-white" style={{ background: c }} />
                        ))}
                      </span>
                      {n}
                    </button>
                  ))}
                </div>
              </Section>
              <Card className="overflow-hidden">
                <div className="p-6 sm:p-8" style={{ background: th.paper, color: th.ink }}>
                  <div className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: th.accent }}>
                    Live preview
                  </div>
                  <div className="mt-3 font-serif text-[40px] leading-[0.95] tracking-tight">
                    The law, argued with <em style={{ color: th.accent }}>clarity</em>.
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <span className="px-5 py-2.5 text-sm" style={{ background: th.ink, color: th.paper, borderRadius: th.radius }}>
                      Book a consultation
                    </span>
                    <span className="border px-5 py-2.5 text-sm" style={{ borderColor: th.ink + "33", borderRadius: th.radius }}>
                      Explore practice
                    </span>
                  </div>
                  <div className="mt-6 h-28" style={{ background: th.ink, borderRadius: th.radius }} />
                </div>
              </Card>
            </>
          )}

          {tab === "intro" && (
            <Section title="Intro animation" desc="Plays when a visitor first lands on the site.">
              <Toggle label="Enable intro" checked={s.intro.enabled} onChange={(v) => patch("intro", { enabled: v })} />
              <div className="sm:col-span-2">
                <Label>Style</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["curtain", "split", "monogram"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => patch("intro", { style: st })}
                      className={cn(
                        "rounded-xl border px-3 py-3 text-[14px] font-medium capitalize transition",
                        s.intro.style === st ? "border-[#1d1d1f] bg-[#1d1d1f] text-white" : "border-black/10 bg-white hover:border-black/30",
                      )}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2">
                <Label help="Revealed one by one (curtain style).">Words</Label>
                <TagsInput value={s.intro.words} onChange={(v) => patch("intro", { words: v })} />
              </div>
              <div>
                <Label>Duration · {(s.intro.durationMs / 1000).toFixed(1)}s</Label>
                <input
                  type="range"
                  min={1200}
                  max={5000}
                  step={100}
                  value={s.intro.durationMs}
                  onChange={(e) => patch("intro", { durationMs: Number(e.target.value) })}
                  className="mt-3 w-full accent-[var(--accent)]"
                />
              </div>
              <Toggle label="Play once per session" desc="Returning within the same tab skips the intro." checked={s.intro.oncePerSession} onChange={(v) => patch("intro", { oncePerSession: v })} />
              <IntroPreview intro={s.intro} theme={th} brand={b.name} />
            </Section>
          )}

          {tab === "nav" && (
            <Section title="Navigation" desc="Items in the floating navbar and full-screen menu. Order matters.">
              <div className="space-y-2 sm:col-span-2">
                {s.nav.items.map((it, i) => {
                  const setItem = (v: Partial<typeof it>) =>
                    patch("nav", { items: s.nav.items.map((x, j) => (j === i ? { ...x, ...v } : x)) });
                  return (
                    <motion.div layout key={i} className={cn("flex flex-col gap-2 rounded-2xl border border-black/[0.07] bg-[#fbfbfd] p-3 sm:flex-row sm:items-center", !it.visible && "opacity-55")}>
                      <span className="hidden w-6 text-center text-[12px] tabular-nums text-black/35 sm:block">{i + 1}</span>
                      <input className={cn(inputCls, "sm:w-44")} value={it.label} onChange={(e) => setItem({ label: e.target.value })} placeholder="Label" />
                      <input className={cn(inputCls, "font-mono text-[13px]")} value={it.href} onChange={(e) => setItem({ href: e.target.value })} placeholder="/path" />
                      <div className="flex shrink-0 justify-end gap-0.5">
                        <IconBtn label={it.visible ? "Hide" : "Show"} onClick={() => setItem({ visible: !it.visible })}>
                          {it.visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                        </IconBtn>
                        <IconBtn label="Move up" disabled={i === 0} onClick={() => patch("nav", { items: move(s.nav.items, i, -1) })}>
                          <ArrowUp className="size-3.5" />
                        </IconBtn>
                        <IconBtn label="Move down" disabled={i === s.nav.items.length - 1} onClick={() => patch("nav", { items: move(s.nav.items, i, 1) })}>
                          <ArrowDown className="size-3.5" />
                        </IconBtn>
                        <IconBtn label="Remove" danger onClick={() => patch("nav", { items: s.nav.items.filter((_, j) => j !== i) })}>
                          <Trash2 className="size-3.5" />
                        </IconBtn>
                      </div>
                    </motion.div>
                  );
                })}
                <Button size="sm" onClick={() => patch("nav", { items: [...s.nav.items, { label: "New link", href: "/", visible: true }] })}>
                  <Plus className="size-3.5" /> Add link
                </Button>
              </div>
              <Text label="CTA button label" value={s.nav.ctaLabel} onChange={(v) => patch("nav", { ctaLabel: v })} />
              <Text label="CTA button link" value={s.nav.ctaHref} onChange={(v) => patch("nav", { ctaHref: v })} />
            </Section>
          )}

          {tab === "hero" && (
            <Section title="Hero" desc="The first thing visitors see.">
              <Text label="Eyebrow" value={s.hero.eyebrow} onChange={(v) => patch("hero", { eyebrow: v })} />
              <Text label="Title — first line" value={s.hero.titleTop} onChange={(v) => patch("hero", { titleTop: v })} />
              <div className="sm:col-span-2">
                <Label help="Cycle in italic accent colour.">Rotating words</Label>
                <TagsInput value={s.hero.rotatingWords} onChange={(v) => patch("hero", { rotatingWords: v })} />
              </div>
              <Text label="Title — last line" value={s.hero.titleBottom} onChange={(v) => patch("hero", { titleBottom: v })} />
              <div />
              <Area label="Subtitle" rows={3} value={s.hero.subtitle} onChange={(v) => patch("hero", { subtitle: v })} />
              <div className="sm:col-span-2">
                <Label>Hero image</Label>
                <ImageInput value={s.hero.image} onChange={(v) => patch("hero", { image: v })} />
              </div>
              <Text label="Primary button" value={s.hero.primaryCta} onChange={(v) => patch("hero", { primaryCta: v })} />
              <Text label="Primary link" value={s.hero.primaryHref} onChange={(v) => patch("hero", { primaryHref: v })} />
              <Text label="Secondary button" value={s.hero.secondaryCta} onChange={(v) => patch("hero", { secondaryCta: v })} />
              <Text label="Secondary link" value={s.hero.secondaryHref} onChange={(v) => patch("hero", { secondaryHref: v })} />
            </Section>
          )}

          {tab === "sections" && (
            <Section title="Home page sections" desc="Reorder and switch sections on or off.">
              <div className="space-y-2 sm:col-span-2">
                {s.sections.map((sec, i) => (
                  <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    key={sec.key}
                    className={cn("flex items-center gap-3 rounded-2xl border border-black/[0.07] bg-[#fbfbfd] px-4 py-3", !sec.enabled && "opacity-55")}
                  >
                    <span className="w-5 text-[12px] tabular-nums text-black/35">{i + 1}</span>
                    <span className="flex-1 text-[15px] font-medium">{sec.label}</span>
                    <IconBtn label="Move up" disabled={i === 0} onClick={() => patch("sections", move(s.sections, i, -1))}>
                      <ArrowUp className="size-3.5" />
                    </IconBtn>
                    <IconBtn label="Move down" disabled={i === s.sections.length - 1} onClick={() => patch("sections", move(s.sections, i, 1))}>
                      <ArrowDown className="size-3.5" />
                    </IconBtn>
                    <Switch
                      checked={sec.enabled}
                      label={sec.label}
                      onChange={(v) => patch("sections", s.sections.map((x, j) => (j === i ? { ...x, enabled: v } : x)))}
                    />
                  </motion.div>
                ))}
              </div>
            </Section>
          )}

          {tab === "content" && (
            <>
              <Section title="Scroll statement" desc="Large text that lights up word by word as you scroll.">
                <Area label="Statement" rows={5} value={s.statement.text} onChange={(v) => patch("statement", { text: v })} />
                <Text label="Signature" value={s.statement.signature} onChange={(v) => patch("statement", { signature: v })} />
              </Section>
              <Section title="Image reveal">
                <Text label="Eyebrow" value={s.reveal.eyebrow} onChange={(v) => patch("reveal", { eyebrow: v })} />
                <Text label="Title" value={s.reveal.title} onChange={(v) => patch("reveal", { title: v })} />
                <div className="sm:col-span-2">
                  <Label>Image</Label>
                  <ImageInput value={s.reveal.image} onChange={(v) => patch("reveal", { image: v })} />
                </div>
              </Section>
              <Section title="Recognition marquee">
                <div className="sm:col-span-2">
                  <TagsInput value={s.marquee} onChange={(v) => patch("marquee", v)} />
                </div>
              </Section>
              <Section title="Numbers">
                <ListEditor
                  items={s.stats}
                  onChange={(v) => patch("stats", v)}
                  blank={{ value: 0, suffix: "", label: "New stat" }}
                  itemLabel={(t) => t.label}
                  fields={[
                    { name: "value", label: "Value", type: "number" },
                    { name: "suffix", label: "Suffix" },
                    { name: "label", label: "Label" },
                  ]}
                />
              </Section>
              <Section title="Our approach" desc="Horizontal-scroll process section.">
                <Text label="Section title" value={s.approach.title} onChange={(v) => patch("approach", { title: v })} />
                <ListEditor
                  items={s.approach.steps}
                  onChange={(v) => patch("approach", { steps: v })}
                  blank={{ title: "Step", body: "" }}
                  itemLabel={(t) => t.title}
                  fields={[
                    { name: "title", label: "Title" },
                    { name: "body", label: "Body", type: "textarea" },
                  ]}
                />
              </Section>
              <Section title="Call to action">
                <Text label="Title" value={s.cta.title} onChange={(v) => patch("cta", { title: v })} />
                <Text label="Button" value={s.cta.button} onChange={(v) => patch("cta", { button: v })} />
                <Area label="Subtitle" rows={2} value={s.cta.subtitle} onChange={(v) => patch("cta", { subtitle: v })} />
              </Section>
              <Section title="About page">
                <Text label="Title" value={s.about.title} onChange={(v) => patch("about", { title: v })} />
                <div />
                <Area label="Intro" rows={2} value={s.about.intro} onChange={(v) => patch("about", { intro: v })} />
                <Area label="Body" rows={5} value={s.about.body} onChange={(v) => patch("about", { body: v })} />
                <div className="sm:col-span-2">
                  <Label>Image</Label>
                  <ImageInput value={s.about.image} onChange={(v) => patch("about", { image: v })} />
                </div>
                <ListEditor
                  items={s.about.values}
                  onChange={(v) => patch("about", { values: v })}
                  blank={{ title: "Value", body: "" }}
                  itemLabel={(t) => t.title}
                  fields={[
                    { name: "title", label: "Title" },
                    { name: "body", label: "Body", type: "textarea" },
                  ]}
                />
              </Section>
            </>
          )}

          {tab === "offices" && (
            <Section title="Offices" desc="Shown on the contact page and footer.">
              <ListEditor
                items={s.offices}
                onChange={(v) => patch("offices", v)}
                blank={{ city: "New city", address: "", phone: "", image: "" }}
                itemLabel={(t) => t.city}
                fields={[
                  { name: "city", label: "City" },
                  { name: "phone", label: "Phone" },
                  { name: "address", label: "Address", type: "textarea" },
                  { name: "image", label: "Image", type: "image" },
                ]}
              />
            </Section>
          )}

          {tab === "announcement" && (
            <Section title="Announcement bar" desc="A slim bar above the navbar.">
              <Toggle label="Show announcement" checked={s.announcement.enabled} onChange={(v) => patch("announcement", { enabled: v })} />
              <Text label="Text" value={s.announcement.text} onChange={(v) => patch("announcement", { text: v })} />
              <Text label="Link" value={s.announcement.href} onChange={(v) => patch("announcement", { href: v })} />
            </Section>
          )}

          {tab === "disclaimer" && (
            <Section title="Disclaimer popup" desc="Bar Council of India compliant consent shown before visitors browse.">
              <Toggle label="Show disclaimer" checked={s.disclaimer.enabled} onChange={(v) => patch("disclaimer", { enabled: v })} />
              <Text label="Title" value={s.disclaimer.title} onChange={(v) => patch("disclaimer", { title: v })} />
              <div />
              <Area label="Body" rows={7} value={s.disclaimer.body} onChange={(v) => patch("disclaimer", { body: v })} />
            </Section>
          )}

          {tab === "features" && (
            <Section title="Features" desc="Switch site-wide behaviours on or off.">
              <Toggle label="WhatsApp button" desc="Floating chat button on every page." checked={s.features.whatsappButton} onChange={(v) => patch("features", { whatsappButton: v })} />
              <Toggle label="Cookie banner" desc="Consent banner for first-time visitors." checked={s.features.cookieBanner} onChange={(v) => patch("features", { cookieBanner: v })} />
              <Toggle label="Smooth scroll" desc="Inertia scrolling on desktop." checked={s.features.smoothScroll} onChange={(v) => patch("features", { smoothScroll: v })} />
              <Toggle label="Custom cursor" desc="Magnetic cursor on pointer devices." checked={s.features.customCursor} onChange={(v) => patch("features", { customCursor: v })} />
            </Section>
          )}

          {tab === "seo" && (
            <Section title="Search engines" desc="Default title and description.">
              <Text label="Meta title" value={s.seo.title} onChange={(v) => patch("seo", { title: v })} help={`${s.seo.title.length}/60 characters`} />
              <div />
              <Area label="Meta description" rows={3} value={s.seo.description} onChange={(v) => patch("seo", { description: v })} help={`${s.seo.description.length}/160 characters`} />
              <div className="rounded-2xl border border-black/[0.07] bg-white p-4 sm:col-span-2">
                <div className="text-[12px] text-black/45">Google preview</div>
                <div className="mt-1 truncate text-[18px] text-[#1a0dab]">{s.seo.title}</div>
                <div className="line-clamp-2 text-[13px] text-black/60">{s.seo.description}</div>
              </div>
            </Section>
          )}

          {tab === "legal" && (
            <Section title="Legal pages">
              <Area label="Privacy policy" rows={8} value={s.legal.privacy} onChange={(v) => patch("legal", { privacy: v })} />
              <Area label="Terms of use" rows={8} value={s.legal.terms} onChange={(v) => patch("legal", { terms: v })} />
            </Section>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {dirtyGroups.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 34 }}
            className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-xl items-center justify-between gap-3 rounded-full bg-[#1d1d1f]/92 py-2 pl-5 pr-2 text-white shadow-2xl backdrop-blur-xl lg:left-[264px]"
          >
            <span className="text-[14px]">
              <span className="mr-2 inline-block size-2 rounded-full bg-[var(--accent)]" />
              Unsaved changes
            </span>
            <div className="flex gap-1.5">
              <button onClick={() => setS(orig)} className="h-9 rounded-full px-4 text-[14px] text-white/70 hover:bg-white/10 hover:text-white">
                Discard
              </button>
              <Button onClick={save} loading={saving} className="!h-9 !border-0 !bg-white !text-[#1d1d1f]">
                Save
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
