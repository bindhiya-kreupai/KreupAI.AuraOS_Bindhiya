'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';

interface UserDeactivation {
  id: string;
  userId: string;
  user?: { email: string; firstName?: string; lastName?: string; status?: string };
  deactivator?: { email: string; firstName?: string; lastName?: string };
  reason: string;
  deactivatedBy: string;
  deactivatedAt: string;
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status?: string;
}

function formatName(u: { email: string; firstName?: string; lastName?: string }) {
  const name = [u.firstName, u.lastName].filter(Boolean).join(' ');
  return name || u.email;
}

export default function UserDeactivationPage() {
  const router = useRouter();
  const [data, setData] = useState<UserDeactivation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [deactivationsRes, usersRes] = await Promise.all([
        fetch('/api/user-deactivation'),
        fetch('/api/users?limit=100'),
      ]);

      if (deactivationsRes.ok) {
        const dJson = await deactivationsRes.json();
        setData(dJson.data || []);
      } else {
        setError('Failed to load deactivation records');
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

  const columns: Column<UserDeactivation>[] = [
    {
      key: 'user',
      header: 'User',
      render: (row) => (
        <span className="font-medium">{row.user ? formatName(row.user) : row.userId}</span>
      ),
    },
    { key: 'reason', header: 'Reason' },
    {
      key: 'deactivatedBy',
      header: 'Deactivated By',
      render: (row) => <span>{row.deactivator ? formatName(row.deactivator) : '—'}</span>,
    },
    {
      key: 'deactivatedAt',
      header: 'Date',
      width: '180px',
      render: (row) => (
        <span className="text-xs text-silver-mist">
          {new Date(row.deactivatedAt).toLocaleString()}
        </span>
      ),
    },
  ];

  const handleSave = async (record: Partial<UserDeactivation>) => {
    if (!record.userId) {
      alert('Please select a user to deactivate');
      return;
    }

    const target = users.find((u) => u.id === record.userId);
    const displayName = target ? formatName(target) : record.userId;

    if (
      !confirm(
        `Are you sure you want to deactivate "${displayName}"? This action will revoke their sessions.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch('/api/user-deactivation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: record.userId,
          reason: record.reason,
        }),
      });

      if (response.ok) {
        await fetchData();
        router.refresh();
      } else {
        const err = await response.json().catch(() => ({}));
        alert(err.error || 'Failed to deactivate user');
      }
    } catch {
      alert('Network error. Please try again.');
    }
  };

  const activeUsers = users.filter((u) => u.status !== 'Inactive');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-celestial-indigo" />
        <span className="ml-2 text-sm text-silver-mist">Loading deactivation records...</span>
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
    <DataPage<UserDeactivation>
      title="User Deactivation"
      singularTitle="Deactivation"
      breadcrumbs={[{ label: 'Admin' }, { label: 'User Management' }, { label: 'Deactivation' }]}
      data={data}
      columns={columns}
      onSave={handleSave}
      defaultValues={{ reason: '' }}
      renderForm={(record, onChange) => (
        <>
          <div>
            <label className="block text-xs font-medium text-silver-mist mb-1">
              User to Deactivate
            </label>
            <select
              value={record.userId || ''}
              onChange={(e) => onChange('userId', e.target.value)}
              className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
            >
              <option value="" disabled>
                Select User
              </option>
              {activeUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {formatName(u)} ({u.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-silver-mist mb-1">Reason</label>
            <textarea
              value={record.reason || ''}
              onChange={(e) => onChange('reason', e.target.value)}
              className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
              rows={3}
              placeholder="Reason for deactivation..."
            />
          </div>
        </>
      )}
    />
  );
}
