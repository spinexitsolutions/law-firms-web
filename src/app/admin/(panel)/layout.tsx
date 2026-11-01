import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/db";
import { Sidebar } from "@/components/admin/Sidebar";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const settings = await getSettings();
  return (
    <div style={{ ["--accent" as string]: settings.theme.accent }}>
      <Sidebar brand={settings.brand.name} />
      <main className="lg:pl-[264px]">
        <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-8 md:py-10">{children}</div>
      </main>
    </div>
  );
}
