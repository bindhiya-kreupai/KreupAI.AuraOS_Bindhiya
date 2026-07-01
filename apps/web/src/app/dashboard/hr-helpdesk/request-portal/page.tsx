'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  LayoutList,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';
import {
  ServiceRequestsApi,
  CatalogApi,
  type ServiceRequestDTO,
  type CatalogItemDTO,
} from '../services';

function statusBadge(status: string) {
  const s = status.toUpperCase();
  if (s === 'COMPLETED')
    return { cls: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 className="w-3 h-3" /> };
  if (s === 'REJECTED' || s === 'CANCELLED')
    return { cls: 'bg-rose-100 text-rose-700', icon: <XCircle className="w-3 h-3" /> };
  return { cls: 'bg-indigo-100 text-indigo-700', icon: <Clock className="w-3 h-3" /> };
}

export default function RequestPortalPage() {
  const [requests, setRequests] = useState<ServiceRequestDTO[]>([]);
  const [catalog, setCatalog] = useState<CatalogItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ service: '', description: '' });

  const notify = useCallback((type: 'success' | 'error', msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 4000);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [reqs, items] = await Promise.all([ServiceRequestsApi.list(), CatalogApi.list()]);
      setRequests(reqs);
      setCatalog(items);
    } catch {
      notify('error', 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.service.trim()) {
        notify('error', 'Please choose or enter a service');
        return;
      }
      setSaving(true);
      try {
        await ServiceRequestsApi.create({
          service: form.service.trim(),
          description: form.description.trim() || undefined,
        });
        notify('success', 'Request submitted');
        setShowModal(false);
        setForm({ service: '', description: '' });
        await load();
      } catch {
        notify('error', 'Failed to submit request');
      } finally {
        setSaving(false);
      }
    },
    [form, notify, load]
  );

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LayoutList className="w-6 h-6 text-indigo-500" />
            My Requests
          </h1>
          <p className="text-slate-500 text-sm">Track the status of your service requests.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Request
        </button>
      </div>

      {feedback && (
        <div
          className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          <AlertCircle className="w-4 h-4" /> {feedback.msg}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="py-24 text-center text-sm text-slate-400">
            No requests yet. Create your first one.
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-4">Request ID</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Submitted On</th>
                <th className="px-6 py-4">Current Stage</th>
                <th className="px-6 py-4">Est. Completion</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {requests.map((req) => {
                const badge = statusBadge(req.status);
                return (
                  <tr
                    key={req.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-400">
                      {req.requestNumber}
                    </td>
                    <td className="px-6 py-4 font-bold">{req.service}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(req.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{req.currentStage || '—'}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {req.estCompletion ? new Date(req.estCompletion).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit ${badge.cls}`}
                      >
                        {badge.icon}
                        {req.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-bold text-lg">New Request</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Service</label>
                {catalog.length > 0 ? (
                  <select
                    value={form.service}
                    onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select a service…</option>
                    {catalog.map((c) => (
                      <option key={c.id} value={c.title}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={form.service}
                    onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Describe the service you need"
                    required
                  />
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Details</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Add any additional details"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
