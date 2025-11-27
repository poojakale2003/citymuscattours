"use client";

import { useState } from "react";
import Image from "next/image";
import CheckoutTimer from "@/components/checkout/CheckoutTimer";
import SelectionEditor from "@/components/checkout/SelectionEditor";
import { formatNumber } from "@/lib/numbers";
import CountrySelector from "@/components/checkout/CountrySelector";

type CheckoutFlowProps = {
  packageTitle: string;
  optionLabel: string;
  optionLanguage: string;
  displayDate: string;
  participantLabel: string;
  cancellationLabel: string;
  holdSeconds: number;
  heroImage: string;
  badgeLabel: string;
  ratingValue: number;
  reviewsValue: number;
  totalLabel: string;
  rawDate?: string;
  adults: number;
  children: number;
  location: string;
  minSelectableDate: string;
};

export default function CheckoutFlow({
  packageTitle,
  optionLabel,
  optionLanguage,
  displayDate,
  participantLabel,
  cancellationLabel,
  holdSeconds,
  heroImage,
  badgeLabel,
  ratingValue,
  reviewsValue,
  totalLabel,
  rawDate,
  adults,
  children,
  location,
  minSelectableDate,
}: CheckoutFlowProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [pickupOption, setPickupOption] = useState<"now" | "later">("now");
  const [pickupLocation, setPickupLocation] = useState("");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    country: "India (+91)",
    phone: "",
  });
  const [paymentForm, setPaymentForm] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const handleContactSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStep(3);
  };

  const handlePaymentSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    alert("Payment processing is not connected in this demo. Your details have been captured.");
  };

  const steps = [
    { label: "Activity", status: step === 1 ? "active" : "done" },
    { label: "Contact", status: step === 2 ? "active" : step > 2 ? "done" : "upcoming" },
    { label: "Payment", status: step === 3 ? "active" : "upcoming" },
  ] as const;

  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(location || "Muscat, Oman")}&output=embed`;

  const renderActivityStep = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div className="relative h-16 w-20 overflow-hidden rounded-xl bg-slate-100">
          <Image src={heroImage} alt={packageTitle} fill className="object-cover" sizes="80px" />
        </div>
        <div className="space-y-1 text-xs text-slate-500">
          <p className="text-sm font-semibold text-slate-900">{packageTitle}</p>
          <p>{displayDate}</p>
          <p>{participantLabel}</p>
        </div>
      </div>
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white px-5 py-4">
        <p className="text-lg font-semibold text-slate-900">Do you know where you want to be picked up?</p>
        <div className="space-y-3 text-sm text-slate-600">
          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 px-4 py-3">
            <input
              type="radio"
              name="pickup"
              checked={pickupOption === "now"}
              onChange={() => setPickupOption("now")}
              className="mt-1"
            />
            <span>
              <span className="font-semibold text-slate-900">Yes, I can add it now</span>
              <p className="text-xs text-slate-500">Enter the hotel name or address, or click on the map to drop a pin.</p>
            </span>
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
            <input
              type="radio"
              name="pickup"
              checked={pickupOption === "later"}
              onChange={() => setPickupOption("later")}
            />
            <span className="text-sm">I don’t know yet</span>
          </label>
        </div>
        {pickupOption === "now" ? (
          <div className="space-y-3 text-sm">
            <input
              type="text"
              value={pickupLocation}
              onChange={(event) => setPickupLocation(event.target.value)}
              placeholder="Search for hotel, address, etc."
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-brand-50"
            />
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <iframe title="Pickup map" src={mapSrc} className="h-64 w-full border-0" loading="lazy" allowFullScreen />
            </div>
          </div>
        ) : null}
      </div>
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="rounded-full bg-(--color-brand-600) px-6 py-3 text-sm font-semibold text-white transition hover:bg-(--color-brand-700)"
        >
          Next: Personal details
        </button>
      </div>
    </div>
  );

  const renderContactStep = () => (
    <form className="space-y-5" onSubmit={handleContactSubmit}>
      <label className="block text-sm font-semibold text-slate-800">
        Full name*
        <input
          type="text"
          required
          value={contactForm.name}
          onChange={(event) => setContactForm((prev) => ({ ...prev, name: event.target.value }))}
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-brand-50"
          placeholder="Jane Doe"
        />
      </label>
      <label className="block text-sm font-semibold text-slate-800">
        Email*
        <input
          type="email"
          required
          value={contactForm.email}
          onChange={(event) => setContactForm((prev) => ({ ...prev, email: event.target.value }))}
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-brand-50"
          placeholder="you@example.com"
        />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-semibold text-slate-800">
          Country*
          <CountrySelector
            value={contactForm.country}
            onChange={(value) => setContactForm((prev) => ({ ...prev, country: value }))}
          />
        </label>
        <label className="block text-sm font-semibold text-slate-800">
          Mobile phone number*
          <input
            type="tel"
            required
            value={contactForm.phone}
            onChange={(event) => setContactForm((prev) => ({ ...prev, phone: event.target.value }))}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-brand-50"
            placeholder="98765 43210"
          />
        </label>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
        We’ll only contact you with essential updates or changes to your booking.
      </div>
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
        >
          Back
        </button>
        <button
          type="submit"
          className="rounded-full bg-(--color-brand-600) px-6 py-3 text-sm font-semibold text-white transition hover:bg-(--color-brand-700)"
        >
          Go to payment
        </button>
      </div>
    </form>
  );

  const renderPaymentStep = () => (
    <form className="space-y-5" onSubmit={handlePaymentSubmit}>
      <p className="text-sm text-slate-500">
        Payments are securely processed. Your card will only be charged once our concierge confirms availability.
      </p>
      <label className="block text-sm font-semibold text-slate-800">
        Name on card*
        <input
          type="text"
          required
          value={paymentForm.cardName}
          onChange={(event) => setPaymentForm((prev) => ({ ...prev, cardName: event.target.value }))}
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-brand-50"
          placeholder="Jane Doe"
        />
      </label>
      <label className="block text-sm font-semibold text-slate-800">
        Card number*
        <input
          type="text"
          required
          value={paymentForm.cardNumber}
          onChange={(event) => setPaymentForm((prev) => ({ ...prev, cardNumber: event.target.value }))}
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-brand-50"
          placeholder="1234 5678 9012 3456"
        />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-semibold text-slate-800">
          Expiry date*
          <input
            type="text"
            required
            value={paymentForm.expiry}
            onChange={(event) => setPaymentForm((prev) => ({ ...prev, expiry: event.target.value }))}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-brand-50"
            placeholder="MM / YY"
          />
        </label>
        <label className="block text-sm font-semibold text-slate-800">
          CVV*
          <input
            type="password"
            required
            value={paymentForm.cvv}
            onChange={(event) => setPaymentForm((prev) => ({ ...prev, cvv: event.target.value }))}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-brand-50"
            placeholder="123"
          />
        </label>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
        All payments are protected by bank-grade encryption. You’ll receive confirmation within a few minutes.
      </div>
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
        >
          Back
        </button>
        <button
          type="submit"
          className="rounded-full bg-(--color-brand-600) px-6 py-3 text-sm font-semibold text-white transition hover:bg-(--color-brand-700)"
        >
          Pay & confirm
        </button>
      </div>
    </form>
  );

  const renderStep = () => {
    if (step === 1) return renderActivityStep();
    if (step === 2) return renderContactStep();
    return renderPaymentStep();
  };

  return (
    <>
      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 sm:flex-row sm:items-center">
          {steps.map((item, index) => (
            <div key={item.label} className="flex flex-1 items-center gap-3">
              <button
                type="button"
                onClick={() => setStep((index + 1) as 1 | 2 | 3)}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                  item.status === "done"
                    ? "border border-(--color-brand-600) bg-(--color-brand-600) text-white"
                    : item.status === "active"
                    ? "border-2 border-(--color-brand-600) text-(--color-brand-600)"
                    : "border border-slate-200 text-slate-400"
                }`}
              >
                {index + 1}
              </button>
              <div>
                <p className={`${item.status !== "upcoming" ? "text-slate-600" : "text-slate-400"}`}>{item.label}</p>
                <p className="text-[10px] font-normal tracking-[0.2em] text-slate-400">
                  {item.label === "Activity" ? "Pickup & meeting point" : item.label === "Contact" ? "Personal details" : "Secure payment"}
                </p>
              </div>
              {index < steps.length - 1 ? <div className="mx-3 hidden h-px flex-1 bg-slate-200 sm:block" /> : null}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="space-y-3">
            <CheckoutTimer initialSeconds={Number.isNaN(holdSeconds) ? 30 * 60 : Math.max(0, holdSeconds)} />
            <div className="flex items-center gap-2 text-sm text-emerald-700">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-base">🔒</span>
              Checkout is fast and secure
            </div>
          </div>
          {renderStep()}
        </section>

        <aside className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Order summary</h2>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{badgeLabel}</span>
          </div>

          <div className="space-y-4 text-sm text-slate-600">
            <div className="flex items-start gap-4 rounded-2xl border border-slate-100 p-4">
              <div className="relative h-20 w-24 overflow-hidden rounded-xl bg-slate-100">
                <Image src={heroImage} alt={packageTitle} fill className="object-cover" sizes="96px" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-900">{packageTitle}</p>
                <p className="text-xs text-slate-500">
                  {ratingValue.toFixed(1)} ★ ({formatNumber(reviewsValue)} reviews)
                </p>
                <p className="text-xs text-slate-500">Top host pick</p>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <div className="space-y-1">
                <p className="font-semibold text-slate-900">{optionLabel}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>🗣️</span> Language: {optionLanguage}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>📅</span> {displayDate}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>👥</span> {participantLabel}
                </div>
              </div>
              <SelectionEditor
                initialDate={rawDate}
                initialAdults={adults}
                initialChildren={children}
                minDate={minSelectableDate}
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
              <span className="text-2xl font-semibold text-slate-900">{totalLabel}</span>
            </div>
            <p className="text-xs text-slate-500">All taxes and fees included</p>
          </div>

          <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500">
            <p>{cancellationLabel}</p>
            <p>The timer above reflects how long we reserve this slot.</p>
          </div>
        </aside>
      </div>
    </>
  );
}

