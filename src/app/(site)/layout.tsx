import type { Metadata } from "next";
import { getDB } from "@/lib/db";
import { SiteShell } from "@/components/site/SiteShell";
import { Footer } from "@/components/site/Footer";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getDB();
  return {
    title: { default: settings.seo.title, template: `%s · ${settings.brand.name}` },
    description: settings.seo.description,
    openGraph: { title: settings.seo.title, description: settings.seo.description, images: [settings.hero.image] },
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const db = await getDB();
  const s = db.settings;
  const menuImages = [
    db.practiceAreas[0]?.image,
    db.attorneys[0]?.image,
    s.about.image,
    db.posts[0]?.cover,
    s.reveal.image,
    s.hero.image,
    s.offices[0]?.image,
  ].filter(Boolean) as string[];

  const hex = (v: string, d: string) => (/^#[0-9a-fA-F]{3,8}$/.test(v) ? v : d);
  const theme = `:root{--accent:${hex(s.theme.accent, "#B38B59")};--ink:${hex(s.theme.ink, "#0E0E0C")};--paper:${hex(
    s.theme.paper,
    "#F3F0EA",
  )};--radius:${Number(s.theme.radius) || 28}px}`;
  const introScript = s.intro.enabled && s.intro.oncePerSession
    ? `try{if(sessionStorage.getItem('av-intro-seen'))document.documentElement.classList.add('intro-seen')}catch(e){}`
    : "";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: theme + ".intro-seen .av-intro{display:none}" }} />
      {introScript && <script dangerouslySetInnerHTML={{ __html: introScript }} />}
      <SiteShell settings={s} menuImages={menuImages}>
        <main id="main">{children}</main>
        <Footer s={s} />
      </SiteShell>
    </>
  );
}
