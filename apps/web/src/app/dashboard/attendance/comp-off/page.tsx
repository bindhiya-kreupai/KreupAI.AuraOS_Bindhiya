'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarPlus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  History,
  FileText,
  Hourglass,
  X,
  Loader2,
  Ban,
  CalendarDays,
  ListChecks,
} from 'lucide-react';
import { CompOffService } from '../services';
import { useCurrentUser } from '@/lib/auth/AuthProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CompOffRequest {
  id: string;
  workDate: string;
  workHours: number;
  reason: string;
  status: string;
  expiryDate?: string;
  approvedAt?: string;
  balance: number;
  used: number;
}

interface CompOffSummary {
  total: number;
  earned: number;
  used: number;
  pending: number;
  expiring: number;
}

export default function CompOffPage() {
  const { user, loading: authLoading } = useCurrentUser();
  const [compOffs, setCompOffs] = useState<CompOffRequest[]>([]);
  const [summary, setSummary] = useState<CompOffSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    hours: 8,
    reason: '',
  });

  useEffect(() => {
    if (!user?.employeeId) return;
    fetchCompOffs();
  }, [user?.employeeId]);

  const validDateRange = (dateStr: string): string | null => {
    if (!dateStr) return 'Work date is required';
    const selected = new Date(dateStr + 'T00:00:00');
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffMs = now.getTime() - selected.getTime();
    if (diffMs < 0) return 'Work date cannot be in the future';
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays > 3) return 'Claims can only be submitted within 3 days from the work date';
    return null;
  };

  const validateForm = (): string | null => {
    const dateErr = validDateRange(formData.date);
    if (dateErr) return dateErr;
    if (formData.hours < 4) return 'Minimum 4 hours required to claim comp-off credit';
    if (formData.hours > 24) return 'Maximum 24 hours allowed per claim';
    if (formData.hours <= 0) return 'Hours must be greater than 0';
    if (!formData.reason.trim()) return 'Please provide a reason for the claim';
    return null;
  };

  const fetchCompOffs = async () => {
    if (!user?.employeeId) return;
    try {
      setLoading(true);
      const result = await CompOffService.getCompOffs({ employeeId: user.employeeId });
      setCompOffs((result || []) as any);
      const summaryData = await CompOffService.getCompOffSummary(user.employeeId);
      if (summaryData) {
        setSummary({
          total: summaryData.balance || 0,
          earned: summaryData.totalEarned || 0,
          used: summaryData.totalUsed || 0,
          pending: summaryData.pending || 0,
          expiring: summaryData.expiring || 0,
        });
      }
    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.employeeId) return;
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await CompOffService.submitCompOff({
        employeeId: user.employeeId,
        date: formData.date,
        hours: formData.hours,
        reason: formData.reason,
      });
      setShowForm(false);
      setFormData({ date: '', hours: 8, reason: '' });
      await fetchCompOffs();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to submit comp-off claim');
    } finally {
      setSubmitting(false);
    }
  };

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of compOffs) {
      const key = c.status === 'APPROVED' || c.status === 'AVAILED' ? 'APPROVED' : c.status;
      counts[key] = (counts[key] || 0) + 1;
    }
    return { total: compOffs.length, ...counts } as Record<string, number>;
  }, [compOffs]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (authLoading) return <div className="p-8 text-center text-slate-400">Loading...</div>;

  const availableCreditDays = summary?.total || 0;

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <CalendarPlus className="w-6 h-6 text-celestial-indigo" />
            Comp-off Applications
          </h1>
          <p className="text-silver-mist text-sm">
            Claim leave credit for extra hours worked on holidays/weekends.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors shadow-lg shadow-celestial-indigo/20"
        >
          <Plus className="w-4 h-4" /> New Claim
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Wallet & Policy */}
        <div className="lg:col-span-1 space-y-4">
          {/* Credit Wallet */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 opacity-90">
                <Clock className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-wider">
                  Available Balance
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-bold">{availableCreditDays}</span>
                <span className="text-lg font-medium opacity-80">Days</span>
              </div>
              <div className="text-xs bg-white/20 inline-flex px-3 py-1 rounded-full backdrop-blur-sm">
                Valid for 60 days from approval
              </div>
            </div>
          </div>

          {/* Policy Widget */}
          <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
            <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Policy Highlights
            </h3>
            <ul className="space-y-3">
              <li className="flex gap-3 text-xs text-slate-600 dark:text-slate-300 items-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  Minimum <strong>4 hours</strong> of work required to claim half-day credit.
                </span>
              </li>
              <li className="flex gap-3 text-xs text-slate-600 dark:text-slate-300 items-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  Full-day credit requires minimum <strong>8 hours</strong> logged.
                </span>
              </li>
              <li className="flex gap-3 text-xs text-slate-600 dark:text-slate-300 items-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  Claims must be submitted within <strong>3 days</strong> of work.
                </span>
              </li>
              <li className="flex gap-3 text-xs text-slate-600 dark:text-slate-300 items-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  Approvals required from: <strong>Reporting Manager</strong>.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right: History & Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-cloud dark:border-nebula-purple/20 flex justify-between items-center">
              <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                <History className="w-5 h-5 text-slate-500" />
                Recent Claims
              </h3>
              <button
                onClick={() => setShowAllModal(true)}
                className="text-xs font-bold text-celestial-indigo hover:underline"
              >
                View All
              </button>
            </div>
            <div className="divide-y divide-cloud dark:divide-nebula-purple/20">
              {loading ? (
                <div className="p-8 text-center text-slate-400">Loading...</div>
              ) : compOffs.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No comp-off records found</div>
              ) : (
                compOffs.slice(0, 5).map((claim) => (
                  <div
                    key={claim.id}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-deep-cosmos/50 transition-colors group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-ink-black dark:text-pearl">
                          {claim.workDate}
                        </span>
                        <span
                          className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            claim.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                              : claim.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                                : claim.status === 'EXPIRED'
                                  ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                  : 'bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
                          }`}
                        >
                          {claim.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-ink-black dark:text-pearl">
                          {claim.workHours} Hours
                        </div>
                        <div className="text-xs text-silver-mist">
                          {claim.workHours >= 8 ? 'Full Day Credit' : 'Half Day Credit'}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3 text-xs text-slate-600 dark:text-slate-300 mb-2">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3 h-3 text-silver-mist" />
                        {claim.reason}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-silver-mist" />
                        Balance: {claim.balance} days
                      </div>
                    </div>

                    {claim.status === 'APPROVED' && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500 dark:text-slate-400 border-t border-dashed border-cloud dark:border-nebula-purple/20 pt-2 mt-2">
                        {claim.approvedAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Approved on:{' '}
                            {new Date(claim.approvedAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        )}
                        {claim.expiryDate && (
                          <span className="flex items-center gap-1 text-rose-500">
                            <Hourglass className="w-3 h-3" />
                            Expires on:{' '}
                            {new Date(claim.expiryDate).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      {/* New Claim Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Comp-off Claim</DialogTitle>
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Work Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-cloud dark:border-nebula-purple/50 rounded-lg bg-white dark:bg-stellar-blue text-sm focus:ring-2 focus:ring-celestial-indigo/20 focus:border-celestial-indigo outline-none"
              />
              <p className="text-[11px] text-silver-mist mt-1">
                Must be within the last 3 days and not in the future
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Hours Worked <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min={4}
                  max={24}
                  step={1}
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-cloud dark:border-nebula-purple/50 rounded-lg bg-white dark:bg-stellar-blue text-sm focus:ring-2 focus:ring-celestial-indigo/20 focus:border-celestial-indigo outline-none"
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[11px] text-silver-mist">Min 4 hrs</p>
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded ${formData.hours >= 8 ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' : formData.hours >= 4 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' : 'text-silver-mist'}`}
                >
                  {formData.hours >= 8
                    ? 'Full Day Credit'
                    : formData.hours >= 4
                      ? 'Half Day Credit'
                      : '—'}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                maxLength={500}
                placeholder="Describe the work performed on this day..."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-3 py-2 border border-cloud dark:border-nebula-purple/50 rounded-lg bg-white dark:bg-stellar-blue text-sm focus:ring-2 focus:ring-celestial-indigo/20 focus:border-celestial-indigo outline-none resize-none"
              />
              <p className="text-[11px] text-silver-mist mt-1 text-right">
                {formData.reason.length}/500
              </p>
            </div>

            {formError && (
              <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 dark:bg-rose-900/10 px-3 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {formError}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 border border-cloud dark:border-nebula-purple/50 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-deep-cosmos/50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-celestial-indigo text-white text-sm font-medium rounded-lg hover:bg-celestial-indigo/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Claim'
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View All Dialog */}
      <Dialog open={showAllModal} onOpenChange={setShowAllModal}>
        <DialogContent className="!w-[95vw] !max-w-7xl !max-h-[85vh] overflow-y-auto !p-0">
          {/* Header */}
          <div className="px-8 pt-6 pb-4 border-b border-cloud dark:border-nebula-purple/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-sm">
                  <ListChecks className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold">All Comp-off Applications</DialogTitle>
                  <p className="text-xs text-silver-mist mt-0.5">
                    {compOffs.length} record{compOffs.length !== 1 ? 's' : ''} &middot; Sorted by
                    newest first
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAllModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-deep-cosmos/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Summary strip */}
          {compOffs.length > 0 && (
            <div className="flex flex-wrap gap-2 px-8 py-4 bg-indigo-50/40 dark:bg-indigo-950/20 border-b border-cloud dark:border-nebula-purple/20">
              {[
                {
                  label: 'Total',
                  value: statusCounts.total || 0,
                  color:
                    'bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
                },
                {
                  label: 'Pending',
                  value: statusCounts['PENDING'] || 0,
                  color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
                },
                {
                  label: 'Approved',
                  value: (statusCounts['APPROVED'] || 0) + (statusCounts['AVAILED'] || 0),
                  color:
                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
                },
                {
                  label: 'Expired',
                  value: statusCounts['EXPIRED'] || 0,
                  color: 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
                },
                {
                  label: 'Cancelled',
                  value: statusCounts['CANCELLED'] || 0,
                  color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400',
                },
              ]
                .filter((s) => s.value > 0)
                .map((s) => (
                  <span
                    key={s.label}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${s.color}`}
                  >
                    {s.value}
                    <span className="font-normal opacity-80">{s.label}</span>
                  </span>
                ))}
            </div>
          )}

          <div className="overflow-x-auto px-8 py-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-100 dark:border-slate-800">
                  <th className="text-left py-3.5 pr-6 font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5" />
                      Date
                    </span>
                  </th>
                  <th className="text-left py-3.5 pr-6 font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Hours
                  </th>
                  <th className="text-left py-3.5 pr-6 font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Credit
                  </th>
                  <th className="text-left py-3.5 pr-6 font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Reason
                  </th>
                  <th className="text-left py-3.5 pr-6 font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Status
                  </th>
                  <th className="text-right py-3.5 font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {compOffs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-20">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                          No comp-off records found
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          Submit a new claim to get started
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  compOffs.map((claim, idx) => (
                    <tr
                      key={claim.id}
                      className={`transition-colors ${
                        idx % 2 === 0
                          ? 'bg-white dark:bg-transparent'
                          : 'bg-indigo-50/30 dark:bg-indigo-950/10'
                      } hover:bg-indigo-50 dark:hover:bg-indigo-900/15`}
                    >
                      <td className="py-4 pr-6">
                        <span className="font-medium text-ink-black dark:text-pearl whitespace-nowrap">
                          {formatDate(claim.workDate)}
                        </span>
                      </td>
                      <td className="py-4 pr-6">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {claim.workHours}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500 text-xs ml-0.5">
                          hrs
                        </span>
                      </td>
                      <td className="py-4 pr-6">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
                            claim.workHours >= 8
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                          }`}
                        >
                          {claim.workHours >= 8 ? 'Full Day' : 'Half Day'}
                        </span>
                      </td>
                      <td className="py-4 pr-6 max-w-xs">
                        <p
                          className="text-slate-600 dark:text-slate-300 truncate leading-relaxed"
                          title={claim.reason}
                        >
                          {claim.reason || '—'}
                        </p>
                      </td>
                      <td className="py-4 pr-6">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
                            claim.status === 'APPROVED' || claim.status === 'AVAILED'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                              : claim.status === 'PENDING' ||
                                  claim.status === 'APPLIED' ||
                                  claim.status === 'EARNED'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                                : claim.status === 'EXPIRED'
                                  ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                  : 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'
                          }`}
                        >
                          {claim.status === 'APPROVED' || claim.status === 'AVAILED' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : claim.status === 'PENDING' ||
                            claim.status === 'APPLIED' ||
                            claim.status === 'EARNED' ? (
                            <AlertCircle className="w-3 h-3" />
                          ) : claim.status === 'EXPIRED' ? (
                            <Hourglass className="w-3 h-3" />
                          ) : (
                            <Ban className="w-3 h-3" />
                          )}
                          {claim.status === 'AVAILED'
                            ? 'Utilized'
                            : claim.status === 'APPLIED' || claim.status === 'EARNED'
                              ? 'Pending'
                              : claim.status.charAt(0) + claim.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="inline-flex items-baseline gap-1">
                          <span className="font-bold text-ink-black dark:text-pearl text-sm">
                            {claim.balance}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            day{claim.balance !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {compOffs.length > 0 && (
            <div className="px-8 py-4 border-t border-cloud dark:border-nebula-purple/20 flex items-center justify-between bg-slate-50/50 dark:bg-deep-cosmos/30">
              <span className="text-xs text-slate-400 dark:text-slate-500">
                Showing {compOffs.length} record{compOffs.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={() => setShowAllModal(false)}
                className="text-xs font-semibold text-celestial-indigo hover:text-celestial-indigo/80 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
