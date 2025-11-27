/**
 * Token Monitor - Tracks when refresh tokens are cleared
 * This helps debug why refresh tokens disappear
 */

if (typeof window !== "undefined") {
  const REFRESH_TOKEN_KEY = "citymuscattours_refresh_token";
  
  // Monitor localStorage changes
  const originalRemoveItem = window.localStorage.removeItem;
  window.localStorage.removeItem = function(key: string) {
    if (key === REFRESH_TOKEN_KEY) {
      const stackTrace = new Error().stack;
      console.error("🚨🚨🚨 REFRESH TOKEN BEING REMOVED FROM LOCALSTORAGE! 🚨🚨🚨");
      console.error("Key:", key);
      console.error("Stack trace:", stackTrace);
      console.error("Timestamp:", new Date().toISOString());
      console.error("This should only happen if backend explicitly says refresh token is invalid!");
    }
    return originalRemoveItem.call(this, key);
  };
  
  // Monitor localStorage.setItem to see if something is overwriting with empty value
  const originalSetItem = window.localStorage.setItem;
  window.localStorage.setItem = function(key: string, value: string) {
    if (key === REFRESH_TOKEN_KEY && (!value || value.trim().length === 0)) {
      const stackTrace = new Error().stack;
      console.error("🚨🚨🚨 REFRESH TOKEN BEING SET TO EMPTY! 🚨🚨🚨");
      console.error("Key:", key);
      console.error("Value:", value);
      console.error("Stack trace:", stackTrace);
      console.error("Timestamp:", new Date().toISOString());
    }
    return originalSetItem.call(this, key, value);
  };
  
  // Monitor localStorage.clear
  const originalClear = window.localStorage.clear;
  window.localStorage.clear = function() {
    const hadRefreshToken = !!window.localStorage.getItem(REFRESH_TOKEN_KEY);
    if (hadRefreshToken) {
      const stackTrace = new Error().stack;
      console.error("🚨🚨🚨 LOCALSTORAGE CLEARED - REFRESH TOKEN LOST! 🚨🚨🚨");
      console.error("Stack trace:", stackTrace);
      console.error("Timestamp:", new Date().toISOString());
    }
    return originalClear.call(this);
  };
  
  console.log("✅ Token monitor initialized - will track refresh token operations");
}

