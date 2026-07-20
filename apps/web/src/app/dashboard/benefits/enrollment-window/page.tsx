'use client';

import React, { useState, useEffect } from 'react';
import { CalendarDays, Clock, Loader2, Plus, X } from 'lucide-react';
import { EnrollmentWindowService } from '../services';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

interface EnrollmentWindowRow {
  id: string;
  windowName: string;
  windowType: string;
  planYear: number;
  startDate: string;
  endDate: string;
  description?: string;
  eligibleCategories?: string[];
  instructions?: string;
  isActive?: boolean;
  createdAt?: string;
}

type WindowStatus = 'Active' | 'Upcoming' | 'Closed';

const DAY_MS = 1000 * 60 * 60 * 24;

function getWindowStatus(win: EnrollmentWindowRow): WindowStatus {
  const now = Date.now();
  const start = new Date(win.startDate).getTime();
  const end = new Date(win.endDate).getTime();

  if (now < start) {
    return 'Upcoming';
  }
  if (now > end) {
    return 'Closed';
  }
  return 'Active';
}

function isCurrentlyActive(win: EnrollmentWindowRow): boolean {
  return Boolean(win.isActive) && getWindowStatus(win) === 'Active';
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function daysRemaining(endDate: string): number {
  const end = new Date(endDate).getTime();
  const diff = end - Date.now();
  if (Number.isNaN(diff) || diff <= 0) {
    return 0;
  }
  return Math.ceil(diff / DAY_MS);
}

function elapsedPercent(win: EnrollmentWindowRow): number {
  const start = new Date(win.startDate).getTime();
  const end = new Date(win.endDate).getTime();
  const now = Date.now();

  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    return 0;
  }
  const pct = ((now - start) / (end - start)) * 100;
  return Math.min(100, Math.max(0, Math.round(pct)));
}

const STATUS_BADGE: Record<WindowStatus, string> = {
  Active: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
  Upcoming: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
  Closed: 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300',
};

const emptyForm = {
  windowName: '',
  windowType: 'OPEN_ENROLLMENT',
  planYear: String(new Date().getFullYear()),
  startDate: '',
  endDate: '',
  description: '',
};

export default function EnrollmentWindowPage() {
  const [windows, setWindows] = useState<EnrollmentWindowRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  const toast = useToast();

  useEffect(() => {
    fetchWindows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchWindows = async () => {
    try {
      setLoading(true);
      const response = await EnrollmentWindowService.getWindows();
      setWindows((response.data as unknown as EnrollmentWindowRow[]) || []);
    } catch (error) {
      console.error('Error:', error);
      setWindows([]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setForm({ ...emptyForm });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.windowName || !form.windowType || !form.startDate || !form.endDate) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await EnrollmentWindowService.createWindow({
        windowName: form.windowName,
        windowType: form.windowType,
        planYear: Number(form.planYear),
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        description: form.description || undefined,
        isActive: true,
      } as never);

      if (response.success) {
        toast.success('Enrollment window created successfully.');
        setModalOpen(false);
        await fetchWindows();
      } else {
        toast.error('Failed to create enrollment window.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to create enrollment window.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeWindow = windows.find(isCurrentlyActive) || null;
  const otherWindows = windows.filter((win) => win.id !== activeWindow?.id);

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-indigo-500" />
            Enrollment Windows
          </h1>
          <p className="text-slate-500 text-sm">
            Manage open enrollment periods and special signup windows.
          </p>
        </div>
        <button
          type="button"
          onClick={openModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> New Window
        </button>
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      )}

      {!loading && windows.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 text-slate-500">
          <CalendarDays className="w-12 h-12 text-slate-300 dark:text-slate-600" />
          <div>
            <p className="font-semibold text-slate-600 dark:text-slate-300">
              No enrollment windows yet
            </p>
            <p className="text-sm">Create your first enrollment window to get started.</p>
          </div>
          <button
            type="button"
            onClick={openModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> New Window
          </button>
        </div>
      )}

      {!loading && windows.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Active / Featured Window */}
          {activeWindow && (
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/20">
                    Active Now
                  </span>
                  <span className="flex items-center gap-1 text-indigo-100 text-sm">
                    <Clock className="w-4 h-4" /> Ends in {daysRemaining(activeWindow.endDate)} Days
                  </span>
                </div>
                <h2 className="text-3xl font-bold mb-2">{activeWindow.windowName}</h2>
                <p className="text-indigo-100 mb-8 max-w-lg">
                  {activeWindow.description ||
                    'No description provided for this enrollment window.'}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                    <span className="block text-indigo-200 text-xs font-bold uppercase mb-1">
                      Start Date
                    </span>
                    <span className="text-xl font-bold">{formatDate(activeWindow.startDate)}</span>
                  </div>
                  <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                    <span className="block text-indigo-200 text-xs font-bold uppercase mb-1">
                      End Date
                    </span>
                    <span className="text-xl font-bold">{formatDate(activeWindow.endDate)}</span>
                  </div>
                </div>

                <div className="w-full bg-black/20 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-white h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    style={{ width: `${elapsedPercent(activeWindow)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs font-bold mt-2 text-indigo-100">
                  <span>{elapsedPercent(activeWindow)}% of window elapsed</span>
                  <span>{formatDate(activeWindow.endDate)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Remaining windows */}
          <div className={`space-y-4 ${activeWindow ? '' : 'lg:col-span-2'}`}>
            {otherWindows.length === 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center justify-center h-[180px] text-sm text-slate-500">
                No other enrollment windows.
              </div>
            )}
            {otherWindows.map((win) => {
              const status = getWindowStatus(win);
              return (
                <div
                  key={win.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-center min-h-[180px]"
                >
                  <div className="flex justify-between items-start mb-2 gap-3">
                    <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200">
                      {win.windowName}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded uppercase shrink-0 ${STATUS_BADGE[status]}`}
                    >
                      {status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mb-4">
                    {win.description || 'No description provided.'}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <CalendarDays className="w-4 h-4" />
                    <span>
                      {formatDate(win.startDate)} — {formatDate(win.endDate)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Window Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-indigo-500" />
                New Enrollment Window
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1" htmlFor="windowName">
                  Window Name *
                </label>
                <input
                  id="windowName"
                  name="windowName"
                  type="text"
                  value={form.windowName}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Annual Open Enrollment 2026"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1" htmlFor="windowType">
                    Window Type *
                  </label>
                  <select
                    id="windowType"
                    name="windowType"
                    value={form.windowType}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="OPEN_ENROLLMENT">Open Enrollment</option>
                    <option value="NEW_HIRE">New Hire</option>
                    <option value="SPECIAL">Special</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1" htmlFor="planYear">
                    Plan Year *
                  </label>
                  <input
                    id="planYear"
                    name="planYear"
                    type="number"
                    value={form.planYear}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1" htmlFor="startDate">
                    Start Date *
                  </label>
                  <input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1" htmlFor="endDate">
                    End Date *
                  </label>
                  <input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Describe who is eligible and what can be changed."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Window
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
