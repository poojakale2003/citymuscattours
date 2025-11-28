"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import Image from "next/image";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await api.subscribeNewsletter({
        email,
        source: "discover-weekly-section",
      });

      setSubmitted(true);
      setEmail("");

      // Reset success message after 3 seconds
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err: any) {
      const message =
        err?.message ||
        err?.response?.data?.message ||
        "Unable to subscribe right now. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-[#f8fbff]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 md:px-8 lg:px-12">
        <div className="overflow-hidden rounded-xl bg-white shadow-lg sm:rounded-2xl">
          <div className="grid md:grid-cols-2">
            {/* Left Side - Image */}
            <div className="relative order-2 h-[250px] sm:h-[300px] md:order-1 md:h-[400px]">
              <Image
                src="/assets/blog/1.jpeg"
                alt="Travel adventure"
                fill
                className="object-cover"
              />
            </div>

            {/* Right Side - Form */}
            <div className="order-1 flex flex-col justify-center bg-[#e8f4fd] px-4 py-6 sm:px-6 sm:py-8 md:order-2 md:px-10 md:py-12">
              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl md:text-4xl">
                  Discover the wonder of travel{" "}
                  <span className="block">every week</span>
                </h2>
                <p className="text-sm leading-relaxed text-slate-700 sm:text-base md:text-lg">
                  Get personalized travel inspiration, the latest travel hacks, and exclusive deals straight to your inbox.
                </p>

                {submitted ? (
                  <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2.5 text-xs text-green-700 sm:px-4 sm:py-3 sm:text-sm">
                    Thank you! Check your inbox for confirmation.
                  </div>
                ) : mounted ? (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 sm:gap-3 sm:flex-row">
                    <div className="relative flex-1">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-9 text-xs text-slate-900 placeholder:text-slate-400 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200) sm:px-4 sm:py-3 sm:pr-10 sm:text-sm"
                      />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 sm:right-3 sm:h-5 sm:w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                        />
                      </svg>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-lg bg-(--color-brand-600) px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-(--color-brand-700) disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:px-6 sm:py-3 sm:text-sm md:px-8"
                    >
                      {isSubmitting ? "Signing up..." : "Sign up"}
                    </button>
                    {error && (
                      <p className="text-xs text-red-600 sm:text-sm">
                        {error}
                      </p>
                    )}
                  </form>
                ) : (
                  <div className="flex flex-col gap-2.5 sm:gap-3 sm:flex-row">
                    <div className="relative flex-1">
                      <div className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 sm:px-4 sm:py-3 h-[38px] sm:h-[44px]" />
                    </div>
                    <div className="w-full rounded-lg bg-(--color-brand-600) px-5 py-2.5 sm:w-auto sm:px-6 sm:py-3 h-[38px] sm:h-[44px]" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom - Privacy Statement */}
          <div className="border-t border-slate-200 bg-white px-4 py-3 sm:px-6 sm:py-4 md:px-10">
            <p className="text-xs leading-relaxed text-slate-600 sm:text-xs">
              By signing up, you agree to receive promotional emails on activities and insider tips. You can unsubscribe or withdraw your consent at any time with future effect. For more information, read our{" "}
              <a
                href="#"
                className="font-semibold text-(--color-brand-600) underline hover:text-(--color-brand-700)"
              >
                Privacy statement
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

