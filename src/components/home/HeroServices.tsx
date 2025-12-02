import Link from "next/link";

const services = [
  {
    title: "Tour Packages",
    badge: "Curated Itineraries",
    description: "Private guides, cultural immersion, and hidden gems tailored to your pace.",
    cta: "Explore Tour Packages ",
    image: "/assets/hero-services/1.webp",
    href: "#city-tours",
  },
  {
    title: "Car Rental",
    badge: "Luxury Fleet",
    description: "Executive sedans, chauffeur services, and premium amenities included.",
    cta: "Reserve a Car ",
    image: "/assets/hero-services/2.jpeg",
    href: "#car-rental",
  },
  {
    title: "Airport Transport",
    badge: "Seamless Transfers",
    description: "Meet & greet hosts, flight monitoring, and VIP lounge access on arrival.",
    cta: "Book Airport Transfer ",
    image: "/assets/hero-services/3.jpeg",
    href: "#airport-transport",
  },
  {
    title: "Hotel Booking",
    badge: "Premium Accommodations",
    description: "Luxury hotels and resorts with exclusive rates, concierge services, and flexible cancellation.",
    cta: "Book a Hotel ",
    image: "/assets/hero-services/4.avif",
    href: "#hotel-booking",
  },
];

export default function HeroServices() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-10 -mt-16 sm:-mt-20 lg:-mt-24 md:px-6 lg:px-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => (
          <article
            key={service.title}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-300/60"
          >
            <div
              className="h-40 w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{ backgroundImage: `url(${service.image})` }}
            />
            <div className="space-y-4 px-6 py-6">
              <span className="inline-flex items-center rounded-full bg-(--color-brand-50) px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-(--color-brand-600)">
                {service.badge}
              </span>
              <h3 className="text-xl font-bold text-slate-900">{service.title}</h3>
              <p className="text-sm leading-relaxed text-slate-600">{service.description}</p>
              <Link
                href={service.href}
                className="inline-flex items-center gap-2 text-sm font-semibold text-(--color-brand-600) transition-all duration-200 hover:gap-3 hover:text-(--color-brand-700)"
              >
                {service.cta}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

