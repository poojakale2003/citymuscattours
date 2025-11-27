export default function TermsPage() {
  return (
    <main className="section space-y-8 pb-20 pt-10 sm:space-y-10 sm:pt-14">
      <header className="space-y-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-(--color-brand-500)">
          Legal
        </p>
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Terms &amp; Conditions</h1>
        <p className="mx-auto max-w-3xl text-sm text-slate-600 sm:text-base">
          These terms outline how citymuscattours delivers services, manages reservations, and supports guests before,
          during, and after travel.
        </p>
      </header>

      <section className="mx-auto max-w-4xl space-y-6 rounded-3xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-700 shadow-[0_35px_90px_-65px_rgb(15_23_42/0.6)] sm:p-10 sm:text-base">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Service Use</h2>
          <p>
            By confirming a booking, you agree to follow local regulations and respect crew instructions during tours,
            transfers, and private charters. Misconduct may result in service refusal without refund.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Payments &amp; Deposits</h2>
          <p>
            Concierge invoices are issued in OMR. Deposits confirm availability. Remaining balances are due 7 days before
            arrival unless otherwise stated on your itinerary summary.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Liability</h2>
          <p>
            We partner with licensed operators and audited chauffeurs. However, weather, airspace closures, and third-party
            strikes may impact schedules. We&apos;ll always offer the best available alternatives.
          </p>
        </div>
      </section>
    </main>
  );
}

