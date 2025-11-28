import { getToken, getRefreshToken, saveToken, saveRefreshToken, clearToken, clearAccessToken, clearRefreshToken, isTokenExpired } from "@/utils/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost/php-backend/api";

// Token refresh flag to prevent multiple simultaneous refresh calls
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

// Check if refresh is disabled (backend misconfigured)
function isRefreshDisabled(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem("refresh_disabled") === "true";
}

// Refresh access token using refresh token
async function refreshAccessToken(): Promise<string | null> {
  // Don't attempt refresh if it's known to be disabled
  if (isRefreshDisabled()) {
    console.warn("Token refresh is disabled (backend misconfigured). User must login again.");
    return null;
  }
  
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        console.warn("⚠️ No refresh token found, cannot refresh access token");
        console.warn("⚠️ Keeping original access token - it might still be valid");
        // DON'T clear access token - it might still be valid
        // clearToken("No refresh token but keeping access token");
        return null;
      }

      console.log("Attempting to refresh access token...");
      console.log("🔍 Calling backend refresh endpoint:", {
        url: `${API_BASE_URL}/auth/refresh`,
        hasRefreshToken: !!refreshToken,
        refreshTokenLength: refreshToken?.length,
        refreshTokenPreview: refreshToken ? `${refreshToken.substring(0, 30)}...` : "null"
      });
      
      // Try to refresh the token
      let response: Response;
      try {
        response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include cookies for refresh token
          body: JSON.stringify({ refreshToken }),
        });
        
        console.log("🔍 Backend refresh endpoint response:", {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        });
      } catch (networkError) {
        // Network error (endpoint might not exist)
        console.warn("⚠️ Token refresh endpoint not available or network error:", networkError);
        console.warn("⚠️ Keeping original access token - it might still be valid");
        // DON'T clear tokens on network error - access token might still work
        // clearToken("Network error but keeping access token");
        return null;
      }

      if (!response.ok) {
        let errorText = "";
        let errorData: any = null;
        
        // Log full response details for debugging
        console.error("🔍 Backend refresh token API error response:", {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          url: response.url
        });
        
        try {
          errorText = await response.text();
          console.error("🔍 Backend refresh token error response body:", {
            errorText: errorText.substring(0, 500),
            errorTextLength: errorText.length,
            isJSON: false
          });
          
          // Try to parse as JSON
          try {
            errorData = JSON.parse(errorText);
            console.error("🔍 Backend refresh token error response (parsed):", {
              errorData,
              hasMessage: !!errorData?.message,
              message: errorData?.message
            });
          } catch {
            // Not JSON, use as text
            console.warn("🔍 Backend error response is not JSON, using as text");
          }
        } catch (parseError) {
          errorText = "Unknown error";
          console.error("🔍 Failed to read error response:", parseError);
        }
        
        // If endpoint doesn't exist (404) or not implemented (501), don't clear tokens
        // Just mark refresh as unavailable
        if (response.status === 404 || response.status === 501) {
          console.warn("Token refresh endpoint not implemented in backend");
          if (typeof window !== "undefined") {
            window.localStorage.setItem("refresh_disabled", "true");
          }
          // DON'T clear tokens - access token might still be valid
          return null;
        }
        
        // Check if refresh endpoint is misconfigured (401 with specific error message)
        const errorMessage = errorData?.message || errorText || "";
        if (response.status === 401 && (
          errorMessage.includes("JWT refresh secret not configured") ||
          errorMessage.includes("refresh secret") ||
          errorMessage.includes("refresh token") && errorMessage.includes("not configured")
        )) {
          console.error("Token refresh endpoint is misconfigured in backend:", errorMessage);
          console.warn("Refresh token functionality is disabled. User will need to login again when token expires.");
          // Don't clear tokens here - let the user continue with current token until it expires
          // But mark that refresh is not available
          if (typeof window !== "undefined") {
            window.localStorage.setItem("refresh_disabled", "true");
          }
          return null;
        }
        
        // Check if refresh token is invalid (corrupted, expired, or wrong signature)
        // IMPORTANT: Only clear refresh token if the error message explicitly says the refresh token is invalid
        // Don't clear on generic 401 errors that might be about something else
        const isRefreshTokenError = response.status === 401 && (
          errorMessage.includes("Invalid refresh token") ||
          errorMessage.includes("refresh token signature") ||
          errorMessage.includes("refresh token expired") ||
          errorMessage.includes("refresh token invalid") ||
          (errorMessage.includes("refresh") && errorMessage.includes("token") && (
            errorMessage.includes("invalid") ||
            errorMessage.includes("expired") ||
            errorMessage.includes("signature")
          ))
        );
        
        if (isRefreshTokenError) {
          console.warn("⚠️ Refresh token error detected:", errorMessage);
          console.warn("⚠️ Error details:", {
            status: response.status,
            errorMessage,
            errorText: errorText.substring(0, 200)
          });
          
          // CRITICAL: Be very conservative about clearing refresh tokens
          // Only clear if the error message is EXACTLY about refresh token being invalid
          // Many backend errors might mention "refresh token" but not mean it's invalid
          const isDefinitelyInvalid = 
            // Exact matches for invalid refresh token
            (errorMessage.toLowerCase().includes("invalid refresh token") && 
             !errorMessage.toLowerCase().includes("not configured")) ||
            // Signature errors are definitely invalid
            (errorMessage.toLowerCase().includes("refresh token") && 
             errorMessage.toLowerCase().includes("signature") &&
             errorMessage.toLowerCase().includes("invalid")) ||
            // Explicitly expired refresh token
            (errorMessage.toLowerCase().includes("refresh token") && 
             errorMessage.toLowerCase().includes("expired") &&
             !errorMessage.toLowerCase().includes("access token"));
          
          console.warn("🔍 Refresh token error analysis:", {
            errorMessage,
            errorMessageLower: errorMessage.toLowerCase(),
            isDefinitelyInvalid,
            willClear: isDefinitelyInvalid
          });
          
          if (isDefinitelyInvalid) {
            console.warn("⚠️ Refresh token is DEFINITELY invalid based on backend error, clearing it");
            console.warn("⚠️ Backend explicitly said refresh token is invalid:", errorMessage);
            // Use very specific reason that will pass the validation in clearRefreshToken
            clearRefreshToken(`Invalid refresh token: Backend confirmed - ${errorMessage.substring(0, 100)}`);
            console.warn("⚠️ Invalid refresh token cleared, but keeping access token - it might still be valid");
          } else {
            console.warn("⚠️ Refresh token error detected but NOT clearing it - error might be:");
            console.warn("   - Temporary backend issue");
            console.warn("   - Backend misconfiguration");
            console.warn("   - Network issue");
            console.warn("   - Error about something else (not refresh token validity)");
            console.warn("⚠️ Keeping refresh token - will try again on next refresh attempt");
          }
          
          console.warn("⚠️ The access token will be tested when making API calls");
          // DON'T clear access token here - it might still be valid
          // Only clear tokens if the access token itself fails when used
          // This prevents premature token clearing during package creation
          return null;
        }
        
        // Other refresh failures - might be temporary, don't clear tokens yet
        // The access token might still be valid - let the actual API call determine this
        console.error(`⚠️ Token refresh failed with status ${response.status}:`, errorText);
        console.warn("⚠️ Keeping original access token - refresh token might be invalid but access token could still work");
        console.warn("⚠️ The actual API call will determine if the access token is valid");
        // DON'T clear tokens here - return null to indicate refresh failed
        return null;
      }

      // Log response headers to check for any cookie clearing
      const responseHeaders = Object.fromEntries(response.headers.entries());
      console.log("✅ Token refresh successful - response headers:", {
        setCookie: responseHeaders['set-cookie'] || responseHeaders['Set-Cookie'],
        contentType: responseHeaders['content-type'],
        allHeaders: responseHeaders
      });
      
      const data = await response.json();
      console.log("✅ Token refresh response data:", { 
        hasTokens: !!data.tokens, 
        hasAccessToken: !!data.tokens?.accessToken,
        hasRefreshToken: !!data.tokens?.refreshToken,
        hasAccessTokenAlt: !!data.accessToken,
        hasRefreshTokenAlt: !!data.refreshToken,
        dataKeys: Object.keys(data),
        fullData: data
      });
      
      // Handle different response formats
      if (data.tokens?.accessToken) {
        saveToken(data.tokens.accessToken);
        // Only save new refresh token if provided - keep existing if not provided
        if (data.tokens.refreshToken) {
          console.log("💾 Saving new refresh token from refresh response");
          const saved = saveRefreshToken(data.tokens.refreshToken);
          if (!saved) {
            console.error("❌ Failed to save new refresh token, but keeping existing one");
          }
        } else {
          console.warn("⚠️ Refresh response did not include new refresh token - keeping existing one");
        }
        console.log("Token refreshed successfully");
        return data.tokens.accessToken;
      } else if (data.accessToken) {
        // Alternative format: { accessToken: "...", refreshToken: "..." }
        saveToken(data.accessToken);
        // Only save new refresh token if provided - keep existing if not provided
        if (data.refreshToken) {
          console.log("💾 Saving new refresh token from refresh response (alternative format)");
          const saved = saveRefreshToken(data.refreshToken);
          if (!saved) {
            console.error("❌ Failed to save new refresh token, but keeping existing one");
          }
        } else {
          console.warn("⚠️ Refresh response did not include new refresh token - keeping existing one");
        }
        console.log("Token refreshed successfully (alternative format)");
        return data.accessToken;
      } else if (data.token) {
        // Legacy format: { token: "..." }
        saveToken(data.token);
        console.log("Token refreshed successfully (legacy format)");
        // Don't clear refresh token if not provided in legacy format - keep existing
        return data.token;
      }

      console.error("⚠️ Token refresh response missing access token:", data);
      console.warn("⚠️ Keeping original access token - refresh response was invalid");
      // DON'T clear tokens - access token might still be valid
      // clearToken("Refresh response invalid but keeping access token");
      return null;
    } catch (error) {
      console.error("⚠️ Token refresh failed with error:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      console.warn("⚠️ Keeping original access token - error might be temporary");
      // DON'T clear tokens on error - access token might still be valid
      // clearToken("Refresh error but keeping access token");
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Generate device ID for guest users (wishlist)
function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let deviceId = localStorage.getItem("device_id");
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("device_id", deviceId);
  }
  return deviceId;
}

