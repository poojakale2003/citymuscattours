"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { saveToken } from "@/utils/auth";

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const router = useRouter();
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
      const response = await api.login({
        email: email.trim(),
        password,
      });

      // Save token if provided
      if (response && typeof response === "object" && "token" in response) {
        saveToken((response as { token: string }).token);
      } else if (typeof response === "string") {
        // If response is just a token string
        saveToken(response);
      }

      // Redirect to home page or dashboard
      router.push("/");
      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Invalid email or password. Please try again.";
      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-slate-900">
          Welcome back to citymuscattours
        </h1>
        <p className="text-sm text-slate-600">
          Access your bookings, manage itineraries, and chat with your concierge.
        </p>
      </div>

      {errors.general && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <label className="grid gap-2 text-sm font-medium text-slate-600">
          Email address
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
            placeholder="you@example.com"
            className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
              errors.email
                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                : "border-slate-200 focus:border-[var(--color-brand-400)] focus:ring-[var(--color-brand-200)]"
            }`}
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "email-error" : undefined}
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
          />
          {errors.password && (
            <p id="password-error" className="text-xs text-red-600">
              {errors.password}
            </p>
          )}
        </label>

        <div className="flex items-center justify-between text-sm text-slate-600">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="remember" className="rounded border-slate-300" />
            Remember me
          </label>
          <Link
            href="/forgot-password"
            className="font-semibold text-[var(--color-brand-600)] hover:text-[var(--color-brand-700)]"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-[var(--color-brand-600)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-700)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="text-sm text-slate-600">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-[var(--color-brand-600)] hover:text-[var(--color-brand-700)]"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}

