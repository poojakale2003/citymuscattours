"use client";

import { useState, useEffect, useRef } from "react";
import { categoryPackages } from "@/lib/data";

// Extract unique destinations from packages
const getDestinations = () => {
  const destinations = new Set<string>();
  Object.values(categoryPackages).forEach((packages) => {
    packages.forEach((pkg) => {
      if (pkg.location) {
        destinations.add(pkg.location);
      }
    });
  });
  // Add common destinations
  const commonDestinations = [
    "Muscat, Oman",
    "Dubai, UAE",
    "Abu Dhabi, UAE",
    "Doha, Qatar",
    "Riyadh, Saudi Arabia",
    "Kuwait City, Kuwait",
    "Manama, Bahrain",
    "Istanbul, Turkey",
    "Paris, France",
    "London, UK",
    "Tokyo, Japan",
    "Singapore",
    "Bali, Indonesia",
    "Bangkok, Thailand",
  ];
  commonDestinations.forEach((dest) => destinations.add(dest));
  return Array.from(destinations).sort();
};

const destinations = getDestinations();

type SearchBarProps = {
  onSearch?: (query: { destination: string; dates: string; travelers: { adults: number; children: number } }) => void;
};

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [destination, setDestination] = useState("");
  const [dates, setDates] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [isTravellersOpen, setIsTravellersOpen] = useState(false);
  const [isDestinationOpen, setIsDestinationOpen] = useState(false);
  const [filteredDestinations, setFilteredDestinations] = useState<string[]>([]);
  const travellersRef = useRef<HTMLDivElement>(null);
  const destinationRef = useRef<HTMLDivElement>(null);

  const totalTravelers = adults + children;

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Filter destinations based on input
  useEffect(() => {
    if (destination.trim()) {
      const filtered = destinations.filter((dest) =>
        dest.toLowerCase().includes(destination.toLowerCase())
      );
      setFilteredDestinations(filtered);
    } else {
      setFilteredDestinations([]);
    }
  }, [destination]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (travellersRef.current && !travellersRef.current.contains(event.target as Node)) {
        setIsTravellersOpen(false);
      }
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setIsDestinationOpen(false);
      }
    };

    if (isTravellersOpen || isDestinationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isTravellersOpen, isDestinationOpen]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      destination,
      dates,
      travelers: { adults, children },
    };
    if (onSearch) {
      onSearch(payload);
    } else {
      // Default behavior: filter packages or navigate
      console.log("Search submitted:", payload);
    }
  };

  const handleDestinationSelect = (dest: string) => {
    setDestination(dest);
    setIsDestinationOpen(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-2xl border border-white/40 bg-white/90 p-4 shadow-[0_25px_60px_-35px_rgb(15_23_42_/_0.55)] backdrop-blur-xl sm:rounded-3xl sm:p-5 md:p-6 md:grid-cols-[2fr,1.5fr,1fr,auto]"
    >
      <div ref={destinationRef} className="relative grid gap-1.5 text-xs font-medium text-slate-600 sm:text-sm">
        <label>Destination</label>
        <div className="relative">
        <input
          suppressHydrationWarning
            type="text"
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
            onFocus={() => {
              setFilteredDestinations(
                destination.trim()
                  ? destinations.filter((dest) =>
                      dest.toLowerCase().includes(destination.toLowerCase())
                    )
                  : destinations
              );
              setIsDestinationOpen(destinations.length > 0);
            }}
          placeholder="Where to?"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-brand-400)] focus:ring-[var(--color-brand-200)] sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm"
        />
          {isDestinationOpen && filteredDestinations.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg sm:max-h-60 sm:rounded-2xl">
              {filteredDestinations.map((dest) => (
                <button
                  key={dest}
                  type="button"
                  onClick={() => handleDestinationSelect(dest)}
                  className="w-full px-3 py-2.5 text-left text-xs text-slate-900 hover:bg-slate-50 transition-colors first:rounded-t-xl last:rounded-b-xl sm:px-4 sm:py-3 sm:text-sm sm:first:rounded-t-2xl sm:last:rounded-b-2xl"
                >
                  {dest}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <label className="grid gap-1.5 text-xs font-medium text-slate-600 sm:text-sm">
        Dates
        <input
          type="date"
          suppressHydrationWarning
          value={dates}
          onChange={(event) => setDates(event.target.value)}
          min={getMinDate()}
          placeholder="Select date"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-brand-400)] focus:ring-[var(--color-brand-200)] sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm"
        />
      </label>

      <div ref={travellersRef} className="relative grid gap-1.5 text-xs font-medium text-slate-600 sm:text-sm">
        <label>Travelers</label>
        <div className="relative w-full rounded-xl border border-slate-200 bg-white overflow-visible sm:rounded-2xl">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsTravellersOpen(!isTravellersOpen);
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition rounded-xl sm:px-4 sm:py-3 sm:text-sm sm:rounded-2xl"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 text-slate-600 sm:h-5 sm:w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
              <span className="font-medium truncate">
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
              className={`h-3.5 w-3.5 text-slate-400 transition-transform sm:h-4 sm:w-4 ${isTravellersOpen ? "rotate-180" : ""}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          {isTravellersOpen && (
            <div className="absolute top-full left-0 right-0 z-10 mt-1 border border-slate-200 rounded-xl bg-white shadow-lg p-3 space-y-3 sm:rounded-2xl sm:p-4 sm:space-y-4">
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-900 sm:text-sm">Adult</p>
                  <p className="text-[10px] text-slate-500 sm:text-xs">(Age 5-99)</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    disabled={adults <= 1}
                    className={`flex h-7 w-7 items-center justify-center rounded-full border transition sm:h-8 sm:w-8 ${
                      adults <= 1
                        ? "border-slate-200 text-slate-300 cursor-not-allowed"
                        : "border-[var(--color-brand-400)] text-[var(--color-brand-600)] hover:bg-[var(--color-brand-50)]"
                    }`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5 sm:h-4 sm:w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                    </svg>
                  </button>
                  <span className="w-10 text-center text-xs font-semibold text-slate-900 sm:w-12 sm:text-sm">{adults}</span>
                  <button
                    type="button"
                    onClick={() => setAdults(Math.min(10, adults + 1))}
                    disabled={adults >= 10}
                    className={`flex h-7 w-7 items-center justify-center rounded-full border transition sm:h-8 sm:w-8 ${
                      adults >= 10
                        ? "border-slate-200 text-slate-300 cursor-not-allowed"
                        : "border-[var(--color-brand-400)] text-[var(--color-brand-600)] hover:bg-[var(--color-brand-50)]"
                    }`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5 sm:h-4 sm:w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-900 sm:text-sm">Child</p>
                  <p className="text-[10px] text-slate-500 sm:text-xs">(Age 4 and younger)</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    disabled={children <= 0}
                    className={`flex h-7 w-7 items-center justify-center rounded-full border transition sm:h-8 sm:w-8 ${
                      children <= 0
                        ? "border-slate-200 text-slate-300 cursor-not-allowed"
                        : "border-[var(--color-brand-400)] text-[var(--color-brand-600)] hover:bg-[var(--color-brand-50)]"
                    }`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5 sm:h-4 sm:w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                    </svg>
                  </button>
                  <span className="w-10 text-center text-xs font-semibold text-slate-900 sm:w-12 sm:text-sm">{children}</span>
                  <button
                    type="button"
                    onClick={() => setChildren(Math.min(10, children + 1))}
                    disabled={children >= 10}
                    className={`flex h-7 w-7 items-center justify-center rounded-full border transition sm:h-8 sm:w-8 ${
                      children >= 10
                        ? "border-slate-200 text-slate-300 cursor-not-allowed"
                        : "border-[var(--color-brand-400)] text-[var(--color-brand-600)] hover:bg-[var(--color-brand-50)]"
                    }`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5 sm:h-4 sm:w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        suppressHydrationWarning
        className="w-full self-end rounded-xl bg-[var(--color-secondary-600)] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_20px_40px_-20px_rgb(244_114_182_/_0.7)] transition hover:bg-[var(--color-secondary-700)] sm:w-auto sm:rounded-2xl sm:px-6 sm:py-3 sm:text-sm"
      >
        Search Trips
      </button>
    </form>
  );
}

