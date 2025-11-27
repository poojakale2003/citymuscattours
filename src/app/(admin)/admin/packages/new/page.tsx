"use client";

import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { formatNumber } from "@/lib/numbers";
import { api } from "@/lib/api";
import { displayCurrencyCode, formatDisplayCurrency } from "@/lib/currency";
import { getToken, getRefreshToken } from "@/utils/auth";

type PackageFormState = {
  // Tour Details
  tourName: string;
  category: string;
  startDate: string;
  endDate: string;
  destination: string;
  durationDays: string;
  durationNights: string;
  totalPeople: string;
  pricing: string;
  offerPrice: string;
  minAge: string;
  rating: string;
  isFeatured: boolean;
  
  // Location
  country: string;
  city: string;
  state: string;
  zipCode: string;
  address: string;
  address1: string;
  
  // Multi-select fields
  highlights: string[];
  activities: string[];
  includes: string[];
  excludes: string[];
  
  // Itinerary
  itinerary: Array<{ day: string; title: string; description: string }>;
  
  // FAQ
  faqs: Array<{ question: string; answer: string }>;
  
  // Gallery
  galleryImages: File[];
  featureImage: File | null;
  
  // Description
  description: string;
};

const categories = ["City Tours", "Car Rental", "Airport Transport"];

const activityOptions = [
  "Cultural Experiences",
  "Culinary Tours",
  "Sightseeing",
  "Hiking & Nature Walks",
  "Water Sports",
  "Wildlife Safaris",
  "Adventure Sports",
  "Wine & Brewery Tours",
  "Historical Site Visits",
  "Boat Tours",
  "Photography",
  "Spa & Wellness",
  "Cycling",
  "Volunteering",
  "Museum & Art Gallery",
];

const includeOptions = [
  "Exclusive Merchandise",
  "Early Venue Access",
  "Acoustic Performance",
  "Transportation (if applicable)",
  "Wildlife Safaris",
  "Culinary Tours",
];

const excludeOptions = [
  "Travel Expenses",
  "Accommodation",
  "Food and Beverage",
  "Parking Fees",
  "Personal Expenses",
];

// Oman cities
const omanCities = [
  "Muscat",
  "Salalah",
  "Sohar",
  "Sur",
  "Nizwa",
  "Ibri",
  "Rustaq",
  "Khasab",
  "Barka",
  "Seeb",
  "Bidbid",
  "Ibra",
  "Bahla",
  "Adam",
  "Al Khaburah",
  "Shinas",
  "Saham",
  "Liwa",
  "Dibba",
];

// Oman governorates/states
const omanGovernorates = [
  "Muscat",
  "Dhofar",
  "Al Batinah North",
  "Al Batinah South",
  "Al Buraimi",
  "Ad Dakhiliyah",
  "Adh Dhahirah",
  "Al Sharqiyah North",
  "Al Sharqiyah South",
  "Al Wusta",
  "Musandam",
];

