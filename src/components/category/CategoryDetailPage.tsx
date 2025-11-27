import { notFound } from "next/navigation";
import PackageDetail from "@/components/packages/PackageDetail";
import { getPackageById, getCategoryPackageById } from "@/lib/packages";
import type { PackageCategoryKey, PackageDetail as PackageDetailType } from "@/lib/packages";

export default function CategoryDetailPage({ category, id }: { category: PackageCategoryKey; id: string }) {
  const travelPackage = getPackageById(id) ?? getCategoryPackageById(category, id);
  const minSelectableDate = new Date().toISOString().split("T")[0];

  if (!travelPackage) {
    return notFound();
  }

  return <PackageDetail initialPackage={travelPackage} minSelectableDate={minSelectableDate} />;
}

export function PackageDetailContent({ travelPackage }: { travelPackage: PackageDetailType }) {
  const minSelectableDate = new Date().toISOString().split("T")[0];
  return <PackageDetail initialPackage={travelPackage} minSelectableDate={minSelectableDate} />;
}

