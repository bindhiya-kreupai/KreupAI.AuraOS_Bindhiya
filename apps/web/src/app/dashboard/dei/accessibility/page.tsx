'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Accessibility,
  Eye,
  Ear,
  MousePointer,
  AlertCircle,
  CheckCircle,
  Plus,
  Loader2,
} from 'lucide-react';
import {
  listAccessibility,
  createAccessibilityRequest,
  reviewAccessibilityRequest,
  type AccessibilityRequest,
} from '../dei-api';
import { useDeiToast, DeiModal, deiInputClass } from '../dei-ui';

const REQUEST_TYPES = [
  { value: 'visual', label: 'Visual Aid' },
  { value: 'hearing', label: 'Hearing Support' },
  { value: 'physical', label: 'Physical Access' },
  { value: 'cognitive', label: 'Cognitive Support' },
  { value: 'digital', label: 'Digital Accessibility' },
  { value: 'other', label: 'Other' },
];

const STATUS_STYLE: Record<string, string> = {
  pending: 'text-amber-700 bg-amber-50 dark:bg-amber-900/20',
  processing: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20',
  approved: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20',
  rejected: 'text-rose-700 bg-rose-50 dark:bg-rose-900/20',
  fulfilled: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20',
};

export default function AccessibilityPage() {
  const [items, setItems] = useState<AccessibilityRequest[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', requestType: 'physical', description: '' });
  const { notify, ToastViewport } = useDeiToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await listAccessibility();
      setItems(res.items);
      setCounts(res.counts);
    } catch {
      notify('error', 'Failed to load accommodation requests.');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = useCallback(async () => {
    if (!form.title.trim()) {
      notify('error', 'Request title is required.');
      return;
    }
    try {
      setSubmitting(true);
      await createAccessibilityRequest({
        title: form.title.trim(),
        requestType: form.requestType,
        description: form.description.trim() || undefined,
      });
      notify('success', 'Accommodation request submitted.');
      setModalOpen(false);
      setForm({ title: '', requestType: 'physical', description: '' });
      await load();
    } catch {
      notify('error', 'Could not submit request.');
    } finally {
      setSubmitting(false);
    }
  }, [form, notify, load]);

  const review = useCallback(
    async (req: AccessibilityRequest, status: string) => {
      try {
        setBusyId(req.id);
        await reviewAccessibilityRequest(req.id, status);
        notify('success', `Request ${status}.`);
        await load();
      } catch {
        notify('error', 'Review failed.');
      } finally {
        setBusyId(null);
      }
    },
    [notify, load]
  );

  const handleAudit = useCallback(() => {
    const total = items.length;
    const resolved = items.filter(
      (r) => r.status === 'approved' || r.status === 'fulfilled'
    ).length;
    const score = total > 0 ? Math.round((resolved / total) * 100) : 100;
    const rows = ['Request ID,Type,Title,Status'];
    items.forEach((r) => rows.push(`${r.id},${r.requestType},"${r.title}",${r.status}`));
    rows.push('');
    rows.push(`Resolution score,${score}%`);
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accessibility-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notify('success', 'Audit report generated.');
  }, [items, notify]);

  const pending = items.filter((r) => r.status === 'pending' || r.status === 'processing');
  const resolvedPct =
    items.length > 0
      ? Math.round(
          (items.filter((r) => r.status === 'approved' || r.status === 'fulfilled').length /
            items.length) *
            100
        )
      : 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {ToastViewport}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Accessibility className="w-6 h-6 text-indigo-500" />
            Accessibility Center
          </h1>
          <p className="text-slate-500 text-sm">
            Manage workplace accommodations and digital accessibility compliance.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Request
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <ScoreCard
              icon={<Eye className="w-6 h-6" />}
              tint="indigo"
              label="Visual Aid"
              value={counts.visual || 0}
            />
            <ScoreCard
              icon={<Ear className="w-6 h-6" />}
              tint="purple"
              label="Hearing Support"
              value={counts.hearing || 0}
            />
            <ScoreCard
              icon={<MousePointer className="w-6 h-6" />}
              tint="emerald"
              label="Physical Access"
              value={counts.physical || 0}
            />
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Pending Accommodation Requests</h3>
            {pending.length === 0 ? (
              <p className="text-sm text-slate-500">No pending requests.</p>
            ) : (
              <div className="space-y-4">
                {pending.map((req) => (
                  <div
                    key={req.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex items-start gap-3 mb-2 md:mb-0">
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-400">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm">{req.title}</div>
                        <div className="text-xs text-slate-500 capitalize">
                          {req.requestType} • {new Date(req.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded capitalize ${
                          STATUS_STYLE[req.status] || 'text-slate-600 bg-slate-100'
                        }`}
                      >
                        {req.status}
                      </span>
                      <button
                        onClick={() => review(req, 'approved')}
                        disabled={busyId === req.id}
                        className="text-xs font-bold text-emerald-600 hover:underline disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => review(req, 'rejected')}
                        disabled={busyId === req.id}
                        className="text-xs font-bold text-rose-600 hover:underline disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-xl flex flex-col items-center text-center justify-center">
          <div className="w-32 h-32 rounded-full border-4 border-white/20 flex items-center justify-center mb-4 relative">
            <span className="text-4xl font-bold">{resolvedPct}%</span>
            <div className="absolute top-0 right-0 p-1 bg-emerald-500 rounded-full border-2 border-indigo-900">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-xl font-bold mb-1">Requests Resolved</h3>
          <p className="text-indigo-200 text-sm mb-6">
            {items.length} total accommodation request{items.length === 1 ? '' : 's'} tracked.
          </p>
          <button
            onClick={handleAudit}
            className="w-full py-3 bg-white text-indigo-900 rounded-xl font-bold hover:bg-indigo-50 transition-colors"
          >
            View Audit Report
          </button>
        </div>
      </div>

      <DeiModal
        open={modalOpen}
        title="New Accommodation Request"
        submitLabel="Submit"
        submitting={submitting}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
      >
        <div>
          <label className="block text-sm font-bold mb-1 text-slate-600 dark:text-slate-300">
            Title
          </label>
          <input
            className={deiInputClass}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Screen reader license"
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1 text-slate-600 dark:text-slate-300">
            Type
          </label>
          <select
            className={deiInputClass}
            value={form.requestType}
            onChange={(e) => setForm({ ...form, requestType: e.target.value })}
          >
            {REQUEST_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold mb-1 text-slate-600 dark:text-slate-300">
            Description
          </label>
          <textarea
            className={deiInputClass}
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe the accommodation you need"
          />
        </div>
      </DeiModal>
    </div>
  );
}

function ScoreCard({
  icon,
  tint,
  label,
  value,
}: {
  icon: React.ReactNode;
  tint: 'indigo' | 'purple' | 'emerald';
  label: string;
  value: number;
}) {
  const tints: Record<string, string> = {
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600',
  };
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
      <div className={`p-3 rounded-full ${tints[tint]}`}>{icon}</div>
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
    </div>
  );
}
