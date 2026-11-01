import { getDB } from "@/lib/db";
import { Hero } from "@/components/site/home/Hero";
import {
  Approach,
  AttorneysRow,
  Cta,
  FaqList,
  InsightsGrid,
  Marquee,
  PracticeList,
  Results,
  RevealImage,
  Stats,
  Statement,
  Testimonials,
} from "@/components/site/home/Sections";
import type { HomeSectionKey } from "@/lib/types";

export default async function Home() {
  const db = await getDB();
  const s = db.settings;
  const areas = db.practiceAreas.filter((a) => a.published).sort((a, b) => a.order - b.order);
  const people = db.attorneys.filter((a) => a.published).sort((a, b) => a.order - b.order);
  const posts = db.posts
    .filter((p) => p.published)
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.publishedAt.localeCompare(a.publishedAt));
  const faqs = db.faqs.filter((f) => f.published).sort((a, b) => a.order - b.order);

  const render: Record<HomeSectionKey, React.ReactNode> = {
    marquee: <Marquee items={s.marquee} />,
    statement: <Statement s={s} />,
    practice: <PracticeList areas={areas} />,
    stats: <Stats s={s} />,
    approach: <Approach s={s} />,
    reveal: <RevealImage s={s} />,
    attorneys: <AttorneysRow people={people} />,
    results: <Results results={db.caseResults.filter((r) => r.published)} />,
    testimonials: <Testimonials items={db.testimonials.filter((t) => t.published)} />,
    insights: <InsightsGrid posts={posts} />,
    faq: <FaqList faqs={faqs} />,
    cta: <Cta s={s} />,
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name: s.brand.name,
    description: s.seo.description,
    telephone: s.brand.phone,
    email: s.brand.email,
    address: s.brand.address,
    foundingDate: s.brand.founded,
    areaServed: "IN",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero s={s} />
      {s.sections.filter((x) => x.enabled).map((x) => (
        <div key={x.key}>{render[x.key]}</div>
      ))}
    </>
  );
}
