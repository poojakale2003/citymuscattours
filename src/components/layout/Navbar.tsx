'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Logo from "@/components/shared/Logo";
import { getAllPackages, formatCurrency } from "@/lib/packages";

type SearchResult = {
  id: string;
  title: string;
  location: string;
  category: string;
  href: string;
  image: string;
  priceLabel: string;
};

const SEARCH_INDEX: SearchResult[] = getAllPackages().map((pkg) => ({
  id: pkg.id,
  title: pkg.title,
  location: pkg.location ?? pkg.destination ?? "",
  category: pkg.categoryTitle,
  href: pkg.detailPath,
  image: pkg.image,
  priceLabel: formatCurrency(pkg.price, pkg.currency),
}));

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/city-tours", label: "Tour Packages" },
  { href: "/car-rental", label: "Car Rental" },
  { href: "/airport-transport", label: "Airport Transport" },
  { href: "/hotel-booking", label: "Hotel Booking" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedQuery(searchTerm.trim().toLowerCase());
    }, 150);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  const handleToggle = () => setOpen((prev) => !prev);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const suggestionMatches =
    debouncedQuery.length === 0
      ? []
      : SEARCH_INDEX.filter(
          (item) =>
            item.title.toLowerCase().includes(debouncedQuery) ||
            item.location.toLowerCase().includes(debouncedQuery) ||
            item.category.toLowerCase().includes(debouncedQuery),
        ).slice(0, 6);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchTerm.trim();
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
    setShowSuggestions(false);
  };

  const handleSuggestionSelect = (href: string) => {
    setSearchTerm("");
    setShowSuggestions(false);
    router.push(href);
  };

  const handleMobileSuggestionSelect = (href: string) => {
    handleSuggestionSelect(href);
    setMobileSearchOpen(false);
  };

  const handleInputFocus = () => {
    if (suggestionMatches.length > 0) setShowSuggestions(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowSuggestions(false), 120);
  };

  return (
    <header className={`sticky top-0 z-50 border-b transition-all duration-300 ${
      scrolled 
        ? "border-slate-200 bg-white/95 backdrop-blur-xl shadow-sm" 
        : "border-slate-200/70 bg-white/90 backdrop-blur-xl"
    }`}>
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center gap-4 lg:gap-8">
          <Link 
            href="/" 
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
            aria-label="Home"
          >
            <Logo />
          </Link>
          <div className="relative hidden w-full max-w-sm lg:flex">
            <form
              onSubmit={handleSearch}
              className="flex w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm"
            >
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Find places and things to do"
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                className="w-full border-none bg-transparent text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-0"
              />
              <button
                type="submit"
                className="flex h-8 w-8 items-center justify-center text-slate-500 transition hover:text-slate-700"
                aria-label="Search"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </button>
            </form>
            {showSuggestions && suggestionMatches.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-slate-200 bg-white shadow-2xl">
                {suggestionMatches.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onMouseDown={() => handleSuggestionSelect(item.href)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50"
                  >
                    <div className="h-10 w-14 overflow-hidden rounded-lg bg-slate-100">
                      <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500">
                        {item.location} · {item.category}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{item.priceLabel}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onMouseDown={() =>
                    router.push(
                      searchTerm.trim()
                        ? `/search?q=${encodeURIComponent(searchTerm.trim())}`
                        : "/search",
                    )
                  }
                  className="w-full rounded-b-2xl border-t border-slate-100 px-4 py-2 text-xs font-semibold text-(--color-brand-600) hover:bg-(--color-brand-50)"
                >
                  View all results
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          <nav className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className={`relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    isActive 
                      ? "bg-(--color-brand-600) text-white shadow-md shadow-(--color-brand-600)/20" 
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-0.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-white/50" />
                  )}
                </Link>
              );
            })}
          </nav>
          <Link
            href="/booking"
            className="rounded-lg bg-(--color-brand-600) px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-(--color-brand-600)/25 transition-all duration-200 hover:bg-(--color-brand-700) hover:shadow-lg hover:shadow-(--color-brand-600)/30"
          >
            Book Now
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => {
              setMobileSearchOpen(true);
              setShowSuggestions(false);
            }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            aria-label="Open search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleToggle}
            className={`relative inline-flex h-10 w-10 items-center justify-center rounded-lg border transition-all duration-200 ${
              open 
                ? "border-slate-300 bg-slate-100 text-slate-900" 
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <span className="sr-only">{open ? "Close navigation" : "Open navigation"}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-5 w-5 transition-transform duration-200"
            >
              {open ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden">
          <div className="border-t border-slate-200 bg-white px-4 pb-6 pt-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-1.5">
              {NAV_LINKS.map((link, index) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                      isActive 
                        ? "bg-(--color-brand-50) text-(--color-brand-700) shadow-sm" 
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <span className="h-4 w-4" />
                    <span className="flex-1">{link.label}</span>
                    {isActive && (
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth={2.5}
                        className="h-4 w-4 text-(--color-brand-600)"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    )}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-6 flex flex-col gap-2.5 border-t border-slate-100 pt-6">
              <Link
                href="/booking"
                className="rounded-lg bg-(--color-brand-600) px-5 py-3 text-center text-sm font-semibold text-white shadow-md shadow-(--color-brand-600)/25 transition-all duration-200 hover:bg-(--color-brand-700) hover:shadow-lg"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      )}

      {mobileSearchOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm lg:hidden">
          <div className="absolute inset-x-0 top-16 mx-auto w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Search experiences</h2>
              <button
                type="button"
                onClick={() => {
                  setMobileSearchOpen(false);
                  setShowSuggestions(false);
                }}
                className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:text-slate-800"
                aria-label="Close search"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <form
              onSubmit={(event) => {
                handleSearch(event);
                setMobileSearchOpen(false);
              }}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2"
            >
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search destinations, tours, or transfers"
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                className="flex-1 border-none bg-transparent text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-0"
              />
              <button
                type="submit"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--color-brand-600) text-white transition hover:bg-(--color-brand-700)"
                aria-label="Search"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </button>
            </form>
            {showSuggestions && suggestionMatches.length > 0 && (
              <div className="mt-3 max-h-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-lg">
                {suggestionMatches.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onMouseDown={() => handleMobileSuggestionSelect(item.href)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50"
                  >
                    <div className="h-10 w-14 overflow-hidden rounded-lg bg-slate-100">
                      <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500">
                        {item.location} · {item.category}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{item.priceLabel}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onMouseDown={() => {
                    router.push(
                      searchTerm.trim()
                        ? `/search?q=${encodeURIComponent(searchTerm.trim())}`
                        : "/search",
                    );
                    setMobileSearchOpen(false);
                  }}
                  className="w-full rounded-b-2xl border-t border-slate-100 px-4 py-2 text-xs font-semibold text-(--color-brand-600) hover:bg-(--color-brand-50)"
                >
                  View all results
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

