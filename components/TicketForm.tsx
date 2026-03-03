'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { App, Member, Ticket } from '@/lib/types';
import AIAssistant from '@/components/AIAssistant';

type TicketRequestBody = {
  title: string;
  description: string | null;
  status: string;
  priority: string;
  app_id: string | null;
  assigned_to: string | null;
  tenant_id?: string;
};

type TicketFormProps = {
  ticket?: Ticket;
  apps: App[];
  members: Member[];
};

export default function TicketForm({ ticket, apps, members }: TicketFormProps) {
  const router = useRouter();
  const isEditing = !!ticket;

  const [title, setTitle] = useState(ticket?.title ?? '');
  const [description, setDescription] = useState(ticket?.description ?? '');
  const [status, setStatus] = useState(ticket?.status ?? 'open');
  const [priority, setPriority] = useState(ticket?.priority ?? 'medium');
  const [appId, setAppId] = useState(ticket?.app_id ?? '');
  const [assignedTo, setAssignedTo] = useState(ticket?.assigned_to ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedApp = apps.find((a) => a.id === appId);
  const selectedMember = members.find((m) => m.id === assignedTo);

  const aiContext = [
    title ? `Ticket title: ${title}` : 'New ticket (no title yet)',
    description ? `Description: ${description}` : '',
    `Status: ${status}`,
    `Priority: ${priority}`,
    selectedApp ? `App: ${selectedApp.name}` : '',
    selectedMember ? `Assigned to: ${selectedMember.name ?? selectedMember.email}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const body: TicketRequestBody = {
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        app_id: appId || null,
        assigned_to: assignedTo || null,
      };

      let response: Response;

      if (isEditing) {
        response = await fetch(`/api/tickets/${ticket.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        const tenantId =
          typeof window !== 'undefined' ? localStorage.getItem('currentTenant') : null;
        if (!tenantId) {
          throw new Error('No tenant selected. Please select a tenant from the header.');
        }
        body.tenant_id = tenantId;

        response = await fetch('/api/tickets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to save ticket');
      }

      router.push('/tickets');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save ticket');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter ticket title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the issue or request..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">App</label>
            <select
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— None —</option>
              {apps.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Unassigned —</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name ?? member.email}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push('/tickets')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>

      <div>
        <AIAssistant context={aiContext} />
      </div>
    </div>
  );
}
