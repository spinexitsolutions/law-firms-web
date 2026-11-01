import Link from "next/link";
import {
  ArrowUpRight,
  Briefcase,
  CalendarDays,
  Inbox,
  IndianRupee,
  Mail,
  Plus,
  Receipt,
  Settings2,
  Newspaper,
  Activity as ActivityIcon,
} from "lucide-react";
import { getDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { LEAD_STAGES } from "@/lib/types";
import { inr, inrShort, timeAgo } from "@/components/admin/format";

export const metadata = { title: "Dashboard" };

const STAGE_COLOR: Record<string, string> = {
  new: "#0ea5e9",
  contacted: "#6366f1",
  consultation: "#8b5cf6",
  proposal: "#f59e0b",
  retained: "#10b981",
  lost: "#a1a1aa",
};

function Kpi({
  label,
  value,
  hint,
  icon: Icon,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: typeof Inbox;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-12px_rgba(0,0,0,0.15)]"
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-black/50">{label}</span>
        <span className="grid size-8 place-items-center rounded-full bg-black/[0.04] text-black/50 transition group-hover:bg-[var(--accent)] group-hover:text-white">
          <Icon className="size-4" />
        </span>
      </div>
      <div className="mt-3 text-[28px] font-semibold tracking-[-0.02em] tabular-nums md:text-[32px]">{value}</div>
      {hint && <div className="mt-0.5 text-[12.5px] text-black/45">{hint}</div>}
    </Link>
  );
}

/** Request-time clock, kept outside the component body. */
function clock() {
  const d = new Date();
  return {
    today: d.toISOString().slice(0, 10),
    weekAgo: d.getTime() - 7 * 86400000,
    hour: Number(d.toLocaleString("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" })),
    todayLabel: d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Kolkata" }),
  };
}

