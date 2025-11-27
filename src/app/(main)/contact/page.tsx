import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="section space-y-8 pb-20 pt-10 sm:space-y-10 sm:pt-14">
      <header className="space-y-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-(--color-brand-500)">
          Concierge Desk
        </p>
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Contact Us</h1>
        <p className="mx-auto max-w-3xl text-sm text-slate-600 sm:text-base">
          Reach our Muscat-based team for itinerary support, chauffeured transfers, and concierge requests. Our WhatsApp
          line operates 24/7 and we reply to emails within 12 hours.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <article className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-[0_35px_90px_-65px_rgb(15_23_42/0.6)] sm:p-10 sm:text-base">
          <h2 className="text-xl font-semibold text-slate-900">Concierge Hotline</h2>
          <p>WhatsApp & Phone: +968 9949 8697</p>
          <p>
            Email:{" "}
            <Link href="mailto:Travelalshaheed2016@gmail.com" className="text-(--color-brand-600) hover:underline">
              Travelalshaheed2016@gmail.com
            </Link>
          </p>
          <p>Working hours: 24/7 for active itineraries, 9am-9pm Gulf Standard Time for new inquiries.</p>
        </article>

        <article className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-[0_35px_90px_-65px_rgb(15_23_42/0.6)] sm:p-10 sm:text-base">
          <h2 className="text-xl font-semibold text-slate-900">Visit Us</h2>
          <p>citymuscattours Studio</p>
          <p>Qurum Boulevard, Building 12</p>
          <p>Muscat, Sultanate of Oman</p>
          <p>Meetings by appointment only. Please contact us to schedule a visit with our travel designers.</p>
        </article>
      </section>

      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-[0_30px_85px_-60px_rgb(15_23_42/0.55)] sm:p-10 sm:text-base">
        <h2 className="text-xl font-semibold text-slate-900">Quick Request</h2>
        <p>Share a few details and our concierge will reach out with availability and next steps.</p>
        <form className="grid gap-4 md:grid-cols-2">
          <input
            type="text"
            placeholder="Full name"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-(--color-brand-400) focus:ring-(--color-brand-200)"
            required
          />
          <input
            type="email"
            placeholder="Email address"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-(--color-brand-400) focus:ring-(--color-brand-200)"
            required
          />
          <input
            type="tel"
            placeholder="Phone or WhatsApp"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-(--color-brand-400) focus:ring-(--color-brand-200)"
          />
          <input
            type="text"
            placeholder="Preferred travel dates"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-(--color-brand-400) focus:ring-(--color-brand-200)"
          />
          <textarea
            placeholder="How can we help?"
            rows={4}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-(--color-brand-400) focus:ring-(--color-brand-200) md:col-span-2"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-(--color-brand-600) px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-(--color-brand-600)/40 transition hover:-translate-y-0.5 hover:bg-(--color-brand-700)"
          >
            Submit Request
          </button>
        </form>
      </section>
    </main>
  );
}

