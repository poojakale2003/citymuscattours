"use client";

import { useSearchParams } from "next/navigation";
import EditPackageClient from "../[id]/edit/EditPackageClient";

export default function AdminEditPackagePage() {
  const searchParams = useSearchParams();
  const packageId = searchParams.get("id");

  if (!packageId) {
    return (
      <div className="space-y-10">
        <div className="rounded-2xl border border-red-200 bg-red-50/70 px-5 py-4 text-sm text-red-700">
          <p className="font-semibold">Error</p>
          <p className="mt-1 text-xs text-red-600/80">Package ID is required.</p>
        </div>
      </div>
    );
  }

  return <EditPackageClient packageId={packageId} />;
}

