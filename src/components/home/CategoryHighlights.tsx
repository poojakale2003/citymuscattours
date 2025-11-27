import Link from "next/link";
import { serviceCategories } from "@/lib/data";

export default function CategoryHighlights() {
  return (
    <section className="section">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="max-w-xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-brand-500)]">
            Services
          </p>
          <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
            Three pillars for effortless travel
          </h2>
          <p className="text-base text-slate-600">
            Select a service tailored to your journey. Every experience is powered
            by our vetted experts, chauffeur partners, and local storytellers.
          </p>
        </div>
        <Link
          href="/packages"
          className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
        >
          Explore all experiences →
        </Link>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {serviceCategories.map((category) => (
          <Link
            key={category.id}
            href={category.href}
            className="group relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white shadow-[0_32px_70px_-36px_rgb(15_23_42_/_0.65)] transition hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-black/55 via-black/20 to-transparent opacity-75 transition group-hover:opacity-85" />
            <div
              aria-hidden
              className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
              style={{ backgroundImage: `url(${category.image})` }}
            />

            <div className="relative flex h-full flex-col justify-between px-8 py-10 text-white">
              <div className="space-y-3">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/50 bg-white/10 text-xs font-semibold uppercase tracking-[0.3em]">
                  DT
                </span>
                <h3 className="text-2xl font-semibold">{category.title}</h3>
                <p className="text-sm text-white/85">{category.description}</p>
              </div>
              <div className="mt-10 flex items-center justify-between text-sm font-medium">
                <span>{category.metrics}</span>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 transition group-hover:bg-white group-hover:text-[var(--color-brand-700)]">
                  →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

