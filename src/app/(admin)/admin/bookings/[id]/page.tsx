"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";
import { formatDisplayCurrency } from "@/lib/currency";

type Booking = {
  id: number;
  package_name?: string;
  package_category?: string;
  package_image?: string;
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
  payment_intent_id?: string;
  transaction_id?: string;
  pickup_location?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
};

const formatDate = (dateString?: string | null): string => {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-OM", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

const formatDateTime = (dateString?: string | null): string => {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    return date.toLocaleString("en-OM", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

const formatCurrency = (value?: number) => {
  if (typeof value !== "number") {
    return "—";
  }
  return formatDisplayCurrency(value, "INR");
};

export default function BookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params?.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (bookingId) {
      loadBooking();
    }
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getBooking(bookingId);
      const bookingData = response.data || response;
      setBooking(bookingData);
    } catch (err: any) {
      console.error("Error loading booking:", err);
      setError(err.message || "Failed to load booking");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!booking) return;
    try {
      setProcessingPayment(true);
      setError(null);
      const response = await api.createDummyPayment({
        bookingId: booking.id,
        status: "Confirmed",
      });
      await loadBooking();
      alert(response.message || "Payment processed successfully! Booking is now confirmed.");
    } catch (err: any) {
      console.error("Failed to process payment:", err);
      setError(err.message || "Failed to process payment");
    } finally {
      setProcessingPayment(false);
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

  if (loading) {
    return (
      <div className="space-y-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-slate-900">Booking Details</h1>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-sm text-slate-500">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="space-y-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-slate-900">Booking Details</h1>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            Back
          </button>
        </div>
        <div className="rounded-3xl border border-red-200 bg-red-50/70 p-6">
          <p className="font-semibold text-red-700">Error</p>
          <p className="mt-1 text-sm text-red-600">{error || "Booking not found"}</p>
          <button
            type="button"
            onClick={() => router.push("/admin/bookings")}
            className="mt-4 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Booking #{booking.id}</h1>
          <p className="mt-1 text-sm text-slate-600">View and manage booking details</p>
        </div>
        <div className="flex gap-3">
          {booking.payment_status !== "paid" && (
            <button
              type="button"
              onClick={handleProcessPayment}
              disabled={processingPayment}
              className="rounded-full bg-[var(--color-brand-600)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-700)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processingPayment ? "Processing..." : "Process Payment"}
            </button>
          )}
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            Back
          </button>
        </div>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50/70 px-5 py-4 text-sm text-red-700">
          <p className="font-semibold">Error</p>
          <p className="mt-1 text-xs text-red-600/80">{error}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_25px_70px_-45px_rgb(15_23_42/0.6)]">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Booking Information</h2>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Booking ID</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">#{booking.id}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Status</p>
                  <p className="mt-1">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(booking.status)}`}>
                      {booking.status || "Pending"}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Payment Status</p>
                  <p className="mt-1">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${booking.payment_status === "paid" ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-600"}`}>
                      {booking.payment_status || "pending"}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Travel Date</p>
                  <p className="mt-1 text-sm text-slate-900">{formatDate(booking.date)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Travelers</p>
                  <p className="mt-1 text-sm text-slate-900">
                    {booking.travelers || booking.adults || 0} {booking.children ? `(${booking.children} children)` : ""}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Total Amount</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {formatCurrency(booking.total_amount)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_25px_70px_-45px_rgb(15_23_42/0.6)]">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Package Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Package Name</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{booking.package_name || "—"}</p>
              </div>
              {booking.package_category && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Category</p>
                  <p className="mt-1">
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {booking.package_category}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_25px_70px_-45px_rgb(15_23_42/0.6)]">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Email</p>
                <p className="mt-1 text-sm text-slate-900">{booking.contact_email || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Phone</p>
                <p className="mt-1 text-sm text-slate-900">{booking.contact_phone || "—"}</p>
              </div>
              {booking.pickup_location && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Pickup Location</p>
                  <p className="mt-1 text-sm text-slate-900">{booking.pickup_location}</p>
                </div>
              )}
            </div>
          </section>

          {booking.notes && (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_25px_70px_-45px_rgb(15_23_42/0.6)]">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Notes</h2>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{booking.notes}</p>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_25px_70px_-45px_rgb(15_23_42/0.6)]">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Timeline</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Created</p>
                <p className="mt-1 text-sm text-slate-900">{formatDateTime(booking.created_at)}</p>
              </div>
              {booking.updated_at && booking.updated_at !== booking.created_at && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Last Updated</p>
                  <p className="mt-1 text-sm text-slate-900">{formatDateTime(booking.updated_at)}</p>
                </div>
              )}
            </div>
          </section>

          {booking.transaction_id && (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_25px_70px_-45px_rgb(15_23_42/0.6)]">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Payment Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Transaction ID</p>
                  <p className="mt-1 text-sm font-mono text-slate-900 break-all">{booking.transaction_id}</p>
                </div>
                {booking.payment_intent_id && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Payment Intent ID</p>
                    <p className="mt-1 text-sm font-mono text-slate-900 break-all">{booking.payment_intent_id}</p>
                  </div>
                )}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

