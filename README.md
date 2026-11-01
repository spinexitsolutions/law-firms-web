# Aurelian Vale — Law Firm & Legal Consultancy Website

A Next.js 16 site for a law firm and legal consultancy. It is built mobile-first with scroll animations, and an admin panel with a **CRM + CMS** controls the whole site.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

Admin: **http://localhost:3000/admin**. The demo login is `admin@aurelianvale.law` / `admin123` (set your own in `.env.local`, see `.env.example`).

## Public website

| Page | Features |
|---|---|
| `/` | Intro animation (3 styles), "dynamic island" navbar, hero with rotating words + parallax, recognition marquee, scroll-linked statement, practice list with a cursor-follow image, animated counters, pinned horizontal "approach" (stacked cards on mobile), inset→full-bleed image reveal, attorneys, case results with tilt cards, draggable testimonials, insights, FAQ, magnetic CTA |
| `/practice-areas`, `/practice-areas/[slug]` | Service grid, detail page with services, team, enquiry form, next-practice link |
| `/attorneys`, `/attorneys/[slug]` | Animated filter chips, profile with education/bar admissions, "book with this attorney" |
| `/about` | Story, values, timeline, offices |
| `/insights`, `/insights/[slug]` | Category filter + search, article with reading-progress bar and share button |
| `/book` | 4-step consultation booking wizard. It creates an **appointment + lead** in the CRM |
| `/case-status` | Clients track their matter live (reference + email). Demo: `AV-2026-0142` / `gc@meridian.example.com` |
| `/contact`, `/careers`, `/privacy`, `/terms`, `/disclaimer` | Contact form → CRM lead, map, offices, job openings, legal pages |

Site-wide: **Bar Council of India disclaimer** popup, cookie notice, WhatsApp button, custom cursor, Lenis smooth scroll, film-grain texture, JSON-LD, sitemap/robots, and support for reduced-motion settings.

## Admin panel (`/admin`)

- **Dashboard**: KPIs, pipeline chart, upcoming consultations, active matters, activity feed
- **CRM**: leads Kanban (drag & drop, convert to client), clients, matters (with stage stepper → powers Case Status), appointments, invoices, newsletter subscribers
- **CMS**: practice areas, attorneys, insights (markdown), testimonials, case results, FAQs, careers
- **Site settings**: brand, theme colours (live), intro animation (style/words/duration + live preview), navigation, hero, home-section order & visibility, content blocks, offices, announcement bar, disclaimer, feature toggles, SEO, legal pages
- **System**: JSON backup download, reset demo data

## Tech

Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · Framer Motion · Lenis · lucide-react.
Fonts: Instrument Serif (display) + Geist (UI) + Geist Mono (labels).

Data lives in `data/db.json`. The file is created automatically from `src/lib/seed.ts` on first run. `src/lib/db.ts` is the only data module, so it can be swapped for Postgres/Prisma/Supabase without touching the UI. On serverless hosts like Vercel the file goes to `/tmp` and does not persist, so use a VPS/Docker host or swap in a real database for production.
