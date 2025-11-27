const TOKEN_KEY = "citymuscattours_token";
const REFRESH_TOKEN_KEY = "citymuscattours_refresh_token";

export function saveToken(token: string): boolean {
  if (typeof window === "undefined") {
    console.error("saveToken: window is undefined (server-side)");
    return false;
  }
  
  if (!token || typeof token !== "string" || token.trim().length === 0) {
    console.error("saveToken: Invalid token provided", { tokenType: typeof token, tokenLength: token?.length });
    return false;
  }
  
  // Try to save with retry mechanism
  const maxRetries = 3;
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`💾 saveToken: Attempt ${attempt}/${maxRetries} to save token...`);
      
      // Clear any existing token first (in case of corruption)
      try {
        window.localStorage.removeItem(TOKEN_KEY);
      } catch (e) {
        // Ignore remove errors
      }
      
      // Save the token
      window.localStorage.setItem(TOKEN_KEY, token);
      
      // Immediate verification
      let saved = window.localStorage.getItem(TOKEN_KEY);
      if (saved === token) {
        console.log(`✅ saveToken: Token saved successfully on attempt ${attempt}`, {
          key: TOKEN_KEY,
          tokenLength: token.length,
          tokenPreview: token.substring(0, 30) + "..."
        });
        
        // Additional verification - check multiple times to ensure persistence
        let allChecksPassed = true;
        for (let verifyAttempt = 1; verifyAttempt <= 3; verifyAttempt++) {
          const verifyCheck = window.localStorage.getItem(TOKEN_KEY);
          if (verifyCheck !== token) {
            console.warn(`⚠️ saveToken: Verification check ${verifyAttempt} failed`);
            allChecksPassed = false;
            break;
          }
        }
        
        if (allChecksPassed) {
          console.log(`✅ saveToken: All verification checks passed (${maxRetries} attempts)`);
          return true;
        } else {
          console.warn(`⚠️ saveToken: Token saved but verification failed, retrying...`);
          continue;
        }
      } else {
        console.error(`❌ saveToken: Token verification failed on attempt ${attempt}`, {
          expected: token.substring(0, 30) + "...",
          actual: saved ? saved.substring(0, 30) + "..." : "null",
          expectedLength: token.length,
          actualLength: saved?.length || 0
        });
        
        if (attempt < maxRetries) {
          // Wait a bit before retrying (only if not last attempt)
          // Use setTimeout synchronously (no await needed)
          continue;
        }
      }
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ saveToken: Attempt ${attempt} failed with error:`, error);
      
      // Handle quota exceeded or other localStorage errors
      if (error instanceof DOMException) {
        if (error.code === 22 || error.code === 1014) {
          console.error("saveToken: localStorage quota exceeded - cannot save token");
          return false; // Don't retry if quota exceeded
        } else if (error.code === 18) {
          console.error("saveToken: localStorage is disabled - cannot save token");
          return false; // Don't retry if localStorage is disabled
        }
      }
      
      if (attempt < maxRetries) {
        // Continue to next attempt
        continue;
      }
    }
  }
  
  // Final check
  const finalCheck = window.localStorage.getItem(TOKEN_KEY);
  if (finalCheck === token) {
    console.log("✅ saveToken: Token found in final check - saved successfully");
    return true;
  }
  
  console.error("❌ saveToken: Failed to save token after all attempts", {
    attempts: maxRetries,
    lastError: lastError?.message,
    finalCheck: finalCheck ? finalCheck.substring(0, 30) + "..." : "null"
  });
  
  return false;
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function saveRefreshToken(token: string): boolean {
  if (typeof window === "undefined") {
    console.error("saveRefreshToken: window is undefined (server-side)");
    return false;
  }
  
  if (!token || typeof token !== "string" || token.trim().length === 0) {
    console.error("saveRefreshToken: Invalid refresh token provided", { tokenType: typeof token, tokenLength: token?.length });
    return false;
  }
  
  // Try to save with retry mechanism
  const maxRetries = 3;
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`💾 saveRefreshToken: Attempt ${attempt}/${maxRetries} to save refresh token...`);
      
      // Save the refresh token directly (overwrites existing)
      // Don't clear first - if save fails, we keep the old token
      window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
      
      // Immediate verification
      let saved = window.localStorage.getItem(REFRESH_TOKEN_KEY);
      if (saved === token) {
        console.log(`✅ saveRefreshToken: Refresh token saved successfully on attempt ${attempt}`, {
          key: REFRESH_TOKEN_KEY,
          tokenLength: token.length,
          tokenPreview: token.substring(0, 30) + "..."
        });
        
        // Additional verification - check multiple times
        let allChecksPassed = true;
        for (let verifyAttempt = 1; verifyAttempt <= 3; verifyAttempt++) {
          const verifyCheck = window.localStorage.getItem(REFRESH_TOKEN_KEY);
          if (verifyCheck !== token) {
            console.warn(`⚠️ saveRefreshToken: Verification check ${verifyAttempt} failed`);
            allChecksPassed = false;
            break;
          }
        }
        
        if (allChecksPassed) {
          console.log(`✅ saveRefreshToken: All verification checks passed`);
          return true;
        } else {
          console.warn(`⚠️ saveRefreshToken: Token saved but verification failed, retrying...`);
          continue;
        }
      } else {
        console.error(`❌ saveRefreshToken: Token verification failed on attempt ${attempt}`, {
          expected: token.substring(0, 30) + "...",
          actual: saved ? saved.substring(0, 30) + "..." : "null"
        });
        
        if (attempt < maxRetries) {
          continue;
        }
      }
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ saveRefreshToken: Attempt ${attempt} failed with error:`, error);
      
      if (error instanceof DOMException) {
        if (error.code === 22 || error.code === 1014) {
          console.error("saveRefreshToken: localStorage quota exceeded");
          return false;
        } else if (error.code === 18) {
          console.error("saveRefreshToken: localStorage is disabled");
          return false;
        }
      }
      
      if (attempt < maxRetries) {
        continue;
      }
    }
  }
  
  // Final check
  const finalCheck = window.localStorage.getItem(REFRESH_TOKEN_KEY);
  if (finalCheck === token) {
    console.log("✅ saveRefreshToken: Refresh token found in final check - saved successfully");
    return true;
  }
  
  console.error("❌ saveRefreshToken: Failed to save refresh token after all attempts", {
    attempts: maxRetries,
    lastError: lastError?.message
  });
  
  return false;
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearRefreshToken(reason?: string) {
  if (typeof window === "undefined") return;
  
  const hadRefreshToken = !!window.localStorage.getItem(REFRESH_TOKEN_KEY);
  const stackTrace = new Error().stack;
  
  if (hadRefreshToken) {
    console.error("🚨 clearRefreshToken called - THIS SHOULD BE RARE!", {
      reason: reason || "Invalid refresh token",
      stackTrace: stackTrace?.split("\n").slice(1, 10).join("\n"), // More stack frames for debugging
      timestamp: new Date().toISOString()
    });
    
    // CRITICAL: Only clear if reason explicitly says refresh token is invalid
    // Don't clear on generic errors or ambiguous reasons
    const reasonLower = (reason || "").toLowerCase();
    const isDefinitelyInvalid = 
      reasonLower.includes("invalid refresh token") ||
      reasonLower.includes("refresh token expired") ||
      reasonLower.includes("refresh token signature") ||
      reasonLower.includes("backend confirmed invalid") ||
      (reasonLower.includes("refresh token") && reasonLower.includes("invalid"));
    
    if (!isDefinitelyInvalid) {
      console.error("❌ BLOCKED: clearRefreshToken called but reason is not specific enough!");
      console.error("❌ Reason:", reason);
      console.error("❌ NOT clearing refresh token - reason must explicitly say refresh token is invalid");
      console.error("❌ This prevents accidental clearing of valid refresh tokens");
      return; // Don't clear if reason is ambiguous
    }
    
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    console.error("🗑️ Refresh token cleared from localStorage", { 
      reason: reason || "Invalid refresh token",
      wasDefinitelyInvalid: true
    });
  } else {
    console.log("🗑️ clearRefreshToken called but no refresh token found", { reason: reason || "Invalid refresh token" });
  }
}

