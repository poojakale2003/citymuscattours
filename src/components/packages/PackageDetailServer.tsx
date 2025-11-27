import Script from "next/script";
import type { PackageDetail } from "@/lib/packages";
import PackageDetailClient from "@/components/packages/PackageDetail";
import { buildPackageJsonLd } from "@/lib/seo";

export default function PackageDetailServer({ travelPackage }: { travelPackage: PackageDetail }) {
  const jsonLd = buildPackageJsonLd(travelPackage);
  const todayIso = new Date().toISOString().split("T")[0];
  return (
    <>
      <Script
        id={`package-schema-${travelPackage.id}`}
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PackageDetailClient initialPackage={travelPackage} minSelectableDate={todayIso} />
    </>
  );
}

