"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, RotateCcw, ShieldCheck } from "lucide-react";
import { useToast } from "./Toast";
import { Button, Card, PageHeader } from "./ui";

export function SystemPanel({ counts }: { counts: { label: string; n: number }[] }) {
  const router = useRouter();
  const toast = useToast();
  const [resetting, setResetting] = useState(false);

  const reset = async () => {
    if (!confirm("Reset ALL data to the demo content? Every lead, matter and content change will be lost.")) return;
    setResetting(true);
    const res = await fetch("/api/admin/system", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });
    setResetting(false);
    if (res.ok) {
      toast("Demo data restored");
      router.refresh();
    } else toast("Reset failed", "err");
  };

  return (
    <div>
      <PageHeader title="Backup & reset" description="Export everything as JSON, or restore the demo content." />
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 grid size-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Download className="size-5" />
          </div>
          <h3 className="text-[17px] font-semibold">Download backup</h3>
          <p className="mt-1 text-[14px] text-black/50">A complete JSON snapshot of settings, content and CRM records.</p>
          <a href="/api/admin/system" download className="mt-5 inline-flex h-10 items-center gap-1.5 rounded-full bg-[#1d1d1f] px-4 text-sm font-medium text-white hover:bg-black">
            <Download className="size-4" /> Download JSON
          </a>
        </Card>
        <Card className="p-6">
          <div className="mb-4 grid size-11 place-items-center rounded-2xl bg-red-50 text-red-600">
            <RotateCcw className="size-5" />
          </div>
          <h3 className="text-[17px] font-semibold">Reset demo data</h3>
          <p className="mt-1 text-[14px] text-black/50">Replaces all data with the original demo content. Cannot be undone.</p>
          <Button variant="danger" className="mt-5" loading={resetting} onClick={reset}>
            <RotateCcw className="size-4" /> Reset everything
          </Button>
        </Card>
      </div>
      <Card className="mt-4 p-6">
        <div className="mb-4 flex items-center gap-2 text-[15px] font-semibold">
          <ShieldCheck className="size-4 text-[var(--accent)]" /> Data at a glance
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {counts.map((c) => (
            <div key={c.label} className="rounded-xl bg-black/[0.03] p-3">
              <div className="text-[22px] font-semibold tabular-nums">{c.n}</div>
              <div className="text-[12px] text-black/50">{c.label}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
