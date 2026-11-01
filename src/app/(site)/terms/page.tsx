import { getSettings } from "@/lib/db";
import { LegalPage } from "@/components/site/LegalPage";

export const metadata = { title: "Terms of Use" };

export default async function Page() {
  const s = await getSettings();
  return <LegalPage eyebrow="Legal" title="Terms of use" body={s.legal.terms} />;
}
