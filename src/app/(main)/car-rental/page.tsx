import type { Metadata } from "next";
import CategoryPackagesClient from "@/components/category/CategoryPackagesClient";
import CarRentalCards from "@/components/home/categories/CarRentalCards";
import Link from "next/link";
import { HiArrowUpRight } from "react-icons/hi2";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Luxury car rentals & chauffeur services in Oman",
  description: "Choose SUVs, executive sedans, and convertibles with professional drivers and concierge-level service.",
  path: "/car-rental",
  keywords: ["luxury car rental", "chauffeur muscat", "premium transport"],
});

export default function CarRentalPage() {
  return (
    <CategoryPackagesClient categorySlug="car-rental" compact>
      <section className="bg-[#f8fbff]">
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 md:px-8 lg:px-12 space-y-8 sm:space-y-10">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-brand-500)] sm:tracking-[0.35em]">
              Luxury Fleet
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 sm:mt-3 sm:text-3xl md:text-4xl">
              Chauffeur-driven journeys tailored to your plans
            </h2>
            <p className="mx-auto mt-3 max-w-3xl text-sm text-slate-600 sm:mt-4 sm:text-base">
              Choose from executive sedans, SUVs, and iconic convertibles—each paired with
              professional drivers, concierge add-ons, and door-to-door service.
            </p>
          </div>

          <CarRentalCards />

          <div className="flex justify-center">
            <Link
              href="/booking?category=car-rental"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-600)] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[var(--color-brand-700)] sm:px-6 sm:py-3 sm:text-sm"
            >
              Reserve a Premium Ride
              <HiArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
          </div>
        </div>
      </section>
    </CategoryPackagesClient>
  );
}

