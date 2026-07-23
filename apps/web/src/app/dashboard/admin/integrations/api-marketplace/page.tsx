'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Code,
  Key,
  Copy,
  Terminal,
  BookOpen,
  ShieldAlert,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  status: string;
  permissions: string[];
  createdAt: string;
  lastUsed: string | null;
  expiresAt: string | null;
  usageCount: number;
  createdBy: string;
  revokedAt?: string;
}

interface ApiKeysMeta {
  total: number;
  active: number;
  revoked: number;
}

interface Toast {
  type: 'success' | 'error';
  message: string;
}

function formatLastUsed(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffM = Math.floor(diffMs / 60000);
  if (diffM < 1) return 'Just now';
  if (diffM < 60) return `${diffM} min ago`;
  const diffH = Math.floor(diffM / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return `${Math.floor(diffH / 24)}d ago`;
}

function formatScope(permissions: string[]): string {
  if (!permissions || permissions.length === 0) return 'No Access';
  const hasWrite = permissions.some(
    (p) => p.includes(':write') || p.includes(':create') || p.includes(':delete')
  );
  const allRead = permissions.every((p) => p.includes(':read'));
  if (hasWrite) return 'Read/Write';
  if (allRead) return 'Read Only';
  return 'Full Access';
}

export default function AdminApiMarketplacePage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [meta, setMeta] = useState<ApiKeysMeta>({ total: 0, active: 0, revoked: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);
  const [keyFormError, setKeyFormError] = useState<string | null>(null);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const showToast = useCallback((t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 4000);
  }, []);

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/admin/api-keys');
      const result = await res.json();
      if (result.success) {
        setApiKeys(result.data);
        if (result.meta) setMeta(result.meta);
      } else {
        setError(result.error || 'Failed to load API keys');
      }
    } catch (err) {
      console.error('Failed to fetch API keys:', err);
      setError('Failed to load API keys.');
    }
  }, []);

  useEffect(() => {
    fetchKeys().finally(() => setLoading(false));
  }, [fetchKeys]);

  const activeKeys = apiKeys.filter((k) => k.status === 'active');
  const revokedKeys = apiKeys.filter((k) => k.status === 'revoked');
  const totalUsage = apiKeys.reduce((sum, k) => sum + (k.usageCount || 0), 0);

  const openKeyModal = () => {
    setKeyName('');
    setKeyFormError(null);
    setGeneratedKey(null);
    setShowKeyModal(true);
  };

  const handleGenerateKey = async () => {
    setKeyFormError(null);
    if (!keyName.trim()) {
      setKeyFormError('Key name is required.');
      return;
    }
    setCreatingKey(true);
    try {
      const res = await fetch('/api/v1/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: keyName.trim(), permissions: ['employees:read'] }),
      });
      const result = await res.json();
      if (result.success) {
        setGeneratedKey(result.data?.key || null);
        showToast({ type: 'success', message: 'API key generated. Copy it now.' });
        await fetchKeys();
      } else {
        setKeyFormError(result.error?.message || 'Failed to generate key.');
      }
    } catch {
      setKeyFormError('Failed to generate key.');
    } finally {
      setCreatingKey(false);
    }
  };

  const handleRevoke = async (key: ApiKey) => {
    if (!confirm(`Revoke API key "${key.name}"? This action cannot be undone.`)) return;
    setActionLoading(key.id);
    try {
      const res = await fetch(`/api/v1/admin/api-keys/${key.id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        showToast({ type: 'success', message: `Key "${key.name}" revoked.` });
        await fetchKeys();
      } else {
        showToast({ type: 'error', message: result.error?.message || 'Revoke failed.' });
      }
    } catch {
      showToast({ type: 'error', message: 'Revoke failed.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRollKey = async (key: ApiKey) => {
    await handleRevoke(key);
    if (generatedKey) return;
    setKeyName(key.name + ' (rolled)');
    setShowKeyModal(true);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast({ type: 'success', message: 'Copied to clipboard.' });
    } catch {
      showToast({ type: 'error', message: 'Copy failed.' });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 pb-6 text-slate-900 dark:text-slate-100 animate-pulse">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
          <span className="text-slate-400">Loading API keys...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 pb-6 text-slate-900 dark:text-slate-100">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Code className="w-6 h-6 text-indigo-500" />
          API Marketplace
        </h1>
        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/30 text-center">
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              fetchKeys().finally(() => setLoading(false));
            }}
            className="mt-3 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 text-slate-900 dark:text-slate-100">
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
          role="status"
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {toast.message}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Code className="w-6 h-6 text-indigo-500" />
            API Marketplace
          </h1>
          <p className="text-slate-500 text-sm">Developer tools, API keys, and documentation.</p>
        </div>
        <button
          onClick={openKeyModal}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20"
        >
          <Key className="w-4 h-4" /> Generate New Key
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-500" /> API Keys
          </h3>
          <div className="flex-1 space-y-4">
            {activeKeys.length === 0 ? (
              <div className="text-center py-12">
                <Key className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500">No API keys. Generate one to get started.</p>
              </div>
            ) : (
              activeKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{key.name}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <button
                        onClick={() => copyToClipboard(key.prefix)}
                        className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 flex items-center gap-1 hover:text-indigo-500"
                      >
                        {key.prefix} <Copy className="w-3 h-3" />
                      </button>
                      <span className="text-[10px] uppercase font-bold text-slate-400 border border-slate-200 dark:border-slate-700 px-1.5 rounded">
                        {formatScope(key.permissions)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 text-right">
                    <div className="text-xs text-slate-500">
                      Last used:{' '}
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {formatLastUsed(key.lastUsed)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {key.usageCount.toLocaleString()} requests
                    </div>
                    <div className="flex justify-end gap-3 mt-2">
                      <button
                        onClick={() => handleRollKey(key)}
                        disabled={actionLoading === key.id}
                        className="text-xs font-bold text-indigo-600 hover:underline disabled:opacity-50"
                      >
                        Roll Key
                      </button>
                      <button
                        onClick={() => handleRevoke(key)}
                        disabled={actionLoading === key.id}
                        className="text-xs font-bold text-rose-600 hover:underline disabled:opacity-50 flex items-center gap-1"
                      >
                        {actionLoading === key.id && <Loader2 className="w-3 h-3 animate-spin" />}
                        Revoke
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" /> Overview
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Active keys</span>
                <span className="font-bold">{meta.active || activeKeys.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Revoked keys</span>
                <span className="font-bold">{meta.revoked || revokedKeys.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total usage</span>
                <span className="font-bold">{totalUsage.toLocaleString()} requests</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-400" /> Quick Start
            </h3>
            <div className="bg-black/30 rounded-lg p-3 font-mono text-xs text-slate-300 mb-4 overflow-x-auto">
              curl -X GET https://api.auraos.io/v1/employees \<br />
              -H &quot;Authorization: Bearer YOUR_API_KEY&quot;
            </div>
            <button
              onClick={() => openKeyModal()}
              className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Key className="w-4 h-4" /> Generate an API Key
            </button>
          </div>
        </div>
      </div>

      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-500" /> Generate API Key
              </h2>
              <button
                onClick={() => setShowKeyModal(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {generatedKey ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Copy this key now. It will not be shown again.
                </p>
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                  <code className="font-mono text-xs break-all flex-1">{generatedKey}</code>
                  <button
                    onClick={() => copyToClipboard(generatedKey)}
                    className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowKeyModal(false)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Key Name</label>
                  <input
                    type="text"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    placeholder="e.g. Payroll Integration"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-indigo-500"
                  />
                </div>
                {keyFormError && (
                  <p className="text-sm text-rose-600 dark:text-rose-400">{keyFormError}</p>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowKeyModal(false)}
                    className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerateKey}
                    disabled={creatingKey}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
                  >
                    {creatingKey && <Loader2 className="w-4 h-4 animate-spin" />}
                    Generate
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
