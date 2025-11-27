import { NextResponse, type NextRequest } from "next/server";
import type { PackageDetail } from "@/lib/packages";
import { ApiPackage, apiPackageToDetail } from "@/utils/packageTransformers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost/php-backend/api";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const packageId = id?.replace(/\/+$/, "") ?? "";

  if (!packageId) {
    return NextResponse.json({ error: "Missing package id" }, { status: 400 });
  }

  try {
    const detail = await fetchPackageDetail(packageId);
    if (!detail) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }
    return NextResponse.json({ data: detail });
  } catch (error) {
    console.error("[live-packages] error fetching package", error);
    return NextResponse.json({ error: "Failed to fetch package" }, { status: 500 });
  }
}

async function fetchPackageDetail(id: string): Promise<PackageDetail | null> {
  const encodedId = encodeURIComponent(id);
  const directResponse = await fetch(`${API_BASE_URL}/packages/${encodedId}`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (directResponse.ok) {
    const directJson = await directResponse.json();
    const directPkg = directJson?.data as ApiPackage | undefined;
    if (directPkg) {
      return apiPackageToDetail(directPkg);
    }
    console.warn(`[live-packages] direct fetch -> no data field for slug "${id}"`);
  } else {
    console.warn(
      `[live-packages] direct fetch failed for "${id}" status=${directResponse.status} ${directResponse.statusText}`,
    );
    const preview = await safeReadBody(directResponse);
    if (preview) {
      console.warn(`[live-packages] direct fetch body preview: ${preview}`);
    }
  }

  const listUrl = new URL(`${API_BASE_URL}/packages`);
  listUrl.searchParams.set("limit", "500");
  listUrl.searchParams.set("archived", "false");
  const listResponse = await fetch(listUrl, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!listResponse.ok) {
    console.warn(
      `[live-packages] list fetch failed for "${id}" status=${listResponse.status} ${listResponse.statusText}`,
    );
    const preview = await safeReadBody(listResponse);
    if (preview) {
      console.warn(`[live-packages] list fetch body preview: ${preview}`);
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
    console.warn(`[live-packages] no package matched slug/id "${id}" within list of ${items.length} entries`);
    return null;
  }

  return apiPackageToDetail(match);
}

async function safeReadBody(response: Response): Promise<string | null> {
  try {
    const text = await response.text();
    return text.slice(0, 500);
  } catch {
    return null;
  }
}


