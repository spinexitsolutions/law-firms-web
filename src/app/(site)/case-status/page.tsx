import type { Metadata } from "next";
import { PageHeader } from "@/components/site/PageHeader";
import { CaseStatus } from "@/components/site/forms/CaseStatus";

export const metadata: Metadata = { title: "Case Status" };

export default function CaseStatusPage() {
  return (
    <>
      <PageHeader
        eyebrow="Client services"
        title="Where does my matter stand?"
        intro="Enter the reference on your engagement letter and your registered email for a live view of your matter."
      />
      <section className="container-x pb-24 md:pb-36">
        <CaseStatus />
      </section>
    </>
  );
}
