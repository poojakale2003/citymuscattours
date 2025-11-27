"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PackageCard from "@/components/cards/PackageCard";
import { useWishlist } from "@/components/providers/WishlistProvider";
import type { PackageDetail } from "@/lib/packages";
import { formatCurrency } from "@/lib/packages";
import { formatNumber } from "@/lib/numbers";
import { faqs as defaultFaqs } from "@/lib/data";
import { api } from "@/lib/api";
import type { ApiPackage, NormalizedPackage } from "@/utils/packageTransformers";
import { normalizeApiPackage } from "@/utils/packageTransformers";

const quickInfoIcons: Record<string, ReactNode> = {
  Duration: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
      <path strokeLinecap="round" strokeWidth="1.5" d="M12 7v5l3 2" />
    </svg>
  ),
  Location: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 21s6-4.35 6-10a6 6 0 1 0-12 0c0 5.65 6 10 6 10Z" />
      <circle cx="12" cy="11" r="2" strokeWidth="1.5" />
    </svg>
  ),
  Languages: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.5v15m-4.5-12h9" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7.5 19.5h9" />
    </svg>
  ),
  Cancellation: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  Pickup: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 11h14l-1-4H6z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 15h16" />
      <circle cx="7.5" cy="17.5" r="1.5" strokeWidth="1.5" />
      <circle cx="16.5" cy="17.5" r="1.5" strokeWidth="1.5" />
    </svg>
  ),
  Ticket: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="7" y="3" width="10" height="18" rx="2" strokeWidth="1.5" />
      <path strokeLinecap="round" strokeWidth="1.5" d="M11 17h2" />
    </svg>
  ),
};

type AvailableOption = {
  id: string;
  label: string;
  subtitle: string;
  language: string;
  startTime: string;
  meetingPoint: string;
  perks: string[];
  price: number;
  priceLabel: string;
  rating: number;
  reviews: number;
  cancellation: string;
  pickup: boolean;
};

const CART_STORAGE_KEY = "citymuscattours:cart";

