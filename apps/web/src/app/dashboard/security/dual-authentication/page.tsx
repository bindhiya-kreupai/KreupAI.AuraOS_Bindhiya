'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ShieldCheck,
  Smartphone,
  Mail,
  Key,
  UserCheck,
  Save,
  Loader2,
  X,
  Fingerprint,
  MessageSquare,
} from 'lucide-react';
import { APIClient } from '@/lib/api-client';

interface MfaPolicy {
  enforced: boolean;
  allowedMethods: string[];
  enforceForAdmins: boolean;
  enforceForAllUsers: boolean;
  enforceForRemote: boolean;
  graceperiodDays: number;
  rememberDeviceDays: number;
}

interface MfaUser {
  id: string;
  name: string;
  email: string;
  status: string;
  mfaEnabled: boolean;
}

type ToastState = { type: 'success' | 'error'; message: string } | null;

const METHODS: { key: string; label: string; desc: string; icon: React.ElementType }[] = [
  {
    key: 'totp',
    label: 'Authenticator App',
    desc: 'Google Auth, Microsoft Auth, Authy',
    icon: Smartphone,
  },
  { key: 'email', label: 'Email OTP', desc: 'One-time code sent to email', icon: Mail },
  { key: 'sms', label: 'SMS OTP', desc: 'One-time code sent via SMS', icon: MessageSquare },
  {
    key: 'webauthn',
    label: 'Security Key / Passkey',
    desc: 'WebAuthn hardware keys & passkeys',
    icon: Fingerprint,
  },
];

