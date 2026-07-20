'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Layers, Users, FolderPlus, Loader2, X } from 'lucide-react';
import { JobFamilyService, JobFunctionService } from '../services';
import type { JobFamily, JobFunction } from '../types';

const CARD_STYLES = [
  { color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  { color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
  { color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
];

interface FormState {
  code: string;
  name: string;
  functionId: string;
}

const EMPTY_FORM: FormState = { code: '', name: '', functionId: '' };

export default function JobFamiliesPage() {
  const [families, setFamilies] = useState<JobFamily[]>([]);
  const [functions, setFunctions] = useState<JobFunction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setFamilies(await JobFamilyService.list());
    } catch (err) {
      console.error(err);
      setError('Failed to load job families');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    JobFunctionService.list()
      .then(setFunctions)
      .catch((err) => console.error(err));
  }, []);

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

  const handleSave = async () => {
    if (!form.code.trim() || !form.name.trim() || !form.functionId) {
      setFormError('Code, name, and function are required');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await JobFamilyService.create({
        code: form.code.trim(),
        name: form.name.trim(),
        functionId: form.functionId,
      });
      setNotice('Job family created');
      setModalOpen(false);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create job family');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-500" />
            Job Families
          </h1>
          <p className="text-slate-500 text-sm">Organize roles into families and functions.</p>
        </div>
        <button
          onClick={openCreate}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <FolderPlus className="w-4 h-4" /> New Family
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
      ) : families.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Layers className="w-12 h-12 opacity-20 mb-3" />
          <span className="font-bold">No job families yet</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {families.map((family, i) => {
            const style = CARD_STYLES[i % CARD_STYLES.length];
            return (
              <div
                key={family.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all group flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${style.bg} ${style.color}`}>
                    <Layers className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Users className="w-3 h-3" /> {family.roleCount} Roles
                  </div>
                </div>

                <h3 className="font-bold text-lg mb-1">{family.name}</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Function: {family.functionName || '-'}
                </p>

                <div className="flex flex-wrap gap-2 mt-auto">
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono text-slate-600 dark:text-slate-300">
                    {family.code}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">New Job Family</h2>
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

            <div>
              <label className="text-xs font-bold text-slate-500">Family Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500">Family Code</label>
              <input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500">Function</label>
              <select
                value={form.functionId}
                onChange={(e) => setForm({ ...form, functionId: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a function...</option>
                {functions.map((fn) => (
                  <option key={fn.id} value={fn.id}>
                    {fn.name}
                  </option>
                ))}
              </select>
              {functions.length === 0 && (
                <p className="mt-1 text-xs text-amber-600">
                  No job functions found. Create a job function first.
                </p>
              )}
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
                Create Family
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
