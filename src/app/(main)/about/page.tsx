export default function AboutPage() {
  return (
    <main className="section space-y-8 pb-20 pt-10 sm:space-y-10 sm:pt-14">
      <header className="space-y-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-(--color-brand-500)">
          citymuscattours
        </p>
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">About Us</h1>
        <p className="mx-auto max-w-3xl text-sm text-slate-600 sm:text-base">
          We are a concierge-led travel studio based in Muscat crafting effortless city tours, premium car rentals, and
          seamless airport transfers for discerning explorers across the Gulf.
        </p>
      </header>

      <section className="mx-auto grid max-w-4xl gap-6 rounded-3xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-700 shadow-[0_35px_90px_-65px_rgb(15_23_42/0.6)] sm:p-10 sm:text-base">
        <p>
          For over a decade, citymuscattours has partnered with vetted guides, chauffeurs, and marine specialists to
          elevate every itinerary. From curated souq walks to helicopter transfers and Daymaniat snorkeling charters, we
          blend local insight with concierge precision.
        </p>
        <p>
          Our team handles travel logistics, 24/7 WhatsApp support, dining reservations, and wellness appointments so
          you can enjoy Muscat&apos;s culture and coastlines without stress.
        </p>
        <ul className="space-y-2 rounded-2xl bg-[#f8fbff] p-5 text-sm text-slate-800">
          <li>• Private city storytelling tours</li>
          <li>• Chauffeur-driven sedans, SUVs, and vintage convertibles</li>
          <li>• Airport meet &amp; greet services with real-time flight tracking</li>
          <li>• Concierge-managed anniversary, proposal, and group events</li>
        </ul>
      </section>
    </main>
  );
}

