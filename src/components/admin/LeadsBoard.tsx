"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Columns3, Plus, Rows3, UserPlus } from "lucide-react";
import { getCollectionDef } from "@/lib/admin-schema";
import { LEAD_STAGES, type LeadStage } from "@/lib/types";
import { adminApi, type Rec } from "./api";
import { CollectionManager } from "./CollectionManager";
import { RecordDrawer } from "./RecordDrawer";
import { useToast } from "./Toast";
import { Button, cn, inr, PageHeader, timeAgo } from "./ui";

const DOT: Record<LeadStage, string> = {
  new: "bg-sky-500",
  contacted: "bg-indigo-500",
  consultation: "bg-violet-500",
  proposal: "bg-amber-500",
  retained: "bg-emerald-500",
  lost: "bg-zinc-400",
};

export function LeadsBoard({ initial }: { initial: Rec[] }) {
  const def = getCollectionDef("leads")!;
  const router = useRouter();
  const toast = useToast();
  const [mode, setMode] = useState<"kanban" | "table">("kanban");
  const [rows, setRows] = useState<Rec[]>(initial);
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<Rec> | null>(null);
  const [open, setOpen] = useState(false);

  const byStage = useMemo(() => {
    const m: Record<string, Rec[]> = {};
    for (const s of LEAD_STAGES) m[s.key] = [];
    for (const r of rows) (m[String(r.stage)] ?? m.new).push(r);
    return m;
  }, [rows]);

  const pipeline = rows.filter((r) => r.stage !== "lost").reduce((a, r) => a + Number(r.value || 0), 0);

  const move = async (id: string, stage: string) => {
    const lead = rows.find((r) => r.id === id);
    if (!lead || lead.stage === stage) return;
    const prev = rows;
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, stage } : r)));
    try {
      await adminApi.update("leads", id, { stage });
      toast(`${lead.name} → ${LEAD_STAGES.find((s) => s.key === stage)?.label}`);
      router.refresh();
    } catch (e) {
      setRows(prev);
      toast((e as Error).message, "err");
    }
  };

  const save = async (data: Record<string, unknown>) => {
    if (editing?.id) {
      const saved = await adminApi.update("leads", String(editing.id), data);
      setRows((rs) => rs.map((r) => (r.id === saved.id ? saved : r)));
      toast("Lead saved");
    } else {
      const created = await adminApi.create("leads", data);
      setRows((rs) => [created, ...rs]);
      toast("Lead created");
    }
    setOpen(false);
    router.refresh();
  };

  const del = async (id: string) => {
    await adminApi.remove("leads", id);
    setRows((rs) => rs.filter((r) => r.id !== id));
    setOpen(false);
    toast("Lead deleted");
    router.refresh();
  };

  const convert = async (draft: Record<string, unknown>) => {
    if (!draft.id) return;
    try {
      await adminApi.create("clients", {
        name: draft.name,
        email: draft.email,
        phone: draft.phone,
        company: "",
        type: "individual",
        status: "active",
        address: "",
        notes: `Converted from lead (${draft.practiceArea || "General"}). ${draft.message ?? ""}`.trim(),
      });
      const saved = await adminApi.update("leads", String(draft.id), { stage: "retained" });
      setRows((rs) => rs.map((r) => (r.id === saved.id ? saved : r)));
      setOpen(false);
      toast(`${draft.name} added to clients`);
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "err");
    }
  };

  return (
    <div>
      <PageHeader
        title="Leads pipeline"
        description={`${rows.length} leads · ${inr(pipeline)} open pipeline`}
        actions={
          <>
            <div className="inline-flex rounded-full bg-black/[0.05] p-0.5">
              {(
                [
                  ["kanban", Columns3, "Board"],
                  ["table", Rows3, "Table"],
                ] as const
              ).map(([k, I, label]) => (
                <button
                  key={k}
                  onClick={() => setMode(k)}
                  className={cn(
                    "relative flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium",
                    mode === k ? "text-[#1d1d1f]" : "text-black/50",
                  )}
                >
                  {mode === k && (
                    <motion.span layoutId="leads-mode" className="absolute inset-0 rounded-full bg-white shadow-sm" />
                  )}
                  <I className="relative size-4" />
                  <span className="relative">{label}</span>
                </button>
              ))}
            </div>
            {mode === "kanban" && (
              <Button
                variant="primary"
                onClick={() => {
                  setEditing(null);
                  setOpen(true);
                }}
              >
                <Plus className="size-4" /> New lead
              </Button>
            )}
          </>
        }
      />

      {mode === "table" ? (
        <CollectionManager collection="leads" initial={rows} hideHeader />
      ) : (
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 md:-mx-0 md:px-0">
          {LEAD_STAGES.map((s) => {
            const items = byStage[s.key];
            const total = items.reduce((a, r) => a + Number(r.value || 0), 0);
            return (
              <div
                key={s.key}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOver(s.key);
                }}
                onDragLeave={() => setOver((o) => (o === s.key ? null : o))}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData("text/plain") || dragId;
                  if (id) move(id, s.key);
                  setOver(null);
                  setDragId(null);
                }}
                className={cn(
                  "flex w-[82%] shrink-0 snap-start flex-col rounded-2xl bg-black/[0.03] p-2 transition-colors sm:w-[290px]",
                  over === s.key && "bg-[color-mix(in_oklab,var(--accent)_14%,transparent)] ring-2 ring-[var(--accent)]/40",
                )}
              >
                <div className="flex items-center justify-between px-2 pb-2 pt-1.5">
                  <div className="flex items-center gap-2">
                    <span className={cn("size-2 rounded-full", DOT[s.key])} />
                    <span className="text-[14px] font-semibold">{s.label}</span>
                    <span className="rounded-full bg-black/[0.06] px-1.5 text-[12px] tabular-nums text-black/55">
                      {items.length}
                    </span>
                  </div>
                  <span className="text-[12px] tabular-nums text-black/45">{inr(total)}</span>
                </div>
                <div className="flex min-h-[120px] flex-1 flex-col gap-2">
                  {items.map((r) => (
                    <motion.div
                      layout
                      layoutId={`lead-${r.id}`}
                      key={r.id}
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                      draggable
                      onDragStartCapture={(e: React.DragEvent) => {
                        e.dataTransfer.setData("text/plain", r.id);
                        e.dataTransfer.effectAllowed = "move";
                        setDragId(r.id);
                      }}
                      onDragEndCapture={() => setDragId(null)}
                      onClick={() => {
                        setEditing(r);
                        setOpen(true);
                      }}
                      className={cn(
                        "cursor-grab rounded-xl border border-black/[0.06] bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-md active:cursor-grabbing",
                        dragId === r.id && "opacity-40",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-[14px] font-semibold leading-snug">{String(r.name)}</div>
                        <div className="shrink-0 text-[11px] text-black/40">{timeAgo(String(r.createdAt))}</div>
                      </div>
                      <div className="mt-1 text-[12.5px] text-black/50">{String(r.practiceArea || "—")}</div>
                      {r.message ? (
                        <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-black/60">{String(r.message)}</p>
                      ) : null}
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="text-[13px] font-semibold tabular-nums">{inr(Number(r.value || 0))}</span>
                        {r.assignedTo ? (
                          <span className="truncate rounded-full bg-black/[0.04] px-2 py-0.5 text-[11px] text-black/55">
                            {String(r.assignedTo)}
                          </span>
                        ) : null}
                      </div>
                      <select
                        aria-label="Move to stage"
                        value={String(r.stage)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => move(r.id, e.target.value)}
                        className="mt-3 w-full rounded-lg border border-black/[0.08] bg-black/[0.02] px-2 py-1.5 text-[12px] outline-none md:hidden"
                      >
                        {LEAD_STAGES.map((x) => (
                          <option key={x.key} value={x.key}>
                            Move to {x.label}
                          </option>
                        ))}
                      </select>
                    </motion.div>
                  ))}
                  {items.length === 0 && (
                    <div className="grid flex-1 place-items-center rounded-xl border border-dashed border-black/10 text-[12px] text-black/35">
                      Drop leads here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <RecordDrawer
        def={def}
        record={editing}
        open={open}
        onClose={() => setOpen(false)}
        onSave={save}
        onDelete={del}
        extra={(draft) =>
          draft.id && draft.stage !== "retained" ? (
            <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl bg-[color-mix(in_oklab,var(--accent)_10%,white)] p-4">
              <div className="text-[13px] leading-snug text-black/70">
                Ready to engage? Create a client record and mark this lead as retained.
              </div>
              <Button size="sm" variant="primary" onClick={() => convert(draft)}>
                <UserPlus className="size-3.5" /> Convert
              </Button>
            </div>
          ) : null
        }
      />
    </div>
  );
}
