"use client";

import { useState } from "react";
import { Check, ExternalLink, Trash2 } from "lucide-react";
import type { CollectionDef } from "@/lib/admin-schema";
import { MATTER_STAGES } from "@/lib/types";
import { Drawer } from "./Drawer";
import { FieldInput } from "./FieldInput";
import { Button, cn, Label, timeAgo } from "./ui";
import type { Rec } from "./api";

function MatterStepper({ stage, onChange }: { stage: number; onChange: (n: number) => void }) {
  return (
    <div className="mb-6 rounded-2xl border border-black/[0.06] bg-white p-4">
      <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-black/40">Matter progress</div>
      <ol className="flex items-start">
        {MATTER_STAGES.map((s, i) => {
          const done = i < stage;
          const current = i === stage;
          return (
            <li key={s} className="relative flex flex-1 flex-col items-center">
              {i > 0 && (
                <span
                  className={cn(
                    "absolute right-1/2 top-[13px] h-[2px] w-full -translate-y-1/2 transition-colors duration-500",
                    i <= stage ? "bg-[var(--accent)]" : "bg-black/10",
                  )}
                />
              )}
              <button
                type="button"
                onClick={() => onChange(i)}
                aria-label={`Set stage ${s}`}
                className={cn(
                  "relative z-10 grid size-[26px] place-items-center rounded-full text-[11px] font-semibold transition-all duration-300",
                  done && "bg-[var(--accent)] text-white",
                  current && "bg-[#1d1d1f] text-white ring-4 ring-[color-mix(in_oklab,var(--accent)_25%,transparent)]",
                  !done && !current && "bg-white text-black/40 ring-1 ring-black/15 hover:ring-black/30",
                )}
              >
                {done ? <Check className="size-3.5" /> : i + 1}
              </button>
              <span
                className={cn(
                  "mt-2 hidden text-center text-[11px] leading-tight sm:block",
                  current ? "font-semibold text-[#1d1d1f]" : "text-black/45",
                )}
              >
                {s}
              </span>
            </li>
          );
        })}
      </ol>
      <div className="mt-3 text-center text-[13px] font-medium sm:hidden">{MATTER_STAGES[stage] ?? "—"}</div>
    </div>
  );
}

export function RecordDrawer({
  def,
  record,
  open,
  onClose,
  onSave,
  onDelete,
  extra,
}: {
  def: CollectionDef;
  record: Partial<Rec> | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  extra?: (draft: Record<string, unknown>) => React.ReactNode;
}) {
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Reset the form whenever the drawer opens or the target record changes
  // (state adjustment during render — avoids an effect round-trip).
  const [synced, setSynced] = useState<{ open: boolean; record: Partial<Rec> | null }>({ open: false, record: null });
  if (synced.open !== open || synced.record !== record) {
    setSynced({ open, record });
    if (open) {
      setDraft(record?.id ? { ...record } : { ...def.defaults, ...(record ?? {}) });
      setError("");
    }
  }

  const isNew = !record?.id;
  const set = (k: string, v: unknown) => setDraft((d) => ({ ...d, [k]: v }));
  const href = !isNew && def.publicHref ? def.publicHref(draft) : null;

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const missing = def.fields.find((f) => f.required && !draft[f.name]);
    if (missing) return setError(`${missing.label} is required`);
    setSaving(true);
    setError("");
    try {
      await onSave(draft);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isNew ? `New ${def.singular.toLowerCase()}` : String(draft[def.titleField] || def.singular)}
      subtitle={
        isNew ? def.description : record?.updatedAt ? `Last updated ${timeAgo(String(record.updatedAt))}` : undefined
      }
      footer={
        <>
          <div className="flex items-center gap-1">
            {!isNew && onDelete && (
              <Button
                variant="danger"
                size="sm"
                onClick={async () => {
                  if (!confirm(`Delete this ${def.singular.toLowerCase()}? This cannot be undone.`)) return;
                  await onDelete(String(record!.id));
                }}
              >
                <Trash2 className="size-3.5" /> Delete
              </Button>
            )}
            {href && (
              <a href={href} target="_blank" className="inline-flex h-8 items-center gap-1 rounded-full px-3 text-[13px] font-medium hover:bg-black/5">
                <ExternalLink className="size-3.5" /> View on site
              </a>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" loading={saving} onClick={() => submit()}>
              {isNew ? "Create" : "Save"}
            </Button>
          </div>
        </>
      }
    >
      <form onSubmit={submit}>
        {def.key === "matters" && (
          <MatterStepper stage={Number(draft.stage ?? 0)} onChange={(n) => set("stage", n)} />
        )}
        {extra?.(draft)}
        {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-[14px] text-red-600">{error}</div>}
        <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
          {def.fields.map((f) => (
            <div key={f.name} className={cn("block", (f.wide || ["textarea", "markdown", "image", "tags"].includes(f.type)) && "sm:col-span-2")}>
              <Label help={f.help}>
                {f.label}
                {f.required && <span className="text-[var(--accent)]"> *</span>}
              </Label>
              <FieldInput field={f} value={draft[f.name]} onChange={(v) => set(f.name, v)} />
            </div>
          ))}
        </div>
        <button type="submit" hidden />
      </form>
    </Drawer>
  );
}
