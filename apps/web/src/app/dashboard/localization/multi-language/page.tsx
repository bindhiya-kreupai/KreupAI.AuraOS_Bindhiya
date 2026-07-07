'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';

interface Language {
  id: string;
  code: string;
  name: string;
  isRTL: boolean;
  status: 'Active' | 'Inactive';
}

const columns: Column<Language>[] = [
  {
    key: 'code',
    header: 'Code',
    width: '100px',
    render: (row) => <span className="font-mono text-xs">{row.code}</span>,
  },
  { key: 'name', header: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
  {
    key: 'isRTL',
    header: 'Direction',
    width: '120px',
    render: (row) => (
      <span className="text-xs font-medium">{row.isRTL ? 'RTL (من اليمين)' : 'LTR'}</span>
    ),
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

export default function MultiLanguagePage() {
  const [data, setData] = useState<Language[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchLanguages = useCallback(async (query?: string) => {
    try {
      setError(null);
      const url = query
        ? `/api/master-data/languages?search=${encodeURIComponent(query)}`
        : '/api/master-data/languages';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to load languages');
      }
      const result = await response.json();
      setData(result.data ?? []);
    } catch (err) {
      console.error('Failed to fetch languages:', err);
      setError('Unable to load languages. Please try again.');
    }
  }, []);

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  const handleSave = async (record: Partial<Language>) => {
    try {
      const method = record.id ? 'PUT' : 'POST';
      const url = record.id
        ? `/api/master-data/languages/${record.id}`
        : '/api/master-data/languages';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
      if (!response.ok) {
        throw new Error('Save failed');
      }
      await fetchLanguages();
    } catch (err) {
      console.error('Error saving language:', err);
      setError('Failed to save language.');
    }
  };

  const handleDelete = async (record: Language) => {
    try {
      const response = await fetch(`/api/master-data/languages/${record.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Delete failed');
      }
      await fetchLanguages();
    } catch (err) {
      console.error('Error deleting language:', err);
      setError('Failed to delete language.');
    }
  };

  return (
    <div className="space-y-2">
      {error && (
        <div className="mx-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      <DataPage<Language>
        title="Multi-Language"
        description="Manage supported UI languages and their reading direction (LTR / RTL)."
        breadcrumbs={[{ label: 'Localization' }, { label: 'Multi-Language' }]}
        data={data}
        columns={columns}
        onSave={handleSave}
        onDelete={handleDelete}
        onFilter={() => fetchLanguages()}
        defaultValues={{ status: 'Active', isRTL: false }}
        searchKeys={['code', 'name']}
        addButtonText="Add Language"
        renderForm={(record, onChange) => (
          <>
            <div>
              <label className="block text-xs font-medium text-silver-mist mb-1">Code</label>
              <input
                type="text"
                maxLength={5}
                value={record.code || ''}
                onChange={(e) => onChange('code', e.target.value.toLowerCase())}
                className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                placeholder="e.g. ar"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-silver-mist mb-1">Name</label>
              <input
                type="text"
                value={record.name || ''}
                onChange={(e) => onChange('name', e.target.value)}
                className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                placeholder="e.g. Arabic"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-silver-mist cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!record.isRTL}
                  onChange={(e) => onChange('isRTL', e.target.checked)}
                  className="accent-celestial-indigo"
                />
                Right-to-Left (RTL) script
              </label>
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
