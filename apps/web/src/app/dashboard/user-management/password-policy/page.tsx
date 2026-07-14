'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Save, RotateCcw, Shield } from 'lucide-react';

interface PasswordPolicy {
  id?: string;
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  expiryDays: number;
  historyCount: number;
  lockoutAttempts: number;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

const DEFAULTS: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  expiryDays: 90,
  historyCount: 5,
  lockoutAttempts: 3,
};

export default function PasswordPolicyPage() {
  const [policy, setPolicy] = useState<PasswordPolicy>(DEFAULTS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  useEffect(() => {
    fetch('/api/password-policy')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setPolicy({ ...DEFAULTS, ...json.data });
        } else {
          setError(json.error || 'Failed to load password policy');
        }
      })
      .catch((err) => {
        setError(err.message || 'Network error');
        console.error('Error fetching password policy:', err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (key: keyof PasswordPolicy, value: any) => {
    setPolicy((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const isUpdate = !!policy.id;
      const res = await fetch('/api/password-policy', {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policy),
      });

      const json = await res.json();

      if (res.ok) {
        if (json.data?.id) {
          setPolicy((prev) => ({ ...prev, id: json.data.id }));
        }
        showNotification('success', json.message || 'Password policy saved successfully');
      } else {
        showNotification('error', json.error || 'Failed to save password policy');
      }
    } catch (err: any) {
      showNotification('error', 'Network error while saving password policy');
      console.error('Error saving policy:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!policy.id) return;
    if (
      !window.confirm(
        'Reset password policy to system defaults? This will delete the current policy.'
      )
    )
      return;

    try {
      const res = await fetch('/api/password-policy', { method: 'DELETE' });
      const json = await res.json();

      if (res.ok) {
        setPolicy({ ...DEFAULTS, id: undefined });
        showNotification('success', json.message || 'Password policy reset to defaults');
      } else {
        showNotification('error', json.error || 'Failed to reset password policy');
      }
    } catch (err: any) {
      showNotification('error', 'Network error while resetting password policy');
      console.error('Error resetting policy:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-rose-500 text-lg font-medium">Failed to load password policy</div>
        <p className="text-silver-mist text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-celestial-indigo hover:bg-celestial-indigo/90 text-white rounded-lg text-sm font-medium transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
            notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-xl font-semibold text-ink-black dark:text-pearl">Password Policy</h1>
        <p className="text-sm text-silver-mist mt-0.5">
          Configure security requirements for user passwords. This policy applies system-wide.
        </p>
      </div>

      <div className="bg-white dark:bg-stellar-blue/20 rounded-xl border border-cloud dark:border-nebula-purple/30 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-silver-mist mb-1.5">
              Minimum Length
            </label>
            <input
              type="number"
              value={policy.minLength}
              onChange={(e) =>
                handleChange('minLength', Math.max(1, parseInt(e.target.value) || 0))
              }
              min={6}
              max={32}
              className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
            />
            <p className="text-[10px] text-silver-mist mt-1">Min 6, Max 32 characters</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-silver-mist mb-1.5">
              Password Expiry (Days)
            </label>
            <input
              type="number"
              value={policy.expiryDays}
              onChange={(e) =>
                handleChange('expiryDays', Math.max(0, parseInt(e.target.value) || 0))
              }
              min={0}
              max={365}
              className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
            />
            <p className="text-[10px] text-silver-mist mt-1">0 = never expires, Max 365 days</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-silver-mist mb-1.5">
              History Count (Prevent reuse)
            </label>
            <input
              type="number"
              value={policy.historyCount}
              onChange={(e) =>
                handleChange('historyCount', Math.max(0, parseInt(e.target.value) || 0))
              }
              min={0}
              max={24}
              className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
            />
            <p className="text-[10px] text-silver-mist mt-1">
              Number of previous passwords to remember. 0 = disabled.
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-silver-mist mb-1.5">
              Lockout Attempts
            </label>
            <input
              type="number"
              value={policy.lockoutAttempts}
              onChange={(e) =>
                handleChange('lockoutAttempts', Math.max(0, parseInt(e.target.value) || 0))
              }
              min={0}
              max={10}
              className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
            />
            <p className="text-[10px] text-silver-mist mt-1">0 = no lockout, Max 10 attempts</p>
          </div>
        </div>

        <div className="pt-4 border-t border-cloud dark:border-nebula-purple/30">
          <h3 className="text-sm font-medium text-ink-black dark:text-pearl mb-3">
            Complexity Requirements
          </h3>
          <div className="space-y-3">
            {[
              { key: 'requireUppercase', label: 'Require Uppercase Letters (A-Z)' },
              { key: 'requireLowercase', label: 'Require Lowercase Letters (a-z)' },
              { key: 'requireNumbers', label: 'Require Numbers (0-9)' },
              { key: 'requireSpecialChars', label: 'Require Special Characters (!@#$%^&*)' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={key}
                  checked={policy[key as keyof PasswordPolicy] as boolean}
                  onChange={(e) => handleChange(key as keyof PasswordPolicy, e.target.checked)}
                  className="w-4 h-4 text-celestial-indigo rounded border-cloud focus:ring-celestial-indigo"
                />
                <label
                  htmlFor={key}
                  className="text-sm text-ink-black dark:text-pearl cursor-pointer"
                >
                  {label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-cloud dark:border-nebula-purple/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-silver-mist">
            <Shield className="w-4 h-4" />
            {policy.id ? (
              <span>
                Policy is active — uses <strong>PUT</strong> for updates
              </span>
            ) : (
              <span>
                Using system defaults — first save will <strong>create</strong> a new policy
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {policy.id && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Defaults
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2 bg-celestial-indigo hover:bg-celestial-indigo/90 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Policy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
