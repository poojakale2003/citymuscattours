"use client";

import { useState, useEffect, useRef } from "react";

export type BookingPayload = {
  packageId?: string;
  travelers: number;
  adults: number;
  children: number;
  date: string;
  email: string;
  notes: string;
};

type BookingFormProps = {
  packageName?: string;
  onSubmit?: (payload: BookingPayload) => void;
  minDate?: string;
};

const DEFAULT_MIN_DATE = "1970-01-01";

export default function BookingForm({ packageName, onSubmit, minDate = DEFAULT_MIN_DATE }: BookingFormProps) {
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [isTravellersOpen, setIsTravellersOpen] = useState(false);
  const [date, setDate] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const travellersRef = useRef<HTMLDivElement>(null);

  const totalTravelers = adults + children;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (travellersRef.current && !travellersRef.current.contains(event.target as Node)) {
        setIsTravellersOpen(false);
      }
    };

    if (isTravellersOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isTravellersOpen]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (totalTravelers === 0 || !date || !email || !validateEmail(email)) {
      return;
    }

    const payload = { 
      travelers: totalTravelers,
      adults,
      children,
      date,
      email,
      notes 
    };

    try {
      setIsSubmitting(true);
      
      // Format date for display
      const formattedDate = new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Build WhatsApp message
      let message = `Hello! I would like to make a booking request.\n\n`;
      
      if (packageName) {
        message += `📦 Package: ${packageName}\n`;
      }
      
      message += `📅 Preferred Date: ${formattedDate}\n`;
      message += `📧 Email: ${email}\n`;
      message += `👥 Travelers:\n`;
      message += `   • Adults: ${adults}\n`;
      if (children > 0) {
        message += `   • Children: ${children}\n`;
      }
      message += `   • Total: ${totalTravelers}\n`;
      
      if (notes.trim()) {
        message += `\n📝 Special Requests:\n${notes.trim()}\n`;
      }
      
      message += `\nPlease confirm availability and share next steps. Thank you!`;

      // Encode message for URL
      const encodedMessage = encodeURIComponent(message);
      
      // WhatsApp phone number: +968 9949 8697 (format: 96899498697)
      const whatsappNumber = "96899498697";
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      
      // Open WhatsApp
      window.open(whatsappUrl, "_blank");
      
      // Still call onSubmit if provided (for any additional handling)
      onSubmit?.(payload);
    } catch (error) {
      console.error("Error opening WhatsApp:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-slate-200/70 bg-white/90 p-5 sm:p-6 md:p-8 shadow-[0_30px_65px_-35px_rgb(15_23_42_/_0.55)] backdrop-blur"
    >
      <div>
        <h3 className="text-xl sm:text-2xl font-semibold text-slate-900">
          {packageName ? `Reserve ${packageName}` : "Create Your Booking"}
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Securely reserve your experience. Our concierge team will confirm within
          12 hours with next steps.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-600">
          Preferred Date
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            min={minDate}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--color-brand-400)] focus:ring-[var(--color-brand-200)]"
            required
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-600">
          Email Address
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="your.email@example.com"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-brand-400)] focus:ring-[var(--color-brand-200)]"
            required
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2 relative">
          <label className="text-sm font-medium text-slate-600">
            Travellers
          </label>
          <div ref={travellersRef} className="relative w-full rounded-2xl border border-slate-200 bg-white overflow-visible">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsTravellersOpen(!isTravellersOpen);
              }}
              className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition rounded-2xl"
            >
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-slate-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                </svg>
                <span className="font-medium">
                  {adults > 0 && `Adult${adults > 1 ? "s" : ""} × ${adults}`}
                  {adults > 0 && children > 0 && ", "}
                  {children > 0 && `Child${children > 1 ? "ren" : ""} × ${children}`}
                  {adults === 0 && children === 0 && "Select travellers"}
                </span>
              </div>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`h-4 w-4 text-slate-400 transition-transform ${isTravellersOpen ? "rotate-180" : ""}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {isTravellersOpen && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 border border-slate-200 rounded-2xl bg-white shadow-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Adult</p>
                    <p className="text-xs text-slate-500">(Age 5-99)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      disabled={adults <= 1}
                      className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                        adults <= 1
                          ? "border-slate-200 text-slate-300 cursor-not-allowed"
                          : "border-[var(--color-brand-400)] text-[var(--color-brand-600)] hover:bg-[var(--color-brand-50)]"
                      }`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                      </svg>
                    </button>
                    <span className="w-12 text-center text-sm font-semibold text-slate-900">{adults}</span>
                    <button
                      type="button"
                      onClick={() => setAdults(Math.min(10, adults + 1))}
                      disabled={adults >= 10}
                      className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                        adults >= 10
                          ? "border-slate-200 text-slate-300 cursor-not-allowed"
                          : "border-[var(--color-brand-400)] text-[var(--color-brand-600)] hover:bg-[var(--color-brand-50)]"
                      }`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Child</p>
                    <p className="text-xs text-slate-500">(Age 4 and younger)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      disabled={children <= 0}
                      className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                        children <= 0
                          ? "border-slate-200 text-slate-300 cursor-not-allowed"
                          : "border-[var(--color-brand-400)] text-[var(--color-brand-600)] hover:bg-[var(--color-brand-50)]"
                      }`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                      </svg>
                    </button>
                    <span className="w-12 text-center text-sm font-semibold text-slate-900">{children}</span>
                    <button
                      type="button"
                      onClick={() => setChildren(Math.min(10, children + 1))}
                      disabled={children >= 10}
                      className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                        children >= 10
                          ? "border-slate-200 text-slate-300 cursor-not-allowed"
                          : "border-[var(--color-brand-400)] text-[var(--color-brand-600)] hover:bg-[var(--color-brand-50)]"
                      }`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          {totalTravelers === 0 && (
            <p className="text-xs text-red-600 mt-1">Please select at least one traveller</p>
          )}
        </div>
      </div>

      <label className="grid gap-2 text-sm font-medium text-slate-600">
        Notes & Special Requests
        <textarea
          rows={5}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Let us know about dietary needs, accessibility requests, or celebration details."
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-brand-400)] focus:ring-[var(--color-brand-200)]"
        />
      </label>

      <div className="flex flex-col gap-3 rounded-2xl bg-[var(--color-brand-50)] px-5 py-4 text-sm text-[var(--color-brand-700)]">
        <span className="font-semibold">No payment required yet.</span>
        <p>
          We will confirm availability, share a secure payment link, and send an
          itinerary recap to your inbox within 12 hours.
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || totalTravelers === 0 || !date || !email || !validateEmail(email)}
        className="w-full rounded-2xl bg-[var(--color-brand-600)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-700)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Sending..." : "Request Booking"}
      </button>
    </form>
  );
}

