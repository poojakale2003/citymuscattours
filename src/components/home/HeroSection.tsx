"use client";

import Image from "next/image";
import Link from "next/link";

const tabs = [
  {
    id: "city-tours",
    label: "Tour Packages",
    href: "/city-tours",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="h-5 w-5"
      >
        <path
          d="M4 17V7.5A2.5 2.5 0 0 1 6.5 5H12l6 4.5V17"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M12 5v4.5H18" strokeLinecap="round" />
        <circle cx="8" cy="17" r="1.5" />
        <circle cx="16" cy="17" r="1.5" />
      </svg>
    ),
  },
  {
    id: "car-rental",
    label: "Car Rental",
    href: "/car-rental",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="h-5 w-5"
      >
        <path
          d="M5 16.5v-4.06a2 2 0 0 1 .27-1l1.4-2.45A2 2 0 0 1 8.77 8h6.46a2 2 0 0 1 1.73.98l1.4 2.45a2 2 0 0 1 .27 1V16.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="7.5" cy="17.5" r="1.5" />
        <circle cx="16.5" cy="17.5" r="1.5" />
      </svg>
    ),
  },
  {
    id: "airport-transport",
    label: "Airport Transport",
    href: "/airport-transport",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="h-5 w-5"
      >
        <path
          d="M12 2L2 7l10 5 10-5-10-5z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2 17l10 5 10-5M2 12l10 5 10-5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "hotel-booking",
    label: "Hotel Booking",
    href: "/hotel-booking",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="h-5 w-5"
      >
        <path
          d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M9 22V12h6v10" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="relative h-[28rem] w-full sm:h-[32rem] md:h-[36rem] lg:h-[40rem] xl:h-[44rem]">
        <Image
          src="/assets/hero/main.jpeg"
          alt="citymuscattours explorers"
          fill
          className="object-cover"
          priority
        />
        <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,20,38,0.4)_0%,rgba(11,20,38,0.75)_100%)]" />
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white sm:px-5 md:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-4xl space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
          <div className="space-y-3 sm:space-y-4 md:space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/90 sm:text-sm md:text-base">
              city muscat tours
            </p>
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl">
              Explore The World{" "}
              <span className="relative inline-block">
                Around You
                <span className="absolute -bottom-1.5 left-0 h-1.5 w-full rounded-full bg-white/90 sm:-bottom-2 sm:h-2" />
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base md:text-lg lg:text-xl">
              Discover curated tour packages, premium car rentals, and seamless airport transfers. 
              Your journey to unforgettable experiences starts here.
            </p>
          </div>

          <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/packages"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-(--color-brand-600) px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-(--color-brand-600)/30 transition-all duration-200 hover:bg-(--color-brand-700) hover:shadow-xl hover:shadow-(--color-brand-600)/40 hover:-translate-y-0.5 sm:w-auto sm:px-6 sm:py-3.5"
            >
              Explore Packages
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-white sm:mt-8 sm:gap-4 sm:text-sm md:mt-10 md:gap-5 lg:gap-6">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className="group flex items-center gap-1.5 rounded-lg px-3 py-2 text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white sm:gap-2 sm:px-4 sm:py-2.5"
              >
                <span className="flex items-center gap-1.5 sm:gap-2">
                  <span className="h-4 w-4 sm:h-5 sm:w-5">{tab.icon}</span>
                  <span className="relative inline-block whitespace-nowrap">
                    {tab.label}
                    <span
                      className="absolute -bottom-1 left-0 h-0.5 w-full bg-white opacity-0 transition-opacity duration-200 group-hover:opacity-50"
                    />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

