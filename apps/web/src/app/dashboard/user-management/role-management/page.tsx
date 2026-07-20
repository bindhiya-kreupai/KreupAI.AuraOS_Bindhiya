'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';
import { Shield, ChevronDown, ChevronRight } from 'lucide-react';

interface Role {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
  usersCount: number;
  permissionIds?: string[];
}

interface RoleApiItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
  _count: {
    userRoles: number;
    permissions: number;
  };
  permissions?: {
    permission: {
      id: string;
      resource: string;
      action: string;
      description?: string;
    };
  }[];
}

interface PermissionItem {
  id: string;
  resource: string;
  action: string;
  description: string | null;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

function PermissionPicker({
  selectedIds,
  onChange,
  disabled,
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}) {
  const [permissions, setPermissions] = useState<Record<string, PermissionItem[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [expandedResources, setExpandedResources] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/permissions?grouped=true')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setPermissions(json.data);
          setExpandedResources(new Set(Object.keys(json.data)));
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const toggleResource = (resource: string) => {
    setExpandedResources((prev) => {
      const next = new Set(prev);
      if (next.has(resource)) next.delete(resource);
      else next.add(resource);
      return next;
    });
  };

  const togglePermission = (id: string) => {
    if (disabled) return;
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const toggleAllInResource = (resource: string) => {
    if (disabled) return;
    const resourcePermIds = (permissions[resource] || []).map((p) => p.id);
    const allSelected = resourcePermIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      onChange(selectedIds.filter((id) => !resourcePermIds.includes(id)));
    } else {
      onChange([...new Set([...selectedIds, ...resourcePermIds])]);
    }
  };

  if (isLoading) {
    return <div className="text-xs text-silver-mist py-2">Loading permissions...</div>;
  }

  const resourceKeys = Object.keys(permissions).sort();

  if (resourceKeys.length === 0) {
    return (
      <div className="text-xs text-silver-mist py-2">No permissions available in the system.</div>
    );
  }

  return (
    <div className="space-y-1 max-h-64 overflow-y-auto border border-cloud dark:border-nebula-purple/30 rounded-lg p-2">
      {resourceKeys.map((resource) => {
        const perms = permissions[resource];
        const resourcePermIds = perms.map((p) => p.id);
        const selectedCount = resourcePermIds.filter((id) => selectedIds.includes(id)).length;
        const allSelected = selectedCount === resourcePermIds.length && resourcePermIds.length > 0;
        const isExpanded = expandedResources.has(resource);

        return (
          <div key={resource}>
            <div
              className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer transition-colors ${
                allSelected
                  ? 'bg-celestial-indigo/10 text-celestial-indigo'
                  : 'hover:bg-gray-50 dark:hover:bg-stellar-blue/50 text-ink-black dark:text-pearl'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => toggleResource(resource)}
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-3 h-3 flex-shrink-0" />
              )}
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleAllInResource(resource);
                }}
                disabled={disabled}
                className="w-3.5 h-3.5 rounded border-cloud text-celestial-indigo focus:ring-celestial-indigo/50"
                onClick={(e) => e.stopPropagation()}
              />
              <Shield className="w-3 h-3 flex-shrink-0 text-celestial-indigo" />
              <span className="font-medium flex-1">{resource}</span>
              <span className="text-[10px] text-silver-mist">
                {selectedCount}/{perms.length}
              </span>
            </div>
            {isExpanded && (
              <div className="ml-7 space-y-0.5">
                {perms.map((perm) => (
                  <label
                    key={perm.id}
                    className={`flex items-center gap-2 px-2 py-1 rounded text-xs cursor-pointer transition-colors ${
                      selectedIds.includes(perm.id)
                        ? 'bg-celestial-indigo/5 text-celestial-indigo'
                        : 'hover:bg-gray-50 dark:hover:bg-stellar-blue/50 text-silver-mist'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(perm.id)}
                      onChange={() => togglePermission(perm.id)}
                      disabled={disabled}
                      className="w-3.5 h-3.5 rounded border-cloud text-celestial-indigo focus:ring-celestial-indigo/50"
                    />
                    <span className="font-mono text-[11px]">{perm.action}</span>
                    {perm.description && (
                      <span className="text-[10px] text-silver-mist truncate">
                        {perm.description}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function RolesPage() {
  const [data, setData] = useState<Role[]>([]);
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
      setIsLoading(true);
      const res = await fetch(`/api/roles?page=${pageNum}&limit=50`);

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          const roles: Role[] = (json.data || []).map((item: RoleApiItem) => ({
            id: item.id,
            code: item.code || '',
            name: item.name,
            description: item.description,
            isSystem: item.isSystem,
            isActive: item.isActive,
            usersCount: item._count?.userRoles || 0,
            permissionIds: item.permissions?.map((p) => p.permission.id) || [],
          }));
          setData(roles);
          if (json.pagination) {
            setPage(json.pagination.page || 1);
            setTotalPages(json.pagination.totalPages || 1);
          }
        } else {
          setError(json.error || 'Failed to load roles');
        }
      } else {
        const json = await res.json().catch(() => ({}));
        setError(json.error || `Failed to load roles (${res.status})`);
      }
    } catch (error: any) {
      setError(error.message || 'Network error while fetching roles');
      console.error('Failed to fetch roles:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (record: Partial<Role>) => {
    try {
      const isUpdate = !!record.id;
      const url = isUpdate ? `/api/roles/${record.id}` : '/api/roles';

      const body: Record<string, unknown> = {};
      if (record.code) body.code = record.code;
      if (record.name) body.name = record.name;
      if (record.description !== undefined) body.description = record.description;
      if (record.isActive !== undefined) body.isActive = record.isActive;
      if (record.permissionIds) body.permissionIds = record.permissionIds;

      const response = await fetch(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        showNotification(
          'success',
          isUpdate ? 'Role updated successfully' : 'Role created successfully'
        );
        fetchData(page);
      } else {
        const err = await response.json();
        showNotification('error', err.error || 'Failed to save role');
      }
    } catch (error: any) {
      showNotification('error', 'Network error while saving role');
      console.error('Error saving role:', error);
    }
  };

  const handleDelete = async (record: Role) => {
    if (!window.confirm(`Are you sure you want to delete ${record.name}?`)) return;

    try {
      const response = await fetch(`/api/roles/${record.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showNotification('success', 'Role deleted successfully');
        fetchData(page);
      } else {
        const err = await response.json();
        showNotification('error', err.error || 'Failed to delete role');
      }
    } catch (error: any) {
      showNotification('error', 'Network error while deleting role');
      console.error('Error deleting role:', error);
    }
  };

  const columns: Column<Role>[] = [
    {
      key: 'name',
      header: 'Role Name',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.name}</span>
          {row.isSystem && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-celestial-indigo/10 text-celestial-indigo font-medium">
              System
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'code',
      header: 'Code',
      width: '100px',
      render: (row) => <span className="text-xs font-mono text-silver-mist">{row.code}</span>,
    },
    {
      key: 'description',
      header: 'Description',
      render: (row) => <span className="text-sm text-silver-mist">{row.description || '-'}</span>,
    },
    {
      key: 'usersCount',
      header: 'Users',
      width: '80px',
      render: (row) => <span className="text-sm text-silver-mist">{row.usersCount}</span>,
    },
    {
      key: 'isActive',
      header: 'Status',
      width: '120px',
      render: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            row.isActive
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
          }`}
        >
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-rose-500 text-lg font-medium">Failed to load roles</div>
        <p className="text-silver-mist text-sm">{error}</p>
        <button
          onClick={() => fetchData()}
          className="px-4 py-2 bg-celestial-indigo hover:bg-celestial-indigo/90 text-white rounded-lg text-sm font-medium transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
            notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
          }`}
        >
          {notification.message}
        </div>
      )}
      <DataPage<Role>
        title="Role Management"
        breadcrumbs={[{ label: 'Admin' }, { label: 'User Management' }, { label: 'Roles' }]}
        data={data}
        columns={columns}
        onSave={handleSave}
        onDelete={handleDelete}
        searchKeys={['name', 'code', 'description']}
        addButtonText="Add Role"
        defaultValues={{
          code: '',
          name: '',
          description: '',
          isActive: true,
          usersCount: 0,
          permissionIds: [],
        }}
        renderForm={(record, onChange) => (
          <>
            <div>
              <label className="block text-xs font-medium text-silver-mist mb-1">Code</label>
              <input
                type="text"
                value={record.code || ''}
                onChange={(e) =>
                  onChange('code', e.target.value.toUpperCase().replace(/[^A-Z_]/g, ''))
                }
                disabled={!!record.id}
                className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="e.g. ADMIN"
              />
              {record.id ? (
                <p className="text-[10px] text-celestial-indigo mt-1">
                  Code cannot be changed after creation.
                </p>
              ) : (
                <p className="text-[10px] text-silver-mist mt-1">
                  Uppercase letters and underscores only (e.g. HR_MANAGER)
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-silver-mist mb-1">Role Name</label>
              <input
                type="text"
                value={record.name || ''}
                onChange={(e) => onChange('name', e.target.value)}
                className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                placeholder="e.g. Admin"
              />
            </div>
            {record.isSystem && (
              <div className="px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg text-xs text-amber-700 dark:text-amber-400">
                System role — code and system flag cannot be changed.
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-silver-mist mb-1">Description</label>
              <textarea
                value={record.description || ''}
                onChange={(e) => onChange('description', e.target.value)}
                className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                placeholder="Role description..."
                rows={3}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-silver-mist mb-1">Status</label>
              <select
                value={record.isActive === false ? 'Inactive' : 'Active'}
                onChange={(e) => onChange('isActive', e.target.value === 'Active')}
                className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-silver-mist mb-1">
                Permissions
                {(record.permissionIds?.length || 0) > 0 && (
                  <span className="ml-1 text-celestial-indigo">
                    ({record.permissionIds!.length} selected)
                  </span>
                )}
              </label>
              <PermissionPicker
                selectedIds={(record.permissionIds as string[]) || []}
                onChange={(ids) => onChange('permissionIds' as any, ids)}
                disabled={!!record.isSystem}
              />
              {record.isSystem && (
                <p className="text-[10px] text-silver-mist mt-1">
                  System role permissions are managed by the system.
                </p>
              )}
            </div>
          </>
        )}
      />
    </>
  );
}
