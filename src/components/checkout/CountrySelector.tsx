"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// Comprehensive list of countries with country codes
const countries = [
  { name: "Afghanistan", code: "+93", flag: "AF" },
  { name: "Albania", code: "+355", flag: "AL" },
  { name: "Algeria", code: "+213", flag: "DZ" },
  { name: "Argentina", code: "+54", flag: "AR" },
  { name: "Australia", code: "+61", flag: "AU" },
  { name: "Austria", code: "+43", flag: "AT" },
  { name: "Bahrain", code: "+973", flag: "BH" },
  { name: "Bangladesh", code: "+880", flag: "BD" },
  { name: "Belgium", code: "+32", flag: "BE" },
  { name: "Brazil", code: "+55", flag: "BR" },
  { name: "Canada", code: "+1", flag: "CA" },
  { name: "China", code: "+86", flag: "CN" },
  { name: "Denmark", code: "+45", flag: "DK" },
  { name: "Egypt", code: "+20", flag: "EG" },
  { name: "Finland", code: "+358", flag: "FI" },
  { name: "France", code: "+33", flag: "FR" },
  { name: "Germany", code: "+49", flag: "DE" },
  { name: "Greece", code: "+30", flag: "GR" },
  { name: "Hong Kong", code: "+852", flag: "HK" },
  { name: "India", code: "+91", flag: "IN" },
  { name: "Indonesia", code: "+62", flag: "ID" },
  { name: "Iran", code: "+98", flag: "IR" },
  { name: "Iraq", code: "+964", flag: "IQ" },
  { name: "Ireland", code: "+353", flag: "IE" },
  { name: "Israel", code: "+972", flag: "IL" },
  { name: "Italy", code: "+39", flag: "IT" },
  { name: "Japan", code: "+81", flag: "JP" },
  { name: "Jordan", code: "+962", flag: "JO" },
  { name: "Kuwait", code: "+965", flag: "KW" },
  { name: "Lebanon", code: "+961", flag: "LB" },
  { name: "Malaysia", code: "+60", flag: "MY" },
  { name: "Mexico", code: "+52", flag: "MX" },
  { name: "Netherlands", code: "+31", flag: "NL" },
  { name: "New Zealand", code: "+64", flag: "NZ" },
  { name: "Norway", code: "+47", flag: "NO" },
  { name: "Oman", code: "+968", flag: "OM" },
  { name: "Pakistan", code: "+92", flag: "PK" },
  { name: "Philippines", code: "+63", flag: "PH" },
  { name: "Poland", code: "+48", flag: "PL" },
  { name: "Portugal", code: "+351", flag: "PT" },
  { name: "Qatar", code: "+974", flag: "QA" },
  { name: "Russia", code: "+7", flag: "RU" },
  { name: "Saudi Arabia", code: "+966", flag: "SA" },
  { name: "Singapore", code: "+65", flag: "SG" },
  { name: "South Africa", code: "+27", flag: "ZA" },
  { name: "South Korea", code: "+82", flag: "KR" },
  { name: "Spain", code: "+34", flag: "ES" },
  { name: "Sri Lanka", code: "+94", flag: "LK" },
  { name: "Sweden", code: "+46", flag: "SE" },
  { name: "Switzerland", code: "+41", flag: "CH" },
  { name: "Thailand", code: "+66", flag: "TH" },
  { name: "Turkey", code: "+90", flag: "TR" },
  { name: "Ukraine", code: "+380", flag: "UA" },
  { name: "United Arab Emirates", code: "+971", flag: "AE" },
  { name: "United Kingdom", code: "+44", flag: "GB" },
  { name: "United States", code: "+1", flag: "US" },
  { name: "Vietnam", code: "+84", flag: "VN" },
  { name: "Yemen", code: "+967", flag: "YE" },
];

type CountrySelectorProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export default function CountrySelector({ value, onChange, className = "" }: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Parse current value to find selected country
  const selectedCountry = useMemo(() => {
    const match = value.match(/(.+?)\s*\((\+\d+)\)/);
    if (match) {
      return countries.find(
        (c) => c.name === match[1] && c.code === match[2]
      ) || countries.find((c) => c.name === "India");
    }
    return countries.find((c) => c.name === "India") || countries[0];
  }, [value]);

  // Filter countries based on search
  const filteredCountries = useMemo(() => {
    if (!searchTerm.trim()) return countries;
    const search = searchTerm.toLowerCase();
    return countries.filter(
      (country) =>
        country.name.toLowerCase().includes(search) ||
        country.code.includes(search)
    );
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Focus search input when dropdown opens
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (country: typeof countries[0]) => {
    onChange(`${country.name} (${country.code})`);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm text-slate-700 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-brand-50 ${
          isOpen ? "border-(--color-brand-400) ring-2 ring-brand-50" : ""
        }`}
      >
        <div className="flex items-center justify-between">
          <span>{selectedCountry ? `${selectedCountry.name} (${selectedCountry.code})` : "Select country"}</span>
          <svg
            className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-2xl border border-slate-200 bg-white shadow-lg">
          <div className="p-2">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search country or code..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-brand-50"
            />
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar-hidden">
            {filteredCountries.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500 text-center">No countries found</div>
            ) : (
              filteredCountries.map((country) => (
                <button
                  key={`${country.name}-${country.code}`}
                  type="button"
                  onClick={() => handleSelect(country)}
                  className={`w-full px-4 py-2.5 text-left text-sm transition hover:bg-slate-50 ${
                    selectedCountry?.name === country.name && selectedCountry?.code === country.code
                      ? "bg-(--color-brand-50) text-(--color-brand-700)"
                      : "text-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{country.name}</span>
                    <span className="text-xs text-slate-500">{country.code}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

