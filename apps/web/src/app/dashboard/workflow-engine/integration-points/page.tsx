'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plug,
  Plus,
  Search,
  Check,
  Power,
  RefreshCw,
  Loader2,
  Trash2,
  Pencil,
  ChevronRight,
  TestTube,
  AlertCircle,
  X,
  Save,
  Globe,
  Lock,
  Clock,
  Zap,
  ExternalLink,
  Activity,
  Settings,
  Eye,
  Copy,
  ArrowLeft,
} from 'lucide-react';
import { IntegrationService } from '../services';
import type {
  Integration,
  IntegrationAction,
  ConnectionConfig,
  AuthenticationConfig,
} from '../types';
import { toast } from 'sonner';

const TYPE_COLORS: Record<string, string> = {
  rest_api: 'bg-indigo-500',
  graphql: 'bg-pink-500',
  soap: 'bg-amber-500',
  database: 'bg-emerald-500',
  file: 'bg-slate-500',
  email: 'bg-cyan-500',
  custom: 'bg-violet-500',
};

const TYPE_LABELS: Record<string, string> = {
  rest_api: 'REST API',
  graphql: 'GraphQL',
  soap: 'SOAP',
  database: 'Database',
  file: 'File',
  email: 'Email',
  custom: 'Custom',
};

type View = 'list' | 'create' | 'edit' | 'detail';

