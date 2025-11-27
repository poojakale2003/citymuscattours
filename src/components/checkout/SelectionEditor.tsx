"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

type SelectionEditorProps = {
  initialDate?: string;
  initialAdults?: number;
  initialChildren?: number;
  minDate?: string;
};

type FieldErrors = {
  date?: string;
  adults?: string;
  children?: string;
};

const PencilIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
  </svg>
);

const DEFAULT_MIN_DATE = "1970-01-01";

export default function SelectionEditor({
  initialDate,
  initialAdults = 2,
  initialChildren = 0,
  minDate = DEFAULT_MIN_DATE,
}: SelectionEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(initialDate ?? "");
  const [adults, setAdults] = useState(Math.max(1, initialAdults));
  const [children, setChildren] = useState(Math.max(0, initialChildren));
  const [errors, setErrors] = useState<FieldErrors>({});

  const clampValue = (value: number, min: number, max: number) => {
    if (Number.isNaN(value)) return min;
    return Math.min(max, Math.max(min, value));
  };

  const validate = () => {
    const nextErrors: FieldErrors = {};
    if (!date) {
      nextErrors.date = "Please select a date.";
    } else if (date < minDate) {
      nextErrors.date = "Date cannot be in the past.";
    }

    if (adults < 1 || adults > 10) {
      nextErrors.adults = "Adults must be between 1 and 10.";
    }

    if (children < 0 || children > 10) {
      nextErrors.children = "Children must be between 0 and 10.";
    }

    return nextErrors;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (date) params.set("date", date);
    params.set("adults", String(adults));
    params.set("children", String(children));
    router.replace(`/checkout?${params.toString()}`);
    setOpen(false);
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-(--color-brand-600) hover:text-(--color-brand-700)"
      >
        <PencilIcon />
        Change date or participants
      </button>
      {open ? (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-xs text-slate-600">
          <label className="block text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
            Date
            <input
              type="date"
              value={date}
              min={minDate}
              required
              onChange={(event) => setDate(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-brand-50"
            />
            {errors.date ? <p className="mt-1 text-[11px] text-rose-600">{errors.date}</p> : null}
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
              Adults
              <input
                type="number"
                min={1}
                max={10}
                value={adults}
                onChange={(event) => setAdults(clampValue(Number(event.target.value), 1, 10))}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-brand-50"
              />
              {errors.adults ? <p className="mt-1 text-[11px] text-rose-600">{errors.adults}</p> : null}
            </label>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
              Children
              <input
                type="number"
                min={0}
                max={10}
                value={children}
                onChange={(event) => setChildren(clampValue(Number(event.target.value), 0, 10))}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-brand-50"
              />
              {errors.children ? <p className="mt-1 text-[11px] text-rose-600">{errors.children}</p> : null}
            </label>
          </div>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600 hover:border-slate-300 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-(--color-brand-600) px-5 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-(--color-brand-700)"
            >
              Update
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
