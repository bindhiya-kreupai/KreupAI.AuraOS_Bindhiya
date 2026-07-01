'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plug, Search, Key, Copy, Loader2, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  status: string;
  permissions: string[];
  createdAt: string;
  lastUsed: string | null;
  usageCount: number;
}

interface MarketplaceApi {
  id: string;
  name: string;
  description?: string;
  category?: string;
  provider?: string;
  version?: string;
  status?: string;
  installed?: boolean;
  connectionId?: string;
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

export default function ApiMarketplacePage() {
  const [apis, setApis] = useState<MarketplaceApi[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);
  const [keyFormError, setKeyFormError] = useState<string | null>(null);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const showToast = useCallback((t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 4000);
  }, []);

  const fetchApis = useCallback(async () => {
    try {
      const params = new URLSearchParams({ type: 'marketplace' });
      if (searchQuery) params.set('search', searchQuery);
      const res = await fetch(`/api/integrations?${params.toString()}`);
      const result = await res.json();
      if (result.success && result.data) {
        const listings = result.data.listings || result.data.integrations || result.data || [];
        setApis(Array.isArray(listings) ? listings : []);
      } else {
        setApis([]);
      }
    } catch (err) {
      console.error('Failed to fetch marketplace:', err);
      setError('Failed to load API marketplace.');
    }
  }, [searchQuery]);

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/admin/api-keys');
      const result = await res.json();
      if (result.success) {
        setApiKeys(Array.isArray(result.data) ? result.data : []);
      }
    } catch (err) {
      console.error('Failed to fetch API keys:', err);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchApis(), fetchKeys()]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => fetchApis(), 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

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
    } catch (err) {
      console.error('Generate key failed:', err);
      setKeyFormError('Failed to generate key. Please try again.');
    } finally {
      setCreatingKey(false);
    }
  };

  const handleRevoke = async (key: ApiKey) => {
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
    } catch (err) {
      console.error('Revoke failed:', err);
      showToast({ type: 'error', message: 'Revoke failed. Please try again.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleConnectApi = async (api: MarketplaceApi) => {
    setActionLoading(api.id);
    try {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'connect',
          integrationId: api.id,
          configuration: {},
          credentials: {},
        }),
      });
      const result = await res.json();
      if (result.success) {
        showToast({ type: 'success', message: `${api.name} connected.` });
        await fetchApis();
      } else {
        showToast({ type: 'error', message: result.error || 'Connect failed.' });
      }
    } catch (err) {
      console.error('Connect API failed:', err);
      showToast({ type: 'error', message: 'Connect failed. Please try again.' });
    } finally {
      setActionLoading(null);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast({ type: 'success', message: 'Copied to clipboard.' });
    } catch {
      showToast({ type: 'error', message: 'Copy failed.' });
    }
  };

  const activeKeys = apiKeys.filter((k) => k.status === 'active');

  return (
    <div className="space-y-4 pb-6 text-slate-900 dark:text-slate-100">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}
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
            <Plug className="w-6 h-6 text-indigo-500" />
            API Marketplace
          </h1>
          <p className="text-slate-500 text-sm">Discover and manage API connections.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search APIs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* API Keys panel */}
      <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg text-indigo-900 dark:text-indigo-100">
              Your API Keys
            </h3>
            <p className="text-sm text-indigo-700 dark:text-indigo-300">
              Manage access tokens for your applications.
            </p>
          </div>
          <button
            onClick={openKeyModal}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
          >
            <Key className="w-4 h-4" /> Generate New Key
          </button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading keys...
          </div>
        ) : activeKeys.length === 0 ? (
          <p className="text-sm text-indigo-700/70 dark:text-indigo-300/70">
            No active API keys. Generate one to start integrating.
          </p>
        ) : (
          <div className="space-y-2">
            {activeKeys.map((key) => (
              <div
                key={key.id}
                className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800/50"
              >
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{key.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => copyToClipboard(key.prefix)}
                      className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 flex items-center gap-1 hover:text-indigo-500"
                    >
                      {key.prefix} <Copy className="w-3 h-3" />
                    </button>
                    <span className="text-[10px] text-slate-400">
                      Last used: {formatLastUsed(key.lastUsed)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleRevoke(key)}
                  disabled={actionLoading === key.id}
                  className="mt-3 md:mt-0 text-xs font-bold text-rose-600 hover:underline disabled:opacity-50 flex items-center gap-1"
                >
                  {actionLoading === key.id && <Loader2 className="w-3 h-3 animate-spin" />}
                  Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* API catalog */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 h-40 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4 text-rose-700 dark:text-rose-400">
          {error}
          <button
            onClick={() => {
              setLoading(true);
              fetchApis().finally(() => setLoading(false));
            }}
            className="ml-4 underline text-sm"
          >
            Retry
          </button>
        </div>
      ) : apis.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Plug className="w-12 h-12 mb-3 text-slate-300" />
          <p className="text-lg font-medium">No APIs available</p>
          <p className="text-sm mt-1">Adjust your search to find integrations.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {apis.map((api) => {
            const isConnected = api.installed || api.status === 'connected';
            const busy = actionLoading === api.id;
            return (
              <div
                key={api.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <Plug className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{api.name}</h3>
                      {(api.version || api.category) && (
                        <span className="text-xs font-mono text-slate-400">
                          {api.version || api.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      isConnected
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isConnected ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
                {api.description && (
                  <p className="text-slate-500 text-sm mb-6 line-clamp-2">{api.description}</p>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    {api.provider || api.category || 'Integration'}
                  </span>
                  <div className="flex gap-3">
                    <a
                      href="https://docs.auraos.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    >
                      Docs
                    </a>
                    {isConnected ? (
                      <a
                        href="/dashboard/integration-hub"
                        className="text-sm font-bold text-indigo-600 hover:underline"
                      >
                        Manage
                      </a>
                    ) : (
                      <button
                        onClick={() => handleConnectApi(api)}
                        disabled={busy}
                        className="text-sm font-bold text-indigo-600 hover:underline disabled:opacity-50 flex items-center gap-1"
                      >
                        {busy && <Loader2 className="w-3 h-3 animate-spin" />}
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Generate Key Modal */}
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
                  Copy this key now. For security it will not be shown again.
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
