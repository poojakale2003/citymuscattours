export default function CancellationPolicyPage() {
  return (
    <main className="section space-y-8 pb-20 pt-10 sm:space-y-10 sm:pt-14">
      <header className="space-y-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-(--color-brand-500)">
          Legal
        </p>
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Cancellation Policy</h1>
        <p className="mx-auto max-w-3xl text-sm text-slate-600 sm:text-base">
          Plans change—we&apos;re here to help. Review our timelines for refunds, credits, and rescheduling support.
        </p>
      </header>

      <section className="mx-auto max-w-4xl space-y-6 rounded-3xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-700 shadow-[0_35px_90px_-65px_rgb(15_23_42/0.6)] sm:p-10 sm:text-base">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Tour Packages &amp; Transfers</h2>
          <p>
            Cancel more than 72 hours before departure for a full refund. Between 72 and 24 hours, a 50% credit is issued.
            Within 24 hours we commit resources and cannot refund, but we&apos;ll always explore rescheduling.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Private Charters &amp; Experiences</h2>
          <p>
            Yacht charters, helicopters, and resort buyouts require longer lead times. Please notify us 7 days prior for a
            full refund; 3-6 days for a 50% credit.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">How to Cancel</h2>
          <p>
            Message your concierge on WhatsApp or email Travelalshaheed2016@gmail.com. Include your booking code so we can
            process requests quickly.
          </p>
        </div>
      </section>
    </main>
  );
}

