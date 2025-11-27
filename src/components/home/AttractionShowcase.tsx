import Link from "next/link";
import { HiArrowUpRight } from "react-icons/hi2";
import CityToursCards from "@/components/home/categories/CityToursCards";
import CarRentalCards from "@/components/home/categories/CarRentalCards";
import AirportTransportCards from "@/components/home/categories/AirportTransportCards";

export default function AttractionShowcase() {
  return (
    <section className="space-y-12 bg-[#f8fbff] py-10">
      <div id="city-tours" className="relative mx-auto max-w-7xl space-y-10 px-4 py-10 scroll-mt-28 md:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--color-brand-500)]">
            City Tours
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
            Explore curated stories in every city
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base text-slate-600">
            Small-group, concierge-led experiences designed around culture, cuisine, and local
            legends.
          </p>
        </div>
        <div className="space-y-6">
          <CityToursCards limit={8} />
          <div className="flex justify-center">
            <Link
              href="/city-tours"
              className="inline-flex items-center gap-2 rounded-lg bg-(--color-brand-600) px-6 py-3 text-sm font-semibold text-white shadow-md shadow-(--color-brand-600)/25 transition-all duration-200 hover:bg-(--color-brand-700) hover:shadow-lg hover:shadow-(--color-brand-600)/30 hover:-translate-y-0.5"
            >
              Explore More
              <HiArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div id="car-rental" className="relative mx-auto max-w-7xl space-y-10 px-4 py-10 scroll-mt-28 md:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--color-brand-500)]">
            Car Rental
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900 md:text-4xl">
            Chauffeur-driven journeys in premium comfort
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base text-slate-600">
            Choose luxury sedans, SUVs, or classic rides with trusted drivers and concierge perks.
          </p>
        </div>
        <div className="space-y-6">
          <CarRentalCards limit={8} />
          <div className="flex justify-center">
            <Link
              href="/car-rental"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-600)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-700)]"
            >
              Explore More
              <HiArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div id="airport-transport" className="relative mx-auto max-w-7xl space-y-10 px-4 py-10 scroll-mt-28 md:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--color-brand-500)]">
            Airport Transport
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900 md:text-4xl">
            Seamless transfers with meet & greet hosts
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base text-slate-600">
            Arrive relaxed with flight monitoring, lounge access, and personalized arrangements.
          </p>
        </div>
        <div className="space-y-6">
          <AirportTransportCards limit={8} />
          <div className="flex justify-center">
            <Link
              href="/airport-transport"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-600)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-700)]"
            >
              Explore More
              <HiArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

