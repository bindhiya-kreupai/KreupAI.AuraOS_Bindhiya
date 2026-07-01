'use client';

/**
 * Security Settings admin page (backlog AURA-278). Reads/writes the tenant's
 * security configuration through GET/PUT /api/security/settings. The settings
 * shape mirrors the API's DEFAULT_SETTINGS (password policy, session management,
 * MFA, IP allow-listing, audit, encryption).
 */

import React, { useCallback, useEffect, useState } from 'react';
import { APIClient } from '@/lib/api-client';
import { ShieldCheck, Save, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SecuritySettingsData {
  settingsId?: string;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expiryDays: number;
    preventReuse: number;
  };
  sessionManagement: {
    sessionTimeout: number;
    maxConcurrentSessions: number;
    requireReauthForSensitive: boolean;
  };
  mfa: {
    enabled: boolean;
    methods: string[];
    required: boolean;
    requiredForRoles: string[];
  };
  ipWhitelisting: {
    enabled: boolean;
    allowedIPs: string[];
  };
  auditSettings: {
    retentionDays: number;
    logAllActions: boolean;
    alertOnSuspiciousActivity: boolean;
  };
  dataEncryption: {
    encryptAtRest: boolean;
    encryptInTransit: boolean;
    algorithm: string;
  };
}

type Feedback = { kind: 'success' | 'error'; text: string } | null;

const MFA_METHODS = ['totp', 'sms', 'email', 'webauthn'];

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 py-2 cursor-pointer">
      <span className="text-sm text-slate-600 dark:text-slate-300">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min = 0,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-slate-500 mb-1 block">{label}</span>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm font-bold"
      />
    </label>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
      <h3 className="font-bold text-sm mb-3">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

