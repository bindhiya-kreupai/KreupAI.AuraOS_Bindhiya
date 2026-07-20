'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { HeartPulse, Calendar, Stethoscope, FileText, Loader2, X, Send } from 'lucide-react';
import { HealthCheckupService } from '../services';
import type { HealthCheckup } from '../services';
import { useCurrentUser } from '@/lib/auth/AuthProvider';

const CHECKUP_TYPES = ['Annual Physical', 'Blood Work', 'Eye Exam', 'Dental', 'Vaccination'];

export default function HealthCheckupsPage() {
  const { user, loading: authLoading } = useCurrentUser();
  const [checkups, setCheckups] = useState<HealthCheckup[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [form, setForm] = useState({
    checkupType: CHECKUP_TYPES[0],
    scheduledFor: '',
    clinic: '',
  });
  const [detail, setDetail] = useState<HealthCheckup | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await HealthCheckupService.getAll();
      setCheckups(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openBooking = (prefill?: Partial<typeof form>) => {
    setForm({
      checkupType: prefill?.checkupType ?? CHECKUP_TYPES[0],
      scheduledFor: prefill?.scheduledFor ?? '',
      clinic: prefill?.clinic ?? '',
    });
    setFeedback(null);
    setShowForm(true);
  };

  const handleBook = async () => {
    if (!user?.employeeId) return;
    if (!form.scheduledFor) {
      setFeedback({ type: 'error', text: 'Please choose an appointment date.' });
      return;
    }
    setSubmitting(true);
    setFeedback(null);
    try {
      await HealthCheckupService.create({
        checkupType: form.checkupType,
        scheduledFor: new Date(form.scheduledFor).toISOString(),
        employeeId: user.employeeId,
        notes: form.clinic.trim() || undefined,
      });
      setFeedback({ type: 'success', text: 'Appointment booked.' });
      setShowForm(false);
      await loadData();
    } catch {
      setFeedback({ type: 'error', text: 'Failed to book appointment.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const upcoming = checkups.find((c) => c.status !== 'Completed');
  const history = checkups.filter((c) => c.status === 'Completed');

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-rose-500" />
            Health Checkups
          </h1>
          <p className="text-slate-500 text-sm">Schedule your annual checkups and view reports.</p>
        </div>
        <button
          type="button"
          onClick={() => openBooking()}
          disabled={!user?.employeeId}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-60"
        >
          <Calendar className="w-4 h-4" /> Book Appointment
        </button>
      </div>

      {feedback && !showForm && (
        <div
          className={`text-xs font-bold px-3 py-2 rounded-lg ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20'
              : 'bg-rose-50 text-rose-700 dark:bg-rose-900/20'
          }`}
        >
          {feedback.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Upcoming */}
        <div className="lg:col-span-1 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg shadow-rose-500/20">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" /> Next Appointment
          </h3>
          {upcoming ? (
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-4 border border-white/20">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-2xl">{upcoming.type}</span>
                <span className="text-xs font-bold bg-white text-rose-600 px-2 py-0.5 rounded">
                  CONFIRMED
                </span>
              </div>
              <div className="text-lg font-bold mb-1">{upcoming.date}</div>
              <div className="text-sm opacity-90">{upcoming.clinic || 'Clinic TBD'}</div>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-4 border border-white/20 text-center">
              <p className="text-sm opacity-90">No upcoming appointments scheduled.</p>
            </div>
          )}
          <p className="text-sm opacity-80 mb-6">
            Please fast for 12 hours prior to any blood work appointments.
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                openBooking(
                  upcoming ? { checkupType: upcoming.type, clinic: upcoming.clinic } : undefined
                )
              }
              className="flex-1 py-2 bg-white text-rose-600 rounded-lg font-bold text-sm"
            >
              Reschedule
            </button>
            <button
              type="button"
              onClick={() => upcoming && setDetail(upcoming)}
              disabled={!upcoming}
              className="flex-1 py-2 bg-rose-700 text-white rounded-lg font-bold text-sm disabled:opacity-60"
            >
              Details
            </button>
          </div>
        </div>

        {/* History */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-lg">Checkup History</h3>
          {history.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-400">
              No completed checkups found.
            </div>
          ) : (
            history.map((app, i) => (
              <div
                key={app.id || i}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Stethoscope className="w-6 h-6 text-slate-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{app.type}</h4>
                    <div className="text-xs text-slate-500">
                      {app.date} • {app.clinic || 'Clinic'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDetail(app)}
                  className="flex items-center gap-2 text-xs font-bold text-indigo-600 border border-indigo-100 dark:border-indigo-900 px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                >
                  <FileText className="w-3 h-3" /> View Report
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Booking modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 relative">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-lg mb-4">Book Appointment</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Checkup Type</label>
                <select
                  value={form.checkupType}
                  onChange={(e) => setForm({ ...form, checkupType: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none"
                >
                  {CHECKUP_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  value={form.scheduledFor}
                  onChange={(e) => setForm({ ...form, scheduledFor: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Clinic (optional)
                </label>
                <input
                  type="text"
                  value={form.clinic}
                  onChange={(e) => setForm({ ...form, clinic: e.target.value })}
                  placeholder="e.g. City Medical Center"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none"
                />
              </div>
              {feedback && (
                <div
                  className={`text-xs font-bold px-3 py-2 rounded-lg ${
                    feedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-900/20'
                  }`}
                >
                  {feedback.text}
                </div>
              )}
              <button
                type="button"
                onClick={handleBook}
                disabled={submitting || !user?.employeeId}
                className="w-full py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 relative">
            <button
              type="button"
              onClick={() => setDetail(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-rose-500" /> {detail.type}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Date</span>
                <span className="font-bold">{detail.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className="font-bold">{detail.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Clinic</span>
                <span className="font-bold">{detail.clinic || '—'}</span>
              </div>
              {detail.result && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-500 mb-1">Result</div>
                  <p>{detail.result}</p>
                </div>
              )}
              {detail.notes && (
                <div>
                  <div className="text-xs font-bold text-slate-500 mb-1">Notes</div>
                  <p>{detail.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
