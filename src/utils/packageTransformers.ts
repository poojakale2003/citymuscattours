type MaybeString = string | number | null | undefined;

import type { PackageDetail } from "@/lib/packages";

export type ApiPackage = {
  id: number | string;
  slug?: string | null;
  name?: string | null;
  description?: string | null;
  destination?: string | null;
  city?: string | null;
  category?: string | null;
  duration?: string | null;
  duration_days?: MaybeString;
  duration_nights?: MaybeString;
  price?: MaybeString;
  offer_price?: MaybeString;
  currency?: MaybeString;
  highlights?: unknown;
  feature_image?: string | null;
  rating?: MaybeString;
  created_at?: string | null;
  updated_at?: string | null;
  images?: unknown;
  includes?: unknown;
  excludes?: unknown;
  essentials?: unknown;
  itinerary?: unknown;
  faq?: unknown;
  overview?: string | null;
  location?: string | null;
  meeting_point?: string | null;
  address1?: string | null;
  address?: string | null;
  languages?: unknown;
  availability?: string | null;
  mobile_ticket?: string | null;
  pickup_included?: MaybeString | boolean;
  age_restriction?: string | null;
  badge?: string | null;
  category_title?: string | null;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=900&fit=crop&auto=format&q=60";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost/php-backend/api";
const UPLOAD_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export type NormalizedPackage = {
  id: string;
  slug?: string;
  title: string;
  description: string;
  destination: string;
  duration: string;
  price: number;
  currency?: string;
  category: string;
  rating: number;
  highlights: string[];
  image: string;
  createdAt: string;
};

const toNumber = (value: MaybeString, fallback = 0): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "" || trimmed === "null") {
      return fallback;
    }
    const parsed = parseFloat(trimmed);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const toPositiveNumber = (value: MaybeString, fallback = 0): number => {
  const parsed = toNumber(value, fallback);
  // Round to 2 decimal places to preserve precision from database
  return parsed > 0 ? Math.round(parsed * 100) / 100 : fallback;
};

export const buildPackageImage = (path?: string | null): string => {
  if (!path) {
    return FALLBACK_IMAGE;
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  let normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (normalizedPath.startsWith("/uploads/")) {
    normalizedPath = `/public${normalizedPath}`;
  }
  return `${UPLOAD_BASE_URL}${normalizedPath}`;
};

export const parsePackageHighlights = (input: unknown): string[] => {
  if (Array.isArray(input)) {
    return input
      .flatMap((item) => (typeof item === "string" ? item : String(item ?? "")))
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => (typeof item === "string" ? item : String(item ?? "")))
          .map((item) => item.trim())
          .filter(Boolean);
      }
    } catch {
      // string might be comma/newline separated
      return input
        .split(/[\n,]+/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return input
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const parseStringList = (input: unknown, fallback: string[] = []): string[] => {
  if (Array.isArray(input)) {
    return input
      .map((item) => (typeof item === "string" ? item : String(item ?? "")))
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof input === "string") {
    if (!input.trim()) {
      return fallback;
    }
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => (typeof item === "string" ? item : String(item ?? "")))
          .map((item) => item.trim())
          .filter(Boolean);
      }
    } catch {
      // Ignore JSON errors
    }
    return input
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return fallback;
};

type StructuredEntry = { day?: string; title?: string; description?: string; question?: string; answer?: string };

const parseStructuredList = (input: unknown): StructuredEntry[] => {
  if (!input) {
    return [];
  }

  const normalizeEntry = (entry: unknown): StructuredEntry | null => {
    if (typeof entry === "object" && entry !== null) {
      const { day, title, description, question, answer } = entry as Record<string, unknown>;
      const normalized: StructuredEntry = {};
      if (typeof day === "string") normalized.day = day;
      if (typeof title === "string") normalized.title = title;
      if (typeof description === "string") normalized.description = description;
      if (typeof question === "string") normalized.question = question;
      if (typeof answer === "string") normalized.answer = answer;
      if (Object.keys(normalized).length > 0) {
        return normalized;
      }
      return null;
    }
    return null;
  };

  if (Array.isArray(input)) {
    return input.map(normalizeEntry).filter((entry): entry is StructuredEntry => Boolean(entry));
  }

  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) {
        return parsed.map(normalizeEntry).filter((entry): entry is StructuredEntry => Boolean(entry));
      }
    } catch {
      // ignore parse errors
    }
  }

  return [];
};

