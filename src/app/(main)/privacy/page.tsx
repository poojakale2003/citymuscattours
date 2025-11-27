export default function PrivacyPage() {
  return (
    <main className="section space-y-8 pb-20 pt-10 sm:space-y-10 sm:pt-14">
      <header className="space-y-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-(--color-brand-500)">
          Legal
        </p>
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Privacy Policy</h1>
        <p className="mx-auto max-w-3xl text-sm text-slate-600 sm:text-base">
          We collect minimal data to honor bookings, coordinate chauffeurs, and share curated offers. Here is how your
          information is stored and used.
        </p>
      </header>

      <section className="mx-auto max-w-4xl space-y-6 rounded-3xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-700 shadow-[0_35px_90px_-65px_rgb(15_23_42/0.6)] sm:p-10 sm:text-base">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Data We Collect</h2>
          <p>
            Names, contact numbers, flight itineraries, and dietary preferences are stored securely for trip management.
            Payment details are processed via PCI-compliant partners and never saved on our servers.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">How We Use Information</h2>
          <p>
            Information is shared only with guides, chauffeurs, and resort partners executing your itinerary. We do not
            sell data to third parties. Marketing emails are optional—unsubscribe anytime.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Your Rights</h2>
          <p>
            Email Travelalshaheed2016@gmail.com to request data exports or deletions. We typically respond within 48 hours.
          </p>
        </div>
      </section>
    </main>
  );
}