export function clearAccessToken(reason?: string) {
  if (typeof window === "undefined") return;
  
  const hadToken = !!window.localStorage.getItem(TOKEN_KEY);
  
  if (hadToken) {
    window.localStorage.removeItem(TOKEN_KEY);
    console.log("🗑️ Access token cleared", { reason: reason || "Access token invalid" });
  }
}

export function clearToken(reason?: string) {
  if (typeof window === "undefined") return;
  
  // Log why token is being cleared (for debugging)
  const stackTrace = new Error().stack;
  const hadToken = !!window.localStorage.getItem(TOKEN_KEY);
  const hadRefreshToken = !!window.localStorage.getItem(REFRESH_TOKEN_KEY);
  
  console.error("🚨 clearToken called (clearing BOTH tokens) - THIS SHOULD BE RARE!", {
    reason: reason || "Unknown",
    hadToken,
    hadRefreshToken,
    stackTrace: stackTrace?.split("\n").slice(1, 10).join("\n"), // More stack frames
    timestamp: new Date().toISOString()
  });
  
  // CRITICAL: Only clear refresh token if reason explicitly says both tokens are invalid
  // Don't clear refresh token on generic errors - it might still be valid
  const reasonLower = (reason || "").toLowerCase();
  const shouldClearRefreshToken = 
    reasonLower.includes("both") && reasonLower.includes("invalid") ||
    reasonLower.includes("both") && reasonLower.includes("expired") ||
    reasonLower.includes("session expired") ||
    reasonLower.includes("user logout") ||
    reasonLower.includes("logout");
  
  // Clear access token
  if (hadToken) {
    window.localStorage.removeItem(TOKEN_KEY);
    console.warn("🗑️ Access token cleared");
  }
  
  // Only clear refresh token if reason explicitly says both are invalid
  if (hadRefreshToken) {
    if (shouldClearRefreshToken) {
      window.localStorage.removeItem(REFRESH_TOKEN_KEY);
      console.error("🗑️ Refresh token cleared (both tokens invalid)");
    } else {
      console.warn("⚠️ NOT clearing refresh token - reason doesn't indicate both tokens are invalid");
      console.warn("⚠️ Reason:", reason);
      console.warn("⚠️ Keeping refresh token - it might still be valid");
    }
  }
  
  // Also clear the refresh_disabled flag
  try {
    window.localStorage.removeItem("refresh_disabled");
  } catch (e) {
    // Ignore
  }
  
  console.warn("🗑️ Token clearing complete", {
    tokenCleared: hadToken,
    refreshTokenCleared: hadRefreshToken && shouldClearRefreshToken,
    refreshTokenKept: hadRefreshToken && !shouldClearRefreshToken,
    reason: reason || "Unknown"
  });
}

