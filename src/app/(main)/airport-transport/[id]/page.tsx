import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PackageDetailServer from "@/components/packages/PackageDetailServer";
import { getPackageById, getAllPackages } from "@/lib/packages";
import { categoryPackages } from "@/lib/data";
import { buildPackageMetadata, buildPageMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  const packages = categoryPackages["airport-transport"] || [];
  return packages.map((pkg) => ({
    id: pkg.id,
  }));
}

type AirportTransportPageProps = {
  params: Promise<{ id: string }>;
};

function resolvePackage(id: string) {
  let travelPackage = getPackageById(id);
  if (!travelPackage) {
    travelPackage = getAllPackages().find((pkg) => pkg.detailPath.endsWith(`/${id}`));
  }
  return travelPackage;
}

export async function generateMetadata({ params }: AirportTransportPageProps): Promise<Metadata> {
  const { id } = await params;
  const travelPackage = resolvePackage(id);
  return travelPackage
    ? buildPackageMetadata(travelPackage)
    : buildPageMetadata({
        title: "Airport transfer not found",
        description: "Browse 24/7 airport transfers and premium meet & greet services.",
        path: `/airport-transport/${id}`,
      });
}

export default async function AirportTransportDetailPage({ params }: AirportTransportPageProps) {
  const { id } = await params;
  const travelPackage = resolvePackage(id);

  if (!travelPackage) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[airport-transport route] Missing package for id", id);
    }
    return notFound();
  }

  return <PackageDetailServer travelPackage={travelPackage} />;
}