function normalizeHeaders(init?: HeadersInit): Record<string, string> {
  if (!init) {
    return {};
  }
  if (init instanceof Headers) {
    return Object.fromEntries(init.entries());
  }
  if (Array.isArray(init)) {
    return init.reduce<Record<string, string>>((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  }
  return { ...(init as Record<string, string>) };
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  requireAuth = false
): Promise<T> {
  let token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...normalizeHeaders(options.headers as HeadersInit),
  };

  // Add authentication token if available or required
  // Skip token refresh for auth endpoints (login, register, etc.) - they should handle their own auth
  const isAuthEndpoint = endpoint.includes("/auth/");
  
  if (requireAuth || token) {
    // Check if token is expired and refresh if needed
    // Only attempt refresh if we have a refresh token available
    // Skip refresh for auth endpoints to avoid invalid refresh token errors during login
    // IMPORTANT: Don't clear tokens just because refresh fails - let the actual API call determine if token is invalid
    if (token && isTokenExpired(token) && !isAuthEndpoint) {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        console.log("Access token appears expired, attempting refresh...");
        const refreshedToken = await refreshAccessToken();
        if (refreshedToken) {
          token = refreshedToken;
          console.log("✅ Token refreshed successfully");
        } else {
          // Refresh failed, but don't clear token yet
          // The access token might still be valid (refresh token could be invalid but access token still works)
          // Let the actual API call determine if the token is invalid
          console.warn("⚠️ Token refresh failed, but keeping access token. Will test with actual API call.");
          // Keep the original token - don't clear it
        }
      } else if (requireAuth) {
        // Token expired and no refresh token
        // Don't clear token yet - let the API call determine if it's actually invalid
        console.warn("⚠️ Token appears expired and no refresh token, but keeping token. Will test with actual API call.");
        // Keep the token - don't clear it
      } else {
        // Token expired but not required - just clear access token, keep refresh token
        clearAccessToken("Token expired but not required");
        token = null;
      }
    } else if (token && isTokenExpired(token) && isAuthEndpoint) {
      // For auth endpoints, just clear expired tokens without trying to refresh
      // This prevents invalid refresh token errors during login/register
      // Only clear access token, keep refresh token in case it's still valid
      console.log("Token expired on auth endpoint, clearing access token only");
      clearAccessToken("Token expired on auth endpoint");
      token = null;
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else if (requireAuth) {
      throw new Error("Authentication required. Please login.");
    }
  }

  // Add device ID for guest operations (wishlist)
  if (endpoint.includes("/wishlist")) {
    headers["X-Device-ID"] = getDeviceId();
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include", // Include cookies for refresh token
  });
  } catch (error) {
    // Handle network errors (Failed to fetch)
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      console.error("❌ Network error: Failed to fetch", {
        url: `${API_BASE_URL}${endpoint}`,
        method: options.method || "GET",
        apiBaseUrl: API_BASE_URL,
        endpoint: endpoint,
        possibleCauses: [
          "Backend server is not running",
          "CORS issue - frontend origin not allowed",
          "Network connectivity problem",
          "Wrong API URL configuration"
        ]
      });
      throw new Error(
        `Cannot connect to backend at ${API_BASE_URL}. ` +
        `Please ensure: 1) WAMP/Apache is running, 2) Backend is accessible at http://localhost/php-backend/health, ` +
        `3) Frontend origin is allowed in CORS (check CLIENT_URL in backend .env), ` +
        `4) No firewall is blocking the connection.`
      );
    }
    throw error;
  }

  // If token expired error, try to refresh and retry once
  // Only attempt refresh if:
  // 1. We have a token
  // 2. It's not an auth endpoint (login, register, etc.)
  // 3. We have a refresh token available
  if (response.status === 401 && token && !endpoint.includes("/auth/")) {
    const refreshToken = getRefreshToken();
    
    // Only try refresh if we have a refresh token
    if (refreshToken) {
      console.log("Got 401, attempting token refresh...");
      const newToken = await refreshAccessToken();
      
      if (newToken) {
        // Retry the request with new token
        headers.Authorization = `Bearer ${newToken}`;
        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers,
          credentials: "include",
        });

        if (!retryResponse.ok) {
          let errorMessage = "Unexpected API error";
          try {
            const errorData = await retryResponse.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch {
            const errorText = await retryResponse.text();
            errorMessage = errorText || errorMessage;
          }
          
          if (retryResponse.status === 401) {
            // Check if it's actually an auth error, not validation/permission
            const errorMsgLower = errorMessage.toLowerCase();
            const isRefreshTokenError = 
              errorMsgLower.includes("refresh token") ||
              errorMsgLower.includes("refresh_token");
            const isAuthError = !isRefreshTokenError && (
              (errorMsgLower.includes("token") && !errorMsgLower.includes("refresh") && (
                errorMsgLower.includes("expired") ||
                errorMsgLower.includes("invalid") ||
                errorMsgLower.includes("missing")
              )) ||
              errorMsgLower.includes("session expired") ||
              errorMsgLower.includes("authentication required") ||
              errorMsgLower.includes("not authenticated")
            );
            
            // Only clear tokens if it's actually an auth error
            if (isAuthError) {
              console.warn("⚠️ Retry also failed with 401 auth error - clearing tokens");
              clearToken();
              throw new Error("Session expired. Please login again.");
            } else {
              // 401 but not an auth error - might be validation/permission
              console.warn("⚠️ Retry returned 401 but not detected as auth error - might be validation/permission");
              throw new Error(errorMessage);
            }
          }
          
          throw new Error(errorMessage);
        }

        return retryResponse.json() as Promise<T>;
      } else {
        // Refresh failed - but don't clear tokens yet
        // The access token might still be valid, or the 401 might be due to validation/permissions
        // Let the original 401 error propagate so the caller can determine if it's an auth error
        console.warn("⚠️ Token refresh failed, but keeping tokens. Original 401 might be validation/permission error.");
        // Don't clear tokens or throw auth error - let the original response error be handled below
        // This prevents false redirects when refresh token is invalid but access token is valid
      }
    } else {
      // No refresh token available - but access token might still be valid
      // Don't clear tokens - let the original 401 error be handled below
      console.warn("⚠️ No refresh token available, but keeping access token. Original 401 might be validation/permission error.");
    }
  }

  if (!response.ok) {
    let errorMessage = "Unexpected API error";
    const contentType = response.headers.get("content-type") || "";
    const isHTML = contentType.includes("text/html") || contentType.includes("text/plain");
    
    try {
      // Check if response is HTML (PHP error page)
      if (isHTML) {
        const errorText = await response.text();
        // Check if it's actually HTML
        if (errorText.trim().startsWith("<") || errorText.includes("<br") || errorText.includes("Fatal error") || errorText.includes("Parse error")) {
          console.error("Backend returned HTML error page:", errorText.substring(0, 500));
          throw new Error(
            `Backend error: The server returned an HTML error page instead of JSON. ` +
            `This usually indicates a PHP error. Check your PHP error logs. ` +
            `Status: ${response.status} ${response.statusText}. ` +
            `Endpoint: ${endpoint}`
          );
        }
      }
      
      // Try to parse as JSON
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (parseError) {
      // If JSON parsing failed, try to get text
      try {
      const errorText = await response.text();
        
        // Check if it's HTML (PHP error)
        if (errorText.trim().startsWith("<") || errorText.includes("<br") || errorText.includes("Fatal error") || errorText.includes("Parse error")) {
          console.error("Backend returned HTML error page:", errorText.substring(0, 500));
          throw new Error(
            `Backend error: PHP returned an error page instead of JSON. ` +
            `This usually indicates a PHP syntax error, missing file, or fatal error. ` +
            `Check your PHP error logs. Status: ${response.status}. ` +
            `Endpoint: ${endpoint}`
          );
        }
        
      errorMessage = errorText || errorMessage;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
    }
    
    // Handle 404 errors - route not found
    if (response.status === 404) {
      throw new Error(`Route not found: ${endpoint}. Please check if the backend endpoint exists.`);
    }
    
    // Handle 401 errors - only clear tokens if it's not an auth endpoint
    // IMPORTANT: 401 can mean auth error OR validation/permission error
    // Only clear tokens if error message indicates it's actually an auth issue
    // IMPORTANT: Don't treat refresh token errors as access token errors
    if (response.status === 401 && !endpoint.includes("/auth/")) {
      const errorMsgLower = errorMessage.toLowerCase();
      
      // Check if this is a refresh token error (should not clear access token)
      const isRefreshTokenError = 
        errorMsgLower.includes("refresh token") ||
        errorMsgLower.includes("refresh_token");
      
      // Only check for auth errors if it's NOT a refresh token error
        // Be very specific - don't match validation errors
      const isAuthError = !isRefreshTokenError && (
          // Explicit auth-related phrases
        errorMsgLower.includes("authentication required") ||
        errorMsgLower.includes("not authenticated") ||
          errorMsgLower.includes("session expired") ||
          // Token-specific errors (but not validation errors like "Invalid package title")
          (errorMsgLower.includes("token") && (
            errorMsgLower.includes("expired") ||
            errorMsgLower.includes("invalid token") ||
            errorMsgLower.includes("token expired") ||
            errorMsgLower.includes("token invalid") ||
            errorMsgLower.includes("token signature") ||
            errorMsgLower.includes("token missing") ||
            errorMsgLower.includes("token not") ||
            errorMsgLower.includes("invalid or expired token")
          )) ||
          // Auth header errors
          (errorMsgLower.includes("authorization") && (
            errorMsgLower.includes("required") ||
            errorMsgLower.includes("missing") ||
            errorMsgLower.includes("invalid")
          )) ||
          // Unauthorized but not permission errors
          (errorMsgLower.includes("unauthorized") && !errorMsgLower.includes("permission") && !errorMsgLower.includes("insufficient"))
      );
      
      console.log("🔍 401 Error Analysis:", {
        endpoint,
        errorMessage,
        isRefreshTokenError,
        isAuthError,
        hasToken: !!token
      });
      
      // Only clear tokens if it's actually an auth error (not refresh token error), not validation/permission
      if (isAuthError && token) {
        console.warn("⚠️ Clearing access token due to auth error (keeping refresh token)");
        // Only clear access token - refresh token might still be valid
        // Only clear both tokens if we've confirmed both are invalid (e.g., retry after refresh also fails)
        clearAccessToken("Access token auth error - keeping refresh token");
        throw new Error("Session expired. Please login again.");
      } else if (isAuthError && !token) {
        throw new Error("Authentication required. Please login.");
      } else if (isRefreshTokenError) {
        // Refresh token error - don't clear access token, just throw the original error
        console.warn("⚠️ Refresh token error detected, but keeping access token");
        throw new Error(errorMessage);
      } else {
        // 401 but not an auth error - might be validation or permission
        // Don't clear tokens, just throw the original error
        console.warn("⚠️ 401 error but not detected as auth error - might be validation/permission");
        throw new Error(errorMessage);
      }
    }
    
    throw new Error(errorMessage);
  }

  // Check if response is HTML before trying to parse as JSON
  const contentType = response.headers.get("content-type") || "";
  const isHTML = contentType.includes("text/html") || contentType.includes("text/plain");
  
  if (isHTML) {
    const textResponse = await response.text();
    // Check if it's actually HTML (PHP error page)
    if (textResponse.trim().startsWith("<") || textResponse.includes("<br") || textResponse.includes("Fatal error") || textResponse.includes("Parse error")) {
      console.error("Backend returned HTML instead of JSON:", textResponse.substring(0, 500));
      throw new Error(
        `Backend error: PHP returned an error page instead of JSON. ` +
        `This usually indicates a PHP syntax error, missing file, or fatal error. ` +
        `Check your PHP error logs. Endpoint: ${endpoint}`
      );
    }
    // If it's not HTML, try to parse as JSON
    try {
      return JSON.parse(textResponse) as T;
    } catch {
      throw new Error(`Invalid response format from ${endpoint}`);
    }
  }

  return response.json() as Promise<T>;
}

// Types
export interface QuoteResponse {
  quoteId: string;
  totalAmount: number;
  currency: string;
  breakdown: Array<{ label: string; amount: number }>;
  holdSeconds: number;
  cancellationPolicy: string;
  paymentProviders: string[];
  expiresAt: string;
}

export interface BookingResponse {
  _id: string;
  package: any;
  quoteId?: string;
  adults: number;
  children: number;
  travelers: number;
  date: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  [key: string]: any;
}

export interface WishlistItem {
  id: string;
  package: any;
  addedAt: string;
}

export interface Category {
  name: string;
  slug: string;
  packageCount: number;
  heroCopy?: {
    title: string;
    image?: string;
    destination?: string;
  };
}

export interface PackageAvailability {
  packageId: string;
  date: string;
  availableSlots: number;
  totalSlots: number;
  bookedSlots: number;
  isAvailable: boolean;
  timeSlots: Array<{ time: string; available: boolean }>;
}

export const api = {
  // Packages
  getPackages: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    destination?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    featured?: boolean;
    archived?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Convert boolean to string explicitly
          const stringValue = typeof value === 'boolean' ? String(value) : String(value);
          searchParams.append(key, stringValue);
        }
      });
    }
    const queryString = searchParams.toString();
    const fullUrl = `/packages${queryString ? `?${queryString}` : ""}`;
    console.log("getPackages - Full URL:", fullUrl);
    console.log("getPackages - Params:", params);
    return request<any>(fullUrl);
  },

  getPackage: (id: string) => request(`/packages/${id}`),

  createPackage: async (payload: FormData | Record<string, any>) => {
    // If payload is FormData, send as multipart/form-data
    if (payload instanceof FormData) {
      // Retrieve token right before making the request (not at function start)
      // This ensures we have the latest token value
      const retrieveToken = (): string | null => {
        if (typeof window === "undefined") return null;
        return window.localStorage.getItem("citymuscattours_token");
      };
      
      let token = retrieveToken();
      
      // Also try using getToken() for comparison
      const tokenFromFunction = getToken();
      
      // Debug: Log token retrieval
      console.log("createPackage: Token retrieval", {
        hasToken: !!token,
        tokenLength: token?.length,
        tokenPreview: token ? `${token.substring(0, 20)}...` : "null",
        tokenFromFunction: !!tokenFromFunction,
        matches: token === tokenFromFunction,
        allKeys: typeof window !== "undefined" ? Object.keys(window.localStorage) : []
      });
      
      // Check if we have a token at all
      if (!token) {
        console.error("createPackage: No token found in localStorage");
        if (typeof window !== "undefined") {
          console.error("Available localStorage keys:", Object.keys(window.localStorage));
          console.error("All localStorage items:", Object.fromEntries(
            Object.keys(window.localStorage).map(key => [key, window.localStorage.getItem(key)?.substring(0, 50) || "null"])
          ));
        }
        throw new Error("Not authenticated - please login first");
      }
      
      // Check if token is expired and refresh if needed
      // IMPORTANT: Only check expiration, don't clear token if refresh fails
      // Let the actual API call determine if token is invalid
      if (isTokenExpired(token)) {
        console.log("⚠️ Access token appears expired, attempting refresh...");
        console.log("Token details:", {
          tokenLength: token.length,
          tokenPreview: token.substring(0, 30) + "..."
        });
        
        // Check if refresh is disabled
        if (isRefreshDisabled()) {
          console.warn("⚠️ Token refresh is disabled (backend misconfigured). Will try with current token.");
          // DON'T clear token - let the API call fail if token is actually invalid
          // clearToken("Refresh disabled but token exists - keeping token for API attempt");
        } else {
          const refreshToken = getRefreshToken();
          if (!refreshToken) {
            console.warn("⚠️ No refresh token available. Will try with current token.");
            // DON'T clear token - let the API call determine if it's valid
            // clearToken("No refresh token but keeping current token for API attempt");
          } else {
            console.log("Attempting to refresh access token...");
            const refreshedToken = await refreshAccessToken();
            if (refreshedToken) {
              token = refreshedToken;
              console.log("✅ Token refreshed successfully, new token length:", token.length);
            } else {
              console.warn("⚠️ Token refresh failed, but keeping original token. Will let API call determine validity.");
              // DON'T clear token - refresh might have failed but token could still be valid
              // The actual API response will tell us if token is invalid
            }
          }
        }
      } else {
        console.log("✅ Token is not expired, using as-is");
      }
      
      const headers: HeadersInit = {};
      // Don't set Content-Type for FormData - browser will set it with boundary
      if (token) {
        // Verify token format before setting header
        if (token.trim().length === 0) {
          console.error("❌ Token is empty string!");
          throw new Error("Invalid token format. Please login again.");
        }
        
        headers.Authorization = `Bearer ${token.trim()}`;
        console.log("createPackage: Authorization header set", {
          headerValue: `Bearer ${token.substring(0, 30)}...`,
          fullTokenLength: token.length,
          headerExists: !!headers.Authorization,
          headerStartsWithBearer: headers.Authorization?.startsWith("Bearer "),
          tokenInStorage: !!window.localStorage.getItem("citymuscattours_token")
        });
        
        // Verify header was set correctly
        if (!headers.Authorization || !headers.Authorization.startsWith("Bearer ")) {
          console.error("❌ Authorization header was not set correctly!");
          throw new Error("Failed to set authorization header. Please try again.");
        }
      } else {
        console.error("createPackage: No token available to set in Authorization header");
      }
      
      // Final token check right before fetch - ensure we have the latest value
      if (!token || !headers.Authorization) {
        const finalTokenCheck = retrieveToken();
        if (finalTokenCheck) {
          token = finalTokenCheck;
          headers.Authorization = `Bearer ${token}`;
          console.log("createPackage: Token retrieved in final check", {
            tokenLength: token.length,
            headerSet: !!headers.Authorization
          });
        } else {
          console.error("createPackage: Final token check also failed");
          console.error("Token status in localStorage:", {
            tokenExists: !!window.localStorage.getItem("citymuscattours_token"),
            allKeys: Object.keys(window.localStorage)
          });
          throw new Error("Not authenticated - please login first");
        }
      }
      
      // Verify token still exists in localStorage right before making the request
      const tokenBeforeRequest = window.localStorage.getItem("citymuscattours_token");
      if (!tokenBeforeRequest) {
        console.error("❌ CRITICAL: Token disappeared from localStorage right before API call!");
        console.error("This should not happen - something is clearing the token");
        throw new Error("Token was lost. Please login again.");
      }
      if (tokenBeforeRequest !== token) {
        console.warn("⚠️ Token in localStorage differs from token we're about to send");
        console.warn("Using token from localStorage instead");
        token = tokenBeforeRequest;
        headers.Authorization = `Bearer ${token}`;
      }
      
      // One more check - verify token still exists right before fetch
      const tokenExistsCheck = typeof window !== "undefined" ? window.localStorage.getItem("citymuscattours_token") : null;
      if (!tokenExistsCheck) {
        console.error("❌ CRITICAL: Token was cleared between checks and API call!");
        throw new Error("Token was unexpectedly cleared. Please login again.");
      }
      
      // Decode JWT to check expiration and details
      let tokenPayload: any = null;
      let tokenExpired = false;
      try {
        const parts = token.split(".");
        if (parts.length === 3) {
          tokenPayload = JSON.parse(atob(parts[1]));
          const exp = tokenPayload.exp * 1000; // Convert to milliseconds
          const now = Date.now();
          tokenExpired = now >= exp;
          console.log("🔍 Token decoded:", {
            exp: new Date(exp).toISOString(),
            now: new Date(now).toISOString(),
            expired: tokenExpired,
            expiresIn: tokenExpired ? "EXPIRED" : `${Math.round((exp - now) / 1000 / 60)} minutes`,
            payload: {
              iat: tokenPayload.iat ? new Date(tokenPayload.iat * 1000).toISOString() : null,
              exp: new Date(exp).toISOString(),
              sub: tokenPayload.sub,
              email: tokenPayload.email,
              id: tokenPayload.id
            }
          });
        }
      } catch (e) {
        console.warn("⚠️ Could not decode token:", e);
      }
      
      console.log("createPackage: Making request", {
        url: `${API_BASE_URL}/packages`,
        method: "POST",
        hasAuthHeader: !!headers.Authorization,
        authHeaderValue: headers.Authorization,
        authHeaderStartsWithBearer: headers.Authorization?.startsWith("Bearer "),
        authHeaderLength: headers.Authorization?.length,
        tokenFromStorage: tokenExistsCheck,
        tokenMatches: tokenExistsCheck === token,
        tokenExpired: tokenExpired,
        payloadType: payload instanceof FormData ? "FormData" : "JSON",
        payloadKeys: payload instanceof FormData ? Array.from(payload.keys()) : Object.keys(payload),
        allHeaders: Object.keys(headers)
      });
      
      return fetch(`${API_BASE_URL}/packages`, {
        method: "POST",
        headers,
        body: payload,
        credentials: "include",
      }).then(async (response) => {
        // Check if token still exists after response
        const tokenAfterResponse = typeof window !== "undefined" ? window.localStorage.getItem("citymuscattours_token") : null;
        if (!tokenAfterResponse) {
          console.error("❌ CRITICAL: Token was cleared during/after API call!");
          console.error("This indicates something is clearing the token during the request");
          console.error("Stack trace:", new Error().stack);
        }
        
        // Log response headers to see if backend sent any auth-related headers
        const responseHeaders = Object.fromEntries(response.headers.entries());
        console.log("createPackage: Response received", {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
          ok: response.ok,
          tokenStillExists: !!tokenAfterResponse,
          wwwAuthenticate: responseHeaders["www-authenticate"] || responseHeaders["WWW-Authenticate"],
          contentType: responseHeaders["content-type"]
        });
        // Check if response is HTML (PHP error page) instead of JSON
        const contentType = response.headers.get("content-type") || "";
        const isHTML = contentType.includes("text/html") || contentType.includes("text/plain");
        
        if (!response.ok) {
          let errorMessage = "Failed to create package";
          let validationErrors: Record<string, string[]> | null = null;
          
          // If response is HTML, it's likely a PHP error
          if (isHTML) {
            const htmlText = await response.text();
            console.error("Backend returned HTML instead of JSON (PHP error):", htmlText.substring(0, 500));
            throw new Error(
              "Backend error: PHP returned an error page instead of JSON. " +
              "Check your PHP error logs. Common causes: syntax errors, missing files, or database connection issues."
            );
          }
          
          try {
            const errorData = await response.json();
            
            // Log the full error response for debugging
            console.error("Backend validation error response:", errorData);
            
            // Handle validation errors with field details
            if (errorData.errors && Array.isArray(errorData.errors)) {
              // Format: [{ field: "title", message: "Title is required" }]
              validationErrors = {};
              errorData.errors.forEach((err: { field?: string; message?: string; path?: string }) => {
                const field = err.field || err.path || "unknown";
                if (!validationErrors![field]) {
                  validationErrors![field] = [];
                }
                validationErrors![field].push(err.message || "Validation error");
              });
              errorMessage = "Validation failed. Please check the form fields.";
            } else if (errorData.error && typeof errorData.error === "object") {
              // Format: { error: { title: ["Title is required"], price: ["Price must be a number"] } }
              validationErrors = errorData.error;
              errorMessage = "Validation failed. Please check the form fields.";
            } else if (errorData.message) {
              // Some backends return { message: "Validation failed", details: {...} }
              errorMessage = errorData.message;
              if (errorData.details && typeof errorData.details === "object") {
                validationErrors = errorData.details;
              }
            } else {
              errorMessage = errorData.message || errorData.error || errorMessage;
            }
          } catch (parseError) {
            try {
              const errorText = await response.text();
              
              // Check if it's HTML (PHP error page)
              if (errorText.trim().startsWith("<") || errorText.includes("<br />") || errorText.includes("Fatal error") || errorText.includes("Parse error")) {
                console.error("Backend returned HTML error page:", errorText.substring(0, 500));
                errorMessage = 
                  "PHP backend error: The server returned an error page instead of JSON. " +
                  "This usually indicates a PHP syntax error, missing file, or fatal error. " +
                  "Check your PHP error logs for details.";
              } else {
                errorMessage = errorText || errorMessage;
              }
            } catch {
              errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            }
          }
          
          // If 401, check if it's actually an auth error or something else
          // IMPORTANT: Only clear token if refresh fails AND retry also fails with 401
          if (response.status === 401 && token) {
            // Check the error message we already extracted to see if it's actually an auth error
            // IMPORTANT: Be very specific - don't match validation errors like "Invalid package title"
            const errorMsgLower = (errorMessage || "").toLowerCase();
            const isAuthError = 
              // Explicit auth-related phrases
              errorMsgLower.includes("authentication required") ||
                               errorMsgLower.includes("not authenticated") ||
              errorMsgLower.includes("session expired") ||
              // Token-specific errors (but not validation errors)
              (errorMsgLower.includes("token") && (
                errorMsgLower.includes("expired") ||
                errorMsgLower.includes("invalid token") ||
                errorMsgLower.includes("token expired") ||
                errorMsgLower.includes("token invalid") ||
                errorMsgLower.includes("token signature") ||
                errorMsgLower.includes("token missing") ||
                errorMsgLower.includes("token not") ||
                errorMsgLower.includes("invalid or expired token")
              )) ||
              // Auth header errors
              (errorMsgLower.includes("authorization") && (
                errorMsgLower.includes("required") ||
                errorMsgLower.includes("missing") ||
                errorMsgLower.includes("invalid")
              )) ||
              // Unauthorized but not permission errors
              (errorMsgLower.includes("unauthorized") && !errorMsgLower.includes("permission") && !errorMsgLower.includes("insufficient"));
            
            console.log("⚠️ Got 401 when creating package", {
              isAuthError,
              errorMessage: errorMessage,
              errorMessageLower: errorMsgLower,
              attemptingRefresh: isAuthError
            });
            console.log("Current token before refresh attempt:", {
              tokenExists: !!token,
              tokenLength: token.length,
              tokenPreview: token.substring(0, 30) + "..."
            });
            
            // Only attempt refresh if it looks like an auth error
            // Otherwise, the 401 might be due to validation or permissions
            if (isAuthError) {
              const newToken = await refreshAccessToken();
              
              if (newToken) {
                console.log("✅ Got new token from refresh, retrying request...");
                // Retry the request with new token
                headers.Authorization = `Bearer ${newToken}`;
                const retryResponse = await fetch(`${API_BASE_URL}/packages`, {
                  method: "POST",
                  headers,
                  body: payload,
                  credentials: "include",
                });

                if (!retryResponse.ok) {
                  if (retryResponse.status === 401) {
                    // Check if it's actually an auth error, not validation/permission
                    let retryErrorMessage = "Unexpected API error";
                    try {
                      const retryErrorData = await retryResponse.json();
                      retryErrorMessage = retryErrorData.message || retryErrorData.error || retryErrorMessage;
                    } catch {
                      try {
                        const retryErrorText = await retryResponse.text();
                        retryErrorMessage = retryErrorText || retryErrorMessage;
                      } catch {
                        retryErrorMessage = `HTTP ${retryResponse.status}: ${retryResponse.statusText}`;
                      }
                    }
                    
                    const retryErrorMsgLower = retryErrorMessage.toLowerCase();
                    const isRefreshTokenError = 
                      retryErrorMsgLower.includes("refresh token") ||
                      retryErrorMsgLower.includes("refresh_token");
                    const isAuthError = !isRefreshTokenError && (
                      (retryErrorMsgLower.includes("token") && !retryErrorMsgLower.includes("refresh") && (
                        retryErrorMsgLower.includes("expired") ||
                        retryErrorMsgLower.includes("invalid") ||
                        retryErrorMsgLower.includes("missing")
                      )) ||
                      retryErrorMsgLower.includes("session expired") ||
                      retryErrorMsgLower.includes("authentication required") ||
                      retryErrorMsgLower.includes("not authenticated")
                    );
                    
                    // Only clear tokens if it's actually an auth error AND backend explicitly confirms
                    if (isAuthError) {
                      console.error("❌ Retry also failed with 401 auth error - checking if tokens are truly invalid");
                      
                      // Check if error explicitly mentions refresh token - if not, only clear access token
                      const isRefreshTokenError = 
                        retryErrorMsgLower.includes("refresh token") ||
                        retryErrorMsgLower.includes("refresh_token");
                      
                      // Only clear refresh token if backend explicitly says it's invalid
                      // Don't clear on generic "token expired" - might be access token only
                      if (isRefreshTokenError && (
                        retryErrorMsgLower.includes("invalid refresh token") ||
                        retryErrorMsgLower.includes("refresh token expired") ||
                        retryErrorMsgLower.includes("refresh token signature")
                      )) {
                        // Refresh token is explicitly invalid - clear both
                        console.error("❌ Backend explicitly says refresh token is invalid - clearing both tokens");
                        clearToken("Both tokens invalid: refresh token invalid - backend confirmed");
                        throw new Error("Session expired. Please login again.");
                      } else if (retryErrorMsgLower.includes("token expired") || retryErrorMsgLower.includes("invalid token")) {
                        // Access token is invalid - but DON'T clear refresh token unless backend explicitly says so
                        // Only clear access token - keep refresh token for future use
                        console.error("❌ Access token is invalid but keeping refresh token");
                        clearAccessToken("Access token invalid after refresh retry - keeping refresh token");
                      throw new Error("Session expired. Please login again.");
                      } else {
                        // Generic auth error - don't clear refresh token, only access token
                        console.error("❌ Generic auth error - clearing access token only");
                        clearAccessToken("Access token invalid - keeping refresh token");
                        throw new Error("Session expired. Please login again.");
                      }
                    } else {
                      // 401 but not an auth error - might be validation/permission
                      console.warn("⚠️ Retry returned 401 but not detected as auth error - might be validation/permission");
                      throw new Error(retryErrorMessage);
                    }
                  }
                
                // Check if retry response is HTML
                const retryContentType = retryResponse.headers.get("content-type") || "";
                const retryIsHTML = retryContentType.includes("text/html") || retryContentType.includes("text/plain");
                
                if (retryIsHTML) {
                  const htmlText = await retryResponse.text();
                  console.error("Backend returned HTML on retry:", htmlText.substring(0, 500));
                  throw new Error(
                    "Backend error: PHP returned an error page instead of JSON. " +
                    "Check your PHP error logs."
                  );
                }
                
                // Handle validation errors on retry
                let retryErrorMessage = "Failed to create package";
                let retryValidationErrors: Record<string, string[]> | null = null;
                
                try {
                  const retryErrorData = await retryResponse.json();
                  
                  if (retryErrorData.errors && Array.isArray(retryErrorData.errors)) {
                    retryValidationErrors = {};
                    retryErrorData.errors.forEach((err: { field?: string; message?: string; path?: string }) => {
                      const field = err.field || err.path || "unknown";
                      if (!retryValidationErrors![field]) {
                        retryValidationErrors![field] = [];
                      }
                      retryValidationErrors![field].push(err.message || "Validation error");
                    });
                    retryErrorMessage = "Validation failed. Please check the form fields.";
                  } else if (retryErrorData.error && typeof retryErrorData.error === "object") {
                    retryValidationErrors = retryErrorData.error;
                    retryErrorMessage = "Validation failed. Please check the form fields.";
                  } else {
                    retryErrorMessage = retryErrorData.message || retryErrorData.error || retryErrorMessage;
                  }
                } catch (retryParseError) {
                  try {
                    const retryErrorText = await retryResponse.text();
                    
                    // Check if it's HTML (PHP error page)
                    if (retryErrorText.trim().startsWith("<") || retryErrorText.includes("<br />") || retryErrorText.includes("Fatal error")) {
                      console.error("Backend returned HTML error page on retry:", retryErrorText.substring(0, 500));
                      retryErrorMessage = 
                        "PHP backend error: The server returned an error page instead of JSON. " +
                        "Check your PHP error logs for details.";
                    } else {
                      retryErrorMessage = retryErrorText || retryErrorMessage;
                    }
                  } catch {
                    retryErrorMessage = `HTTP ${retryResponse.status}: ${retryResponse.statusText}`;
                  }
                }
                
                const retryError = new Error(retryErrorMessage) as Error & { validationErrors?: Record<string, string[]> };
                if (retryValidationErrors) {
                  retryError.validationErrors = retryValidationErrors;
                }
                  throw retryError;
                }

                // Try to parse retry response JSON
                try {
                  return await retryResponse.json();
                } catch (jsonError) {
                  const textResponse = await retryResponse.text();
                  if (textResponse.trim().startsWith("<") || textResponse.includes("<br />")) {
                    throw new Error(
                      "PHP backend error: The server returned an error page instead of JSON. " +
                      "Check your PHP error logs."
                    );
                  }
                  throw jsonError;
                }
              } else {
                // Refresh failed, but don't clear token
                // Show the actual backend error instead of generic "Session expired"
                console.warn("⚠️ Token refresh failed, but keeping original token.");
                console.warn("Original 401 error details:", errorMessage);
                
                // Verify token still exists
                const tokenStillExists = typeof window !== "undefined" ? window.localStorage.getItem("citymuscattours_token") : null;
                if (!tokenStillExists) {
                  console.error("❌ Token was cleared by something else during refresh attempt!");
                  console.error("This should not happen - refreshAccessToken should not clear tokens");
                  // Token was cleared - we need to throw an error that will prompt re-login
                  throw new Error("Token was unexpectedly cleared. Please login again.");
                } else {
                  console.log("✅ Token still exists in localStorage after refresh failure");
                  console.log("Token details:", {
                    tokenLength: tokenStillExists.length,
                    tokenPreview: tokenStillExists.substring(0, 30) + "..."
                  });
                }
                
                // Don't check if token is invalid here - refresh failed but access token might still be valid
                // The original 401 error might be validation/permission, not auth
                // Only throw auth errors if we're certain (e.g., retry with refreshed token also fails)
                console.warn("⚠️ Token refresh failed, but keeping access token.");
                console.warn("⚠️ Original 401 error might be validation/permission, not auth.");
                console.warn("⚠️ Error details:", errorMessage);
                
                // Don't throw auth error - throw the original error so caller can determine if it's validation or auth
                // This prevents false redirects when refresh token is invalid but access token is valid
                const finalError = new Error(errorMessage || "Request failed. Please check the form and try again.") as Error & { validationErrors?: Record<string, string[]> };
                if (validationErrors) {
                  finalError.validationErrors = validationErrors;
                }
                throw finalError;
              }
            } else {
              // 401 but doesn't look like auth error - probably validation or permissions
              console.warn("⚠️ Got 401 but error message doesn't indicate auth issue.");
              console.warn("Keeping token - 401 might be due to validation errors or permissions");
              console.warn("Error message:", errorMessage);
              
              // Verify token still exists
              const tokenExistsCheck = typeof window !== "undefined" ? window.localStorage.getItem("citymuscattours_token") : null;
              if (tokenExistsCheck) {
                console.log("✅ Token still exists - not an auth issue");
              }
              
              // Don't clear token - show the actual error
              const finalError = new Error(errorMessage || "Request failed. Please check the form and try again.") as Error & { validationErrors?: Record<string, string[]> };
              if (validationErrors) {
                finalError.validationErrors = validationErrors;
              }
              throw finalError;
            }
          } else if (response.status === 401) {
            // 401 but no token - this shouldn't happen, but handle it
            console.warn("⚠️ Got 401 but no token was available");
            throw new Error(errorMessage || "Authentication required. Please login.");
          }
          
          const error = new Error(errorMessage) as Error & { validationErrors?: Record<string, string[]> };
          if (validationErrors) {
            error.validationErrors = validationErrors;
          }
          throw error;
        }
        
        // Check if successful response is also HTML (PHP error with 200 status)
        if (isHTML) {
          const htmlText = await response.text();
          console.error("Backend returned HTML instead of JSON (PHP error with 200 status):", htmlText.substring(0, 500));
          throw new Error(
            "Backend error: PHP returned an error page instead of JSON. " +
            "Check your PHP error logs. The request may have succeeded but PHP encountered an error."
          );
        }
        
        // Try to parse JSON, but handle HTML responses gracefully
        try {
          return await response.json();
        } catch (jsonError) {
          // If JSON parsing fails, it might be HTML
          const textResponse = await response.text();
          if (textResponse.trim().startsWith("<") || textResponse.includes("<br />") || textResponse.includes("Fatal error")) {
            console.error("Backend returned HTML instead of JSON:", textResponse.substring(0, 500));
            throw new Error(
              "PHP backend error: The server returned an error page instead of JSON. " +
              "This usually indicates a PHP syntax error, missing file, or fatal error. " +
              "Check your PHP error logs for details."
            );
          }
          // If it's not HTML, re-throw the original JSON parse error
          throw jsonError;
        }
      }).catch((error) => {
        // Handle network errors
        if (error instanceof TypeError && error.message === "Failed to fetch") {
          throw new Error(
            `Cannot connect to backend server at ${API_BASE_URL}. Please ensure the PHP backend is running on WAMP (http://localhost/php-backend) or update NEXT_PUBLIC_API_URL in your .env.local file.`
          );
        }
        throw error;
      });
    }
    
    // Otherwise send as JSON
    return request("/packages", {
      method: "POST",
      body: JSON.stringify(payload),
    }, true).catch((error) => {
      // Enhance error with validation details if available
      if (error.message && error.message.includes("Validation")) {
        // Try to parse validation errors from the error message or response
        try {
          const errorObj = JSON.parse(error.message);
          if (errorObj.errors || errorObj.error) {
            const enhancedError = new Error(errorObj.message || "Validation failed") as Error & { validationErrors?: Record<string, string[]> };
            if (errorObj.errors) {
              enhancedError.validationErrors = {};
              errorObj.errors.forEach((err: { field?: string; message?: string; path?: string }) => {
                const field = err.field || err.path || "unknown";
                if (!enhancedError.validationErrors![field]) {
                  enhancedError.validationErrors![field] = [];
                }
                enhancedError.validationErrors![field].push(err.message || "Validation error");
              });
            } else if (errorObj.error) {
              enhancedError.validationErrors = errorObj.error;
            }
            throw enhancedError;
          }
        } catch {
          // If parsing fails, throw original error
        }
      }
      throw error;
    });
  },

  updatePackage: (id: string, payload: FormData | Record<string, any>) => {
    // If payload is FormData, send as multipart/form-data
    if (payload instanceof FormData) {
      const token = getToken();
      const headers: HeadersInit = {};
      // Don't set Content-Type for FormData - browser will set it with boundary
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      return fetch(`${API_BASE_URL}/packages/${id}`, {
        method: "PUT",
        headers,
        body: payload,
      }).then(async (response) => {
        if (!response.ok) {
          let errorMessage = "Failed to update package";
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          }
          throw new Error(errorMessage);
        }
        return response.json();
      });
    }
    
    // Otherwise send as JSON
    return request(`/packages/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }, true);
  },

  deletePackage: (id: string) => request(`/packages/${id}`, { method: "DELETE" }, true),
  archivePackage: (id: string) => request(`/packages/${id}/archive`, { method: "POST" }, true),
  unarchivePackage: (id: string) => request(`/packages/${id}/unarchive`, { method: "POST" }, true),

  getPackageAvailability: (id: string, date?: string) => {
    const query = date ? `?date=${date}` : "";
    return request<PackageAvailability>(`/packages/${id}/availability${query}`);
  },

  // Search
  searchPackages: (params?: {
    q?: string;
    category?: string;
    destination?: string;
    minPrice?: number;
    maxPrice?: number;
    durationDays?: number;
    availabilityDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const queryString = searchParams.toString();
    return request(`/search${queryString ? `?${queryString}` : ""}`);
  },

  // Categories
  getCategories: () => request<{ categories: Category[]; total: number }>("/categories"),

  // Authentication
  login: (credentials: { email: string; password: string }) =>
    request<{ user: any; tokens: { accessToken: string; refreshToken: string } }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(credentials),
      }
    ),

  register: (payload: { name: string; email: string; password: string; phone?: string }) =>
    request<{ user: any; tokens: { accessToken: string; refreshToken: string } }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    ),

  logout: () => request("/auth/logout", { method: "POST" }, true),

  refreshToken: (refreshToken: string) =>
    request<{ user: any; tokens: { accessToken: string; refreshToken: string } }>(
      "/auth/refresh",
      {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      }
    ),

  // Bookings & Quotes
  createQuote: (payload: {
    packageId: string;
    date: string;
    adults: number;
    children?: number;
    variantId?: string;
    pickupChoice?: string;
    pickupLocation?: string;
  }) =>
    request<QuoteResponse>("/bookings/quote", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  createBooking: (payload: {
    packageId?: string;
    quoteId?: string;
    variantId?: string;
    date: string;
    adults: number;
    children?: number;
    travelers?: number;
    totalAmount: number;
    priceBreakdown?: Array<{ label: string; amount: number }>;
    pickupChoice?: string;
    pickupLocation?: string;
    contactEmail?: string;
    contactPhone?: string;
    promoCode?: string;
    paymentIntentId?: string;
    notes?: string;
    currency?: string;
  }) =>
    request<BookingResponse>("/bookings", {
      method: "POST",
      body: JSON.stringify(payload),
    }, true),

  getBookings: (params?: { status?: string; all?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.all) queryParams.append('all', 'true');
    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return request<BookingResponse[]>(`/bookings${query}`, {}, true);
  },

  createDummyBooking: (payload?: {
    packageId?: string;
    date?: string;
    adults?: number;
    children?: number;
    totalAmount?: number;
    contactEmail?: string;
    contactPhone?: string;
    status?: string;
    currency?: string;
    pickupLocation?: string;
    notes?: string;
  }) =>
    request<BookingResponse>("/bookings/dummy", {
      method: "POST",
      body: JSON.stringify(payload || {}),
    }, true),

  createDummyPayment: (payload: {
    bookingId: string | number;
    status?: string;
  }) =>
    request<{
      data: BookingResponse;
      payment: {
        transaction_id: string;
        payment_intent_id: string;
        payment_method: string;
        amount: number;
        currency: string;
        status: string;
      };
      message: string;
    }>("/bookings/dummy-payment", {
      method: "POST",
      body: JSON.stringify(payload),
    }, true),

  getBooking: (id: string) => request<BookingResponse>(`/bookings/${id}`, {}, true),

  // Emails
  sendBookingConfirmationEmail: (payload: {
    bookingId: string | number;
    recipientEmail: string;
    recipientName?: string;
    bookingDetails?: {
      packageName?: string;
      date?: string;
      adults?: number;
      children?: number;
      totalAmount?: number;
      currency?: string;
      bookingReference?: string;
    };
  }) =>
    request<{ success: boolean; message: string }>(
      "/bookings/send-confirmation-email",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      true,
    ),

  checkBookingAvailability: (payload: {
    packageId: string;
    date: string;
    adults: number;
    children?: number;
  }) =>
    request<{
      data: {
        available: boolean;
        message: string;
        package: {
          id: string;
          name: string;
          price: number;
          offerPrice: number | null;
        };
        date: string;
        travelers: {
          adults: number;
          children: number;
          total: number;
        };
        capacity: {
          total: number | null;
          booked: number;
          available: number;
          unlimited: boolean;
        };
        pricing: {
          basePrice: number;
          totalAmount: number;
          currency: string;
        };
      };
    }>("/bookings/check", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getAvailableOptions: (payload: {
    packageId: string;
    date?: string;
    adults?: number;
    children?: number;
  }) =>
    request<{
      data: {
        package: {
          id: string;
          name: string;
          price: number;
          offerPrice: number | null;
        };
        options: Array<{
          id: string;
          variantId: string;
          label: string;
          subtitle: string;
          language: string;
          startTime: string;
          meetingPoint: string;
          perks: string[];
          price: number;
          priceLabel: string;
          rating: number;
          reviews: number;
          cancellation: string;
          pickup: boolean;
          totalAmount?: number;
          totalAmountLabel?: string;
        }>;
        availability?: {
          available: boolean;
          message: string;
          capacity: {
            total: number | null;
            booked: number;
            available: number;
            unlimited: boolean;
          };
        };
        date?: string;
        travelers?: {
          adults: number;
          children: number;
          total: number;
        };
        pricing?: {
          basePrice: number;
          currency: string;
        };
      };
    }>("/bookings/options", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Wishlist
  getWishlist: () =>
    request<{ items: WishlistItem[]; count: number }>("/wishlist", {}, false),

  addToWishlist: (packageId: string, deviceId?: string) =>
    request<{ message: string; item: WishlistItem }>(
      "/wishlist",
      {
        method: "POST",
        body: JSON.stringify({ packageId, deviceId }),
      },
      false
    ),

  removeFromWishlist: (packageId: string) =>
    request<{ message: string }>(`/wishlist/${packageId}`, { method: "DELETE" }, false),

  // Newsletter
  subscribeNewsletter: (payload: {
    email: string;
    source?: string;
    interests?: string[];
  }) =>
    request<{ status: string; message: string; email: string }>("/newsletter/subscribe", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Contact Leads
  createContactLead: (payload: {
    name: string;
    email: string;
    message: string;
    phone?: string;
    subject?: string;
    source?: string;
  }) =>
    request<{ message: string; id: string; status: string }>("/leads/contact", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // User Profile
  getProfile: () => request("/users/profile", {}, true),

  updateProfile: (payload: { name?: string; phone?: string }) =>
    request("/users/profile", { method: "PUT", body: JSON.stringify(payload) }, true),

  // Blogs
  getBlogs: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    published?: boolean;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.category) queryParams.append("category", params.category);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.published !== undefined) queryParams.append("published", String(params.published));
    
    const query = queryParams.toString();
    return request<{
      data: Array<{
        id: number;
        title: string;
        slug: string;
        excerpt: string | null;
        content: string;
        image: string | null;
        category: string | null;
        author: string | null;
        is_published: boolean;
        published_at: string | null;
        meta_title: string | null;
        meta_description: string | null;
        views: number;
        created_at: string;
        updated_at: string;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`/blogs${query ? `?${query}` : ""}`);
  },

  getBlog: (id: string) =>
    request<{
      id: number;
      title: string;
      slug: string;
      excerpt: string | null;
      content: string;
      image: string | null;
      category: string | null;
      author: string | null;
      is_published: boolean;
      published_at: string | null;
      meta_title: string | null;
      meta_description: string | null;
      views: number;
      created_at: string;
      updated_at: string;
    }>(`/blogs/${id}`),

  getBlogBySlug: (slug: string) =>
    request<{
      id: number;
      title: string;
      slug: string;
      excerpt: string | null;
      content: string;
      image: string | null;
      category: string | null;
      author: string | null;
      is_published: boolean;
      published_at: string | null;
      meta_title: string | null;
      meta_description: string | null;
      views: number;
      created_at: string;
      updated_at: string;
    }>(`/blogs/slug/${slug}`),

  createBlog: async (payload: FormData | {
    title: string;
    content: string;
    excerpt?: string;
    image?: string;
    category?: string;
    author?: string;
    is_published?: boolean;
    meta_title?: string;
    meta_description?: string;
  }) => {
    // If payload is FormData, send as multipart/form-data
    if (payload instanceof FormData) {
      const token = getToken();
      const headers: HeadersInit = {};
      // Don't set Content-Type for FormData - browser will set it with boundary
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      return fetch(`${API_BASE_URL}/blogs`, {
        method: "POST",
        headers,
        body: payload,
        credentials: "include",
      }).then(async (response) => {
        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = "Failed to create blog";
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
          throw new Error(errorMessage);
        }
        return response.json();
      });
    }
    
    // Otherwise, send as JSON
    return request<{
      id: number;
      title: string;
      slug: string;
      excerpt: string | null;
      content: string;
      image: string | null;
      category: string | null;
      author: string | null;
      is_published: boolean;
      published_at: string | null;
      meta_title: string | null;
      meta_description: string | null;
      views: number;
      created_at: string;
      updated_at: string;
    }>("/blogs", {
      method: "POST",
      body: JSON.stringify(payload),
    }, true);
  },

  updateBlog: async (id: string, payload: FormData | {
    title?: string;
    content?: string;
    excerpt?: string;
    image?: string;
    category?: string;
    author?: string;
    is_published?: boolean;
    meta_title?: string;
    meta_description?: string;
  }) => {
    // If payload is FormData, send as multipart/form-data
    if (payload instanceof FormData) {
      const token = getToken();
      const headers: HeadersInit = {};
      // Don't set Content-Type for FormData - browser will set it with boundary
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      return fetch(`${API_BASE_URL}/blogs/${id}`, {
        method: "PUT",
        headers,
        body: payload,
        credentials: "include",
      }).then(async (response) => {
        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = "Failed to update blog";
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
          throw new Error(errorMessage);
        }
        return response.json();
      });
    }
    
    // Otherwise, send as JSON
    return request<{
      id: number;
      title: string;
      slug: string;
      excerpt: string | null;
      content: string;
      image: string | null;
      category: string | null;
      author: string | null;
      is_published: boolean;
      published_at: string | null;
      meta_title: string | null;
      meta_description: string | null;
      views: number;
      created_at: string;
      updated_at: string;
    }>(`/blogs/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }, true);
  },

  deleteBlog: (id: string) =>
    request<{ message: string }>(`/blogs/${id}`, { method: "DELETE" }, true),

  // Health Check / API Test
  healthCheck: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      // If /health doesn't exist, try a simple GET to base API
      try {
        const response = await fetch(`${API_BASE_URL}/packages?limit=1`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        return {
          status: response.ok ? "connected" : "error",
          statusCode: response.status,
          message: response.ok ? "API is reachable" : `API returned status ${response.status}`,
          url: `${API_BASE_URL}/packages`,
        };
      } catch (fallbackError) {
        throw new Error(
          `Cannot connect to API at ${API_BASE_URL}. Please ensure the PHP backend is running on WAMP (http://localhost/php-backend) or update NEXT_PUBLIC_API_URL in your .env.local file.`
        );
      }
    }
  },

  // Testimonials
  getTestimonials: (params?: {
    page?: number;
    limit?: number;
    active?: boolean;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.active !== undefined) queryParams.append("active", String(params.active));
    if (params?.search) queryParams.append("search", params.search);
    
    const query = queryParams.toString();
    return request<{
      data: Array<{
        id: number;
        name: string;
        location: string;
        avatar: string | null;
        quote: string;
        rating: number;
        is_active: boolean;
        display_order: number;
        created_at: string;
        updated_at: string;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`/testimonials${query ? `?${query}` : ""}`);
  },

  getTestimonial: async (id: string | number) => {
    const response = await request<{
      data: {
        id: number;
        name: string;
        location: string;
        avatar: string | null;
        quote: string;
        rating: number;
        is_active: boolean;
        display_order: number;
        created_at: string;
        updated_at: string;
      };
    }>(`/testimonials/${id}`);
    return response.data;
  },

  createTestimonial: async (payload: FormData | {
    name: string;
    location: string;
    avatar?: string | null;
    quote: string;
    rating?: number;
    is_active?: boolean;
    display_order?: number;
  }) => {
    // If payload is FormData, send as multipart/form-data
    if (payload instanceof FormData) {
      const token = getToken();
      const headers: HeadersInit = {};
      // Don't set Content-Type for FormData - browser will set it with boundary
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      return fetch(`${API_BASE_URL}/testimonials`, {
        method: "POST",
        headers,
        body: payload,
        credentials: "include",
      }).then(async (response) => {
        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = "Failed to create testimonial";
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
          throw new Error(errorMessage);
        }
        return response.json();
      });
    }
    
    // Otherwise, send as JSON
    return request<{
      id: number;
      name: string;
      location: string;
      avatar: string | null;
      quote: string;
      rating: number;
      is_active: boolean;
      display_order: number;
      created_at: string;
      updated_at: string;
    }>("/testimonials", {
      method: "POST",
      body: JSON.stringify(payload),
    }, true);
  },

  updateTestimonial: async (id: string | number, payload: FormData | {
    name?: string;
    location?: string;
    avatar?: string | null;
    quote?: string;
    rating?: number;
    is_active?: boolean;
    display_order?: number;
  }) => {
    // If payload is FormData, send as multipart/form-data
    if (payload instanceof FormData) {
      const token = getToken();
      const headers: HeadersInit = {};
      // Don't set Content-Type for FormData - browser will set it with boundary
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      return fetch(`${API_BASE_URL}/testimonials/${id}`, {
        method: "PUT",
        headers,
        body: payload,
        credentials: "include",
      }).then(async (response) => {
        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = "Failed to update testimonial";
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
          throw new Error(errorMessage);
        }
        return response.json();
      });
    }
    
    // Otherwise, send as JSON
    return request<{
      id: number;
      name: string;
      location: string;
      avatar: string | null;
      quote: string;
      rating: number;
      is_active: boolean;
      display_order: number;
      created_at: string;
      updated_at: string;
    }>(`/testimonials/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }, true);
  },

  deleteTestimonial: (id: string | number) =>
    request<{ message: string }>(`/testimonials/${id}`, {
      method: "DELETE",
    }, true),
};

