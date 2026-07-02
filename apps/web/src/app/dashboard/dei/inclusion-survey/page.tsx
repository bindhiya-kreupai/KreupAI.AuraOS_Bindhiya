'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { MessageSquare, BarChart2, Send, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { listSurveys, createSurvey, type DeiSurvey } from '../dei-api';
import { useDeiToast, DeiModal, deiInputClass } from '../dei-ui';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500',
  closed: 'bg-slate-500',
  draft: 'bg-indigo-500',
};

const SURVEY_TYPES = [
  { value: 'pulse_check', label: 'Pulse Check' },
  { value: 'annual_inclusion', label: 'Annual Inclusion' },
  { value: 'belonging_index', label: 'Belonging Index' },
  { value: 'psychological_safety', label: 'Psychological Safety' },
];

export default function InclusionSurveyPage() {
  const [surveys, setSurveys] = useState<DeiSurvey[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', surveyType: 'pulse_check', targetCount: '' });
  const { notify, ToastViewport } = useDeiToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setSurveys(await listSurveys());
    } catch {
      notify('error', 'Failed to load surveys.');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = useCallback(async () => {
    if (!form.title.trim()) {
      notify('error', 'Survey title is required.');
      return;
    }
    try {
      setSubmitting(true);
      await createSurvey({
        title: form.title.trim(),
        surveyType: form.surveyType,
        targetCount: form.targetCount ? Number(form.targetCount) : undefined,
      });
      notify('success', 'Survey launched.');
      setModalOpen(false);
      setForm({ title: '', surveyType: 'pulse_check', targetCount: '' });
      await load();
    } catch {
      notify('error', 'Could not launch survey.');
    } finally {
      setSubmitting(false);
    }
  }, [form, notify, load]);

  const avgSentiment =
    surveys.filter((s) => s.sentimentScore != null).length > 0
      ? (
          surveys.reduce((sum, s) => sum + (Number(s.sentimentScore) || 0), 0) /
          surveys.filter((s) => s.sentimentScore != null).length
        ).toFixed(1)
      : '—';

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
            <MessageSquare className="w-6 h-6 text-indigo-500" />
            Inclusion Surveys
          </h1>
          <p className="text-slate-500 text-sm">
            Gather feedback on workplace culture and belonging.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4" /> Launch New Survey
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-lg mb-2">Active &amp; Recent Surveys</h3>
          {surveys.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-500">
              No surveys yet. Launch your first inclusion survey.
            </div>
          ) : (
            surveys.map((survey) => {
              const color = STATUS_COLORS[survey.status] || 'bg-slate-500';
              const participation =
                survey.targetCount > 0
                  ? Math.min(100, Math.round((survey.responseCount / survey.targetCount) * 100))
                  : 0;
              return (
                <div
                  key={survey.id}
                  className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all group relative overflow-hidden"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${color}`}></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg group-hover:text-indigo-600 transition-colors">
                        {survey.title}
                      </h4>
                      <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold text-white ${color}`}
                        >
                          {survey.status}
                        </span>
                        <span className="capitalize">• {survey.surveyType.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{survey.responseCount}</div>
                      <div className="text-xs text-slate-400 uppercase">Responses</div>
                    </div>
                  </div>
                  {survey.status === 'active' && survey.targetCount > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs font-bold mb-1 text-slate-500">
                        <span>Participation Rate</span>
                        <span>{participation}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: `${participation}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-500" /> Sentiment Score
            </h3>
            <div className="text-center py-6">
              <div className="text-5xl font-bold text-indigo-600 mb-2">{avgSentiment}</div>
              <div className="flex justify-center gap-1 text-slate-400 text-sm">
                <span>out of 5.0</span>
              </div>
              <div className="mt-4 flex justify-center gap-3 text-sm font-bold">
                <span className="text-emerald-600 flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" /> Positive
                </span>
                <span className="text-rose-600 flex items-center gap-1">
                  <ThumbsDown className="w-4 h-4" /> Negative
                </span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-2xl border border-amber-100 dark:border-amber-900/50">
            <h4 className="font-bold text-amber-800 dark:text-amber-200 mb-2">Total Surveys</h4>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {surveys.length} survey{surveys.length === 1 ? '' : 's'} tracked across your
              organization.
            </p>
          </div>
        </div>
      </div>

      <DeiModal
        open={modalOpen}
        title="Launch New Survey"
        submitLabel="Launch"
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
            placeholder="Q3 Inclusion Pulse"
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1 text-slate-600 dark:text-slate-300">
            Type
          </label>
          <select
            className={deiInputClass}
            value={form.surveyType}
            onChange={(e) => setForm({ ...form, surveyType: e.target.value })}
          >
            {SURVEY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold mb-1 text-slate-600 dark:text-slate-300">
            Target Audience Size
          </label>
          <input
            type="number"
            min={0}
            className={deiInputClass}
            value={form.targetCount}
            onChange={(e) => setForm({ ...form, targetCount: e.target.value })}
            placeholder="e.g. 500"
          />
        </div>
      </DeiModal>
    </div>
  );
}