export default function PackageDetail({
  initialPackage,
  minSelectableDate,
}: {
  initialPackage: PackageDetail;
  minSelectableDate: string;
}) {
  const { toggleItem, isWishlisted } = useWishlist();
  const router = useRouter();
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [isTravellersOpen, setIsTravellersOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [cartFeedback, setCartFeedback] = useState<string | null>(null);
  const [availabilityStatus, setAvailabilityStatus] = useState<{
    available: boolean;
    message: string;
    capacity?: { total: number | null; booked: number; available: number; unlimited: boolean };
    pricing?: { basePrice: number; totalAmount: number; currency: string };
  } | null>(null);

  const [travelPackage, setTravelPackage] = useState<PackageDetail>(initialPackage);
  const [similarPackages, setSimilarPackages] = useState<NormalizedPackage[]>([]);
  const [similarLoading, setSimilarLoading] = useState(true);
  const [similarError, setSimilarError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchLivePackage = async () => {
      try {
        const slugOrId = (initialPackage.slug ?? initialPackage.id).replace(/\/+$/, "");
        const encodedId = encodeURIComponent(slugOrId);
        const response = await fetch(`/api/live-packages/${encodedId}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch live package (${response.status})`);
        }
        const data = await response.json();
        if (data?.data) {
          setTravelPackage(data.data as PackageDetail);
        }
      } catch (error) {
        if ((error as DOMException).name === "AbortError") {
          return;
        }
        console.error("[PackageDetail] live fetch failed", error);
      }
    };

    fetchLivePackage();
    return () => {
      controller.abort();
    };
  }, [initialPackage.id]);

  useEffect(() => {
    let isMounted = true;

    const fetchSimilarPackages = async () => {
      if (!travelPackage.category) {
        setSimilarPackages([]);
        setSimilarLoading(false);
        return;
      }

      try {
        setSimilarLoading(true);
        setSimilarError(null);
        const response = await api.getPackages({
          category: travelPackage.category,
          archived: false,
          limit: 12,
        });
        if (!isMounted) {
          return;
        }

        const responseData = response?.data ?? [];
        const normalized = responseData
          .map((pkg: ApiPackage) => normalizeApiPackage(pkg))
          .filter(
            (pkg: NormalizedPackage) =>
              (pkg.slug ?? pkg.id) !== (travelPackage.slug ?? travelPackage.id),
          )
          .slice(0, 6);

        setSimilarPackages(normalized);
      } catch (error) {
        console.error("[PackageDetail] failed to load similar packages", error);
        if (isMounted) {
          setSimilarError("Unable to load similar experiences right now.");
          setSimilarPackages([]);
        }
      } finally {
        if (isMounted) {
          setSimilarLoading(false);
        }
      }
    };

    fetchSimilarPackages();
    return () => {
      isMounted = false;
    };
  }, [travelPackage.category, travelPackage.id, travelPackage.slug]);

  const gallery = useMemo(
    () => Array.from(new Set([travelPackage.image, ...(travelPackage.gallery ?? [])].filter(Boolean))),
    [travelPackage.gallery, travelPackage.image],
  );
  const [heroImage, ...supportingImages] = gallery.length ? gallery : [travelPackage.image];
  const highlights = travelPackage.highlights ?? [];
  const inclusionItems =
    travelPackage.included && travelPackage.included.length
      ? travelPackage.included
      : ["Professional host", "All experiences", "Transfers"];
  const exclusionItems =
    travelPackage.excluded && travelPackage.excluded.length
      ? travelPackage.excluded
      : ["Personal expenses", "Travel insurance"];
  const itineraryItems = travelPackage.itinerary ?? [];
  const faqItems =
    travelPackage.faq && travelPackage.faq.length ? travelPackage.faq : defaultFaqs;
  const essentials = travelPackage.essentials ?? [];

  const priceLabel = formatCurrency(travelPackage.price, travelPackage.currency);
  const categoryHref = travelPackage.category !== "featured" ? `/${travelPackage.category}` : undefined;

  const quickFacts = [
    travelPackage.duration ? { label: "Duration", value: travelPackage.duration, icon: quickInfoIcons.Duration } : null,
    travelPackage.location || travelPackage.destination
      ? { label: "Location", value: travelPackage.location ?? travelPackage.destination, icon: quickInfoIcons.Location }
      : null,
    { label: "Languages", value: (travelPackage.languages ?? ["English"]).join(" · "), icon: quickInfoIcons.Languages },
    { label: "Mobile ticket", value: travelPackage.mobileTicket ?? "Use your phone or print", icon: quickInfoIcons.Ticket },
    {
      label: "Pickup",
      value: travelPackage.pickupIncluded ? "Pickup included" : "Pickup available on request",
      icon: quickInfoIcons.Pickup,
    },
    { label: "Cancellation", value: "Free cancellation up to 24 hours", icon: quickInfoIcons.Cancellation },
  ].filter((fact): fact is { label: string; value: string; icon: ReactNode } => Boolean(fact?.value));

  const galleryThumbnails = supportingImages.slice(0, 2);
  const extraThumbnailCount = Math.max(0, supportingImages.length - galleryThumbnails.length);
  const hasMultipleImages = gallery.length > 1;

  const wishlistItem = useMemo(() => {
    const detailSlug = travelPackage.slug ?? travelPackage.id;
    return {
      id: travelPackage.id,
      title: travelPackage.title,
      destination: travelPackage.destination ?? travelPackage.location ?? "",
      duration: travelPackage.duration,
      price: travelPackage.price,
      currency: travelPackage.currency,
      rating: travelPackage.rating,
      highlights: travelPackage.highlights ?? [],
      image: travelPackage.image,
      detailPath: `/packages/${detailSlug}`,
    };
  }, [
    travelPackage.currency,
    travelPackage.destination,
    travelPackage.duration,
    travelPackage.highlights,
    travelPackage.id,
    travelPackage.image,
    travelPackage.location,
    travelPackage.price,
    travelPackage.rating,
    travelPackage.slug,
    travelPackage.title,
  ]);

  const isWishlistedPackage = isWishlisted(travelPackage.id);

  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "error">("idle");
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, [travelPackage.id]);

  useEffect(() => {
    if (shareStatus === "copied" && typeof window !== "undefined") {
      const timeout = window.setTimeout(() => setShareStatus("idle"), 2000);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [shareStatus]);

  const handleWishlistToggle = useCallback(() => {
    toggleItem(wishlistItem);
  }, [toggleItem, wishlistItem]);

  const handleShare = useCallback(async () => {
    if (typeof window === "undefined") {
      return;
    }

    const url = currentUrl || window.location.href;
    const shareData = {
      title: travelPackage.title,
      text: travelPackage.overview ?? travelPackage.description,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setShareStatus("idle");
        return;
      } catch (error) {
        if ((error as DOMException)?.name === "AbortError") {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setShareStatus("copied");
    } catch {
      setShareStatus("error");
    }
  }, [currentUrl, travelPackage.description, travelPackage.overview, travelPackage.title]);

  const scrollToBooking = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }
    const bookingCard = document.getElementById("booking-card");
    if (bookingCard) {
      bookingCard.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const handleCheckAvailability = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!selectedDate) {
        alert("Please select a date");
        return;
      }

      if (adults + children === 0) {
        alert("Please select at least one traveler");
        return;
      }

      setIsSubmitting(true);
      setAvailabilityStatus(null);

      try {
        console.log("Checking availability:", {
          packageId: travelPackage.id,
          date: selectedDate,
          adults,
          children,
        });

        // Check availability only - no variants/options
        const response = await api.checkBookingAvailability({
          packageId: travelPackage.id,
          date: selectedDate,
          adults,
          children,
        });

        console.log("Availability response:", response);

        // Extract data from response (backend wraps in { data: ... })
        const data = response.data || response;

        // Store availability status
        setAvailabilityStatus({
          available: data.available,
          message: data.message,
          capacity: data.capacity,
          pricing: data.pricing,
        });
      } catch (error) {
        console.error("Error checking availability:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to check availability. Please try again.";
        setAvailabilityStatus({
          available: false,
          message: errorMessage,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedDate, adults, children, travelPackage.id],
  );

  const handleBookNow = useCallback(() => {
      if (!selectedDate) {
        alert("Please select a date first.");
        return;
      }
    if (!availabilityStatus?.available) {
      alert("This package is not available for the selected date. Please check availability first.");
      return;
    }
    const totalPrice = availabilityStatus.pricing?.totalAmount || travelPackage.price * (adults + children);
      const params = new URLSearchParams({
        packageId: travelPackage.id,
        title: travelPackage.title,
      subtotal: String(totalPrice),
        currency: travelPackage.currency,
        date: selectedDate,
        adults: String(adults),
        children: String(children),
        image: travelPackage.image ?? "",
        rating: String(travelPackage.rating ?? 4.8),
        reviews: String(travelPackage.reviews ?? 0),
        badge: travelPackage.badge ?? "Top rated",
        location: travelPackage.location ?? travelPackage.destination ?? "Muscat, Oman",
      });
      router.push(`/checkout?${params.toString()}`);
  }, [adults, children, router, selectedDate, travelPackage, availabilityStatus]);

  const handleAddToCart = useCallback(() => {
    if (!selectedDate) {
      alert("Please select a date first.");
      return;
    }
    if (!availabilityStatus?.available) {
      alert("This package is not available for the selected date. Please check availability first.");
      return;
    }
      try {
        if (typeof window === "undefined") {
          return;
        }
      const totalPrice = availabilityStatus.pricing?.totalAmount || travelPackage.price * (adults + children);
        const stored = window.localStorage.getItem(CART_STORAGE_KEY);
        const parsed = stored ? (JSON.parse(stored) as Record<string, unknown>[]) : [];
        const newItem = {
        id: `${travelPackage.id}-${selectedDate || "no-date"}`,
          packageId: travelPackage.id,
          packageTitle: travelPackage.title,
          date: selectedDate,
          adults,
          children,
        price: totalPrice,
          currency: travelPackage.currency,
          timestamp: Date.now(),
        };
        window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([newItem, ...parsed].slice(0, 25)));
        setCartFeedback("Added to cart");
        setTimeout(() => setCartFeedback(null), 2500);
      } catch (error) {
        console.warn("[cart] failed to add", error);
        setCartFeedback("Unable to add to cart. Try again.");
      }
  }, [adults, children, selectedDate, travelPackage, availabilityStatus]);

  const openImageModal = useCallback((index: number) => {
    setSelectedImageIndex(index);
    setIsImageModalOpen(true);
  }, []);

  const closeImageModal = useCallback(() => {
    setIsImageModalOpen(false);
  }, []);

  const navigateImage = useCallback((direction: "prev" | "next") => {
    setSelectedImageIndex((prev) => {
      if (direction === "next") {
        return prev < gallery.length - 1 ? prev + 1 : 0;
      } else {
        return prev > 0 ? prev - 1 : gallery.length - 1;
      }
    });
  }, [gallery.length]);

  useEffect(() => {
    if (!isImageModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeImageModal();
      } else if (e.key === "ArrowLeft") {
        navigateImage("prev");
      } else if (e.key === "ArrowRight") {
        navigateImage("next");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isImageModalOpen, closeImageModal, navigateImage]);

  const hasSimilarPackages = useMemo(
    () => similarPackages.length > 0,
    [similarPackages.length],
  );

  const ratingLabel = `${travelPackage.rating.toFixed(1)} · ${
    travelPackage.reviews ? `${formatNumber(travelPackage.reviews)} reviews` : "Guest favourite"
  }`;
  const reviewsSummary = travelPackage.reviews
    ? `${formatNumber(travelPackage.reviews)} travellers rated this ${travelPackage.rating.toFixed(1)} ★`
    : "Travellers love the attentive hosts, seamless logistics, and curated access.";

  const faqsToRender = faqItems;
  const addressLabel =
    travelPackage.address1 ??
    travelPackage.address ??
    travelPackage.location ??
    travelPackage.destination;
  const supportChannels = [
    { label: "Phone", value: "+968 9949 8697" },
    { label: "Email", value: "Travelalshaheed2016@gmail.com" },
    { label: "WhatsApp", value: "+968 9949 8697" },
  ];

  return (
    <div className="bg-[#f5f7fb] pb-36 lg:pb-32">
      <div className="relative mx-auto max-w-[1160px] px-4 sm:px-6 md:px-8 lg:px-12 pt-8 sm:pt-10 md:pt-12 pb-0">
        <header className="space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-(--color-brand-50) px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-(--color-brand-600)">
            {travelPackage.badge ?? "Top pick"}
          </span>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 space-y-3 min-w-0">
              <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl md:text-[2.35rem] wrap-break-word">{travelPackage.title}</h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600">
                <span className="inline-flex items-center gap-1 text-(--color-brand-600)">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 sm:h-4 sm:w-4">
                    <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  {ratingLabel}
                </span>
                {travelPackage.location || travelPackage.destination ? (
                  <span className="inline-flex items-center gap-1.5 sm:gap-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-(--color-brand-600)">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s6-4.35 6-10a6 6 0 1 0-12 0c0 5.65 6 10 6 10Z" />
                      <circle cx="12" cy="11" r="2" />
                    </svg>
                    <span className="truncate max-w-[200px] sm:max-w-none">{travelPackage.location ?? travelPackage.destination}</span>
                  </span>
                ) : null}
                {travelPackage.duration ? (
                  <span className="inline-flex items-center gap-1.5 sm:gap-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-(--color-brand-600)">
                      <circle cx="12" cy="12" r="9" />
                      <path strokeLinecap="round" d="M12 7v5l3 2" />
                    </svg>
                    {travelPackage.duration}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold shrink-0">
              <button
                type="button"
                onClick={handleWishlistToggle}
                aria-pressed={isWishlistedPackage}
                className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-full border px-2.5 sm:px-3 py-2 sm:py-1.5 transition min-h-[44px] sm:min-h-0 ${
                  isWishlistedPackage
                    ? "border-(--color-brand-300) bg-(--color-brand-50) text-(--color-brand-600)"
                    : "border-slate-200 text-slate-600 hover:border-(--color-brand-300) hover:text-(--color-brand-600)"
                }`}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 sm:h-4 sm:w-4">
                  <path d="m17.657 16.657-5.657 5.657-5.657-5.657a4 4 0 0 1 5.657-5.657 4 4 0 0 1 5.657 5.657Z" />
                </svg>
                <span className="hidden sm:inline">{isWishlistedPackage ? "Saved" : "Save"}</span>
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-slate-200 px-2.5 sm:px-3 py-2 sm:py-1.5 text-slate-600 transition hover:border-(--color-brand-300) hover:text-(--color-brand-600) min-h-[44px] sm:min-h-0"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4 4 16 8-16 8 4-8-4-8Z" />
                </svg>
                <span className="hidden sm:inline">{shareStatus === "error" ? "Copy failed" : shareStatus === "copied" ? "Copied" : "Share"}</span>
              </button>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-slate-600">
            {travelPackage.overview ?? travelPackage.description}
          </p>
        </header>

        <div className="mt-10 flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex-1 space-y-10 lg:space-y-12">
            <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_25px_70px_-55px_rgb(15_23_42/0.45)]">
              {hasMultipleImages ? (
                <div className="grid grid-cols-1 gap-2 p-2 sm:grid-cols-3 sm:gap-2 sm:p-0">
                  {/* Large image on left - takes 2 columns */}
                <button
                  type="button"
                  onClick={() => openImageModal(0)}
                    className="relative col-span-1 sm:col-span-2 aspect-4/3 sm:aspect-auto sm:h-full min-h-[200px] sm:min-h-[400px] cursor-pointer overflow-hidden"
                >
                  <Image
                    src={heroImage}
                    alt={travelPackage.title}
                    fill
                    className="object-cover transition-opacity hover:opacity-90"
                    priority
                      sizes="(max-width: 640px) 100vw, 66vw"
                  />
                </button>
                  
                  {/* Two smaller images stacked vertically on right */}
                  <div className="col-span-1 flex flex-col gap-2 sm:gap-2">
                    {galleryThumbnails.map((image, index) => (
                      <button
                        key={image}
                        type="button"
                        onClick={() => openImageModal(index + 1)}
                        className="relative aspect-4/3 sm:aspect-auto sm:flex-1 min-h-[100px] sm:min-h-0 cursor-pointer overflow-hidden transition-opacity hover:opacity-90"
                      >
                        <Image
                          src={image}
                          alt={`${travelPackage.title} preview ${index + 2}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 33vw"
                        />
                        {index === galleryThumbnails.length - 1 && extraThumbnailCount > 0 ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                            <div className="rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white">
                            +{extraThumbnailCount}
                            </div>
            </div>
                        ) : null}
                      </button>
          ))}
                    {/* If only one thumbnail, add placeholder to maintain layout */}
                    {galleryThumbnails.length === 1 && extraThumbnailCount === 0 && (
                      <div className="flex-1 hidden sm:block" />
                    )}
        </div>
              </div>
              ) : (
                // Single image layout (fallback if only one image)
                <button
                  type="button"
                  onClick={() => openImageModal(0)}
                  className="relative block h-[140px] w-full cursor-pointer sm:h-[160px] lg:h-[200px]"
                >
                  <Image
                    src={heroImage}
                    alt={travelPackage.title}
                    fill
                    className="object-cover transition-opacity hover:opacity-90"
                    priority
                    sizes="(max-width: 768px) 94vw, (max-width: 1024px) 48vw, 400px"
                  />
                </button>
              )}
      </article>
            {quickFacts.length ? (
              <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-[0_25px_70px_-55px_rgb(15_23_42/0.45)] sm:grid-cols-2 xl:grid-cols-3">
                {quickFacts.map((fact) => (
                  <div key={fact.label} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-4 text-sm text-slate-700 shadow-[0_25px_70px_-60px_rgb(15_23_42/0.45)]">
                    <span className="mt-1 text-(--color-brand-600)">{fact.icon}</span>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{fact.label}</p>
                      <p className="mt-1 text-sm text-slate-800">{fact.value}</p>
                    </div>
                  </div>
                ))}
              </section>
            ) : null}

            {highlights.length ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-[0_25px_70px_-60px_rgb(15_23_42/0.45)]">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">Trip highlights</h2>
                <p className="mt-1 text-sm text-slate-500">Curated moments travellers mention most</p>
                <ul className="mt-5 space-y-3 text-sm text-slate-600">
                  {highlights.map((item) => (
                    <li key={item} className="flex items-start gap-3 rounded-2xl bg-brand-50/45 px-4 py-3">
                      <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-(--color-brand-500)" />
                      <span>{item}</span>
              </li>
            ))}
                </ul>
              </section>
            ) : null}

            <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-[0_25px_70px_-60px_rgb(15_23_42/0.45)]" id="overview">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">Experience overview</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {travelPackage.description ?? travelPackage.overview}
              </p>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-[0_25px_70px_-60px_rgb(15_23_42/0.45)]">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">What's included</h2>
              <div className="mt-5 grid gap-6 md:grid-cols-2">
          <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-(--color-brand-500)">Included</h3>
                  <ul className="mt-3 space-y-2 text-sm text-slate-600">
                    {inclusionItems.map((item) => (
                      <li key={item} className="flex items-start gap-2 rounded-2xl bg-brand-50/40 px-4 py-3">
                    <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-(--color-brand-500)" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
          </div>
          <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Not included</h3>
                  <ul className="mt-3 space-y-2 text-sm text-slate-600">
                    {exclusionItems.map((item) => (
                      <li key={item} className="flex items-start gap-2 rounded-2xl border border-slate-200 px-4 py-3">
                  <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-red-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
            </section>

            {itineraryItems.length ? (
              <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-[0_25px_70px_-60px_rgb(15_23_42/0.45)]">
                <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">Itinerary</h2>
                <div className="mt-5 space-y-4">
                  {itineraryItems.map((item, index) => (
                    <article
                      key={`${item.day ?? item.title ?? index}`}
                      className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-[0_25px_70px_-60px_rgb(15_23_42/0.45)]"
                    >
                      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-(--color-brand-500)">
                        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-(--color-brand-400)" />
                        {item.day ?? `Day ${index + 1}`}
                      </div>
                      {item.title ? (
                        <h3 className="mt-2 text-lg font-semibold text-slate-900">{item.title}</h3>
                      ) : null}
                      {item.description ? (
                        <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                      ) : null}
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-[0_25px_70px_-60px_rgb(15_23_42/0.45)]">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">Good to know</h2>
              <div className="mt-5 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-(--color-brand-500)">What to bring</h3>
                  <ul className="mt-3 space-y-2 text-sm text-slate-600">
                    {"Comfortable footwear, Sun protection, Government-issued ID".split(",").map((item) => (
                      <li key={item.trim()} className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-(--color-brand-500)" />
                        <span>{item.trim()}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-(--color-brand-500)">Know before you go</h3>
                  <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {essentials.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-(--color-brand-500)" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          </div>
              <div className="mt-5 rounded-2xl border border-slate-200 bg-brand-50/40 px-4 py-3 text-xs text-slate-600">
                Free cancellation up to 24 hours · {travelPackage.ageRestriction ?? "Suitable for travellers 12+ · Accessible on request"}
          </div>
            </section>

            {faqsToRender.length ? (
              <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-[0_25px_70px_-60px_rgb(15_23_42/0.45)]">
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">FAQs</h2>
                <div className="mt-4 space-y-3">
          {faqsToRender.map((faq) => (
                    <details key={faq.question} className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600">
              <summary className="cursor-pointer text-sm font-semibold text-slate-800 transition group-open:text-(--color-brand-600)">
                {faq.question}
              </summary>
                      <p className="mt-3 text-sm leading-relaxed">{faq.answer}</p>
            </details>
          ))}
        </div>
              </section>
            ) : null}

            <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-[0_25px_70px_-60px_rgb(15_23_42/0.45)]">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">Where you'll be</h2>
              <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.2fr),minmax(260px,0.8fr)]">
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <iframe
              title={`Map for ${travelPackage.title}`}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(addressLabel ?? travelPackage.title)}&output=embed`}
              className="h-[200px] sm:h-[240px] w-full border-0"
              loading="lazy"
              allowFullScreen
            />
          </div>
          <div className="space-y-3 text-sm text-slate-600">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-(--color-brand-500)">Address</p>
              <p className="mt-2 text-slate-800">{addressLabel}</p>
            </div>
            {travelPackage.meetingPoint ? (
              <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-(--color-brand-500)">Meeting point</p>
                <p className="mt-2 text-slate-800">{travelPackage.meetingPoint}</p>
              </div>
            ) : null}
            <Link
              href={`https://maps.google.com/?q=${encodeURIComponent(travelPackage.location ?? travelPackage.destination)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-(--color-brand-500) hover:text-(--color-brand-600)"
            >
                    Open in Google Maps
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
            </section>
          </div>

          <aside className="w-full lg:w-[320px] lg:shrink-0 lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto custom-scrollbar-hidden" style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}>
            <div
              id="booking-card"
              className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 md:p-7 text-slate-600 shadow-[0_40px_110px_-75px_rgb(15_23_42/0.55)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">From</span>
                <span className="rounded-full bg-(--color-brand-50) px-3 py-1 text-xs font-semibold text-(--color-brand-600)">
                  {travelPackage.rating.toFixed(1)} ★
                </span>
              </div>
              <div>
                <p className="text-3xl font-semibold text-slate-900">
                  {priceLabel}
                  <span className="ml-1 text-sm font-normal text-slate-500">/ person</span>
                </p>
                {travelPackage.reviews ? (
                  <p className="mt-1.5 text-xs text-slate-500">
                    {travelPackage.reviews ? `${formatNumber(travelPackage.reviews)} reviews` : "Guest favourite"}
                  </p>
                ) : null}
              </div>
              <form onSubmit={handleCheckAvailability} className="space-y-4">
                <div className="block">
                  <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">
                    Travellers
                  </label>
                  <div className="mt-2 w-full rounded-2xl border border-slate-200 bg-white overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setIsTravellersOpen(!isTravellersOpen)}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-slate-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                        </svg>
                        <span className="font-medium">
                          {adults > 0 && `Adult${adults > 1 ? "s" : ""} × ${adults}`}
                          {adults > 0 && children > 0 && ", "}
                          {children > 0 && `Child${children > 1 ? "ren" : ""} × ${children}`}
                          {adults === 0 && children === 0 && "Select travellers"}
                        </span>
                      </div>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={`h-4 w-4 text-slate-400 transition-transform ${isTravellersOpen ? "rotate-180" : ""}`}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                    {isTravellersOpen && (
                      <div className="border-t border-slate-200 bg-slate-50/50 p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">Adult</p>
                            <p className="text-xs text-slate-500">(Age 5-99)</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setAdults(Math.max(1, adults - 1))}
                              disabled={adults <= 1}
                              className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                                adults <= 1
                                  ? "border-slate-200 text-slate-300 cursor-not-allowed"
                                  : "border-(--color-brand-400) text-(--color-brand-600) hover:bg-(--color-brand-50)"
                              }`}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                              </svg>
                            </button>
                            <span className="w-12 text-center text-sm font-semibold text-slate-900">{adults}</span>
                            <button
                              type="button"
                              onClick={() => setAdults(Math.min(10, adults + 1))}
                              disabled={adults >= 10}
                              className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                                adults >= 10
                                  ? "border-slate-200 text-slate-300 cursor-not-allowed"
                                  : "border-(--color-brand-400) text-(--color-brand-600) hover:bg-(--color-brand-50)"
                              }`}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">Child</p>
                            <p className="text-xs text-slate-500">(Age 4 and younger)</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setChildren(Math.max(0, children - 1))}
                              disabled={children <= 0}
                              className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                                children <= 0
                                  ? "border-slate-200 text-slate-300 cursor-not-allowed"
                                  : "border-(--color-brand-400) text-(--color-brand-600) hover:bg-(--color-brand-50)"
                              }`}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                              </svg>
                            </button>
                            <span className="w-12 text-center text-sm font-semibold text-slate-900">{children}</span>
                            <button
                              type="button"
                              onClick={() => setChildren(Math.min(10, children + 1))}
                              disabled={children >= 10}
                              className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                                children >= 10
                                  ? "border-slate-200 text-slate-300 cursor-not-allowed"
                                  : "border-(--color-brand-400) text-(--color-brand-600) hover:bg-(--color-brand-50)"
                              }`}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Select date
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={minSelectableDate}
                    required
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-brand-50"
                  />
                </label>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full bg-(--color-brand-600) px-6 py-3 text-sm font-semibold text-white transition hover:bg-(--color-brand-700) disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Checking..." : "Check availability"}
                </button>
                <p className="text-xs text-slate-500">You won't be charged yet</p>
              </form>

              {/* Availability Status and Action Buttons */}
              {availabilityStatus && (
                <div className="mt-6 space-y-4">
                  <div
                    className={`rounded-2xl border px-4 py-3 ${
                      availabilityStatus.available
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-amber-200 bg-amber-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {availabilityStatus.available ? (
                        <svg
                          className="h-5 w-5 flex-shrink-0 text-emerald-600 mt-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5 flex-shrink-0 text-amber-600 mt-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                      )}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-semibold break-words ${
                            availabilityStatus.available ? "text-emerald-800" : "text-amber-800"
                          }`}
                        >
                          {availabilityStatus.message}
                        </p>
                        {availabilityStatus.capacity && (
                          <div className="mt-2 text-xs text-slate-600 space-y-1">
                            {availabilityStatus.capacity.unlimited ? (
                              <p>Unlimited capacity available</p>
                            ) : (
                              <>
                                {availabilityStatus.capacity.total !== null && (
                                  <p>
                                    Capacity: {availabilityStatus.capacity.available} of{" "}
                                    {availabilityStatus.capacity.total} spots available
                                  </p>
                                )}
                                {availabilityStatus.capacity.booked > 0 && (
                                  <p className="text-slate-500">
                                    {availabilityStatus.capacity.booked} spot(s) already booked
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        )}
                        {availabilityStatus.pricing && (
                          <p className="mt-2 text-sm font-semibold text-slate-900 break-words">
                            Total: {formatCurrency(availabilityStatus.pricing.totalAmount, availabilityStatus.pricing.currency)} for{" "}
                            {adults + children} traveler{adults + children > 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Book Now and Add to Cart Buttons - Only show if available */}
                  {availabilityStatus.available && (
                    <div className="flex flex-col gap-3">
                      <button
                        type="button"
                        onClick={handleBookNow}
                        className="w-full rounded-full bg-(--color-brand-600) px-6 py-3 text-sm font-semibold text-white transition hover:bg-(--color-brand-700)"
                      >
                        Book now
                      </button>
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        className="w-full rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-(--color-brand-300) hover:text-(--color-brand-700)"
                      >
                        Add to cart
                      </button>
                      {cartFeedback && (
                        <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 text-center">
                          {cartFeedback}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3 text-xs text-slate-500">
                <p className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-50 text-(--color-brand-600)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  Free cancellation up to 24 hours in advance
                </p>
                <p className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-50 text-(--color-brand-600)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 11V7m0 8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </span>
                  Reserve now & pay later
                </p>
                <div className="rounded-2xl border border-slate-200 bg-brand-50/40 px-4 py-3 text-xs text-slate-600">
                  Lowest price guarantee · If you find a lower price elsewhere, we'll match it.
                </div>
              </div>
            </div>
          </aside>
        </div>

      {hasSimilarPackages ? (
        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-[0_25px_70px_-60px_rgb(15_23_42/0.45)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-(--color-brand-500)">You may also like</p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-semibold text-slate-900 md:text-4xl">Similar experiences</h2>
            </div>
            <Link
              href={categoryHref ?? "/packages"}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-(--color-brand-300) hover:text-(--color-brand-700)"
            >
              View all
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="mt-7 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {similarPackages.slice(0, 3).map((pkg) => (
              <PackageCard
                key={pkg.slug ?? pkg.id}
                id={pkg.slug ?? pkg.id}
                title={pkg.title}
                destination={pkg.destination}
                duration={pkg.duration}
                price={pkg.price}
                currency="INR"
                category={pkg.category}
                rating={pkg.rating}
                highlights={pkg.highlights}
                image={pkg.image}
                detailPath={`/packages/${pkg.slug ?? pkg.id}`}
              />
            ))}
          </div>
        </section>
      ) : similarError && !similarLoading ? (
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
          {similarError}
        </div>
      ) : null}

        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-[0_25px_70px_-60px_rgb(15_23_42/0.45)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 md:text-4xl">Customer reviews</h2>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-(--color-brand-600)">
                            <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                  <span className="text-lg font-semibold text-slate-900">{travelPackage.rating.toFixed(1)}</span>
                  </div>
                {travelPackage.reviews ? (
                  <span className="text-sm text-slate-600">
                    {travelPackage.reviews ? `${formatNumber(travelPackage.reviews)} reviews` : "Guest favourite"}
                  </span>
                ) : null}
                </div>
              </div>
              </div>

          <div className="mt-8 space-y-6">
            {[
              {
                name: "Sarah Mitchell",
                location: "London, UK",
                rating: 5,
                date: "2 weeks ago",
                comment: "Absolutely fantastic experience! The guide was knowledgeable and the itinerary was perfectly planned. Every detail was taken care of, making it a truly memorable trip.",
              },
              {
                name: "James Anderson",
                location: "New York, USA",
                rating: 5,
                date: "1 month ago",
                comment: "Exceeded all expectations. The attention to detail and personalized service was outstanding. Highly recommend this tour to anyone looking for an authentic experience.",
              },
              {
                name: "Emma Thompson",
                location: "Sydney, Australia",
                rating: 4,
                date: "2 months ago",
                comment: "Great tour with beautiful locations. The guide was friendly and informative. The only minor issue was the timing of one activity, but overall a wonderful experience.",
              },
              {
                name: "Michael Chen",
                location: "Singapore",
                rating: 5,
                date: "3 months ago",
                comment: "Perfect from start to finish. The booking process was smooth, and the actual tour was even better than described. Will definitely book again!",
              },
            ].map((review, index) => (
              <div key={index} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--color-brand-100) text-sm font-semibold text-(--color-brand-600)">
                        {review.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{review.name}</p>
                        <p className="text-xs text-slate-500">{review.location}</p>
              </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg
                            key={i}
                            viewBox="0 0 24 24"
                            fill={i < review.rating ? "currentColor" : "none"}
                            stroke={i < review.rating ? "currentColor" : "currentColor"}
                            className={`h-4 w-4 ${i < review.rating ? "text-(--color-brand-600)" : "text-slate-300"}`}
                          >
                            <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                  ))}
                </div>
                      <span className="text-xs text-slate-500">{review.date}</span>
            </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{review.comment}</p>
                  </div>
                    </div>
                  </div>
                ))}
              </div>

          <div className="mt-8 flex items-center justify-center">
            <button
              type="button"
              className="rounded-full border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-(--color-brand-300) hover:text-(--color-brand-700)"
            >
              View all reviews
            </button>
                  </div>
              </section>
          </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-12px_40px_-28px_rgb(15_23_42/0.3)] lg:hidden">
        <div className="mx-auto flex max-w-[520px] items-center justify-between gap-4">
            <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">From</p>
            <p className="text-lg font-semibold text-slate-900">{priceLabel}</p>
            </div>
          <button
            type="button"
            onClick={scrollToBooking}
            className="flex-1 rounded-full bg-(--color-brand-600) px-6 py-3 text-sm font-semibold text-white transition hover:bg-(--color-brand-700)"
          >
                Check availability
              </button>
            </div>
      </div>

      {isImageModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeImageModal}
        >
          <button
            type="button"
            onClick={closeImageModal}
            className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
            aria-label="Close modal"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
          </button>
          {gallery.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage("prev");
                }}
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
                aria-label="Previous image"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage("next");
                }}
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
                aria-label="Next image"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              </button>
            </>
          )}
          <div
            className="relative h-[90vh] w-full max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={gallery[selectedImageIndex]}
              alt={`${travelPackage.title} - Image ${selectedImageIndex + 1}`}
              fill
              className="rounded-lg object-contain"
              priority
              sizes="90vw"
            />
            {gallery.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm text-white backdrop-blur">
                {selectedImageIndex + 1} / {gallery.length}
        </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


