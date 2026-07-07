'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Users, Shield, Plus, Edit3, X, Save, Trash2 } from 'lucide-react';
import { RoleService, PermissionService } from '@/app/dashboard/security/services';
import { ToastContainer } from '@/app/dashboard/security/components/Toast';
import type { Toast as ToastType, Permission } from '@/app/dashboard/security/types';

interface RoleRow {
  roleId: string;
  roleName: string;
  description?: string;
  permissions?: Permission[];
  assignedUsers?: number;
  isSystem?: boolean;
  isActive?: boolean;
}

const permKey = (p: { resource: string; action: string }) => `${p.resource}:${p.action}`;

export default function RoleBasedAccessPage() {
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<RoleRow | null>(null);
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const [saving, setSaving] = useState(false);

  // Create / edit form state
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');

  const pushToast = useCallback((type: ToastType['type'], message: string) => {
    setToasts((prev) => [...prev, { id: crypto.randomUUID(), type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fetchData = useCallback(
    async (preserveSelectedId?: string) => {
      try {
        setLoading(true);
        const [roleResult, permResult] = await Promise.all([
          RoleService.getAll(),
          PermissionService.getAll(),
        ]);
        const list = roleResult as unknown as RoleRow[];
        setRoles(list);
        setPermissions(permResult);
        if (list.length > 0) {
          const next =
            (preserveSelectedId && list.find((r) => r.roleId === preserveSelectedId)) || list[0];
          setSelectedRole(next);
        } else {
          setSelectedRole(null);
        }
      } catch (error: any) {
        pushToast('error', 'Failed to load roles');
      } finally {
        setLoading(false);
      }
    },
    [pushToast]
  );

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Distinct resources across known permissions (for the matrix rows).
  const resources = Array.from(new Set(permissions.map((p) => p.resource))).sort();
  const actions = ['read', 'write', 'delete'];

  const roleHasPerm = (role: RoleRow | null, resource: string, action: string) =>
    !!role?.permissions?.some((p) => p.resource === resource && p.action === action);

  const openCreate = () => {
    setFormName('');
    setFormDesc('');
    setShowCreate(true);
    setEditing(false);
  };

  const openEdit = () => {
    if (!selectedRole) return;
    setFormName(selectedRole.roleName);
    setFormDesc(selectedRole.description ?? '');
    setEditing(true);
    setShowCreate(false);
  };

  const submitCreate = async () => {
    if (!formName.trim()) {
      pushToast('warning', 'Role name is required');
      return;
    }
    setSaving(true);
    const created = await RoleService.create({
      roleName: formName.trim(),
      description: formDesc.trim(),
    } as any);
    setSaving(false);
    if (created) {
      pushToast('success', 'Role created');
      setShowCreate(false);
      await fetchData((created as any).roleId);
    } else {
      pushToast('error', 'Failed to create role');
    }
  };

  const submitEdit = async () => {
    if (!selectedRole) return;
    if (!formName.trim()) {
      pushToast('warning', 'Role name is required');
      return;
    }
    setSaving(true);
    const updated = await RoleService.update(selectedRole.roleId, {
      roleName: formName.trim(),
      description: formDesc.trim(),
    } as any);
    setSaving(false);
    if (updated) {
      pushToast('success', 'Role updated');
      setEditing(false);
      await fetchData(selectedRole.roleId);
    } else {
      pushToast('error', 'Failed to update role');
    }
  };

  const deleteRole = async () => {
    if (!selectedRole || selectedRole.isSystem) return;
    setSaving(true);
    const ok = await RoleService.delete(selectedRole.roleId);
    setSaving(false);
    if (ok) {
      pushToast('success', 'Role deleted');
      setEditing(false);
      await fetchData();
    } else {
      pushToast('error', 'Failed to delete role');
    }
  };

  const togglePermission = async (resource: string, action: string) => {
    if (!selectedRole || selectedRole.isSystem || saving) return;
    const has = roleHasPerm(selectedRole, resource, action);
    const current = selectedRole.permissions ?? [];
    const next = has
      ? current.filter((p) => !(p.resource === resource && p.action === action))
      : [...current, { resource, action, accessLevel: action } as Permission];
    setSaving(true);
    const updated = await RoleService.update(selectedRole.roleId, {
      permissions: next.map((p) => ({ resource: p.resource, action: p.action })),
    } as any);
    setSaving(false);
    if (updated) {
      pushToast('success', 'Permissions updated');
      await fetchData(selectedRole.roleId);
    } else {
      pushToast('error', 'Failed to update permissions');
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-500" />
            Role-based Access Control (RBAC)
          </h1>
          <p className="text-slate-500 text-sm">
            Manage user roles and define granular permission sets.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 hover:bg-indigo-700 transition-all"
        >
          <Plus className="w-4 h-4" /> Create Custom Role
        </button>
      </div>

      {/* Create / edit form */}
      {(showCreate || editing) && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-4 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm">{editing ? 'Edit Role' : 'Create Custom Role'}</h3>
            <button
              type="button"
              onClick={() => {
                setShowCreate(false);
                setEditing(false);
              }}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Role name"
              className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-sm"
            />
            <input
              type="text"
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Description"
              className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 mt-3">
            {editing && !selectedRole?.isSystem && (
              <button
                type="button"
                onClick={deleteRole}
                disabled={saving}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            )}
            <button
              type="button"
              onClick={editing ? submitEdit : submitCreate}
              disabled={saving}
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
        {/* Role List */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col overflow-hidden">
          <h3 className="font-bold text-sm mb-4 text-slate-400 uppercase tracking-wider">
            System Roles
          </h3>
          {roles.length === 0 ? (
            <p className="text-sm text-slate-400">No roles defined yet.</p>
          ) : (
            <div className="space-y-2 overflow-y-auto pr-2">
              {roles.map((role) => (
                <button
                  type="button"
                  key={role.roleId}
                  onClick={() => setSelectedRole(role)}
                  className={`w-full text-left p-4 rounded-xl border transition-all group relative ${
                    selectedRole?.roleId === role.roleId
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 ring-1 ring-indigo-200 dark:ring-indigo-800'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-transparent hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span
                      className={`font-bold ${
                        selectedRole?.roleId === role.roleId
                          ? 'text-indigo-700 dark:text-indigo-300'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {role.roleName}
                    </span>
                    {role.isSystem && <Shield className="w-3 h-3 text-slate-400" />}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">{role.description}</p>
                  <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-slate-400">
                    <div className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                      {role.assignedUsers ?? 0} Users
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Permission Matrix */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col overflow-hidden">
          {!selectedRole ? (
            <p className="text-sm text-slate-400">Select a role to view its permissions.</p>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    {selectedRole.roleName}
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 font-normal">
                      {selectedRole.isSystem ? 'System Managed' : 'Custom'}
                    </span>
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">{selectedRole.description}</p>
                </div>
                {!selectedRole.isSystem && (
                  <button
                    type="button"
                    onClick={openEdit}
                    className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="overflow-y-auto">
                {resources.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    No permissions available. Permissions appear here once defined.
                  </p>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-xs uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800">
                        <th className="py-3 font-bold w-1/2">Module / Feature</th>
                        {actions.map((a) => (
                          <th key={a} className="py-3 font-bold text-center w-20 capitalize">
                            {a}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                      {resources.map((resource) => (
                        <tr
                          key={resource}
                          className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="py-4 font-medium text-slate-700 dark:text-slate-300 pl-2">
                            {resource}
                          </td>
                          {actions.map((action) => {
                            const on = roleHasPerm(selectedRole, resource, action);
                            return (
                              <td key={permKey({ resource, action })} className="py-4 text-center">
                                <button
                                  type="button"
                                  aria-label={`${resource} ${action}`}
                                  disabled={selectedRole.isSystem || saving}
                                  onClick={() => togglePermission(resource, action)}
                                  className={`w-8 h-5 mx-auto rounded-full flex items-center p-0.5 transition-colors ${
                                    selectedRole.isSystem
                                      ? 'cursor-not-allowed opacity-60'
                                      : 'cursor-pointer'
                                  } ${
                                    on
                                      ? 'bg-emerald-500 justify-end'
                                      : 'bg-slate-200 dark:bg-slate-700 justify-start'
                                  }`}
                                >
                                  <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
