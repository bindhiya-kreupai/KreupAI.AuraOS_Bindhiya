// Using RegularizationService.getPendingRequests() for regularization request data
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FileCheck,
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Eye,
  Ban,
  X,
} from 'lucide-react';
import { RegularizationService } from '../services';
import type { AttendanceRegularization } from '../types';

interface RequestForm {
  date: string;
  type: string;
  checkIn: string;
  checkOut: string;
  reason: string;
}

// Map the normalized status back to a display badge state.
function badgeState(status: string): 'Approved' | 'Rejected' | 'Cancelled' | 'Pending' {
  switch ((status || '').toLowerCase()) {
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'cancelled':
      return 'Cancelled';
    default:
      return 'Pending';
  }
}

const TYPE_LABELS: Record<string, string> = {
  missed_punch: 'Missed Punch',
  late_arrival: 'Late In',
  early_departure: 'Early Out',
  incorrect_punch: 'Incorrect Punch',
};

export default function RegularizationRequestPage() {
  const [requests, setRequests] = useState<AttendanceRegularization[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AttendanceRegularization | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(
    null
  );
  const formRef = useRef<HTMLFormElement | null>(null);
  const [form, setForm] = useState<RequestForm>({
    date: '',
    type: 'Missed Punch',
    checkIn: '',
    checkOut: '',
    reason: '',
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (!statusMsg) return;
    const t = setTimeout(() => setStatusMsg(null), 4000);
    return () => clearTimeout(t);
  }, [statusMsg]);

  // Close the row action menu when clicking anywhere else.
  useEffect(() => {
    if (!menuOpenId) return;
    const handler = () => setMenuOpenId(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [menuOpenId]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const result = await RegularizationService.getPendingRequests();
      setRequests((result || []) as AttendanceRegularization[]);
    } catch (error: any) {
      console.error('Error:', error);
      setStatusMsg({ kind: 'error', text: 'Failed to load requests.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);
    try {
      await RegularizationService.submitRegularization({
        date: form.date,
        reason: form.reason,
        requestedInTime: form.checkIn,
        requestedOutTime: form.checkOut,
        regularizationType: form.type,
      } as any);
      await fetchRequests();
      setForm({ date: '', type: 'Missed Punch', checkIn: '', checkOut: '', reason: '' });
      setStatusMsg({ kind: 'success', text: 'Regularization request submitted.' });
    } catch (error: any) {
      console.error('Error:', error);
      setStatusMsg({ kind: 'error', text: error?.message || 'Failed to submit request.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof RequestForm, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleCancel = async (req: AttendanceRegularization) => {
    setMenuOpenId(null);
    if (badgeState(req.status) !== 'Pending') {
      setStatusMsg({ kind: 'error', text: 'Only pending requests can be cancelled.' });
      return;
    }
    setLoading(true);
    setStatusMsg(null);
    try {
      await RegularizationService.cancelRegularization(req.id, 'Cancelled by employee');
      await fetchRequests();
      setStatusMsg({ kind: 'success', text: 'Request cancelled.' });
    } catch (error: any) {
      console.error('Error:', error);
      setStatusMsg({ kind: 'error', text: error?.message || 'Failed to cancel request.' });
    } finally {
      setLoading(false);
    }
  };

  const focusForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const firstInput = formRef.current?.querySelector('input');
    (firstInput as HTMLInputElement | null)?.focus();
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-indigo-500" />
            Regularization Requests
          </h1>
          <p className="text-silver-mist text-sm mt-1">
            Correct attendance anomalies and missed punches.
          </p>
        </div>
        <button
          type="button"
          onClick={focusForm}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Request
        </button>
      </div>

      {statusMsg && (
        <div
          className={`rounded-lg border px-4 py-2 text-sm flex items-center gap-2 ${
            statusMsg.kind === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-200'
          }`}
        >
          {statusMsg.kind === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          {statusMsg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Request Form Sidebar */}
        <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <h3 className="font-bold text-lg text-ink-black dark:text-pearl mb-4">Submit Request</h3>
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option>Missed Punch</option>
                <option>Late In</option>
                <option>Early Out</option>
                <option>On Duty (OD)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Check In
                </label>
                <input
                  type="time"
                  value={form.checkIn}
                  onChange={(e) => handleInputChange('checkIn', e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Check Out
                </label>
                <input
                  type="time"
                  value={form.checkOut}
                  onChange={(e) => handleInputChange('checkOut', e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                Reason
              </label>
              <textarea
                rows={3}
                value={form.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                required
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                placeholder="Enter justification..."
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Request
            </button>
          </form>
        </div>

        {/* History List */}
        <div className="col-span-1 lg:col-span-2 space-y-4">
          <h3 className="font-bold text-lg text-ink-black dark:text-pearl px-1">Recent Requests</h3>
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-slate-500">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50">
              No regularization requests found
            </div>
          ) : (
            requests.map((req) => {
              const state = badgeState(req.status);
              const typeLabel = TYPE_LABELS[req.regularizationType] || req.regularizationType;
              const dateLabel = req.date ? new Date(req.date).toLocaleDateString() : '—';
              return (
                <div
                  key={req.id}
                  className="p-4 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        state === 'Approved'
                          ? 'bg-emerald-100 text-emerald-600'
                          : state === 'Rejected'
                            ? 'bg-rose-100 text-rose-600'
                            : state === 'Cancelled'
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-amber-100 text-amber-600'
                      }`}
                    >
                      {state === 'Approved' ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : state === 'Rejected' ? (
                        <XCircle className="w-6 h-6" />
                      ) : state === 'Cancelled' ? (
                        <Ban className="w-6 h-6" />
                      ) : (
                        <Clock className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-ink-black dark:text-pearl">
                          {typeLabel}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {dateLabel}
                        </span>
                      </div>
                      <p className="text-sm text-silver-mist mt-0.5">{req.reason}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                      <div
                        className={`text-sm font-bold ${
                          state === 'Approved'
                            ? 'text-emerald-500'
                            : state === 'Rejected'
                              ? 'text-rose-500'
                              : state === 'Cancelled'
                                ? 'text-slate-400'
                                : 'text-amber-500'
                        }`}
                      >
                        {state}
                      </div>
                      <div className="text-xs text-silver-mist">
                        {req.reviewedBy ? `by ${req.reviewedBy}` : 'Awaiting review'}
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        aria-label="Row actions"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId((cur) => (cur === req.id ? null : req.id));
                        }}
                        className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full text-slate-400"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      {menuOpenId === req.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-10 z-20 w-44 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-lg shadow-xl py-1 text-sm"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setDetail(req);
                              setMenuOpenId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                          >
                            <Eye className="w-4 h-4" /> View detail
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCancel(req)}
                            disabled={state !== 'Pending'}
                            className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                          >
                            <Ban className="w-4 h-4" /> Cancel request
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {detail && (
        <RegularizationDetailModal
          request={detail}
          typeLabel={TYPE_LABELS[detail.regularizationType] || detail.regularizationType}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  );
}

function RegularizationDetailModal({
  request,
  typeLabel,
  onClose,
}: {
  request: AttendanceRegularization;
  typeLabel: string;
  onClose: () => void;
}) {
  const fmtDate = (v?: string) => (v ? new Date(v).toLocaleString() : '—');
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-stellar-blue w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-cloud dark:border-nebula-purple/30">
          <h3 className="font-bold flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-indigo-500" /> Regularization Detail
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-3 text-sm">
          <DetailRow label="Employee" value={request.employeeName} />
          <DetailRow label="Type" value={typeLabel} />
          <DetailRow
            label="Date"
            value={request.date ? new Date(request.date).toLocaleDateString() : '—'}
          />
          <DetailRow label="Requested In" value={request.requestedIn || '—'} />
          <DetailRow label="Requested Out" value={request.requestedOut || '—'} />
          <DetailRow label="Reason" value={request.reason || '—'} />
          <DetailRow label="Status" value={request.status} />
          <DetailRow label="Submitted" value={fmtDate(request.submittedDate)} />
          {request.reviewedBy && <DetailRow label="Reviewed By" value={request.reviewedBy} />}
          {request.reviewedDate && (
            <DetailRow label="Reviewed On" value={fmtDate(request.reviewedDate)} />
          )}
          {request.reviewComments && <DetailRow label="Comments" value={request.reviewComments} />}
        </div>
        <div className="flex justify-end px-5 py-3 border-t border-cloud dark:border-nebula-purple/30">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-silver-mist">{label}</span>
      <span className="font-medium text-ink-black dark:text-pearl text-right">{value}</span>
    </div>
  );
}
