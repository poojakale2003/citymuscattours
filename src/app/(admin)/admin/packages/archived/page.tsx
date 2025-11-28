"use client";

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

export default function ArchivedPackagesPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unarchivingId, setUnarchivingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      // Explicitly request archived packages (archived: true)
      console.log("Loading archived packages - making API call with archived: true");
      // Make the API call and log the full URL
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost/php-backend/api'}/packages?archived=true`;
      console.log("Full API URL:", apiUrl);
      const response = await api.getPackages({ archived: true });
      console.log("API Response (full):", response);
      console.log("API Response (data only):", {
        hasData: !!response.data,
        dataLength: response.data?.length || 0,
        firstPackage: response.data?.[0] ? {
          id: response.data[0].id,
          name: response.data[0].name,
          is_archived: response.data[0].is_archived,
          is_archived_type: typeof response.data[0].is_archived,
          fullPackage: response.data[0]
        } : null,
        allPackages: response.data?.map((p: any) => ({
          id: p.id,
          name: p.name,
          is_archived: p.is_archived,
          is_archived_type: typeof p.is_archived,
          fullPackage: p
        })) || []
      });
      
      // Filter to only show archived packages (handle both boolean true and integer 1)
      // First, let's see what we actually got
      const allPackages = response.data || [];
      console.log("All packages from API (before filtering):", allPackages);
      
      // Log the first package's structure to see all fields
      if (allPackages.length > 0) {
        console.log("First package structure:", {
          keys: Object.keys(allPackages[0]),
          fullPackage: allPackages[0],
          is_archived_value: allPackages[0].is_archived,
          is_archived_type: typeof allPackages[0].is_archived,
          isArchived_value: (allPackages[0] as any).isArchived,
          isArchived_type: typeof (allPackages[0] as any).isArchived
        });
      }
      
      const archivedPackages = allPackages
        .filter((pkg: any) => {
          // Check both snake_case and camelCase field names
          const isArchivedValue = pkg.is_archived !== undefined ? pkg.is_archived : pkg.isArchived;
          
          // Handle multiple possible formats: true, 1, '1', 'true', or any truthy value
          const isArchived = 
            isArchivedValue === true || 
            isArchivedValue === 1 || 
            isArchivedValue === '1' ||
            isArchivedValue === 'true' ||
            String(isArchivedValue).toLowerCase() === 'true' ||
            (typeof isArchivedValue === 'string' && isArchivedValue.trim() === '1');
          
          return isArchived;
        })
        .map((pkg: any) => {
          // Ensure prices are properly parsed as numbers
          const price = typeof pkg.price === 'string' ? parseFloat(pkg.price) : (typeof pkg.price === 'number' ? pkg.price : 0);
          const offerPrice = pkg.offer_price 
            ? (typeof pkg.offer_price === 'string' ? parseFloat(pkg.offer_price) : (typeof pkg.offer_price === 'number' ? pkg.offer_price : undefined))
            : undefined;
          
          return {
            ...pkg,
            price: isNaN(price) ? 0 : price,
            offer_price: offerPrice !== undefined && !isNaN(offerPrice) ? offerPrice : undefined,
          };
        });
      
      setPackages(archivedPackages);
    } catch (err: any) {
      console.error("Error loading archived packages:", err);
      setError(err.message || "Failed to load archived packages");
    } finally {
      setLoading(false);
    }
  };

  const handleUnarchive = async (packageId: number) => {
    if (!confirm("Are you sure you want to unarchive this package? It will be restored to the active packages list.")) {
      return;
    }

    try {
      setUnarchivingId(packageId);
      await api.unarchivePackage(packageId.toString());
      // Remove the unarchived package from the archived list immediately
      setPackages((prev) => prev.filter((pkg) => pkg.id !== packageId));
      // Optionally reload to ensure consistency
      setTimeout(() => loadPackages(), 500);
    } catch (err: any) {
      console.error("Error unarchiving package:", err);
      alert(err.message || "Failed to unarchive package");
      // Reload on error to ensure state is correct
      await loadPackages();
    } finally {
      setUnarchivingId(null);
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

  // Format price for admin display - show exact price from database in OMR
  const formatPrice = (price: number, offerPrice?: number) => {
    const displayPrice = offerPrice && offerPrice > 0 ? offerPrice : price;
    // In admin panel, show the exact price from database in OMR (no conversion)
    if (displayPrice <= 0 || isNaN(displayPrice)) {
      return "OMR 0.000";
    }
    // Format as OMR with 3 decimal places (OMR standard)
    return new Intl.NumberFormat("en-OM", {
      style: "currency",
      currency: "OMR",
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(displayPrice);
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Archived Packages</h1>
          <p className="text-sm text-slate-600">
            View and manage archived packages. Unarchive to restore them to the active list.
          </p>
        </div>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50/70 px-5 py-4 text-sm text-red-700">
          <p className="font-semibold">Error loading archived packages</p>
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
              placeholder="Search archived packages"
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
            Showing {filteredPackages.length} archived result{filteredPackages.length === 1 ? "" : "s"}
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
          <div className="py-12 text-center text-sm text-slate-600">Loading archived packages...</div>
        ) : filteredPackages.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-600">No archived packages found.</div>
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
                    Archived Date
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
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(travelPackage.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end gap-2 sm:inline-flex sm:flex-row sm:items-center">
                        <button
                          type="button"
                          onClick={() => handleUnarchive(travelPackage.id)}
                          disabled={unarchivingId === travelPackage.id}
                          className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:opacity-50"
                        >
                          {unarchivingId === travelPackage.id ? "Unarchiving..." : "Unarchive"}
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

