"use client";

import { useEffect, useMemo, useState } from "react";
import PackageCard from "@/components/cards/PackageCard";
import SearchBar from "@/components/forms/SearchBar";
import { api } from "@/lib/api";
import { ApiPackage, NormalizedPackage, normalizeApiPackage } from "@/utils/packageTransformers";

export default function PackagesPageClient() {
  const [packages, setPackages] = useState<NormalizedPackage[]>([]);
  const [searchQuery, setSearchQuery] = useState<{
    destination: string;
    dates: string;
    travelers: { adults: number; children: number };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPackages = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getPackages({ archived: false, limit: 200 });
        if (!isMounted) {
          return;
        }
        const data = ((response?.data ?? []) as ApiPackage[])
          .map((pkg) => normalizeApiPackage(pkg))
          .sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
        setPackages(data);
      } catch (err) {
        console.error("Failed to load packages", err);
        if (isMounted) {
          setError("Unable to load packages right now. Please try again shortly.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPackages();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPackages = useMemo(() => {
    if (!searchQuery || (!searchQuery.destination && !searchQuery.dates)) {
      return packages;
    }

    return packages.filter((pkg) => {
      if (searchQuery.destination) {
        const destinationLower = searchQuery.destination.toLowerCase();
        const matchesDestination =
          pkg.destination?.toLowerCase().includes(destinationLower) ||
          pkg.title.toLowerCase().includes(destinationLower);

        if (!matchesDestination) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, packages]);

  const handleSearch = (query: {
    destination: string;
    dates: string;
    travelers: { adults: number; children: number };
  }) => {
    setSearchQuery(query);
    const packagesSection = document.getElementById("packages-section");
    if (packagesSection) {
      packagesSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <section className="section">
        <div className="grid gap-8 lg:gap-12 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div className="space-y-4 sm:space-y-5 md:space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-(--color-brand-50) px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-(--color-brand-600) sm:gap-3 sm:px-4 sm:py-2 sm:text-xs">
              Bespoke collection
            </span>
            <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl md:text-5xl">
              Find your next signature journey
            </h1>
            <p className="max-w-xl text-sm text-slate-600 sm:text-base">
              Filter through curated itineraries spanning cultural immersions,
              private transport, and elevated wellness getaways.
            </p>

            <SearchBar onSearch={handleSearch} />

            <div className="grid gap-3 text-xs text-slate-600 sm:gap-4 sm:text-sm sm:grid-cols-2 md:grid-cols-3">
              {["Tour Packages", "Car Rental", "Airport Transport", "Hotel Booking"].map((category) => (
                <div
                  key={category}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-[0_25px_60px_-35px_rgb(15_23_42/0.6)] sm:rounded-2xl sm:px-5 sm:py-4"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-(--color-brand-500) sm:text-xs">
                    {category}
                  </p>
                  <p className="mt-1.5 text-xs sm:mt-2 sm:text-sm">
                    Concierge pricing, flexible dates, and premium partnerships.
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/90 shadow-[0_40px_120px_-45px_rgb(15_23_42/0.65)] sm:rounded-3xl">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(79,70,229,0.15),transparent)]" />
            <div className="relative p-6 text-slate-700 sm:p-8 md:p-10">
              <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">citymuscattours Concierge</h3>
              <p className="mt-2 text-xs sm:mt-3 sm:text-sm">
                Share your wishlist and leave the logistics to us. We design itineraries with real-time support, exclusive
                access, and trusted partners in over 120 destinations.
              </p>
              <div className="mt-4 grid gap-2 text-xs sm:mt-6 sm:gap-3 sm:text-sm">
                <span>✔ Personalized itineraries & adjustments</span>
                <span>✔ 24/7 WhatsApp concierge line</span>
                <span>✔ Global network of premium partners</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="mx-auto mt-6 max-w-5xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <p className="font-semibold">Unable to load packages</p>
          <p className="mt-1 text-xs text-red-600/80">{error}</p>
        </div>
      )}

      <section id="packages-section" className="section">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl md:text-3xl">
            {searchQuery ? "Search Results" : "Curated packages"}
          </h2>
          <p className="text-xs text-slate-600 sm:text-sm">
            {filteredPackages.length} {searchQuery ? "result" : "premium experience"}
            {filteredPackages.length !== 1 ? "s" : ""} {!searchQuery && "· Updated weekly"}
          </p>
        </div>

        {loading ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 sm:mt-10 sm:rounded-3xl sm:p-12">
            Loading curated packages...
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center sm:mt-10 sm:rounded-3xl sm:p-12">
            <p className="text-base font-semibold text-slate-900 sm:text-lg">No packages found</p>
            <p className="mt-2 text-xs text-slate-600 sm:text-sm">Try adjusting your search criteria or browse all packages.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:mt-10 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 md:gap-7">
            {filteredPackages.map((travelPackage) => (
              <PackageCard
                key={travelPackage.id}
                id={travelPackage.id}
                title={travelPackage.title}
                destination={travelPackage.destination}
                duration={travelPackage.duration}
                price={travelPackage.price}
                currency={travelPackage.currency ?? "INR"}
                category={travelPackage.category}
                rating={travelPackage.rating}
                highlights={travelPackage.highlights}
                image={travelPackage.image}
                detailPath={`/packages/${travelPackage.slug ?? travelPackage.id}`}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

