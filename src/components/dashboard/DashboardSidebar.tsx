"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { clearToken } from "@/utils/auth";

const navItems = [
  { href: "/admin", label: "Overview", icon: "chart-bar" },
  {
    href: "/admin/packages",
    label: "Packages",
    icon: "squares-2x2",
    children: [
      { href: "/admin/packages", label: "All Packages" },
      { href: "/admin/packages/archived", label: "Archived Packages" },
    ],
  },
  { href: "/admin/notifications", label: "Notifications", icon: "bell" },
  {
    href: "/admin/bookings",
    label: "Bookings",
    icon: "calendar-days",
    children: [
      { href: "/admin/bookings", label: "All Bookings" },
      { href: "/admin/bookings?segment=city-tours", label: "Tour Packages" },
      { href: "/admin/bookings?segment=hotel-booking", label: "Hotel Booking" },
      { href: "/admin/bookings?segment=car-rental", label: "Car Rental" },
      { href: "/admin/bookings?segment=airport-transport", label: "Airport Transport" },
    ],
  },
  { href: "/admin/users", label: "Users", icon: "user-circle" },
  { href: "/admin/blogs", label: "Blog", icon: "document-text" },
  { href: "/admin/testimonials", label: "Reviews", icon: "star" },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      // Try to call backend logout endpoint (optional - may fail if backend doesn't have it)
      try {
        await api.logout();
      } catch (error) {
        // Backend logout failed, but continue with client-side logout
        console.warn("Backend logout failed, continuing with client-side logout:", error);
      }
    } catch (error) {
      // Ignore errors - we'll still clear tokens
    } finally {
      // Always clear tokens and redirect
      clearToken("User logout");
      router.push("/admin/login");
      router.refresh();
    }
  };
  const renderIcon = (icon: string) => {
    switch (icon) {
      case "chart-bar":
        return (
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth={1.6}>
            <path d="M4 19.5h16" strokeLinecap="round" />
            <path d="M7 16V8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 16V5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M17 16v-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case "squares-2x2":
        return (
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth={1.6}>
            <rect x="4" y="4" width="7" height="7" rx="1.5" />
            <rect x="13" y="4" width="7" height="7" rx="1.5" />
            <rect x="4" y="13" width="7" height="7" rx="1.5" />
            <rect x="13" y="13" width="7" height="7" rx="1.5" />
          </svg>
        );
      case "calendar-days":
        return (
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth={1.6}>
            <rect x="3.5" y="5" width="17" height="15" rx="2" />
            <path d="M8 3.5V6" strokeLinecap="round" />
            <path d="M16 3.5V6" strokeLinecap="round" />
            <path d="M3.5 9.5h17" strokeLinecap="round" />
            <path d="M8.5 13.5h2" strokeLinecap="round" />
            <path d="M13.5 13.5h2" strokeLinecap="round" />
            <path d="M8.5 17.5h2" strokeLinecap="round" />
            <path d="M13.5 17.5h2" strokeLinecap="round" />
          </svg>
        );
      case "bell":
        return (
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth={1.6}>
            <path
              d="M18 11c0-3.314-2.686-6-6-6s-6 2.686-6 6c0 2.586-.516 4.016-1.268 4.912-.52.617-.78.926-.772 1.201.008.276.286.52.842 1.008C5.14 18.919 5.57 19 6 19h12c.43 0 .86-.081 1.198-.879.556-.488.834-.732.842-1.008.008-.275-.252-.584-.772-1.201C18.516 15.016 18 13.586 18 11Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M10 20a2 2 0 1 0 4 0" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case "archive-box":
        return (
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth={1.6}>
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M3 8h18" strokeLinecap="round" />
            <path d="M8 12h8" strokeLinecap="round" />
          </svg>
        );
      case "document-text":
        return (
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth={1.6}>
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2Z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 2v6h6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 9H8" strokeLinecap="round" />
            <path d="M16 13H8" strokeLinecap="round" />
            <path d="M16 17H8" strokeLinecap="round" />
          </svg>
        );
      case "star":
        return (
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth={1.6}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case "user-circle":
      default:
        return (
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth={1.6}>
            <circle cx="12" cy="8.5" r="3.5" />
            <path d="M5 19c0-3.314 3.134-6 7-6s7 2.686 7 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
    }
  };

  const SidebarInner = () => (
    <>
      <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white/80 px-4 py-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(--color-brand-600) text-base font-semibold text-white">
          <span aria-hidden>AD</span>
          <span className="sr-only">Admin profile avatar</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Admin Profile</p>
          <p className="text-xs text-slate-500">System Administrator</p>
        </div>
      </div>

      <nav className="mt-10 flex-1 space-y-2 overflow-y-auto pb-6">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          const hasChildren = "children" in item && Boolean(item.children?.length);
          const childActive =
            hasChildren &&
            item.children!.some((child) =>
              child.href === "/admin/bookings"
                ? pathname === child.href
                : pathname.startsWith(child.href),
            );
          const userExpanded = openSections[item.href];
          const expanded = hasChildren && ((userExpanded ?? childActive) === true);

          if (!hasChildren) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-(--color-brand-50) text-(--color-brand-700)"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {renderIcon(item.icon)}
                {item.label}
              </Link>
            );
          }

          return (
            <div key={item.href} className="space-y-1">
              <button
                type="button"
                onClick={() =>
                  setOpenSections((prev) => {
                    const current = prev[item.href] ?? childActive;
                    return { ...prev, [item.href]: !current };
                  })
                }
                className={`flex items-center rounded-xl transition ${
                  isActive || expanded
                    ? "bg-(--color-brand-50) text-(--color-brand-700)"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
                aria-expanded={expanded}
                aria-controls={`${item.href}-submenu`}
              >
                <span className="flex flex-1 items-center gap-3 px-4 py-3 text-sm font-semibold">
                  {renderIcon(item.icon)}
                  {item.label}
                </span>
                <span className="mr-3 text-xs text-slate-500" aria-hidden>
                  {expanded ? "▾" : "▸"}
                </span>
                <span className="sr-only">{expanded ? "Collapse" : "Expand"} {item.label}</span>
              </button>
              {expanded ? (
                <nav
                  id={`${item.href}-submenu`}
                  className="ml-9 flex flex-col gap-1 border-l border-slate-200 pl-4 text-sm text-slate-500"
                >
                  {item.children!.map((child) => {
                    // For bookings with query params, check if current URL matches
                    const childIsActive = (() => {
                      if (child.href === "/admin/bookings") {
                        // "All Bookings" is active only if no segment param
                        return pathname === child.href && !searchParams?.get("segment");
                      }
                      // Check if the segment query param matches
                      if (child.href.includes("segment=")) {
                        const segmentMatch = child.href.match(/segment=([^&]+)/);
                        const childSegment = segmentMatch ? segmentMatch[1] : null;
                        const currentSegment = searchParams?.get("segment");
                        return childSegment === currentSegment;
                      }
                      return pathname.startsWith(child.href);
                    })();
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`rounded-lg px-3 py-1.5 transition ${
                          childIsActive
                            ? "bg-(--color-brand-50) text-(--color-brand-600)"
                            : "hover:bg-slate-100 hover:text-slate-700"
                        }`}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </nav>
              ) : null}
            </div>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4 py-5">
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 text-red-600"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="m16 17 5-5-5-5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
        <div className="flex justify-center">
          <img src="/logo.jpg" alt="citymuscattours logo" className="h-14 w-14 rounded-full border border-slate-200 object-cover" />
        </div>
      </div>
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition hover:text-slate-900 lg:hidden"
      >
        <span className="sr-only">Open admin menu</span>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
        </svg>
      </button>

      <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-slate-200 bg-white px-6 py-8 lg:flex">
        <div className="flex h-full flex-col">
          <SidebarInner />
      </div>
    </aside>

      <div
        className={`fixed inset-0 z-50 lg:hidden ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!mobileOpen}
      >
        <div
          className={`absolute inset-0 bg-slate-900/40 transition-opacity ${mobileOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`absolute inset-y-0 left-0 w-72 max-w-[80vw] transform bg-white shadow-2xl transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col px-6 py-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-base font-semibold text-slate-900">Menu</p>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-full border border-slate-200 p-2 text-slate-500 hover:text-slate-900"
              >
                <span className="sr-only">Close menu</span>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path d="M6 6l12 12M6 18 18 6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <SidebarInner />
          </div>
        </div>
      </div>
    </>
  );
}

