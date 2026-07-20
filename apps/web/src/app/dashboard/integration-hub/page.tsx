'use client';

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Plug,
  Store,
  Webhook,
  Key,
  RefreshCw,
  Unplug,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Clock,
  Zap,
  Search,
} from 'lucide-react';

interface ConnectionItem {
  id: string;
  integrationId: string;
  name: string;
  provider?: string;
  category?: string;
  status: string; // 'connected' | 'error' | 'syncing' | 'disconnected' | 'ACTIVE' | ...
  lastSyncAt?: string | null;
  configuration?: Record<string, any>;
}

interface CatalogItem {
  id: string;
  name: string;
  provider?: string;
  category?: string;
}

interface Toast {
  type: 'success' | 'error';
  message: string;
}

function normalizeStatus(status?: string): 'connected' | 'error' | 'syncing' | 'disconnected' {
  const s = (status || '').toLowerCase();
  if (s === 'connected' || s === 'active' || s === 'needs_config') return 'connected';
  if (s === 'error' || s === 'failed') return 'error';
  if (s === 'syncing' || s === 'pending' || s === 'in_progress') return 'syncing';
  return 'disconnected';
}

function getStatusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === 'needs_config') {
    return {
      label: 'Needs Config',
      className: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
      icon: AlertCircle,
    };
  }
  switch (normalizeStatus(status)) {
    case 'connected':
      return {
        label: 'Connected',
        className: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
        icon: CheckCircle2,
      };
    case 'error':
      return {
        label: 'Error',
        className: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
        icon: AlertCircle,
      };
    case 'syncing':
      return {
        label: 'Syncing',
        className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
        icon: Loader2,
      };
    default:
      return {
        label: 'Disconnected',
        className: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
        icon: Unplug,
      };
  }
}

