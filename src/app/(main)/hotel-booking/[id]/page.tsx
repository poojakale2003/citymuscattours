import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PackageDetailServer from "@/components/packages/PackageDetailServer";
import { getPackageById, getAllPackages } from "@/lib/packages";
import { categoryPackages } from "@/lib/data";
import { buildPackageMetadata, buildPageMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  const packages = categoryPackages["hotel-booking"] || [];
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
        title: "Hotel package not found",
        description: "Browse curated hotel packages designed by our concierge team.",
        path: `/hotel-booking/${id}`,
      });
}

export default async function HotelBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const travelPackage = resolvePackage(id);

  if (!travelPackage) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[hotel-booking route] Missing package for id", id);
    }
    return notFound();
  }

  return <PackageDetailServer travelPackage={travelPackage} />;
}

