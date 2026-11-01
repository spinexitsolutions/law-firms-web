import { getSettings } from "@/lib/db";
import { LegalPage } from "@/components/site/LegalPage";

export const metadata = { title: "Privacy Policy" };

export default async function Page() {
  const s = await getSettings();
  return <LegalPage eyebrow="Legal" title="Privacy policy" body={s.legal.privacy} />;
}
