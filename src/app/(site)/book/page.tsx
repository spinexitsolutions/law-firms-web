import type { Metadata } from "next";
import { PageHeader } from "@/components/site/PageHeader";
import { BookingWizard } from "@/components/site/forms/BookingWizard";

export const metadata: Metadata = { title: "Book a Consultation" };

export default async function BookPage({ searchParams }: { searchParams: Promise<{ attorney?: string; area?: string }> }) {
  const { attorney, area } = await searchParams;
  return (
    <>
      <PageHeader
        eyebrow="Book a consultation"
        title="Four steps. Two minutes. Total confidence."
        intro="Choose a time that works for you. A partner's office will confirm within one business day."
      />
      <section className="container-x max-w-5xl pb-24 md:pb-36">
        <BookingWizard attorney={attorney} area={area} />
      </section>
    </>
  );
}
