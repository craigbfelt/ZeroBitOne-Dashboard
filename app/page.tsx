import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-2 text-gray-600">
          Welcome to ZeroBitOne multi-tenant dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Tickets</h3>
          <p className="text-3xl font-bold text-blue-600">--</p>
          <p className="text-sm text-gray-500 mt-2">Active tickets</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Time Tracked</h3>
          <p className="text-3xl font-bold text-green-600">-- hrs</p>
          <p className="text-sm text-gray-500 mt-2">This month</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Apps</h3>
          <p className="text-3xl font-bold text-purple-600">--</p>
          <p className="text-sm text-gray-500 mt-2">Active apps</p>
        </div>
      </div>

      {!user && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You are not authenticated. Please set up Supabase authentication to use this dashboard.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
