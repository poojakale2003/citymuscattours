import type { Metadata } from "next";
import PackageDetailServer from "@/components/packages/PackageDetailServer";
import { buildPageMetadata, siteDescription } from "@/lib/seo";
import type { PackageDetail } from "@/lib/packages";
import type { ApiPackage } from "@/utils/packageTransformers";
import { apiPackageToDetail } from "@/utils/packageTransformers";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost/php-backend/api";

const sanitizeRouteId = (value?: string) => value?.replace(/\/+$/, "") ?? undefined;

async function fetchPackageDetail(id: string): Promise<PackageDetail | null> {
  try {
    const encodedId = encodeURIComponent(id);
    const directResponse = await fetch(`${API_BASE_URL}/packages/${encodedId}`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });

    if (directResponse.ok) {
      const directJson = await directResponse.json();
      const directPkg = directJson?.data as ApiPackage | undefined;
      if (directPkg) {
        return apiPackageToDetail(directPkg);
      }
      console.warn(`[packages/[id]] direct fetch -> no data field for slug "${id}"`);
    } else {
      console.warn(
        `[packages/[id]] direct fetch failed for "${id}" status=${directResponse.status} ${directResponse.statusText}`,
      );
      const preview = await safeReadBody(directResponse);
      if (preview) {
        console.warn(`[packages/[id]] direct fetch body preview: ${preview}`);
      }
    }

    const listUrl = new URL(`${API_BASE_URL}/packages`);
    listUrl.searchParams.set("limit", "500");
    listUrl.searchParams.set("archived", "false");
    const listResponse = await fetch(listUrl, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });

    if (!listResponse.ok) {
      console.warn(
        `[packages/[id]] list fetch failed for "${id}" status=${listResponse.status} ${listResponse.statusText}`,
      );
      const preview = await safeReadBody(listResponse);
      if (preview) {
        console.warn(`[packages/[id]] list fetch body preview: ${preview}`);
      }
      return null;
    }

    const listJson = await listResponse.json();
    const items = Array.isArray(listJson?.data) ? (listJson.data as ApiPackage[]) : [];
    const normalizedTarget = id.toLowerCase();
    const match = items.find((pkg) => {
      const pkgId = String(pkg.id ?? "").toLowerCase();
      const slug = (pkg.slug ?? "").toLowerCase();
      return pkgId === normalizedTarget || slug === normalizedTarget;
    });

    if (!match) {
      console.warn(`[packages/[id]] no package matched slug/id "${id}" within list of ${items.length} entries`);
      return null;
    }

    return apiPackageToDetail(match);
  } catch (error) {
    console.error("[packages/[id]] fetch error", error);
    return null;
  }
}

async function safeReadBody(response: Response): Promise<string | null> {
  try {
    const text = await response.text();
    return text.slice(0, 500);
  } catch {
    return null;
  }
}

type RouteParams = { id?: string };

export async function generateMetadata({ params }: { params: Promise<RouteParams> }): Promise<Metadata> {
  const { id } = await params;
  const resolvedId = sanitizeRouteId(id);
  if (!resolvedId) {
    return buildPageMetadata({
      title: "Experience not found",
      description: siteDescription,
      path: "/packages",
    });
  }
  return buildPageMetadata({
    title: `Discover · ${resolvedId}`,
    description: siteDescription,
    path: `/packages/${resolvedId}`,
  });
}

export default async function PackageDetailPage({ params }: { params: Promise<RouteParams> }) {
  const { id } = await params;
  const resolvedId = sanitizeRouteId(id);

  if (!resolvedId) {
    return notFound();
  }

  const travelPackage = await fetchPackageDetail(resolvedId);

  if (!travelPackage) {
    return notFound();
  }

  return <PackageDetailServer travelPackage={travelPackage} />;
}
