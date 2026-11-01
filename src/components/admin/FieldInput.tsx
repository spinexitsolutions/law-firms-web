"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { ImageIcon, X } from "lucide-react";
import type { Field } from "@/lib/admin-schema";
import { cn, inputCls, Switch } from "./ui";

const UNSPLASH = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=80`;
export const IMAGE_SUGGESTIONS: { label: string; url: string }[] = [
  { label: "Library", url: UNSPLASH("1505664194779-8beaceb93744") },
  { label: "Gavel", url: UNSPLASH("1589829545856-d10d557cf95f") },
  { label: "Scales", url: UNSPLASH("1593115057322-e94b77572f20") },
  { label: "Signing", url: UNSPLASH("1450101499163-c8848c66ca85") },
  { label: "Office", url: UNSPLASH("1497366811353-6870744d04b2") },
  { label: "Tower", url: UNSPLASH("1486406146926-c627a92ad1ab") },
  { label: "Meeting", url: UNSPLASH("1600880292203-757bb62b4baf") },
  { label: "Columns", url: UNSPLASH("1479142506502-19b3a3b7ff33") },
];

export function TagsInput({
  value,
  onChange,
  placeholder = "Type and press Enter",
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const parts = draft
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length) onChange([...value, ...parts.filter((p) => !value.includes(p))]);
    setDraft("");
  };
  return (
    <div
      className={cn(
        inputCls,
        "flex min-h-[46px] flex-wrap items-center gap-1.5 px-2 py-1.5 focus-within:border-[var(--accent)]",
      )}
    >
      {value.map((t, i) => (
        <span
          key={`${t}-${i}`}
          className="inline-flex items-center gap-1 rounded-full bg-black/[0.05] py-1 pl-2.5 pr-1 text-[13px]"
        >
          {t}
          <button
            type="button"
            aria-label={`Remove ${t}`}
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="grid size-4 place-items-center rounded-full hover:bg-black/10"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          } else if (e.key === "Backspace" && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={add}
        placeholder={value.length ? "" : placeholder}
        className="min-w-[120px] flex-1 bg-transparent px-1.5 py-1 text-[15px] outline-none placeholder:text-black/30"
      />
    </div>
  );
}

export function ImageInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2.5">
      <div className="flex gap-3">
        <div className="relative size-[72px] shrink-0 overflow-hidden rounded-xl bg-black/[0.04] ring-1 ring-black/[0.06]">
          {value ? (
            <img src={value} alt="" className="size-full object-cover" />
          ) : (
            <ImageIcon className="absolute inset-0 m-auto size-5 text-black/25" />
          )}
        </div>
        <input
          className={cn(inputCls, "self-center")}
          value={value}
          placeholder="https://images.unsplash.com/…"
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
        {IMAGE_SUGGESTIONS.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => onChange(s.url)}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-black/10 bg-white py-1 pl-1 pr-2.5 text-[12px] hover:border-black/25"
          >
            <img src={s.url.replace("w=1600", "w=80")} alt="" className="size-5 rounded-full object-cover" />
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function renderMarkdown(src: string) {
  return src.split(/\n{2,}/).map((block, i) =>
    block.startsWith("## ") ? (
      <h3 key={i} className="mb-2 mt-4 font-serif text-xl">
        {block.slice(3)}
      </h3>
    ) : (
      <p key={i} className="mb-3 text-[14px] leading-relaxed text-black/70">
        {block}
      </p>
    ),
  );
}

function MarkdownInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [preview, setPreview] = useState(false);
  return (
    <div>
      <div className="mb-2 inline-flex rounded-full bg-black/[0.05] p-0.5 text-[12px] font-medium">
        {["Write", "Preview"].map((t, i) => (
          <button
            key={t}
            type="button"
            onClick={() => setPreview(i === 1)}
            className={cn(
              "rounded-full px-3 py-1 transition",
              preview === (i === 1) ? "bg-white shadow-sm" : "text-black/50",
            )}
          >
            {t}
          </button>
        ))}
      </div>
      {preview ? (
        <div className="min-h-[240px] rounded-xl border border-black/10 bg-white p-4">{renderMarkdown(value)}</div>
      ) : (
        <textarea
          className={cn(inputCls, "min-h-[240px] font-mono text-[13px] leading-relaxed")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

export function FieldInput({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const str = value == null ? "" : String(value);
  switch (field.type) {
    case "textarea":
      return (
        <textarea
          className={cn(inputCls, "min-h-[110px] leading-relaxed")}
          value={str}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "markdown":
      return <MarkdownInput value={str} onChange={onChange} />;
    case "image":
      return <ImageInput value={str} onChange={onChange} />;
    case "number":
      return (
        <input
          type="number"
          inputMode="decimal"
          className={inputCls}
          value={value === undefined || value === null ? "" : String(value)}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        />
      );
    case "boolean":
      return (
        <div className="flex h-[46px] items-center">
          <Switch checked={Boolean(value)} onChange={onChange} label={field.label} />
          <span className="ml-3 text-[14px] text-black/55">{value ? "Yes" : "No"}</span>
        </div>
      );
    case "select":
      return (
        <select className={cn(inputCls, "appearance-none capitalize")} value={str} onChange={(e) => onChange(e.target.value)}>
          <option value="">—</option>
          {field.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    case "tags":
      return <TagsInput value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} />;
    case "color":
      return (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={str || "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="size-[46px] cursor-pointer rounded-xl border border-black/10 bg-white p-1"
          />
          <input className={inputCls} value={str} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
    default:
      return (
        <input
          type={field.type === "email" ? "email" : field.type === "date" ? "date" : field.type === "time" ? "time" : "text"}
          className={inputCls}
          value={str}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}
