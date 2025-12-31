import { createClient } from "@/lib/supabase/server";

export default async function ReportsPage() {
  const supabase = createClient();
  
  // Fetch summary data for reports
  const { data: tickets } = await supabase.from('tickets').select('status');
  const { data: timeEntries } = await supabase.from('time_entries').select('hours, date');
  const { data: apps } = await supabase.from('apps').select('status');

  const ticketsByStatus = tickets?.reduce((acc: any, ticket) => {
    acc[ticket.status] = (acc[ticket.status] || 0) + 1;
    return acc;
  }, {});

  const totalHours = timeEntries?.reduce((sum, entry) => sum + parseFloat(entry.hours.toString()), 0) || 0;
  const activeApps = apps?.filter(app => app.status === 'active').length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Reports</h2>
        <p className="mt-2 text-gray-600">
          View analytics and reports for your projects
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Summary</h3>
          <div className="space-y-2">
            {ticketsByStatus && Object.keys(ticketsByStatus).length > 0 ? (
              Object.entries(ticketsByStatus).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">{status}</span>
                  <span className="text-lg font-semibold text-gray-900">{count as number}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No tickets data available</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Summary</h3>
          <p className="text-4xl font-bold text-blue-600 mb-2">{totalHours.toFixed(2)}</p>
          <p className="text-sm text-gray-500">Total hours tracked</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Apps Summary</h3>
          <p className="text-4xl font-bold text-purple-600 mb-2">{activeApps}</p>
          <p className="text-sm text-gray-500">Active applications</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <p className="text-sm text-gray-500">
          Detailed activity reports will be displayed here. Connect to your Supabase instance to see real-time data.
        </p>
      </div>
    </div>
  );
}
