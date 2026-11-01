import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[80svh] flex-col justify-center pt-28">
      <p className="eyebrow text-muted">Error 404</p>
      <h1 className="display-xl mt-4">
        Case <span className="text-accent">dismissed.</span>
      </h1>
      <p className="lede mt-6 max-w-md text-ink/70">The page you were looking for doesn&apos;t exist or has moved.</p>
      <Link href="/" className="mt-10 h-14 w-fit rounded-full bg-ink px-7 leading-[3.5rem] text-paper">
        Return home
      </Link>
    </section>
  );
}