export const formatPackageDuration = (pkg: ApiPackage): string => {
  if (pkg.duration && pkg.duration.trim().length > 0) {
    return pkg.duration.trim();
  }

  const days = toNumber(pkg.duration_days);
  const nights = toNumber(pkg.duration_nights);
  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days} day${days === 1 ? "" : "s"}`);
  }
  if (nights > 0) {
    parts.push(`${nights} night${nights === 1 ? "" : "s"}`);
  }

  if (parts.length > 0) {
    return parts.join(" · ");
  }

  return "Flexible";
};

export const deriveDestination = (pkg: ApiPackage): string => {
  return pkg.destination?.trim() || pkg.city?.trim() || "Oman";
};

export const normalizeApiPackage = (pkg: ApiPackage): NormalizedPackage => {
  const highlights = parsePackageHighlights(pkg.highlights);
  const normalizedHighlights =
    highlights.length > 0 ? highlights : ["Private concierge support", "Flexible departures"];
  // Get price with proper precision handling
  // Prefer offer_price if available, otherwise use regular price
  const offerPrice = toPositiveNumber(pkg.offer_price);
  const regularPrice = toPositiveNumber(pkg.price);
  const price = offerPrice > 0 ? offerPrice : (regularPrice > 0 ? regularPrice : 0);

  const currencyCode =
    typeof pkg.currency === "string"
      ? pkg.currency.trim()
      : typeof pkg.currency === "number"
        ? String(pkg.currency)
        : undefined;

  return {
    id: String(pkg.id ?? ""),
    slug: typeof pkg.slug === "string" ? pkg.slug : undefined,
    title: pkg.name?.trim() || "Curated experience",
    description: pkg.description?.trim() || deriveDestination(pkg),
    destination: deriveDestination(pkg),
    duration: formatPackageDuration(pkg),
    price,
    currency: currencyCode || "INR",
    category: pkg.category?.trim() || "experiences",
    rating: Number(pkg.rating ?? 4.8) || 4.8,
    highlights: normalizedHighlights,
    image: buildPackageImage(pkg.feature_image),
    createdAt: pkg.created_at ?? pkg.updated_at ?? new Date().toISOString(),
  };
};

const toBoolean = (value: unknown, fallback = false): boolean => {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value > 0;
  }
  if (typeof value === "string") {
    return value === "1" || value.toLowerCase() === "true";
  }
  return fallback;
};

export const apiPackageToDetail = (pkg: ApiPackage): PackageDetail => {
  const normalized = normalizeApiPackage(pkg);
  const gallery = parseStringList(pkg.images).map((path) => buildPackageImage(path));
  const includes = parseStringList(pkg.includes, normalized.highlights);
  const excludes = parseStringList(pkg.excludes, ["Personal expenses", "Travel insurance"]);
  const essentials = parseStringList(pkg.essentials, [
    "Flexible start dates available on request.",
    "Speak with our concierge to customise accommodations and dining.",
    "Passport and visa requirements vary by destination.",
  ]);
  const languages = parseStringList(pkg.languages, ["English"]);
  const itinerary = parseStructuredList(pkg.itinerary);
  const faq = parseStructuredList(pkg.faq)
    .filter((entry): entry is Required<Pick<StructuredEntry, "question" | "answer">> => {
      return Boolean(entry?.question && entry?.answer);
    })
    .map((entry) => ({ question: entry.question!, answer: entry.answer! }));

  const detailId = normalized.id;
  const slug = normalized.slug ?? detailId;

  return {
    id: detailId,
    slug,
    title: normalized.title,
    description: normalized.description,
    destination: normalized.destination,
    duration: normalized.duration,
    price: normalized.price,
    currency: "INR",
    rating: normalized.rating,
    reviews: 1200,
    highlights: normalized.highlights,
    image: normalized.image,
    gallery: gallery.length ? gallery : [normalized.image],
    included: includes,
    excluded: excludes,
    essentials,
    itinerary,
    faq,
    overview: pkg.overview ?? normalized.description,
    location: pkg.location ?? pkg.address1 ?? normalized.destination,
    meetingPoint: pkg.meeting_point ?? pkg.address1 ?? normalized.destination,
    address: pkg.address ?? pkg.address1 ?? normalized.destination,
    address1: pkg.address1 ?? undefined,
    languages,
    availability: pkg.availability ?? "Available on select dates",
    mobileTicket: pkg.mobile_ticket ?? "Use your phone or print",
    pickupIncluded: toBoolean(pkg.pickup_included, true),
    ageRestriction: pkg.age_restriction ?? "Travellers 12+",
    category: normalized.category as any,
    categoryTitle: pkg.category_title ?? normalized.category.replace(/-/g, " "),
    badge: pkg.badge ?? "citymuscattours Exclusive",
    detailPath: `/packages/${slug}`,
  };
};


