"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface TestResult {
  endpoint: string;
  status: "success" | "error" | "testing";
  message: string;
  data?: any;
  error?: string;
}

export default function ApiTestPanel() {
  const [isTesting, setIsTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [apiUrl, setApiUrl] = useState(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost/php-backend/api");

  const testEndpoint = async (name: string, testFn: () => Promise<any>) => {
    const result: TestResult = {
      endpoint: name,
      status: "testing",
      message: "Testing...",
    };
    
    setResults((prev) => [...prev, result]);
    
    try {
      const data = await testFn();
      result.status = "success";
      result.message = "✓ Connected successfully";
      result.data = data;
    } catch (error) {
      result.status = "error";
      result.message = "✗ Connection failed";
      result.error = error instanceof Error ? error.message : String(error);
    }
    
    setResults((prev) => prev.map((r) => (r.endpoint === name ? result : r)));
  };

  const runAllTests = async () => {
    setIsTesting(true);
    setResults([]);

    // Test 1: Health Check
    await testEndpoint("Health Check", () => api.healthCheck());

    // Test 2: Get Packages
    await testEndpoint("Get Packages", () => api.getPackages({ limit: 1 }));

    // Test 3: Get Categories
    await testEndpoint("Get Categories", () => api.getCategories());

    // Test 4: Direct API call
    await testEndpoint("Direct API Call", async () => {
      const response = await fetch(`${apiUrl}/packages?limit=1`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    });

    setIsTesting(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">API Connection Test</h2>
          <p className="mt-1 text-sm text-slate-600">
            Test connectivity to backend API
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={clearResults}
            disabled={isTesting || results.length === 0}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 disabled:opacity-50"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={runAllTests}
            disabled={isTesting}
            className="rounded-full bg-[var(--color-brand-600)] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-700)] disabled:opacity-50"
          >
            {isTesting ? "Testing..." : "Run Tests"}
          </button>
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <label className="block text-sm font-semibold text-slate-700">
          API Base URL
        </label>
        <input
          type="text"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[var(--color-brand-400)] focus:outline-none"
          placeholder="http://localhost/php-backend/api"
        />
        <p className="mt-2 text-xs text-slate-500">
          Current: {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost/php-backend/api"}
        </p>
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((result, index) => (
            <div
              key={index}
              className={`rounded-2xl border px-4 py-3 ${
                result.status === "success"
                  ? "border-green-200 bg-green-50"
                  : result.status === "error"
                  ? "border-red-200 bg-red-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{result.endpoint}</p>
                  <p
                    className={`mt-1 text-xs ${
                      result.status === "success"
                        ? "text-green-700"
                        : result.status === "error"
                        ? "text-red-700"
                        : "text-slate-600"
                    }`}
                  >
                    {result.message}
                  </p>
                  {result.error && (
                    <p className="mt-2 text-xs text-red-600">{result.error}</p>
                  )}
                </div>
                <div
                  className={`ml-4 rounded-full px-3 py-1 text-xs font-semibold ${
                    result.status === "success"
                      ? "bg-green-100 text-green-700"
                      : result.status === "error"
                      ? "bg-red-100 text-red-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {result.status === "testing" ? "..." : result.status === "success" ? "OK" : "FAIL"}
                </div>
              </div>
              {result.data && result.status === "success" && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-semibold text-slate-600">
                    View Response Data
                  </summary>
                  <pre className="mt-2 overflow-auto rounded-lg bg-white p-3 text-xs text-slate-700">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && !isTesting && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
          <p className="text-sm text-slate-600">Click "Run Tests" to check API connectivity</p>
        </div>
      )}
    </div>
  );
}

