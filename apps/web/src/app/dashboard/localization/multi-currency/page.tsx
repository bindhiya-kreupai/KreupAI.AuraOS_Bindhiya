'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  status: 'Active' | 'Inactive';
}

const columns: Column<Currency>[] = [
  {
    key: 'code',
    header: 'Code',
    width: '100px',
    render: (row) => <span className="font-mono text-xs">{row.code}</span>,
  },
  { key: 'name', header: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
  {
    key: 'symbol',
    header: 'Symbol',
    width: '100px',
    render: (row) => <span className="font-mono text-lg">{row.symbol}</span>,
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

export default function MultiCurrencyPage() {
  const [data, setData] = useState<Currency[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrencies = useCallback(async (query?: string) => {
    try {
      setError(null);
      const url = query
        ? `/api/master-data/currencies?search=${encodeURIComponent(query)}`
        : '/api/master-data/currencies';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to load currencies');
      }
      const result = await response.json();
      setData(result.data ?? []);
    } catch (err) {
      console.error('Failed to fetch currencies:', err);
      setError('Unable to load currencies. Please try again.');
    }
  }, []);

  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);

  const handleSave = async (record: Partial<Currency>) => {
    try {
      const method = record.id ? 'PUT' : 'POST';
      const url = record.id
        ? `/api/master-data/currencies/${record.id}`
        : '/api/master-data/currencies';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
      if (!response.ok) {
        throw new Error('Save failed');
      }
      await fetchCurrencies();
    } catch (err) {
      console.error('Error saving currency:', err);
      setError('Failed to save currency.');
    }
  };

  const handleDelete = async (record: Currency) => {
    try {
      const response = await fetch(`/api/master-data/currencies/${record.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Delete failed');
      }
      await fetchCurrencies();
    } catch (err) {
      console.error('Error deleting currency:', err);
      setError('Failed to delete currency.');
    }
  };

  return (
    <div className="space-y-2">
      {error && (
        <div className="mx-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      <DataPage<Currency>
        title="Multi-Currency"
        description="Manage currencies used across the platform for payroll, expenses, and reporting."
        breadcrumbs={[{ label: 'Localization' }, { label: 'Multi-Currency' }]}
        data={data}
        columns={columns}
        onSave={handleSave}
        onDelete={handleDelete}
        onFilter={() => fetchCurrencies()}
        defaultValues={{ status: 'Active' }}
        searchKeys={['code', 'name', 'symbol']}
        addButtonText="Add Currency"
        renderForm={(record, onChange) => (
          <>
            <div>
              <label className="block text-xs font-medium text-silver-mist mb-1">Code</label>
              <input
                type="text"
                maxLength={3}
                value={record.code || ''}
                onChange={(e) => onChange('code', e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                placeholder="e.g. USD"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-silver-mist mb-1">Name</label>
              <input
                type="text"
                value={record.name || ''}
                onChange={(e) => onChange('name', e.target.value)}
                className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                placeholder="e.g. US Dollar"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-silver-mist mb-1">Symbol</label>
              <input
                type="text"
                maxLength={5}
                value={record.symbol || ''}
                onChange={(e) => onChange('symbol', e.target.value)}
                className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                placeholder="e.g. $"
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
