"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CategoryBookingsPanel from "@/components/dashboard/CategoryBookingsPanel";
import { api } from "@/lib/api";
import { formatNumber } from "@/lib/numbers";
import { buildPackageImage } from "@/utils/packageTransformers";
import { formatDisplayCurrency } from "@/lib/currency";

type PackageRecord = {
  id: number | string;
  name: string;
  category?: string;
  destination?: string;
  price?: number | string;
  offer_price?: number | string;
  total_people_allotted?: number | string;
  created_at?: string;
  updated_at?: string;
  start_date?: string;
  end_date?: string;
  is_featured?: boolean | number | string;
  feature_image?: string | null;
};

type CategoryBookingRecord = {
  id: string;
  traveler: string;
  package: string;
  status: string;
  amount: string;
  date: string;
  dateValue?: number; // Internal property for sorting
};

const colorPalette = ["#0BA5EC", "#6366F1", "#10B981", "#F97316", "#EC4899", "#22D3EE"];
const fallbackImage =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop&auto=format&q=80";

const dateFormatter = new Intl.DateTimeFormat("en-OM", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const formatCurrency = (value: number) => formatDisplayCurrency(value, "INR");

const toNumber = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const toBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") return ["1", "true", "yes"].includes(value.toLowerCase());
  return false;
};

const formatDate = (value?: string | null): string => {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return dateFormatter.format(date);
};

