import { getSettings } from "@/lib/db";
import { SettingsEditor } from "@/components/admin/SettingsEditor";

export const metadata = { title: "Site settings" };

export default async function SettingsPage() {
  const settings = await getSettings();
  return <SettingsEditor initial={structuredClone(settings)} />;
}
