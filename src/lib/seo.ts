import type { Metadata } from "next";
import type { PackageDetail } from "@/lib/packages";

export const siteName = "citymuscattours";
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://citymuscattours.example.com";
export const siteDescription =
  "Discover curated city tours, premium car rentals, and seamless airport transfers with citymuscattours. Plan, book, and manage travel experiences with ease.";
export const defaultOgImagePath = "/assets/hero/main.jpeg";
export const defaultKeywords = [
  "travel",
  "tours",
  "vacation packages",
  "car rental",
  "airport transfer",
  "citymuscattours",
  "muscat tours",
  "oman tours",
];

const socialProfiles = [
  "https://www.facebook.com/citymuscattours",
  "https://www.instagram.com/citymuscattours",
  "https://www.linkedin.com/company/citymuscattours",
];

export const brandEmail = "Travelalshaheed2016@gmail.com";
export const brandPhone = "+968 9949 8697";

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: siteName,
  url: siteUrl,
  logo: absoluteUrl("/logo.jpg"),
  image: absoluteUrl(defaultOgImagePath),
  description: siteDescription,
  telephone: brandPhone,
  email: brandEmail,
  sameAs: socialProfiles,
  address: {
    "@type": "PostalAddress",
    addressCountry: "OM",
    addressLocality: "Muscat",
  },
  makesOffer: [
    {
      "@type": "Offer",
      name: "City Tours",
      areaServed: "Muscat",
    },
    {
      "@type": "Offer",
      name: "Car Rental",
      areaServed: "Oman",
    },
    {
      "@type": "Offer",
      name: "Airport Transport",
      areaServed: "Muscat International Airport",
    },
  ],
};

export function absoluteUrl(path = ""): string {
  if (!path) {
    return siteUrl;
  }
  if (path.startsWith("http")) {
    return path;
  }
  const normalizedBase = siteUrl.endsWith("/") ? siteUrl.slice(0, -1) : siteUrl;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function buildOgImage(image?: string) {
  return [
    {
      url: absoluteUrl(image ?? defaultOgImagePath),
      width: 1200,
      height: 630,
      alt: "citymuscattours premium travel experiences",
    },
  ];
}

export type PageMetadataInput = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  keywords?: string[];
  publishedTime?: string;
  modifiedTime?: string;
};

export function buildPageMetadata(config: PageMetadataInput): Metadata {
  const { title, description, path = "/", image, keywords = [], publishedTime, modifiedTime } = config;
  const mergedKeywords = Array.from(new Set([...defaultKeywords, ...keywords]));
  const ogImages = buildOgImage(image);
  const canonicalPath = path.startsWith("http") ? path : path.startsWith("/") ? path : `/${path}`;
  const canonicalUrl = absoluteUrl(canonicalPath);

  return {
    title: title.includes(siteName) ? title : `${title} | ${siteName}`,
    description,
    keywords: mergedKeywords,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      siteName,
      title: title.includes(siteName) ? title : `${title} | ${siteName}`,
      description,
      images: ogImages,
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      site: "@citymuscattours",
      creator: "@citymuscattours",
      title: title.includes(siteName) ? title : `${title} | ${siteName}`,
      description,
      images: ogImages.map((img) => img.url),
    },
  };
}

export function buildPackageMetadata(travelPackage: PackageDetail): Metadata {
  const description = travelPackage.overview ?? travelPackage.description ?? siteDescription;
  const path = travelPackage.detailPath ?? `/packages/${travelPackage.slug ?? travelPackage.id}`;
  const keywords = [
    travelPackage.destination,
    travelPackage.categoryTitle,
    travelPackage.duration,
    travelPackage.location,
  ].filter(Boolean) as string[];

  const metadata = buildPageMetadata({
    title: `${travelPackage.title}`,
    description,
    path,
    image: travelPackage.image,
    keywords,
  });

  metadata.openGraph = {
    ...(metadata.openGraph ?? {}),
    type: "website",
  };

  const existingOther =
    (metadata.other as Record<string, string | number | (string | number)[]>) ?? {};

  metadata.other = {
    ...existingOther,
    "product:price:amount": travelPackage.price.toString(),
    "product:price:currency": travelPackage.currency ?? "INR",
  };

  if (travelPackage.reviews) {
    metadata.openGraph = {
      ...metadata.openGraph,
      determiner: "the",
    };
  }

  return metadata;
}

export function buildPackageJsonLd(travelPackage: PackageDetail) {
  const description = travelPackage.overview ?? travelPackage.description ?? siteDescription;
  const url = absoluteUrl(travelPackage.detailPath ?? `/packages/${travelPackage.slug ?? travelPackage.id}`);
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: travelPackage.title,
    description,
    image: absoluteUrl(travelPackage.image),
    url,
    tourType: travelPackage.categoryTitle,
    offers: {
      "@type": "Offer",
      url,
      price: travelPackage.price,
      priceCurrency: travelPackage.currency ?? "INR",
      availability: "https://schema.org/InStock",
      validFrom: new Date().toISOString(),
    },
    providesService: travelPackage.highlights?.map((highlight) => ({
      "@type": "Service",
      name: highlight,
    })),
    itemOffered: {
      "@type": "Product",
      name: travelPackage.title,
      description,
    },
  };

  if (travelPackage.rating) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: travelPackage.rating,
      reviewCount: travelPackage.reviews ?? Math.max(Math.round(travelPackage.rating * 50), 1),
    };
  }

  if (travelPackage.duration) {
    data.itinerary = {
      "@type": "ItemList",
      numberOfItems: 1,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: travelPackage.duration,
        },
      ],
    };
  }

  if (travelPackage.location || travelPackage.destination) {
    data.areaServed = {
      "@type": "AdministrativeArea",
      name: travelPackage.location ?? travelPackage.destination,
    };
  }

  return data;
}

