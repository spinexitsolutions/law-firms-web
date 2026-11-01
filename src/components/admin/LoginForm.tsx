"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";
import { Button, inputCls } from "./ui";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@aurelianvale.law");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Sign in failed");
      setLoading(false);
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-4">
      <div className="pointer-events-none absolute -top-40 left-1/2 size-[720px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--accent)_30%,transparent),transparent_65%)] blur-2xl" />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[400px]"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-[#1d1d1f] font-display text-[26px] text-white shadow-xl">
            A
          </div>
          <h1 className="text-[28px] font-semibold tracking-[-0.02em]">Practice console</h1>
          <p className="mt-1 text-[15px] text-black/50">Sign in to manage clients, matters and content.</p>
        </div>
        <form onSubmit={submit} className="space-y-3 rounded-[28px] border border-black/[0.06] bg-white/80 p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] backdrop-blur-xl">
          <input className={inputCls} type="email" autoComplete="username" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={inputCls} type="password" autoComplete="current-password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
          {error && (
            <motion.div initial={{ x: -6 }} animate={{ x: [6, -4, 2, 0] }} className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[14px] text-red-600">
              {error}
            </motion.div>
          )}
          <Button type="submit" variant="primary" loading={loading} className="!h-11 w-full">
            Sign in <ArrowRight className="size-4" />
          </Button>
        </form>
        <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-black/[0.04] px-4 py-3 text-[13px] text-black/55">
          <Lock className="size-3.5" />
          Demo: <span className="tabular-nums text-black/75">admin@aurelianvale.law</span> / <span className="tabular-nums text-black/75">admin123</span>
        </div>
        <div className="mt-6 text-center">
          <Link href="/" className="text-[13px] text-black/45 hover:text-black">← Back to website</Link>
        </div>
      </motion.div>
    </div>
  );
}
