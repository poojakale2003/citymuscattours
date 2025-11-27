import type { ReactNode } from "react";
import Link from "next/link";
import Logo from "@/components/shared/Logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col justify-center bg-white px-6 py-12 sm:px-12 lg:px-16">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
        <Link
          href="/"
          className="flex items-center gap-3 text-sm font-semibold text-slate-600"
        >
          <Logo />
          Back to home
        </Link>
        {children}
      </div>
    </main>
  );
}

