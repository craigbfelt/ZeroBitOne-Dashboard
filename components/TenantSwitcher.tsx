'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Tenant } from '@/lib/types';

export default function TenantSwitcher() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentTenant, setCurrentTenant] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTenants();
  }, []);

  async function loadTenants() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('display_name');

      if (error) throw error;

      setTenants(data || []);
      
      // Get current tenant from localStorage or use first tenant
      const savedTenant = localStorage.getItem('currentTenant');
      if (savedTenant && data?.find(t => t.id === savedTenant)) {
        setCurrentTenant(savedTenant);
      } else if (data && data.length > 0) {
        setCurrentTenant(data[0].id);
        localStorage.setItem('currentTenant', data[0].id);
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleTenantChange(tenantId: string) {
    setCurrentTenant(tenantId);
    localStorage.setItem('currentTenant', tenantId);
    // Reload the page to refresh data
    window.location.reload();
  }

  if (loading) {
    return (
      <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm">
        Loading...
      </div>
    );
  }

  if (tenants.length === 0) {
    return (
      <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
        No tenants available
      </div>
    );
  }

  const selectedTenant = tenants.find(t => t.id === currentTenant);

  return (
    <div className="relative">
      <select
        value={currentTenant}
        onChange={(e) => handleTenantChange(e.target.value)}
        className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {tenants.map((tenant) => (
          <option key={tenant.id} value={tenant.id}>
            {tenant.display_name}
            {tenant.is_personal ? ' (Personal)' : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
