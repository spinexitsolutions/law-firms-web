import type { CollectionKey } from "./types";

export type FieldType =
  | "text"
  | "textarea"
  | "markdown"
  | "image"
  | "number"
  | "boolean"
  | "select"
  | "date"
  | "time"
  | "email"
  | "tags"
  | "color";

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  placeholder?: string;
  help?: string;
  /** show as a column in the table */
  column?: boolean;
  /** span both columns of the form grid */
  wide?: boolean;
}

export interface CollectionDef {
  key: CollectionKey;
  label: string;
  singular: string;
  group: "CRM" | "CMS";
  icon: string; // lucide icon name
  description: string;
  titleField: string;
  slugFrom?: string;
  fields: Field[];
  defaults: Record<string, unknown>;
  publicHref?: (r: Record<string, unknown>) => string;
}

const PRACTICE_OPTIONS = [
  "Corporate & M&A",
  "Litigation & Disputes",
  "Arbitration",
  "Real Estate",
  "Family & Private Client",
  "White-Collar & Criminal",
  "Tax",
  "IP & Technology",
  "Other",
];

export const COLLECTIONS: CollectionDef[] = [
  /* ─────────────── CRM ─────────────── */
  {
    key: "leads",
    label: "Leads",
    singular: "Lead",
    group: "CRM",
    icon: "Inbox",
    description: "Every enquiry from the website, phone and referrals.",
    titleField: "name",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, column: true },
      { name: "email", label: "Email", type: "email", column: true },
      { name: "phone", label: "Phone", type: "text" },
      { name: "practiceArea", label: "Practice area", type: "select", options: PRACTICE_OPTIONS, column: true },
      { name: "stage", label: "Stage", type: "select", options: ["new", "contacted", "consultation", "proposal", "retained", "lost"], column: true },
      { name: "value", label: "Est. value (₹)", type: "number", column: true },
      { name: "assignedTo", label: "Assigned to", type: "text" },
      { name: "source", label: "Source", type: "text" },
      { name: "message", label: "Message", type: "textarea", wide: true },
      { name: "notes", label: "Internal notes", type: "textarea", wide: true },
    ],
    defaults: { stage: "new", source: "Manual", value: 0 },
  },
  {
    key: "clients",
    label: "Clients",
    singular: "Client",
    group: "CRM",
    icon: "Users",
    description: "Individuals and businesses you represent.",
    titleField: "name",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, column: true },
      { name: "company", label: "Company", type: "text", column: true },
      { name: "type", label: "Type", type: "select", options: ["individual", "business"], column: true },
      { name: "email", label: "Email", type: "email", column: true },
      { name: "phone", label: "Phone", type: "text" },
      { name: "status", label: "Status", type: "select", options: ["active", "inactive"], column: true },
      { name: "address", label: "Address", type: "text", wide: true },
      { name: "notes", label: "Notes", type: "textarea", wide: true },
    ],
    defaults: { type: "individual", status: "active" },
  },
  {
    key: "matters",
    label: "Matters",
    singular: "Matter",
    group: "CRM",
    icon: "Briefcase",
    description: "Cases & engagements. Public note + stage power the Case Status tracker.",
    titleField: "title",
    fields: [
      { name: "reference", label: "Reference", type: "text", required: true, column: true, help: "Clients use this to track their case." },
      { name: "title", label: "Title", type: "text", required: true, column: true },
      { name: "clientName", label: "Client", type: "text", column: true },
      { name: "clientEmail", label: "Client email", type: "email", help: "Required with the reference for public tracking." },
      { name: "practiceArea", label: "Practice area", type: "select", options: PRACTICE_OPTIONS },
      { name: "attorney", label: "Lead attorney", type: "text", column: true },
      { name: "status", label: "Status", type: "select", options: ["intake", "active", "on-hold", "closed"], column: true },
      { name: "stage", label: "Stage (0 Consultation → 5 Resolution)", type: "number" },
      { name: "court", label: "Court / forum", type: "text" },
      { name: "nextHearing", label: "Next hearing", type: "date" },
      { name: "fee", label: "Fee (₹)", type: "number" },
      { name: "publicNote", label: "Update visible to client", type: "textarea", wide: true },
      { name: "notes", label: "Internal notes", type: "textarea", wide: true },
    ],
    defaults: { status: "intake", stage: 0, fee: 0 },
  },
  {
    key: "appointments",
    label: "Appointments",
    singular: "Appointment",
    group: "CRM",
    icon: "CalendarDays",
    description: "Consultations booked online or by the front desk.",
    titleField: "name",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, column: true },
      { name: "email", label: "Email", type: "email" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "practiceArea", label: "Practice area", type: "select", options: PRACTICE_OPTIONS, column: true },
      { name: "date", label: "Date", type: "date", column: true },
      { name: "time", label: "Time", type: "time", column: true },
      { name: "mode", label: "Mode", type: "select", options: ["in-person", "video", "phone"] },
      { name: "status", label: "Status", type: "select", options: ["requested", "confirmed", "completed", "cancelled"], column: true },
      { name: "attorney", label: "Attorney", type: "text" },
      { name: "notes", label: "Notes", type: "textarea", wide: true },
    ],
    defaults: { status: "requested", mode: "video" },
  },
  {
    key: "invoices",
    label: "Invoices",
    singular: "Invoice",
    group: "CRM",
    icon: "Receipt",
    description: "Billing across matters.",
    titleField: "number",
    fields: [
      { name: "number", label: "Invoice #", type: "text", required: true, column: true },
      { name: "clientName", label: "Client", type: "text", column: true },
      { name: "matter", label: "Matter ref", type: "text" },
      { name: "amount", label: "Amount (₹)", type: "number", column: true },
      { name: "dueDate", label: "Due date", type: "date", column: true },
      { name: "status", label: "Status", type: "select", options: ["draft", "sent", "paid", "overdue"], column: true },
    ],
    defaults: { status: "draft", amount: 0 },
  },
  {
    key: "subscribers",
    label: "Subscribers",
    singular: "Subscriber",
    group: "CRM",
    icon: "Mail",
    description: "Newsletter sign-ups.",
    titleField: "email",
    fields: [
      { name: "email", label: "Email", type: "email", required: true, column: true },
      { name: "source", label: "Source", type: "text", column: true },
    ],
    defaults: { source: "Manual" },
  },

  /* ─────────────── CMS ─────────────── */
  {
    key: "practiceAreas",
    label: "Practice Areas",
    singular: "Practice Area",
    group: "CMS",
    icon: "Scale",
    description: "Services shown on the home page and practice pages.",
    titleField: "title",
    slugFrom: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, column: true },
      { name: "slug", label: "Slug", type: "text", column: true },
      { name: "order", label: "Order", type: "number", column: true },
      { name: "published", label: "Published", type: "boolean", column: true },
      { name: "summary", label: "Summary", type: "textarea", wide: true },
      { name: "description", label: "Description", type: "textarea", wide: true },
      { name: "image", label: "Image", type: "image", wide: true },
      { name: "services", label: "Services", type: "tags", wide: true },
    ],
    defaults: { published: true, order: 99, services: [] },
    publicHref: (r) => `/practice-areas/${r.slug}`,
  },
  {
    key: "attorneys",
    label: "Attorneys",
    singular: "Attorney",
    group: "CMS",
    icon: "UserRound",
    description: "Partners, counsel and associates.",
    titleField: "name",
    slugFrom: "name",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, column: true },
      { name: "slug", label: "Slug", type: "text" },
      { name: "role", label: "Role", type: "text", column: true },
      { name: "order", label: "Order", type: "number", column: true },
      { name: "email", label: "Email", type: "email" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "published", label: "Published", type: "boolean", column: true },
      { name: "image", label: "Portrait", type: "image", wide: true },
      { name: "bio", label: "Bio", type: "textarea", wide: true },
      { name: "practiceAreas", label: "Practice areas", type: "tags", wide: true },
      { name: "education", label: "Education", type: "tags", wide: true },
      { name: "barAdmissions", label: "Bar admissions", type: "tags", wide: true },
      { name: "languages", label: "Languages", type: "tags", wide: true },
    ],
    defaults: { published: true, order: 99, education: [], barAdmissions: [], practiceAreas: [], languages: [] },
    publicHref: (r) => `/attorneys/${r.slug}`,
  },
  {
    key: "posts",
    label: "Insights",
    singular: "Article",
    group: "CMS",
    icon: "Newspaper",
    description: "Articles, legal updates and firm news.",
    titleField: "title",
    slugFrom: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, column: true, wide: true },
      { name: "slug", label: "Slug", type: "text" },
      { name: "category", label: "Category", type: "text", column: true },
      { name: "author", label: "Author", type: "text", column: true },
      { name: "publishedAt", label: "Publish date", type: "date", column: true },
      { name: "readMinutes", label: "Read time (min)", type: "number" },
      { name: "featured", label: "Featured", type: "boolean" },
      { name: "published", label: "Published", type: "boolean", column: true },
      { name: "cover", label: "Cover image", type: "image", wide: true },
      { name: "excerpt", label: "Excerpt", type: "textarea", wide: true },
      { name: "body", label: "Body (Markdown: ## heading, blank line = paragraph)", type: "markdown", wide: true },
    ],
    defaults: { published: false, featured: false, readMinutes: 5, category: "Insights" },
    publicHref: (r) => `/insights/${r.slug}`,
  },
  {
    key: "testimonials",
    label: "Testimonials",
    singular: "Testimonial",
    group: "CMS",
    icon: "Quote",
    description: "Client words shown in the testimonial carousel.",
    titleField: "name",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, column: true },
      { name: "role", label: "Role / company", type: "text", column: true },
      { name: "rating", label: "Rating (1–5)", type: "number", column: true },
      { name: "published", label: "Published", type: "boolean", column: true },
      { name: "quote", label: "Quote", type: "textarea", wide: true },
    ],
    defaults: { rating: 5, published: true },
  },
  {
    key: "caseResults",
    label: "Case Results",
    singular: "Result",
    group: "CMS",
    icon: "Trophy",
    description: "Notable outcomes (anonymise where required).",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, column: true, wide: true },
      { name: "amount", label: "Headline figure", type: "text", column: true },
      { name: "category", label: "Category", type: "text", column: true },
      { name: "year", label: "Year", type: "text", column: true },
      { name: "published", label: "Published", type: "boolean", column: true },
      { name: "summary", label: "Summary", type: "textarea", wide: true },
    ],
    defaults: { published: true },
  },
  {
    key: "faqs",
    label: "FAQs",
    singular: "FAQ",
    group: "CMS",
    icon: "HelpCircle",
    description: "Questions shown on the home page and contact page.",
    titleField: "question",
    fields: [
      { name: "question", label: "Question", type: "text", required: true, column: true, wide: true },
      { name: "category", label: "Category", type: "text", column: true },
      { name: "order", label: "Order", type: "number", column: true },
      { name: "published", label: "Published", type: "boolean", column: true },
      { name: "answer", label: "Answer", type: "textarea", wide: true },
    ],
    defaults: { published: true, order: 99, category: "General" },
  },
  {
    key: "jobs",
    label: "Careers",
    singular: "Opening",
    group: "CMS",
    icon: "GraduationCap",
    description: "Open positions on the careers page.",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, column: true },
      { name: "location", label: "Location", type: "text", column: true },
      { name: "type", label: "Type", type: "select", options: ["Full-time", "Part-time", "Contract", "Internship"], column: true },
      { name: "open", label: "Open", type: "boolean", column: true },
      { name: "description", label: "Description", type: "textarea", wide: true },
    ],
    defaults: { open: true, type: "Full-time" },
  },
];

export const COLLECTION_KEYS = COLLECTIONS.map((c) => c.key);

export function getCollectionDef(key: string) {
  return COLLECTIONS.find((c) => c.key === key);
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
