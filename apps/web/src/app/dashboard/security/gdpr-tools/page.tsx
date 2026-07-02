'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Database, Eraser, Search, UserX, History, Clock, X, Loader2, Inbox } from 'lucide-react';
import { APIClient } from '@/lib/api-client';
import { ToastContainer } from '@/app/dashboard/security/components/Toast';
import type { Toast as ToastType } from '@/app/dashboard/security/types';

interface DsarRow {
  id: string;
  requestType: string;
  subjectName: string;
  subjectEmail: string;
  subjectId?: string | null;
  status: string;
  priority: string;
  dueDate?: string | null;
  details?: string | null;
  assignedTo?: string | null;
  completedAt?: string | null;
}

interface ConsentRow {
  id: string;
  subjectId: string;
  category: string;
  granted: boolean;
}

const REQUEST_TYPES = ['access', 'erasure', 'rectification', 'portability', 'restriction'];
const PRIORITIES = ['low', 'medium', 'high'];

const emptyForm = {
  requestType: 'access',
  subjectName: '',
  subjectEmail: '',
  subjectId: '',
  priority: 'medium',
  details: '',
};

function statusClasses(status: string): string {
  if (status === 'completed') return 'bg-emerald-100 text-emerald-700';
  if (status === 'rejected') return 'bg-rose-100 text-rose-700';
  if (status === 'new') return 'bg-amber-100 text-amber-700';
  return 'bg-indigo-100 text-indigo-700';
}

