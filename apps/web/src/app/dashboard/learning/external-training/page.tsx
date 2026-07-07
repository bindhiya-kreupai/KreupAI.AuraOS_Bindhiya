'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Globe, UploadCloud, FileText, Loader2, X } from 'lucide-react';
import { ExternalTrainingService } from '../services';
import { useCurrentUser } from '@/lib/auth/AuthProvider';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

interface ExternalRow {
  id?: string;
  title?: string;
  provider?: string;
  status?: string;
  approvalStatus?: string;
  completionStatus?: string;
  learnerName?: string;
  learnerId?: string;
  employeeId?: string;
  completionDate?: string;
  endDate?: string;
}

interface FormState {
  title: string;
  provider: string;
  category: string;
  endDate: string;
  cost: string;
  certificateUrl: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  title: '',
  provider: '',
  category: '',
  endDate: '',
  cost: '',
  certificateUrl: '',
  notes: '',
};

export default function ExternalTrainingPage() {
  const { user, loading: authLoading } = useCurrentUser();
  const toast = useToast();
  const [data, setData] = useState<ExternalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await ExternalTrainingService.getExternalTraining();
      setData(result as ExternalRow[]);
    } catch (err) {
      console.error('Error loading external training:', err);
      toast.error('Failed to load external training. Please try again.');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Title is required.');
      return;
    }
    if (!user?.employeeId) {
      toast.error('You must be signed in to submit.');
      return;
    }
    try {
      setSubmitting(true);
      await ExternalTrainingService.createExternalTraining({
        title: form.title.trim(),
        provider: form.provider.trim() || undefined,
        category: form.category.trim() || undefined,
        endDate: form.endDate || undefined,
        cost: form.cost ? Number(form.cost) : undefined,
        certificateUrl: form.certificateUrl.trim() || undefined,
        notes: form.notes.trim() || undefined,
        learnerId: user.employeeId,
      } as never);
      toast.success('Certificate submitted for approval.');
      setForm(EMPTY_FORM);
      setShowForm(false);
      await loadData();
    } catch (err) {
      console.error('Error submitting certificate:', err);
      toast.error('Failed to submit certificate. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="w-6 h-6 text-indigo-500" />
            External Training
          </h1>
          <p className="text-slate-500 text-sm">
            Manage certifications and training from external providers.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          disabled={authLoading}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-60 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <UploadCloud className="w-4 h-4" /> Submit Certificate
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <Globe className="w-12 h-12 mb-4 opacity-30" />
          <p className="font-bold">No external training records</p>
          <p className="text-sm">External certifications will appear here once submitted.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto">
          {data.map((cert, i) => (
            <div
              key={cert.id || i}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600">
                  <FileText className="w-6 h-6" />
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-bold capitalize ${
                    cert.status === 'approved' ||
                    cert.approvalStatus === 'approved' ||
                    cert.completionStatus === 'completed'
                      ? 'bg-emerald-100 text-emerald-600'
                      : cert.status === 'rejected'
                        ? 'bg-rose-100 text-rose-600'
                        : 'bg-amber-100 text-amber-600'
                  }`}
                >
                  {cert.status || cert.approvalStatus || cert.completionStatus || 'Pending'}
                </span>
              </div>
              <h4 className="font-bold text-lg mb-1">{cert.title}</h4>
              <p className="text-sm text-slate-500 mb-4">{cert.provider}</p>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-slate-500">Employee:</span>
                  <span className="font-bold">
                    {cert.learnerName || cert.learnerId || cert.employeeId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Completed:</span>
                  <span>
                    {cert.completionDate
                      ? new Date(cert.completionDate).toLocaleDateString()
                      : cert.endDate
                        ? new Date(cert.endDate).toLocaleDateString()
                        : '-'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Submit External Certificate</h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-sm font-bold block mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold block mb-1">Provider</label>
                  <input
                    type="text"
                    value={form.provider}
                    onChange={(e) => setForm({ ...form, provider: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold block mb-1">Category</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold block mb-1">Completed On</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold block mb-1">Cost</label>
                  <input
                    type="number"
                    min="0"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-bold block mb-1">Certificate URL</label>
                <input
                  type="url"
                  value={form.certificateUrl}
                  onChange={(e) => setForm({ ...form, certificateUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-bold block mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm disabled:opacity-60 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
}
