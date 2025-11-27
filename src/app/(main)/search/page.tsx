import Link from "next/link";
import Image from "next/image";
import { getAllPackages, formatCurrency } from "@/lib/packages";

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const getParam = (value?: string | string[]) => {
  if (!value) return "";
  return Array.isArray(value) ? value[0] ?? "" : value;
};

const allPackages = getAllPackages();

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const rawQuery = getParam(resolvedSearchParams.q) || getParam(resolvedSearchParams.search) || "";
  const query = rawQuery.trim().toLowerCase();
  const searchableText = (pkg: (typeof allPackages)[number]) =>
    [
      pkg.title,
      pkg.location,
      pkg.categoryTitle,
      pkg.destination,
      pkg.description,
      Array.isArray(pkg.highlights) ? pkg.highlights.join(" ") : "",
      Array.isArray(pkg.services) ? pkg.services.join(" ") : "",
    ]
      .join(" ")
      .toLowerCase();

  const results =
    query.length === 0
      ? allPackages
      : allPackages.filter((pkg) => searchableText(pkg).includes(query));

  return (
    <section className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-(--color-brand-600)">Search results</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Explore experiences across every category</h1>
          <p className="mt-2 text-sm text-slate-600">
            Showing {results.length} match{results.length === 1 ? "" : "es"} for{" "}
            <span className="font-semibold text-(--color-brand-600)">{query || "all experiences"}</span>.
          </p>
        </div>

        {results.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-900">No tours match your search yet.</p>
            <p className="mt-2 text-slate-500">Try another destination, activity type, or browse our featured packages.</p>
            <Link
              href="/packages"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-(--color-brand-600) px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-(--color-brand-700)"
            >
              Browse all packages
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map((pkg) => (
              <Link
                key={pkg.id}
                href={pkg.detailPath}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <Image src={pkg.image} alt={pkg.title} fill className="object-cover transition group-hover:scale-105" />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    <span className="rounded-full bg-(--color-brand-50) px-2 py-1 text-(--color-brand-600)">{pkg.categoryTitle}</span>
                    <span>{pkg.location || pkg.destination}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{pkg.title}</h3>
                  <p className="text-sm text-slate-600 line-clamp-2">{pkg.description}</p>
                  <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">From</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {formatCurrency(pkg.price, pkg.currency)}
                        <span className="text-sm font-normal text-slate-500"> / person</span>
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-(--color-brand-600)">
                      View details
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

