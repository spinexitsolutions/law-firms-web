"use client";

import { forwardRef } from "react";
import { clsx } from "clsx";
import { Loader2 } from "lucide-react";

export const cn = clsx;

export { inr, timeAgo } from "./format";

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, BtnProps>(function Button(
  { variant = "secondary", size = "md", loading, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full font-medium transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap",
        size === "sm" ? "h-8 px-3 text-[13px]" : "h-10 px-4 text-sm",
        variant === "primary" && "bg-[#1d1d1f] text-white hover:bg-black shadow-sm",
        variant === "secondary" && "bg-white text-[#1d1d1f] border border-black/10 hover:bg-black/[0.03]",
        variant === "ghost" && "text-[#1d1d1f] hover:bg-black/[0.05]",
        variant === "danger" && "bg-red-50 text-red-600 hover:bg-red-100",
        className,
      )}
      {...rest}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
});

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]", className)}>
      {children}
    </div>
  );
}

const BADGE: Record<string, string> = {
  new: "bg-sky-50 text-sky-700",
  contacted: "bg-indigo-50 text-indigo-700",
  consultation: "bg-violet-50 text-violet-700",
  proposal: "bg-amber-50 text-amber-700",
  retained: "bg-emerald-50 text-emerald-700",
  lost: "bg-zinc-100 text-zinc-500",
  active: "bg-emerald-50 text-emerald-700",
  inactive: "bg-zinc-100 text-zinc-500",
  intake: "bg-sky-50 text-sky-700",
  "on-hold": "bg-amber-50 text-amber-700",
  closed: "bg-zinc-100 text-zinc-500",
  requested: "bg-amber-50 text-amber-700",
  confirmed: "bg-emerald-50 text-emerald-700",
  completed: "bg-zinc-100 text-zinc-600",
  cancelled: "bg-red-50 text-red-600",
  draft: "bg-zinc-100 text-zinc-600",
  sent: "bg-sky-50 text-sky-700",
  paid: "bg-emerald-50 text-emerald-700",
  overdue: "bg-red-50 text-red-600",
  yes: "bg-emerald-50 text-emerald-700",
  no: "bg-zinc-100 text-zinc-500",
};

export function Badge({ value }: { value: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium capitalize",
        BADGE[value] ?? "bg-zinc-100 text-zinc-700",
      )}
    >
      {value}
    </span>
  );
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-[26px] w-[44px] shrink-0 items-center rounded-full transition-colors duration-300",
        checked ? "bg-[#34c759]" : "bg-black/15",
      )}
    >
      <span
        className={cn(
          "absolute left-[2px] size-[22px] rounded-full bg-white shadow-md transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)]",
          checked && "translate-x-[18px]",
        )}
      />
    </button>
  );
}

export const inputCls =
  "w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-[15px] text-[#1d1d1f] placeholder:text-black/30 outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[color-mix(in_oklab,var(--accent)_18%,transparent)]";

export function Label({ children, help }: { children: React.ReactNode; help?: string }) {
  return (
    <div className="mb-1.5">
      <div className="text-[13px] font-medium text-[#1d1d1f]">{children}</div>
      {help && <div className="text-[12px] text-black/45">{help}</div>}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-[#1d1d1f] md:text-[34px]">{title}</h1>
        {description && <p className="mt-1 text-[15px] text-black/50">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
