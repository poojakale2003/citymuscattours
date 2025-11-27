"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/shared/Logo";
import { api } from "@/lib/api";
import { saveToken, saveRefreshToken, getRefreshToken, ensureTokenSaved } from "@/utils/auth";

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

type ApiLoginResponse =
  | string
  | {
      token?: string;
      accessToken?: string;
      access_token?: string;
      refreshToken?: string;
      refresh_token?: string;
      tokens?: {
        accessToken?: string;
        access_token?: string;
        refreshToken?: string;
        refresh_token?: string;
      };
      data?: {
        token?: string;
        accessToken?: string;
        access_token?: string;
        refreshToken?: string;
        refresh_token?: string;
        tokens?: {
          accessToken?: string;
          access_token?: string;
          refreshToken?: string;
          refresh_token?: string;
        };
      };
    }
  | Record<string, unknown>;

function extractTokens(payload: ApiLoginResponse) {
  console.log("🔍 extractTokens: Starting extraction...", {
    payloadType: typeof payload,
    payloadIsNull: payload === null,
    payloadIsUndefined: payload === undefined
  });

  if (!payload) {
    console.warn("⚠️ extractTokens: Payload is null or undefined");
    return {};
  }

  if (typeof payload === "string") {
    console.log("✅ extractTokens: Payload is a string (token)", {
      tokenLength: payload.length,
      tokenPreview: payload.substring(0, 30) + "..."
    });
    return { accessToken: payload };
  }

  if (typeof payload !== "object") {
    console.warn("⚠️ extractTokens: Payload is not an object or string", { type: typeof payload });
    return {};
  }

  const payloadObj = payload as Record<string, any>;

  // Try multiple possible locations for tokens
  const possibleTokenPaths = [
    payloadObj.token,
    payloadObj.accessToken,
    payloadObj.access_token,
    payloadObj.tokens?.accessToken,
    payloadObj.tokens?.access_token,
    payloadObj.data?.token,
    payloadObj.data?.accessToken,
    payloadObj.data?.access_token,
    payloadObj.data?.tokens?.accessToken,
    payloadObj.data?.tokens?.access_token,
    payloadObj.auth?.token,
    payloadObj.auth?.accessToken,
  ];

  const possibleRefreshPaths = [
    payloadObj.refreshToken,
    payloadObj.refresh_token,
    payloadObj.tokens?.refreshToken,
    payloadObj.tokens?.refresh_token,
    payloadObj.data?.refreshToken,
    payloadObj.data?.refresh_token,
    payloadObj.data?.tokens?.refreshToken,
    payloadObj.data?.tokens?.refresh_token,
    payloadObj.auth?.refreshToken,
  ];

  const directToken = possibleTokenPaths.find(token => typeof token === "string" && token.trim().length > 0);
  const directRefresh = possibleRefreshPaths.find(token => typeof token === "string" && token.trim().length > 0);

  console.log("🔍 extractTokens: Token search results", {
    foundToken: !!directToken,
    tokenLength: directToken?.length,
    tokenPreview: directToken ? directToken.substring(0, 30) + "..." : "null",
    foundRefreshToken: !!directRefresh,
    refreshTokenLength: directRefresh?.length,
    refreshTokenPreview: directRefresh ? directRefresh.substring(0, 30) + "..." : "null",
    searchedPaths: {
      token: possibleTokenPaths.map((t, i) => ({ path: i, found: !!t, type: typeof t })),
      refresh: possibleRefreshPaths.map((t, i) => ({ path: i, found: !!t, type: typeof t }))
    }
  });

  return {
    accessToken: directToken,
    refreshToken: directRefresh,
  };
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#f8fafc] text-sm text-slate-500">Loading secure portal…</div>}>
      <AdminLoginPageContent />
    </Suspense>
  );
}

function AdminLoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("🔐 Starting login process...", {
        email: email.trim(),
        apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost/php-backend/api"
      });

      const response = (await api.login({
        email: email.trim(),
        password,
      })) as ApiLoginResponse;

      console.log("✅ Login API call successful");
      console.log("📦 Login response received:", {
        responseType: typeof response,
        isNull: response === null,
        isUndefined: response === undefined,
        responseKeys: typeof response === "object" && response !== null ? Object.keys(response) : [],
        fullResponse: JSON.stringify(response, null, 2)
      });

      console.log("🔍 Extracting tokens from response...");
      const { accessToken, refreshToken } = extractTokens(response);

      console.log("🔑 Extracted tokens:", {
        hasAccessToken: !!accessToken,
        accessTokenType: typeof accessToken,
        accessTokenLength: accessToken?.length,
        accessTokenPreview: accessToken ? `${accessToken.substring(0, 30)}...` : "null",
        accessTokenIsEmpty: accessToken ? accessToken.trim().length === 0 : true,
        hasRefreshToken: !!refreshToken,
        refreshTokenType: typeof refreshToken,
        refreshTokenLength: refreshToken?.length,
        refreshTokenPreview: refreshToken ? `${refreshToken.substring(0, 30)}...` : "null"
      });

      // Validate and save access token
      if (!accessToken) {
        console.error("❌ No access token in extracted tokens");
        console.error("Response structure:", JSON.stringify(response, null, 2));
        throw new Error("Login succeeded but access token was not returned. Backend response format: " + JSON.stringify(response));
      }

      if (typeof accessToken !== "string") {
        console.error("❌ Access token is not a string:", { type: typeof accessToken, value: accessToken });
        throw new Error("Access token is not in the correct format. Expected string, got: " + typeof accessToken);
      }

      if (accessToken.trim().length === 0) {
        console.error("❌ Access token is empty string");
        throw new Error("Access token is empty. Please check backend configuration.");
      }

      console.log("💾 Saving access token to localStorage...");
      
      // Use ensureTokenSaved for maximum reliability
      const tokenSaved = ensureTokenSaved(accessToken, 5);
      if (!tokenSaved) {
        console.error("❌ Failed to save access token to localStorage after multiple attempts");
        console.error("localStorage status:", {
          available: typeof window !== "undefined" && typeof window.localStorage !== "undefined",
          keys: typeof window !== "undefined" ? Object.keys(window.localStorage) : [],
          quota: typeof window !== "undefined" && "storage" in navigator ? "available" : "unknown"
        });
        throw new Error("Failed to save authentication token after multiple attempts. Please check if localStorage is enabled and try again.");
      }

      // Multiple verification checks
      console.log("🔍 Performing multiple verification checks...");
      let allChecksPassed = true;
      const verificationChecks = 5;
      
      for (let i = 1; i <= verificationChecks; i++) {
        const savedToken = typeof window !== "undefined" ? window.localStorage.getItem("citymuscattours_token") : null;
        if (!savedToken) {
          console.error(`❌ Verification check ${i}/${verificationChecks} failed: Token not found`);
          allChecksPassed = false;
          break;
        }
        if (savedToken !== accessToken) {
          console.error(`❌ Verification check ${i}/${verificationChecks} failed: Tokens don't match`, {
            expectedLength: accessToken.length,
            actualLength: savedToken.length,
            expectedPreview: accessToken.substring(0, 30) + "...",
            actualPreview: savedToken.substring(0, 30) + "..."
          });
          allChecksPassed = false;
          break;
        }
        console.log(`✅ Verification check ${i}/${verificationChecks} passed`);
      }

      if (!allChecksPassed) {
        console.error("❌ Token verification failed after multiple checks");
        throw new Error("Token was not saved correctly. Please try logging in again.");
      }

      // Final read to confirm
      const finalToken = typeof window !== "undefined" ? window.localStorage.getItem("citymuscattours_token") : null;
      console.log("✅ Access token saved and verified successfully", {
        tokenLength: finalToken?.length || 0,
        tokenPreview: finalToken ? finalToken.substring(0, 30) + "..." : "null",
        verificationChecks: verificationChecks,
        allChecksPassed: true
      });

      // Save refresh token if provided
      if (refreshToken && typeof refreshToken === "string" && refreshToken.trim().length > 0) {
        console.log("💾 Saving refresh token to localStorage...");
        const refreshTokenSaved = saveRefreshToken(refreshToken);
        if (!refreshTokenSaved) {
          console.warn("⚠️ Failed to save refresh token, but access token is saved. Continuing...");
        } else {
          const savedRefresh = typeof window !== "undefined" ? window.localStorage.getItem("citymuscattours_refresh_token") : null;
          if (savedRefresh === refreshToken) {
            console.log("✅ Refresh token saved and verified successfully", {
              tokenLength: savedRefresh.length,
              tokenPreview: savedRefresh.substring(0, 30) + "..."
            });
          } else {
            console.warn("⚠️ Refresh token verification failed, but continuing with access token");
          }
        }
      } else {
        console.warn("⚠️ No refresh token provided by backend");
      }

      // Final verification before redirect - multiple checks
      console.log("🔍 Final token verification before redirect...");
      
      const finalChecks = 3;
      let finalCheckPassed = false;
      
      for (let i = 1; i <= finalChecks; i++) {
        const finalTokenCheck = typeof window !== "undefined" ? window.localStorage.getItem("citymuscattours_token") : null;
        if (finalTokenCheck && finalTokenCheck === accessToken) {
          console.log(`✅ Final check ${i}/${finalChecks} passed`);
          finalCheckPassed = true;
        } else {
          console.error(`❌ Final check ${i}/${finalChecks} failed`, {
            tokenExists: !!finalTokenCheck,
            tokenMatches: finalTokenCheck === accessToken,
            expectedLength: accessToken.length,
            actualLength: finalTokenCheck?.length || 0
          });
          finalCheckPassed = false;
          break;
        }
      }
      
      if (!finalCheckPassed) {
        console.error("❌ Final token verification failed - token is missing or incorrect");
        console.error("All localStorage items:", typeof window !== "undefined" ? Object.fromEntries(
          Object.keys(window.localStorage).map(key => [key, window.localStorage.getItem(key)?.substring(0, 50)])
        ) : {});
        throw new Error("Authentication token was lost or corrupted. Please try logging in again.");
      }

      // Clear refresh_disabled flag on successful login (in case backend was fixed)
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("refresh_disabled");
      }

      // One more absolute final check
      const absoluteFinalCheck = typeof window !== "undefined" ? window.localStorage.getItem("citymuscattours_token") : null;
      if (!absoluteFinalCheck || absoluteFinalCheck !== accessToken) {
        console.error("❌ Absolute final check failed - aborting redirect");
        throw new Error("Token verification failed at final step. Please try logging in again.");
      }

      console.log("✅ All tokens verified successfully!");
      console.log("📊 Final token status:", {
        hasAccessToken: !!absoluteFinalCheck,
        accessTokenLength: absoluteFinalCheck.length,
        accessTokenPreview: absoluteFinalCheck.substring(0, 30) + "...",
        hasRefreshToken: !!getRefreshToken(),
        refreshTokenLength: getRefreshToken()?.length || 0,
        localStorageKeys: typeof window !== "undefined" ? Object.keys(window.localStorage) : []
      });
      console.log("🚀 Ready to redirect to admin dashboard");

      // Redirect to admin dashboard or return URL
      const returnUrl = searchParams?.get("returnUrl");
      const redirectPath = returnUrl ? decodeURIComponent(returnUrl) : "/admin";
      router.push(redirectPath);
      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to login. Please verify your credentials and ensure the PHP backend is running on WAMP (http://localhost/php-backend).";
      setErrors({ general: errorMessage || "Login failed. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-surface)] px-4 py-10">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_25px_60px_-35px_rgb(15_23_42/0.35)]">
        <Link href="/" className="mb-6 flex justify-center" aria-label="Back to home">
          <Logo />
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">Admin Login</h1>
        
        {errors.general && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
          <label className="grid gap-2 text-sm font-medium text-slate-600">
            Email
            <input
              name="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              placeholder="name@example.com"
              className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
                errors.email
                  ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                  : "border-slate-200 focus:border-[var(--color-brand-400)] focus:ring-[var(--color-brand-200)]"
              }`}
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? "email-error" : undefined}
              suppressHydrationWarning
            />
            {errors.email && (
              <p id="email-error" className="text-xs text-red-600">
                {errors.email}
              </p>
            )}
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-600">
            Password
            <input
              name="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              placeholder="••••••••"
              className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
                errors.password
                  ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                  : "border-slate-200 focus:border-[var(--color-brand-400)] focus:ring-[var(--color-brand-200)]"
              }`}
              aria-invalid={errors.password ? "true" : "false"}
              aria-describedby={errors.password ? "password-error" : undefined}
              suppressHydrationWarning
            />
            {errors.password && (
              <p id="password-error" className="text-xs text-red-600">
                {errors.password}
              </p>
            )}
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-[var(--color-brand-600)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-700)] disabled:cursor-not-allowed disabled:opacity-70"
            suppressHydrationWarning
          >
            {isSubmitting ? "Logging in…" : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}

