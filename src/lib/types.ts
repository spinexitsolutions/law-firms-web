// ─────────────────────────────────────────────────────────────
//  Domain types — everything the site renders comes from here,
//  and everything here is editable from the admin panel.
// ─────────────────────────────────────────────────────────────

export type ID = string;

export interface BaseRecord {
  id: ID;
  createdAt: string;
  updatedAt: string;
}

/* ───────────────────────── CMS ───────────────────────── */

export interface NavItem {
  label: string;
  href: string;
  visible: boolean;
}

export interface HomeSection {
  key: HomeSectionKey;
  label: string;
  enabled: boolean;
}

export type HomeSectionKey =
  | "marquee"
  | "statement"
  | "practice"
  | "stats"
  | "approach"
  | "reveal"
  | "attorneys"
  | "results"
  | "testimonials"
  | "insights"
  | "faq"
  | "cta";

export interface Stat {
  value: number;
  suffix: string;
  label: string;
}

export interface ProcessStep {
  title: string;
  body: string;
}

export interface Office {
  city: string;
  address: string;
  phone: string;
  image: string;
}

export interface Settings {
  brand: {
    name: string;
    shortName: string;
    tagline: string;
    founded: string;
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    hours: string;
    linkedin: string;
    instagram: string;
    x: string;
  };
  theme: {
    accent: string;
    ink: string;
    paper: string;
    radius: number;
    grain: boolean;
  };
  intro: {
    enabled: boolean;
    style: "curtain" | "split" | "monogram";
    words: string[];
    durationMs: number;
    oncePerSession: boolean;
  };
  announcement: {
    enabled: boolean;
    text: string;
    href: string;
  };
  nav: {
    items: NavItem[];
    ctaLabel: string;
    ctaHref: string;
  };
  hero: {
    eyebrow: string;
    titleTop: string;
    rotatingWords: string[];
    titleBottom: string;
    subtitle: string;
    image: string;
    primaryCta: string;
    primaryHref: string;
    secondaryCta: string;
    secondaryHref: string;
  };
  statement: {
    text: string;
    signature: string;
  };
  reveal: {
    eyebrow: string;
    title: string;
    image: string;
  };
  marquee: string[];
  stats: Stat[];
  approach: {
    title: string;
    steps: ProcessStep[];
  };
  cta: {
    title: string;
    subtitle: string;
    button: string;
  };
  about: {
    title: string;
    intro: string;
    body: string;
    image: string;
    values: ProcessStep[];
  };
  offices: Office[];
  sections: HomeSection[];
  disclaimer: {
    enabled: boolean;
    title: string;
    body: string;
  };
  features: {
    whatsappButton: boolean;
    cookieBanner: boolean;
    smoothScroll: boolean;
    customCursor: boolean;
  };
  seo: {
    title: string;
    description: string;
  };
  legal: {
    privacy: string;
    terms: string;
  };
}

export interface PracticeArea extends BaseRecord {
  title: string;
  slug: string;
  summary: string;
  description: string;
  image: string;
  services: string[];
  order: number;
  published: boolean;
}

export interface Attorney extends BaseRecord {
  name: string;
  slug: string;
  role: string;
  image: string;
  bio: string;
  email: string;
  phone: string;
  education: string[];
  barAdmissions: string[];
  practiceAreas: string[];
  languages: string[];
  order: number;
  published: boolean;
}

export interface Post extends BaseRecord {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cover: string;
  category: string;
  author: string;
  readMinutes: number;
  publishedAt: string;
  featured: boolean;
  published: boolean;
}

export interface Testimonial extends BaseRecord {
  quote: string;
  name: string;
  role: string;
  rating: number;
  published: boolean;
}

export interface Faq extends BaseRecord {
  question: string;
  answer: string;
  category: string;
  order: number;
  published: boolean;
}

export interface CaseResult extends BaseRecord {
  title: string;
  amount: string;
  category: string;
  summary: string;
  year: string;
  published: boolean;
}

export interface Job extends BaseRecord {
  title: string;
  location: string;
  type: string;
  description: string;
  open: boolean;
}

/* ───────────────────────── CRM ───────────────────────── */

export type LeadStage =
  | "new"
  | "contacted"
  | "consultation"
  | "proposal"
  | "retained"
  | "lost";

export interface Lead extends BaseRecord {
  name: string;
  email: string;
  phone: string;
  practiceArea: string;
  message: string;
  source: string;
  stage: LeadStage;
  value: number;
  assignedTo: string;
  notes: string;
}

export interface Client extends BaseRecord {
  name: string;
  email: string;
  phone: string;
  company: string;
  type: "individual" | "business";
  address: string;
  notes: string;
  status: "active" | "inactive";
}

export interface Matter extends BaseRecord {
  reference: string;
  title: string;
  clientName: string;
  clientEmail: string;
  practiceArea: string;
  attorney: string;
  status: "intake" | "active" | "on-hold" | "closed";
  stage: number; // index into MATTER_STAGES
  nextHearing: string;
  court: string;
  fee: number;
  publicNote: string;
  notes: string;
}

export interface Appointment extends BaseRecord {
  name: string;
  email: string;
  phone: string;
  practiceArea: string;
  date: string;
  time: string;
  mode: "in-person" | "video" | "phone";
  status: "requested" | "confirmed" | "completed" | "cancelled";
  attorney: string;
  notes: string;
}

export interface Invoice extends BaseRecord {
  number: string;
  clientName: string;
  matter: string;
  amount: number;
  dueDate: string;
  status: "draft" | "sent" | "paid" | "overdue";
}

export interface Subscriber extends BaseRecord {
  email: string;
  source: string;
}

export interface Activity {
  id: ID;
  at: string;
  type: string;
  text: string;
}

export interface DB {
  settings: Settings;
  practiceAreas: PracticeArea[];
  attorneys: Attorney[];
  posts: Post[];
  testimonials: Testimonial[];
  faqs: Faq[];
  caseResults: CaseResult[];
  jobs: Job[];
  leads: Lead[];
  clients: Client[];
  matters: Matter[];
  appointments: Appointment[];
  invoices: Invoice[];
  subscribers: Subscriber[];
  activity: Activity[];
}

export type CollectionKey = Exclude<keyof DB, "settings" | "activity">;

export const MATTER_STAGES = [
  "Consultation",
  "Engagement",
  "Investigation",
  "Filing",
  "Hearings",
  "Resolution",
] as const;

export const LEAD_STAGES: { key: LeadStage; label: string }[] = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "consultation", label: "Consultation" },
  { key: "proposal", label: "Proposal" },
  { key: "retained", label: "Retained" },
  { key: "lost", label: "Lost" },
];
