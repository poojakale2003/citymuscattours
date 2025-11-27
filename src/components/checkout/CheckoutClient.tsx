"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { CheckoutData } from "@/types/checkout";
import CheckoutTimer from "@/components/checkout/CheckoutTimer";
import SelectionEditor from "@/components/checkout/SelectionEditor";
import { formatNumber } from "@/lib/numbers";
import { api } from "@/lib/api";
import CountrySelector from "@/components/checkout/CountrySelector";

const LockIcon = () => (
  <svg className="h-5 w-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

const LanguageIcon = () => (
  <svg className="h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M4 5h16M4 12h16M4 19h16" />
    <path d="M9 5c0 6 3 9 7 9" />
    <path d="M15 5c0 6-3 9-7 9" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const UsersIcon = () => (
  <svg className="h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CheckIcon = () => (
  <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 13l4 4L19 7" />
  </svg>
);

type Step = 1 | 2 | 3;

export default function CheckoutClient({ data }: { data: CheckoutData }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [pickupChoice, setPickupChoice] = useState<"now" | "later">("now");
  const [pickupLocation, setPickupLocation] = useState("");
  const [contactDetails, setContactDetails] = useState({
    name: "",
    email: "",
    phone: "",
    country: "India (+91)",
  });
  const [activityError, setActivityError] = useState<string | null>(null);
  const [contactErrors, setContactErrors] = useState<{ name?: string; email?: string; phone?: string }>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (pickupChoice === "later" && activityError) {
      setActivityError(null);
    }
  }, [pickupChoice, activityError]);

  const stepTitle = useMemo(() => {
    if (step === 1) return "Do you know where you want to be picked up?";
    if (step === 2) return "Enter your personal details";
    return "Review & confirm payment";
  }, [step]);

  const stepDescription = useMemo(() => {
    if (step === 1) return "Share your pickup point or let us know later. We’ll coordinate the exact meeting spot with your host.";
    if (step === 2) return "Checkout is fast and secure. We’ll only contact you with essential updates or changes to your booking.";
    return "Verify your reservation details and continue to payment.";
  }, [step]);

  const DEFAULT_MAP_QUERY = "Muscat Oman";
  const mapQuery = pickupLocation.trim() || data.packageTitle || DEFAULT_MAP_QUERY;
  const mapSource = pickupLocation.trim()
    ? `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`
    : `https://www.google.com/maps?q=${encodeURIComponent(DEFAULT_MAP_QUERY)}&output=embed`;

  const handleNext = () => setStep((prev) => (prev < 3 ? ((prev + 1) as Step) : prev));
  const handlePrev = () => setStep((prev) => (prev > 1 ? ((prev - 1) as Step) : prev));

  const handleActivityNext = () => {
    if (pickupChoice === "now" && pickupLocation.trim().length < 3) {
      setActivityError("Please enter a pickup location (at least 3 characters).");
      return;
    }
    setActivityError(null);
    handleNext();
  };

  const validateEmail = (value: string) => /\S+@\S+\.\S+/.test(value);
  const validatePhone = (value: string) => /^[0-9+\-\s]{6,}$/.test(value.trim());

  const handleContactSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: { name?: string; email?: string; phone?: string } = {};
    if (!contactDetails.name.trim()) {
      errors.name = "Full name is required.";
    }
    if (!validateEmail(contactDetails.email)) {
      errors.email = "Enter a valid email address.";
    }
    if (!validatePhone(contactDetails.phone)) {
      errors.phone = "Enter a valid phone number.";
    }
    setContactErrors(errors);
    if (Object.keys(errors).length === 0) {
      handleNext();
    }
  };

  const renderActivityStep = () => (
    <div className="space-y-6">
      <CheckoutTimer initialSeconds={data.holdSeconds} />
      <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <p className="font-semibold text-slate-900">{data.packageTitle}</p>
        <p className="text-xs text-slate-500">{data.displayDate}</p>
        <p className="text-xs text-slate-500">{data.participantLabel}</p>
      </div>
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white px-5 py-6">
        <h2 className="text-xl font-semibold text-slate-900">{stepTitle}</h2>
        <p className="text-sm text-slate-500">{stepDescription}</p>
        <div className="space-y-3 text-sm text-slate-600">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
            <input
              type="radio"
              name="pickup"
              value="now"
              checked={pickupChoice === "now"}
              onChange={() => setPickupChoice("now")}
            />
            Yes, I can add it now
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
            <input
              type="radio"
              name="pickup"
              value="later"
              checked={pickupChoice === "later"}
              onChange={() => setPickupChoice("later")}
            />
            I don’t know yet
          </label>
          {pickupChoice === "now" ? (
            <>
              <div className="rounded-2xl border border-slate-200 px-4 py-3">
                <input
                  type="text"
                  value={pickupLocation}
                  onChange={(event) => setPickupLocation(event.target.value)}
                  placeholder="Search for hotel, address, etc."
                  className="w-full bg-transparent text-sm text-slate-700 outline-none"
                />
              </div>
              {activityError ? <p className="text-xs text-rose-600">{activityError}</p> : null}
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <iframe
                  title="Pickup location map"
                  src={mapSource}
                  loading="lazy"
                  className="h-64 w-full border-0"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="px-4 py-3 text-xs text-slate-500">
                  {pickupLocation.trim()
                    ? "Drag or zoom to preview your pickup spot. Update the address above to adjust the map."
                    : "Default map view shows Muscat city center. Enter a pickup address to focus the map on your location."}
                </div>
              </div>
            </>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
            >
              Back
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleActivityNext}
            className="flex-1 rounded-full bg-(--color-brand-600) px-6 py-3 text-sm font-semibold text-white transition hover:bg-(--color-brand-700)"
          >
            Next: Personal details
          </button>
        </div>
      </div>
    </div>
  );

  const renderContactStep = () => (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
      <CheckoutTimer initialSeconds={data.holdSeconds} />
      <div className="flex items-center gap-2 text-sm text-emerald-700">
        <LockIcon />
        Checkout is fast and secure
      </div>
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold text-slate-900">{stepTitle}</h2>
        <p className="text-sm text-slate-500">{stepDescription}</p>
      </div>
      <form className="space-y-5" onSubmit={handleContactSubmit} noValidate>
        <label className="block text-sm font-semibold text-slate-800">
          Full name*
          <input
            type="text"
            value={contactDetails.name}
            onChange={(event) => setContactDetails((prev) => ({ ...prev, name: event.target.value }))}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-brand-50"
          />
          {contactErrors.name ? <p className="mt-1 text-xs text-rose-600">{contactErrors.name}</p> : null}
        </label>
        <label className="block text-sm font-semibold text-slate-800">
          Email*
          <input
            type="email"
            value={contactDetails.email}
            onChange={(event) => setContactDetails((prev) => ({ ...prev, email: event.target.value }))}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-brand-50"
          />
          {contactErrors.email ? <p className="mt-1 text-xs text-rose-600">{contactErrors.email}</p> : null}
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-800">
            Country*
            <CountrySelector
              value={contactDetails.country}
              onChange={(value) => setContactDetails((prev) => ({ ...prev, country: value }))}
            />
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            Mobile phone number*
            <input
              type="tel"
              value={contactDetails.phone}
              onChange={(event) => setContactDetails((prev) => ({ ...prev, phone: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-brand-50"
            />
            {contactErrors.phone ? <p className="mt-1 text-xs text-rose-600">{contactErrors.phone}</p> : null}
          </label>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
          We’ll only contact you with essential updates or changes to your booking.
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrev}
            className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
          >
            Back
          </button>
          <button
            type="submit"
            className="flex-1 rounded-full bg-(--color-brand-600) px-6 py-3 text-sm font-semibold text-white transition hover:bg-(--color-brand-700)"
          >
            Go to payment
          </button>
        </div>
      </form>
      <p className="text-xs text-slate-500">
        You may receive occasional promotional emails related to your booked activities. Opt out anytime from your account
        settings.
      </p>
    </div>
  );

  const progressSteps = [
    { label: "Activity", description: "Pickup details" },
    { label: "Contact", description: "Personal info" },
    { label: "Payment", description: "Secure checkout" },
  ] as const;

  const handlePaymentSubmit = async () => {
    if (!data.rawDate || !data.packageTitle) {
      setBookingError("Missing booking information. Please go back and try again.");
      return;
    }

    setIsProcessing(true);
    setBookingError(null);

    try {
      // Get package ID from data or URL
      const packageId = data.packageId || new URLSearchParams(window.location.search).get("packageId") || "";

      if (!packageId) {
        throw new Error("Package ID is required");
      }

      // Calculate total amount - use subtotal from data or extract from totalLabel
      const totalAmount = data.subtotal || parseFloat(data.totalLabel.replace(/[^\d.]/g, "")) || 0;

      // Create dummy booking
      const bookingResponse = await api.createDummyBooking({
        packageId,
        date: data.rawDate,
        adults: data.adults,
        children: data.children,
        totalAmount,
        currency: data.currency || "INR",
        contactEmail: contactDetails.email,
        contactPhone: contactDetails.phone,
        pickupLocation: pickupChoice === "now" ? pickupLocation : "To be confirmed",
        notes: `Booking by ${contactDetails.name}`,
      });

      const bookingId = bookingResponse.data?.id || bookingResponse.id;

      if (!bookingId) {
        throw new Error("Failed to create booking");
      }

      // Process dummy payment immediately
      await api.createDummyPayment({
        bookingId,
        status: "Confirmed",
      });

      // Send confirmation email (non-blocking for user flow)
      if (contactDetails.email) {
        try {
          await api.sendBookingConfirmationEmail({
            bookingId,
            recipientEmail: contactDetails.email,
            recipientName: contactDetails.name,
            bookingDetails: {
              packageName: data.packageTitle,
              date: data.rawDate,
              adults: data.adults,
              children: data.children,
              totalAmount,
              currency: data.currency || "INR",
              bookingReference: `#BK-${String(bookingId).padStart(4, "0")}`,
            },
          });
        } catch (emailError) {
          console.error("Failed to send confirmation email:", emailError);
        }
      }

      // Redirect to success page or show success message
      alert(
        "Booking confirmed! Your payment has been processed successfully. A confirmation email has been sent to your inbox.",
      );
      router.push("/");
    } catch (error: any) {
      console.error("Error processing booking:", error);
      setBookingError(error.message || "Failed to process booking. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPaymentStep = () => (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
      <CheckoutTimer initialSeconds={data.holdSeconds} />
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">{stepTitle}</h2>
        <p className="text-sm text-slate-500">{stepDescription}</p>
      </div>
      {bookingError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {bookingError}
        </div>
      )}
      <div className="space-y-3 text-sm text-slate-600">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Payment method</p>
          <p className="mt-2">•••• •••• •••• 4242</p>
          <p className="text-xs text-slate-500">Visa · Expires 09/28</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Billing address</p>
          <p className="mt-2">Same as pickup</p>
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handlePrev}
          disabled={isProcessing}
          className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handlePaymentSubmit}
          disabled={isProcessing}
          className="flex-1 rounded-full bg-(--color-brand-600) px-6 py-3 text-sm font-semibold text-white transition hover:bg-(--color-brand-700) disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? "Processing..." : "Confirm & pay"}
        </button>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-green-50 px-4 py-3 text-sm text-green-700">
        {data.cancellationLabel}
      </div>
    </div>
  );

  if (!mounted) {
    return <div />;
  }

  return (
    <>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          {progressSteps.map((item, index) => {
            const status = step === (index + 1) ? "active" : step > index + 1 ? "done" : "upcoming";
            return (
              <div key={item.label} className="flex flex-1 items-center">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-semibold ${
                    status === "done"
                      ? "border-(--color-brand-600) bg-(--color-brand-600) text-white"
                      : status === "active"
                      ? "border-(--color-brand-600) text-(--color-brand-600)"
                      : "border-slate-200 text-slate-400"
                  }`}
                >
                  {status === "done" ? <CheckIcon /> : index + 1}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-semibold ${status !== "upcoming" ? "text-slate-900" : "text-slate-400"}`}>{item.label}</p>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
                {index < progressSteps.length - 1 ? (
                  <div
                    className={`mx-3 hidden h-0.5 flex-1 lg:block ${
                      step > index + 1 ? "bg-(--color-brand-600)" : "bg-slate-200"
                    }`}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
      {step === 1 && renderActivityStep()}
      {step === 2 && renderContactStep()}
      {step === 3 && renderPaymentStep()}
      <aside className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Order summary</h2>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{data.badgeLabel}</span>
        </div>
        <div className="space-y-4 text-sm text-slate-600">
          <div className="flex items-start gap-4 rounded-2xl border border-slate-100 p-4">
            <div className="relative h-20 w-24 overflow-hidden rounded-xl bg-slate-100">
              <Image src={data.heroImage} alt={data.packageTitle} fill className="object-cover" sizes="96px" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">{data.packageTitle}</p>
              <p className="text-xs text-slate-500">
                {data.ratingValue.toFixed(1)} ★ ({formatNumber(data.reviewsValue)} reviews)
              </p>
              <p className="text-xs text-slate-500">Top host pick</p>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="space-y-1">
              <p className="font-semibold text-slate-900">{data.optionLabel}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <LanguageIcon /> Language: {data.optionLanguage}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <CalendarIcon /> {data.displayDate}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <UsersIcon /> {data.participantLabel}
              </div>
            </div>
            <SelectionEditor
              initialDate={data.rawDate}
              initialAdults={data.adults}
              initialChildren={data.children}
              minDate={data.minSelectableDate}
            />
          </div>

          <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500">
            <p>Great value · Customers rated this 4.7/5 for value for money</p>
            <p>Enter promo, credit, or gift code</p>
          </div>
        </div>
        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Total</span>
            <span className="text-2xl font-semibold text-slate-900">{data.totalLabel}</span>
          </div>
          <p className="text-xs text-slate-500">All taxes and fees included</p>
        </div>
        <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500">
          <p>{data.cancellationLabel}</p>
          <p>The timer above reflects how long we reserve this slot.</p>
        </div>
      </aside>
    </div>
    </>
  );
}