export default function DualAuthenticationPage() {
  const [policy, setPolicy] = useState<MfaPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [showUsers, setShowUsers] = useState(false);
  const [users, setUsers] = useState<MfaUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const notify = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await APIClient.get<any>('/api/security/mfa-policy');
      const item = APIClient.unwrapItem<MfaPolicy>(res);
      if (item) {
        setPolicy({
          ...item,
          allowedMethods: Array.isArray(item.allowedMethods) ? item.allowedMethods : [],
        });
      }
    } catch {
      notify('error', 'Failed to load MFA policy');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleMethod = (key: string) => {
    setPolicy((prev) => {
      if (!prev) return prev;
      const has = prev.allowedMethods.includes(key);
      return {
        ...prev,
        allowedMethods: has
          ? prev.allowedMethods.filter((m) => m !== key)
          : [...prev.allowedMethods, key],
      };
    });
  };

  const toggleFlag = (key: keyof MfaPolicy) => {
    setPolicy((prev) => (prev ? { ...prev, [key]: !prev[key] } : prev));
  };

  const save = useCallback(async () => {
    if (!policy) return;
    setSaving(true);
    try {
      await APIClient.put('/api/security/mfa-policy', policy);
      notify('success', 'MFA policy saved');
      await load();
    } catch {
      notify('error', 'Failed to save MFA policy');
    } finally {
      setSaving(false);
    }
  }, [policy, load, notify]);

  const openUsers = useCallback(async () => {
    setShowUsers(true);
    setUsersLoading(true);
    try {
      const res = await APIClient.get<any>('/api/security/mfa-policy/users', { limit: 200 });
      setUsers(APIClient.unwrapList<MfaUser>(res));
    } catch {
      notify('error', 'Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  }, [notify]);

  const adoptionPct = useMemo(() => {
    if (users.length === 0) return null;
    const enabled = users.filter((u) => u.mfaEnabled).length;
    return Math.round((enabled / users.length) * 100);
  }, [users]);

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
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            Dual Authentication (MFA)
          </h1>
          <p className="text-slate-500 text-sm">
            Configure multi-factor authentication policies for your organization.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving || loading || !policy}
          className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 hover:bg-emerald-700 transition-all disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{' '}
          Save Policies
        </button>
      </div>

      {loading || !policy ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0 overflow-y-auto pb-20">
          {/* Method Configuration */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-slate-400" /> Allowed MFA Methods
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {METHODS.map(({ key, label, desc, icon: Icon }) => {
                  const active = policy.allowedMethods.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleMethod(key)}
                      className={`text-left border p-4 rounded-xl relative transition-all ${
                        active
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="absolute top-4 right-4">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            active ? 'border-emerald-500' : 'border-slate-300'
                          }`}
                        >
                          {active && (
                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                          active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100">{label}</h4>
                      <p className="text-xs text-slate-500 mt-1">{desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Policy Rules */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-slate-400" /> Enforcement Rules
              </h3>
              <div className="space-y-4">
                {(
                  [
                    {
                      key: 'enforced' as const,
                      title: 'MFA Enforced',
                      desc: 'Master switch — require MFA per the rules below',
                    },
                    {
                      key: 'enforceForAdmins' as const,
                      title: 'Enforce for Administrators',
                      desc: 'Require MFA for Super Admins & HR Managers',
                    },
                    {
                      key: 'enforceForAllUsers' as const,
                      title: 'Enforce for All Employees',
                      desc: 'Require MFA for everyone (Recommended)',
                    },
                    {
                      key: 'enforceForRemote' as const,
                      title: 'Enforce for Remote Access',
                      desc: 'Require MFA when signing in outside the office network',
                    },
                  ] as const
                ).map(({ key, title, desc }) => {
                  const on = policy[key];
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                    >
                      <div>
                        <h5 className="font-bold text-sm text-slate-700 dark:text-slate-200">
                          {title}
                        </h5>
                        <p className="text-xs text-slate-500">{desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleFlag(key)}
                        className={`w-12 h-6 rounded-full flex items-center px-1 cursor-pointer transition-all ${
                          on
                            ? 'bg-emerald-500 justify-end'
                            : 'bg-slate-200 dark:bg-slate-700 justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                      </button>
                    </div>
                  );
                })}

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs font-bold text-slate-500">Grace Period (days)</span>
                    <input
                      type="number"
                      min={0}
                      value={policy.graceperiodDays}
                      onChange={(e) =>
                        setPolicy((p) =>
                          p ? { ...p, graceperiodDays: Number(e.target.value) } : p
                        )
                      }
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold text-slate-500">Remember Device (days)</span>
                    <input
                      type="number"
                      min={0}
                      value={policy.rememberDeviceDays}
                      onChange={(e) =>
                        setPolicy((p) =>
                          p ? { ...p, rememberDeviceDays: Number(e.target.value) } : p
                        )
                      }
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-indigo-600 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-bold text-lg mb-1">MFA Adoption</h3>
                <p className="text-indigo-200 text-xs mb-6">Percentage of users with MFA enabled</p>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-4xl font-bold">
                    {adoptionPct === null ? '—' : `${adoptionPct}%`}
                  </span>
                  <span className="text-sm font-bold bg-indigo-500/50 px-2 py-1 rounded">
                    {policy.enforced ? 'Enforced' : 'Optional'}
                  </span>
                </div>
                <div className="w-full bg-indigo-900/50 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-white h-full rounded-full"
                    style={{ width: `${adoptionPct ?? 0}%` }}
                  ></div>
                </div>
                {adoptionPct === null && (
                  <p className="text-[11px] text-indigo-200 mt-2">
                    Open “View All Users” to compute adoption.
                  </p>
                )}
              </div>
              <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="font-bold text-sm mb-4 text-slate-500 uppercase tracking-wider">
                User MFA Status
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Review which users have enabled multi-factor authentication.
              </p>
              <button
                onClick={openUsers}
                className="w-full text-xs font-bold text-indigo-600 hover:underline"
              >
                View All Users
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Modal */}
      {showUsers && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg">User MFA Status</h3>
              <button
                onClick={() => setShowUsers(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              {usersLoading ? (
                <div className="flex items-center justify-center py-12 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : users.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No users found.</p>
              ) : (
                <div className="space-y-2">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800"
                    >
                      <div>
                        <div className="font-bold text-sm">{u.name}</div>
                        <div className="text-xs text-slate-400">{u.email}</div>
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${
                          u.mfaEnabled
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'
                        }`}
                      >
                        {u.mfaEnabled ? 'MFA Enabled' : 'MFA Disabled'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
