"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, ChevronRight, Plus, Search, SlidersHorizontal } from "lucide-react";
import { getCollectionDef, type Field } from "@/lib/admin-schema";
import { adminApi, type Rec } from "./api";
import { RecordDrawer } from "./RecordDrawer";
import { useToast } from "./Toast";
import { Badge, Button, Card, cn, inr, PageHeader } from "./ui";
import { CollectionIcon } from "./icons";

export function formatCell(f: Field, v: unknown): React.ReactNode {
  if (v === undefined || v === null || v === "") return <span className="text-black/25">—</span>;
  switch (f.type) {
    case "boolean":
      return <Badge value={v ? "yes" : "no"} />;
    case "select":
      return <Badge value={String(v)} />;
    case "number":
      return f.label.includes("₹") ? (
        <span className="tabular-nums">{inr(Number(v))}</span>
      ) : (
        <span className="tabular-nums">{String(v)}</span>
      );
    case "date": {
      const d = new Date(String(v));
      return isNaN(d.getTime())
        ? String(v)
        : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    }
    case "tags":
      return Array.isArray(v) ? (v as string[]).join(", ") : String(v);
    default:
      return String(v);
  }
}

export function CollectionManager({
  collection,
  initial,
  hideHeader,
}: {
  collection: string;
  initial: Rec[];
  hideHeader?: boolean;
}) {
  const def = getCollectionDef(collection)!;
  const router = useRouter();
  const toast = useToast();
  const [rows, setRows] = useState<Rec[]>(initial);
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const [editing, setEditing] = useState<Partial<Rec> | null>(null);
  const [open, setOpen] = useState(false);

  const columns = def.fields.filter((f) => f.column);
  const filterable = def.fields.filter((f) => f.type === "select" && f.column);
  const imageField = def.fields.find((f) => f.type === "image");

  const view = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let out = rows.filter((r) => {
      if (needle && !JSON.stringify(r).toLowerCase().includes(needle)) return false;
      return Object.entries(filters).every(([k, v]) => !v || String(r[k]) === v);
    });
    if (sort) {
      out = [...out].sort((a, b) => {
        const av = a[sort.key];
        const bv = b[sort.key];
        if (typeof av === "number" && typeof bv === "number") return (av - bv) * sort.dir;
        return String(av ?? "").localeCompare(String(bv ?? "")) * sort.dir;
      });
    }
    return out;
  }, [rows, q, filters, sort]);

  const openRecord = (r: Partial<Rec> | null) => {
    setEditing(r);
    setOpen(true);
  };

  const save = async (data: Record<string, unknown>) => {
    if (editing?.id) {
      const id = String(editing.id);
      const prev = rows;
      setRows((rs) => rs.map((r) => (r.id === id ? ({ ...r, ...data } as Rec) : r)));
      setOpen(false);
      try {
        const saved = await adminApi.update(collection, id, data);
        setRows((rs) => rs.map((r) => (r.id === id ? saved : r)));
        toast(`${def.singular} saved`);
        router.refresh();
      } catch (e) {
        setRows(prev);
        toast((e as Error).message, "err");
      }
    } else {
      const created = await adminApi.create(collection, data);
      setRows((rs) => [created, ...rs]);
      setOpen(false);
      toast(`${def.singular} created`);
      router.refresh();
    }
  };

  const del = async (id: string) => {
    const prev = rows;
    setRows((rs) => rs.filter((r) => r.id !== id));
    setOpen(false);
    try {
      await adminApi.remove(collection, id);
      toast(`${def.singular} deleted`);
      router.refresh();
    } catch (e) {
      setRows(prev);
      toast((e as Error).message, "err");
    }
  };

  const toggleSort = (key: string) =>
    setSort((s) => (s?.key === key ? (s.dir === 1 ? { key, dir: -1 } : null) : { key, dir: 1 }));

  return (
    <div>
      {!hideHeader && (
        <PageHeader
          title={def.label}
          description={def.description}
          actions={
            <Button variant="primary" onClick={() => openRecord(null)}>
              <Plus className="size-4" /> New {def.singular.toLowerCase()}
            </Button>
          }
        />
      )}

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-black/35" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${def.label.toLowerCase()}…`}
            className="h-10 w-full rounded-full border border-black/[0.08] bg-white pl-10 pr-4 text-[14px] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[color-mix(in_oklab,var(--accent)_15%,transparent)]"
          />
        </div>
        {filterable.length > 0 && (
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
            <SlidersHorizontal className="size-4 shrink-0 text-black/35" />
            {filterable.map((f) => (
              <select
                key={f.name}
                value={filters[f.name] ?? ""}
                onChange={(e) => setFilters((x) => ({ ...x, [f.name]: e.target.value }))}
                className="h-10 shrink-0 rounded-full border border-black/[0.08] bg-white px-3.5 text-[13px] capitalize outline-none"
              >
                <option value="">All {f.label.toLowerCase()}</option>
                {f.options?.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ))}
          </div>
        )}
        {hideHeader && (
          <Button variant="primary" onClick={() => openRecord(null)}>
            <Plus className="size-4" /> New
          </Button>
        )}
      </div>

      {view.length === 0 ? (
        <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-3 grid size-12 place-items-center rounded-2xl bg-black/[0.04]">
            <CollectionIcon name={def.icon} className="size-5 text-black/40" />
          </div>
          <div className="text-[16px] font-semibold">No {def.label.toLowerCase()} {q || Object.values(filters).some(Boolean) ? "match" : "yet"}</div>
          <p className="mt-1 max-w-sm text-[14px] text-black/50">
            {q ? "Try a different search." : `Create your first ${def.singular.toLowerCase()} to get started.`}
          </p>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden overflow-hidden md:block">
            <table className="w-full text-left text-[14px]">
              <thead>
                <tr className="border-b border-black/[0.06] bg-black/[0.015]">
                  {columns.map((c) => (
                    <th key={c.name} className="px-4 py-3 font-medium text-black/50">
                      <button onClick={() => toggleSort(c.name)} className="inline-flex items-center gap-1 hover:text-black">
                        {c.label.replace(/ \(.*\)/, "")}
                        {sort?.key === c.name &&
                          (sort.dir === 1 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                      </button>
                    </th>
                  ))}
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {view.map((r) => (
                    <motion.tr
                      key={r.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => openRecord(r)}
                      className="group cursor-pointer border-b border-black/[0.04] last:border-0 hover:bg-black/[0.02]"
                    >
                      {columns.map((c, i) => (
                        <td key={c.name} className={cn("px-4 py-3", i === 0 && "font-medium text-[#1d1d1f]")}>
                          {i === 0 && imageField && r[imageField.name] ? (
                            <span className="flex items-center gap-3">
                              <img src={String(r[imageField.name])} alt="" className="size-9 rounded-lg object-cover" />
                              {formatCell(c, r[c.name])}
                            </span>
                          ) : (
                            formatCell(c, r[c.name])
                          )}
                        </td>
                      ))}
                      <td className="pr-3 text-black/25 transition group-hover:translate-x-0.5 group-hover:text-black/60">
                        <ChevronRight className="size-4" />
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </Card>

          {/* Mobile cards */}
          <div className="space-y-2 md:hidden">
            {view.map((r) => (
              <button
                key={r.id}
                onClick={() => openRecord(r)}
                className="flex w-full items-center gap-3 rounded-2xl border border-black/[0.06] bg-white p-4 text-left active:scale-[0.99]"
              >
                {imageField && r[imageField.name] ? (
                  <img src={String(r[imageField.name])} alt="" className="size-12 shrink-0 rounded-xl object-cover" />
                ) : null}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-semibold">{String(r[def.titleField] ?? "Untitled")}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-black/50">
                    {columns
                      .filter((c) => c.name !== def.titleField)
                      .slice(0, 3)
                      .map((c) => (
                        <span key={c.name}>{formatCell(c, r[c.name])}</span>
                      ))}
                  </div>
                </div>
                <ChevronRight className="size-4 shrink-0 text-black/25" />
              </button>
            ))}
          </div>
          <div className="mt-3 text-[12px] text-black/40">
            {view.length} of {rows.length} {def.label.toLowerCase()}
          </div>
        </>
      )}

      <RecordDrawer
        def={def}
        record={editing}
        open={open}
        onClose={() => setOpen(false)}
        onSave={save}
        onDelete={del}
      />
    </div>
  );
}
