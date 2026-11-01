"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  DatabaseBackup,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings2,
  X,
  type LucideIcon,
} from "lucide-react";
import { COLLECTIONS } from "@/lib/admin-schema";
import { iconFor } from "./icons";
import { cn } from "./ui";

type Item = { href: string; label: string; icon: LucideIcon };
type Group = { title: string; items: Item[] };

const crm = COLLECTIONS.filter((c) => c.group === "CRM").map<Item>((c) => ({
  href: c.key === "leads" ? "/admin/leads" : `/admin/c/${c.key}`,
  label: c.key === "leads" ? "Leads pipeline" : c.label,
  icon: iconFor(c.icon),
}));
const cms = COLLECTIONS.filter((c) => c.group === "CMS").map<Item>((c) => ({
  href: `/admin/c/${c.key}`,
  label: c.label,
  icon: iconFor(c.icon),
}));

const GROUPS: Group[] = [
  { title: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
  { title: "CRM", items: crm },
  { title: "CMS", items: [{ href: "/admin/settings", label: "Site settings", icon: Settings2 }, ...cms] },
  { title: "System", items: [{ href: "/admin/system", label: "Backup & reset", icon: DatabaseBackup }] },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/admin/leads") return pathname.startsWith("/admin/leads") || pathname === "/admin/c/leads";
  return pathname.startsWith(href);
}

function Nav({ brand, onNavigate }: { brand: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 pb-4 pt-6">
        <div className="grid size-9 place-items-center rounded-xl bg-[#1d1d1f] font-serif text-[17px] italic text-white">
          {brand.slice(0, 1)}
        </div>
        <div className="min-w-0">
          <div className="truncate text-[15px] font-semibold tracking-tight text-[#1d1d1f]">{brand}</div>
          <div className="text-[12px] text-black/45">Practice console</div>
        </div>
      </div>
      <nav className="no-scrollbar flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {GROUPS.map((g) => (
          <div key={g.title}>
            <div className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-black/35">
              {g.title}
            </div>
            <ul className="space-y-0.5">
              {g.items.map((it) => {
                const active = isActive(pathname, it.href);
                const Icon = it.icon;
                return (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      onClick={onNavigate}
                      className={cn(
                        "relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-[14px] transition-colors",
                        active ? "text-[#1d1d1f]" : "text-black/60 hover:bg-black/[0.04] hover:text-[#1d1d1f]",
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="admin-nav-pill"
                          className="absolute inset-0 rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.04]"
                          transition={{ type: "spring", stiffness: 500, damping: 40 }}
                        />
                      )}
                      <Icon className={cn("relative size-[17px]", active && "text-[var(--accent)]")} />
                      <span className="relative font-medium">{it.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="space-y-1 border-t border-black/[0.06] p-3">
        <a
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[14px] font-medium text-black/60 hover:bg-black/[0.04] hover:text-[#1d1d1f]"
        >
          <ArrowUpRight className="size-[17px]" /> View site
        </a>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[14px] font-medium text-black/60 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="size-[17px]" /> Sign out
        </button>
      </div>
    </div>
  );
}

export function Sidebar({ brand }: { brand: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <>
      {/* Desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] border-r border-black/[0.06] bg-[#f5f5f7]/80 backdrop-blur-xl lg:block">
        <Nav brand={brand} />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-black/[0.06] bg-[#f5f5f7]/80 px-4 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-lg bg-[#1d1d1f] font-serif text-[15px] italic text-white">
            {brand.slice(0, 1)}
          </div>
          <span className="text-[15px] font-semibold tracking-tight">{brand}</span>
        </div>
        <button
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="grid size-9 place-items-center rounded-full bg-white shadow-sm ring-1 ring-black/[0.06]"
        >
          <Menu className="size-[18px]" />
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-[86%] max-w-[320px] bg-[#f5f5f7] shadow-2xl lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
            >
              <button
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="absolute right-3 top-5 grid size-9 place-items-center rounded-full hover:bg-black/5"
              >
                <X className="size-[18px]" />
              </button>
              <Nav brand={brand} onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
