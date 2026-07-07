'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Grid, Search, Loader2, Check, Star, AlertCircle, CheckCircle2 } from 'lucide-react';

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

interface Toast {
  type: 'success' | 'error';
  message: string;
}

export default function AppDirectoryPage() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['All Apps']);
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

  const fetchApps = useCallback(async () => {
    try {
      const params = new URLSearchParams({ type: 'catalog' });
      if (activeCategory !== 'All Apps') params.set('category', activeCategory);
      if (searchQuery) params.set('search', searchQuery);

      const res = await fetch(`/api/integrations?${params.toString()}`);
      const result = await res.json();
      if (result.success && result.data) {
        const integrations = result.data.integrations || result.data || [];
        setApps(Array.isArray(integrations) ? integrations : []);
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
        const cats = Array.isArray(result.data) ? result.data.map((c: any) => c.name || c) : [];
        setCategories(['All Apps', ...cats]);
      }
    } catch {
      setCategories(['All Apps']);
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

  const handleConfigure = async (app: AppItem) => {
    if (!app.connectionId) {
      showToast({ type: 'error', message: 'No active connection to configure.' });
      return;
    }
    setActionLoading(app.id);
    try {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test', connectionId: app.connectionId }),
      });
      const result = await res.json();
      if (result.success) {
        showToast({ type: 'success', message: `${app.name} connection verified.` });
      } else {
        showToast({ type: 'error', message: result.error || 'Configuration check failed.' });
      }
    } catch (err) {
      console.error('Configure failed:', err);
      showToast({ type: 'error', message: 'Configuration check failed.' });
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
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {cat}
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

                <button
                  onClick={() => (isInstalled ? handleConfigure(app) : handleInstall(app))}
                  disabled={busy}
                  className={`w-full mt-auto py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 ${
                    isInstalled
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isInstalled ? 'Configure' : 'Install'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
