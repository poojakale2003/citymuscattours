/**
 * Test script to verify /auth/refresh endpoint is working correctly
 * 
 * Usage:
 * 1. Get your refresh token from browser localStorage: citymuscattours_refresh_token
 * 2. Update REFRESH_TOKEN and API_URL below
 * 3. Run: node test-refresh-endpoint.js
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/php-backend/api";
const REFRESH_TOKEN = "YOUR_REFRESH_TOKEN_HERE"; // Get this from browser localStorage

async function testRefreshEndpoint() {
  console.log("🧪 Testing /auth/refresh endpoint...\n");
  console.log("API URL:", `${API_URL}/auth/refresh`);
  console.log("Refresh Token:", REFRESH_TOKEN.substring(0, 30) + "...\n");

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ refreshToken: REFRESH_TOKEN }),
    });

    console.log("📊 Response Status:", response.status, response.statusText);
    console.log("📊 Response Headers:", Object.fromEntries(response.headers.entries()));
    console.log("");

    const contentType = response.headers.get("content-type") || "";
    const isJSON = contentType.includes("application/json");

    if (!isJSON) {
      const text = await response.text();
      console.log("❌ Response is not JSON!");
      console.log("Response body:", text.substring(0, 500));
      return;
    }

    const data = await response.json();
    console.log("📦 Response Data:", JSON.stringify(data, null, 2));
    console.log("");

    // Check response format
    if (response.ok) {
      console.log("✅ SUCCESS - Endpoint returned 200");
      
      // Check for access token
      const hasAccessToken = 
        data.tokens?.accessToken || 
        data.accessToken || 
        data.token;
      
      // Check for refresh token
      const hasRefreshToken = 
        data.tokens?.refreshToken || 
        data.refreshToken;

      console.log("\n📋 Response Analysis:");
      console.log("  - Has Access Token:", !!hasAccessToken);
      console.log("  - Has Refresh Token:", !!hasRefreshToken);
      console.log("  - Access Token Location:", 
        data.tokens?.accessToken ? "data.tokens.accessToken" :
        data.accessToken ? "data.accessToken" :
        data.token ? "data.token" : "NOT FOUND"
      );
      console.log("  - Refresh Token Location:", 
        data.tokens?.refreshToken ? "data.tokens.refreshToken" :
        data.refreshToken ? "data.refreshToken" : "NOT FOUND"
      );

      if (!hasAccessToken) {
        console.log("\n❌ ERROR: Response missing access token!");
        console.log("   Backend should return accessToken in one of these formats:");
        console.log('   - { tokens: { accessToken: "...", refreshToken: "..." } }');
        console.log('   - { accessToken: "...", refreshToken: "..." }');
        console.log('   - { token: "..." }');
      }

      if (!hasRefreshToken) {
        console.log("\n⚠️  WARNING: Response missing refresh token!");
        console.log("   Backend should return new refreshToken in response.");
        console.log("   Frontend will keep existing refresh token, but best practice is to return new one.");
      }

      if (hasAccessToken && hasRefreshToken) {
        console.log("\n✅ PERFECT: Response includes both tokens!");
      }
    } else {
      console.log("❌ ERROR - Endpoint returned", response.status);
      
      // Check error message
      const errorMessage = data.message || data.error || JSON.stringify(data);
      console.log("📋 Error Message:", errorMessage);
      console.log("");

      // Check if error message is specific
      const errorLower = errorMessage.toLowerCase();
      const isSpecific = 
        errorLower.includes("refresh token") ||
        errorLower.includes("access token") ||
        errorLower.includes("refresh_token") ||
        errorLower.includes("access_token");

      if (!isSpecific) {
        console.log("❌ ERROR: Error message is too generic!");
        console.log("   Current:", errorMessage);
        console.log("   Should be one of:");
        console.log("   - 'Invalid refresh token'");
        console.log("   - 'Refresh token expired'");
        console.log("   - 'Refresh token signature invalid'");
        console.log("   - 'Invalid or expired access token'");
        console.log("   - 'Access token expired'");
      } else {
        console.log("✅ Error message is specific enough");
      }

      // Check if it's a refresh token error
      if (errorLower.includes("refresh token") || errorLower.includes("refresh_token")) {
        console.log("✅ Correctly identifies refresh token error");
      } else if (errorLower.includes("access token") || errorLower.includes("access_token")) {
        console.log("✅ Correctly identifies access token error");
      } else {
        console.log("⚠️  Error message mentions token but doesn't specify which type");
      }
    }
  } catch (error) {
    console.error("❌ Network Error:", error.message);
    console.log("\nPossible issues:");
    console.log("  1. Backend server is not running");
    console.log("  2. API_URL is incorrect");
    console.log("  3. CORS issue (check backend CORS settings)");
    console.log("  4. Network connectivity issue");
  }
}

// Run the test
testRefreshEndpoint();

