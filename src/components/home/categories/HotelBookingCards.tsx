"use client";

import Image from "next/image";
import Link from "next/link";
import { MouseEvent, useEffect, useMemo, useState } from "react";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { useFilteredPackages } from "@/components/category/CategoryPageTemplate";
import { formatNumber } from "@/lib/numbers";
import { formatDisplayCurrency } from "@/lib/currency";
import { api } from "@/lib/api";
import { ApiPackage, normalizeApiPackage, NormalizedPackage } from "@/utils/packageTransformers";

type HotelBookingCardsProps = {
  limit?: number;
};

export default function HotelBookingCards({ limit }: HotelBookingCardsProps) {
  const { toggleItem, isWishlisted } = useWishlist();
  const { filteredPackageIds } = useFilteredPackages();
  const [mounted, setMounted] = useState(false);
  const [hotels, setHotels] = useState<NormalizedPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const targetCount = limit ?? 12;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchHotels = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getPackages({
          category: "hotel-booking",
          archived: false,
          limit: targetCount,
        });
        if (!isMounted) {
          return;
        }
        const normalized = ((response?.data ?? []) as ApiPackage[]).map((pkg) => normalizeApiPackage(pkg));
        setHotels(normalized);
      } catch (err) {
        console.error("[HotelBookingCards] failed to load packages", err);
        if (isMounted) {
          setError("Unable to load hotels right now.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchHotels();
    return () => {
      isMounted = false;
    };
  }, [targetCount]);

  const handleWishlistClick = (event: MouseEvent, hotel: NormalizedPackage) => {
    event.preventDefault();
    event.stopPropagation();
    const detailId = hotel.slug ?? hotel.id;
    toggleItem({
      id: detailId,
      title: hotel.title,
      destination: hotel.destination ?? "Hotel",
      duration: hotel.duration,
      price: hotel.price,
      currency: hotel.currency ?? "INR",
      rating: hotel.rating,
      highlights: hotel.highlights ?? [],
      image: hotel.image,
      detailPath: `/packages/${detailId}`,
    });
  };

  const displayedHotels = useMemo(() => {
    let list = hotels;
    if (filteredPackageIds.length > 0) {
      const filterSet = new Set(filteredPackageIds);
      list = list.filter((hotel) => filterSet.has(hotel.id) || (hotel.slug && filterSet.has(hotel.slug)));
    }
    if (limit) {
      list = list.slice(0, limit);
    }
    return list;
  }, [hotels, filteredPackageIds, limit]);

  if (loading && displayedHotels.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 text-sm text-slate-500">
        Loading curated hotels...
      </div>
    );
  }

  if (!loading && displayedHotels.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 text-sm text-slate-500">
        {error ?? "No hotels available right now."}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {displayedHotels.map((hotel) => {
        const detailId = hotel.slug ?? hotel.id;
        const priceLabel = formatDisplayCurrency(hotel.price, hotel.currency ?? "INR");
        const liked = mounted ? isWishlisted(detailId) : false;
        const badgeLabel = hotel.category.replace(/-/g, " ");

        return (
          <Link
            key={detailId}
            href={`/packages/${detailId}`}
            className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_30px_80px_-55px_rgb(15_23_42/0.55)] transition hover:-translate-y-1"
          >
            <div className="relative h-36 w-full sm:h-40">
              <Image
                src={hotel.image}
                alt={hotel.title}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <span className="absolute left-3 top-3 rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-semibold text-white sm:left-4 sm:top-4 sm:px-3 sm:py-1 sm:text-xs">
                {badgeLabel}
              </span>
              <button
                type="button"
                aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
                aria-pressed={liked}
                onClick={(event) => handleWishlistClick(event, hotel)}
                className={`absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border shadow-[0_20px_40px_-25px_rgb(15_23_42/0.65)] transition hover:scale-110 sm:right-4 sm:top-4 sm:h-10 sm:w-10 ${
                  liked
                    ? "border-(--color-brand-200) bg-(--color-brand-50) text-(--color-brand-600)"
                    : "border-white/70 bg-white/95 text-(--color-brand-500) hover:text-(--color-brand-600)"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={liked ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={1.6}
                  className="h-4 w-4 sm:h-5 sm:w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 20.5 3.5 12a6 6 0 0 1 0-8.5 6 6 0 0 1 8.5 0l.5.5.5-.5a6 6 0 0 1 8.5 0 6 6 0 0 1 0 8.5L12 20.5Z"
                  />
                </svg>
              </button>
            </div>
            <div className="flex flex-1 flex-col justify-between px-4 py-4 text-xs text-slate-600 sm:px-6 sm:py-6 sm:text-sm">
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-base font-semibold text-slate-900 sm:text-lg">{hotel.title}</h3>
                <p className="text-slate-500">{hotel.duration}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 sm:gap-2 sm:text-xs">
                  <span className="text-(--color-brand-600)">★★★★☆</span>
                  <span className="font-semibold text-slate-900">{hotel.rating.toFixed(1)}</span>
                  <span>({formatNumber(980)})</span>
                </div>
              </div>
              <div className="mt-3 space-y-1 text-xs sm:mt-4 sm:text-sm">
                <span className="text-base font-semibold text-(--color-brand-600) sm:text-lg">{priceLabel}</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