export default function IntegrationPointsPage() {
  const [view, setView] = useState<View>('list');
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Integration | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const fetchIntegrations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await IntegrationService.getIntegrations(search || undefined);
      setIntegrations(data || []);
    } catch (error: any) {
      console.error('Failed to load integrations:', error);
      toast.error('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  const handleTest = async (id: string) => {
    setTesting(id);
    try {
      const result = await IntegrationService.testConnection(id);
      if (result.status === 'success') {
        toast.success(`Connected successfully (${result.latencyMs}ms)`);
      } else {
        toast.error(result.message || 'Connection failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Test failed');
    } finally {
      setTesting(null);
    }
  };

  const handleToggle = async (id: string) => {
    setToggling(id);
    try {
      const updated = await IntegrationService.toggleStatus(id);
      setIntegrations((prev) =>
        prev.map((i) =>
          i.id === id
            ? { ...i, status: ((updated as any).isActive ? 'ACTIVE' : 'DRAFT') as any }
            : i
        )
      );
      if (selected?.id === id)
        setSelected((prev) =>
          prev ? { ...prev, status: ((updated as any).isActive ? 'ACTIVE' : 'DRAFT') as any } : null
        );
      toast.success(`Integration ${(updated as any).isActive ? 'enabled' : 'disabled'}`);
    } catch (error: any) {
      toast.error(error.message || 'Toggle failed');
    } finally {
      setToggling(null);
    }
  };

  const handleSync = async (id: string) => {
    setSyncing(id);
    try {
      const result = await IntegrationService.syncIntegration(id);
      if (result.status === 'success') {
        toast.success(`Sync complete: ${result.recordsProcessed} records processed`);
      } else {
        toast.error(result.message || 'Sync failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Sync failed');
    } finally {
      setSyncing(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await IntegrationService.deleteIntegration(id);
      setIntegrations((prev) => prev.filter((i) => i.id !== id));
      setShowDeleteConfirm(null);
      if (selected?.id === id) {
        setSelected(null);
        setView('list');
      }
      toast.success('Integration deleted');
    } catch (error: any) {
      toast.error(error.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const openDetail = (integration: Integration) => {
    setSelected(integration);
    setView('detail');
  };

  const openEdit = (integration: Integration) => {
    setSelected(integration);
    setView('edit');
  };

  const handleSave = async (data: Partial<Integration>, id?: string) => {
    try {
      if (id) {
        const updated = await IntegrationService.updateIntegration(id, data);
        setIntegrations((prev) => prev.map((i) => (i.id === id ? { ...i, ...updated } : i)));
        setSelected(updated);
        setView('detail');
        toast.success('Integration updated');
      } else {
        const created = await IntegrationService.createIntegration(data);
        setIntegrations((prev) => [created, ...prev]);
        setView('list');
        toast.success('Integration created');
      }
    } catch (error: any) {
      toast.error(error.message || 'Save failed');
    }
  };

  const filtered = integrations;

  return (
    <div className="space-y-4 pb-6 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
      {view === 'list' && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Plug className="w-6 h-6 text-cyan-500" /> Integration Points
              </h1>
              <p className="text-slate-500 text-sm">
                Connect workflows with external tools and APIs.
              </p>
            </div>
            <button
              onClick={() => {
                setSelected(null);
                setView('create');
              }}
              className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New Integration
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search integrations..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
              <Plug className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-500 mb-2">
                {search ? 'No matching integrations' : 'No Integrations'}
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                {search
                  ? 'Try a different search term'
                  : 'Create your first integration to connect with external services.'}
              </p>
              {!search && (
                <button
                  onClick={() => {
                    setSelected(null);
                    setView('create');
                  }}
                  className="px-4 py-2 bg-cyan-500 text-white rounded-lg text-sm font-bold hover:bg-cyan-600 transition-colors"
                >
                  <Plus className="w-4 h-4 inline mr-1" /> Create Integration
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((integration) => {
                const isActive =
                  (integration.status as string)?.toUpperCase() === 'ACTIVE' ||
                  (integration as any).isActive === true;
                const type = (integration as any).integrationType || 'rest_api';
                return (
                  <div
                    key={integration.id}
                    className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3 cursor-pointer"
                    onClick={() => openDetail(integration)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl ${TYPE_COLORS[type] || 'bg-slate-500'} flex items-center justify-center text-white font-bold text-sm`}
                        >
                          {type === 'rest_api' ? (
                            <Globe className="w-5 h-5" />
                          ) : type === 'database' ? (
                            <Activity className="w-5 h-5" />
                          ) : type === 'email' ? (
                            <Zap className="w-5 h-5" />
                          ) : (
                            <Plug className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm">
                            {integration.integrationName || (integration as any).name}
                          </h3>
                          <span className="text-xs text-slate-400">
                            {TYPE_LABELS[type] || type}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggle(integration.id);
                        }}
                        disabled={toggling === integration.id}
                        className={`w-10 h-5 rounded-full p-0.5 flex items-center transition-colors ${isActive ? 'bg-emerald-500 justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start'} disabled:opacity-50`}
                      >
                        {toggling === integration.id ? (
                          <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2">
                      {integration.description || 'No description'}
                    </p>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-medium">
                      {isActive ? (
                        <span className="text-emerald-500 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-1">
                          <Power className="w-3 h-3" /> Inactive
                        </span>
                      )}
                      <span className="ml-auto flex items-center gap-2">
                        {isActive && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTest(integration.id);
                            }}
                            disabled={testing === integration.id}
                            className="text-slate-400 hover:text-cyan-500 disabled:opacity-50"
                          >
                            {testing === integration.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <TestTube className="w-3 h-3" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(integration);
                          }}
                          className="text-slate-400 hover:text-cyan-500"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(integration.id);
                          }}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {(view === 'create' || view === 'edit') && (
        <IntegrationForm
          integration={selected}
          onSave={handleSave}
          onCancel={() => {
            setSelected(null);
            setView('list');
          }}
        />
      )}

      {view === 'detail' && selected && (
        <IntegrationDetail
          integration={selected}
          onBack={() => {
            setSelected(null);
            setView('list');
          }}
          onEdit={() => setView('edit')}
          onTest={() => handleTest(selected.id)}
          onSync={() => handleSync(selected.id)}
          onToggle={() => handleToggle(selected.id)}
          onDelete={() => setShowDeleteConfirm(selected.id)}
          testing={testing === selected.id}
          syncing={syncing === selected.id}
          toggling={toggling === selected.id}
        />
      )}

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-sm w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold">Delete Integration</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to delete{' '}
              <strong>
                {integrations.find((i) => i.id === showDeleteConfirm)?.integrationName ||
                  'this integration'}
              </strong>
              ?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={!!deleting}
                className="px-4 py-2 text-sm font-bold rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
              >
                {deleting === showDeleteConfirm && <Loader2 className="w-3 h-3 animate-spin" />}{' '}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function IntegrationForm({
  integration,
  onSave,
  onCancel,
}: {
  integration: Integration | null;
  onSave: (data: Partial<Integration>, id?: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(integration?.integrationName || '');
  const [description, setDescription] = useState(integration?.description || '');
  const [type, setType] = useState(integration?.integrationType || 'rest_api');
  const [url, setUrl] = useState(integration?.connectionConfig?.baseUrl || '');
  const [timeout, setTimeout_] = useState(integration?.connectionConfig?.timeout || 30);
  const [authType, setAuthType] = useState<AuthenticationConfig['type']>(
    integration?.authentication?.type || 'none'
  );
  const [authValue, setAuthValue] = useState(integration?.authentication?.credentials?.token || '');
  const [authHeader, setAuthHeader] = useState(
    integration?.connectionConfig?.headers?.['Authorization'] || ''
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      const config: ConnectionConfig = { baseUrl: url || undefined, timeout };
      const headers: Record<string, string> = {};
      if (authType !== 'none' && authHeader) headers['Authorization'] = authHeader;
      if (Object.keys(headers).length > 0) config.headers = headers;

      const auth: AuthenticationConfig | undefined =
        authType !== 'none' ? { type: authType, credentials: { token: authValue } } : undefined;

      await onSave(
        {
          integrationName: name,
          description,
          integrationType: type as any,
          connectionConfig: config,
          authentication: auth,
          availableActions: integration?.availableActions || [],
          status: integration?.status || 'DRAFT',
        } as any,
        integration?.id
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onCancel}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">
            {integration ? 'Edit Integration' : 'New Integration'}
          </h1>
          <p className="text-slate-500 text-sm">
            {integration
              ? 'Update integration configuration'
              : 'Configure a new external integration'}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Integration Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Salesforce CRM"
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="What does this integration do?"
            className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
          />
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4" /> Connection
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5">Endpoint URL</label>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.example.com/v1"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Timeout (s)</label>
              <input
                type="number"
                value={timeout}
                onChange={(e) => setTimeout_(Number(e.target.value))}
                min={1}
                max={120}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4" /> Authentication
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Auth Type</label>
              <select
                value={authType}
                onChange={(e) => setAuthType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              >
                <option value="none">None</option>
                <option value="api_key">API Key</option>
                <option value="bearer">Bearer Token</option>
                <option value="basic">Basic Auth</option>
                <option value="oauth">OAuth 2.0</option>
              </select>
            </div>
            {authType !== 'none' && (
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {authType === 'bearer'
                    ? 'Token'
                    : authType === 'api_key'
                      ? 'API Key'
                      : 'Credentials'}
                </label>
                <input
                  type="password"
                  value={authValue}
                  onChange={(e) => setAuthValue(e.target.value)}
                  placeholder="Enter credential"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>
            )}
          </div>
          {authType !== 'none' && (
            <div className="mt-3">
              <label className="block text-sm font-medium mb-1.5">
                Authorization Header (optional override)
              </label>
              <input
                value={authHeader}
                onChange={(e) => setAuthHeader(e.target.value)}
                placeholder="Bearer xxx / Token xxx"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm font-bold rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-3 h-3 animate-spin" />} <Save className="w-3 h-3" />{' '}
            {integration ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}

function IntegrationDetail({
  integration,
  onBack,
  onEdit,
  onTest,
  onSync,
  onToggle,
  onDelete,
  testing,
  syncing,
  toggling,
}: {
  integration: Integration;
  onBack: () => void;
  onEdit: () => void;
  onTest: () => void;
  onSync: () => void;
  onToggle: () => void;
  onDelete: () => void;
  testing: boolean;
  syncing: boolean;
  toggling: boolean;
}) {
  const isActive =
    (integration.status as string)?.toUpperCase() === 'ACTIVE' ||
    (integration as any).isActive === true;
  const type = (integration as any).integrationType || 'rest_api';
  const config = integration.connectionConfig || {};

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg ${TYPE_COLORS[type] || 'bg-slate-500'} flex items-center justify-center text-white`}
            >
              {type === 'rest_api' ? <Globe className="w-4 h-4" /> : <Plug className="w-4 h-4" />}
            </div>
            <div>
              <h1 className="text-xl font-bold">
                {integration.integrationName || (integration as any).name}
              </h1>
              <p className="text-xs text-slate-500">
                {TYPE_LABELS[type] || type} &middot; {integration.description || 'No description'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1"
          >
            <Pencil className="w-3 h-3" /> Edit
          </button>
          <button
            onClick={onToggle}
            disabled={toggling}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 ${isActive ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-emerald-500 text-white hover:bg-emerald-600'} disabled:opacity-50`}
          >
            {toggling ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Power className="w-3 h-3" />
            )}{' '}
            {isActive ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4" /> Connection
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Endpoint</span>
                <span className="font-mono text-xs">{config.baseUrl || 'Not configured'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Timeout</span>
                <span>{config.timeout || 30}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Auth Type</span>
                <span>{integration.authentication?.type || 'None'}</span>
              </div>
            </div>
          </div>

          {(integration.availableActions || []).length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Actions ({integration.availableActions.length})
              </h3>
              <div className="space-y-2">
                {integration.availableActions.map((action) => (
                  <div
                    key={action.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm"
                  >
                    <div>
                      <span className="font-medium">{action.actionName}</span>
                      <span className="ml-2 text-xs text-slate-400">
                        {action.method || action.actionType}
                      </span>
                    </div>
                    {action.endpoint && (
                      <span className="text-xs text-slate-400 font-mono">{action.endpoint}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(integration.usedInWorkflows || []).length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" /> Used In Workflows (
                {integration.usedInWorkflows.length})
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {integration.usedInWorkflows.map((wf) => (
                  <span
                    key={wf}
                    className="px-2 py-0.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded text-xs font-medium"
                  >
                    {wf}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4" /> Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Active</span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold ${isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}
                >
                  {isActive ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Last Tested</span>
                <span className="text-sm">{integration.lastTestedDate || 'Never'}</span>
              </div>
              {integration.lastTestedStatus && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Test Result</span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold ${integration.lastTestedStatus === 'success' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}
                  >
                    {integration.lastTestedStatus}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Created</span>
                <span className="text-sm">{integration.createdDate || '—'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-2">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" /> Quick Actions
            </h3>
            <button
              onClick={onTest}
              disabled={testing || !isActive}
              className="w-full px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {testing ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <TestTube className="w-3 h-3" />
              )}{' '}
              Test Connection
            </button>
            <button
              onClick={onSync}
              disabled={syncing || !isActive}
              className="w-full px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {syncing ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}{' '}
              Sync Now
            </button>
            <button
              onClick={onDelete}
              className="w-full px-3 py-2 text-sm font-bold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-3 h-3" /> Delete Integration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
