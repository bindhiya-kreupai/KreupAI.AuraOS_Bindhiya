'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Eye, EyeOff, Lock, Unlock, Shield, Users, Table, Loader2 } from 'lucide-react';
import { APIClient } from '@/lib/api-client';

interface FieldRule {
  id: string;
  roleName: string;
  entityType: string;
  fieldName: string;
  access: 'view' | 'edit' | 'hidden';
  masked: boolean;
}

type ToastState = { type: 'success' | 'error'; message: string } | null;

const FALLBACK_ROLES = ['Super Admin', 'HR Manager', 'Finance Manager', 'Line Manager', 'Employee'];

const ACCESS_OPTIONS: FieldRule['access'][] = ['view', 'edit', 'hidden'];

function prettyField(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

export default function FieldSecurityPage() {
  const [roles, setRoles] = useState<string[]>(FALLBACK_ROLES);
  const [selectedRole, setSelectedRole] = useState<string>(FALLBACK_ROLES[0]);
  const [rules, setRules] = useState<FieldRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const notify = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Load roles once.
  useEffect(() => {
    (async () => {
      try {
        const res = await APIClient.get<any>('/api/security/roles', { limit: 200 });
        const list = APIClient.unwrapList<any>(res);
        const names = list.map((r) => r.roleName).filter(Boolean);
        if (names.length > 0) {
          setRoles(names);
          setSelectedRole(names[0]);
        }
      } catch {
        // Keep fallback roles.
      }
    })();
  }, []);

  const loadRules = useCallback(
    async (roleName: string) => {
      setLoading(true);
      try {
        const res = await APIClient.get<any>('/api/security/field-security', { roleName });
        setRules(APIClient.unwrapList<FieldRule>(res));
      } catch {
        notify('error', 'Failed to load field rules');
        setRules([]);
      } finally {
        setLoading(false);
      }
    },
    [notify]
  );

  useEffect(() => {
    loadRules(selectedRole);
  }, [selectedRole, loadRules]);

  const persist = useCallback(
    async (rule: FieldRule, patch: Partial<FieldRule>) => {
      const key = `${rule.entityType}.${rule.fieldName}`;
      setSavingKey(key);
      // Optimistic update.
      setRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, ...patch } : r)));
      try {
        await APIClient.put('/api/security/field-security', {
          roleName: selectedRole,
          entityType: rule.entityType,
          fieldName: rule.fieldName,
          access: patch.access ?? rule.access,
          masked: patch.masked ?? rule.masked,
        });
        notify('success', `${prettyField(rule.fieldName)} updated`);
        await loadRules(selectedRole);
      } catch {
        notify('error', 'Failed to save rule');
        await loadRules(selectedRole);
      } finally {
        setSavingKey(null);
      }
    },
    [selectedRole, loadRules, notify]
  );

  // Group rules by entityType.
  const grouped = rules.reduce<Record<string, FieldRule[]>>((acc, r) => {
    (acc[r.entityType] ||= []).push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-bold ${
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Lock className="w-6 h-6 text-rose-500" />
            Field Level Security
          </h1>
          <p className="text-slate-500 text-sm">
            Control visibility and edit permissions for sensitive data fields (PII).
          </p>
        </div>
        <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 px-4 py-2 rounded-xl text-sm font-bold border border-rose-100 dark:border-rose-800/30">
          <Shield className="w-4 h-4" /> {rules.length} Protected Fields
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
        {/* Role List */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-full">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" /> Select Role
          </h3>
          <div className="space-y-2 overflow-y-auto">
            {roles.map((r) => {
              const active = r === selectedRole;
              return (
                <button
                  key={r}
                  onClick={() => setSelectedRole(r)}
                  className={`w-full text-left p-3 rounded-lg text-sm font-bold flex justify-between items-center ${
                    active
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 border border-indigo-100 dark:border-indigo-800'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  {r}
                  {active && (
                    <span className="text-[10px] bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 px-2 rounded">
                      Editing
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Field Matrix */}
        <div className="lg:col-span-2 overflow-y-auto pb-20">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Table className="w-5 h-5 text-slate-400" />
              Permissions for: <span className="text-indigo-500">{selectedRole}</span>
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : rules.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Shield className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                <p className="font-bold">No field rules for this role</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(grouped).map(([entityType, fields]) => (
                  <div key={entityType}>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                      {entityType}
                    </h4>
                    <div className="space-y-3">
                      {fields.map((f) => {
                        const key = `${f.entityType}.${f.fieldName}`;
                        const busy = savingKey === key;
                        return (
                          <div
                            key={f.id}
                            className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg"
                          >
                            <div className="font-bold text-slate-700 dark:text-slate-300 text-sm flex items-center gap-2">
                              {prettyField(f.fieldName)}
                              {busy && <Loader2 className="w-3 h-3 animate-spin text-slate-400" />}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
                                {f.access === 'hidden' ? (
                                  <EyeOff className="w-4 h-4 text-slate-300" />
                                ) : f.access === 'edit' ? (
                                  <Unlock className="w-4 h-4 text-emerald-500" />
                                ) : (
                                  <Eye className="w-4 h-4 text-indigo-500" />
                                )}
                                <select
                                  value={f.access}
                                  disabled={busy}
                                  onChange={(e) =>
                                    persist(f, {
                                      access: e.target.value as FieldRule['access'],
                                    })
                                  }
                                  className="bg-transparent border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-xs font-bold"
                                >
                                  {ACCESS_OPTIONS.map((a) => (
                                    <option key={a} value={a}>
                                      {a.charAt(0).toUpperCase() + a.slice(1)}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => persist(f, { masked: !f.masked })}
                                title="Toggle field masking"
                                className="flex items-center gap-2 text-xs font-bold text-slate-500 w-20"
                              >
                                <div
                                  className={`w-8 h-4 rounded-full relative ${
                                    f.masked ? 'bg-indigo-600' : 'bg-slate-300'
                                  }`}
                                >
                                  <div
                                    className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${
                                      f.masked ? 'left-4' : 'left-0.5'
                                    }`}
                                  ></div>
                                </div>
                                Mask
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