function daysUntil(due?: string | null): string {
  if (!due) return '-';
  const diff = Math.ceil((new Date(due).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  if (diff < 0) return 'Overdue';
  return `${diff} Days`;
}

export default function GDPRToolsPage() {
  const [requests, setRequests] = useState<DsarRow[]>([]);
  const [consents, setConsents] = useState<ConsentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  const [detail, setDetail] = useState<DsarRow | null>(null);
  const [detailConsents, setDetailConsents] = useState<ConsentRow[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const [confirmAnonymize, setConfirmAnonymize] = useState(false);
  const [anonymizeSubject, setAnonymizeSubject] = useState('');

  const pushToast = useCallback((type: ToastType['type'], message: string) => {
    setToasts((prev) => [...prev, { id: crypto.randomUUID(), type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [dsarRes, consentRes] = await Promise.all([
        APIClient.get('/api/security/dsar'),
        APIClient.get('/api/security/consent'),
      ]);
      setRequests(APIClient.unwrapList<DsarRow>(dsarRes));
      setConsents(APIClient.unwrapList<ConsentRow>(consentRes));
    } catch {
      pushToast('error', 'Failed to load GDPR data');
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const submitDsar = async () => {
    if (!form.subjectName.trim() || !form.subjectEmail.trim()) {
      pushToast('warning', 'Subject name and email are required');
      return;
    }
    setSaving(true);
    try {
      await APIClient.post('/api/security/dsar', {
        requestType: form.requestType,
        subjectName: form.subjectName.trim(),
        subjectEmail: form.subjectEmail.trim(),
        subjectId: form.subjectId.trim() || undefined,
        priority: form.priority,
        details: form.details.trim() || undefined,
      });
      pushToast('success', 'DSAR request created');
      setShowForm(false);
      setForm({ ...emptyForm });
      await fetchData();
    } catch {
      pushToast('error', 'Failed to create DSAR request');
    } finally {
      setSaving(false);
    }
  };

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setDetail(null);
    setDetailConsents([]);
    try {
      const res = await APIClient.get(`/api/security/dsar/${id}`);
      const item = APIClient.unwrapItem<DsarRow & { consentRecords?: ConsentRow[] }>(res);
      if (item) {
        setDetail(item);
        setDetailConsents(item.consentRecords ?? []);
      }
    } catch {
      pushToast('error', 'Failed to load request details');
    } finally {
      setDetailLoading(false);
    }
  };

  const toggleConsent = async (category: string, subjectId: string, granted: boolean) => {
    try {
      await APIClient.put('/api/security/consent', { subjectId, category, granted: !granted });
      pushToast('success', `Consent for ${category} ${!granted ? 'granted' : 'revoked'}`);
      await fetchData();
    } catch {
      pushToast('error', 'Failed to update consent');
    }
  };

  const runAnonymize = async () => {
    if (!anonymizeSubject.trim()) {
      pushToast('warning', 'Enter a subject identifier to anonymize');
      return;
    }
    setSaving(true);
    try {
      await APIClient.post('/api/security/gdpr/anonymize', { subjectId: anonymizeSubject.trim() });
      pushToast('success', 'Anonymization action recorded');
      setConfirmAnonymize(false);
      setAnonymizeSubject('');
      await fetchData();
    } catch {
      pushToast('error', 'Failed to run anonymization');
    } finally {
      setSaving(false);
    }
  };

  const pendingCount = requests.filter(
    (r) => r.status === 'new' || r.status === 'in-progress'
  ).length;
  const completedCount = requests.filter((r) => r.status === 'completed').length;
  const erasureCount = requests.filter((r) => r.requestType === 'erasure').length;

  // Distinct consent categories for the manager panel.
  const consentByCategory = Array.from(
    consents
      .reduce((map, c) => {
        if (!map.has(c.category)) map.set(c.category, c);
        return map;
      }, new Map<string, ConsentRow>())
      .values()
  );

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Database className="w-6 h-6 text-indigo-500" />
            GDPR Tools
          </h1>
          <p className="text-slate-500 text-sm">
            Manage Data Subject Access Requests (DSAR) and Right to be Forgotten.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20"
        >
          <Search className="w-4 h-4" /> New DSAR Request
        </button>
      </div>

      {/* Inline create form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">
              New DSAR Request
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-sm">
              <span className="block text-xs font-bold text-slate-500 mb-1">Request Type</span>
              <select
                value={form.requestType}
                onChange={(e) => setForm({ ...form, requestType: e.target.value })}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900"
              >
                {REQUEST_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="block text-xs font-bold text-slate-500 mb-1">Priority</span>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="block text-xs font-bold text-slate-500 mb-1">Subject Name</span>
              <input
                value={form.subjectName}
                onChange={(e) => setForm({ ...form, subjectName: e.target.value })}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900"
              />
            </label>
            <label className="text-sm">
              <span className="block text-xs font-bold text-slate-500 mb-1">Subject Email</span>
              <input
                type="email"
                value={form.subjectEmail}
                onChange={(e) => setForm({ ...form, subjectEmail: e.target.value })}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900"
              />
            </label>
            <label className="text-sm">
              <span className="block text-xs font-bold text-slate-500 mb-1">
                Subject ID (optional)
              </span>
              <input
                value={form.subjectId}
                onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900"
              />
            </label>
            <label className="text-sm md:col-span-2">
              <span className="block text-xs font-bold text-slate-500 mb-1">Details</span>
              <textarea
                value={form.details}
                onChange={(e) => setForm({ ...form, details: e.target.value })}
                rows={2}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900"
              />
            </label>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={submitDsar}
              disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Create Request
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0 container mx-auto">
        {/* Stats */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                {pendingCount}
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Pending Requests
              </div>
            </div>
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-indigo-600">
              <History className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                {completedCount}
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Completed
              </div>
            </div>
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                {erasureCount}
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Erasure Requests
              </div>
            </div>
            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/20 rounded-full flex items-center justify-center text-rose-600">
              <UserX className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Request List */}
        <div className="lg:col-span-2 overflow-y-auto pb-20">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold text-sm">
              Active Requests
            </div>
            {loading ? (
              <div className="p-8 flex items-center justify-center text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : requests.length === 0 ? (
              <div className="p-10 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Inbox className="w-8 h-8" />
                <p className="text-sm">No DSAR requests yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {req.subjectName}
                        </span>
                        <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {req.requestType}
                        </span>
                      </div>
                      <div className="text-sm text-slate-500 mt-0.5">
                        {req.subjectEmail} · Due {daysUntil(req.dueDate)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto justify-between">
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-bold ${statusClasses(req.status)}`}
                      >
                        {req.status}
                      </div>
                      <button
                        onClick={() => openDetail(req.id)}
                        className="text-sm font-bold text-slate-400 hover:text-indigo-600"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-sm mb-4 text-slate-500 uppercase tracking-wider">
              Consent Manager
            </h3>
            {consentByCategory.length === 0 ? (
              <p className="text-xs text-slate-400">No consent records yet.</p>
            ) : (
              <div className="space-y-3">
                {consentByCategory.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 rounded-xl"
                  >
                    <div>
                      <div className="font-bold text-sm">{c.category}</div>
                      <div className="text-xs text-slate-500">Subject {c.subjectId}</div>
                    </div>
                    <button
                      onClick={() => toggleConsent(c.category, c.subjectId, c.granted)}
                      className={`w-10 h-6 rounded-full flex items-center px-1 transition-all ${
                        c.granted
                          ? 'bg-emerald-500 justify-end'
                          : 'bg-slate-300 dark:bg-slate-700 justify-start'
                      }`}
                      aria-label={`Toggle consent for ${c.category}`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/20 p-6">
            <h3 className="font-bold text-sm mb-4 text-rose-600 uppercase tracking-wider flex items-center gap-2">
              <UserX className="w-4 h-4" /> Danger Zone
            </h3>
            {confirmAnonymize ? (
              <div className="space-y-3">
                <input
                  value={anonymizeSubject}
                  onChange={(e) => setAnonymizeSubject(e.target.value)}
                  placeholder="Subject ID to anonymize"
                  className="w-full border border-rose-200 dark:border-rose-800 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900"
                />
                <p className="text-xs text-rose-600">
                  This records an irreversible anonymization action in the audit log.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setConfirmAnonymize(false);
                      setAnonymizeSubject('');
                    }}
                    className="flex-1 py-2 text-sm font-bold text-slate-500 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={runAnonymize}
                    disabled={saving}
                    className="flex-1 py-2 text-sm font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />} Confirm
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmAnonymize(true)}
                className="w-full py-3 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-rose-600 font-bold rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors flex items-center justify-center gap-2"
              >
                <Eraser className="w-4 h-4" /> Anonymize User Data
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {(detail || detailLoading) && (
        <div className="fixed inset-0 z-[9998] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">DSAR Request Details</h3>
              <button
                onClick={() => {
                  setDetail(null);
                  setDetailConsents([]);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {detailLoading ? (
              <div className="p-8 flex items-center justify-center text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : detail ? (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase">
                      Subject
                    </span>
                    {detail.subjectName}
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase">Email</span>
                    {detail.subjectEmail}
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase">Type</span>
                    {detail.requestType}
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase">Status</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusClasses(detail.status)}`}
                    >
                      {detail.status}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase">
                      Priority
                    </span>
                    {detail.priority}
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase">Due</span>
                    {detail.dueDate ? new Date(detail.dueDate).toLocaleDateString() : '-'}
                  </div>
                </div>
                {detail.details && (
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase">
                      Details
                    </span>
                    <p className="text-slate-600 dark:text-slate-300">{detail.details}</p>
                  </div>
                )}
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    Consent Records
                  </span>
                  {detailConsents.length === 0 ? (
                    <p className="text-xs text-slate-400">None for this subject.</p>
                  ) : (
                    <ul className="space-y-1">
                      {detailConsents.map((c) => (
                        <li key={c.id} className="flex items-center justify-between">
                          <span>{c.category}</span>
                          <span
                            className={
                              c.granted ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'
                            }
                          >
                            {c.granted ? 'Granted' : 'Revoked'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
