'use client';

import React, { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';
import { handleValuesExport } from '@/lib/master-data-utils';

interface LeaveType {
  id: string;
  code: string;
  name: string;
  isPaid: boolean;
  status: 'Active' | 'Inactive';
}

const columns: Column<LeaveType>[] = [
  {
    key: 'code',
    header: 'Code',
    width: '100px',
    render: (row) => <span className="font-mono text-xs">{row.code}</span>,
  },
  { key: 'name', header: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
  {
    key: 'isPaid',
    header: 'Paid',
    width: '100px',
    render: (row) => (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${row.isPaid ? 'bg-neural-mint/10 text-neural-mint' : 'bg-silver-mist/10 text-silver-mist'}`}
      >
        {row.isPaid ? 'Yes' : 'No'}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    width: '100px',
    render: (row) => (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${row.status === 'Active' ? 'bg-neural-mint/10 text-neural-mint' : 'bg-silver-mist/10 text-silver-mist'}`}
      >
        {row.status}
      </span>
    ),
  },
];

export default function LeaveTypesPage() {
  const [data, setData] = useState<LeaveType[]>([]);
  const [_isLoading, setIsLoading] = useState(true);

  const fetchLeaveTypes = async (query?: string) => {
    try {
      const url = query
        ? `/api/master-data/leave-types?q=${encodeURIComponent(query)}`
        : '/api/master-data/leave-types';
      const response = await fetch(url);
      if (response.ok) setData(await response.json());
    } catch (error: any) {
      console.error('Failed to fetch leave types:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const handleSave = async (record: Partial<LeaveType>) => {
    try {
      const method = record.id ? 'PUT' : 'POST';
      const response = await fetch('/api/master-data/leave-types', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
      if (response.ok) fetchLeaveTypes();
    } catch (error: any) {
      console.error('Error saving leave type:', error);
    }
  };

  const handleDelete = async (record: LeaveType) => {
    if (confirm(`Are you sure you want to delete ${record.name}?`)) {
      try {
        const response = await fetch(`/api/master-data/leave-types?id=${record.id}`, {
          method: 'DELETE',
        });
        if (response.ok) fetchLeaveTypes();
      } catch (error: any) {
        console.error('Error deleting leave type:', error);
      }
    }
  };

  const handleExport = () => handleValuesExport('leave-types');
  const handleFilter = () => {
    const query = prompt('Search leave types:');
    if (query !== null) fetchLeaveTypes(query);
  };

  return (
    <DataPage<LeaveType>
      title="Leave Types"
      breadcrumbs={[{ label: 'Master Data' }, { label: 'Leave Types' }]}
      data={data}
      columns={columns}
      onSave={handleSave}
      onDelete={handleDelete}
      onExport={handleExport}
      onFilter={handleFilter}
      defaultValues={{ status: 'Active', isPaid: true }}
      renderForm={(record, onChange) => (
        <>
          <div>
            <label className="block text-xs font-medium text-silver-mist mb-1">Code</label>
            <input
              type="text"
              value={record.code || ''}
              onChange={(e) => onChange('code', e.target.value)}
              className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
              placeholder="e.g. CL"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-silver-mist mb-1">Name</label>
            <input
              type="text"
              value={record.name || ''}
              onChange={(e) => onChange('name', e.target.value)}
              className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
              placeholder="e.g. Casual Leave"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-silver-mist mb-1">Paid Leave</label>
            <select
              value={record.isPaid ? 'Yes' : 'No'}
              onChange={(e) => onChange('isPaid', e.target.value === 'Yes')}
              className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
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
  );
}
