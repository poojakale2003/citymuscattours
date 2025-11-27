import type { Metadata } from "next";
import PackagesPageClient from "./PackagesPageClient";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Curated travel packages & bespoke itineraries",
  description: "Compare handpicked tours, private transfers, and luxury getaways designed by citymuscattours concierge.",
  path: "/packages",
  keywords: ["luxury packages", "oman experiences", "bespoke itineraries"],
});

export default function PackagesPage() {
  return <PackagesPageClient />;
}

