import ApiTestPanel from "@/components/admin/ApiTestPanel";

export default function ApiTestPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">API Connection Test</h1>
        <p className="mt-2 text-sm text-slate-600">
          Test connectivity to your PHP backend running on WAMP (http://localhost/php-backend)
        </p>
      </div>
      <ApiTestPanel />
    </div>
  );
}

