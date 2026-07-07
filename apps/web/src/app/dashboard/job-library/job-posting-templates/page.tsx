'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Copy, Edit3, Eye, Plus, Loader2, X } from 'lucide-react';
import { JobPostingTemplateService } from '../services';
import type { JobPostingTemplate } from '../types';

const CATEGORY_OPTIONS = ['general', 'engineering', 'sales', 'executive', 'early_talent'];

interface FormState {
  id?: string;
  name: string;
  category: string;
  sectionsText: string;
  body: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  category: 'general',
  sectionsText: '',
  body: '',
};

function relativeTime(iso: string | null): string {
  if (!iso) return 'never';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function JobPostingTemplatesPage() {
  const [templates, setTemplates] = useState<JobPostingTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [preview, setPreview] = useState<JobPostingTemplate | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTemplates(await JobPostingTemplateService.list());
    } catch (err) {
      console.error(err);
      setError('Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 3000);
    return () => clearTimeout(t);
  }, [notice]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (tmpl: JobPostingTemplate) => {
    setForm({
      id: tmpl.id,
      name: tmpl.name,
      category: tmpl.category,
      sectionsText: tmpl.sections.join('\n'),
      body: tmpl.body ?? '',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setFormError('Template name is required');
      return;
    }
    const sections = form.sectionsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    setSaving(true);
    setFormError(null);
    try {
      if (form.id) {
        await JobPostingTemplateService.update(form.id, {
          name: form.name.trim(),
          category: form.category,
          sections,
          body: form.body,
        });
        setNotice('Template updated');
      } else {
        await JobPostingTemplateService.create({
          name: form.name.trim(),
          category: form.category,
          sections,
          body: form.body,
        });
        setNotice('Template created');
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleUse = async (tmpl: JobPostingTemplate) => {
    try {
      await JobPostingTemplateService.use(tmpl.id);
      setNotice(`Template "${tmpl.name}" applied`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to use template');
    }
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-500" />
            Job Posting Templates
          </h1>
          <p className="text-slate-500 text-sm">Standardized templates for job advertisements.</p>
        </div>
        <button
          onClick={openCreate}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Template
        </button>
      </div>

      {notice && (
        <div className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-sm shrink-0">
          {notice}
        </div>
      )}
      {error && (
        <div className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm shrink-0">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <FileText className="w-12 h-12 opacity-20 mb-3" />
          <span className="font-bold">No templates yet</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {templates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow group flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setPreview(tmpl)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-500"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEdit(tmpl)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-500"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-lg mb-1">{tmpl.name}</h3>
              <p className="text-xs font-bold text-indigo-600 uppercase mb-4">
                {tmpl.category.replace('_', ' ')}
              </p>

              <div className="space-y-1 mb-6">
                {tmpl.sections.length === 0 ? (
                  <div className="text-sm text-slate-400">No sections defined</div>
                ) : (
                  tmpl.sections.map((sec, j) => (
                    <div key={j} className="text-sm text-slate-500 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> {sec}
                    </div>
                  ))
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                <span className="text-xs text-slate-400">
                  Used {tmpl.usageCount}× • {relativeTime(tmpl.lastUsedAt)}
                </span>
                <button
                  onClick={() => handleUse(tmpl)}
                  className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:underline"
                >
                  <Copy className="w-3 h-3" /> Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 space-y-4 max-h-[85vh] overflow-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{preview.name}</h2>
              <button
                onClick={() => setPreview(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs font-bold text-indigo-600 uppercase">
              {preview.category.replace('_', ' ')}
            </p>
            <div>
              <h3 className="text-sm font-bold text-slate-500 mb-2">Sections</h3>
              <ul className="space-y-1">
                {preview.sections.map((sec, j) => (
                  <li key={j} className="text-sm flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div> {sec}
                  </li>
                ))}
              </ul>
            </div>
            {preview.body && (
              <div>
                <h3 className="text-sm font-bold text-slate-500 mb-2">Body</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                  {preview.body}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 space-y-4 max-h-[85vh] overflow-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{form.id ? 'Edit Template' : 'New Template'}</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="px-3 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500">Template Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500">Sections (one per line)</label>
              <textarea
                value={form.sectionsText}
                onChange={(e) => setForm({ ...form, sectionsText: e.target.value })}
                rows={4}
                placeholder={'About Us\nResponsibilities\nRequirements'}
                className="mt-1 w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500">Body (optional)</label>
              <textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                rows={4}
                className="mt-1 w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-60"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {form.id ? 'Save Changes' : 'Create Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
