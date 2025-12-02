import type { Metadata } from "next";
import CategoryPackagesClient from "@/components/category/CategoryPackagesClient";
import HotelBookingCards from "@/components/home/categories/HotelBookingCards";
import Link from "next/link";
import { HiArrowUpRight } from "react-icons/hi2";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Premium hotel bookings & accommodations in Oman",
  description: "Discover luxury hotels and resorts with exclusive rates, personalized service, and flexible booking options.",
  path: "/hotel-booking",
  keywords: ["hotel booking", "luxury hotels", "accommodations", "resorts"],
});

export default function HotelBookingPage() {
  return (
    <CategoryPackagesClient categorySlug="hotel-booking" compact>
      <section className="bg-[#f8fbff]">
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 md:px-8 lg:px-12 space-y-8 sm:space-y-10">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-brand-500)] sm:tracking-[0.35em]">
              Premium Accommodations
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 sm:mt-3 sm:text-3xl md:text-4xl">
              Discover luxury hotels and resorts across Oman
            </h2>
            <p className="mx-auto mt-3 max-w-3xl text-sm text-slate-600 sm:mt-4 sm:text-base">
              Experience world-class hospitality with exclusive rates, personalized concierge services, 
              and flexible cancellation policies at handpicked properties.
            </p>
          </div>

          <HotelBookingCards />

          <div className="flex justify-center">
            <Link
              href="/booking?category=hotel-booking"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-600)] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[var(--color-brand-700)] sm:px-6 sm:py-3 sm:text-sm"
            >
              Book a Hotel
              <HiArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
          </div>
        </div>
      </section>
    </CategoryPackagesClient>
  );
}

