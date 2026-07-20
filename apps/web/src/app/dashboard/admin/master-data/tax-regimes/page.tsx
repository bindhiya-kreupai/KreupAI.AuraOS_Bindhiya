'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';
import { handleValuesExport } from '@/lib/master-data-utils';

interface TaxRegime {
  id: string;
  code: string;
  name: string;
  country: string;
  status: 'Active' | 'Inactive';
}

const columns: Column<TaxRegime>[] = [
  {
    key: 'code',
    header: 'Code',
    width: '100px',
    render: (row) => <span className="font-mono text-xs">{row.code}</span>,
  },
  { key: 'name', header: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
  {
    key: 'country',
    header: 'Country',
    width: '150px',
    render: (row) => <span className="text-sm">{row.country}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    width: '100px',
    render: (row) => (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          row.status === 'Active'
            ? 'bg-neural-mint/10 text-neural-mint'
            : 'bg-silver-mist/10 text-silver-mist'
        }`}
      >
        {row.status}
      </span>
    ),
  },
];

export default function TaxRegimesPage() {
  const [data, setData] = useState<TaxRegime[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchTaxRegimes = useCallback(async (query?: string) => {
    try {
      setError(null);
      const url = query
        ? `/api/master-data/tax-regimes?search=${encodeURIComponent(query)}`
        : '/api/master-data/tax-regimes';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to load tax regimes');
      }
      const result = await response.json();
      setData(result.data ?? []);
    } catch (err) {
      console.error('Failed to fetch tax regimes:', err);
      setError('Unable to load tax regimes. Please try again.');
    }
  }, []);

  useEffect(() => {
    fetchTaxRegimes();
  }, [fetchTaxRegimes]);

  const handleSave = async (record: Partial<TaxRegime>) => {
    try {
      const method = record.id ? 'PUT' : 'POST';
      const url = record.id
        ? `/api/master-data/tax-regimes/${record.id}`
        : '/api/master-data/tax-regimes';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
      if (!response.ok) {
        throw new Error('Save failed');
      }
      await fetchTaxRegimes();
    } catch (err) {
      console.error('Error saving tax regime:', err);
      setError('Failed to save tax regime.');
    }
  };

  const handleDelete = async (record: TaxRegime) => {
    try {
      const response = await fetch(`/api/master-data/tax-regimes/${record.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Delete failed');
      }
      await fetchTaxRegimes();
    } catch (err) {
      console.error('Error deleting tax regime:', err);
      setError('Failed to delete tax regime.');
    }
  };

  const handleExport = () => {
    handleValuesExport('tax-regimes');
  };

  return (
    <div className="space-y-2">
      {error && (
        <div className="mx-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      <DataPage<TaxRegime>
        title="Tax Regimes"
        breadcrumbs={[{ label: 'Admin' }, { label: 'Master Data' }, { label: 'Tax Regimes' }]}
        data={data}
        columns={columns}
        onSave={handleSave}
        onDelete={handleDelete}
        onExport={handleExport}
        onFilter={() => fetchTaxRegimes()}
        searchKeys={['code', 'name', 'country']}
        defaultValues={{ status: 'Active', country: 'India' }}
        renderForm={(record, onChange) => (
          <>
            <div>
              <label className="block text-xs font-medium text-silver-mist mb-1">Code</label>
              <input
                type="text"
                value={record.code || ''}
                onChange={(e) => onChange('code', e.target.value)}
                className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                placeholder="e.g. IN_NEW"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-silver-mist mb-1">Name</label>
              <input
                type="text"
                value={record.name || ''}
                onChange={(e) => onChange('name', e.target.value)}
                className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                placeholder="e.g. New Tax Regime"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-silver-mist mb-1">Country</label>
              <input
                type="text"
                value={record.country || ''}
                onChange={(e) => onChange('country', e.target.value)}
                className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                placeholder="e.g. India"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-silver-mist mb-1">Status</label>
              <select
                value={record.status || 'Active'}
                onChange={(e) => onChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </>
        )}
      />
    </div>
  );
}
