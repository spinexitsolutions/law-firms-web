import Link from "next/link";
import type { Settings } from "@/lib/types";
import { NewsletterForm } from "./forms/NewsletterForm";
import { BackToTop } from "./BackToTop";

export function Footer({ s }: { s: Settings }) {
  const year = new Date().getFullYear();
  const nav = s.nav.items.filter((i) => i.visible);
  return (
    <footer className="relative overflow-hidden bg-ink text-paper">
      <div className="container-x grid gap-14 pb-10 pt-20 md:grid-cols-12 md:pt-28">
        <div className="md:col-span-5">
          <p className="eyebrow text-paper/50">The briefing</p>
          <h3 className="display-sm mt-3 max-w-md">Legal intelligence, once a month. No noise.</h3>
          <NewsletterForm />
        </div>
        <div className="grid grid-cols-2 gap-10 md:col-span-7 md:grid-cols-3">
          <div>
            <p className="eyebrow mb-4 text-paper/50">Firm</p>
            <ul className="space-y-2.5 text-[15px]">
              {nav.map((i) => (
                <li key={i.href}>
                  <Link href={i.href} className="link-underline text-paper/80 hover:text-paper">
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-4 text-paper/50">Offices</p>
            <ul className="space-y-4 text-[15px]">
              {s.offices.map((o) => (
                <li key={o.city}>
                  <p className="text-paper">{o.city}</p>
                  <a href={`tel:${o.phone.replace(/\s/g, "")}`} className="text-paper/60 hover:text-paper">
                    {o.phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1">
            <p className="eyebrow mb-4 text-paper/50">Contact</p>
            <ul className="space-y-2.5 text-[15px] text-paper/80">
              <li>
                <a href={`mailto:${s.brand.email}`} className="link-underline break-all">
                  {s.brand.email}
                </a>
              </li>
              <li>
                <a href={`tel:${s.brand.phone.replace(/\s/g, "")}`} className="link-underline">
                  {s.brand.phone}
                </a>
              </li>
              <li className="text-paper/50">{s.brand.hours}</li>
              <li className="flex gap-4 pt-2">
                {s.brand.linkedin && <a href={s.brand.linkedin} className="link-underline">LinkedIn</a>}
                {s.brand.instagram && <a href={s.brand.instagram} className="link-underline">Instagram</a>}
                {s.brand.x && <a href={s.brand.x} className="link-underline">X</a>}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container-x">
        <p
          aria-hidden
          className="select-none whitespace-nowrap text-center font-display leading-[0.8] tracking-[-0.05em] text-paper/[0.92]"
          style={{ fontSize: `min(${Math.round(150 / Math.max(6, s.brand.name.length))}vw, 15rem)` }}
        >
          {s.brand.name}
          <span className="text-accent">.</span>
        </p>
      </div>

      <div className="container-x flex flex-col gap-4 border-t border-white/10 py-6 text-xs text-paper/50 md:flex-row md:items-center md:justify-between">
        <p>
          © {year} {s.brand.name} · {s.brand.tagline}. All rights reserved.
        </p>
        <div className="flex flex-wrap items-center gap-5">
          <Link href="/privacy" className="hover:text-paper">Privacy</Link>
          <Link href="/terms" className="hover:text-paper">Terms</Link>
          <Link href="/disclaimer" className="hover:text-paper">Disclaimer</Link>
          <BackToTop />
        </div>
      </div>
    </footer>
  );
}
