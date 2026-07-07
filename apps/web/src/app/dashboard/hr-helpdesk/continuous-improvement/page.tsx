'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, TrendingUp, Lightbulb, Loader2, AlertCircle, Plus, X } from 'lucide-react';
import { ImprovementsApi, type ImprovementDTO } from '../services';

type ImpactEffort = 'Low' | 'Medium' | 'High';
type ImprovementStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'DISMISSED';

const STATUS_OPTIONS: { value: ImprovementStatus; label: string }[] = [
  { value: 'PLANNED', label: 'Planned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'DISMISSED', label: 'Dismissed' },
];

const IMPACT_EFFORT_OPTIONS: ImpactEffort[] = ['Low', 'Medium', 'High'];

function statusBadgeClass(status: string): string {
  if (status === 'COMPLETED') {
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
  }
  if (status === 'IN_PROGRESS') {
    return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300';
  }
  if (status === 'DISMISSED') {
    return 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
  }
  return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
}

function statusLabel(status: string): string {
  const match = STATUS_OPTIONS.find((option) => option.value === status);
  return match ? match.label : status;
}

export default function ContinuousImprovementPage() {
  const [improvements, setImprovements] = useState<ImprovementDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<'success' | 'error'>('success');

  const [showModal, setShowModal] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImpact, setFormImpact] = useState<ImpactEffort>('Medium');
  const [formEffort, setFormEffort] = useState<ImpactEffort>('Medium');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const showFeedback = useCallback((message: string, tone: 'success' | 'error') => {
    setFeedbackTone(tone);
    setFeedback(message);
  }, []);

  useEffect(() => {
    if (!feedback) {
      return;
    }
    const timer = window.setTimeout(() => setFeedback(null), 4000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ImprovementsApi.list();
      setImprovements(data);
    } catch {
      setError('Failed to load improvement opportunities. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleStatusChange = useCallback(
    async (item: ImprovementDTO, nextStatus: ImprovementStatus) => {
      try {
        const updated = await ImprovementsApi.update(item.id, {
          status: nextStatus,
        });
        if (updated) {
          showFeedback(`Status updated to ${statusLabel(nextStatus)}.`, 'success');
          await load();
        } else {
          showFeedback('Could not update status. Please try again.', 'error');
        }
      } catch {
        showFeedback('Could not update status. Please try again.', 'error');
      }
    },
    [load, showFeedback]
  );

  const handleCreateTask = useCallback(
    async (item: ImprovementDTO) => {
      const quote = (item.feedbackQuote ?? '').trim();
      if (!quote) {
        return;
      }
      const shortQuote = quote.length > 60 ? `${quote.slice(0, 60).trimEnd()}…` : quote;
      try {
        const created = await ImprovementsApi.create({
          title: `Follow-up: ${shortQuote}`,
          description: quote,
          source: 'survey',
          impact: 'Medium',
          effort: 'Medium',
          status: 'PLANNED',
        });
        if (created) {
          showFeedback('Follow-up task created.', 'success');
          await load();
        } else {
          showFeedback('Could not create task. Please try again.', 'error');
        }
      } catch {
        showFeedback('Could not create task. Please try again.', 'error');
      }
    },
    [load, showFeedback]
  );

  const openModal = useCallback(() => {
    setFormTitle('');
    setFormDescription('');
    setFormImpact('Medium');
    setFormEffort('Medium');
    setFormError(null);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    if (submitting) {
      return;
    }
    setShowModal(false);
  }, [submitting]);

  const handleSubmit = useCallback(async () => {
    const title = formTitle.trim();
    if (!title) {
      setFormError('Title is required.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const created = await ImprovementsApi.create({
        title,
        description: formDescription.trim() || undefined,
        source: 'agent',
        impact: formImpact,
        effort: formEffort,
        status: 'PLANNED',
      });
      if (created) {
        setShowModal(false);
        showFeedback('Opportunity created.', 'success');
        await load();
      } else {
        setFormError('Could not create opportunity. Please try again.');
      }
    } catch {
      setFormError('Could not create opportunity. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [formTitle, formDescription, formImpact, formEffort, load, showFeedback]);

  const feedbackItems = improvements.filter(
    (item) => item.source === 'survey' && !!item.feedbackQuote
  );

  return (
    <div className="space-y-4 pb-6 min-h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-indigo-500" />
            Continuous Improvement
          </h1>
          <p className="text-slate-500 text-sm">
            Feedback loops and process optimization initiatives.
          </p>
        </div>
        <button
          type="button"
          onClick={openModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          New Opportunity
        </button>
      </div>

      {feedback ? (
        <div
          className={`rounded-xl border px-4 py-2 text-sm font-medium ${
            feedbackTone === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
          }`}
        >
          {feedback}
        </div>
      ) : null}

      {error ? (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Loading opportunities…</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Improvement Opportunities */}
          <div>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" /> Improvement Opportunities
            </h3>
            {improvements.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500">
                No improvement opportunities yet. Create one to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {improvements.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
                  >
                    <div>
                      <h4 className="font-bold">{item.title}</h4>
                      <div className="text-xs text-slate-500 flex gap-2 mt-1">
                        <span>
                          Impact: <b>{item.impact}</b>
                        </span>
                        <span>
                          Effort: <b>{item.effort}</b>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${statusBadgeClass(
                          item.status
                        )}`}
                      >
                        {statusLabel(item.status)}
                      </span>
                      <select
                        value={item.status}
                        onChange={(event) =>
                          void handleStatusChange(item, event.target.value as ImprovementStatus)
                        }
                        className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1"
                        aria-label={`Update status for ${item.title}`}
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Feedback Highlights */}
          <div>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" /> Feedback Highlights
            </h3>
            {feedbackItems.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500">
                No survey feedback highlights yet.
              </div>
            ) : (
              <div className="space-y-4">
                {feedbackItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-2xl border border-amber-100 dark:border-amber-800"
                  >
                    <p className="italic text-amber-900 dark:text-amber-100 font-medium text-lg mb-4">
                      &ldquo;{item.feedbackQuote}&rdquo;
                    </p>
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold text-amber-700 dark:text-amber-300">
                        {item.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => void handleCreateTask(item)}
                        className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-bold hover:bg-amber-600"
                      >
                        Create Task
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold">New Opportunity</h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {formError ? (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700 dark:text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              ) : null}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(event) => setFormTitle(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  placeholder="Describe the opportunity"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(event) => setFormDescription(event.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  placeholder="Add more context (optional)"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Impact</label>
                  <select
                    value={formImpact}
                    onChange={(event) => setFormImpact(event.target.value as ImpactEffort)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  >
                    {IMPACT_EFFORT_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Effort</label>
                  <select
                    value={formEffort}
                    onChange={(event) => setFormEffort(event.target.value as ImpactEffort)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  >
                    {IMPACT_EFFORT_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-5 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Create
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
