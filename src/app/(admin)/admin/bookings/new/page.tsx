"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type Package = {
  id: number | string;
  name: string;
  category?: string;
  price?: number;
  offer_price?: number;
};

export default function AdminCreateBookingPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    packageId: "",
    date: "",
    adults: 1,
    children: 0,
    contactEmail: "",
    contactPhone: "",
    pickupLocation: "",
    notes: "",
    currency: "INR",
  });

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const response = await api.getPackages({ limit: 200 });
        setPackages(response.data ?? []);
      } catch (err: any) {
        console.error("Failed to load packages:", err);
        setError("Failed to load packages. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.packageId || !formData.date || !formData.contactEmail || !formData.contactPhone) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setSubmitting(true);

      // Get selected package to calculate price
      const selectedPackage = packages.find((p) => String(p.id) === formData.packageId);
      if (!selectedPackage) {
        throw new Error("Selected package not found");
      }

      const packagePrice = (selectedPackage.offer_price ?? selectedPackage.price ?? 0) as number;
      const totalAmount = packagePrice * (formData.adults + formData.children * 0.5);

      await api.createDummyBooking({
        packageId: formData.packageId,
        date: formData.date,
        adults: formData.adults,
        children: formData.children,
        totalAmount,
        currency: formData.currency,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        pickupLocation: formData.pickupLocation,
        notes: formData.notes,
      });

      alert("Booking created successfully!");
      router.push("/admin/bookings");
    } catch (err: any) {
      console.error("Failed to create booking:", err);
      setError(err.message || "Failed to create booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Create New Booking</h1>
          <p className="mt-1 text-sm text-slate-600">Add a new booking manually</p>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
        >
          Cancel
        </button>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50/70 px-5 py-4 text-sm text-red-700">
          <p className="font-semibold">Error</p>
          <p className="mt-1 text-xs text-red-600/80">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_25px_70px_-45px_rgb(15_23_42/0.6)]">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-800">
              Package <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.packageId}
              onChange={(e) => setFormData({ ...formData, packageId: e.target.value })}
              required
              disabled={loading}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-brand-50 disabled:bg-slate-50"
            >
              <option value="">Select a package</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} {pkg.category ? `(${pkg.category})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800">
              Booking Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              min={minDate}
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-brand-50"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-800">
                Adults <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.adults}
                onChange={(e) => setFormData({ ...formData, adults: Math.max(1, parseInt(e.target.value) || 1) })}
                min={1}
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-brand-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800">Children</label>
              <input
                type="number"
                value={formData.children}
                onChange={(e) => setFormData({ ...formData, children: Math.max(0, parseInt(e.target.value) || 0) })}
                min={0}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-brand-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800">
              Contact Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-brand-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800">
              Contact Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-brand-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800">Pickup Location</label>
            <input
              type="text"
              value={formData.pickupLocation}
              onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
              placeholder="Hotel pickup"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-brand-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-brand-50"
            />
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loading}
              className="flex-1 rounded-full bg-(--color-brand-600) px-6 py-3 text-sm font-semibold text-white transition hover:bg-(--color-brand-700) disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Booking"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

