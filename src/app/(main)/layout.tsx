import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-slate-900">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

