import Link from "next/link";
import PackageCard from "@/components/cards/PackageCard";
import { featuredPackages } from "@/lib/data";

export default function FeaturedPackagesSection() {
  return (
    <section className="section">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-brand-500)]">
            Featured Itineraries
          </p>
          <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
            Crafted for dreamers & explorers
          </h2>
        </div>

        <Link
          href="/packages"
          className="rounded-full bg-[var(--color-brand-600)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-700)]"
        >
          View all packages
        </Link>
      </div>

      <div className="mt-10 grid gap-7 md:grid-cols-3">
        {featuredPackages.map((travelPackage) => (
          <PackageCard
            key={travelPackage.id}
            {...travelPackage}
            detailPath={`/packages/${travelPackage.id}`}
            category="featured"
          />
        ))}
      </div>
    </section>
  );
}

