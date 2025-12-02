import type { MetadataRoute } from "next";
import { getAllPackages } from "@/lib/packages";
import { blogStories } from "@/lib/blogStories";
import { categoryPackages } from "@/lib/data";
import { siteUrl } from "@/lib/seo";

const staticRoutes = [
  "",
  "/city-tours",
  "/car-rental",
  "/airport-transport",
  "/hotel-booking",
  "/packages",
  "/blog",
  "/about",
  "/contact",
  "/booking",
  "/terms",
  "/privacy",
  "/cancellation-policy",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const packageRoutes = getAllPackages().map((pkg) => pkg.detailPath ?? `/packages/${pkg.id}`);
  const categoryDetailRoutes = Object.entries(categoryPackages).flatMap(([category, packages]) =>
    packages.map((pkg) => `/${category}/${pkg.id}`),
  );
  const blogRoutes = blogStories.map((story) => `/blog/${story.slug}`);
  const uniqueRoutes = Array.from(new Set([...staticRoutes, ...packageRoutes, ...categoryDetailRoutes, ...blogRoutes]));

  return uniqueRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
  }));
}

