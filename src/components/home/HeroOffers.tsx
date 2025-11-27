const offers = [
  {
    title: "City Tours",
    badge: "Curated Itineraries",
    details: "Private guides · Cultural immersion · Hidden gems",
    cta: "Explore City Tours →",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop",
  },
  {
    title: "Car Rental",
    badge: "Luxury Fleet",
    details: "Executive sedans · Chauffeur services · Premium amenities",
    cta: "Reserve a Car →",
    image: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600&h=400&fit=crop",
  },
  {
    title: "Airport Transport",
    badge: "Seamless Transfers",
    details: "Meet & greet · Flight tracking · VIP lounge access",
    cta: "Book Airport Transfer →",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=400&fit=crop",
  },
];

export default function HeroOffers() {
  return (
    <section className="section -mt-20">
      <div className="grid gap-6 md:grid-cols-3">
        {offers.map((offer) => (
          <article
            key={offer.title}
            className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_30px_80px_-55px_rgb(15_23_42_/_0.55)]"
          >
            <div
              className="h-28 w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${offer.image})` }}
            />
            <div className="space-y-2 px-6 py-5 text-sm text-slate-600">
              <span className="inline-flex items-center rounded-full bg-[var(--color-brand-50)] px-3 py-1 text-xs font-semibold text-[var(--color-brand-600)]">
                {offer.badge}
              </span>
              <h3 className="text-lg font-semibold text-slate-900">{offer.title}</h3>
              <p>{offer.details}</p>
              <button className="text-sm font-semibold text-[var(--color-brand-600)] transition hover:text-[var(--color-brand-700)]">
                {offer.cta}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

