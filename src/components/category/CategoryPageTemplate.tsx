"use client";

import Link from "next/link";
import { ReactNode, createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import NewsletterSignup from "./NewsletterSignup";
import { formatNumber } from "@/lib/numbers";
import { displayCurrencyCode } from "@/lib/currency";

const FilteredPackagesContext = createContext<{
  filteredPackageIds: string[];
}>({ filteredPackageIds: [] });

export const useFilteredPackages = () => useContext(FilteredPackagesContext);

type FilterSectionProps = {
  title: string;
  actionLabel?: string;
  children: ReactNode;
};

function FilterSection({ title, actionLabel, children }: FilterSectionProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:rounded-2xl sm:p-5">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 sm:text-sm sm:tracking-[0.25em]">{title}</h3>
        </div>
        {actionLabel ? (
          <button
            type="button"
            className="text-xs font-semibold text-(--color-brand-600) transition hover:text-(--color-brand-700)"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
      <div className="mt-3 space-y-2 sm:mt-4 sm:space-y-3">{children}</div>
    </section>
  );
}
import { useWishlist } from "@/components/providers/WishlistProvider";

type CategoryPackage = {
  id: string;
  slug?: string;
  detailPath?: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  image: string;
  perks: string[];
  rating?: number;
};

type CategoryPageTemplateProps = {
  packages?: CategoryPackage[];
  children?: ReactNode;
  compact?: boolean;
  title?: string;
  subtitle?: string;
  description?: string;
  heroImage?: string;
  ctaHref?: string;
  filteredPackages?: CategoryPackage[];
  activeFilter?: string;
};

export default function CategoryPageTemplate({ packages = [], children, compact = false, filteredPackages: externalFilteredPackages, activeFilter: externalActiveFilter }: CategoryPageTemplateProps) {
  const { toggleItem, isWishlisted } = useWishlist();
  const filterOptions = [
    "Dates",
    "Day trips",
    "Private tours",
    "Classical concerts & operas",
    "Boat cruises",
    "Walking tours",
    "Desert safaris",
    "Night tours",
    "Snorkeling",
    "Multi-day",
    "Culture & history",
    "For kids",
    "Dolphins & whales",
    "Deals & discounts",
    "Nature",
    "Food & drink",
  ];
  const [activeFilter, setActiveFilter] = useState<string>(filterOptions[0]);

  // Advanced filter states
  const [selectedTime, setSelectedTime] = useState<string[]>([]);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  // Filter packages based on active filter and advanced filters
  const filteredPackages = useMemo(() => {
    let filtered = packages;

    // Apply quick filter (top buttons)
    if (activeFilter !== "Dates" && activeFilter) {
      const filterLower = activeFilter.toLowerCase();
      
      filtered = filtered.filter((pkg) => {
        const titleLower = pkg.title.toLowerCase();
        const descriptionLower = pkg.description.toLowerCase();
        const perksLower = pkg.perks.join(" ").toLowerCase();
        const durationLower = pkg.duration.toLowerCase();
        const searchText = `${titleLower} ${descriptionLower} ${perksLower} ${durationLower}`;

        // Map filter options to keywords
        const filterKeywords: Record<string, string[]> = {
          "day trips": ["day", "half day", "full day", "day trip", "1 day"],
          "private tours": ["private", "exclusive", "personalized", "custom"],
          "classical concerts & operas": ["concert", "opera", "classical", "music", "performance"],
          "boat cruises": ["boat", "cruise", "sailing", "yacht", "water", "marine"],
          "walking tours": ["walking", "walk", "stroll", "pedestrian", "on foot"],
          "desert safaris": ["desert", "safari", "dune", "sand", "bedouin"],
          "night tours": ["night", "evening", "sunset", "nocturnal", "after dark"],
          "snorkeling": ["snorkel", "snorkeling", "diving", "underwater", "marine life"],
          "multi-day": ["2 day", "3 day", "4 day", "5 day", "multi", "multiple", "days", "overnight"],
          "culture & history": ["culture", "cultural", "history", "historical", "heritage", "tradition", "museum"],
          "for kids": ["kid", "child", "family", "children", "family-friendly"],
          "dolphins & whales": ["dolphin", "whale", "marine", "sea life", "ocean"],
          "deals & discounts": ["deal", "discount", "offer", "special", "promotion", "sale"],
          "nature": ["nature", "natural", "wildlife", "park", "forest", "mountain", "outdoor"],
          "food & drink": ["food", "culinary", "dining", "restaurant", "taste", "cuisine", "drink", "beverage"],
        };

        const keywords = filterKeywords[filterLower];
        if (keywords) {
          return keywords.some((keyword) => searchText.includes(keyword));
        }

        return searchText.includes(filterLower);
      });
    }

    // Apply price range filter
    if (minPrice || maxPrice) {
      filtered = filtered.filter((pkg) => {
        const price = pkg.price;
        const min = minPrice ? parseFloat(minPrice) : 0;
        const max = maxPrice ? parseFloat(maxPrice) : Infinity;
        return price >= min && price <= max;
      });
    }

    // Apply duration filter
    if (selectedDurations.length > 0) {
      filtered = filtered.filter((pkg) => {
        const duration = pkg.duration.toLowerCase();
        return selectedDurations.some((dur) => {
          if (dur === "0-3 hours") return /^[0-2]\.?\d*\s*h/i.test(duration) || /^[0-2]\s*h/i.test(duration);
          if (dur === "3-5 hours") return /[3-4]\.?\d*\s*h/i.test(duration) || /^5\s*h/i.test(duration);
          if (dur === "5-7 hours") return /[5-6]\.?\d*\s*h/i.test(duration) || /^7\s*h/i.test(duration);
          if (dur === "Full day (7+ hours)") return /7\+|full\s*day|8\+|9\+|10\+/i.test(duration);
          if (dur === "2 days") return /2\s*day/i.test(duration);
          if (dur === "3 days") return /3\s*day/i.test(duration);
          if (dur === "4 days") return /4\s*day/i.test(duration);
          if (dur === "5+ days") return /5\+|6\+|7\+|multi/i.test(duration);
          return false;
        });
      });
    }

    // Apply service filters
    if (selectedServices.length > 0) {
      filtered = filtered.filter((pkg) => {
        const searchText = `${pkg.title} ${pkg.description} ${pkg.perks.join(" ")} ${pkg.duration}`.toLowerCase();
        return selectedServices.some((service) => {
          const serviceLower = service.toLowerCase();
          if (serviceLower.includes("hotel pickup")) return searchText.includes("pickup") || searchText.includes("hotel");
          if (serviceLower.includes("private")) return searchText.includes("private");
          if (serviceLower.includes("small group")) return searchText.includes("small group");
          if (serviceLower.includes("wheelchair")) return searchText.includes("wheelchair") || searchText.includes("accessible");
          if (serviceLower.includes("skip")) return searchText.includes("skip") || searchText.includes("line");
          return searchText.includes(serviceLower);
        });
      });
    }

    // Apply rating filter
    if (selectedRatings.length > 0) {
      filtered = filtered.filter((pkg) => {
        const rating = pkg.rating || 0;
        return selectedRatings.some((ratingFilter) => {
          const minRating = parseFloat(ratingFilter.replace("+", ""));
          return rating >= minRating;
        });
      });
    }

    // Apply interest filters
    if (selectedInterests.length > 0) {
      filtered = filtered.filter((pkg) => {
        const searchText = `${pkg.title} ${pkg.description} ${pkg.perks.join(" ")}`.toLowerCase();
        return selectedInterests.some((interest) => {
          const interestLower = interest.toLowerCase();
          if (interestLower.includes("nature")) return searchText.includes("nature") || searchText.includes("natural") || searchText.includes("wildlife");
          if (interestLower.includes("culture")) return searchText.includes("culture") || searchText.includes("cultural") || searchText.includes("heritage");
          if (interestLower.includes("water")) return searchText.includes("water") || searchText.includes("marine") || searchText.includes("ocean") || searchText.includes("beach");
          if (interestLower.includes("animal")) return searchText.includes("animal") || searchText.includes("wildlife") || searchText.includes("dolphin") || searchText.includes("whale");
          if (interestLower.includes("architecture")) return searchText.includes("architecture") || searchText.includes("palace") || searchText.includes("mosque") || searchText.includes("fort");
          if (interestLower.includes("outdoor")) return searchText.includes("outdoor") || searchText.includes("adventure") || searchText.includes("hiking");
          if (interestLower.includes("sightseeing")) return searchText.includes("sightseeing") || searchText.includes("tour") || searchText.includes("city");
          return searchText.includes(interestLower);
        });
      });
    }

    // Apply category filters
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((pkg) => {
        const searchText = `${pkg.title} ${pkg.description} ${pkg.perks.join(" ")} ${pkg.duration}`.toLowerCase();
        return selectedCategories.some((category) => {
          const categoryLower = category.toLowerCase();
          if (categoryLower.includes("water")) return searchText.includes("water") || searchText.includes("snorkel") || searchText.includes("boat") || searchText.includes("cruise");
          if (categoryLower.includes("adventure")) return searchText.includes("adventure") || searchText.includes("desert") || searchText.includes("safari") || searchText.includes("4x4");
          if (categoryLower.includes("guided")) return searchText.includes("guided") || searchText.includes("guide");
          if (categoryLower.includes("private")) return searchText.includes("private");
          if (categoryLower.includes("day trip")) return searchText.includes("day") && !searchText.includes("multi");
          if (categoryLower.includes("hop-on")) return searchText.includes("hop") || searchText.includes("bus");
          if (categoryLower.includes("transfer")) return searchText.includes("transfer") || searchText.includes("airport") || searchText.includes("pickup");
          return searchText.includes(categoryLower);
        });
      });
    }

    // Apply destination filters
    if (selectedDestinations.length > 0) {
      filtered = filtered.filter((pkg) => {
        const searchText = `${pkg.title} ${pkg.description} ${pkg.perks.join(" ")}`.toLowerCase();
        return selectedDestinations.some((destination) => {
          const destLower = destination.toLowerCase();
          return searchText.includes(destLower) || searchText.includes(destLower.replace(" ", ""));
        });
      });
    }

    return filtered;
  }, [packages, activeFilter, minPrice, maxPrice, selectedDurations, selectedServices, selectedRatings, selectedInterests, selectedCategories, selectedDestinations]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const timeFilters = [
    { label: "In the morning, 8 AM-12 PM", value: "morning" },
    { label: "In the afternoon, 12 PM-5 PM", value: "afternoon" },
    { label: "In the evening, 5 PM-12 AM", value: "evening" },
  ];

  const destinationFilters = [
    "Sultan Qaboos Grand Mosque",
    "Al Alam Palace",
    "Muttrah Souk",
    "Royal Opera House Muscat",
    "Nizwa Fort",
    "Wadi Shab",
    "Wādī Banī Khālid",
    "Bait Al Zubair Museum",
  ];

  const interestFilters = [
    "Nature spots",
    "Local culture",
    "Water activities",
    "Water sports",
    "Animal activities",
    "Architecture",
    "Outdoor recreation",
    "City sightseeing",
  ];

  const categoryFilters = [
    "Water activities",
    "Adventures",
    "Guided tours",
    "Private tours",
    "Day trips",
    "Hop-on hop-off tours",
    "Transfers",
    "Other experiences",
  ];

  const languageFilters = ["English", "Arabic", "French", "German", "Hindi", "Italian", "Russian", "Spanish"];

  const durationFilters = [
    "0-3 hours",
    "3-5 hours",
    "5-7 hours",
    "Full day (7+ hours)",
    "2 days",
    "3 days",
    "4 days",
    "5+ days",
  ];

  const serviceFilters = ["Hotel pickup possible", "Private tour", "Small group", "Wheelchair accessible", "Skip the line"];

  const starRatingFilters = ["3.0+", "3.5+", "4.0+", "4.5+"];

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) {
      return;
    }
    const updateScrollState = () => {
      setCanScrollLeft(scrollContainer.scrollLeft > 0);
      setCanScrollRight(scrollContainer.scrollLeft + scrollContainer.clientWidth < scrollContainer.scrollWidth - 1);
    };
    updateScrollState();
    scrollContainer.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);
    return () => {
      scrollContainer.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  const scrollFilters = (direction: "left" | "right") => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) {
      return;
    }
    const scrollAmount = direction === "left" ? -scrollContainer.clientWidth : scrollContainer.clientWidth;
    scrollContainer.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const handleFilterToggle = (
    value: string,
    selected: string[],
    setSelected: (value: string[]) => void
  ) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((item) => item !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const handleResetFilters = () => {
    setSelectedTime([]);
    setSelectedDestinations([]);
    setSelectedInterests([]);
    setSelectedCategories([]);
    setSelectedLanguages([]);
    setSelectedDurations([]);
    setSelectedServices([]);
    setSelectedRatings([]);
    setMinPrice("");
    setMaxPrice("");
    setActiveFilter("Dates");
  };

  const handleApplyFilters = () => {
    setIsFilterOpen(false);
  };

  // Only pass filtered IDs if filters are actually applied (i.e., filteredPackages differs from packages)
  const filteredPackageIds = useMemo(() => {
    // If no packages provided, return empty array
    if (packages.length === 0) return [];
    
    // Check if filters are active by comparing lengths and IDs
    const packageIds = new Set(packages.map((pkg) => pkg.id));
    const filteredIds = new Set(filteredPackages.map((pkg) => pkg.id));
    
    // If all packages are in filtered results and vice versa, no filters are active
    const allPackagesInFiltered = packages.length === filteredPackages.length && 
      packages.every((pkg) => filteredIds.has(pkg.id));
    const allFilteredInPackages = filteredPackages.every((pkg) => packageIds.has(pkg.id));
    
    // If filters are not active, return empty array (show all packages)
    if (allPackagesInFiltered && allFilteredInPackages) {
      return [];
    }
    
    // Otherwise, return filtered IDs
    return Array.from(filteredIds);
  }, [packages, filteredPackages]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({ filteredPackageIds }), [filteredPackageIds]);

  return (
    <FilteredPackagesContext.Provider value={contextValue}>
      <section className="border-y border-slate-200 bg-white/70 backdrop-blur">
        <div
          className={`mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 md:px-8 lg:flex-row lg:items-center lg:justify-between lg:gap-2 lg:px-12 ${
            compact ? "py-2!" : ""
          }`}
        >
          <div className="relative w-full lg:max-w-4xl">
            {canScrollLeft ? (
              <button
                type="button"
                aria-label="Scroll filters left"
                onClick={() => scrollFilters("left")}
                className="absolute left-0 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-800 sm:flex md:h-10 md:w-10"
              >
                &lt;
              </button>
            ) : null}

            <div className="overflow-hidden px-8 sm:px-6 md:px-8">
              <div
                ref={scrollContainerRef}
                className="custom-scrollbar-hidden flex gap-2 overflow-x-auto scroll-smooth py-1 sm:gap-3"
                role="tablist"
                aria-label="Category options"
              >
                {filterOptions.map((option) => {
                  const isActive = option === activeFilter;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setActiveFilter(option)}
                      aria-pressed={isActive}
                      className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:py-2 sm:text-sm ${
                        isActive
                          ? "border-(--color-brand-300) bg-(--color-brand-50) text-(--color-brand-700) shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            {canScrollRight ? (
              <button
                type="button"
                aria-label="Scroll filters right"
                onClick={() => scrollFilters("right")}
                className="absolute right-0 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-800 sm:flex md:h-10 md:w-10"
              >
                &gt;
              </button>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 sm:w-auto sm:px-5 sm:py-3 sm:text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 sm:h-4 sm:w-4">
              <path
                fillRule="evenodd"
                d="M3 4.75A1.75 1.75 0 0 1 4.75 3h10.5A1.75 1.75 0 0 1 17 4.75v.878a1.75 1.75 0 0 1-.513 1.237l-3.343 3.343a1.75 1.75 0 0 0-.513 1.237v1.832l-2.438 1.626a1 1 0 0 1-1.554-.832v-2.626a1.75 1.75 0 0 0-.513-1.237L3.513 6.865A1.75 1.75 0 0 1 3 5.628v-.878Z"
                clipRule="evenodd"
              />
            </svg>
            Filters
          </button>
        </div>
      </section>

      {isFilterOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6"
        >
          <div className="relative flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-[0_30px_90px_-40px_rgb(15_23_42/0.6)] sm:max-h-[92vh] sm:rounded-3xl">
            <header className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Filters</h2>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">Refine experiences to match the perfect itinerary.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="self-start rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-800 sm:self-auto"
              >
                Close
              </button>
            </header>

            <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
              <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
                <FilterSection title="Time">
                  <div className="space-y-3">
                    {timeFilters.map((item) => (
                      <label key={item.value} className="flex items-center gap-3 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          checked={selectedTime.includes(item.value)}
                          onChange={() => handleFilterToggle(item.value, selectedTime, setSelectedTime)}
                          className="rounded border-slate-300 text-(--color-brand-600)"
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection title="Destinations" actionLabel="Show more destinations">
                  <div className="grid gap-3">
                    {destinationFilters.map((item) => (
                      <label key={item} className="flex items-center gap-3 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          checked={selectedDestinations.includes(item)}
                          onChange={() => handleFilterToggle(item, selectedDestinations, setSelectedDestinations)}
                          className="rounded border-slate-300 text-(--color-brand-600)"
                        />
                        {item}
                      </label>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection title="Interests" actionLabel="Show more interests">
                  <div className="grid gap-3">
                    {interestFilters.map((item) => (
                      <label key={item} className="flex items-center gap-3 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          checked={selectedInterests.includes(item)}
                          onChange={() => handleFilterToggle(item, selectedInterests, setSelectedInterests)}
                          className="rounded border-slate-300 text-(--color-brand-600)"
                        />
                        {item}
                      </label>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection title="Categories" actionLabel="Show more categories">
                  <div className="grid gap-3">
                    {categoryFilters.map((item) => (
                      <label key={item} className="flex items-center gap-3 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(item)}
                          onChange={() => handleFilterToggle(item, selectedCategories, setSelectedCategories)}
                          className="rounded border-slate-300 text-(--color-brand-600)"
                        />
                        {item}
                      </label>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection title="Price">
                  <div className="space-y-4 text-sm text-slate-600">
                    <div className="grid gap-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Min. price</label>
                      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2">
                        <span className="text-slate-400">{displayCurrencyCode}</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          className="w-full bg-transparent text-sm text-slate-700 outline-none"
                          placeholder="762"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Max. price</label>
                      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2">
                        <span className="text-slate-400">{displayCurrencyCode}</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          className="w-full bg-transparent text-sm text-slate-700 outline-none"
                          placeholder="399683"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">Displayed in OMR</p>
                  </div>
                </FilterSection>

                <FilterSection title="Languages" actionLabel="Show more languages">
                  <div className="grid gap-3">
                    {languageFilters.map((item) => (
                      <label key={item} className="flex items-center gap-3 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          checked={selectedLanguages.includes(item)}
                          onChange={() => handleFilterToggle(item, selectedLanguages, setSelectedLanguages)}
                          className="rounded border-slate-300 text-(--color-brand-600)"
                        />
                        {item}
                      </label>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection title="Duration">
                  <div className="grid gap-3">
                    {durationFilters.map((item) => (
                      <label key={item} className="flex items-center gap-3 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          checked={selectedDurations.includes(item)}
                          onChange={() => handleFilterToggle(item, selectedDurations, setSelectedDurations)}
                          className="rounded border-slate-300 text-(--color-brand-600)"
                        />
                        {item}
                      </label>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection title="Services">
                  <div className="grid gap-3">
                    {serviceFilters.map((item) => (
                      <label key={item} className="flex items-center gap-3 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(item)}
                          onChange={() => handleFilterToggle(item, selectedServices, setSelectedServices)}
                          className="rounded border-slate-300 text-(--color-brand-600)"
                        />
                        {item}
                      </label>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection title="Star rating">
                  <div className="grid gap-3">
                    {starRatingFilters.map((item) => (
                      <label key={item} className="flex items-center gap-3 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          checked={selectedRatings.includes(item)}
                          onChange={() => handleFilterToggle(item, selectedRatings, setSelectedRatings)}
                          className="rounded border-slate-300 text-(--color-brand-600)"
                        />
                        {item}
                      </label>
                    ))}
                  </div>
                </FilterSection>
              </div>
            </div>

            <footer className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
              <div className="inline-flex flex-col gap-2 sm:flex-row sm:gap-3">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="w-full rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 sm:w-auto sm:text-sm"
                >
                  Reset all
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleResetFilters();
                    setIsFilterOpen(false);
                  }}
                  className="w-full rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 sm:w-auto sm:text-sm"
                >
                  Clear
                </button>
              </div>
              <button
                type="button"
                onClick={handleApplyFilters}
                className="w-full inline-flex items-center justify-center rounded-full bg-(--color-brand-600) px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-(--color-brand-700) sm:w-auto sm:py-3 sm:text-sm"
              >
                Show results
              </button>
            </footer>
          </div>
        </div>
      ) : null}

      {packages.length > 0 && !compact && (
        <section className={`relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12 ${compact ? "pt-0 pb-10" : "pt-0 pb-12"}`}>
          <div className={`space-y-2 ${compact ? "mt-0!" : ""}`}>
            <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
              Signature Packages
            </h2>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-(--color-brand-500)">
              Viewing: {activeFilter} {filteredPackages.length !== packages.length && `(${filteredPackages.length} of ${packages.length})`}
            </p>
            <p className="max-w-2xl text-base text-slate-600">
              Explore curated experiences, each customizable with private upgrades,
              concierge services, and exclusive access.
            </p>
          </div>

          {filteredPackages.length > 0 ? (
            <div className="mt-6 grid gap-8 md:grid-cols-2">
              {filteredPackages.map((travelPackage) => {
              const liked = isWishlisted(travelPackage.id);
              const detailHref = travelPackage.detailPath ?? `/packages/${travelPackage.slug ?? travelPackage.id}`;
              return (
              <article
                key={travelPackage.id}
                className="group grid overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-[0_35px_85px_-45px_rgb(15_23_42/0.6)] transition hover:-translate-y-1 md:grid-cols-[0.45fr,0.55fr]"
              >
                <div className="relative h-64 md:h-full">
                  <img
                    src={travelPackage.image}
                    alt={travelPackage.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      toggleItem({
                        id: travelPackage.id,
                        title: travelPackage.title,
                        destination: travelPackage.title,
                        duration: travelPackage.duration,
                        price: travelPackage.price,
                        rating: 4.8,
                        highlights: travelPackage.perks,
                        image: travelPackage.image,
                        detailPath: detailHref,
                      })
                    }
                    aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
                    aria-pressed={liked}
                    className={`absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border shadow-[0_20px_40px_-25px_rgb(15_23_42/0.65)] transition hover:scale-110 ${
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
                      strokeWidth={1.7}
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 20.5 3.5 12a6 6 0 0 1 0-8.5 6 6 0 0 1 8.5 0l.5.5.5-.5a6 6 0 0 1 8.5 0 6 6 0 0 1 0 8.5L12 20.5Z"
                      />
                    </svg>
                  </button>
                </div>
                <div className="flex flex-col justify-between gap-6 p-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-(--color-brand-500)">
                      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-(--color-brand-400)" />
                      citymuscattours Curated
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-semibold text-slate-900">
                        {travelPackage.title}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {travelPackage.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      {travelPackage.perks.map((perk) => (
                        <span
                          key={perk}
                          className="rounded-full border border-slate-200 px-3 py-1 transition hover:border-(--color-brand-200) hover:text-slate-700"
                        >
                          {perk}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-3 border-t border-slate-200 pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
                    <span>
                      <span className="text-xl font-semibold text-slate-900">
                        ${formatNumber(travelPackage.price)}
                      </span>{" "}
                      <span className="text-xs">· {travelPackage.duration}</span>
                    </span>
                    <div className="flex gap-3">
                      <Link
                        href={detailHref}
                        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                      >
                        View details
                      </Link>
                      <Link
                        href="/booking"
                        className="rounded-full bg-(--color-brand-600) px-5 py-2 text-sm font-semibold text-white transition hover:bg-(--color-brand-700)"
                      >
                        Book now
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
            </div>
          ) : (
            <div className="mt-10 flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-12 w-12 text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172-1.025 3.072-1.025 4.243 0 1.174 1.025 1.174 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
              </svg>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900">No packages found</h3>
                <p className="text-sm text-slate-600">
                  No packages match the filter "{activeFilter}". Try selecting a different option.
                </p>
              </div>
            </div>
          )}
        </section>
      )}

      {children}

      <NewsletterSignup />
    </FilteredPackagesContext.Provider>
  );
}

