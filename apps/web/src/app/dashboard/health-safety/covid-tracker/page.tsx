'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Thermometer,
  Syringe,
  FileCheck,
  AlertCircle,
  Loader2,
  X,
  Send,
} from 'lucide-react';
import { HealthCheckupService } from '../services';
import type { HealthCheckup } from '../services';
import { useCurrentUser } from '@/lib/auth/AuthProvider';

const SYMPTOMS = [
  'Fever',
  'Cough',
  'Sore throat',
  'Loss of taste/smell',
  'Fatigue',
  'Shortness of breath',
];

export default function COVIDTrackerPage() {
  const { user, loading: authLoading } = useCurrentUser();
  const [checkups, setCheckups] = useState<HealthCheckup[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [temperature, setTemperature] = useState('36.6');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

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

  const today = new Date().toISOString().slice(0, 10);
  const submittedToday = checkups.some(
    (c) => c.type?.toLowerCase().includes('covid') && c.date === today
  );

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const handleSubmit = async () => {
    if (!user?.employeeId) return;
    setSubmitting(true);
    setFeedback(null);
    const temp = Number(temperature);
    const healthy = temp < 37.5 && selectedSymptoms.length === 0;
    try {
      await HealthCheckupService.create({
        checkupType: 'COVID Daily Check',
        scheduledFor: new Date().toISOString(),
        employeeId: user.employeeId,
        result: healthy ? 'Healthy' : 'Follow-up required',
        notes: `Temperature: ${temperature}°C. Symptoms: ${
          selectedSymptoms.length > 0 ? selectedSymptoms.join(', ') : 'None'
        }`,
        completed: true,
      });
      setFeedback({ type: 'success', text: 'Daily health check submitted.' });
      setShowForm(false);
      setSelectedSymptoms([]);
      setTemperature('36.6');
      await loadData();
    } catch {
      setFeedback({ type: 'error', text: 'Failed to submit health check.' });
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

  const vaccinationRecords = checkups.filter(
    (c) => c.type?.toLowerCase().includes('vaccin') || c.type?.toLowerCase().includes('covid')
  );

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-500" />
            COVID-19 Tracker
          </h1>
          <p className="text-slate-500 text-sm">Status reporting and vaccination records.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Daily Status */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-bold text-lg mb-4">Daily Health Check</h3>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-4 text-center">
            <Thermometer
              className={`w-10 h-10 mx-auto mb-2 ${submittedToday ? 'text-emerald-500' : 'text-amber-500'}`}
            />
            <h4 className="font-bold">
              {submittedToday ? 'Submitted Today' : 'Not Submitted Today'}
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              {submittedToday
                ? 'Thank you for reporting your status today.'
                : 'Please report your temperature and symptoms.'}
            </p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              disabled={submittedToday || !user?.employeeId}
              className="w-full py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              Submit Report
            </button>
          </div>

          {feedback && !showForm && (
            <div
              className={`text-xs font-bold px-3 py-2 rounded-lg mb-3 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-900/20'
              }`}
            >
              {feedback.text}
            </div>
          )}

          <div className="space-y-2">
            {checkups.length === 0 ? (
              <div className="text-center py-4 text-sm text-slate-400">
                No health check history available.
              </div>
            ) : (
              checkups.slice(0, 3).map((c, i) => (
                <div
                  key={c.id || i}
                  className="flex justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800"
                >
                  <span className="text-slate-500">{c.date}</span>
                  <span className="font-bold text-emerald-600">
                    {c.result || (c.status === 'Completed' ? 'Healthy' : c.status)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Vaccination */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Syringe className="w-5 h-5 text-emerald-500" /> Vaccination Record
            </h3>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <FileCheck className="w-3 h-3" />{' '}
              {vaccinationRecords.length > 0 ? 'VERIFIED' : 'NO RECORDS'}
            </span>
          </div>

          {vaccinationRecords.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Syringe className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No vaccination records found. Please upload your vaccination certificate.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {vaccinationRecords.map((vax, i) => (
                <div
                  key={vax.id || i}
                  className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 relative overflow-hidden"
                >
                  <span className="absolute top-0 right-0 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold px-2 py-1 rounded-bl-xl text-slate-500">
                    {vax.type}
                  </span>
                  <div className="font-bold text-lg mb-1">{vax.result || 'Record'}</div>
                  <div className="text-xs text-slate-500">Date: {vax.date}</div>
                  <div className="text-xs text-slate-500">{vax.notes}</div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex gap-3 text-sm text-amber-800 dark:text-amber-200 border border-amber-100 dark:border-amber-800/50">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>
              New booster shots are available for eligible employees. Check the &apos;Health
              Checkups&apos; page to schedule an appointment.
            </p>
          </div>
        </div>
      </div>

      {/* Daily check form modal */}
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
            <h3 className="font-bold text-lg mb-4">Daily Health Check</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Body Temperature (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">Symptoms</label>
                <div className="flex flex-wrap gap-2">
                  {SYMPTOMS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSymptom(s)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
                        selectedSymptoms.includes(s)
                          ? 'bg-rose-100 border-rose-300 text-rose-700'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
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
                onClick={handleSubmit}
                disabled={submitting || !user?.employeeId}
                className="w-full py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Submit Check
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
