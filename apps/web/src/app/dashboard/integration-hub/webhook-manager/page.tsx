'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Webhook,
  Plus,
  Activity,
  Trash2,
  Loader2,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface WebhookItem {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  retryCount: number;
  lastDeliveryAt: string | null;
  lastDeliveryStatus: 'success' | 'failed' | null;
  createdAt: string;
}

interface Toast {
  type: 'success' | 'error';
  message: string;
}

const AVAILABLE_EVENTS = [
  'employee.created',
  'employee.updated',
  'leave.approved',
  'leave.rejected',
  'payroll.finalized',
  'attendance.recorded',
];

function generateSecret(): string {
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

function formatDelivery(hook: WebhookItem): string {
  if (!hook.lastDeliveryAt) return 'No deliveries yet';
  const date = new Date(hook.lastDeliveryAt);
  const diffMs = Date.now() - date.getTime();
  const diffM = Math.floor(diffMs / 60000);
  const rel =
    diffM < 1 ? 'just now' : diffM < 60 ? `${diffM} mins ago` : `${Math.floor(diffM / 60)}h ago`;
  const status = hook.lastDeliveryStatus === 'success' ? '200 OK' : 'Failed';
  return `${rel} (${status})`;
}

export default function WebhookManagerPage() {
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [rowLoading, setRowLoading] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formUrl, setFormUrl] = useState('');
  const [formEvents, setFormEvents] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const showToast = useCallback((t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 4000);
  }, []);

  const loadWebhooks = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch('/api/v1/webhooks?limit=100');
      const result = await res.json();
      if (result.success) {
        setWebhooks(Array.isArray(result.data) ? result.data : []);
      } else {
        setError(result.error?.message || 'Failed to load webhooks');
      }
    } catch (err) {
      console.error('Failed to fetch webhooks:', err);
      setError('Failed to load webhooks. Please try again.');
    }
  }, []);

  useEffect(() => {
    loadWebhooks().finally(() => setLoading(false));
  }, [loadWebhooks]);

  const openModal = () => {
    setFormUrl('');
    setFormEvents([]);
    setFormError(null);
    setShowModal(true);
  };

  const toggleEvent = (evt: string) => {
    setFormEvents((prev) => (prev.includes(evt) ? prev.filter((e) => e !== evt) : [...prev, evt]));
  };

  const handleCreate = async () => {
    setFormError(null);
    if (!formUrl.trim()) {
      setFormError('Endpoint URL is required.');
      return;
    }
    try {
      new URL(formUrl);
    } catch {
      setFormError('Please enter a valid URL.');
      return;
    }
    if (formEvents.length === 0) {
      setFormError('Select at least one event.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/v1/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: formUrl.trim(),
          events: formEvents,
          secret: generateSecret(),
          retryCount: 3,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setShowModal(false);
        showToast({ type: 'success', message: 'Webhook created successfully.' });
        await loadWebhooks();
      } else {
        setFormError(result.error?.message || 'Failed to create webhook.');
      }
    } catch (err) {
      console.error('Create webhook failed:', err);
      setFormError('Failed to create webhook. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (hook: WebhookItem) => {
    setRowLoading(hook.id);
    try {
      const res = await fetch(`/api/v1/webhooks/${hook.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !hook.active }),
      });
      const result = await res.json();
      if (result.success) {
        showToast({
          type: 'success',
          message: `Webhook ${hook.active ? 'paused' : 'activated'}.`,
        });
        await loadWebhooks();
      } else {
        showToast({ type: 'error', message: result.error?.message || 'Update failed.' });
      }
    } catch (err) {
      console.error('Toggle webhook failed:', err);
      showToast({ type: 'error', message: 'Update failed. Please try again.' });
    } finally {
      setRowLoading(null);
    }
  };

  const handleTest = async (hook: WebhookItem) => {
    setRowLoading(hook.id);
    try {
      const res = await fetch(`/api/v1/webhooks/${hook.id}/test`, { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        const ok = result.data?.success;
        showToast({
          type: ok ? 'success' : 'error',
          message: ok
            ? `Test delivered (HTTP ${result.data?.statusCode}).`
            : `Test failed (HTTP ${result.data?.statusCode || 'no response'}).`,
        });
        await loadWebhooks();
      } else {
        showToast({ type: 'error', message: result.error?.message || 'Test failed.' });
      }
    } catch (err) {
      console.error('Test webhook failed:', err);
      showToast({ type: 'error', message: 'Test failed. Please try again.' });
    } finally {
      setRowLoading(null);
    }
  };

  const handleDelete = async (hook: WebhookItem) => {
    setRowLoading(hook.id);
    try {
      const res = await fetch(`/api/v1/webhooks/${hook.id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        showToast({ type: 'success', message: 'Webhook deleted.' });
        await loadWebhooks();
      } else {
        showToast({ type: 'error', message: result.error?.message || 'Delete failed.' });
      }
    } catch (err) {
      console.error('Delete webhook failed:', err);
      showToast({ type: 'error', message: 'Delete failed. Please try again.' });
    } finally {
      setRowLoading(null);
    }
  };

  const activeCount = webhooks.filter((w) => w.active).length;
  const deliveryRate =
    webhooks.length === 0
      ? '—'
      : `${Math.round(
          (webhooks.filter((w) => w.lastDeliveryStatus !== 'failed').length / webhooks.length) * 100
        )}%`;

  return (
    <div className="space-y-4 pb-6 min-h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
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
            <Webhook className="w-6 h-6 text-indigo-500" />
            Webhook Manager
          </h1>
          <p className="text-slate-500 text-sm">
            Configure event callbacks and monitor deliveries.
          </p>
        </div>
        <button
          onClick={openModal}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Webhook
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Stats */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{deliveryRate}</div>
              <div className="text-xs text-slate-500 font-bold uppercase">Delivery Rate</div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
              <Webhook className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{webhooks.length}</div>
              <div className="text-xs text-slate-500 font-bold uppercase">Total Endpoints</div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{activeCount}</div>
              <div className="text-xs text-slate-500 font-bold uppercase">Active</div>
            </div>
          </div>
        </div>

        {/* Webhook List */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {loading ? (
            <div className="p-8 flex items-center justify-center gap-2 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading webhooks...
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-rose-600 dark:text-rose-400 font-medium">{error}</p>
              <button
                onClick={() => {
                  setLoading(true);
                  loadWebhooks().finally(() => setLoading(false));
                }}
                className="mt-3 px-4 py-2 text-sm font-medium bg-rose-600 text-white rounded-lg hover:bg-rose-700"
              >
                Retry
              </button>
            </div>
          ) : webhooks.length === 0 ? (
            <div className="p-12 text-center">
              <Webhook className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500">
                No webhook endpoints configured. Click &quot;Add Webhook&quot; to create one.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-4">Events</th>
                  <th className="px-6 py-4">Target URL</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Recent Delivery</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {webhooks.map((hook) => {
                  const busy = rowLoading === hook.id;
                  return (
                    <tr key={hook.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {hook.events.map((e) => (
                            <span
                              key={e}
                              className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-indigo-600 px-2 py-0.5 rounded"
                            >
                              {e}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-500 truncate max-w-xs">
                        {hook.url}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            hook.active
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-amber-100 text-amber-600'
                          }`}
                        >
                          {hook.active ? 'Active' : 'Paused'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="flex items-center gap-1">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              hook.lastDeliveryStatus === 'failed'
                                ? 'bg-rose-500'
                                : hook.lastDeliveryStatus === 'success'
                                  ? 'bg-emerald-500'
                                  : 'bg-slate-300'
                            }`}
                          ></div>
                          {formatDelivery(hook)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 items-center">
                          <button
                            onClick={() => handleTest(hook)}
                            disabled={busy}
                            title="Send test event"
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-indigo-600 disabled:opacity-50"
                          >
                            {busy ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleToggleActive(hook)}
                            disabled={busy}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-bold text-xs disabled:opacity-50"
                          >
                            {hook.active ? 'Pause' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDelete(hook)}
                            disabled={busy}
                            title="Delete webhook"
                            className="p-2 hover:bg-rose-100 dark:hover:bg-rose-900/20 text-rose-500 rounded-lg disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Webhook Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Webhook className="w-5 h-5 text-indigo-500" /> Add Webhook
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Endpoint URL</label>
                <input
                  type="url"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://example.com/webhooks/aura"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Events</label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_EVENTS.map((evt) => (
                    <label
                      key={evt}
                      className="flex items-center gap-2 text-xs cursor-pointer bg-slate-50 dark:bg-slate-800 px-2 py-2 rounded-lg"
                    >
                      <input
                        type="checkbox"
                        checked={formEvents.includes(evt)}
                        onChange={() => toggleEvent(evt)}
                        className="accent-indigo-600"
                      />
                      <span className="font-mono">{evt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {formError && <p className="text-sm text-rose-600 dark:text-rose-400">{formError}</p>}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Webhook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
