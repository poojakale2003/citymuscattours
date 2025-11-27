import { categoryDetails, categoryPackages, featuredPackages } from "@/lib/data";
import { formatDisplayCurrency } from "@/lib/currency";

export type PackageCategoryKey = keyof typeof categoryDetails;
export type PackageCategory = PackageCategoryKey | "featured";

export type PackageDetail = {
  id: string;
  slug?: string;
  title: string;
  description: string;
  destination: string;
  duration: string;
  price: number;
  currency: string;
  rating: number;
  reviews?: number;
  highlights: string[];
  image: string;
  gallery: string[];
  included: string[];
  excluded?: string[];
  essentials: string[];
  services?: string[];
  overview: string;
  location?: string;
  meetingPoint?: string;
  languages?: string[];
  availability?: string;
  mobileTicket?: string;
  pickupIncluded?: boolean;
  ageRestriction?: string;
  itinerary?: Array<{ day?: string; title?: string; description?: string }>;
  faq?: Array<{ question: string; answer: string }>;
  address?: string;
  address1?: string;
  category: PackageCategory;
  categoryTitle: string;
  badge?: string;
  detailPath: string;
};

function createFeaturedPackageDetail(item: (typeof featuredPackages)[number]): PackageDetail {
  return {
    id: item.id,
    title: item.title,
    description:
      "This featured journey is curated by citymuscattours concierge. Contact us for a tailored itinerary.",
    destination: item.destination,
    duration: item.duration,
    price: item.price,
    currency: "USD",
    rating: item.rating,
    reviews: 1240,
    highlights: item.highlights,
    image: item.image,
    gallery: [item.image],
    included: item.highlights,
    excluded: ["International flights", "Travel insurance", "Personal expenses"],
    essentials: [
      "Flexible start dates available on request.",
      "Speak with our concierge to customise accommodations and dining.",
      "Passport and visa requirements vary by destination.",
    ],
    overview:
      "Tap into our concierge network to personalise this signature itinerary with exclusive access, elevated dining, and bespoke experiences.",
    location: item.destination,
    meetingPoint: "Our concierge team will coordinate a meeting point after confirmation.",
    category: "featured",
    categoryTitle: "Featured",
    badge: "citymuscattours Signature",
    detailPath: `/packages/${item.id}`,
    languages: ["English", "Local concierge"],
    availability: "Available on select dates",
    mobileTicket: "Use your phone or print",
    pickupIncluded: true,
    ageRestriction: "All travellers 12+ · Wheelchair access on request",
  };
}

function createCategoryPackageDetail(
  categoryKey: PackageCategoryKey,
  item: (typeof categoryPackages)[PackageCategoryKey][number],
): PackageDetail {
  const categoryInfo = categoryDetails[categoryKey];

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    destination: categoryInfo.title,
    duration: item.duration,
    price: item.price,
    currency: item.currency ?? "INR",
    rating: item.rating,
    reviews: item.reviews,
    highlights: item.highlights ?? item.perks ?? [],
    image: item.image,
    gallery: [item.image, ...(item.gallery ?? [])],
    included: item.included ?? item.perks ?? [],
    excluded: item.excluded ?? ["Personal expenses", "Travel insurance", "Meals not mentioned"],
    essentials:
      item.essentials ??
      [
        "Bring a valid photo ID and booking confirmation.",
        "Our concierge will reconfirm exact timings 24 hours in advance.",
        "Customisations are available—reach out to personalise your experience.",
      ],
    overview: item.overview ?? item.description,
    location: item.location ?? categoryInfo.title,
    meetingPoint: item.meetingPoint,
    category: categoryKey,
    categoryTitle: categoryInfo.title,
    badge: item.badge,
    detailPath: `/packages/${item.id}`,
    languages: item.languages ?? ["English", "Local host"],
    availability: item.availability ?? "Available daily",
    mobileTicket: item.mobileTicket ?? "Use your phone or print",
    pickupIncluded: item.pickupIncluded ?? true,
    ageRestriction: item.ageRestriction ?? "All travellers 12+ · Accessible on request",
  };
}

const featuredPackageIndex: PackageDetail[] = featuredPackages.map(createFeaturedPackageDetail);

const categoryPackageIndex: PackageDetail[] = Object.entries(categoryPackages).flatMap(
  ([categoryKey, items]) =>
    items.map((item) => createCategoryPackageDetail(categoryKey as PackageCategoryKey, item)),
);

const packageIndex = new Map<string, PackageDetail>();
for (const pkg of [...featuredPackageIndex, ...categoryPackageIndex]) {
  if (!packageIndex.has(pkg.id)) {
    packageIndex.set(pkg.id, pkg);
  }
}

if (process.env.NODE_ENV !== "production") {
  console.log("[packages] loaded ids", Array.from(packageIndex.keys()));
}

export function getPackageById(id: string): PackageDetail | undefined {
  if (process.env.NODE_ENV !== "production") {
    console.log("[packages] getPackageById called with", id);
  }
  const cached = packageIndex.get(id);
  if (cached) {
    return cached;
  }

  const featured = featuredPackages.find((item) => item.id === id);
  if (featured) {
    const detail = createFeaturedPackageDetail(featured);
    packageIndex.set(detail.id, detail);
    return detail;
  }

  for (const [categoryKey, items] of Object.entries(categoryPackages)) {
    const match = items.find((item) => item.id === id);
    if (match) {
      const detail = createCategoryPackageDetail(categoryKey as PackageCategoryKey, match);
      packageIndex.set(detail.id, detail);
      return detail;
    }
  }

  if (process.env.NODE_ENV !== "production") {
    console.warn(`[packages] Package id not found: ${id}`);
  }

  return undefined;
}

export function getCategoryPackageById(
  category: PackageCategoryKey,
  id: string,
): PackageDetail | undefined {
  const pkg = packageIndex.get(id);
  if (pkg && pkg.category === category) {
    return pkg;
  }

  return categoryPackageIndex.find(
    (candidate) => candidate.category === category && candidate.id === id,
  );
}

export function getAllPackages(): PackageDetail[] {
  return Array.from(packageIndex.values());
}

export function formatCurrency(amount: number, currency: string): string {
  return formatDisplayCurrency(amount, currency);
}

