import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PackageDetailServer from "@/components/packages/PackageDetailServer";
import { getPackageById, getAllPackages } from "@/lib/packages";
import { categoryPackages } from "@/lib/data";
import { buildPackageMetadata, buildPageMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  const packages = categoryPackages["city-tours"] || [];
  return packages.map((pkg) => ({
    id: pkg.id,
  }));
}

function resolvePackage(id: string) {
  let travelPackage = getPackageById(id);
  if (!travelPackage) {
    travelPackage = getAllPackages().find((pkg) => pkg.detailPath.endsWith(`/${id}`));
  }
  return travelPackage;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const travelPackage = resolvePackage(id);
  return travelPackage
    ? buildPackageMetadata(travelPackage)
    : buildPageMetadata({
        title: "City tour not found",
        description: "Browse curated city tours designed by our concierge team.",
        path: `/city-tours/${id}`,
      });
}

export default async function CityTourDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const travelPackage = resolvePackage(id);

  if (!travelPackage) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[city-tours route] Missing package for id", id);
    }
    return notFound();
  }

  return <PackageDetailServer travelPackage={travelPackage} />;
}

