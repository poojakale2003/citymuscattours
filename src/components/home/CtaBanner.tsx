import Link from "next/link";

export default function CtaBanner() {
  return (
    <section className="section">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[linear-gradient(135deg,_#2137ff,_#6f8cff_55%,_#ffd07a)] px-8 py-12 text-white shadow-[0_45px_100px_-50px_rgb(30_64_175_/_0.75)] md:px-12 md:py-10">
        <div className="absolute inset-y-0 right-0 h-full w-1/2 translate-x-1/3 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.22),_transparent_55%)]" />
        <div className="relative max-w-2xl space-y-6">
          <span className="inline-flex items-center gap-3 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em]">
            Concierge access
          </span>
          <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
            Ready to design your signature travel story?
          </h2>
          <p className="max-w-xl text-base text-white/90">
            Share your dreams and let our experience architects design a journey
            with curated stays, hidden gems, and seamless logistics.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/booking"
              className="rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-[var(--color-brand-600)] transition hover:bg-slate-100"
            >
              Talk to a travel designer
            </Link>
            <Link
              href="/packages"
              className="rounded-full border border-white/70 px-6 py-3 text-center text-sm font-semibold transition hover:bg-white/10"
            >
              Browse inspirations
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

