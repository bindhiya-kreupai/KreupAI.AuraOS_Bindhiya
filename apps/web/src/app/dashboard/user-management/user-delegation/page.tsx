'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';
import { toast } from 'sonner';

interface UserDelegation {
  id: string;
  delegatorId: string;
  delegator?: { id: string; email: string };
  delegateeId: string;
  delegatee?: { id: string; email: string };
  role: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export default function UserDelegationPage() {
  const [data, setData] = useState<UserDelegation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [delegationsRes, usersRes] = await Promise.all([
        fetch('/api/user-delegation'),
        fetch('/api/user-delegation?candidates=true'),
      ]);

      if (delegationsRes.ok) {
        const dJson = await delegationsRes.json();
        setData(dJson.data || []);
      } else {
        setError('Failed to load delegations');
      }

      if (usersRes.ok) {
        const uJson = await usersRes.json();
        setUsers(uJson.data || []);
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

  const columns: Column<UserDelegation>[] = [
    {
      key: 'delegator',
      header: 'Delegator (From)',
      render: (row) => (
        <span className="font-medium">{row.delegator?.email || row.delegatorId}</span>
      ),
    },
    {
      key: 'delegatee',
      header: 'Delegatee (To)',
      render: (row) => (
        <span className="font-medium">{row.delegatee?.email || row.delegateeId}</span>
      ),
    },
    { key: 'role', header: 'Role' },
    {
      key: 'startDate',
      header: 'Start Date',
      width: '120px',
      render: (row) => (
        <span className="text-xs text-silver-mist">
          {new Date(row.startDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'endDate',
      header: 'End Date',
      width: '120px',
      render: (row) => (
        <span className="text-xs text-silver-mist">
          {new Date(row.endDate).toLocaleDateString()}
        </span>
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
              : row.status === 'Scheduled'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  const handleSave = async (record: Partial<UserDelegation>) => {
    const isEdit = !!record.id;
    const url = isEdit ? `/api/user-delegation/${record.id}` : '/api/user-delegation';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || `Failed to ${isEdit ? 'update' : 'create'} delegation`);
        return;
      }

      await fetchData();
      toast.success(`Delegation ${isEdit ? 'updated' : 'created'} successfully`);
    } catch {
      toast.error('Network error. Please try again.');
    }
  };

  const handleDelete = async (record: UserDelegation) => {
    if (!confirm('Are you sure you want to delete this delegation?')) return;
    try {
      const res = await fetch(`/api/user-delegation/${record.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Failed to delete delegation');
        return;
      }
      await fetchData();
      toast.success('Delegation deleted successfully');
    } catch {
      toast.error('Network error. Please try again.');
    }
  };

  const getUserLabel = (user?: User) => {
    if (!user) return '';
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
    return name ? `${name} (${user.email})` : user.email;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-celestial-indigo" />
        <span className="ml-2 text-sm text-silver-mist">Loading delegations...</span>
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
    <DataPage<UserDelegation>
      title="User Delegation"
      singularTitle="User Delegation"
      breadcrumbs={[{ label: 'Admin' }, { label: 'User Management' }, { label: 'Delegation' }]}
      data={data}
      columns={columns}
      onSave={handleSave}
      onDelete={handleDelete}
      defaultValues={{ role: 'Admin', status: 'Scheduled' }}
      renderForm={(record, onChange) => (
        <>
          <div>
            <label className="block text-xs font-medium text-silver-mist mb-1">
              Delegator (From)
            </label>
            <select
              value={record.delegatorId || ''}
              onChange={(e) => onChange('delegatorId', e.target.value)}
              disabled={!!record.id}
              className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="" disabled>
                Select User
              </option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {getUserLabel(u)}
                </option>
              ))}
            </select>
            {record.id && (
              <p className="text-xs text-silver-mist mt-1">
                Cannot change delegator after creation
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-silver-mist mb-1">
              Delegatee (To)
            </label>
            <select
              value={record.delegateeId || ''}
              onChange={(e) => onChange('delegateeId', e.target.value)}
              disabled={!!record.id}
              className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="" disabled>
                Select User
              </option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {getUserLabel(u)}
                </option>
              ))}
            </select>
            {record.id && (
              <p className="text-xs text-silver-mist mt-1">
                Cannot change delegatee after creation
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-silver-mist mb-1">
              Role to Delegate
            </label>
            <input
              type="text"
              value={record.role || ''}
              onChange={(e) => onChange('role', e.target.value)}
              className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
              placeholder="e.g. Admin"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-silver-mist mb-1">Start Date</label>
              <input
                type="date"
                value={
                  record.startDate ? new Date(record.startDate).toISOString().split('T')[0] : ''
                }
                onChange={(e) => onChange('startDate', e.target.value)}
                className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-silver-mist mb-1">End Date</label>
              <input
                type="date"
                value={record.endDate ? new Date(record.endDate).toISOString().split('T')[0] : ''}
                onChange={(e) => onChange('endDate', e.target.value)}
                className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-silver-mist mb-1">Reason</label>
            <textarea
              value={record.reason || ''}
              onChange={(e) => onChange('reason', e.target.value)}
              className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
              rows={2}
            />
          </div>
        </>
      )}
    />
  );
}
