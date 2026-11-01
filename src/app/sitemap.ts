import type { MetadataRoute } from "next";
import { getDB } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const db = await getDB();
  const statics = ["", "/practice-areas", "/attorneys", "/about", "/insights", "/contact", "/book", "/case-status", "/careers"];
  return [
    ...statics.map((p) => ({ url: base + p })),
    ...db.practiceAreas.filter((x) => x.published).map((x) => ({ url: `${base}/practice-areas/${x.slug}` })),
    ...db.attorneys.filter((x) => x.published).map((x) => ({ url: `${base}/attorneys/${x.slug}` })),
    ...db.posts.filter((x) => x.published).map((x) => ({ url: `${base}/insights/${x.slug}`, lastModified: x.updatedAt })),
  ];
}
