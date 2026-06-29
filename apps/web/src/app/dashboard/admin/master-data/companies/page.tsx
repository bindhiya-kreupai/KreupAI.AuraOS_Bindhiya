'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';
import { handleValuesExport } from '@/lib/master-data-utils';

interface Company {
  id: string;
  code: string;
  name: string;
  taxId: string;
}

const columns: Column<Company>[] = [
  {
    key: 'code',
    header: 'Code',
    width: '120px',
    render: (row) => <span className="font-mono text-xs">{row.code}</span>,
  },
  {
    key: 'name',
    header: 'Company Name',
    render: (row) => <span className="font-medium">{row.name}</span>,
  },
  {
    key: 'taxId',
    header: 'Tax ID',
    render: (row) => <span className="text-silver-mist text-xs font-mono">{row.taxId}</span>,
  },
];

export default function CompaniesPage() {
  const [data, setData] = useState<Company[]>([]);

  const fetchCompanies = useCallback(async (search?: string) => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('page', '1');
      params.set('limit', '100');
      params.set('status', 'Active');
      const qs = params.toString();
      const url = qs ? `/api/master-data/companies?${qs}` : '/api/master-data/companies';
      const response = await fetch(url);
      if (response.ok) {
        const json = await response.json();
        if (json.success && Array.isArray(json.data)) {
          setData(json.data);
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch companies:', error);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleSave = async (record: Partial<Company>) => {
    try {
      const isUpdate = !!record.id;
      const response = await fetch(
        isUpdate ? `/api/master-data/companies/${record.id}` : '/api/master-data/companies',
        {
          method: isUpdate ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        }
      );

      if (response.ok) {
        fetchCompanies();
      } else {
        const errorData = await response.json();
        console.error('Failed to save company:', errorData);
        alert(`Failed to save company: ${errorData.error || errorData.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error saving company:', error);
      alert('Error saving company');
    }
  };

  const handleDelete = async (record: Company) => {
    if (confirm(`Are you sure you want to delete ${record.name}?`)) {
      try {
        const response = await fetch(`/api/master-data/companies/${record.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchCompanies();
        } else {
          alert('Failed to delete company');
        }
      } catch (error: any) {
        console.error('Error deleting company:', error);
        alert('Error deleting company');
      }
    }
  };

  const handleExport = () => {
    handleValuesExport('companies');
  };

  const handleImport = () => {
    alert('Import functionality coming soon!');
  };

  const handleFilter = () => {
    const query = prompt('Search companies:');
    if (query !== null) {
      fetchCompanies(query);
    }
  };

  return (
    <DataPage<Company>
      title="Companies"
      breadcrumbs={[{ label: 'Admin' }, { label: 'Master Data' }, { label: 'Companies' }]}
      data={data}
      columns={columns}
      onSave={handleSave}
      onDelete={handleDelete}
      onExport={handleExport}
      onImport={handleImport}
      onFilter={handleFilter}
      defaultValues={{}}
      renderForm={(record, onChange) => (
        <>
          <div>
            <label className="block text-xs font-medium text-silver-mist mb-1">Company Code</label>
            <input
              type="text"
              value={record.code || ''}
              onChange={(e) => onChange('code', e.target.value)}
              className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
              placeholder="e.g. US_HQ"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-silver-mist mb-1">Company Name</label>
            <input
              type="text"
              value={record.name || ''}
              onChange={(e) => onChange('name', e.target.value)}
              className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
              placeholder="e.g. KreupAI Inc."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-silver-mist mb-1">
              Tax ID / Registration No.
            </label>
            <input
              type="text"
              value={record.taxId || ''}
              onChange={(e) => onChange('taxId', e.target.value)}
              className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
              placeholder="e.g. EIN-123456789"
            />
          </div>
        </>
      )}
    />
  );
}
