import type { Metadata } from "next";
import { getDB } from "@/lib/db";
import { PageHeader } from "@/components/site/PageHeader";
import { PostGrid } from "@/components/site/FilterGrid";

export const metadata: Metadata = { title: "Insights" };

export default async function InsightsPage() {
  const db = await getDB();
  const posts = db.posts.filter((p) => p.published).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return (
    <>
      <PageHeader
        eyebrow="Insights"
        title="Notes from the practice."
        intro="Legal updates, explainers and perspectives from our partners — written to be read, not decoded."
      />
      <section className="container-x pb-24 md:pb-36">
        <PostGrid posts={posts} />
      </section>
    </>
  );
}
