import CheckoutClient from "@/components/checkout/CheckoutClient";
import { formatCurrency } from "@/lib/packages";
import { formatDateLabel, computeCancellationLabel, buildParticipantLabel } from "@/utils/checkoutFormatters";
import type { CheckoutData } from "@/types/checkout";

type CheckoutPageProps = {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

const getParam = (searchParams: Awaited<CheckoutPageProps["searchParams"]>, key: string, fallback = "") => {
  const value = searchParams[key];
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const resolvedSearchParams = await searchParams;
  const packageTitle = getParam(resolvedSearchParams, "title", "Selected experience");
  const optionLabel = getParam(resolvedSearchParams, "optionLabel", "Preferred option");
  const rawDate = getParam(resolvedSearchParams, "date");
  const displayDate = formatDateLabel(rawDate || undefined);
  const cancellationLabel = computeCancellationLabel(rawDate || undefined);
  const holdSeconds = Number(getParam(resolvedSearchParams, "holdSeconds", String(29 * 60 + 10)));
  const adults = Number(getParam(resolvedSearchParams, "adults", "2"));
  const children = Number(getParam(resolvedSearchParams, "children", "0"));
  const subtotal = Number(getParam(resolvedSearchParams, "subtotal", "7080"));
  const currency = (getParam(resolvedSearchParams, "currency", "INR") as "INR" | "USD" | "EUR") ?? "INR";
  const totalLabel = formatCurrency(subtotal, currency);
  const optionLanguage = getParam(resolvedSearchParams, "language", "English");
  const heroImage = getParam(resolvedSearchParams, "image", "/assets/hero/main.jpeg");
  const ratingValue = Number(getParam(resolvedSearchParams, "rating", "4.8"));
  const reviewsValue = Number(getParam(resolvedSearchParams, "reviews", "0"));
  const badgeLabel = getParam(resolvedSearchParams, "badge", "Top rated");
  const participantLabel = buildParticipantLabel(adults, children);
  const minSelectableDate = new Date().toISOString().split("T")[0];

  const packageId = getParam(resolvedSearchParams, "packageId", "");

  const data: CheckoutData = {
    packageTitle,
    optionLabel,
    optionLanguage,
    displayDate,
    rawDate,
    participantLabel,
    totalLabel,
    cancellationLabel,
    holdSeconds: Number.isNaN(holdSeconds) ? 30 * 60 : Math.max(0, holdSeconds),
    heroImage,
    ratingValue,
    reviewsValue,
    badgeLabel,
    adults,
    children,
    minSelectableDate,
    packageId,
    subtotal,
    currency,
  };

  return (
    <div className="bg-[#f5f7fb]">
      <div className="mx-auto min-h-screen max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <CheckoutClient data={data} />
      </div>
    </div>
  );
}

