"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyboardEvent, MouseEvent } from "react";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { formatNumber } from "@/lib/numbers";
import { formatDisplayCurrency } from "@/lib/currency";

type PackageCardProps = {
  id: string;
  title: string;
  destination: string;
  duration: string;
  price: number;
  currency?: string;
  category?: string;
  rating: number;
  highlights: string[];
  image: string;
  detailPath?: string;
};

export default function PackageCard({
  id,
  title,
  destination,
  duration,
  price,
  currency = "USD",
  category,
  rating,
  highlights,
  image,
  detailPath,
}: PackageCardProps) {
  const router = useRouter();
  const detailHref = detailPath ?? `/packages/${id}`;
  const priceLabel = formatDisplayCurrency(price, currency);

  const handleNavigation = () => {
    router.push(detailHref);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      router.push(detailHref);
    }
  };

  const stopPropagation = (event: MouseEvent) => {
    event.stopPropagation();
  };

  const { toggleItem, isWishlisted } = useWishlist();
  const isLiked = isWishlisted(id);

  const handleWishlistClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    toggleItem({
      id,
      title,
      destination,
      duration,
      price,
      currency,
      rating,
      highlights,
      image,
      detailPath: detailHref,
    });
  };

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={handleNavigation}
      onKeyDown={handleKeyDown}
      className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_25px_55px_-30px_rgb(30_64_175_/_0.45)] transition hover:-translate-y-1 hover:shadow-[0_35px_80px_-35px_rgb(30_64_175_/_0.6)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)] focus:ring-offset-2"
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <button
          type="button"
          aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isLiked}
          onClick={handleWishlistClick}
          className={`absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border shadow-[0_20px_40px_-25px_rgb(15_23_42/0.65)] transition hover:scale-110 ${isLiked ? "border-[var(--color-brand-200)] bg-[var(--color-brand-50)] text-[var(--color-brand-600)]" : "border-white/70 bg-white/95 text-[var(--color-brand-500)] hover:text-[var(--color-brand-600)]"}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.7} className="h-5 w-5">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 20.5 3.5 12a6 6 0 0 1 0-8.5 6 6 0 0 1 8.5 0l.5.5.5-.5a6 6 0 0 1 8.5 0 6 6 0 0 1 0 8.5L12 20.5Z"
            />
          </svg>
        </button>
        <div className="absolute inset-x-5 bottom-5 flex items-center justify-between rounded-full bg-white/90 px-4 py-2 text-xs font-medium text-slate-700 backdrop-blur">
          <span className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-4 w-4 text-[var(--color-brand-500)]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 20.5 3.5 12a6 6 0 0 1 0-8.5 6 6 0 0 1 8.5 0l.5.5.5-.5a6 6 0 0 1 8.5 0 6 6 0 0 1 0 8.5L12 20.5Z"
              />
            </svg>
            {destination}
          </span>
          <span>{duration}</span>
        </div>
      </div>

      <div className="space-y-5 px-6 pb-10 pt-8">
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand-500)]">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-brand-400)]" />
          Dream Curated
        </div>

        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 break-words">{title}</h3>
          <p className="text-sm font-medium text-slate-500 line-clamp-2">
            {highlights.slice(0, 2).join(" · ")}
          </p>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-xl font-semibold text-slate-900">
            {priceLabel}
            <span className="ml-1 text-xs font-normal text-slate-500">
              /person
            </span>
          </span>
          <span className="flex items-center gap-1 rounded-full bg-[var(--color-brand-50)] px-3 py-1 font-medium text-[var(--color-brand-600)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            {rating}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          {highlights.map((highlight) => (
            <span
              key={highlight}
              className="rounded-full border border-slate-200 px-3 py-1 transition hover:border-[var(--color-brand-200)] hover:text-slate-700"
            >
              {highlight}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-sm font-semibold text-[var(--color-brand-600)] transition group-hover:text-[var(--color-brand-700)]">
            View details →
          </span>
          <Link
            href="/booking"
            onClick={stopPropagation}
            className="rounded-full bg-[var(--color-brand-600)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-700)]"
          >
            Reserve
          </Link>
        </div>
      </div>
    </article>
  );
}

