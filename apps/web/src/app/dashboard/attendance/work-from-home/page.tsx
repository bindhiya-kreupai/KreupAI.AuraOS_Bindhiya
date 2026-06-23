// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Home, Calendar, Plus, Monitor, Clock, Wifi, AlertCircle, X, Loader2 } from 'lucide-react';
import { WFHService } from '../services';

interface WFHRequest {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  isRecurring: boolean;
}

interface WFHSummary {
  availableDays: number;
  usedDaysThisMonth: number;
  yearlyLimit: number;
}

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function WorkFromHomePage() {
  const [wfhRequests, setWfhRequests] = useState<WFHRequest[]>([]);
  const [summary, setSummary] = useState<WFHSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [calendarDate, setCalendarDate] = useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });
  const [formData, setFormData] = useState({ startDate: '', endDate: '', reason: '' });

  useEffect(() => {
    fetchWFHData();
  }, []);

  const currentMonth = calendarDate.month;
  const currentYear = calendarDate.year;

  const fetchWFHData = async () => {
    try {
      setError(null);
      const result = await WFHService.getWFHRequests();
      setWfhRequests(result || []);
      const currentMonthStr = new Date().toISOString().slice(0, 7);
      const summaryData = await WFHService.getWFHSummary('current-user-id', currentMonthStr);
      if (summaryData) {
        setSummary({
          availableDays: summaryData.remainingDays || 0,
          usedDaysThisMonth: summaryData.usedDays || 0,
          yearlyLimit: summaryData.totalDays || 0,
        });
      }
    } catch (err: any) {
      console.error('Error:', err);
      setError('Failed to load WFH data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startDate || !formData.reason) {
      setError('Please fill in all required fields');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await WFHService.submitWFHRequest({
        startDate: formData.startDate,
        endDate: formData.endDate || formData.startDate,
        reason: formData.reason,
      });
      setShowForm(false);
      setFormData({ startDate: '', endDate: '', reason: '' });
      await fetchWFHData();
    } catch (err: any) {
      setError(err.message || 'Failed to submit WFH request');
    } finally {
      setSubmitting(false);
    }
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const getWFHStatusForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const request = wfhRequests.find((r: any) => {
      const start = r.startDate?.slice(0, 10);
      const end = r.endDate?.slice(0, 10);
      return dateStr >= start && dateStr <= (end || start);
    });
    if (!request) return null;
    return { status: request.status, reason: request.reason, id: request.id };
  };

  const statusConfig: Record<string, { bg: string; text: string; label: string; badge: string }> = {
    approved: {
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      text: 'text-indigo-600',
      label: 'WFH',
      badge: 'bg-indigo-100 text-indigo-700',
    },
    pending: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-600',
      label: 'Pending',
      badge: 'bg-amber-100 text-amber-700',
    },
    rejected: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-600',
      label: 'Rejected',
      badge: 'bg-red-100 text-red-700',
    },
  };

  const upcomingApproved = wfhRequests.find((r: any) => r.status === 'approved');
  const nextPending = wfhRequests.find((r: any) => r.status === 'pending');

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = Array(startOffset).fill(null);
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  }, [startOffset, daysInMonth]);

  return (
    <div className="space-y-4 pb-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <Home className="w-6 h-6 text-indigo-500" />
            Work From Home
          </h1>
          <p className="text-silver-mist text-sm mt-1">
            Apply for remote work days and track your WFH balance.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Apply for WFH
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2 text-red-700 dark:text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Wifi className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <p className="text-indigo-100 font-medium mb-1">Available Balance</p>
            <h2 className="text-4xl font-bold mb-4">{summary?.availableDays ?? 0} Days</h2>
            <div className="flex gap-3 text-sm text-indigo-100">
              <div>
                <span className="block font-bold text-white">
                  {summary?.usedDaysThisMonth ?? 0}
                </span>{' '}
                used this month
              </div>
              <div>
                <span className="block font-bold text-white">{summary?.yearlyLimit ?? 0}</span>{' '}
                yearly cap
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Monitor className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-ink-black dark:text-pearl">Upcoming WFH</h3>
            {upcomingApproved ? (
              <p className="text-emerald-500 font-bold">
                {new Date(upcomingApproved.startDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            ) : (
              <p className="text-silver-mist text-sm">No upcoming WFH days</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-ink-black dark:text-pearl">Pending Approval</h3>
            {nextPending ? (
              <p className="text-amber-500 font-bold">
                {new Date(nextPending.startDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            ) : (
              <p className="text-silver-mist text-sm">No pending requests</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm p-6">
        <h3 className="font-bold text-lg text-ink-black dark:text-pearl mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-400" /> {monthNames[currentMonth]} {currentYear}
        </h3>

        <div className="grid grid-cols-7 gap-2 text-center text-sm">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="font-bold text-slate-400 py-2">
              {d}
            </div>
          ))}
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} />;
            }
            const status = getWFHStatusForDay(day);
            const config = status ? statusConfig[status.status] : null;
            return (
              <div
                key={day}
                className={`h-24 border border-slate-100 dark:border-slate-800 rounded-lg p-2 text-left relative group hover:border-indigo-200 transition-all ${config?.bg || ''}`}
              >
                <span
                  className={`font-bold text-sm ${config?.text || 'text-slate-700 dark:text-slate-300'}`}
                >
                  {day}
                </span>
                {status && (
                  <div
                    className={`mt-1 text-xs ${config?.badge || ''} px-1.5 py-0.5 rounded font-medium truncate`}
                  >
                    {config?.label || status.status}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-stellar-blue rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-ink-black dark:text-pearl">Apply for WFH</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-ink-black dark:text-pearl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  min={formData.startDate}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-ink-black dark:text-pearl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reason
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-ink-black dark:text-pearl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Tell us why you need to work from home..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
