'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid,
  Search,
  Loader2,
  Check,
  Star,
  AlertCircle,
  CheckCircle2,
  X,
  Save,
  Plug,
} from 'lucide-react';

interface AppItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  provider?: string;
  rating?: number;
  installCount?: number;
  users?: string;
  installed?: boolean;
  status?: string;
  connectionId?: string;
}

interface CategoryItem {
  id: string;
  name: string;
}

interface ConfigProperty {
  id: string;
  label: string;
  type: string;
  required: boolean;
  section: string;
  defaultValue?: any;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    options?: { value: any; label: string }[];
  };
  helpText?: string;
}

interface ConfigSection {
  id: string;
  title: string;
  order: number;
}

interface ConfigurationSchema {
  properties: ConfigProperty[];
  sections: ConfigSection[];
}

interface Toast {
  type: 'success' | 'error';
  message: string;
}

export default function AppDirectoryPage() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([
    { id: 'All Apps', name: 'All Apps' },
  ]);
  const [activeCategory, setActiveCategory] = useState('All Apps');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback((t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Config modal state
  const [configModal, setConfigModal] = useState<{
    app: AppItem;
    schema: ConfigurationSchema;
    configValues: Record<string, any>;
    saving: boolean;
    testing: boolean;
    testResult: { success: boolean; latency?: number; error?: string } | null;
    error: string | null;
  } | null>(null);

  const fetchApps = useCallback(async () => {
    try {
      const params = new URLSearchParams({ type: 'marketplace' });
      if (activeCategory !== 'All Apps') params.set('category', activeCategory);
      if (searchQuery) params.set('search', searchQuery);

      const res = await fetch(`/api/integrations?${params.toString()}`);
      const result = await res.json();
      if (result.success && result.data) {
        const listings = result.data.listings || result.data || [];
        const raw = Array.isArray(listings) ? listings : [];
        setApps(
          raw.map((item: any) => ({
            id: item.integration.id,
            name: item.integration.name,
            nameAr: item.integration.nameAr,
            description: item.integration.description,
            descriptionAr: item.integration.descriptionAr,
            category: item.integration.category,
            provider: item.integration.vendor || item.integration.provider,
            rating: item.rating,
            installCount: item.installCount,
            installed: item.isInstalled,
            connectionId: item.connectionId,
          }))
        );
        setError(null);
      } else {
        setApps([]);
      }
    } catch (err) {
      console.error('Failed to fetch apps:', err);
      setError('Failed to load app directory.');
    }
  }, [activeCategory, searchQuery]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/integrations?type=categories');
      const result = await res.json();
      if (result.success && result.data) {
        const cats = Array.isArray(result.data)
          ? result.data.map((c: any) => ({ id: c.id || c, name: c.name || c }))
          : [];
        setCategories([{ id: 'All Apps', name: 'All Apps' }, ...cats]);
      }
    } catch {
      setCategories([{ id: 'All Apps', name: 'All Apps' }]);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchApps(), fetchCategories()]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading) fetchApps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => fetchApps(), 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleInstall = async (app: AppItem) => {
    setActionLoading(app.id);
    try {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'connect',
          integrationId: app.id,
          configuration: {},
          credentials: {},
        }),
      });
      const result = await res.json();
      if (result.success) {
        showToast({ type: 'success', message: `${app.name} installed.` });
        setApps((prev) =>
          prev.map((a) =>
            a.id === app.id
              ? { ...a, installed: true, connectionId: result.data?.id, status: 'connected' }
              : a
          )
        );
      } else {
        showToast({ type: 'error', message: result.error || 'Install failed.' });
      }
    } catch (err) {
      console.error('Install failed:', err);
      showToast({ type: 'error', message: 'Install failed. Please try again.' });
    } finally {
      setActionLoading(null);
    }
  };

  const openConfigModal = async (app: AppItem) => {
    if (!app.connectionId) {
      showToast({ type: 'error', message: 'No active connection to configure.' });
      return;
    }
    try {
      const [detailRes, connRes] = await Promise.all([
        fetch(`/api/integrations?type=detail&integrationId=${app.id}`),
        fetch(`/api/integrations?type=connection&connectionId=${app.connectionId}`),
      ]);
      const detail = await detailRes.json();
      const conn = await connRes.json();

      if (!detail.success || !conn.success) {
        showToast({ type: 'error', message: 'Failed to load configuration.' });
        return;
      }

      const schema: ConfigurationSchema = detail.data.configSchema || {
        properties: [],
        sections: [],
      };
      const existingConfig: Record<string, any> = conn.data.configuration || {};

      const configValues: Record<string, any> = {};
      for (const prop of schema.properties) {
        configValues[prop.id] = existingConfig[prop.id] ?? prop.defaultValue ?? '';
      }

      setConfigModal({
        app,
        schema,
        configValues,
        saving: false,
        testing: false,
        testResult: null,
        error: null,
      });
    } catch {
      showToast({ type: 'error', message: 'Failed to load configuration.' });
    }
  };

  const handleConfigChange = (propId: string, value: any) => {
    setConfigModal((prev) =>
      prev
        ? {
            ...prev,
            configValues: { ...prev.configValues, [propId]: value },
            error: null,
            testResult: null,
          }
        : prev
    );
  };

  const handleSaveConfig = async () => {
    const modal = configModal;
    if (!modal) return;
    setConfigModal({ ...modal, saving: true, error: null });
    try {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-config',
          connectionId: modal.app.connectionId,
          configuration: modal.configValues,
        }),
      });
      const result = await res.json();
      if (result.success) {
        showToast({ type: 'success', message: `${modal.app.name} configuration saved.` });
        setConfigModal((prev) => (prev ? { ...prev, saving: false } : prev));
      } else {
        setConfigModal((prev) =>
          prev ? { ...prev, saving: false, error: result.error || 'Save failed.' } : prev
        );
      }
    } catch {
      setConfigModal((prev) => (prev ? { ...prev, saving: false, error: 'Save failed.' } : prev));
    }
  };

  const handleTestConnection = async () => {
    const modal = configModal;
    if (!modal) return;
    setConfigModal({ ...modal, testing: true, testResult: null, error: null });
    try {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test', connectionId: modal.app.connectionId }),
      });
      const result = await res.json();
      if (result.success) {
        setConfigModal((prev) =>
          prev ? { ...prev, testing: false, testResult: result.data } : prev
        );
      } else {
        setConfigModal((prev) =>
          prev
            ? {
                ...prev,
                testing: false,
                testResult: { success: false, error: result.error || 'Test failed.' },
              }
            : prev
        );
      }
    } catch {
      setConfigModal((prev) =>
        prev
          ? { ...prev, testing: false, testResult: { success: false, error: 'Test failed.' } }
          : prev
      );
    }
  };

  const closeConfigModal = () => {
    setConfigModal(null);
  };

  const handleDisconnect = async (app: AppItem) => {
    if (!app.connectionId) return;
    setActionLoading(app.id);
    try {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect', connectionId: app.connectionId }),
      });
      const result = await res.json();
      if (result.success) {
        showToast({ type: 'success', message: `${app.name} disconnected.` });
        setApps((prev) =>
          prev.map((a) =>
            a.id === app.id
              ? { ...a, installed: false, connectionId: undefined, status: undefined }
              : a
          )
        );
      } else {
        showToast({ type: 'error', message: result.error || 'Disconnect failed.' });
      }
    } catch (err) {
      console.error('Disconnect failed:', err);
      showToast({ type: 'error', message: 'Disconnect failed.' });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 pb-6 text-slate-900 dark:text-slate-100">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
          <span className="text-slate-500">Loading app directory...</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 h-48 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

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
            <Grid className="w-6 h-6 text-indigo-500" />
            App Directory
          </h1>
          <p className="text-slate-500 text-sm">Explore and install third-party integrations.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${
              activeCategory === cat.id
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {error ? (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4 text-rose-700 dark:text-rose-400">
          {error}
          <button
            onClick={() => {
              setLoading(true);
              fetchApps().finally(() => setLoading(false));
            }}
            className="ml-4 underline text-sm"
          >
            Retry
          </button>
        </div>
      ) : apps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Grid className="w-12 h-12 mb-3 text-slate-300" />
          <p className="text-lg font-medium">No apps found</p>
          <p className="text-sm mt-1">Try adjusting your search or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {apps.map((app) => {
            const isInstalled = app.installed || app.status === 'connected';
            const busy = actionLoading === app.id;
            return (
              <div
                key={app.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-xl">
                    {app.name?.[0] || '?'}
                  </div>
                  {isInstalled && (
                    <span className="flex items-center gap-1 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 px-2 py-1 rounded text-[10px] font-bold uppercase">
                      <Check className="w-3 h-3" /> Installed
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-lg mb-1">{app.name}</h3>
                <p className="text-xs font-bold text-slate-400 mb-2 uppercase">{app.category}</p>
                {app.description && (
                  <p className="text-sm text-slate-500 mb-4 flex-1 line-clamp-2">
                    {app.description}
                  </p>
                )}
                {(app.rating != null || app.installCount != null || app.users) && (
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                    {app.rating != null && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {app.rating}
                      </span>
                    )}
                    {(app.users || app.installCount != null) && (
                      <span>{app.users || `${app.installCount?.toLocaleString()} installs`}</span>
                    )}
                  </div>
                )}

                {isInstalled ? (
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => openConfigModal(app)}
                      disabled={busy}
                      className="flex-1 py-2 rounded-lg text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                      Configure
                    </button>
                    <button
                      onClick={() => handleDisconnect(app)}
                      disabled={busy}
                      className="py-2 px-3 rounded-lg text-sm font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/10 hover:bg-rose-100 dark:hover:bg-rose-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                      Uninstall
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleInstall(app)}
                    disabled={busy}
                    className="w-full mt-auto py-2 rounded-lg text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                    Install
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Config Modal */}
      {configModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={closeConfigModal}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold">{configModal.app.name} Configuration</h2>
              <button
                onClick={closeConfigModal}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {configModal.error && (
                <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-3 text-sm text-rose-700 dark:text-rose-400">
                  {configModal.error}
                </div>
              )}

              {configModal.testResult && (
                <div
                  className={`rounded-xl p-3 text-sm flex items-center gap-2 ${
                    configModal.testResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                      : 'bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400'
                  }`}
                >
                  {configModal.testResult.success ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      Connection verified ({configModal.testResult.latency}ms)
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {configModal.testResult.error || 'Connection failed'}
                    </>
                  )}
                </div>
              )}

              {configModal.schema.sections.map((section) => {
                const sectionProps = configModal.schema.properties.filter(
                  (p) => p.section === section.id
                );
                if (sectionProps.length === 0) return null;
                return (
                  <div key={section.id}>
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase">
                      {section.title}
                    </h3>
                    {sectionProps.map((prop) => (
                      <div key={prop.id} className="mb-3">
                        <label className="block text-sm font-medium mb-1">
                          {prop.label}
                          {prop.required && <span className="text-rose-500 ml-1">*</span>}
                        </label>
                        {prop.type === 'BOOLEAN' ? (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!configModal.configValues[prop.id]}
                              onChange={(e) => handleConfigChange(prop.id, e.target.checked)}
                              className="rounded border-slate-300 dark:border-slate-700"
                            />
                            <span className="text-sm text-slate-500">{prop.helpText || ''}</span>
                          </label>
                        ) : prop.type === 'SELECT' && prop.validation?.options ? (
                          <select
                            value={configModal.configValues[prop.id] || ''}
                            onChange={(e) => handleConfigChange(prop.id, e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">Select...</option>
                            {prop.validation.options.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={
                              prop.type === 'PASSWORD'
                                ? 'password'
                                : prop.type === 'NUMBER'
                                  ? 'number'
                                  : 'text'
                            }
                            value={configModal.configValues[prop.id] || ''}
                            onChange={(e) =>
                              handleConfigChange(
                                prop.id,
                                prop.type === 'NUMBER' ? Number(e.target.value) : e.target.value
                              )
                            }
                            placeholder={prop.helpText || ''}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}

              {configModal.schema.properties.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">
                  No configuration options available.
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={handleTestConnection}
                disabled={configModal.testing || configModal.saving}
                className="px-4 py-2 rounded-lg text-sm font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2"
              >
                {configModal.testing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plug className="w-4 h-4" />
                )}
                Test Connection
              </button>
              <button
                onClick={handleSaveConfig}
                disabled={configModal.saving || configModal.testing}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
              >
                {configModal.saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
