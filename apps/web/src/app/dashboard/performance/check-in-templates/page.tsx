'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckInTemplateService,
  type CheckInTemplateRecord,
} from '@/services/checkInTemplateService';
import {
  FileText,
  Plus,
  Copy,
  Edit2,
  Trash2,
  Clock,
  Users,
  ChevronRight,
  Loader2,
  X,
  Save,
} from 'lucide-react';

const CATEGORIES = [
  { key: 'All', label: 'All' },
  { key: 'one_on_one', label: '1:1 Meetings' },
  { key: 'weekly_checkin', label: 'Weekly Check-in' },
  { key: 'monthly_review', label: 'Monthly Review' },
  { key: 'quarterly', label: 'Quarterly' },
];

interface FormState {
  id?: string;
  name: string;
  description: string;
  category: string;
  cadence: string;
  questionsText: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  category: 'one_on_one',
  cadence: 'weekly',
  questionsText: 'What went well this period?\nWhat are your priorities next?',
};

export default function CheckInTemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<CheckInTemplateRecord[]>([]);
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await CheckInTemplateService.list();
      setTemplates(rows);
    } catch (e: any) {
      setStatus({ kind: 'error', text: e?.message || 'Failed to load templates.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(null), 4000);
    return () => clearTimeout(t);
  }, [status]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (t: CheckInTemplateRecord) => {
    setForm({
      id: t.id,
      name: t.name,
      description: t.description ?? '',
      category: t.category,
      cadence: t.cadence,
      questionsText: (t.questions || []).map((q) => q.text).join('\n'),
    });
    setShowForm(true);
  };

  const submitForm = useCallback(async () => {
    if (!form.name.trim()) return;
    const questions = form.questionsText
      .split('\n')
      .map((q) => q.trim())
      .filter(Boolean)
      .map((text, i) => ({ id: `q${i + 1}`, text, isRequired: false }));
    setSaving(true);
    try {
      if (form.id) {
        await CheckInTemplateService.update(form.id, {
          name: form.name,
          description: form.description,
          category: form.category,
          cadence: form.cadence,
          questions,
        });
        setStatus({ kind: 'success', text: 'Template updated.' });
      } else {
        await CheckInTemplateService.create({
          name: form.name,
          description: form.description,
          category: form.category,
          cadence: form.cadence,
          questions,
        });
        setStatus({ kind: 'success', text: 'Template created.' });
      }
      setShowForm(false);
      await load();
    } catch (e: any) {
      setStatus({ kind: 'error', text: e?.message || 'Failed to save template.' });
    } finally {
      setSaving(false);
    }
  }, [form, load]);

  const duplicate = useCallback(
    async (t: CheckInTemplateRecord) => {
      setSaving(true);
      try {
        await CheckInTemplateService.duplicate(t);
        setStatus({ kind: 'success', text: `Duplicated "${t.name}".` });
        await load();
      } catch (e: any) {
        setStatus({ kind: 'error', text: e?.message || 'Failed to duplicate.' });
      } finally {
        setSaving(false);
      }
    },
    [load]
  );

  const remove = useCallback(
    async (t: CheckInTemplateRecord) => {
      setSaving(true);
      try {
        await CheckInTemplateService.remove(t.id);
        setStatus({ kind: 'success', text: `Deleted "${t.name}".` });
        await load();
      } catch (e: any) {
        setStatus({ kind: 'error', text: e?.message || 'Failed to delete.' });
      } finally {
        setSaving(false);
      }
    },
    [load]
  );

  const applyTemplate = useCallback(
    async (t: CheckInTemplateRecord) => {
      try {
        await CheckInTemplateService.use(t.id);
        setStatus({ kind: 'success', text: `Started a check-in from "${t.name}".` });
        await load();
      } catch (e: any) {
        setStatus({ kind: 'error', text: e?.message || 'Failed to use template.' });
      }
    },
    [load]
  );

  const filtered =
    selectedCategory === 'All'
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  const categoryLabel = (key: string) => CATEGORIES.find((c) => c.key === key)?.label ?? key;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-celestial-indigo" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Check-in Templates</h1>
          <p className="text-sm text-silver-mist mt-1">
            Manage discussion templates for meetings and reviews
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Template
        </button>
      </div>

      {status && (
        <div
          className={`rounded-lg border px-4 py-2 text-sm ${
            status.kind === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-200'
          }`}
        >
          {status.text}
        </div>
      )}

      {/* Create / Edit Form */}
      {showForm && (
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-ink-black dark:text-pearl">
              {form.id ? 'Edit Template' : 'New Template'}
            </p>
            <button onClick={() => setShowForm(false)} className="text-silver-mist">
              <X className="w-4 h-4" />
            </button>
          </div>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Template name"
            className="w-full px-3 py-2 text-sm rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-deep-cosmos text-ink-black dark:text-pearl focus:outline-none focus:ring-1 focus:ring-celestial-indigo"
          />
          <input
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Short description"
            className="w-full px-3 py-2 text-sm rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-deep-cosmos text-ink-black dark:text-pearl focus:outline-none focus:ring-1 focus:ring-celestial-indigo"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="px-3 py-2 text-sm rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-deep-cosmos text-ink-black dark:text-pearl focus:outline-none focus:ring-1 focus:ring-celestial-indigo"
            >
              {CATEGORIES.filter((c) => c.key !== 'All').map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
            <select
              value={form.cadence}
              onChange={(e) => setForm((f) => ({ ...f, cadence: e.target.value }))}
              className="px-3 py-2 text-sm rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-deep-cosmos text-ink-black dark:text-pearl focus:outline-none focus:ring-1 focus:ring-celestial-indigo"
            >
              {['weekly', 'biweekly', 'monthly', 'quarterly'].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={form.questionsText}
            onChange={(e) => setForm((f) => ({ ...f, questionsText: e.target.value }))}
            rows={5}
            placeholder="One question per line"
            className="w-full px-3 py-2 text-sm rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-deep-cosmos text-ink-black dark:text-pearl focus:outline-none focus:ring-1 focus:ring-celestial-indigo resize-none"
          />
          <div className="flex justify-end">
            <button
              onClick={submitForm}
              disabled={!form.name.trim() || saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold bg-celestial-indigo text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving…' : form.id ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.key
                ? 'bg-celestial-indigo text-white'
                : 'bg-slate-100 dark:bg-deep-cosmos text-silver-mist hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <FileText className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-bold text-lg">No templates found</p>
            <p className="text-sm mt-1">Create check-in templates to streamline your meetings</p>
          </div>
        ) : (
          filtered.map((template) => (
            <div
              key={template.id}
              className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden"
            >
              <div
                className="px-5 py-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-deep-cosmos transition-colors"
                onClick={() =>
                  setExpandedTemplate(expandedTemplate === template.id ? null : template.id)
                }
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-celestial-indigo/10 flex-shrink-0">
                    <FileText className="w-5 h-5 text-celestial-indigo" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-ink-black dark:text-pearl">
                        {template.name}
                      </p>
                      {template.isDefault && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 rounded font-medium">
                          Default
                        </span>
                      )}
                      <span className="text-[10px] px-1.5 py-0.5 bg-celestial-indigo/10 text-celestial-indigo rounded font-medium">
                        {categoryLabel(template.category)}
                      </span>
                    </div>
                    <p className="text-xs text-silver-mist mt-0.5">{template.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-silver-mist">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" /> {template.questions.length} questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> Used {template.usageCount} times
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {template.cadence}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicate(template);
                      }}
                      disabled={saving}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-silver-mist hover:text-celestial-indigo transition-colors disabled:opacity-50"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(template);
                      }}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-silver-mist hover:text-celestial-indigo transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(template);
                      }}
                      disabled={saving}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-silver-mist hover:text-rose-500 transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight
                      className={`w-4 h-4 text-silver-mist transition-transform ${expandedTemplate === template.id ? 'rotate-90' : ''}`}
                    />
                  </div>
                </div>
              </div>
              {expandedTemplate === template.id && (
                <div className="px-5 pb-4 border-t border-cloud dark:border-nebula-purple/50 pt-3 ml-14">
                  <p className="text-xs font-medium text-ink-black dark:text-pearl mb-2">
                    Discussion Questions:
                  </p>
                  <ol className="space-y-1.5">
                    {template.questions.map((q, i) => (
                      <li
                        key={q.id ?? i}
                        className="text-xs text-silver-mist flex items-start gap-2"
                      >
                        <span className="text-celestial-indigo font-medium">{i + 1}.</span> {q.text}
                      </li>
                    ))}
                  </ol>
                  <button
                    onClick={() => applyTemplate(template)}
                    className="mt-3 text-xs text-celestial-indigo font-medium hover:underline"
                  >
                    Use this template →
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
