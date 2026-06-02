'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  HelpCircle,
  Loader2,
  Plus,
  Save,
  Settings,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Users,
} from 'lucide-react';

type Question = { id: string; text: string; type: 'Text' | 'Rating' | 'Multiple Choice' };
type Participants = 'all' | 'department' | 'custom';

type Config = {
  frequency: 'Quarterly' | 'Bi-Annual' | 'Annual';
  startDate: string;
  endDate: string;
  allowSelfReview: boolean;
  anonymous: boolean;
  participants: Participants;
  questions: Question[];
};

const DEFAULT_CONFIG: Config = {
  frequency: 'Quarterly',
  startDate: '',
  endDate: '',
  allowSelfReview: true,
  anonymous: false,
  participants: 'all',
  questions: [
    { id: 'q1', text: 'How would you rate this person on collaboration?', type: 'Rating' },
    { id: 'q2', text: 'What is one thing they should keep doing?', type: 'Text' },
    { id: 'q3', text: 'What is one thing they could improve?', type: 'Text' },
  ],
};

const STORAGE_KEY = 'auraos.performance.feedbackConfig.v1';

export default function FeedbackConfigPage() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(null), 4000);
    return () => clearTimeout(t);
  }, [status]);

  const update = <K extends keyof Config>(field: K, value: Config[K]) => {
    setConfig((c) => ({ ...c, [field]: value }));
    setStatus(null);
  };

  const addQuestion = () => {
    const text = prompt('Question text:');
    if (!text?.trim()) return;
    const type = prompt('Question type (Text / Rating / Multiple Choice):', 'Text') || 'Text';
    const normalizedType = (
      ['Text', 'Rating', 'Multiple Choice'].includes(type) ? type : 'Text'
    ) as Question['type'];
    update('questions', [
      ...config.questions,
      { id: `q-${Date.now()}`, text, type: normalizedType },
    ]);
  };

  const removeQuestion = (id: string) => {
    update(
      'questions',
      config.questions.filter((q) => q.id !== id)
    );
  };

  const handleSave = () => {
    setSaving(true);
    setStatus(null);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      setStatus({ kind: 'success', text: 'Configuration saved (browser-local).' });
    } catch (e: any) {
      setStatus({ kind: 'error', text: e?.message || 'Failed to save configuration.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-500" />
            Feedback 360 Configuration
          </h1>
          <p className="text-slate-500 text-sm">
            Set up review cycles, question banks, and anonymity rules.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 disabled:opacity-60"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Configuration'}
        </button>
      </div>

      {status && (
        <div
          className={`rounded-lg border px-4 py-2 text-sm flex items-center gap-2 ${
            status.kind === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-200'
          }`}
        >
          {status.kind === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {status.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" /> Cycle Settings
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Review Frequency</label>
              <select
                value={config.frequency}
                onChange={(e) => update('frequency', e.target.value as Config['frequency'])}
                className="w-full mt-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold outline-none"
              >
                <option>Quarterly</option>
                <option>Bi-Annual</option>
                <option>Annual</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Start Date</label>
                <input
                  type="date"
                  value={config.startDate}
                  onChange={(e) => update('startDate', e.target.value)}
                  className="w-full mt-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">End Date</label>
                <input
                  type="date"
                  value={config.endDate}
                  onChange={(e) => update('endDate', e.target.value)}
                  className="w-full mt-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm outline-none"
                />
              </div>
            </div>

            <ToggleRow
              label="Allow Self-Review"
              hint="Employees review themselves first"
              checked={config.allowSelfReview}
              onChange={(v) => update('allowSelfReview', v)}
            />
            <ToggleRow
              label="Anonymous Feedback"
              hint="Reviewer names hidden from recipients"
              checked={config.anonymous}
              onChange={(v) => update('anonymous', v)}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-500" /> Question Bank
            </h3>
            <button
              onClick={addQuestion}
              className="text-xs font-bold text-indigo-600 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add Question
            </button>
          </div>

          <div className="space-y-3">
            {config.questions.length === 0 ? (
              <div className="text-center py-6 text-sm text-slate-400">
                No questions yet — add one above.
              </div>
            ) : (
              config.questions.map((q) => (
                <div
                  key={q.id}
                  className="p-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group flex items-start gap-2"
                >
                  <div className="flex-1">
                    <div className="text-sm font-bold mb-1">{q.text}</div>
                    <div className="text-[10px] text-slate-500 uppercase bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded w-fit">
                      {q.type}
                    </div>
                  </div>
                  <button
                    onClick={() => removeQuestion(q.id)}
                    className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" /> Participants
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <ParticipantCard
              label="All"
              hint="Company-Wide"
              selected={config.participants === 'all'}
              onClick={() => update('participants', 'all')}
            />
            <ParticipantCard
              label="Dept"
              hint="Specific Departments"
              selected={config.participants === 'department'}
              onClick={() => update('participants', 'department')}
            />
            <ParticipantCard
              label="Custom"
              hint="Select Employees"
              selected={config.participants === 'custom'}
              onClick={() => update('participants', 'custom')}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 px-4 py-3 text-xs text-amber-800 dark:text-amber-200 flex gap-2">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          Feedback configuration is currently stored per-browser. A tenant-wide
          <code className="px-1 mx-1 bg-amber-100 dark:bg-amber-900/40 rounded">
            FeedbackConfig
          </code>
          schema + API is the natural follow-up so settings persist across users.
        </p>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
      <div>
        <div className="text-sm font-bold">{label}</div>
        {hint && <div className="text-xs text-slate-500">{hint}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="text-slate-400 hover:text-slate-600"
        aria-label={checked ? 'Disable' : 'Enable'}
      >
        {checked ? (
          <ToggleRight className="w-8 h-8 text-emerald-500" />
        ) : (
          <ToggleLeft className="w-8 h-8 text-slate-400" />
        )}
      </button>
    </div>
  );
}

function ParticipantCard({
  label,
  hint,
  selected,
  onClick,
}: {
  label: string;
  hint: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-4 border rounded-xl text-center transition-all hover:shadow-md w-full ${
        selected
          ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-900/20'
          : 'border-slate-200 dark:border-slate-700 hover:border-indigo-200'
      }`}
    >
      <div
        className={`text-3xl font-black mb-1 ${
          selected ? 'text-indigo-600' : 'text-slate-700 dark:text-slate-300'
        }`}
      >
        {label}
      </div>
      <div
        className={`text-sm font-bold ${
          selected ? 'text-indigo-800 dark:text-indigo-300' : 'text-slate-500'
        }`}
      >
        {hint}
      </div>
    </button>
  );
}