type BookingData = {
  id: number;
  package_name?: string;
  package_category?: string;
  contact_email?: string;
  contact_phone?: string;
  date?: string;
  travelers?: number;
  adults?: number;
  children?: number;
  total_amount?: number;
  status?: string;
  payment_status?: string;
  created_at?: string;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<PackageRecord[]>([]);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch packages
        const packagesResponse = await api.getPackages({ limit: 200 });
        if (!isMounted) return;
        setPackages(packagesResponse.data ?? []);
        
        // Fetch bookings - get all for admin dashboard
        try {
          const bookingsResponse = await api.getBookings({ all: true });
          if (!isMounted) return;
          // Handle both array and object responses (same as All Bookings page)
          const bookingsData = Array.isArray(bookingsResponse) ? bookingsResponse : (bookingsResponse as any).data || [];
          const normalizedBookings: BookingData[] = bookingsData.map((booking: any, index: number) => {
            const rawPackage = booking.package ?? {};
            const normalizedId =
              typeof booking.id === "number"
                ? booking.id
                : Number(booking._id) || Number((booking as any).booking_id) || index + 1;

            // Parse total_amount to ensure it's a number
            const rawTotalAmount = booking.total_amount ?? booking.totalAmount ?? 0;
            const parsedTotalAmount = toNumber(rawTotalAmount);
            
            return {
              id: normalizedId,
              package_name:
                booking.package_name ??
                rawPackage.name ??
                rawPackage.title ??
                rawPackage.slug ??
                "Package",
              package_category:
                booking.package_category ?? rawPackage.category ?? rawPackage.destination ?? "Uncategorized",
              contact_email:
                booking.contact_email ?? booking.customerEmail ?? booking.email ?? rawPackage.contact_email,
              contact_phone:
                booking.contact_phone ?? booking.customerPhone ?? booking.phone ?? rawPackage.contact_phone,
              date: booking.date ?? booking.travelDate ?? booking.created_at ?? booking.createdAt,
              travelers: booking.travelers ?? booking.adults + (booking.children ?? 0),
              adults: booking.adults,
              children: booking.children,
              total_amount: parsedTotalAmount > 0 ? parsedTotalAmount : undefined,
              status: booking.status,
              payment_status: booking.payment_status ?? booking.paymentStatus,
              created_at: booking.created_at ?? booking.createdAt ?? booking.date,
            };
          });
          setBookings(normalizedBookings);
        } catch (bookingErr) {
          console.error("Failed to load bookings:", bookingErr);
          // Don't fail the whole page if bookings fail
        }
      } catch (err: any) {
        console.error("Failed to load dashboard data:", err);
        if (isMounted) {
          setError(
            err?.message ??
              "Unable to load dashboard data. Please ensure the backend is reachable at http://localhost/php-backend/api."
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const normalizedPackages = useMemo(
    () =>
      packages.map((pkg) => {
        const priceValue = toNumber(pkg.offer_price ?? pkg.price);
        const createdAt = pkg.created_at ?? pkg.updated_at ?? pkg.start_date ?? null;
        return {
          ...pkg,
          priceValue,
          createdAt,
          createdAtDate: createdAt ? new Date(createdAt) : null,
          isFeatured: toBoolean(pkg.is_featured),
        };
      }),
    [packages]
  );

  const categoryStats = useMemo(() => {
    const stats = new Map<
      string,
      {
        count: number;
        revenue: number;
        latestDate: Date | null;
      }
    >();

    normalizedPackages.forEach((pkg) => {
      const category = pkg.category || "Uncategorized";
      const prev = stats.get(category) ?? { count: 0, revenue: 0, latestDate: null };
      const revenue = prev.revenue + pkg.priceValue;
      const date = pkg.createdAtDate || prev.latestDate;
      stats.set(category, {
        count: prev.count + 1,
        revenue,
        latestDate: date,
      });
    });

    return Array.from(stats.entries()).map(([category, data], index) => ({
      label: category,
      value: data.count,
      revenue: data.revenue,
      color: colorPalette[index % colorPalette.length],
      latestDate: data.latestDate,
    }));
  }, [normalizedPackages]);

  const totalRevenue = normalizedPackages.reduce((acc, pkg) => acc + pkg.priceValue, 0);
  const featuredCount = normalizedPackages.filter((pkg) => pkg.isFeatured).length;
  const uniqueDestinations = new Set(
    normalizedPackages.map((pkg) => pkg.destination).filter(Boolean) as string[]
  ).size;

  const summaryCards = useMemo(() => {
    return [
      {
        label: "Total Packages",
        value: formatNumber(normalizedPackages.length),
        delta: `${featuredCount} featured`,
        accent: "bg-gradient-to-r from-indigo-500/20 to-indigo-500/10",
      },
      {
        label: "Featured Packages",
        value: formatNumber(featuredCount),
        delta: `${((featuredCount / Math.max(normalizedPackages.length, 1)) * 100).toFixed(1)}% of catalog`,
        accent: "bg-gradient-to-r from-purple-500/20 to-purple-500/10",
      },
      {
        label: "Destinations Covered",
        value: formatNumber(uniqueDestinations),
        delta: `${uniqueDestinations ? "Across Oman" : "Add destinations"}`,
        accent: "bg-gradient-to-r from-sky-500/20 to-sky-500/10",
      },
      {
        label: "Total Inventory Value",
        value: formatCurrency(totalRevenue),
        delta: `${normalizedPackages.length ? "Live valuation" : "No inventory yet"}`,
        accent: "bg-gradient-to-r from-emerald-500/20 to-emerald-500/10",
      },
    ];
  }, [normalizedPackages.length, featuredCount, uniqueDestinations, totalRevenue]);

  const bookingSegments = useMemo(() => {
    if (!categoryStats.length) {
      return [
        { label: "Packages", value: normalizedPackages.length, color: colorPalette[0] },
      ];
    }
    return categoryStats;
  }, [categoryStats, normalizedPackages.length]);

  const totalBookings = bookingSegments.reduce((acc, segment) => acc + segment.value, 0);
  let cumulativeDeg = 0;
  const donutStops = totalBookings
    ? bookingSegments.map((segment) => {
        const start = cumulativeDeg;
        const angle = (segment.value / totalBookings) * 360;
        cumulativeDeg += angle;
        return `${segment.color} ${start}deg ${cumulativeDeg}deg`;
      })
    : ["#E2E8F0 0deg 360deg"];
  const donutStyle = {
    background: `conic-gradient(${donutStops.join(", ")})`,
  };

  const earningsTrend = useMemo(() => {
    const months: { label: string; key: string }[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      months.push({
        label: date.toLocaleString("en-US", { month: "short" }),
        key,
      });
    }

    const monthRevenue = new Map<string, number>();
    normalizedPackages.forEach((pkg) => {
      const date = pkg.createdAtDate ?? new Date();
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      monthRevenue.set(key, (monthRevenue.get(key) ?? 0) + pkg.priceValue);
    });

    return months.map((month) => {
      const actual = (monthRevenue.get(month.key) ?? 0) / 100000; // convert to lakhs
      const target = actual ? actual * 1.1 : 1;
      return {
        month: month.label,
        actual: Number(actual.toFixed(2)),
        target: Number(target.toFixed(2)),
      };
    });
  }, [normalizedPackages]);

  const maxTarget = Math.max(...earningsTrend.map((item) => item.target), 1);
  const totalEarningsLabel = formatCurrency(totalRevenue);

  const recentlyAdded = useMemo(() => {
    const sorted = [...normalizedPackages]
      .sort((a, b) => {
        const aTime = a.createdAtDate ? a.createdAtDate.getTime() : 0;
        const bTime = b.createdAtDate ? b.createdAtDate.getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 4);

    return sorted.map((pkg) => ({
      id: pkg.id,
      title: pkg.name,
      type: (pkg.category ?? "Package").replace(/-/g, " "),
      date: formatDate(pkg.createdAt),
      slots: pkg.total_people_allotted ? Number(pkg.total_people_allotted) : pkg.isFeatured ? 12 : 6,
      image: buildPackageImage(pkg.feature_image),
    }));
  }, [normalizedPackages]);

  const invoices = useMemo(() => {
    return [...normalizedPackages]
      .sort((a, b) => {
        const aTime = a.createdAtDate ? a.createdAtDate.getTime() : 0;
        const bTime = b.createdAtDate ? b.createdAtDate.getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 4)
      .map((pkg) => ({
        id: `#INV-${pkg.id}`,
        date: formatDate(pkg.createdAt),
        customer: pkg.destination || pkg.category || "Travel Partner",
        amount: formatCurrency(pkg.priceValue),
      }));
  }, [normalizedPackages]);

  const quickAdds = useMemo(() => {
    return categoryStats.slice(0, 3).map((stat) => ({
      label: stat.label,
      count: stat.value,
      href: `/admin/packages?category=${encodeURIComponent(stat.label)}`,
    }));
  }, [categoryStats]);

  const recentBookingsForTable = useMemo(() => {
    // Use real bookings if available, otherwise fall back to packages
    if (bookings.length > 0) {
      // Filter to show only paid bookings (confirmed bookings)
      const paidBookings = bookings.filter((b) => b.payment_status === 'paid');
      
      // If we have paid bookings, use those; otherwise show all bookings
      const bookingsToShow = paidBookings.length > 0 ? paidBookings : bookings;
      
      return bookingsToShow
        .sort((a, b) => {
          const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
          return bTime - aTime;
        })
        .slice(0, 5)
        .map((booking) => ({
          id: `#BK-${String(booking.id).padStart(4, "0")}`,
          product: booking.package_name || "Package",
          guest: booking.contact_email ? `Email · ${booking.contact_email}` : "Guest",
          days: booking.date ? formatDate(booking.date) : "Flexible",
          price: booking.total_amount && booking.total_amount > 0 ? formatCurrency(booking.total_amount) : "—",
          bookedOn: formatDate(booking.created_at),
          status: booking.status || "Pending",
        }));
    }
    
    // Fallback to packages
    return [...normalizedPackages]
      .sort((a, b) => {
        const aTime = a.createdAtDate ? a.createdAtDate.getTime() : 0;
        const bTime = b.createdAtDate ? b.createdAtDate.getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 5)
      .map((pkg, index) => ({
        id: `#BK-${String(pkg.id).padStart(4, "0")}`,
        product: pkg.name,
        guest: pkg.destination ? `Destination · ${pkg.destination}` : "Package detail",
        days: pkg.start_date && pkg.end_date ? `${formatDate(pkg.start_date)} - ${formatDate(pkg.end_date)}` : "Flexible",
        price: formatCurrency(pkg.priceValue),
        bookedOn: formatDate(pkg.createdAt),
        status: pkg.isFeatured ? "Featured" : index % 2 === 0 ? "Ready" : "Upcoming",
      }));
  }, [normalizedPackages, bookings]);

  const upcomingBookings = recentBookingsForTable.filter((booking) => booking.status !== "Cancelled");

  const categoryBookingsRecords = useMemo(() => {
    const records: Record<string, CategoryBookingRecord[]> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

    // Only process bookings, no packages fallback
    bookings.forEach((booking) => {
      const status = (booking.status || "Pending").toLowerCase();
      // Skip only cancelled bookings
      if (status === "cancelled") {
        return;
      }
      
      // Filter for upcoming bookings based on booking date
      const bookingDate = booking.date ? new Date(booking.date) : null;
      let dateValue = 0;
      let isUpcoming = false;
      
      if (bookingDate && !isNaN(bookingDate.getTime())) {
        bookingDate.setHours(0, 0, 0, 0);
        // Only include bookings with date >= today (upcoming)
        isUpcoming = bookingDate >= today;
        dateValue = bookingDate.getTime();
      } else {
        // If no valid booking date, check if booking was created recently (within last 30 days)
        // This handles bookings without specific travel dates
        const createdDate = booking.created_at ? new Date(booking.created_at) : null;
        if (createdDate && !isNaN(createdDate.getTime())) {
          const daysSinceCreation = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
          // Include bookings created in the last 30 days that aren't cancelled
          isUpcoming = daysSinceCreation <= 30;
          dateValue = createdDate.getTime();
        } else {
          // No date info at all, skip it
          return;
        }
      }
      
      // Only include upcoming bookings
      if (!isUpcoming) {
        return;
      }
      
      const category = booking.package_category || "Uncategorized";
      const bucket = records[category] ?? [];
      bucket.push({
        id: `#BK-${String(booking.id).padStart(4, "0")}`,
        traveler: booking.contact_email || booking.contact_phone || "Guest",
        package: booking.package_name || "Package",
        status: booking.status || "Pending",
        amount: booking.total_amount && booking.total_amount > 0 ? formatCurrency(booking.total_amount) : "—",
        date: formatDate(booking.date || booking.created_at),
        dateValue: dateValue, // Store timestamp for sorting
      });
      records[category] = bucket;
    });

    // Sort bookings within each category by date (soonest first)
    Object.keys(records).forEach((category) => {
      records[category].sort((a, b) => {
        const aDate = (a as any).dateValue ?? 0;
        const bDate = (b as any).dateValue ?? 0;
        return aDate - bDate;
      });
    });

    return records;
  }, [bookings]);

  const panelCategories = Object.keys(categoryBookingsRecords).length
    ? Object.keys(categoryBookingsRecords)
    : [];

  return (
    <div className="space-y-10 px-4 pb-8 pt-4 sm:px-0 sm:pt-0 min-w-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">Overview of your packages and bookings</p>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <p className="font-semibold">Dashboard data unavailable</p>
          <p className="mt-1 text-xs text-red-600/80">{error}</p>
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
        {(loading ? summaryCards : summaryCards).map((card) => (
          <div
            key={card.label}
            className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_25px_70px_-45px_rgb(15_23_42/0.6)] ${card.accent ?? ""}`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">{card.label}</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">
              {loading ? (
                <span className="h-6 w-20 animate-pulse rounded bg-slate-100" />
              ) : (
                card.value
              )}
            </p>
            {card.delta ? <p className="mt-2 text-xs text-(--color-brand-600)">{card.delta}</p> : null}
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
        <article className="w-full max-w-full rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_25px_70px_-45px_rgb(15_23_42/0.6)] sm:p-4 md:p-6 overflow-hidden">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold text-slate-900 sm:text-base md:text-lg lg:text-xl">Bookings Statistics</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600 sm:gap-2 sm:px-2.5 sm:py-1 sm:text-xs">
              Updated · {new Date().toLocaleDateString()}
            </span>
          </div>
          <div className="mt-4 flex flex-col gap-4 sm:mt-6 sm:gap-6 md:mt-8 md:gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-full justify-center lg:w-auto lg:flex-shrink-0">
              <div className="relative flex h-32 w-32 items-center justify-center sm:h-40 sm:w-40 md:h-48 md:w-48 lg:h-56 lg:w-56">
                <div className="h-full w-full rounded-full" style={donutStyle}>
                  <div className="absolute inset-2.5 rounded-full bg-white shadow-inner sm:inset-3 md:inset-4 lg:inset-6" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center text-center">
                  <div className="px-1">
                    <p className="font-semibold uppercase text-slate-400" style={{ fontSize: '8px', letterSpacing: '0.2em', lineHeight: '1.2' }}>Total</p>
                    <p className="font-semibold text-slate-900" style={{ marginTop: '2px', fontSize: 'clamp(0.875rem, 3vw, 1.5rem)', lineHeight: '1.2' }}>{formatNumber(totalBookings)}</p>
                    <p className="text-slate-500" style={{ fontSize: '8px', lineHeight: '1.2' }}>Packages</p>
                  </div>
                </div>
              </div>
            </div>
            <ul className="flex w-full flex-col gap-2 text-xs sm:gap-2.5 sm:text-sm md:gap-3 lg:flex-1 lg:max-w-none">
              {bookingSegments.map((segment) => (
                <li
                  key={segment.label}
                  className="flex w-full flex-col gap-1.5 rounded-xl border border-slate-100 p-2 sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:rounded-2xl sm:p-2.5 md:p-3"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2 md:gap-2.5">
                    <span className="h-2 w-2 flex-shrink-0 rounded-full sm:h-2.5 sm:w-2.5 md:h-3 md:w-3" style={{ backgroundColor: segment.color }} />
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <p className="text-xs font-semibold text-slate-700 truncate sm:text-sm">{segment.label}</p>
                      <p className="text-[10px] text-slate-500 sm:text-xs">
                        {totalBookings ? ((segment.value / totalBookings) * 100).toFixed(1) : "0.0"}% share
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-600 text-left sm:text-sm sm:text-right sm:flex-shrink-0">{formatNumber(segment.value)}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>

        <article className="w-full max-w-full rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_25px_70px_-45px_rgb(15_23_42/0.6)] sm:p-4 md:p-6 overflow-hidden">
          <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold text-slate-900 sm:text-base md:text-lg lg:text-xl">Earnings</h2>
              <p className="mt-0.5 text-[10px] text-slate-500 sm:mt-1 sm:text-xs md:text-sm">Based on published package pricing</p>
              <p className="mt-1.5 text-xl font-semibold text-slate-900 sm:mt-2 sm:text-2xl md:mt-3 md:text-3xl lg:mt-4 lg:text-4xl">{loading ? "…" : totalEarningsLabel}</p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 sm:flex-col sm:items-end sm:flex-shrink-0">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600 sm:gap-2 sm:px-2.5 sm:py-1 sm:text-xs">
                Rolling 12 months
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 sm:gap-2 sm:px-2.5 sm:py-1 sm:text-xs">
                <span aria-hidden>↑</span>
                {normalizedPackages.length
                  ? `${Math.min(
                      Number(((featuredCount / Math.max(normalizedPackages.length, 1)) * 100).toFixed(1)),
                      100,
                    )}% featured`
                  : "Awaiting inventory"}
              </span>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto overflow-y-visible pb-2 sm:mt-6 md:mt-8" style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch', msOverflowStyle: '-ms-autohiding-scrollbar' }}>
            <div className="flex min-w-[600px] items-end gap-1.5 sm:gap-2 md:gap-3">
              {earningsTrend.map((item) => {
                const targetHeight = maxTarget ? (item.target / maxTarget) * 100 : 0;
                const actualHeight = maxTarget ? (Math.min(item.actual, item.target) / maxTarget) * 100 : 0;
                return (
                  <div key={item.month} className="flex flex-col items-center gap-1 flex-shrink-0 sm:gap-1.5">
                    <div className="relative flex h-32 w-5 items-end justify-center sm:h-36 sm:w-6 md:h-40 md:w-7 lg:h-48 lg:w-8">
                      <div className="h-full w-full rounded-full bg-slate-100" />
                      <div
                        className="absolute bottom-0 w-full rounded-t-full bg-slate-200"
                        style={{ height: `${targetHeight}%` }}
                      />
                      <div
                        className="absolute bottom-0 w-full rounded-t-full bg-emerald-500"
                        style={{ height: `${actualHeight}%` }}
                      />
                    </div>
                    <span className="font-semibold text-slate-500" style={{ fontSize: '9px' }}>{item.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </article>
      </section>

      <CategoryBookingsPanel
        categories={panelCategories}
        recordsByCategory={categoryBookingsRecords}
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_25px_70px_-45px_rgb(15_23_42/0.6)]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Recently Added</h2>
            <a
              href="/admin/packages"
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              View all
            </a>
          </div>
          <div className="mt-6 space-y-4">
            {recentlyAdded.length === 0 && !loading ? (
              <p className="text-sm text-slate-500">No packages yet. Create one to populate this section.</p>
            ) : (
              recentlyAdded.map((item) => (
                <article
                  key={item.id + item.date}
                  className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:flex-row sm:items-center"
                >
                  <div className="relative h-32 w-full overflow-hidden rounded-2xl sm:h-20 sm:w-20 sm:rounded-xl">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-(--color-brand-500)">{item.type}</p>
                      <h3 className="mt-1 text-base font-semibold text-slate-900">{item.title}</h3>
                      <p className="mt-1 text-xs text-slate-500">Added · {item.date}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Slots</p>
                      <p className="text-lg font-semibold text-slate-900">{item.slots}</p>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_25px_70px_-45px_rgb(15_23_42/0.6)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-slate-900">Latest Invoices</h2>
            <button
              type="button"
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              Export
            </button>
          </div>
          <div className="mt-6 space-y-4">
            {invoices.length === 0 && !loading ? (
              <p className="text-sm text-slate-500">No activity yet.</p>
            ) : (
              invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{invoice.id}</p>
                    <p className="text-xs text-slate-500">{invoice.date}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-semibold text-slate-900">{invoice.customer}</p>
                    <p className="text-xs text-(--color-brand-600)">{invoice.amount}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_25px_70px_-45px_rgb(15_23_42/0.6)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-900">Quick Actions</h2>
          <p className="text-xs text-slate-500">Add new inventory straight from your concierge pipeline.</p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {quickAdds.length === 0 && !loading ? (
            <p className="text-sm text-slate-500">No categories yet.</p>
          ) : (
            quickAdds.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-5 text-sm font-semibold text-slate-600 transition hover:-translate-y-1 hover:border-(--color-brand-200) hover:bg-white hover:text-slate-900"
              >
                <span className="text-xs uppercase tracking-[0.28em] text-(--color-brand-500)">{item.label}</span>
                <span className="text-2xl font-semibold text-slate-900">{item.count}</span>
                <span className="text-xs text-(--color-brand-600)">Manage {item.label.toLowerCase()}</span>
              </a>
            ))
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_25px_70px_-45px_rgb(15_23_42/0.6)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Recent Bookings</h2>
            <p className="text-xs text-slate-500">
              {bookings.length > 0 
                ? `${bookings.filter(b => b.payment_status === 'paid').length} confirmed bookings (paid)`
                : "Derived from newest packages to keep you in sync."}
            </p>
          </div>
          <a
            href="/admin/bookings"
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            View all
          </a>
        </div>
        <div className="mt-6 rounded-2xl border border-slate-200">
          {upcomingBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-[900px] divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50/80 text-xs uppercase tracking-[0.14em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left sm:px-6">Booking ID</th>
                    <th className="px-4 py-3 text-left sm:px-6">Product</th>
                    <th className="px-4 py-3 text-left sm:px-6">Guests</th>
                    <th className="px-4 py-3 text-left sm:px-6">Duration</th>
                    <th className="px-4 py-3 text-right sm:px-6">Amount</th>
                    <th className="px-4 py-3 text-left sm:px-6">Booked On</th>
                    <th className="px-4 py-3 text-left sm:px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {upcomingBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-4 font-semibold text-slate-900 sm:px-6">{booking.id}</td>
                      <td className="px-4 py-4 text-slate-600 sm:px-6">{booking.product}</td>
                      <td className="px-4 py-4 text-slate-600 sm:px-6">{booking.guest}</td>
                      <td className="px-4 py-4 text-slate-600 sm:px-6">{booking.days}</td>
                      <td className="px-4 py-4 text-right font-semibold text-slate-900 sm:px-6">{booking.price}</td>
                      <td className="px-4 py-4 text-slate-600 sm:px-6">{booking.bookedOn}</td>
                      <td className="px-4 py-4 sm:px-6">
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white px-6 py-10 text-center">
              <p className="text-sm font-semibold text-slate-900">
                {loading ? "Loading recent activity…" : "No recent packages yet"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {loading ? "Fetching latest inventory details." : "Create a package to see it appear here."}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