export default async function Dashboard() {
  const [db, session] = await Promise.all([getDB(), getSession()]);
  const { today, weekAgo, hour, todayLabel } = clock();

  const newLeads = db.leads.filter((l) => Date.parse(l.createdAt) >= weekAgo).length;
  const pipeline = db.leads.filter((l) => l.stage !== "lost").reduce((a, l) => a + (Number(l.value) || 0), 0);
  const activeMatters = db.matters.filter((m) => m.status === "active" || m.status === "intake").length;
  const upcoming = db.appointments
    .filter((a) => a.date >= today && a.status !== "cancelled" && a.status !== "completed")
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const outstanding = db.invoices
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((a, i) => a + (Number(i.amount) || 0), 0);
  const overdue = db.invoices.filter((i) => i.status === "overdue").length;

  const stages = LEAD_STAGES.map((s) => {
    const items = db.leads.filter((l) => l.stage === s.key);
    return { ...s, count: items.length, value: items.reduce((a, l) => a + (Number(l.value) || 0), 0) };
  });
  const maxCount = Math.max(1, ...stages.map((s) => s.count));
  const won = stages.find((s) => s.key === "retained")!.count;
  const closed = won + stages.find((s) => s.key === "lost")!.count;
  const conversion = closed ? Math.round((won / closed) * 100) : 0;

  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[13px] font-medium text-black/45">
            {todayLabel}
          </div>
          <h1 className="mt-1 text-[30px] font-semibold tracking-[-0.025em] md:text-[38px]">
            {greeting}
            <span className="text-black/35">, {session?.email.split("@")[0]}</span>
          </h1>
        </div>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
          {[
            { href: "/admin/leads", label: "Lead", icon: Plus },
            { href: "/admin/c/matters", label: "Matter", icon: Briefcase },
            { href: "/admin/c/posts", label: "Article", icon: Newspaper },
            { href: "/admin/settings", label: "Settings", icon: Settings2 },
          ].map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-black/10 bg-white px-4 text-[13.5px] font-medium hover:border-black/25"
            >
              <q.icon className="size-4" /> {q.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <Kpi label="New leads" value={String(newLeads)} hint="Last 7 days" icon={Inbox} href="/admin/leads" />
        <Kpi label="Pipeline" value={inrShort(pipeline)} hint="Excluding lost" icon={IndianRupee} href="/admin/leads" />
        <Kpi label="Active matters" value={String(activeMatters)} hint={`${db.matters.length} total`} icon={Briefcase} href="/admin/c/matters" />
        <Kpi label="Upcoming" value={String(upcoming.length)} hint="Appointments" icon={CalendarDays} href="/admin/c/appointments" />
        <Kpi label="Outstanding" value={inrShort(outstanding)} hint={overdue ? `${overdue} overdue` : "All current"} icon={Receipt} href="/admin/c/invoices" />
        <Kpi label="Subscribers" value={String(db.subscribers.length)} hint="Newsletter" icon={Mail} href="/admin/c/subscribers" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        {/* Pipeline chart */}
        <div className="rounded-2xl border border-black/[0.06] bg-white p-5 sm:p-6 lg:col-span-3">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="text-[17px] font-semibold tracking-tight">Pipeline by stage</h2>
              <p className="text-[13px] text-black/45">{db.leads.length} leads · {conversion}% win rate</p>
            </div>
            <Link href="/admin/leads" className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--accent)]">
              Open board <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <div className="flex h-[200px] items-end gap-2 sm:gap-4">
            {stages.map((s) => (
              <div key={s.key} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="text-[13px] font-semibold tabular-nums">{s.count}</span>
                <div
                  className="w-full max-w-[56px] rounded-t-xl transition-all duration-700"
                  style={{
                    height: `${Math.max(4, (s.count / maxCount) * 150)}px`,
                    background: `linear-gradient(to top, ${STAGE_COLOR[s.key]}, color-mix(in oklab, ${STAGE_COLOR[s.key]} 55%, white))`,
                  }}
                />
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2 border-t border-black/[0.06] pt-3 sm:gap-4">
            {stages.map((s) => (
              <div key={s.key} className="min-w-0 flex-1 text-center">
                <div className="truncate text-[11.5px] font-medium text-black/60">{s.label}</div>
                <div className="hidden truncate text-[11px] tabular-nums text-black/40 sm:block">{inr(s.value)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming */}
        <div className="rounded-2xl border border-black/[0.06] bg-white p-5 sm:p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[17px] font-semibold tracking-tight">Upcoming consultations</h2>
            <Link href="/admin/c/appointments" className="text-[13px] font-medium text-[var(--accent)]">
              All
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="py-8 text-center text-[14px] text-black/40">Nothing scheduled.</p>
          ) : (
            <ul className="space-y-2">
              {upcoming.slice(0, 5).map((a) => {
                const d = new Date(a.date + "T00:00:00");
                return (
                  <li key={a.id} className="flex items-center gap-3 rounded-xl p-2 hover:bg-black/[0.02]">
                    <div className="grid w-12 shrink-0 place-items-center rounded-xl bg-black/[0.04] py-1.5 text-center">
                      <span className="text-[10px] font-semibold uppercase text-[var(--accent)]">
                        {d.toLocaleDateString("en-IN", { month: "short" })}
                      </span>
                      <span className="text-[18px] font-semibold leading-none">{d.getDate()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-medium">{a.name}</div>
                      <div className="truncate text-[12.5px] text-black/45">
                        {a.time} · {a.mode} · {a.practiceArea}
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${
                        a.status === "confirmed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {a.status}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        {/* Matters */}
        <div className="rounded-2xl border border-black/[0.06] bg-white p-5 sm:p-6 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[17px] font-semibold tracking-tight">Active matters</h2>
            <Link href="/admin/c/matters" className="text-[13px] font-medium text-[var(--accent)]">
              All
            </Link>
          </div>
          <ul className="divide-y divide-black/[0.05]">
            {db.matters
              .filter((m) => m.status !== "closed")
              .slice(0, 5)
              .map((m) => (
                <li key={m.id} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-[14px] font-medium">{m.title}</div>
                      <div className="text-[12.5px] text-black/45">
                        <span className="font-mono">{m.reference}</span> · {m.attorney}
                      </div>
                    </div>
                    {m.nextHearing && (
                      <span className="shrink-0 text-[12px] text-black/50">
                        {new Date(m.nextHearing).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex gap-1">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <span
                        key={i}
                        className="h-1 flex-1 rounded-full"
                        style={{ background: i <= m.stage ? "var(--accent)" : "rgba(0,0,0,0.08)" }}
                      />
                    ))}
                  </div>
                </li>
              ))}
          </ul>
        </div>

        {/* Activity */}
        <div className="rounded-2xl border border-black/[0.06] bg-white p-5 sm:p-6 lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 text-[17px] font-semibold tracking-tight">
            <ActivityIcon className="size-4 text-[var(--accent)]" /> Recent activity
          </h2>
          <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-black/[0.08]">
            {db.activity.slice(0, 8).map((a) => (
              <li key={a.id} className="relative pl-6">
                <span className="absolute left-0 top-1.5 size-[11px] rounded-full border-2 border-white bg-[var(--accent)] shadow" />
                <div className="text-[13.5px] leading-snug">{a.text}</div>
                <div className="text-[12px] text-black/40">{timeAgo(a.at)}</div>
              </li>
            ))}
            {db.activity.length === 0 && <li className="text-[14px] text-black/40">No activity yet.</li>}
          </ol>
        </div>
      </div>
    </div>
  );
}
