import { Suspense, type ReactNode } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import "@/utils/token-monitor"; // Initialize token monitoring

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[var(--color-surface)] text-sm text-slate-500">Loading admin workspace…</div>}>
      <AdminAuthGuard>
        <div className="flex min-h-screen bg-[var(--color-surface)]">
          <DashboardSidebar />
          <main className="flex-1 min-w-0 overflow-auto px-6 py-10 lg:px-10">
            <div className="flex h-full min-h-0 flex-col overflow-visible">{children}</div>
          </main>
        </div>
      </AdminAuthGuard>
    </Suspense>
  );
}

