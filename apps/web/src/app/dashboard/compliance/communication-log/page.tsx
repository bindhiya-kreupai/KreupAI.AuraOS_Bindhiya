'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Mail, PhoneCall, Filter, Plus, X } from 'lucide-react';
import { CommunicationLogService } from '../services';
import type { CommunicationLogEntry } from '../services';
import type { Toast } from '../types';
import { ToastContainer } from '../components/Toast';
import { useCurrentUser } from '@/lib/auth/AuthProvider';

const CATEGORIES = ['union', 'grievance', 'disciplinary', 'audit', 'general'] as const;
const COMM_TYPES = ['Email', 'Phone', 'Meeting', 'Letter', 'Notice'] as const;

function formatLabel(value?: string): string {
  if (!value) return '—';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function iconForType(type?: string) {
  const t = (type ?? '').toLowerCase();
  if (t.includes('phone') || t.includes('call')) return PhoneCall;
  if (t.includes('email') || t.includes('mail') || t.includes('letter')) return Mail;
  return MessageSquare;
}

export default function CommunicationLogPage() {
  const { loading: authLoading } = useCurrentUser();
  const [communications, setCommunications] = useState<CommunicationLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');

  const notify = (type: Toast['type'], message: string) =>
    setToasts((t) => [...t, { id: crypto.randomUUID(), type, message }]);
  const closeToast = (id: string) => setToasts((t) => t.filter((x) => x.id !== id));

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await CommunicationLogService.getLogs({
        category: filterCategory || undefined,
        communicationType: filterType || undefined,
      });
      setCommunications(data);
    } catch {
      notify('error', 'Failed to load communication logs');
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterType]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // New entry form
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('general');
  const [communicationType, setCommunicationType] = useState<(typeof COMM_TYPES)[number]>('Email');
  const [summary, setSummary] = useState('');
  const [fromParty, setFromParty] = useState('');
  const [toParty, setToParty] = useState('');

  const resetForm = () => {
    setSubject('');
    setCategory('general');
    setCommunicationType('Email');
    setSummary('');
    setFromParty('');
    setToParty('');
  };

  const submitEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await CommunicationLogService.createLog({
        subject,
        category,
        communicationType,
        summary,
        fromParty,
        toParty,
        communicationDate: new Date().toISOString(),
      });
      setShowModal(false);
      resetForm();
      await fetchLogs();
      notify('success', 'Log entry created');
    } catch {
      notify('error', 'Failed to create log entry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-500" />
            Communication Log
          </h1>
          <p className="text-slate-500 text-sm">
            Record of all official correspondence with unions and regulators.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold flex items-center gap-2"
          >
            <Filter className="w-4 h-4" /> Filter Logs
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Entry
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row gap-3 shrink-0">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 mb-1.5">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
            >
              <option value="">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {formatLabel(c)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 mb-1.5">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
            >
              <option value="">All types</option>
              {COMM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterCategory('');
                setFilterType('');
              }}
              className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex-1 overflow-y-auto">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900">
          <h3 className="font-bold text-lg">Recent Logs</h3>
        </div>

        {authLoading || loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : communications.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-500">
            No communication entries
            {filterCategory || filterType ? ' match the current filters' : ' yet'}.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {communications.map((log) => {
              const Icon = iconForType(log.communicationType);
              return (
                <div
                  key={log.id}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-start gap-3"
                >
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <div className="font-bold">{log.subject}</div>
                      <div className="text-xs text-slate-500 whitespace-nowrap">
                        {log.communicationDate
                          ? new Date(log.communicationDate).toLocaleString()
                          : ''}
                      </div>
                    </div>
                    {log.summary && (
                      <div className="text-sm text-slate-500 mb-1">{log.summary}</div>
                    )}
                    <div className="text-sm text-slate-500 flex flex-wrap items-center gap-x-1">
                      <span className="font-bold text-slate-700 dark:text-slate-300">From:</span>{' '}
                      {log.fromParty ?? '—'}
                      <span className="mx-1">•</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">To:</span>{' '}
                      {log.toParty ?? '—'}
                      {log.category && (
                        <span className="ml-2 text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {formatLabel(log.category)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9998] bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={submitEntry}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-500" /> New Log Entry
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Subject
                </label>
                <input
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as (typeof CATEGORIES)[number])}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {formatLabel(c)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Type
                  </label>
                  <select
                    value={communicationType}
                    onChange={(e) =>
                      setCommunicationType(e.target.value as (typeof COMM_TYPES)[number])
                    }
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
                  >
                    {COMM_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Summary
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full h-24 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    From
                  </label>
                  <input
                    value={fromParty}
                    onChange={(e) => setFromParty(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    To
                  </label>
                  <input
                    value={toParty}
                    onChange={(e) => setToParty(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-5 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
              >
                {submitting ? 'Saving…' : 'Save Entry'}
              </button>
            </div>
          </form>
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
}
