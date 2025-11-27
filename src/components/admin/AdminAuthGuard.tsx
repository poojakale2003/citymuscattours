"use client";

import { useEffect, useState, useRef, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { isAuthenticated } from "@/utils/auth";

type AdminAuthGuardProps = {
  children: ReactNode;
};

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isReady, setIsReady] = useState(false);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const checkCountRef = useRef(0);

  useEffect(() => {
    // Clear any pending redirect
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }

    const checkAuth = () => {
      const authed = isAuthenticated();
      
      if (!authed) {
        checkCountRef.current += 1;
        
        // Don't redirect immediately - give time for API calls to complete
        // This prevents false redirects when tokens are temporarily cleared during refresh
        // Only redirect if token is still missing after multiple checks
        if (checkCountRef.current === 1) {
          // First check - wait a bit before redirecting
          // This gives time for token refresh or API calls to complete
          redirectTimeoutRef.current = setTimeout(() => {
            const stillAuthed = isAuthenticated();
            if (!stillAuthed) {
              const queryString = searchParams?.toString();
              const returnUrl = queryString ? `${pathname}?${queryString}` : pathname;
              const redirectUrl = returnUrl ? `/admin/login?returnUrl=${encodeURIComponent(returnUrl)}` : "/admin/login";
              console.log("🔒 AdminAuthGuard: No token found, redirecting to login");
              router.replace(redirectUrl);
            } else {
              // Token was restored (e.g., after refresh)
              checkCountRef.current = 0;
              setIsReady(true);
            }
          }, 1000); // Wait 1 second before redirecting
        } else if (checkCountRef.current > 3) {
          // After multiple checks, token is definitely missing
          const queryString = searchParams?.toString();
          const returnUrl = queryString ? `${pathname}?${queryString}` : pathname;
          const redirectUrl = returnUrl ? `/admin/login?returnUrl=${encodeURIComponent(returnUrl)}` : "/admin/login";
          console.log("🔒 AdminAuthGuard: Token still missing after multiple checks, redirecting to login");
          router.replace(redirectUrl);
        }
        return;
      }
      
      // Token exists - reset counter and mark as ready
      checkCountRef.current = 0;
      setIsReady(true);
    };

    checkAuth();
    
    // Cleanup on unmount
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [pathname, router, searchParams]);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface)] text-sm text-slate-500">
        Verifying admin access…
      </div>
    );
  }

  return <>{children}</>;
}

