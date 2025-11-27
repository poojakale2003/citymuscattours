"use client";

import { WishlistProvider } from "@/components/providers/WishlistProvider";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return <WishlistProvider>{children}</WishlistProvider>;
}

