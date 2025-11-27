import Image from "next/image";
import { HiArrowUpRight } from "react-icons/hi2";

const backgroundSrc = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=900&fit=crop";

export default function NewsletterCta() {
  return (
    <section className="relative overflow-hidden py-20 text-white sm:py-24 lg:py-28">
      <Image
        src={backgroundSrc}
        alt="citymuscattours mountains"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(11,29,55,0.85),rgba(28,64,128,0.7))]" />
      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 text-center sm:px-8 md:px-12">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/90">
            Stay Connected
          </p>
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Subscribe &amp; Get Special Discount with citymuscattours
        </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">
            Receive curated offers, destination inspiration, and concierge-only perks delivered to your inbox.
        </p>
        </div>
        <form className="mx-auto flex w-full max-w-xl flex-col gap-3 md:flex-row md:items-center">
          <input
            type="email"
            placeholder="Enter your email address"
            className="w-full rounded-lg border-2 border-white/40 bg-white/10 px-5 py-3.5 text-sm text-white placeholder:text-white/70 backdrop-blur-sm transition-all duration-200 focus:border-white focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/60 md:py-4 md:text-base"
            required
          />
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-(--color-brand-600) px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-(--color-brand-600)/30 transition-all duration-200 hover:bg-(--color-brand-700) hover:shadow-xl hover:shadow-(--color-brand-600)/40 hover:-translate-y-0.5 md:w-auto md:px-8 md:py-4 md:text-base"
          >
            Subscribe
            <HiArrowUpRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </section>
  );
}

