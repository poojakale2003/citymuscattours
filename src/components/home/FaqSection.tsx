"use client";

import { useState } from "react";
import { faqs } from "@/lib/data";

export default function FaqSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="section">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-brand-500)]">
          FAQs
        </p>
        <h2 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">
          Answers to common questions
        </h2>
        <p className="mt-4 text-base text-slate-600">
          Need more? Contact our concierge team 24/7 for custom requests or
          specific itinerary details.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-3xl space-y-4">
        {faqs.map((faq, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={faq.question}
              type="button"
              onClick={() => setActiveIndex((prev) => (prev === index ? -1 : index))}
              suppressHydrationWarning
              className="w-full rounded-[1.5rem] border border-slate-200 bg-white p-6 text-left shadow-[0_30px_80px_-50px_rgb(15_23_42_/_0.6)] transition hover:border-[var(--color-brand-200)]"
            >
              <div className="flex items-center justify-between gap-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  {faq.question}
                </h3>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brand-50)] text-lg font-semibold text-[var(--color-brand-600)]">
                  {isActive ? "−" : "+"}
                </span>
              </div>
              <div
                className={`mt-4 text-sm text-slate-600 transition-all ${isActive ? "max-h-40 opacity-100" : "max-h-0 overflow-hidden opacity-0"}`}
              >
                {faq.answer}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

