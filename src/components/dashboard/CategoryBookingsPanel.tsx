"use client";

import { useEffect, useMemo, useState } from "react";

type BookingRecord = {
  id: string;
  traveler: string;
  package: string;
  status: string;
  amount: string;
  date: string;
};

type CategoryBookingsPanelProps = {
  categories: string[];
  recordsByCategory: Record<string, BookingRecord[]>;
};

const statusStyles: Record<string, string> = {
  Confirmed: "bg-emerald-50 text-emerald-600",
  Pending: "bg-amber-50 text-amber-600",
  "In Progress": "bg-sky-50 text-sky-600",
  Cancelled: "bg-rose-50 text-rose-600",
};

// Map category slugs to display names
const getCategoryDisplayName = (category: string | null | undefined): string => {
  if (!category) return "Uncategorized";
  const categoryMap: Record<string, string> = {
    "city-tours": "Tour Packages",
    "car-rental": "Car Rental",
    "airport-transport": "Airport Transport",
    "hotel-booking": "Hotel Booking",
  };
  return categoryMap[category.toLowerCase()] || category;
};

const PAGE_SIZE = 5;

export default function CategoryBookingsPanel({ categories, recordsByCategory }: CategoryBookingsPanelProps) {
  const initialCategory = useMemo(() => {
    const populated = categories.find((category) => (recordsByCategory[category]?.length ?? 0) > 0);
    return populated ?? categories[0] ?? "";
  }, [categories, recordsByCategory]);

  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setActiveCategory(initialCategory);
    setPage(1);
    setSearchTerm("");
    setStatusFilter("");
  }, [initialCategory]);

  const allStatuses = useMemo(() => {
    const set = new Set<string>();
    Object.values(recordsByCategory).forEach((records) => {
      records.forEach((record) => set.add(record.status));
    });
    return Array.from(set);
  }, [recordsByCategory]);

  const activeRecords = recordsByCategory[activeCategory] ?? [];

  const filteredRecords = useMemo(() => {
    return activeRecords.filter((record) => {
      const matchesSearch =
        searchTerm.trim().length === 0 ||
        record.traveler.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.package.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter ? record.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }, [activeRecords, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const paginatedRecords = filteredRecords.slice(start, start + PAGE_SIZE);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setPage(1);
    setSearchTerm("");
    setStatusFilter("");
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_25px_70px_-45px_rgb(15_23_42/0.6)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Category Bookings</h2>
          <p className="text-xs text-slate-500">Search, filter, and review upcoming bookings by product type.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const isActive = category === activeCategory;
            return (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryChange(category)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  isActive
                    ? "border-(--color-brand-300) bg-(--color-brand-50) text-(--color-brand-700)"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                {getCategoryDisplayName(category)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full gap-3">
          <label className="flex w-full items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 focus-within:border-(--color-brand-300) focus-within:ring-2 focus-within:ring-(--color-brand-50)">
            <span aria-hidden>🔍</span>
            <input
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(1);
              }}
              placeholder="Search by traveler, package, or booking ID"
              className="w-full bg-transparent outline-none"
            />
          </label>
        </div>
        <label className="flex w-full items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 focus-within:border-(--color-brand-300) focus-within:ring-2 focus-within:ring-(--color-brand-50) lg:w-auto lg:flex-initial">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Status</span>
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            className="bg-transparent text-sm text-slate-700 outline-none"
          >
            <option value="">All</option>
            {allStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-[720px] divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50/80 text-xs uppercase tracking-[0.14em] text-slate-500">
            <tr>
              <th className="px-5 py-3 text-left">Booking ID</th>
              <th className="px-5 py-3 text-left">Traveler</th>
              <th className="px-5 py-3 text-left">Package</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-right">Amount</th>
              <th className="px-5 py-3 text-left">Booked On</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {paginatedRecords.length ? (
              paginatedRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3 font-semibold text-slate-900">{record.id}</td>
                  <td className="px-5 py-3 text-slate-600">{record.traveler}</td>
                  <td className="px-5 py-3 text-slate-600">{record.package}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        statusStyles[record.status] ?? "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-slate-900">{record.amount}</td>
                  <td className="px-5 py-3 text-slate-600">{record.date}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-sm text-slate-500">
                  {searchTerm || statusFilter ? "No bookings match your filters." : "No upcoming bookings found."}
                </td>
              </tr>
            )}
          </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <p>
          Showing{" "}
          <span className="font-semibold">
            {paginatedRecords.length ? start + 1 : 0}-{Math.min(start + PAGE_SIZE, filteredRecords.length)}
          </span>{" "}
          of <span className="font-semibold">{filteredRecords.length}</span> results
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs font-semibold text-slate-500">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}

