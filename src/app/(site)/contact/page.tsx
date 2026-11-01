import type { Metadata } from "next";
import { Mail, Phone, Clock, MapPin } from "lucide-react";
import { getDB } from "@/lib/db";
import { PageHeader } from "@/components/site/PageHeader";
import { ContactForm } from "@/components/site/forms/ContactForm";
import { FaqList } from "@/components/site/home/Sections";
import { Reveal } from "@/components/site/motion";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const db = await getDB();
  const s = db.settings;
  return (
    <>
      <PageHeader eyebrow="Contact" title="Start with a conversation." intro="Tell us a little about your matter. A partner reviews every enquiry personally." />
      <section className="container-x grid gap-12 pb-20 md:grid-cols-12 md:pb-28">
        <div className="md:col-span-7">
          <ContactForm source="Contact page" />
        </div>
        <aside className="space-y-3 md:col-span-5">
          {[
            { icon: Phone, label: "Call", value: s.brand.phone, href: `tel:${s.brand.phone.replace(/\s/g, "")}` },
            { icon: Mail, label: "Email", value: s.brand.email, href: `mailto:${s.brand.email}` },
            { icon: MapPin, label: "Head office", value: s.brand.address },
            { icon: Clock, label: "Hours", value: s.brand.hours },
          ].map((c, i) => (
            <Reveal key={c.label} delay={i * 0.06}>
              <a href={c.href} className="flex items-start gap-4 rounded-2xl border hairline p-5 transition-colors hover:bg-ink hover:text-paper">
                <c.icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <span>
                  <span className="block text-xs opacity-60">{c.label}</span>
                  <span className="break-words">{c.value}</span>
                </span>
              </a>
            </Reveal>
          ))}
        </aside>
      </section>
      <section className="container-x pb-20">
        <div className="overflow-hidden rounded-[var(--radius)] border hairline">
          <iframe
            title="Office location"
            src={`https://www.google.com/maps?q=${encodeURIComponent(s.brand.address)}&output=embed`}
            className="h-[360px] w-full grayscale md:h-[460px]"
            loading="lazy"
          />
        </div>
      </section>
      <section className="container-x pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {s.offices.map((o) => (
            <div key={o.city} className="rounded-2xl bg-paper-2 p-6">
              <h3 className="font-display text-3xl">{o.city}</h3>
              <p className="mt-2 text-sm text-muted">{o.address}</p>
              <a href={`tel:${o.phone.replace(/\s/g, "")}`} className="mt-3 block text-sm">{o.phone}</a>
            </div>
          ))}
        </div>
      </section>
      <FaqList faqs={db.faqs.filter((f) => f.published).sort((a, b) => a.order - b.order)} />
    </>
  );
}
