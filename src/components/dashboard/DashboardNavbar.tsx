"use client";

import Link from "next/link";

export default function DashboardNavbar() {
  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-6 backdrop-blur lg:px-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-brand-500)]">
          Admin Command Center
        </p>
        <h1 className="text-lg font-semibold text-slate-900">
          Good afternoon, Admin
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600">
          <span className="font-semibold text-slate-900">Revenue Goal:</span>{" "}
          $120k · Q4
        </div>
        <Link
          href="/"
          className="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 md:block"
        >
          View site
        </Link>
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100"
        >
          <span className="sr-only">Notifications</span>🔔
        </button>
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-brand-600)] text-white transition hover:bg-[var(--color-brand-700)]"
        >
          <span className="sr-only">Profile</span>👤
        </button>
      </div>
    </header>
  );
}

