'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataPage, ExportMenu, ErrorState, Skeleton } from '@aura/ui/components/ui';
import type { Column, ExportFormat } from '@aura/ui/components/ui';
import { Shield, ShieldOff, UserCog, RefreshCw, AlertCircle } from 'lucide-react';

interface Role {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
}

interface UserRole {
  id: string;
  roleId: string;
  assignedBy: string;
  assignedAt: string;
  expiresAt: string | null;
  role: Role;
}

interface User {
  id: string;
  email: string;
  tenantId: string;
  status: string;
  mfaEnabled: boolean;
  lastLogin: string | null;
  firstName?: string;
  lastName?: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
  };
  tenant?: {
    id: string;
    name: string;
    code: string;
  };
  createdAt: string;
  updatedAt?: string;
}

interface Tenant {
  id: string;
  name: string;
  code: string;
}

interface UserFormData extends Partial<User> {
  password?: string;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

export default function UsersPage() {
  const [data, setData] = useState<User[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, UserRole[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const fetchData = useCallback(async (pageNum = 1) => {
    try {
      setError(null);
      const [usersRes, tenantsRes, rolesRes] = await Promise.all([
        fetch(`/api/users?page=${pageNum}&limit=50`),
        fetch('/api/master-data/tenants'),
        fetch('/api/roles?limit=200'),
      ]);

      if (usersRes.ok) {
        const json = await usersRes.json();
        if (json.success) {
          setData(json.data);
          if (json.meta) {
            setPage(json.meta.page || 1);
            setTotalPages(json.meta.totalPages || 1);
          }
        } else {
          setError(json.error || 'Failed to load users');
        }
      } else {
        const json = await usersRes.json().catch(() => ({}));
        setError(json.error || `Failed to load users (${usersRes.status})`);
      }

      if (tenantsRes.ok) {
        const json = await tenantsRes.json();
        if (json.success) setTenants(json.data);
      }

      if (rolesRes.ok) {
        const json = await rolesRes.json();
        if (json.success) setRoles(json.data);
      }
    } catch (error: any) {
      setError(error.message || 'Network error while fetching data');
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUserRoles = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/roles`);
      const json = await res.json();
      if (json.success) {
        setUserRoles((prev) => ({ ...prev, [userId]: json.data }));
      }
    } catch {
      // ignore — roles are secondary
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const assignRole = async (userId: string, roleId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId }),
      });
      const json = await res.json();
      if (json.success) {
        showNotification('success', 'Role assigned successfully');
        fetchUserRoles(userId);
      } else {
        showNotification('error', json.error || 'Failed to assign role');
      }
    } catch {
      showNotification('error', 'Network error while assigning role');
    }
  };

  const removeRole = async (userId: string, roleId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/roles`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId }),
      });
      const json = await res.json();
      if (json.success) {
        showNotification('success', 'Role removed successfully');
        fetchUserRoles(userId);
      } else {
        showNotification('error', json.error || 'Failed to remove role');
      }
    } catch {
      showNotification('error', 'Network error while removing role');
    }
  };

