'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  Plus,
  FileText,
  Loader2,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import { JobCatalogService, JobFamilyService } from '../services';
import type { JobCatalogRow, JobFamily } from '../types';

const STATUS_OPTIONS = ['Active', 'Draft', 'Archived'];

interface FormState {
  id?: string;
  code: string;
  title: string;
  familyId: string;
  status: string;
  description: string;
}

const EMPTY_FORM: FormState = {
  code: '',
  title: '',
  familyId: '',
  status: 'Active',
  description: '',
};

export default function JobCatalogPage() {
  const [jobs, setJobs] = useState<JobCatalogRow[]>([]);
  const [families, setFamilies] = useState<JobFamily[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await JobCatalogService.list({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setJobs(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load job catalog');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(loadJobs, 250);
    return () => clearTimeout(t);
  }, [loadJobs]);

  useEffect(() => {
    JobFamilyService.list()
      .then(setFamilies)
      .catch((err) => console.error(err));
  }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (job: JobCatalogRow) => {
    setForm({
      id: job.id,
      code: job.code,
      title: job.title,
      familyId: job.family?.id ?? '',
      status: job.status,
      description: '',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.title.trim() || !form.familyId) {
      setFormError('Code, title, and family are required');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (form.id) {
        await JobCatalogService.update(form.id, {
          code: form.code.trim(),
          title: form.title.trim(),
          familyId: form.familyId,
          status: form.status,
          description: form.description,
        });
        setNotice('Job role updated');
      } else {
        await JobCatalogService.create({
          code: form.code.trim(),
          title: form.title.trim(),
          familyId: form.familyId,
          status: form.status,
          description: form.description,
        });
        setNotice('Job role added');
      }
      setModalOpen(false);
      await loadJobs();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save job role');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (job: JobCatalogRow) => {
    if (!window.confirm(`Delete job role "${job.title}"?`)) return;
    try {
      await JobCatalogService.remove(job.id);
      setNotice('Job role deleted');
      await loadJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete job role');
    }
  };

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 3000);
    return () => clearTimeout(t);
  }, [notice]);

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-500" />
            Job Catalog
          </h1>
          <p className="text-slate-500 text-sm">
            Master list of all job roles and their definitions.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search job titles, code..."
              className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilter((v) => !v)}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center gap-2 text-sm font-bold"
            >
              <Filter className="w-4 h-4" /> {statusFilter || 'Filter'}
            </button>
            {showFilter && (
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-20 p-1">
                {['', ...STATUS_OPTIONS].map((opt) => (
                  <button
                    key={opt || 'all'}
                    onClick={() => {
                      setStatusFilter(opt);
                      setShowFilter(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-slate-100 dark:hover:bg-slate-800 ${
                      statusFilter === opt ? 'font-bold text-indigo-600' : ''
                    }`}
                  >
                    {opt || 'All statuses'}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={openCreate}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Role
          </button>
        </div>
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

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex-1 overflow-auto">
        {loading ? (
          <div className="flex h-full items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Briefcase className="w-12 h-12 opacity-20 mb-3" />
            <span className="font-bold">No job roles found</span>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase sticky top-0 backdrop-blur-sm z-10">
              <tr>
                <th className="px-6 py-4">Job Code</th>
                <th className="px-6 py-4">Job Title</th>
                <th className="px-6 py-4">Job Family</th>
                <th className="px-6 py-4">Grade</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Updated</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {jobs.map((job) => (
                <tr
                  key={job.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  <td className="px-6 py-4 font-mono text-xs font-bold text-slate-400">
                    {job.code}
                  </td>
                  <td className="px-6 py-4 font-bold flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <div className="p-1 bg-indigo-50 dark:bg-indigo-900/20 rounded text-indigo-600">
                      <FileText className="w-3 h-3" />
                    </div>
                    {job.title}
                  </td>
                  <td className="px-6 py-4">{job.family?.name || '-'}</td>
                  <td className="px-6 py-4">
                    {job.grade ? (
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold">
                        {job.grade.code}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        job.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                          : job.status === 'Draft'
                            ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                            : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(job.updatedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(job)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-500 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(job)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{form.id ? 'Edit Job Role' : 'Add Job Role'}</h2>
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
                <label className="text-xs font-bold text-slate-500">Job Code</label>
                <input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500">Job Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500">Job Family</label>
              <select
                value={form.familyId}
                onChange={(e) => setForm({ ...form, familyId: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a family...</option>
                {families.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
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
                {form.id ? 'Save Changes' : 'Add Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