export default function SecuritySettingsPage() {
  const [settings, setSettings] = useState<SecuritySettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await APIClient.get<unknown>('/security/settings');
      const data = APIClient.unwrapItem<SecuritySettingsData>(res);
      setSettings(data);
    } catch {
      setFeedback({ kind: 'error', text: 'Failed to load security settings.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(async () => {
    if (!settings) return;
    try {
      setSaving(true);
      setFeedback(null);
      const res = await APIClient.put<unknown>('/security/settings', settings);
      const updated = APIClient.unwrapItem<SecuritySettingsData>(res);
      if (updated) setSettings(updated);
      setFeedback({ kind: 'success', text: 'Security settings saved.' });
    } catch {
      setFeedback({ kind: 'error', text: 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  }, [settings]);

  function patch<K extends keyof SecuritySettingsData>(
    key: K,
    value: Partial<SecuritySettingsData[K]>
  ) {
    setSettings((prev) =>
      prev ? { ...prev, [key]: { ...(prev[key] as object), ...value } } : prev
    );
  }

  function toggleMfaMethod(method: string) {
    setSettings((prev) => {
      if (!prev) return prev;
      const has = prev.mfa.methods.includes(method);
      const methods = has
        ? prev.mfa.methods.filter((m) => m !== method)
        : [...prev.mfa.methods, method];
      return { ...prev, mfa: { ...prev.mfa, methods } };
    });
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-6rem)] flex items-center justify-center text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading settings…
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="h-[calc(100vh-6rem)] flex flex-col items-center justify-center gap-3 text-slate-500">
        <AlertTriangle className="w-8 h-8 text-amber-500" />
        <p className="text-sm">Could not load security settings.</p>
        <button
          type="button"
          onClick={() => void load()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-500" />
            Security Settings
          </h1>
          <p className="text-slate-500 text-sm">
            Configure password policy, sessions, MFA, IP allow-listing, audit, and encryption.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {feedback ? (
            <span
              className={`flex items-center gap-1.5 text-xs font-bold ${
                feedback.kind === 'success' ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {feedback.kind === 'success' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              {feedback.text}
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Settings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card title="Password Policy">
          <div className="grid grid-cols-2 gap-3 mb-2">
            <NumberField
              label="Minimum Length"
              value={settings.passwordPolicy.minLength}
              onChange={(v) => patch('passwordPolicy', { minLength: v })}
              min={4}
            />
            <NumberField
              label="Expiry (days)"
              value={settings.passwordPolicy.expiryDays}
              onChange={(v) => patch('passwordPolicy', { expiryDays: v })}
            />
            <NumberField
              label="Prevent Reuse (count)"
              value={settings.passwordPolicy.preventReuse}
              onChange={(v) => patch('passwordPolicy', { preventReuse: v })}
            />
          </div>
          <Toggle
            label="Require uppercase"
            checked={settings.passwordPolicy.requireUppercase}
            onChange={(v) => patch('passwordPolicy', { requireUppercase: v })}
          />
          <Toggle
            label="Require lowercase"
            checked={settings.passwordPolicy.requireLowercase}
            onChange={(v) => patch('passwordPolicy', { requireLowercase: v })}
          />
          <Toggle
            label="Require numbers"
            checked={settings.passwordPolicy.requireNumbers}
            onChange={(v) => patch('passwordPolicy', { requireNumbers: v })}
          />
          <Toggle
            label="Require special characters"
            checked={settings.passwordPolicy.requireSpecialChars}
            onChange={(v) => patch('passwordPolicy', { requireSpecialChars: v })}
          />
        </Card>

        <Card title="Session Management">
          <div className="grid grid-cols-2 gap-3 mb-2">
            <NumberField
              label="Session Timeout (min)"
              value={settings.sessionManagement.sessionTimeout}
              onChange={(v) => patch('sessionManagement', { sessionTimeout: v })}
              min={1}
            />
            <NumberField
              label="Max Concurrent Sessions"
              value={settings.sessionManagement.maxConcurrentSessions}
              onChange={(v) => patch('sessionManagement', { maxConcurrentSessions: v })}
              min={1}
            />
          </div>
          <Toggle
            label="Re-authenticate for sensitive actions"
            checked={settings.sessionManagement.requireReauthForSensitive}
            onChange={(v) => patch('sessionManagement', { requireReauthForSensitive: v })}
          />
        </Card>

        <Card title="Multi-Factor Authentication">
          <Toggle
            label="MFA enabled"
            checked={settings.mfa.enabled}
            onChange={(v) => patch('mfa', { enabled: v })}
          />
          <Toggle
            label="Require MFA for all users"
            checked={settings.mfa.required}
            onChange={(v) => patch('mfa', { required: v })}
          />
          <div className="mt-2">
            <span className="text-xs font-bold text-slate-500 mb-2 block">Allowed methods</span>
            <div className="flex flex-wrap gap-2">
              {MFA_METHODS.map((m) => {
                const active = settings.mfa.methods.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleMfaMethod(m)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${
                      active
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        <Card title="IP Allow-listing">
          <Toggle
            label="Restrict access by IP"
            checked={settings.ipWhitelisting.enabled}
            onChange={(v) => patch('ipWhitelisting', { enabled: v })}
          />
          <label className="block mt-2">
            <span className="text-xs font-bold text-slate-500 mb-1 block">
              Allowed IPs (comma separated)
            </span>
            <input
              type="text"
              value={settings.ipWhitelisting.allowedIPs.join(', ')}
              onChange={(e) =>
                patch('ipWhitelisting', {
                  allowedIPs: e.target.value
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              placeholder="203.0.113.0/24, 198.51.100.5"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm"
            />
          </label>
        </Card>

        <Card title="Audit">
          <NumberField
            label="Retention (days)"
            value={settings.auditSettings.retentionDays}
            onChange={(v) => patch('auditSettings', { retentionDays: v })}
          />
          <Toggle
            label="Log all actions"
            checked={settings.auditSettings.logAllActions}
            onChange={(v) => patch('auditSettings', { logAllActions: v })}
          />
          <Toggle
            label="Alert on suspicious activity"
            checked={settings.auditSettings.alertOnSuspiciousActivity}
            onChange={(v) => patch('auditSettings', { alertOnSuspiciousActivity: v })}
          />
        </Card>

        <Card title="Data Encryption">
          <Toggle
            label="Encrypt at rest"
            checked={settings.dataEncryption.encryptAtRest}
            onChange={(v) => patch('dataEncryption', { encryptAtRest: v })}
          />
          <Toggle
            label="Encrypt in transit"
            checked={settings.dataEncryption.encryptInTransit}
            onChange={(v) => patch('dataEncryption', { encryptInTransit: v })}
          />
          <label className="block mt-2">
            <span className="text-xs font-bold text-slate-500 mb-1 block">Algorithm</span>
            <input
              type="text"
              value={settings.dataEncryption.algorithm}
              onChange={(e) => patch('dataEncryption', { algorithm: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm font-bold"
            />
          </label>
        </Card>
      </div>
    </div>
  );
}
