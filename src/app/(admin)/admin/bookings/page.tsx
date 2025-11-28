"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { formatDisplayCurrency } from "@/lib/currency";

type Booking = {
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
  currency?: string;
  status?: string;
  payment_status?: string;
  created_at?: string;
};

type BookingsApiResponse = Booking[] | { data?: Booking[] };

const PAGE_SIZE = 10;

const formatDate = (dateString?: string | null): string => {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-OM", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

const formatCurrency = (value?: number) => {
  if (typeof value !== "number" || value <= 0 || isNaN(value)) {
    return "—";
  }
  return formatDisplayCurrency(value, "INR");
};

// Map segment URL values to possible category name variations
const segmentToCategoryMap: Record<string, string[]> = {
  "city-tours": ["City Tours", "city-tours", "city tours", "City Tours"],
  "car-rental": ["Car Rental", "car-rental", "car rental", "Car Rental"],
  "airport-transport": ["Airport Transport", "airport-transport", "airport transport", "Airport Transport"],
};

export default function AdminBookingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const segmentParam = searchParams?.get("segment") || null;
  const activeSegmentVariations = segmentParam ? segmentToCategoryMap[segmentParam] || null : null;
  const activeSegmentDisplay = segmentParam 
    ? segmentToCategoryMap[segmentParam]?.[0] || segmentParam 
    : null;
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, paymentFilter, activeSegmentVariations]);

  const toNumber = (value: unknown): number => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return Number.isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = (await api.getBookings()) as BookingsApiResponse;
      const rawBookings = Array.isArray(response) ? response : response.data || [];
      
      // Normalize bookings and parse total_amount
      const bookingsData: Booking[] = rawBookings.map((booking: any) => ({
        ...booking,
        total_amount: booking.total_amount !== undefined && booking.total_amount !== null 
          ? toNumber(booking.total_amount) 
          : undefined,
      }));
      
      setBookings(bookingsData);
      
      // Debug: Log unique categories to help identify the format
      if (bookingsData.length > 0) {
        const uniqueCategories = new Set(bookingsData.map(b => b.package_category).filter(Boolean));
        console.log("Available booking categories:", Array.from(uniqueCategories));
      }
    } catch (err: any) {
      console.error("Error loading bookings:", err);
      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const [processingPayment, setProcessingPayment] = useState<number | null>(null);

  const filteredBookings = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return bookings.filter((booking) => {
      // Filter by segment/category if active
      let matchesSegment = true;
      if (activeSegmentVariations && activeSegmentVariations.length > 0) {
        const bookingCategory = (booking.package_category || "").trim();
        
        // Normalize both for comparison (case-insensitive, handle spaces/hyphens)
        const normalizeCategory = (cat: string) => 
          cat.toLowerCase().replace(/\s+/g, "-").replace(/-+/g, "-");
        
        const normalizedBookingCategory = normalizeCategory(bookingCategory);
        
        // Check if booking category matches any of the possible variations
        matchesSegment = activeSegmentVariations.some(variation => {
          const normalizedVariation = normalizeCategory(variation);
          return normalizedBookingCategory === normalizedVariation ||
                 normalizedBookingCategory.includes(normalizedVariation) ||
                 normalizedVariation.includes(normalizedBookingCategory);
        });
      }

      const matchesSearch =
        !search ||
        booking.package_name?.toLowerCase().includes(search) ||
        booking.contact_email?.toLowerCase().includes(search) ||
        booking.id.toString().includes(search);

      const bookingStatus = (booking.status || "Pending").toLowerCase();
      const bookingPayment = (booking.payment_status || "pending").toLowerCase();

      const matchesStatus = statusFilter === "all" || bookingStatus === statusFilter;
      const matchesPayment = paymentFilter === "all" || bookingPayment === paymentFilter;

      return matchesSegment && matchesSearch && matchesStatus && matchesPayment;
    });
  }, [bookings, paymentFilter, searchTerm, statusFilter, activeSegmentVariations]);

  const paidCount = useMemo(
    () => filteredBookings.filter((b) => (b.payment_status || "").toLowerCase() === "paid").length,
    [filteredBookings],
  );

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage((prev) => Math.min(Math.max(prev, 1), totalPages));
  }, [totalPages]);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + PAGE_SIZE);

  const handleProcessPayment = async (bookingId: number) => {
    try {
      setProcessingPayment(bookingId);
      setError(null);
      const response = await api.createDummyPayment({ bookingId });
      await loadBookings();
      alert(response.message || "Payment processed successfully! Booking is now confirmed.");
    } catch (err: any) {
      console.error("Failed to process payment:", err);
      setError(err.message || "Failed to process payment");
    } finally {
      setProcessingPayment(null);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-emerald-50 text-emerald-600";
      case "Completed":
        return "bg-blue-50 text-blue-600";
      case "Cancelled":
        return "bg-red-50 text-red-600";
      case "Pending":
      default:
        return "bg-amber-50 text-amber-600";
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex flex-1 min-h-0 flex-col gap-4 overflow-hidden">
        <header className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 pt-4 sm:px-6 sm:pt-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-(--color-brand-500)">Dashboard</p>
            <h1 className="mt-1 text-3xl font-semibold text-slate-900">Bookings</h1>
            <p className="text-sm text-slate-600">
              Track confirmations, payments, and traveler communications.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/admin/bookings/new")}
            className="w-full rounded-full bg-(--color-brand-600) px-6 py-3 text-sm font-semibold text-white transition hover:bg-(--color-brand-700) sm:w-auto"
          >
            New Booking
          </button>
        </header>

        {error && (
          <div className="mx-4 shrink-0 rounded-2xl border border-red-200 bg-red-50/70 px-5 py-4 text-sm text-red-700 sm:mx-6">
            <p className="font-semibold">Error</p>
            <p className="mt-1 text-xs text-red-600/80">{error}</p>
          </div>
        )}

        <section className="mx-4 flex flex-1 min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_25px_70px_-45px_rgb(15_23_42/0.6)] sm:mx-6 sm:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {activeSegmentDisplay ? `${activeSegmentDisplay} Bookings` : "Booking list"}
              </h2>
              <p className="text-xs text-slate-500">
                {bookings.length === 0
                  ? "No bookings captured yet"
                  : activeSegmentDisplay
                    ? `${filteredBookings.length} ${activeSegmentDisplay.toLowerCase()} booking${filteredBookings.length !== 1 ? 's' : ''} · ${paidCount} paid`
                    : `${filteredBookings.length} shown · ${paidCount} paid`}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-64">
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by package, email, or ID"
                  className="w-full rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-(--color-brand-500) focus:ring-2 focus:ring-(--color-brand-200)"
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs uppercase tracking-[0.2em] text-slate-300">
                  Ctrl+F
                </span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-(--color-brand-500) focus:ring-2 focus:ring-(--color-brand-200)"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-(--color-brand-500) focus:ring-2 focus:ring-(--color-brand-200)"
              >
                <option value="all">All payments</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-1 items-center justify-center px-6 py-10 text-center">
              <p className="text-sm text-slate-500">Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
              <p className="text-sm font-semibold text-slate-900">No bookings yet</p>
              <p className="mt-1 text-xs text-slate-500">Create a new booking to get started.</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
              <p className="text-sm font-semibold text-slate-900">No results match your filters.</p>
              <p className="mt-1 text-xs text-slate-500">Try adjusting the search or filter options.</p>
            </div>
          ) : (
            <div className="mt-4 flex-1 min-h-0 overflow-hidden rounded-2xl border border-slate-200">
              <div className="h-full w-full overflow-auto pr-2">
                <table className="w-full min-w-[1100px] divide-y divide-slate-200 text-sm">
                <thead className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-sm">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 sm:px-6">ID</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 sm:px-6">Package</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 sm:px-6 hidden lg:table-cell">Category</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 sm:px-6 hidden md:table-cell">Email</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 sm:px-6">Travelers</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 sm:px-6 hidden md:table-cell">Travel Date</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 sm:px-6">Amount</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 sm:px-6">Status</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 sm:px-6 hidden lg:table-cell">Payment</th>
                    <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 sm:px-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {paginatedBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="whitespace-nowrap px-3 py-4 font-medium text-slate-900 sm:px-6">#{booking.id}</td>
                      <td className="px-3 py-4 text-slate-600 sm:px-6">
                        <div className="max-w-[200px] truncate" title={booking.package_name || "—"}>
                          {booking.package_name || "—"}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-slate-600 sm:px-6 hidden lg:table-cell">
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {booking.package_category || "Uncategorized"}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-slate-600 sm:px-6 hidden md:table-cell">
                        <div className="max-w-[180px] truncate" title={booking.contact_email || "—"}>
                          {booking.contact_email || "—"}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-slate-600 sm:px-6">
                        {booking.travelers || booking.adults ? (
                          <span>
                            {booking.travelers || booking.adults}
                            {booking.children ? (
                              <span className="text-xs text-slate-500"> ({booking.children} child{booking.children > 1 ? "ren" : ""})</span>
                            ) : null}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-slate-600 sm:px-6 hidden md:table-cell">
                        {formatDate(booking.date)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 font-semibold text-slate-900 sm:px-6">
                        {formatCurrency(booking.total_amount)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 sm:px-6">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusColor(booking.status)}`}>
                          {booking.status || "Pending"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 sm:px-6 hidden lg:table-cell">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${booking.payment_status === "paid" ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-600"}`}>
                          {booking.payment_status || "pending"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-right sm:px-6">
                        <div className="flex items-center justify-end gap-2">
                          {booking.payment_status !== 'paid' && (
                            <button
                              type="button"
                              onClick={() => handleProcessPayment(booking.id)}
                              disabled={processingPayment === booking.id}
                              className="rounded-full bg-(--color-brand-600) px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-(--color-brand-700) disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:py-2"
                              title="Process Payment"
                            >
                              <span className="hidden sm:inline">{processingPayment === booking.id ? "Processing..." : "Process Payment"}</span>
                              <span className="sm:hidden">Pay</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => router.push(`/admin/bookings/${booking.id}`)}
                            className="rounded-full border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 sm:px-3 sm:py-2"
                            title="View Details"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {filteredBookings.length > 0 && (
          <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Showing {startIndex + 1}-{Math.min(startIndex + PAGE_SIZE, filteredBookings.length)} of {filteredBookings.length} bookings
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
                  {currentPage}
                </span>
                <span className="text-xs text-slate-400">/</span>
                <span className="text-xs text-slate-500">{totalPages}</span>
              </div>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  </div>
  );
}

