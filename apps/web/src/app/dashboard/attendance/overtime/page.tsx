'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  DollarSign,
  Calendar,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  PieChart,
} from 'lucide-react';
import { OvertimeService } from '../services';
import type { OvertimeRequest } from '../types';

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

function formatTime(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${h12}:${String(minutes).padStart(2, '0')} ${ampm}`;
  } catch {
    return dateStr;
  }
}

function getMultiplierLabel(
  multiplier?: number,
  overtimeType?: OvertimeRequest['overtimeType']
): string {
  if (multiplier != null) return `${multiplier}x`;
  switch (overtimeType) {
    case 'weekend':
    case 'holiday':
      return '2.0x';
    case 'regular':
    case 'compensatory':
    default:
      return '1.5x';
  }
}

function getStatusDisplayClass(status: OvertimeRequest['status']): string {
  switch (status) {
    case 'approved':
    case 'paid':
    case 'comp_off_granted':
      return 'text-emerald-500';
    case 'pending':
      return 'text-amber-500';
    case 'rejected':
      return 'text-rose-500';
    default:
      return 'text-slate-500';
  }
}

function getStatusLabel(status: OvertimeRequest['status']): string {
  switch (status) {
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'paid':
      return 'Paid';
    case 'comp_off_granted':
      return 'Comp Off';
    case 'pending':
    default:
      return 'Pending';
  }
}

export default function OvertimePage() {
  const [overtimeRecords, setOvertimeRecords] = useState<OvertimeRequest[]>([]);
  const [summary, setSummary] = useState<{
    totalHours: number;
    weekdayHours: number;
    weekendHours: number;
    approvedHours: number;
    totalEarnings: number;
    pendingEarnings: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formDate, setFormDate] = useState('');
  const [formHours, setFormHours] = useState(1);
  const [formReason, setFormReason] = useState('');
  const [formError, setFormError] = useState('');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchOvertimeData();
  }, []);

  const fetchOvertimeData = async () => {
    try {
      const records = await OvertimeService.getOvertimeRequests({ employeeId: 'current-user' });
      const recordsArr = records || [];

      // Client-side filter: only show records belonging to the current employee
      const currentEmployeeId = recordsArr.length > 0 ? recordsArr[0].employeeId : null;
      const filteredRecords = currentEmployeeId
        ? recordsArr.filter((r) => r.employeeId === currentEmployeeId)
        : recordsArr;

      setOvertimeRecords(filteredRecords);

      const approved = filteredRecords.filter((r) => r.status === 'approved');
      const pending = filteredRecords.filter((r) => r.status === 'pending');

      const weekdayHours = filteredRecords
        .filter((r) => r.overtimeType === 'regular' || r.overtimeType === 'compensatory')
        .reduce((sum, r) => sum + (r.requestedHours || 0), 0);
      const weekendHours = filteredRecords
        .filter((r) => r.overtimeType === 'weekend' || r.overtimeType === 'holiday')
        .reduce((sum, r) => sum + (r.requestedHours || 0), 0);

      setSummary({
        totalHours: filteredRecords.reduce((sum, r) => sum + (r.requestedHours || 0), 0),
        weekdayHours,
        weekendHours,
        approvedHours: approved.reduce((sum, r) => sum + (r.requestedHours || 0), 0),
        totalEarnings: filteredRecords.reduce(
          (sum, r) => sum + (r.estimatedPayout ?? r.paymentAmount ?? 0),
          0
        ),
        pendingEarnings: pending.reduce(
          (sum, r) => sum + (r.estimatedPayout ?? r.paymentAmount ?? 0),
          0
        ),
      });
    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOvertime = async (data: { date: string; hours: number; reason: string }) => {
    setLoading(true);
    try {
      const dayOfWeek = new Date(data.date).getDay();
      const overtimeType = dayOfWeek === 0 || dayOfWeek === 6 ? 'weekend' : 'regular';

      await OvertimeService.submitOvertimeRequest({
        employeeId: 'current-user',
        date: data.date,
        overtimeMinutes: data.hours * 60,
        reason: data.reason,
        overtimeType,
      } as any);
      await fetchOvertimeData();
      setShowForm(false);
    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formDate) {
      setFormError('Please select a date.');
      return;
    }
    if (formHours < 1) {
      setFormError('Minimum 1 hour required.');
      return;
    }
    if (!formReason.trim()) {
      setFormError('Please provide a reason.');
      return;
    }
    await handleSubmitOvertime({ date: formDate, hours: formHours, reason: formReason });
  };

  const pendingRecords = overtimeRecords.filter((r) => r.status === 'pending');
  const hasPendingRecords = pendingRecords.length > 0;

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <Clock className="w-6 h-6 text-celestial-indigo" />
            Overtime Management
          </h1>
          <p className="text-silver-mist text-sm">
            Log extra hours, track approvals, and estimate payouts.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors shadow-lg shadow-celestial-indigo/20"
        >
          <Plus className="w-4 h-4" /> Log Overtime
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Stats & Policy */}
        <div className="lg:col-span-1 space-y-4">
          {/* Est. Payout Card */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 opacity-90">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-wider">Estimated Payout</span>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold">
                  {summary != null && hasPendingRecords
                    ? `$${summary.pendingEarnings.toFixed(2)}`
                    : '—'}
                </span>
                {summary != null && hasPendingRecords && summary.pendingEarnings > 0 && (
                  <span className="text-lg font-medium opacity-80">Pending</span>
                )}
              </div>
              {summary != null && hasPendingRecords && summary.pendingEarnings > 0 && (
                <div className="text-xs bg-white/20 inline-flex px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> December 2024 Cycle
                </div>
              )}
            </div>
          </div>

          {/* Hours Summary */}
          <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
            <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-celestial-indigo" />
              Hours Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  Total Hours Logged
                </span>
                <span className="font-bold text-ink-black dark:text-pearl">
                  {summary?.totalHours || 0} Hrs
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-300">Weekdays (1.5x)</span>
                <span className="font-bold text-ink-black dark:text-pearl">
                  {summary?.weekdayHours || 0} Hrs
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-300">Weekends (2.0x)</span>
                <span className="font-bold text-ink-black dark:text-pearl">
                  {summary?.weekendHours || 0} Hrs
                </span>
              </div>
              <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-300">Approved</span>
                <span className="font-bold text-emerald-600">
                  {summary?.approvedHours || 0} Hrs
                </span>
              </div>
            </div>
          </div>

          {/* Policy Widget */}
          <div className="bg-slate-50 dark:bg-deep-cosmos/50 p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50">
            <h3 className="font-bold text-ink-black dark:text-pearl mb-3 text-sm">Policy Rules</h3>
            <ul className="space-y-2">
              <li className="text-xs text-slate-500 flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-celestial-indigo mt-1.5 shrink-0"></div>
                Weekday OT is paid at 1.5x hourly rate.
              </li>
              <li className="text-xs text-slate-500 flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-celestial-indigo mt-1.5 shrink-0"></div>
                Weekend/Holiday OT is paid at 2.0x hourly rate.
              </li>
              <li className="text-xs text-slate-500 flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-celestial-indigo mt-1.5 shrink-0"></div>
                Minimum 1 hour required to log a claim.
              </li>
            </ul>
          </div>
        </div>

        {/* Right: Logs */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm min-h-[500px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-500" />
                Claim History
              </h3>
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-xs font-bold text-celestial-indigo hover:underline"
              >
                {showAll ? 'Show Less' : 'View All'}
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-celestial-indigo border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-2 text-slate-500">Loading...</p>
              </div>
            ) : overtimeRecords.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p>No overtime records found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(showAll ? overtimeRecords : overtimeRecords.slice(0, 5)).map((claim) => (
                  <div
                    key={claim.id}
                    className="p-4 rounded-xl border border-cloud dark:border-nebula-purple/20 hover:border-celestial-indigo/30 hover:bg-slate-50 dark:hover:bg-deep-cosmos/30 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 font-bold text-xs flex flex-col items-center justify-center w-12 h-12">
                          <span>{claim.requestedHours ?? 0}</span>
                          <span className="text-[9px] uppercase">Hrs</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-ink-black dark:text-pearl text-sm group-hover:text-celestial-indigo transition-colors">
                            {claim.reason || 'Overtime'}
                          </h4>
                          <div className="text-xs text-silver-mist flex items-center gap-2 mt-0.5">
                            <span>{formatDate(claim.date)}</span>
                            <span>•</span>
                            <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 rounded text-[10px]">
                              {getMultiplierLabel(claim.multiplier, claim.overtimeType)} Rate
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-ink-black dark:text-pearl text-sm">
                          {claim.estimatedPayout != null
                            ? `$${claim.estimatedPayout.toFixed(2)}`
                            : claim.paymentAmount != null
                              ? `$${claim.paymentAmount.toFixed(2)}`
                              : '—'}
                        </div>
                        <div
                          className={`text-[10px] font-bold uppercase mt-1 ${getStatusDisplayClass(claim.status)}`}
                        >
                          {getStatusLabel(claim.status)}
                        </div>
                      </div>
                    </div>

                    {claim.status === 'approved' && claim.approvedBy && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 border-t border-dashed border-cloud dark:border-nebula-purple/20 pt-2 mt-2">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        Approved by {claim.approvedBy}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                <Clock className="w-5 h-5 text-celestial-indigo" />
                Log Overtime
              </h3>
              <button
                onClick={() => setShowForm(false)}
                type="button"
                className="p-1 hover:bg-slate-100 dark:hover:bg-deep-cosmos rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-deep-cosmos text-ink-black dark:text-pearl text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-1.5">
                  Hours
                </label>
                <input
                  type="number"
                  min={0.5}
                  max={24}
                  step={0.5}
                  value={formHours}
                  onChange={(e) => setFormHours(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-deep-cosmos text-ink-black dark:text-pearl text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-1.5">
                  Reason
                </label>
                <textarea
                  rows={3}
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-deep-cosmos text-ink-black dark:text-pearl text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 resize-none"
                  required
                />
              </div>
              {formError && (
                <div className="flex items-center gap-2 text-rose-500 text-xs bg-rose-50 dark:bg-rose-500/10 px-3 py-2 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {formError}
                </div>
              )}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-cloud dark:border-nebula-purple/50 text-ink-black dark:text-pearl rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-deep-cosmos transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Submit
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
