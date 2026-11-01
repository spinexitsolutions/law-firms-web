import { getSettings } from "@/lib/db";
import { LegalPage } from "@/components/site/LegalPage";

export const metadata = { title: "Disclaimer" };

export default async function Page() {
  const s = await getSettings();
  return <LegalPage eyebrow="Bar Council of India" title={s.disclaimer.title} body={s.disclaimer.body} />;
}
