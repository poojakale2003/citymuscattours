"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost/php-backend/api";
const UPLOAD_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

// Avatar component that handles image loading errors
function Avatar({ src, name }: { src: string | null; name: string }) {
  const [imageError, setImageError] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (src) {
      // Resolve avatar URL
      if (src.startsWith("http://") || src.startsWith("https://")) {
        setAvatarUrl(src);
      } else if (src.startsWith("/uploads/")) {
        setAvatarUrl(`${UPLOAD_BASE_URL}/public${src}`);
      } else {
        const normalizedPath = src.startsWith("/") ? src : `/${src}`;
        setAvatarUrl(`${UPLOAD_BASE_URL}/public${normalizedPath}`);
      }
      setImageError(false);
    } else {
      setAvatarUrl(null);
    }
  }, [src]);

  if (!avatarUrl || imageError) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
        {name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)}
      </div>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt={name}
      className="h-10 w-10 rounded-full object-cover"
      onError={() => setImageError(true)}
    />
  );
}

type Testimonial = {
  id: number;
  name: string;
  location: string;
  avatar: string | null;
  quote: string;
  rating: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export default function AdminTestimonialsPage() {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    // Check for created/updated params from URL
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const createdParam = urlParams.get("created") === "1";
      const updatedParam = urlParams.get("updated") === "1";
      setCreated(createdParam);
      setUpdated(updatedParam);
    }

    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getTestimonials({ limit: 200 });
      setTestimonials(response.data || []);
    } catch (err: any) {
      console.error("Error loading testimonials:", err);
      setError(err.message || "Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this testimonial? This action cannot be undone.")) {
      return;
    }

    try {
      setDeletingId(id);
      await api.deleteTestimonial(id);
      await loadTestimonials();
    } catch (err: any) {
      console.error("Error deleting testimonial:", err);
      alert(err.message || "Failed to delete testimonial");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/admin/testimonials/${id}/edit`);
  };

  const formatDate = (value?: string | null): string => {
    if (!value) return "Not set";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };


  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((testimonial) => {
      const matchesSearch =
        !searchTerm ||
        testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testimonial.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testimonial.quote.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesActive =
        activeFilter === "all" ||
        (activeFilter === "active" && testimonial.is_active) ||
        (activeFilter === "inactive" && !testimonial.is_active);

      return matchesSearch && matchesActive;
    });
  }, [testimonials, searchTerm, activeFilter]);

  const totalPages = Math.ceil(filteredTestimonials.length / ITEMS_PER_PAGE);
  const paginatedTestimonials = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTestimonials.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTestimonials, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilter]);

  return (
    <div className="space-y-10">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Customer Reviews</h1>
          <p className="mt-1 text-sm text-slate-600">Manage testimonials displayed in the Reviews By Our Customers section</p>
        </div>
        <Link
          href="/admin/testimonials/new"
          className="inline-flex items-center justify-center rounded-full bg-(--color-brand-600) px-6 py-3 text-sm font-semibold text-white transition hover:bg-(--color-brand-700) focus:outline-none focus:ring-2 focus:ring-(--color-brand-500) focus:ring-offset-2"
        >
          Add New Review
        </Link>
      </section>

      {(created || updated) && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {created && "Testimonial created successfully!"}
          {updated && "Testimonial updated successfully!"}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Search by name, location, or quote..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
          />
          <select
            value={activeFilter}
            onChange={(event) => {
              setActiveFilter(event.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200) sm:w-48"
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="text-xs text-slate-500">
          Showing {filteredTestimonials.length} result{filteredTestimonials.length === 1 ? "" : "s"}
        </div>
      </section>

      {filteredTestimonials.length > ITEMS_PER_PAGE && (
        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm sm:flex-row">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_25px_70px_-45px_rgb(15_23_42/0.6)]">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm text-slate-500">Loading testimonials...</div>
          </div>
        ) : paginatedTestimonials.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-semibold text-slate-900">No testimonials found</p>
            <p className="mt-1 text-xs text-slate-500">
              {searchTerm || activeFilter !== "all"
                ? "Try adjusting your filters"
                : "Get started by creating your first testimonial"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Quote
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Rating
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedTestimonials.map((testimonial) => (
                  <tr key={testimonial.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={testimonial.avatar} name={testimonial.name} />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{testimonial.name}</p>
                          <p className="text-xs text-slate-500">{formatDate(testimonial.created_at)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600">{testimonial.location}</span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="max-w-md text-sm text-slate-600 line-clamp-2">{testimonial.quote}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 text-yellow-400">
                        {Array.from({ length: 5 }, (_, i) => (
                          <svg
                            key={i}
                            viewBox="0 0 24 24"
                            fill={i < testimonial.rating ? "currentColor" : "none"}
                            stroke={i < testimonial.rating ? "currentColor" : "currentColor"}
                            className={`h-4 w-4 ${i < testimonial.rating ? "text-yellow-400" : "text-slate-300"}`}
                          >
                            <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          testimonial.is_active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {testimonial.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(testimonial.id)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(testimonial.id)}
                          disabled={deletingId === testimonial.id}
                          className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === testimonial.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