function formatLastSync(iso?: string | null): string {
  if (!iso) return 'Never';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Never';
  const diffMs = Date.now() - date.getTime();
  const diffS = Math.floor(diffMs / 1000);
  if (diffS < 60) return `${diffS}s ago`;
  const diffM = Math.floor(diffS / 60);
  if (diffM < 60) return `${diffM} min ago`;
  const diffH = Math.floor(diffM / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return `${Math.floor(diffH / 24)}d ago`;
}

function IntegrationHubPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [webhookCount, setWebhookCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const showToast = useCallback((t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 4000);
  }, []);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [connRes, catRes, whRes] = await Promise.all([
        fetch('/api/integrations?type=connections').then((r) => r.json()),
        fetch('/api/integrations?type=catalog').then((r) => r.json()),
        fetch('/api/v1/webhooks?active=true&limit=1').then((r) => r.json()),
      ]);

      if (connRes.success) {
        const raw = Array.isArray(connRes.data) ? connRes.data : connRes.data?.connections || [];
        setConnections(
          raw.map((c: any) => ({
            id: c.id,
            integrationId: c.integrationId || c.integration?.id || c.id,
            name:
              c.integrationName ||
              c.name ||
              c.integration?.name ||
              c.integrationId ||
              'Integration',
            provider: c.provider || c.integration?.provider,
            category: c.category || c.integration?.category,
            status: c.status || 'connected',
            lastSyncAt: c.lastSyncAt || c.lastSync || null,
            configuration: c.configuration ?? {},
          }))
        );
      } else {
        setConnections([]);
      }

      if (catRes.success) {
        const raw = catRes.data?.integrations || catRes.data || [];
        setCatalog(Array.isArray(raw) ? raw : []);
      } else {
        setCatalog([]);
      }

      if (whRes.success && whRes.pagination) {
        setWebhookCount(whRes.pagination.total || 0);
      } else if (whRes.success && Array.isArray(whRes.data)) {
        setWebhookCount(whRes.data.length);
      }
    } catch (err) {
      console.error('Failed to load integration hub:', err);
      setError('Failed to load integrations. Please try again.');
    }
  }, []);

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  // AURA-208: read OAuth callback query params (?connected= / ?error=)
  useEffect(() => {
    const connected = searchParams.get('connected');
    const oauthError = searchParams.get('error');
    if (connected) {
      showToast({
        type: 'success',
        message: `${connected.charAt(0).toUpperCase() + connected.slice(1)} connected successfully.`,
      });
      loadData();
      router.replace('/dashboard/integration-hub');
    } else if (oauthError) {
      const label = oauthError.replace(/_/g, ' ');
      showToast({ type: 'error', message: `Connection failed: ${label}.` });
      router.replace('/dashboard/integration-hub');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const stats = useMemo(() => {
    const connected = connections.filter((c) => normalizeStatus(c.status) === 'connected').length;
    const syncErrors = connections.filter((c) => normalizeStatus(c.status) === 'error').length;
    const available = Math.max(catalog.length - connections.length, 0);
    return [
      {
        label: 'Connected Integrations',
        value: connected,
        icon: Plug,
        color: 'text-celestial-indigo',
      },
      { label: 'Available', value: available, icon: Store, color: 'text-aurora-green' },
      { label: 'Webhooks Active', value: webhookCount, icon: Webhook, color: 'text-amber-500' },
      { label: 'Sync Errors', value: syncErrors, icon: AlertCircle, color: 'text-rose-500' },
    ];
  }, [connections, catalog, webhookCount]);

  const filteredIntegrations = useMemo(() => {
    return connections.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || normalizeStatus(c.status) === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [connections, searchQuery, filterStatus]);

  const handleSync = async (conn: ConnectionItem) => {
    setActionLoading(conn.id);
    try {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync',
          connectionId: conn.id,
          entity: 'all',
          syncType: 'INCREMENTAL',
        }),
      });
      const result = await res.json();
      if (result.success) {
        showToast({ type: 'success', message: `Sync started for ${conn.name}.` });
        await loadData();
      } else {
        showToast({ type: 'error', message: result.error || 'Sync failed.' });
      }
    } catch (err) {
      console.error('Sync failed:', err);
      showToast({ type: 'error', message: 'Sync failed. Please try again.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisconnect = async (conn: ConnectionItem) => {
    setActionLoading(conn.id);
    try {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect', connectionId: conn.id }),
      });
      const result = await res.json();
      if (result.success) {
        showToast({ type: 'success', message: `${conn.name} disconnected.` });
        await loadData();
      } else {
        showToast({ type: 'error', message: result.error || 'Disconnect failed.' });
      }
    } catch (err) {
      console.error('Disconnect failed:', err);
      showToast({ type: 'error', message: 'Disconnect failed. Please try again.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleConnect = async (conn: ConnectionItem) => {
    setActionLoading(conn.id);
    try {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'connect',
          integrationId: conn.integrationId,
          configuration: conn.configuration ?? {},
          credentials: {},
        }),
      });
      const result = await res.json();
      if (result.success) {
        showToast({ type: 'success', message: `${conn.name} connected.` });
        await loadData();
      } else {
        showToast({ type: 'error', message: result.error || 'Connect failed.' });
      }
    } catch (err) {
      console.error('Connect failed:', err);
      showToast({ type: 'error', message: 'Connect failed. Please try again.' });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-celestial-indigo" />
          <span className="text-silver-mist">Loading integrations...</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/30 h-24 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-center">
        <p className="text-rose-600 dark:text-rose-400 font-medium">{error}</p>
        <button
          onClick={() => {
            setLoading(true);
            loadData().finally(() => setLoading(false));
          }}
          className="mt-3 px-4 py-2 text-sm font-medium bg-rose-600 text-white rounded-lg hover:bg-rose-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
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

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <Plug className="w-6 h-6 text-celestial-indigo" />
            Integration Hub
          </h1>
          <p className="text-silver-mist text-sm">
            Manage API integrations, webhooks, and connect third-party applications.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/dashboard/integration-hub/app-directory')}
            className="px-3 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-deep-cosmos transition-colors flex items-center gap-2 text-ink-black dark:text-pearl"
          >
            <Store className="w-4 h-4 text-celestial-indigo" />
            Browse Marketplace
          </button>
          <button
            onClick={() => router.push('/dashboard/integration-hub/webhook-manager')}
            className="px-3 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-deep-cosmos transition-colors flex items-center gap-2 text-ink-black dark:text-pearl"
          >
            <Webhook className="w-4 h-4 text-celestial-indigo" />
            Create Webhook
          </button>
          <button
            onClick={() => router.push('/dashboard/integration-hub/api-marketplace')}
            className="px-3 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-deep-cosmos transition-colors flex items-center gap-2 text-ink-black dark:text-pearl"
          >
            <Key className="w-4 h-4 text-celestial-indigo" />
            API Marketplace
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/30 shadow-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <div className={`p-2 rounded-lg bg-gray-50 dark:bg-deep-cosmos ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-ink-black dark:text-pearl">{stat.value}</h3>
            <p className="text-xs text-silver-mist font-medium mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
          <input
            type="text"
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-lg text-sm text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-lg text-sm text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50"
        >
          <option value="all">All Status</option>
          <option value="connected">Connected</option>
          <option value="error">Error</option>
          <option value="syncing">Syncing</option>
          <option value="disconnected">Disconnected</option>
        </select>
      </div>

      {/* Connected Integrations Grid */}
      <div>
        <h2 className="text-lg font-bold text-ink-black dark:text-pearl mb-4">Integrations</h2>
        {filteredIntegrations.length === 0 ? (
          <div className="bg-white dark:bg-stellar-blue p-8 rounded-xl border border-cloud dark:border-nebula-purple/30 text-center">
            <Plug className="w-10 h-10 text-silver-mist mx-auto mb-3" />
            <p className="text-silver-mist">
              No connected integrations. Browse the App Directory to connect your first app.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {filteredIntegrations.map((integration) => {
              const normalized = normalizeStatus(integration.status);
              const badge = getStatusBadge(integration.status);
              const BadgeIcon = badge.icon;
              const isBusy = actionLoading === integration.id;
              return (
                <div
                  key={integration.id}
                  className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/30 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-deep-cosmos flex items-center justify-center">
                      <Zap className="w-5 h-5 text-celestial-indigo" />
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${badge.className}`}
                    >
                      <BadgeIcon
                        className={`w-3 h-3 ${normalized === 'syncing' ? 'animate-spin' : ''}`}
                      />
                      {badge.label}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-ink-black dark:text-pearl">
                    {integration.name}
                  </h3>
                  <p className="text-xs text-silver-mist mt-0.5">
                    {integration.provider || integration.category || '—'}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-silver-mist">
                    <Clock className="w-3 h-3" />
                    <span>{formatLastSync(integration.lastSyncAt)}</span>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-cloud dark:border-nebula-purple/30">
                    {normalized !== 'disconnected' && (
                      <button
                        onClick={() => handleSync(integration)}
                        disabled={isBusy}
                        className="flex-1 text-xs px-2 py-1.5 bg-gray-50 dark:bg-deep-cosmos rounded-md text-ink-black dark:text-pearl hover:bg-gray-100 dark:hover:bg-nebula-purple/20 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        {isBusy ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3" />
                        )}{' '}
                        Sync
                      </button>
                    )}
                    <button
                      onClick={() =>
                        normalized === 'disconnected'
                          ? handleConnect(integration)
                          : handleDisconnect(integration)
                      }
                      disabled={isBusy}
                      className="flex-1 text-xs px-2 py-1.5 bg-gray-50 dark:bg-deep-cosmos rounded-md text-ink-black dark:text-pearl hover:bg-gray-100 dark:hover:bg-nebula-purple/20 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      {isBusy ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : normalized === 'disconnected' ? (
                        <>
                          <Plug className="w-3 h-3" /> Connect
                        </>
                      ) : (
                        <>
                          <Unplug className="w-3 h-3" /> Disconnect
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function IntegrationHubPage() {
  return (
    <Suspense fallback={null}>
      <IntegrationHubPageInner />
    </Suspense>
  );
}
