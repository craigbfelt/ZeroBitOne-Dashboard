import { createClient } from "@/lib/supabase/server";
import type { App } from "@/lib/types";

export default async function AppsPage() {
  const supabase = createClient();
  
  const { data: apps, error } = await supabase
    .from('apps')
    .select('*')
    .order('name');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Apps</h2>
          <p className="mt-2 text-gray-600">
            Manage applications and projects
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          New App
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">
            Error loading apps. Please check your Supabase configuration.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps && apps.length > 0 ? (
          apps.map((app: App) => (
            <div key={app.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{app.name}</h3>
                  {app.description && (
                    <p className="mt-2 text-sm text-gray-600">{app.description}</p>
                  )}
                </div>
                <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                  app.status === 'active' ? 'bg-green-100 text-green-800' :
                  app.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {app.status}
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Created {new Date(app.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-lg shadow p-8 text-center">
            <p className="text-sm text-gray-500">
              No apps found. Create your first app to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
