"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import CategoryPageTemplate from "./CategoryPageTemplate";
import { api } from "@/lib/api";
import { ApiPackage, normalizeApiPackage, NormalizedPackage } from "@/utils/packageTransformers";

type CategoryPackagesClientProps = {
  categorySlug: string;
  children?: ReactNode;
  compact?: boolean;
};

export default function CategoryPackagesClient({ categorySlug, children, compact = false }: CategoryPackagesClientProps) {
  const [packages, setPackages] = useState<NormalizedPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPackages = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getPackages({ category: categorySlug, archived: false, limit: 200 });
        if (!isMounted) {
          return;
        }
        const data = ((response?.data ?? []) as ApiPackage[])
          .map((pkg) => normalizeApiPackage(pkg))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPackages(data);
      } catch (err) {
        console.error(`Failed to load packages for ${categorySlug}`, err);
        if (isMounted) {
          setError("Unable to load packages right now. Please try again shortly.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPackages();
    return () => {
      isMounted = false;
    };
  }, [categorySlug]);

  const templatePackages = useMemo(
    () =>
      packages.map((pkg) => ({
        id: pkg.id,
        slug: pkg.slug,
        detailPath: `/packages/${pkg.slug ?? pkg.id}`,
        title: pkg.title,
        description: pkg.description,
        duration: pkg.duration,
        price: pkg.price,
        image: pkg.image,
        perks: pkg.highlights,
        rating: pkg.rating,
      })),
    [packages],
  );

  return (
    <CategoryPageTemplate packages={templatePackages} compact={compact}>
      <>
        {children}
        {loading && (
          <div className="mx-auto mt-6 max-w-4xl rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-slate-600">
            Loading curated packages...
          </div>
        )}
        {error && (
          <div className="mx-auto mt-4 max-w-4xl rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
            {error}
          </div>
        )}
      </>
    </CategoryPageTemplate>
  );
}

