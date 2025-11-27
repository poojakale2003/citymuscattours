import type { Metadata } from "next";
import CategoryPackagesClient from "@/components/category/CategoryPackagesClient";
import AirportTransportCards from "@/components/home/categories/AirportTransportCards";
import Link from "next/link";
import { HiArrowUpRight } from "react-icons/hi2";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Airport transfers & VIP meet-and-greet in Muscat",
  description: "Book 24/7 airport pickups with flight monitoring, concierge hosts, and luxury vehicles.",
  path: "/airport-transport",
  keywords: ["airport transfer", "muscat airport taxi", "vip arrival"],
});

export default function AirportTransportPage() {
  return (
    <CategoryPackagesClient categorySlug="airport-transport" compact>
      <section className="bg-[#f8fbff]">
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 md:px-8 lg:px-12 space-y-8 sm:space-y-10">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-brand-500)] sm:tracking-[0.35em]">
              Airport Transport
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 sm:mt-3 sm:text-3xl md:text-4xl">
              Seamless arrivals and departures, crafted by our concierge
            </h2>
            <p className="mx-auto mt-3 max-w-3xl text-sm text-slate-600 sm:mt-4 sm:text-base">
              Enjoy flight monitoring, meet-and-greet hosts, and premium transfers that keep
              every journey effortless, day or night.
            </p>
          </div>

          <AirportTransportCards />

          <div className="flex justify-center">
            <Link
              href="/booking?category=airport-transport"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-600)] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[var(--color-brand-700)] sm:px-6 sm:py-3 sm:text-sm"
            >
              Book Your Transfer
              <HiArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
          </div>
        </div>
      </section>
    </CategoryPackagesClient>
  );
}

