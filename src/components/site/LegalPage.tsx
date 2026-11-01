import { PageHeader } from "./PageHeader";

export function LegalPage({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} />
      <section className="container-x max-w-3xl pb-28">
        <div className="prose-legal">
          {body.split(/\n{2,}/).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>
    </>
  );
}
