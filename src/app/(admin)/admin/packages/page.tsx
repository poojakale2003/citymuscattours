"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { formatDisplayCurrency } from "@/lib/currency";

type Package = {
  id: number;
  name: string;
  category: string;
  price: number;
  offer_price?: number;
  is_featured: boolean;
  is_archived: boolean;
  created_at: string;
};

export default function AdminPackagesPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [archivingId, setArchivingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const parseIsArchived = (value: unknown): boolean => {
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value === "number") {
      return value === 1;
    }
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      return normalized === "1" || normalized === "true";
    }
    return false;
  };

  useEffect(() => {
    // Check for created/updated params from URL
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const createdParam = urlParams.get("created") === "1";
      const updatedParam = urlParams.get("updated") === "1";
      setCreated(createdParam);
      setUpdated(updatedParam);
    }

    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      // Explicitly request non-archived packages (archived: false)
      const response = await api.getPackages({ archived: false });
      const normalizedPackages = (response.data || []).map((pkg: any) => ({
        ...pkg,
        is_archived: parseIsArchived(pkg.is_archived ?? pkg.isArchived),
      }));
      const nonArchivedPackages = normalizedPackages.filter((pkg: Package) => !pkg.is_archived);
      setPackages(nonArchivedPackages);
    } catch (err: any) {
      console.error("Error loading packages:", err);
      setError(err.message || "Failed to load packages");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (packageId: number) => {
    router.push(`/admin/packages/${packageId}/edit`);
  };

  const handleDelete = async (packageId: number) => {
    if (!confirm("Are you sure you want to delete this package? This action cannot be undone.")) {
      return;
    }

    try {
      setDeletingId(packageId);
      await api.deletePackage(packageId.toString());
      await loadPackages(); // Reload packages after deletion
    } catch (err: any) {
      console.error("Error deleting package:", err);
      alert(err.message || "Failed to delete package");
    } finally {
      setDeletingId(null);
    }
  };

  const handleArchive = async (packageId: number) => {
    if (!confirm("Are you sure you want to archive this package? It will be moved to the archived packages list.")) {
      return;
    }

    try {
      setArchivingId(packageId);
      await api.archivePackage(packageId.toString());
      // Remove the archived package from the current list immediately
          setPackages((prev) => prev.filter((pkg) => pkg.id !== packageId));
      // Optionally reload to ensure consistency
      setTimeout(() => loadPackages(), 500);
    } catch (err: any) {
      console.error("Error archiving package:", err);
      alert(err.message || "Failed to archive package");
      // Reload on error to ensure state is correct
      await loadPackages();
    } finally {
      setArchivingId(null);
    }
  };

  const categoryOptions = useMemo(() => {
    const unique = new Set<string>();
    packages.forEach((pkg) => {
      if (pkg.category) unique.add(pkg.category);
    });
    return ["all", ...Array.from(unique)];
  }, [packages]);

  const filteredPackages = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return packages.filter((pkg) => {
      const matchesCategory = categoryFilter === "all" || pkg.category === categoryFilter;
      const matchesSearch =
        term.length === 0 ||
        pkg.name.toLowerCase().includes(term) ||
        (pkg.category ?? "").toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [packages, categoryFilter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredPackages.length / ITEMS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedPackages = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPackages.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPackages, currentPage]);

  const formatPrice = (price: number, offerPrice?: number) => {
    const displayPrice = offerPrice && offerPrice > 0 ? offerPrice : price;
    return formatDisplayCurrency(displayPrice, "INR");
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Packages</h1>
          <p className="text-sm text-slate-600">
            Manage product inventory, pricing, and availability windows.
          </p>
        </div>
        <Link
          href="/admin/packages/new"
          className="inline-flex items-center justify-center rounded-full bg-[var(--color-brand-600)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-700)]"
        >
          Create package
        </Link>
      </header>

      {created ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 px-5 py-4 text-sm text-emerald-700">
          <p className="font-semibold">Package saved successfully!</p>
          <p className="mt-1 text-xs text-emerald-600/80">
            Your new travel package has been added to the list.
          </p>
        </div>
      ) : null}
      {updated ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 px-5 py-4 text-sm text-emerald-700">
          <p className="font-semibold">Package updated successfully!</p>
          <p className="mt-1 text-xs text-emerald-600/80">
            Your travel package has been updated.
          </p>
        </div>
      ) : null}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50/70 px-5 py-4 text-sm text-red-700">
          <p className="font-semibold">Error loading packages</p>
          <p className="mt-1 text-xs text-red-600/80">{error}</p>
        </div>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_25px_70px_-45px_rgb(15_23_42/0.6)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search packages"
              className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
            />
            <select
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200) sm:w-64"
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "All categories" : option}
                </option>
              ))}
            </select>
          </div>
          <div className="text-xs text-slate-500">
            Showing {filteredPackages.length} result{filteredPackages.length === 1 ? "" : "s"}
          </div>
        </div>
      </section>

      {filteredPackages.length > ITEMS_PER_PAGE && (
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
          <div className="py-12 text-center text-sm text-slate-600">Loading packages...</div>
        ) : filteredPackages.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-600">No packages found. Create your first package to get started.</div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[720px] overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-slate-600">
                  Package
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-600">
                  Category
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-600">
                  Price
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-600">
                  Status
                </th>
                <th className="px-6 py-3 text-right font-semibold text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
                {paginatedPackages.map((travelPackage) => (
                <tr key={travelPackage.id} className="hover:bg-slate-50/60">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {travelPackage.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                      {travelPackage.category || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                      {formatPrice(travelPackage.price, travelPackage.offer_price)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          travelPackage.is_featured
                            ? "bg-[var(--color-success)]/15 text-[var(--color-success)]"
                            : "bg-slate-100 text-slate-700"
                        }`}
                    >
                        {travelPackage.is_featured ? "Featured" : "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                      <div className="flex flex-col gap-2 sm:inline-flex sm:flex-row">
                      <button
                        type="button"
                        onClick={() => handleEdit(travelPackage.id)}
                        className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleArchive(travelPackage.id)}
                          disabled={archivingId === travelPackage.id}
                          className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:opacity-50"
                      >
                          {archivingId === travelPackage.id ? "Archiving..." : "Archive"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(travelPackage.id)}
                          disabled={deletingId === travelPackage.id}
                          className="rounded-full border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:opacity-50"
                        >
                          {deletingId === travelPackage.id ? "Deleting..." : "Delete"}
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
      </section>
    </div>
  );
}
