'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';

interface License {
  id: string;
  name: string;
  total: number;
  used: number;
  type: string;
  status: string;
  utilization?: number;
  available?: number;
}

export default function LicensePage() {
  const [data, setData] = useState<License[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/licenses');
      if (res.ok) {
        const json = await res.json();
        setData(json.data || []);
      } else {
        setError('Failed to load licenses');
      }
    } catch {
      setError('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns: Column<License>[] = [
    {
      key: 'name',
      header: 'License Name',
      render: (row) => <span className="font-medium">{row.name}</span>,
    },
    { key: 'type', header: 'Type' },
    {
      key: 'usage',
      header: 'Usage',
      width: '200px',
      render: (row) => (
        <div className="w-full">
          <div className="flex justify-between text-xs mb-1">
            <span>
              {row.used} / {row.total}
            </span>
            <span>{row.total > 0 ? Math.round((row.used / row.total) * 100) : 0}%</span>
          </div>
          <div className="w-full bg-cloud dark:bg-nebula-purple/20 rounded-full h-2">
            <div
              className="bg-celestial-indigo h-2 rounded-full transition-all duration-500"
              style={{
                width: `${row.total > 0 ? Math.min((row.used / row.total) * 100, 100) : 0}%`,
              }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '100px',
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.status === 'Active'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  const handleSave = async (record: Partial<License>) => {
    const isEdit = !!record.id;
    const url = isEdit ? `/api/licenses/${record.id}` : '/api/licenses';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || `Failed to ${isEdit ? 'update' : 'create'} license`);
        return;
      }

      await fetchData();
    } catch {
      alert('Network error. Please try again.');
    }
  };

  const handleDelete = async (record: License) => {
    if (!confirm(`Are you sure you want to delete "${record.name}"?`)) return;
    try {
      const res = await fetch(`/api/licenses/${record.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to delete license');
        return;
      }
      await fetchData();
    } catch {
      alert('Network error. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-celestial-indigo" />
        <span className="ml-2 text-sm text-silver-mist">Loading licenses...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)] gap-4">
        <p className="text-sm text-rose-500">{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-celestial-indigo text-white hover:bg-celestial-indigo/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <DataPage<License>
      title="License Management"
      singularTitle="License"
      breadcrumbs={[{ label: 'Admin' }, { label: 'User Management' }, { label: 'Licenses' }]}
      data={data}
      columns={columns}
      onSave={handleSave}
      onDelete={handleDelete}
      defaultValues={{ status: 'Active', type: 'Per User', used: 0 }}
      renderForm={(record, onChange) => (
        <>
          <div>
            <label className="block text-xs font-medium text-silver-mist mb-1">License Name</label>
            <input
              type="text"
              value={record.name || ''}
              onChange={(e) => onChange('name', e.target.value)}
              className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
              placeholder="e.g. Core HR"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-silver-mist mb-1">Total Seats</label>
            <input
              type="number"
              min="1"
              value={record.total || ''}
              onChange={(e) => onChange('total', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-silver-mist mb-1">Type</label>
            <select
              value={record.type || 'Per User'}
              onChange={(e) => onChange('type', e.target.value)}
              className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
            >
              <option value="Per User">Per User</option>
              <option value="Per Recruiter">Per Recruiter</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
        </>
      )}
    />
  );
}
