import type { Metadata } from "next";
import BookingForm from "@/components/forms/BookingForm";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Request a bespoke itinerary with citymuscattours",
  description: "Share preferred dates, traveler counts, and special requests. Our concierge replies within 12 hours.",
  path: "/booking",
  keywords: ["travel concierge", "custom itinerary", "trip planning"],
});

export default function BookingPage() {
  const minSelectableDate = new Date().toISOString().split("T")[0];
  return (
    <div className="section">
      <div className="mx-auto max-w-4xl space-y-10">
        <div className="space-y-6 text-center">
          <span className="inline-flex items-center gap-3 rounded-full bg-[var(--color-brand-50)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-brand-600)]">
            Begin your journey
          </span>
          <h1 className="text-4xl font-semibold text-slate-900 md:text-5xl">
            Reserve with citymuscattours Concierge
          </h1>
          <p className="text-base text-slate-600">
            Submit your details and our team will confirm availability, share
            secure payment steps, and refine your itinerary within 12 hours.
          </p>
        </div>

        <BookingForm minDate={minSelectableDate} />

        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-[0_25px_65px_-38px_rgb(15_23_42_/_0.6)]">
          <h2 className="text-lg font-semibold text-slate-900">
            Need immediate assistance?
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand-500)]">
                Concierge hotline
              </p>
              <p className="mt-1 text-sm text-slate-600">+968 9949 8697</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand-500)]">
                Email
              </p>
              <p className="mt-1 text-sm text-slate-600">Travelalshaheed2016@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