// Map backend field names to form field names for better error display
const fieldNameMap: Record<string, string> = {
  title: "tourName",
  tourName: "tourName",
  destination: "destination",
  price: "pricing",
  pricing: "pricing",
  duration: "durationDays",
  durationDays: "durationDays",
  category: "category",
  description: "description",
  location: "city",
  city: "city",
  country: "country",
  highlights: "highlights",
  activities: "activities",
  included: "includes",
  excludes: "excludes",
  itinerary: "itinerary",
  faqs: "faqs",
};

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function AdminCreatePackagePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formState, setFormState] = useState<PackageFormState>({
    tourName: "",
    category: categories[0],
    startDate: "",
    endDate: "",
    destination: "",
    durationDays: "",
    durationNights: "",
    totalPeople: "",
    pricing: "",
    offerPrice: "",
    minAge: "",
    rating: "",
    isFeatured: false,
    country: "Oman",
    city: "",
    state: "",
    zipCode: "",
    address: "",
    address1: "",
    highlights: [],
    activities: [],
    includes: [],
    excludes: [],
    itinerary: [{ day: "Day 1", title: "", description: "" }],
    faqs: [{ question: "", answer: "" }],
    galleryImages: [],
    featureImage: null,
    description: "",
  });

  // Clean up empty strings from highlights array (run once on mount and when highlights are modified)
  useEffect(() => {
    const hasEmptyStrings = formState.highlights.some(h => !h || (typeof h === 'string' && h.trim().length === 0));
    if (hasEmptyStrings) {
      setFormState((prev) => ({
        ...prev,
        highlights: prev.highlights.filter(h => h != null && typeof h === 'string' && h.trim().length > 0),
      }));
    }
  }, [formState.highlights.join(',')]); // Use join to create a stable dependency

  const handleChange =
    (field: keyof PackageFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value =
        event.target.type === "checkbox"
          ? (event.target as HTMLInputElement).checked
          : event.target.value;

      setFormState((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleMultiSelect = (field: "highlights" | "activities" | "includes" | "excludes") => 
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setFormState((prev) => {
        const current = prev[field];
        if (current.includes(value)) {
          return { ...prev, [field]: current.filter((item) => item !== value) };
        }
        return { ...prev, [field]: [...current, value] };
      });
    };

  const handleItineraryChange = (index: number, field: "day" | "title" | "description", value: string) => {
    setFormState((prev) => {
      const newItinerary = [...prev.itinerary];
      newItinerary[index] = { ...newItinerary[index], [field]: value };
      return { ...prev, itinerary: newItinerary };
    });
  };

  const addItineraryDay = () => {
    setFormState((prev) => ({
      ...prev,
      itinerary: [...prev.itinerary, { day: `Day ${prev.itinerary.length + 1}`, title: "", description: "" }],
    }));
  };

  const removeItineraryDay = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      itinerary: prev.itinerary.filter((_, i) => i !== index),
    }));
  };

  const handleFAQChange = (index: number, field: "question" | "answer", value: string) => {
    setFormState((prev) => {
      const newFAQs = [...prev.faqs];
      newFAQs[index] = { ...newFAQs[index], [field]: value };
      return { ...prev, faqs: newFAQs };
    });
  };

  const addFAQ = () => {
    setFormState((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { question: "", answer: "" }],
    }));
  };

  const removeFAQ = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  const handleFileChange = (field: "featureImage" | "galleryImages") => 
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files) return;

      if (field === "featureImage") {
        setFormState((prev) => ({ ...prev, featureImage: files[0] || null }));
      } else {
        setFormState((prev) => ({
          ...prev,
          galleryImages: Array.from(files),
        }));
      }
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    // Monitor refresh token before API call
    const refreshTokenBefore = getRefreshToken();
    const accessTokenBefore = getToken();
    console.log("🔍 Package Creation - Token Status BEFORE API call:", {
      hasAccessToken: !!accessTokenBefore,
      accessTokenLength: accessTokenBefore?.length,
      hasRefreshToken: !!refreshTokenBefore,
      refreshTokenLength: refreshTokenBefore?.length,
      refreshTokenPreview: refreshTokenBefore ? `${refreshTokenBefore.substring(0, 30)}...` : "null"
    });

    try {
      // Validate required fields
      if (!formState.tourName.trim()) {
        setFieldErrors({ tourName: ["Tour name is required"] });
        setIsSubmitting(false);
        return;
      }
      if (!formState.destination.trim()) {
        setFieldErrors({ destination: ["Destination is required"] });
        setIsSubmitting(false);
        return;
      }
      if (!formState.pricing || parseInt(formState.pricing, 10) <= 0) {
        setFieldErrors({ pricing: ["Valid pricing is required"] });
        setIsSubmitting(false);
        return;
      }
      if (!formState.durationDays || parseInt(formState.durationDays, 10) <= 0) {
        setFieldErrors({ durationDays: ["Duration in days is required"] });
        setIsSubmitting(false);
        return;
      }

      // Prepare package data
      const offerPriceValue = parseInt(formState.offerPrice || "0", 10);
      const basePriceValue = parseInt(formState.pricing || "0", 10);
      const priceNumber = formState.offerPrice && offerPriceValue > 0 ? offerPriceValue : basePriceValue;

      // Check if we have files to upload (use FormData)
      const hasFiles = formState.featureImage || formState.galleryImages.length > 0;

      if (hasFiles) {
        // Use FormData for file uploads
        const formData = new FormData();
        
        // Add text fields - always include required fields
        formData.append("title", formState.tourName.trim());
        // Map category to backend format (e.g., "City Tours" -> "city-tours")
        const categoryMap: Record<string, string> = {
          "City Tours": "city-tours",
          "Car Rental": "car-rental",
          "Airport Transport": "airport-transport",
          "Cruises & Stays": "cruises-stays",
          "Experiences": "experiences",
        };
        const backendCategory = categoryMap[formState.category] || formState.category.toLowerCase().replace(/\s+/g, "-");
        formData.append("category", backendCategory);
        formData.append("destination", formState.destination.trim());
        formData.append("description", (formState.description || "").trim());
        formData.append("price", priceNumber.toString());
        formData.append("currency", displayCurrencyCode);
        if (formState.offerPrice) {
          formData.append("offerPrice", formState.offerPrice);
        }
        if (formState.startDate) {
          formData.append("startDate", formState.startDate);
        }
        if (formState.endDate) {
          formData.append("endDate", formState.endDate);
        }
        if (formState.durationDays) {
          formData.append("durationDays", formState.durationDays);
        }
        if (formState.durationNights) {
          formData.append("durationNights", formState.durationNights);
        }
        if (formState.minAge) {
          formData.append("minAge", formState.minAge);
        }
        if (formState.rating) {
          formData.append("rating", formState.rating);
        }
        formData.append("isFeatured", formState.isFeatured ? "true" : "false");
        if (formState.totalPeople) {
          formData.append("maxParticipants", formState.totalPeople);
        }
        // Ensure duration is always sent
        const durationValue = formState.durationDays 
          ? `${formState.durationDays} day${parseInt(formState.durationDays) !== 1 ? "s" : ""}${formState.durationNights ? ` ${formState.durationNights} night${parseInt(formState.durationNights) !== 1 ? "s" : ""}` : ""}`
          : "";
        formData.append("duration", durationValue);
        formData.append("location", (formState.city || formState.destination).trim());
        
        // Add arrays as JSON strings (filter out empty strings to avoid [""])
        // Clean highlights: remove null, undefined, and empty/whitespace-only strings
        const filteredHighlights = formState.highlights
          .filter(h => h != null && typeof h === 'string' && h.trim().length > 0)
          .map(h => h.trim()); // Also trim each item
        
        console.log("Highlights before sending:", {
          original: formState.highlights,
          filtered: filteredHighlights,
          count: filteredHighlights.length,
          originalCount: formState.highlights.length
        });
        
        // Always send highlights, even if empty array
        formData.append("highlights", JSON.stringify(filteredHighlights));
        formData.append(
          "activities",
          JSON.stringify(formState.activities.length ? formState.activities : [])
        );
        formData.append(
          "includes",
          JSON.stringify(formState.includes.length ? formState.includes : [])
        );
        formData.append(
          "excludes",
          JSON.stringify(formState.excludes.length ? formState.excludes : [])
        );
        formData.append(
          "itinerary",
          JSON.stringify(formState.itinerary.length ? formState.itinerary : [])
        );
        formData.append(
          "faqs",
          JSON.stringify(formState.faqs.length ? formState.faqs : [])
        );

        // Add location details
        if (formState.country) formData.append("country", formState.country);
        if (formState.city) formData.append("city", formState.city);
        if (formState.state) formData.append("state", formState.state);
        if (formState.zipCode) formData.append("zipCode", formState.zipCode);
        if (formState.address) formData.append("address", formState.address);
        if (formState.address1) formData.append("address1", formState.address1);
        if (formState.totalPeople) formData.append("maxParticipants", formState.totalPeople);
        if (formState.minAge) formData.append("minAge", formState.minAge);

        // Add files
        if (formState.featureImage) {
          formData.append("featureImage", formState.featureImage);
          formData.append("feature_image", formState.featureImage.name);
        }
        formState.galleryImages.forEach((file, index) => {
          formData.append("galleryImages[]", file);
        });

        // Log FormData contents for debugging (excluding files)
        console.log("Sending FormData with fields:", {
          title: formState.tourName,
          category: backendCategory,
          destination: formState.destination,
          price: priceNumber,
          duration: `${formState.durationDays} days${formState.durationNights ? ` ${formState.durationNights} nights` : ""}`,
          hasFeatureImage: !!formState.featureImage,
          galleryImagesCount: formState.galleryImages.length,
        });

        // Verify token exists before making API call
        const tokenBeforeCall = getToken();
        console.log("Token check before createPackage call:", {
          hasToken: !!tokenBeforeCall,
          tokenLength: tokenBeforeCall?.length,
          tokenPreview: tokenBeforeCall ? `${tokenBeforeCall.substring(0, 20)}...` : "null",
          allLocalStorageKeys: typeof window !== "undefined" ? Object.keys(window.localStorage) : []
        });

        if (!tokenBeforeCall) {
          console.error("No token found before API call. Redirecting to login...");
          router.push("/admin/login?returnUrl=" + encodeURIComponent("/admin/packages/new"));
          return;
        }

        // Call API with FormData
        await api.createPackage(formData);
      } else {
        // Use JSON for text-only submissions
        // Map category to backend format
        const categoryMap: Record<string, string> = {
          "City Tours": "city-tours",
          "Car Rental": "car-rental",
          "Airport Transport": "airport-transport",
          "Cruises & Stays": "cruises-stays",
          "Experiences": "experiences",
        };
        const backendCategory = categoryMap[formState.category] || formState.category.toLowerCase().replace(/\s+/g, "-");
        
        const packageData = {
          title: formState.tourName,
          category: backendCategory,
          destination: formState.destination,
          description: formState.description || "",
          price: priceNumber,
          currency: displayCurrencyCode,
          offerPrice: formState.offerPrice ? parseInt(formState.offerPrice, 10) : undefined,
          duration: `${formState.durationDays} days${formState.durationNights ? ` ${formState.durationNights} nights` : ""}`,
          durationDays: formState.durationDays ? parseInt(formState.durationDays, 10) : undefined,
          durationNights: formState.durationNights ? parseInt(formState.durationNights, 10) : undefined,
          startDate: formState.startDate || undefined,
          endDate: formState.endDate || undefined,
          location: formState.city || formState.destination,
          highlights: formState.highlights.filter(h => h.trim().length > 0).length > 0 
            ? formState.highlights.filter(h => h.trim().length > 0) 
            : undefined,
          activities: formState.activities.filter(a => a.trim().length > 0).length > 0 
            ? formState.activities.filter(a => a.trim().length > 0) 
            : undefined,
          included: formState.includes.length > 0 ? formState.includes : undefined,
          excluded: formState.excludes.length > 0 ? formState.excludes : undefined,
          itinerary: formState.itinerary.length > 0 ? formState.itinerary : undefined,
          faqs: formState.faqs.length > 0 ? formState.faqs : undefined,
          country: formState.country || undefined,
          city: formState.city || undefined,
          state: formState.state || undefined,
          zipCode: formState.zipCode || undefined,
          address: formState.address || undefined,
          address1: formState.address1 || undefined,
          maxParticipants: formState.totalPeople ? parseInt(formState.totalPeople, 10) : undefined,
          minAge: formState.minAge ? parseInt(formState.minAge, 10) : undefined,
          rating: formState.rating ? parseFloat(formState.rating) : undefined,
          isFeatured: formState.isFeatured,
          feature_image: formState.featureImage?.name,
        };
        
        // Remove undefined fields
        Object.keys(packageData).forEach((key) => {
          if (packageData[key as keyof typeof packageData] === undefined) {
            delete packageData[key as keyof typeof packageData];
          }
        });

        // Log JSON payload for debugging
        console.log("Sending JSON payload:", packageData);

        // Verify token exists before making API call
        const tokenBeforeCall = getToken();
        console.log("Token check before createPackage call (JSON):", {
          hasToken: !!tokenBeforeCall,
          tokenLength: tokenBeforeCall?.length,
          tokenPreview: tokenBeforeCall ? `${tokenBeforeCall.substring(0, 20)}...` : "null",
          allLocalStorageKeys: typeof window !== "undefined" ? Object.keys(window.localStorage) : []
        });

        if (!tokenBeforeCall) {
          console.error("No token found before API call. Redirecting to login...");
          router.push("/admin/login?returnUrl=" + encodeURIComponent("/admin/packages/new"));
          return;
        }

        // Monitor refresh token right before API call
        const refreshTokenBeforeCall = getRefreshToken();
        console.log("🔍 Package Creation (JSON) - Refresh token status RIGHT BEFORE createPackage call:", {
          hasRefreshToken: !!refreshTokenBeforeCall,
          refreshTokenLength: refreshTokenBeforeCall?.length
        });

        // Call API with JSON
        await api.createPackage(packageData);
        
        // Monitor refresh token immediately after API call
        const refreshTokenAfterCall = getRefreshToken();
        console.log("🔍 Package Creation (JSON) - Refresh token status IMMEDIATELY AFTER createPackage call:", {
          hasRefreshToken: !!refreshTokenAfterCall,
          refreshTokenLength: refreshTokenAfterCall?.length,
          wasCleared: !!refreshTokenBeforeCall && !refreshTokenAfterCall
        });
        
        if (refreshTokenBeforeCall && !refreshTokenAfterCall) {
          console.error("❌ CRITICAL: Refresh token was cleared during createPackage call!");
          console.error("❌ Refresh token before:", refreshTokenBeforeCall.substring(0, 50) + "...");
          console.error("❌ This should not happen - refresh token should only be cleared if backend says it's invalid");
        }
      }

      // Also save to localStorage for local display (fallback)
      const STORAGE_KEY = "admin_packages";
      const stored = localStorage.getItem(STORAGE_KEY);
      const existingPackages = stored ? JSON.parse(stored) : [];
      
      const localPackage = {
        id: `pkg-${Date.now()}`,
        name: formState.tourName,
        category: formState.category,
        price: formatDisplayCurrency(priceNumber, "INR"),
        status: "Draft" as const,
        createdAt: new Date().toISOString(),
        fullData: formState,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify([localPackage, ...existingPackages]));

      // Monitor refresh token after successful creation
      const refreshTokenAfterSuccess = getRefreshToken();
      console.log("🔍 Package Creation - Token Status AFTER SUCCESS:", {
        hasRefreshToken: !!refreshTokenAfterSuccess,
        refreshTokenLength: refreshTokenAfterSuccess?.length,
        refreshTokenWasCleared: !!refreshTokenBefore && !refreshTokenAfterSuccess
      });
      
      if (refreshTokenBefore && !refreshTokenAfterSuccess) {
        console.error("❌ CRITICAL: Refresh token was cleared after successful package creation!");
        console.error("❌ This should not happen - refresh token should not be cleared on success");
      }

      // Redirect to packages list
      router.push("/admin/packages?created=1");
    } catch (error) {
      // Monitor refresh token after error
      const refreshTokenAfterError = getRefreshToken();
      const accessTokenAfterError = getToken();
      console.log("🔍 Package Creation - Token Status AFTER ERROR:", {
        hasAccessToken: !!accessTokenAfterError,
        accessTokenLength: accessTokenAfterError?.length,
        hasRefreshToken: !!refreshTokenAfterError,
        refreshTokenLength: refreshTokenAfterError?.length,
        refreshTokenWasCleared: !!refreshTokenBefore && !refreshTokenAfterError,
        accessTokenWasCleared: !!accessTokenBefore && !accessTokenAfterError
      });
      
      if (refreshTokenBefore && !refreshTokenAfterError) {
        console.error("❌ CRITICAL: Refresh token was cleared during error handling!");
        console.error("❌ Error:", error);
        console.error("❌ This should not happen - check what cleared the refresh token");
      }
      
      console.error("Error creating package:", error);
      console.error("Full error object:", JSON.stringify(error, null, 2));
      
      // FIRST: Handle validation errors - these should NOT trigger logout
      if (error instanceof Error && (error as any).validationErrors) {
        const validationErrors = (error as any).validationErrors as Record<string, string[]>;
        console.log("Validation errors extracted:", validationErrors);
        
        // Map backend field names to form field names
        const mappedErrors: Record<string, string[]> = {};
        Object.entries(validationErrors).forEach(([backendField, messages]) => {
          const formField = fieldNameMap[backendField] || backendField;
          mappedErrors[formField] = messages;
        });
        
        setFieldErrors(mappedErrors);
        setError("Please fix the validation errors below and try again.");
        return; // Don't check for auth errors if we have validation errors
      }
      
      // SECOND: Handle authentication errors - redirect to login
      // Only redirect for specific authentication errors, not validation or other errors
      // IMPORTANT: Don't redirect on refresh token errors - only on access token errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Check if error is about refresh token (not access token) - these should NOT trigger redirect
      const isRefreshTokenError = 
        errorMessage.includes("refresh token") ||
        errorMessage.includes("Refresh token");
      
      // Only check for auth errors if it's NOT a refresh token error
      const isAuthError = !isRefreshTokenError && (
        errorMessage.includes("Session expired") ||
        errorMessage.includes("Authentication expired") ||
        errorMessage.includes("please login again") ||
        errorMessage.includes("Invalid or expired token") ||
        errorMessage.includes("Not authenticated") ||
        errorMessage.includes("Authentication required") ||
        (errorMessage.includes("token") && !errorMessage.includes("refresh") && (
          errorMessage.includes("expired") ||
          errorMessage.includes("invalid") ||
          errorMessage.includes("missing")
        ))
      );
      
      if (isAuthError) {
        const tokenExists = typeof window !== "undefined" ? window.localStorage.getItem("citymuscattours_token") : null;
        console.log("Authentication error detected, checking token status:", { tokenExists: !!tokenExists, errorMessage });
        
        // Check if error specifically says token is invalid/expired
        const isTokenInvalid = errorMessage.includes("Invalid or expired token") || 
                               errorMessage.includes("Invalid token") ||
                               errorMessage.includes("expired token");
        
        // Only redirect if:
        // 1. Token is missing, OR
        // 2. Error explicitly says token is invalid/expired, OR
        // 3. Error says session expired
        if (!tokenExists || isTokenInvalid || errorMessage.includes("Session expired") || errorMessage.includes("Authentication expired")) {
          setError("Your session has expired or the token is invalid. Please logout and login again.");
          // Give user option to logout manually instead of auto-redirecting
          setTimeout(() => {
            const returnUrl = window.location.pathname + window.location.search;
            window.location.href = `/admin/login?returnUrl=${encodeURIComponent(returnUrl)}`;
          }, 3000); // Increased to 3 seconds to give user time to read
          return;
        } else {
          // Token exists but there's an auth error - might be a backend issue
          // Don't redirect immediately, show error and let user try again
          setError(`Authentication error: ${errorMessage}. Please try again or logout and login if the problem persists.`);
          return;
        }
      } else if (isRefreshTokenError) {
        // Refresh token error - don't redirect, just show warning
        // The access token might still be valid
        console.warn("Refresh token error detected, but keeping access token:", errorMessage);
        setError("There was an issue with token refresh, but your session may still be valid. Please try again. If the problem persists, please logout and login again.");
        return;
      }
      
      // THIRD: Handle other errors (network, server errors, etc.)
      const genericErrorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create package. Please check your connection and try again.";
      setError(genericErrorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/packages");
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-(--color-brand-500)">Create package</p>
        <h1 className="text-3xl font-semibold text-slate-900">New City Tour</h1>
        <p className="text-sm text-slate-600">
          Define all details of the new travel package. Fill in all required fields to create a complete listing.
        </p>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <p className="font-semibold">Error creating package</p>
          <p className="mt-1 text-xs text-red-600/80">{error}</p>
          {Object.keys(fieldErrors).length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-semibold text-red-800">Validation Errors:</p>
              <ul className="list-disc list-inside text-xs text-red-600/80 space-y-1">
                {Object.entries(fieldErrors).map(([field, messages]) => (
                  <li key={field}>
                    <strong className="capitalize">{field.replace(/([A-Z])/g, " $1").trim()}:</strong> {messages.join(", ")}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_25px_70px_-45px_rgb(15_23_42/0.6)]">
        {/* Tour Details Section */}
        <section className="space-y-6 border-b border-slate-200 pb-8">
          <h2 className="text-xl font-semibold text-slate-900">Tour Details</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="tourName" className="text-sm font-semibold text-slate-900">
                Tour Name *
              </label>
              <input
                id="tourName"
                name="tourName"
                type="text"
                required
                value={formState.tourName}
                onChange={handleChange("tourName")}
                className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 ${
                  fieldErrors.tourName
                    ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                    : "border-slate-200 focus:border-(--color-brand-400) focus:ring-(--color-brand-200)"
                }`}
                placeholder="Enter tour name"
              />
              {fieldErrors.tourName && (
                <p className="text-xs text-red-600">{fieldErrors.tourName.join(", ")}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-semibold text-slate-900">
                Category *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formState.category}
                onChange={handleChange("category")}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="startDate" className="text-sm font-semibold text-slate-900">
                Start Date *
              </label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                required
                min={getTodayDate()}
                value={formState.startDate}
                onChange={handleChange("startDate")}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="endDate" className="text-sm font-semibold text-slate-900">
                End Date *
              </label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                required
                min={formState.startDate || getTodayDate()}
                value={formState.endDate}
                onChange={handleChange("endDate")}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="destination" className="text-sm font-semibold text-slate-900">
                Destination *
              </label>
              <input
                id="destination"
                name="destination"
                type="text"
                required
                value={formState.destination}
                onChange={handleChange("destination")}
                className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 ${
                  fieldErrors.destination
                    ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                    : "border-slate-200 focus:border-(--color-brand-400) focus:ring-(--color-brand-200)"
                }`}
                placeholder="Enter destination"
              />
              {fieldErrors.destination && (
                <p className="text-xs text-red-600">{fieldErrors.destination.join(", ")}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="durationDays" className="text-sm font-semibold text-slate-900">
                Duration (Days) *
              </label>
              <select
                id="durationDays"
                name="durationDays"
                required
                value={formState.durationDays}
                onChange={handleChange("durationDays")}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
              >
                <option value="">Select days</option>
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num.toString()}>
                    {num} {num === 1 ? "day" : "days"}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="durationNights" className="text-sm font-semibold text-slate-900">
                Duration (Nights)
              </label>
              <select
                id="durationNights"
                name="durationNights"
                value={formState.durationNights}
                onChange={handleChange("durationNights")}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
              >
                <option value="">Select nights</option>
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num.toString()}>
                    {num} {num === 1 ? "night" : "nights"}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="totalPeople" className="text-sm font-semibold text-slate-900">
                Total Number Of Peoples Allotted *
              </label>
              <input
                id="totalPeople"
                name="totalPeople"
                type="number"
                required
                min="1"
                value={formState.totalPeople}
                onChange={handleChange("totalPeople")}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="pricing" className="text-sm font-semibold text-slate-900">
                Pricing ({displayCurrencyCode}) *
              </label>
              <input
                id="pricing"
                name="pricing"
                type="number"
                required
                min="0"
                value={formState.pricing}
                onChange={handleChange("pricing")}
                className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 ${
                  fieldErrors.pricing
                    ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                    : "border-slate-200 focus:border-(--color-brand-400) focus:ring-(--color-brand-200)"
                }`}
                placeholder="0"
              />
              {fieldErrors.pricing && (
                <p className="text-xs text-red-600">{fieldErrors.pricing.join(", ")}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="offerPrice" className="text-sm font-semibold text-slate-900">
                Offer Price ({displayCurrencyCode})
              </label>
              <input
                id="offerPrice"
                name="offerPrice"
                type="number"
                min="0"
                value={formState.offerPrice}
                onChange={handleChange("offerPrice")}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="minAge" className="text-sm font-semibold text-slate-900">
                Min Age
              </label>
              <input
                id="minAge"
                name="minAge"
                type="number"
                min="0"
                value={formState.minAge}
                onChange={handleChange("minAge")}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="rating" className="text-sm font-semibold text-slate-900">
                Rating (0 - 5)
              </label>
              <input
                id="rating"
                name="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formState.rating}
                onChange={handleChange("rating")}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
                placeholder="4.5"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">
                Featured Package
              </label>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                <span className="text-sm text-slate-700">Mark as featured</span>
                <label className="inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={formState.isFeatured}
                    onChange={handleChange("isFeatured")}
                    className="sr-only peer"
                  />
                  <span className="h-5 w-9 rounded-full bg-slate-300 transition-all peer-checked:bg-(--color-brand-600) relative">
                    <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-all peer-checked:translate-x-4" />
                  </span>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Location Section */}
        <section className="space-y-6 border-b border-slate-200 pb-8">
          <h2 className="text-xl font-semibold text-slate-900">Location</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="country" className="text-sm font-semibold text-slate-900">
                Country *
              </label>
              <select
                id="country"
                name="country"
                required
                value={formState.country}
                onChange={handleChange("country")}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
              >
                <option value="Oman">Oman</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="city" className="text-sm font-semibold text-slate-900">
                City *
              </label>
              <select
                id="city"
                name="city"
                required
                value={formState.city}
                onChange={handleChange("city")}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
              >
                <option value="">Select a city</option>
                {omanCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="state" className="text-sm font-semibold text-slate-900">
                State
              </label>
              <select
                id="state"
                name="state"
                value={formState.state}
                onChange={handleChange("state")}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
              >
                <option value="">Select a governorate</option>
                {omanGovernorates.map((governorate) => (
                  <option key={governorate} value={governorate}>
                    {governorate}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="zipCode" className="text-sm font-semibold text-slate-900">
                Zip Code
              </label>
              <input
                id="zipCode"
                name="zipCode"
                type="text"
                value={formState.zipCode}
                onChange={handleChange("zipCode")}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
                placeholder="Enter zip code"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="address" className="text-sm font-semibold text-slate-900">
                Address
              </label>
              <input
                id="address"
                name="address"
                type="text"
                value={formState.address}
                onChange={handleChange("address")}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
                placeholder="Enter address"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="address1" className="text-sm font-semibold text-slate-900">
                Address 1
              </label>
              <input
                id="address1"
                name="address1"
                type="text"
                value={formState.address1}
                onChange={handleChange("address1")}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
                placeholder="Enter address line 1"
              />
            </div>
          </div>
        </section>

        {/* Highlights Section */}
        <section className="space-y-6 border-b border-slate-200 pb-8">
          <h2 className="text-xl font-semibold text-slate-900">Highlights</h2>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Enter highlight and press Enter"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const input = e.currentTarget as HTMLInputElement;
                  const trimmedValue = input.value.trim();
                  // Only add if the value is not empty
                  if (trimmedValue.length > 0) {
                    setFormState((prev) => {
                      // Also filter out any existing empty strings
                      const cleanHighlights = prev.highlights.filter(h => h && h.trim().length > 0);
                      return {
                      ...prev,
                        highlights: [...cleanHighlights, trimmedValue],
                      };
                    });
                    input.value = "";
                  }
                }
              }}
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {formState.highlights
                .map((highlight, index) => {
                  // Skip empty strings in display
                  if (!highlight || highlight.trim().length === 0) {
                    return null;
                  }
                  return (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 rounded-full bg-(--color-brand-50) px-3 py-1.5 text-sm text-(--color-brand-700)"
                >
                      {highlight.trim()}
                  <button
                    type="button"
                    onClick={() => {
                      setFormState((prev) => ({
                        ...prev,
                        highlights: prev.highlights.filter((_, i) => i !== index),
                      }));
                    }}
                    className="text-(--color-brand-600) hover:text-(--color-brand-800)"
                  >
                    ×
                  </button>
                </span>
                  );
                })
                .filter(Boolean) // Remove null entries
              }
            </div>
          </div>
        </section>

        {/* Activities Section */}
        <section className="space-y-6 border-b border-slate-200 pb-8">
          <h2 className="text-xl font-semibold text-slate-900">Activities</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {activityOptions.map((activity) => (
              <label key={activity} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  value={activity}
                  checked={formState.activities.includes(activity)}
                  onChange={handleMultiSelect("activities")}
                  className="h-4 w-4 rounded border-slate-300 text-(--color-brand-600) focus:ring-(--color-brand-200)"
                />
                <span className="text-sm text-slate-700">{activity}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Includes Section */}
        <section className="space-y-6 border-b border-slate-200 pb-8">
          <h2 className="text-xl font-semibold text-slate-900">Includes</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {includeOptions.map((item) => (
              <label key={item} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  value={item}
                  checked={formState.includes.includes(item)}
                  onChange={handleMultiSelect("includes")}
                  className="h-4 w-4 rounded border-slate-300 text-(--color-brand-600) focus:ring-(--color-brand-200)"
                />
                <span className="text-sm text-slate-700">{item}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Excludes Section */}
        <section className="space-y-6 border-b border-slate-200 pb-8">
          <h2 className="text-xl font-semibold text-slate-900">Excludes</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {excludeOptions.map((item) => (
              <label key={item} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  value={item}
                  checked={formState.excludes.includes(item)}
                  onChange={handleMultiSelect("excludes")}
                  className="h-4 w-4 rounded border-slate-300 text-(--color-brand-600) focus:ring-(--color-brand-200)"
                />
                <span className="text-sm text-slate-700">{item}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Itinerary Section */}
        <section className="space-y-6 border-b border-slate-200 pb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Itinerary</h2>
            <button
              type="button"
              onClick={addItineraryDay}
              className="text-sm font-semibold text-(--color-brand-600) hover:text-(--color-brand-700)"
            >
              + Add Day
            </button>
          </div>
          <div className="space-y-4">
            {formState.itinerary.map((day, index) => (
              <div key={index} className="rounded-xl border border-slate-200 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={day.day}
                    onChange={(e) => handleItineraryChange(index, "day", e.target.value)}
                    className="text-sm font-semibold text-slate-900 border-none bg-transparent focus:outline-none"
                    placeholder="Day 1"
                  />
                  {formState.itinerary.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItineraryDay(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={day.title}
                  onChange={(e) => handleItineraryChange(index, "title", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
                  placeholder="Day title (e.g., Kickoff in Los Angeles)"
                />
                <textarea
                  value={day.description}
                  onChange={(e) => handleItineraryChange(index, "description", e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
                  placeholder="Day description"
                />
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="space-y-6 border-b border-slate-200 pb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">FAQ</h2>
            <button
              type="button"
              onClick={addFAQ}
              className="text-sm font-semibold text-(--color-brand-600) hover:text-(--color-brand-700)"
            >
              + Add FAQ
            </button>
          </div>
          <div className="space-y-4">
            {formState.faqs.map((faq, index) => (
              <div key={index} className="rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900">FAQ {index + 1}</span>
                  {formState.faqs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFAQ(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => handleFAQChange(index, "question", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
                  placeholder="Question (e.g., Does offer free cancellation for a full refund?)"
                />
                <textarea
                  value={faq.answer}
                  onChange={(e) => handleFAQChange(index, "answer", e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
                  placeholder="Answer"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Gallery Section */}
        <section className="space-y-6 border-b border-slate-200 pb-8">
          <h2 className="text-xl font-semibold text-slate-900">Gallery</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="featureImage" className="text-sm font-semibold text-slate-900">
                Upload Feature Image First, Image size should below 5MB *
              </label>
              <input
                id="featureImage"
                name="featureImage"
                type="file"
                accept="image/*"
                onChange={handleFileChange("featureImage")}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
              />
              {formState.featureImage && (
                <p className="text-xs text-slate-500">Selected: {formState.featureImage.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="galleryImages" className="text-sm font-semibold text-slate-900">
                Upload Gallery Images
              </label>
              <input
                id="galleryImages"
                name="galleryImages"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange("galleryImages")}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
              />
              {formState.galleryImages.length > 0 && (
                <p className="text-xs text-slate-500">
                  Selected: {formState.galleryImages.length} image(s)
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Description Section */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-900">Description</h2>
          <div className="space-y-2">
            <textarea
              id="description"
              name="description"
              rows={8}
              value={formState.description}
              onChange={handleChange("description")}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
              placeholder="Enter detailed description of the tour"
            />
          </div>
        </section>

        <footer className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between sm:gap-6">
          <div className="text-xs text-slate-500">
            <p>
              Review all information before saving. You can edit the package after creation.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-full bg-(--color-brand-600) px-6 py-3 text-sm font-semibold text-white transition hover:bg-(--color-brand-700) disabled:pointer-events-none disabled:opacity-70"
            >
              {isSubmitting ? "Saving…" : "Save package"}
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}