export function isAuthenticated() {
  return Boolean(getToken());
}

// Decode JWT to check expiration (without verification - just to check expiry)
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    
    const payload = JSON.parse(atob(parts[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    
    // Consider token expired if less than 1 minute remaining
    return now >= exp - 60000;
  } catch {
    return true;
  }
}

// Debug utility to check token status (can be called from browser console)
export function debugTokenStatus() {
  if (typeof window === "undefined") {
    console.log("debugTokenStatus: Not available on server-side");
    return;
  }
  
  const token = getToken();
  const refreshToken = getRefreshToken();
  const isExpired = token ? isTokenExpired(token) : true;
  const refreshDisabled = window.localStorage.getItem("refresh_disabled") === "true";
  
  let tokenPayload = null;
  if (token) {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        tokenPayload = JSON.parse(atob(parts[1]));
      }
    } catch (e) {
      // Ignore
    }
  }
  
  const status = {
    hasToken: !!token,
    tokenLength: token?.length || 0,
    tokenPreview: token ? `${token.substring(0, 30)}...` : "null",
    isExpired,
    hasRefreshToken: !!refreshToken,
    refreshTokenLength: refreshToken?.length || 0,
    refreshDisabled,
    tokenPayload,
    allLocalStorageKeys: Object.keys(window.localStorage),
    localStorageItems: Object.fromEntries(
      Object.keys(window.localStorage).map(key => [
        key, 
        key.includes("token") || key.includes("Token") 
          ? `${window.localStorage.getItem(key)?.substring(0, 30)}...` 
          : window.localStorage.getItem(key)
      ])
    )
  };
  
  console.log("🔍 Token Status Debug:", status);
  return status;
}

// Force save token with multiple verification attempts
export function ensureTokenSaved(token: string, maxAttempts: number = 5): boolean {
  if (typeof window === "undefined") {
    console.error("ensureTokenSaved: window is undefined (server-side)");
    return false;
  }
  
  console.log(`🔒 ensureTokenSaved: Ensuring token is saved with ${maxAttempts} attempts...`);
  
  for (let i = 1; i <= maxAttempts; i++) {
    const saved = saveToken(token);
    if (saved) {
      // Verify it's still there after a brief moment
      const verify = window.localStorage.getItem(TOKEN_KEY);
      if (verify === token) {
        console.log(`✅ ensureTokenSaved: Token confirmed saved on attempt ${i}`);
        return true;
      } else {
        console.warn(`⚠️ ensureTokenSaved: Token disappeared after save on attempt ${i}, retrying...`);
      }
    } else {
      console.warn(`⚠️ ensureTokenSaved: Save failed on attempt ${i}, retrying...`);
    }
  }
  
  // Final verification
  const finalToken = window.localStorage.getItem(TOKEN_KEY);
  const success = finalToken === token;
  
  if (success) {
    console.log("✅ ensureTokenSaved: Token successfully saved after all attempts");
  } else {
    console.error("❌ ensureTokenSaved: Failed to save token after all attempts", {
      expected: token.substring(0, 30) + "...",
      actual: finalToken ? finalToken.substring(0, 30) + "..." : "null"
    });
  }
  
  return success;
}

// Make it available globally for browser console debugging
if (typeof window !== "undefined") {
  (window as any).debugTokenStatus = debugTokenStatus;
  (window as any).checkToken = debugTokenStatus; // Alias
  (window as any).ensureTokenSaved = ensureTokenSaved;
}

