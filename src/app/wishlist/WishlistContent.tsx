"use client";

import Link from "next/link";
import PackageCard from "@/components/cards/PackageCard";
import { useWishlist } from "@/components/providers/WishlistProvider";

export default function WishlistContent() {
  const { items, count } = useWishlist();

  return (
    <main className="pb-20 pt-16">
      <section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 md:px-10">
        <header className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-brand-500)]">Wishlist</p>
          <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">Your saved experiences</h1>
          <p className="text-sm text-slate-600">
            {count > 0
              ? "Keep planning—these handpicked experiences are ready when you are."
              : "Tap the heart on any experience to add it to your wishlist for later."}
          </p>
        </header>

        {count === 0 ? (
          <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-dashed border-slate-200 bg-white/70 px-6 py-10 text-center text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-14 w-14 text-[var(--color-brand-400)]">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 20.5 3.5 12a6 6 0 0 1 0-8.5 6 6 0 0 1 8.5 0l.5.5.5-.5a6 6 0 0 1 8.5 0 6 6 0 0 1 0 8.5L12 20.5Z"
              />
            </svg>
            <div className="space-y-3">
              <p className="text-lg font-semibold text-slate-900">No saved experiences yet</p>
              <p className="text-sm text-slate-500">
                Explore our curated categories and tap the heart icon to build your wishlist.
              </p>
            </div>
            <Link
              href="/"
              className="rounded-full bg-[var(--color-brand-600)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-700)]"
            >
              Browse experiences
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <PackageCard
                key={item.id}
                id={item.id}
                title={item.title}
                destination={item.destination}
                duration={item.duration}
                price={item.price}
                currency={item.currency}
                rating={item.rating}
                highlights={item.highlights}
                image={item.image}
                detailPath={item.detailPath}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