  const columns: Column<User>[] = [
    {
      key: 'email',
      header: 'Email',
      render: (row) => (
        <div className="flex items-center gap-2">
          <UserCog className="w-4 h-4 text-silver-mist" />
          <span className="font-medium">{row.email}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '100px',
      render: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            row.status === 'Active'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : row.status === 'Suspended'
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: 'mfaEnabled',
      header: 'MFA',
      width: '60px',
      render: (row) => (
        <span className="flex justify-center">
          {row.mfaEnabled ? (
            <Shield className="w-4 h-4 text-emerald-500" title="MFA Enabled" />
          ) : (
            <ShieldOff className="w-4 h-4 text-silver-mist" title="MFA Disabled" />
          )}
        </span>
      ),
    },
    {
      key: 'tenantId',
      header: 'Tenant',
      render: (row) => (
        <span className="text-sm text-silver-mist">
          {row.tenant?.name || row.tenantId?.substring(0, 8) + '...' || 'Unknown'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created At',
      width: '180px',
      render: (row) => (
        <span className="text-xs text-silver-mist">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      width: '180px',
      render: (row) => (
        <span className="text-xs text-silver-mist">
          {row.lastLogin ? new Date(row.lastLogin).toLocaleDateString() : 'Never'}
        </span>
      ),
    },
  ];

  const handleSave = async (record: UserFormData) => {
    try {
      const isUpdate = !!record.id;
      const url = isUpdate ? `/api/users/${record.id}` : '/api/users';

      if (!isUpdate && !record.password) {
        showNotification('error', 'Password is required for new users');
        return;
      }

      const body: Record<string, unknown> = {};
      if (record.email) body.email = record.email;
      if (record.password) body.password = record.password;
      if (record.tenantId) body.tenantId = record.tenantId;
      if (record.status) body.status = record.status;
      body.firstName = record.firstName || null;
      body.lastName = record.lastName || null;
      body.mfaEnabled = !!record.mfaEnabled;

      const response = await fetch(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        showNotification(
          'success',
          isUpdate ? 'User updated successfully' : 'User created successfully'
        );
        fetchData(page);
      } else {
        const error = await response.json();
        showNotification('error', error.error || 'Failed to save user');
      }
    } catch (error: any) {
      showNotification('error', 'Network error while saving user');
      console.error('Error saving user:', error);
    }
  };

  const handleDelete = async (record: User) => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${record.email}? This will deactivate their account.`
      )
    )
      return;

    try {
      const response = await fetch(`/api/users/${record.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showNotification('success', 'User deactivated successfully');
        fetchData(page);
      } else {
        const error = await response.json();
        showNotification('error', error.error || 'Failed to delete user');
      }
    } catch (error: any) {
      showNotification('error', 'Network error while deleting user');
      console.error('Error deleting user:', error);
    }
  };

  const handleExport = async (format: ExportFormat): Promise<Blob | void> => {
    if (format === 'csv') {
      const headers = ['Email', 'Status', 'MFA', 'Tenant', 'Created At', 'Last Login'];
      const rows = data.map((u) => [
        u.email,
        u.status,
        u.mfaEnabled ? 'Yes' : 'No',
        u.tenant?.name || u.tenantId || '',
        new Date(u.createdAt).toISOString(),
        u.lastLogin ? new Date(u.lastLogin).toISOString() : '',
      ]);

      const csv = [
        headers.join(','),
        ...rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(',')),
      ].join('\n');
      return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    }

    showNotification('error', `${format.toUpperCase()} export not yet implemented`);
  };

  const renderForm = (record: UserFormData, onChange: (field: keyof User, value: any) => void) => {
    const isUpdate = !!record.id;
    const currentUserRoles = record.id ? userRoles[record.id] || [] : [];

    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-silver-mist mb-1">First Name</label>
            <input
              type="text"
              value={record.firstName || ''}
              onChange={(e) => onChange('firstName' as keyof User, e.target.value)}
              className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
              placeholder="John"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-silver-mist mb-1">Last Name</label>
            <input
              type="text"
              value={record.lastName || ''}
              onChange={(e) => onChange('lastName' as keyof User, e.target.value)}
              className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
              placeholder="Doe"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-silver-mist mb-1">
            Email <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            value={record.email || ''}
            onChange={(e) => onChange('email' as keyof User, e.target.value)}
            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
            placeholder="user@example.com"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-silver-mist mb-1">
            Password{' '}
            {isUpdate ? (
              '(Leave blank to keep unchanged)'
            ) : (
              <span className="text-rose-500">*</span>
            )}
          </label>
          <input
            type="password"
            value={(record as UserFormData).password || ''}
            onChange={(e) => onChange('password' as keyof User, e.target.value)}
            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
            placeholder={isUpdate ? 'Leave blank to keep unchanged' : '********'}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-silver-mist mb-1">Tenant</label>
            <select
              value={record.tenantId || ''}
              onChange={(e) => onChange('tenantId' as keyof User, e.target.value)}
              className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
            >
              <option value="" disabled>
                Select Tenant
              </option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-silver-mist mb-1">Status</label>
            <select
              value={record.status || 'Active'}
              onChange={(e) => onChange('status' as keyof User, e.target.value)}
              className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="mfaEnabled"
            checked={!!record.mfaEnabled}
            onChange={(e) => onChange('mfaEnabled' as keyof User, e.target.checked)}
            className="w-4 h-4 rounded border-cloud text-celestial-indigo focus:ring-celestial-indigo/50"
          />
          <label htmlFor="mfaEnabled" className="text-xs font-medium text-silver-mist">
            Enable Multi-Factor Authentication (MFA)
          </label>
        </div>

        {isUpdate && (
          <div className="border-t border-cloud dark:border-nebula-purple/50 pt-4 mt-4">
            <label className="block text-xs font-medium text-silver-mist mb-2">
              Role Assignments
            </label>

            {currentUserRoles.length > 0 ? (
              <div className="space-y-1.5 mb-3">
                {currentUserRoles.map((ur) => (
                  <div
                    key={ur.id}
                    className="flex items-center justify-between px-3 py-1.5 bg-pearl dark:bg-stellar-blue rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-celestial-indigo" />
                      <span className="font-medium">{ur.role.name}</span>
                      <span className="text-[10px] text-silver-mist">({ur.role.code})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRole(record.id!, ur.roleId)}
                      className="text-[10px] text-rose-500 hover:text-rose-700 font-medium px-1.5 py-0.5 rounded hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-silver-mist mb-3 italic">No roles assigned</p>
            )}

            <div className="flex gap-2">
              <select
                id="newRole"
                className="flex-1 px-3 py-1.5 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                defaultValue=""
              >
                <option value="" disabled>
                  Select a role...
                </option>
                {roles
                  .filter((r) => !currentUserRoles.some((ur) => ur.roleId === r.id))
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.code})
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={(e) => {
                  const select = e.currentTarget.parentElement?.querySelector(
                    '#newRole'
                  ) as HTMLSelectElement;
                  if (select?.value) {
                    assignRole(record.id!, select.value);
                    select.value = '';
                  }
                }}
                className="px-3 py-1.5 text-xs font-medium bg-celestial-indigo/10 text-celestial-indigo hover:bg-celestial-indigo/20 rounded-lg transition-colors"
              >
                Assign
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-gray-200/80 animate-pulse rounded" />
        <div className="space-y-3">
          <Skeleton variant="table-row" rows={8} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          title="Failed to load users"
          message={error}
          onRetry={() => {
            setIsLoading(true);
            fetchData();
          }}
        />
      </div>
    );
  }

  return (
    <>
      {notification && (
        <div
          className={`fixed top-4 right-4 z-[100] px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium transition-all animate-in ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'error' && <AlertCircle className="w-4 h-4" />}
            {notification.message}
          </div>
        </div>
      )}

      <DataPage<User>
        title="Users"
        breadcrumbs={[{ label: 'Admin' }, { label: 'User Management' }, { label: 'Users' }]}
        data={data}
        columns={columns}
        onSave={handleSave as (data: Partial<User>) => void}
        onDelete={handleDelete}
        onImport={() => showNotification('error', 'Import functionality coming soon!')}
        defaultValues={{}}
        searchKeys={['email', 'firstName', 'lastName', 'status', 'tenant.name']}
        searchPlaceholder="Search by email, name, or status..."
        pageSize={50}
        renderForm={renderForm}
        toolbarSlot={
          <ExportMenu
            onExport={handleExport}
            filename="users-export"
            formats={['csv']}
            rowCount={data.length}
          />
        }
      />
    </>
  );
}
