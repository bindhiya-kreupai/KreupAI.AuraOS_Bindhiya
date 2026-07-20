'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  RotateCcw,
  Download,
  ChevronDown,
  ChevronUp,
  IndianRupee,
  Hash,
  Calendar,
  Loader2,
  XCircle,
  Send,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types — mirror the real GL API contract
// ---------------------------------------------------------------------------

type JournalStatus = 'DRAFT' | 'POSTED' | 'EXPORTED' | 'REVERSED';
type AccountingSystem = 'QUICKBOOKS' | 'XERO' | 'SAP' | 'TALLY' | 'ZOHO_BOOKS';

interface JournalLine {
  id: string;
  accountId: string;
  costCenterId: string | null;
  departmentId: string | null;
  description: string | null;
  debit: number | string;
  credit: number | string;
  currency: string;
}

interface JournalEntry {
  id: string;
  tenantId: string;
  countryCode: string;
  currency: string;
  status: JournalStatus;
  entryDate: string;
  reference: string;
  description: string | null;
  sourceType: string;
  sourceId: string;
  totalDebit: number | string;
  totalCredit: number | string;
  createdBy: string | null;
  postedAt: string | null;
  postedById: string | null;
  exportedAt: string | null;
  exportedToSystem: string | null;
  exportReference: string | null;
  lines: JournalLine[];
}

interface ListResponse {
  success: boolean;
  items: JournalEntry[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}

type Feedback = { kind: 'success' | 'error'; text: string } | null;

const ACCOUNTING_SYSTEMS: AccountingSystem[] = ['QUICKBOOKS', 'XERO', 'SAP', 'TALLY', 'ZOHO_BOOKS'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const num = (n: number | string): number => (typeof n === 'string' ? Number(n) || 0 : n);

function fmt(n: number | string): string {
  const v = num(n);
  if (v === 0) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(v);
}

async function readError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body?.error?.message || body?.message || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

const STATUS_CONFIG: Record<
  JournalStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  DRAFT: {
    label: 'Draft',
    color: 'bg-yellow-100 text-yellow-700',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  POSTED: {
    label: 'Posted',
    color: 'bg-green-100 text-green-700',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  EXPORTED: {
    label: 'Exported',
    color: 'bg-blue-100 text-blue-700',
    icon: <Send className="w-3.5 h-3.5" />,
  },
  REVERSED: {
    label: 'Reversed',
    color: 'bg-red-100 text-red-700',
    icon: <RotateCcw className="w-3.5 h-3.5" />,
  },
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function GLPostingDashboard() {
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [showReverseModal, setShowReverseModal] = useState<string | null>(null);
  const [reversalReason, setReversalReason] = useState('');

  const [showExportModal, setShowExportModal] = useState<string | null>(null);
  const [exportSystem, setExportSystem] = useState<AccountingSystem>('QUICKBOOKS');
  const [exportReference, setExportReference] = useState('');

  const fetchJournals = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch('/api/v1/payroll/gl/journals?page=1&limit=50', {
        credentials: 'same-origin',
      });
      if (!res.ok) {
        setLoadError(await readError(res));
        setJournals([]);
        return;
      }
      const body: ListResponse = await res.json();
      setJournals(Array.isArray(body.items) ? body.items : []);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load journal entries');
      setJournals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchJournals();
  }, [fetchJournals]);

  const handlePost = async (journalId: string) => {
    setBusyId(journalId);
    setFeedback(null);
    try {
      const res = await fetch(`/api/v1/payroll/gl/journals/${journalId}/post`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        setFeedback({ kind: 'error', text: await readError(res) });
        return;
      }
      setFeedback({ kind: 'success', text: 'Journal entry posted to the General Ledger.' });
      await fetchJournals();
    } catch (err) {
      setFeedback({
        kind: 'error',
        text: err instanceof Error ? err.message : 'Post failed',
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleReverse = async (journalId: string) => {
    const reason = reversalReason.trim();
    if (reason.length < 3) return;
    setBusyId(journalId);
    setFeedback(null);
    try {
      const res = await fetch(`/api/v1/payroll/gl/journals/${journalId}/reverse`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        setFeedback({ kind: 'error', text: await readError(res) });
        return;
      }
      setFeedback({
        kind: 'success',
        text: 'Reversal entry created and original marked reversed.',
      });
      setShowReverseModal(null);
      setReversalReason('');
      await fetchJournals();
    } catch (err) {
      setFeedback({
        kind: 'error',
        text: err instanceof Error ? err.message : 'Reverse failed',
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleExport = async (journalId: string) => {
    const reference = exportReference.trim();
    if (reference.length < 3) return;
    setBusyId(journalId);
    setFeedback(null);
    try {
      const res = await fetch(`/api/v1/payroll/gl/journals/${journalId}/export`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system: exportSystem, exportReference: reference }),
      });
      if (!res.ok) {
        setFeedback({ kind: 'error', text: await readError(res) });
        return;
      }
      setFeedback({ kind: 'success', text: `Journal exported to ${exportSystem}.` });
      setShowExportModal(null);
      setExportReference('');
      await fetchJournals();
    } catch (err) {
      setFeedback({
        kind: 'error',
        text: err instanceof Error ? err.message : 'Export failed',
      });
    } finally {
      setBusyId(null);
    }
  };

  // Client-side CSV of the real fetched journal lines — no mock data involved.
  const handleDownloadCsv = (journal: JournalEntry) => {
    const header = [
      'Line',
      'Account ID',
      'Description',
      'Cost Center',
      'Department',
      'Debit',
      'Credit',
      'Currency',
    ];
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const rows = journal.lines.map((l, i) =>
      [
        String(i + 1),
        l.accountId,
        l.description ?? '',
        l.costCenterId ?? '',
        l.departmentId ?? '',
        String(num(l.debit)),
        String(num(l.credit)),
        l.currency,
      ]
        .map(escape)
        .join(',')
    );
    const csv = [header.map(escape).join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${journal.reference || journal.id}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const pendingCount = journals.filter((j) => j.status === 'DRAFT').length;
  const postedCount = journals.filter((j) => j.status === 'POSTED').length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">GL Posting Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review and post payroll journal entries to the General Ledger
          </p>
        </div>

        {/* Feedback banner */}
        {feedback && (
          <div
            className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${
              feedback.kind === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {feedback.kind === 'success' ? (
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            )}
            <span className="flex-1">{feedback.text}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-current/60 hover:text-current"
              aria-label="Dismiss"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: 'Pending Posting',
              value: pendingCount,
              color: 'text-yellow-600',
              bg: 'bg-yellow-50',
              icon: <Clock className="w-5 h-5" />,
            },
            {
              label: 'Posted',
              value: postedCount,
              color: 'text-green-600',
              bg: 'bg-green-50',
              icon: <CheckCircle2 className="w-5 h-5" />,
            },
            {
              label: 'Draft Value',
              value: journals
                .filter((j) => j.status === 'DRAFT')
                .reduce((s, j) => s + num(j.totalDebit), 0),
              color: 'text-indigo-600',
              bg: 'bg-indigo-50',
              icon: <IndianRupee className="w-5 h-5" />,
              isAmount: true,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-gray-200 rounded-xl shadow-sm p-4"
            >
              <div
                className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center mb-2 ${stat.color}`}
              >
                {stat.icon}
              </div>
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className={`text-xl font-bold mt-0.5 ${stat.color}`}>
                {stat.isAmount
                  ? new Intl.NumberFormat('en-IN', {
                      notation: 'compact',
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 1,
                    }).format(stat.value as number)
                  : stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading journal entries…</span>
          </div>
        )}

        {/* Load error state */}
        {!loading && loadError && (
          <div className="bg-white border border-red-200 rounded-xl shadow-sm p-8 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-700 font-medium">{loadError}</p>
            <button
              onClick={() => void fetchJournals()}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !loadError && journals.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 text-center">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700">No journal entries yet</p>
            <p className="text-xs text-gray-500 mt-1">
              Generate a payroll journal from a completed payroll run to see it here.
            </p>
          </div>
        )}

        {/* Journal List */}
        {!loading && !loadError && journals.length > 0 && (
          <div className="space-y-4">
            {journals.map((journal) => {
              const isExpanded = expandedId === journal.id;
              const statusConf = STATUS_CONFIG[journal.status];
              const isBusy = busyId === journal.id;
              const activeLines = journal.lines.filter(
                (l) => num(l.debit) > 0 || num(l.credit) > 0
              );

              return (
                <div
                  key={journal.id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
                >
                  {/* Journal Header */}
                  <div
                    className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedId(isExpanded ? null : journal.id)}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-indigo-50 text-indigo-600">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-800 text-sm">{journal.reference}</p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${statusConf.color}`}
                        >
                          {statusConf.icon}
                          {statusConf.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {journal.description ?? journal.sourceType}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(journal.entryDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          {journal.lines.length} lines
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-gray-800">{fmt(journal.totalDebit)}</p>
                      <p className="text-xs text-gray-500">Total DR / CR</p>
                    </div>
                    <div className="flex gap-2">
                      {journal.status === 'DRAFT' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            void handlePost(journal.id);
                          }}
                          disabled={isBusy}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                        >
                          {isBusy ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Upload className="w-3.5 h-3.5" />
                          )}
                          {isBusy ? 'Posting…' : 'Post to GL'}
                        </button>
                      )}
                      {journal.status === 'POSTED' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExportSystem('QUICKBOOKS');
                            setExportReference('');
                            setShowExportModal(journal.id);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" /> Export
                        </button>
                      )}
                      {(journal.status === 'POSTED' ||
                        journal.status === 'EXPORTED' ||
                        journal.status === 'DRAFT') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setReversalReason('');
                            setShowReverseModal(journal.id);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Reverse
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadCsv(journal);
                        }}
                        title="Download lines as CSV"
                        className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>

                  {/* Expanded — Journal Lines */}
                  {isExpanded && (
                    <div className="border-t border-gray-100">
                      <div className="bg-gray-50 px-5 py-2 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          Journal Entry Lines
                        </p>
                      </div>
                      {activeLines.length === 0 ? (
                        <div className="px-5 py-6 text-center text-xs text-gray-400">
                          No line detail available for this entry.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-4 py-2 text-gray-400 font-medium">#</th>
                                <th className="text-left px-4 py-2 text-gray-400 font-medium">
                                  Account
                                </th>
                                <th className="text-left px-4 py-2 text-gray-400 font-medium">
                                  Description
                                </th>
                                <th className="text-left px-4 py-2 text-gray-400 font-medium">
                                  Cost Center
                                </th>
                                <th className="text-right px-4 py-2 text-gray-400 font-medium">
                                  Debit
                                </th>
                                <th className="text-right px-4 py-2 text-gray-400 font-medium">
                                  Credit
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {activeLines.map((line, idx) => (
                                <tr
                                  key={line.id}
                                  className="border-b border-gray-50 hover:bg-gray-50"
                                >
                                  <td className="px-4 py-2.5 text-gray-400">{idx + 1}</td>
                                  <td className="px-4 py-2.5">
                                    <span className="font-mono text-indigo-600 font-medium">
                                      {line.accountId}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2.5 text-gray-500 max-w-[240px] truncate">
                                    {line.description ?? '—'}
                                  </td>
                                  <td className="px-4 py-2.5 text-gray-500">
                                    {line.costCenterId ?? '—'}
                                  </td>
                                  <td className="px-4 py-2.5 text-right font-medium text-gray-800">
                                    {num(line.debit) > 0
                                      ? new Intl.NumberFormat('en-IN').format(num(line.debit))
                                      : '—'}
                                  </td>
                                  <td className="px-4 py-2.5 text-right font-medium text-blue-700">
                                    {num(line.credit) > 0
                                      ? new Intl.NumberFormat('en-IN').format(num(line.credit))
                                      : '—'}
                                  </td>
                                </tr>
                              ))}
                              <tr className="bg-indigo-50 font-bold border-t border-indigo-200">
                                <td colSpan={4} className="px-4 py-2.5 text-indigo-800 text-right">
                                  Total
                                </td>
                                <td className="px-4 py-2.5 text-right text-indigo-800">
                                  {new Intl.NumberFormat('en-IN').format(num(journal.totalDebit))}
                                </td>
                                <td className="px-4 py-2.5 text-right text-blue-700">
                                  {new Intl.NumberFormat('en-IN').format(num(journal.totalCredit))}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}
                      {journal.postedAt && (
                        <div className="px-5 py-2.5 bg-green-50 border-t border-green-100">
                          <p className="text-xs text-green-700">
                            <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                            Posted to GL on {new Date(journal.postedAt).toLocaleString()}
                          </p>
                        </div>
                      )}
                      {journal.exportedAt && (
                        <div className="px-5 py-2.5 bg-blue-50 border-t border-blue-100">
                          <p className="text-xs text-blue-700">
                            <Send className="w-3.5 h-3.5 inline mr-1" />
                            Exported to {journal.exportedToSystem} (ref {journal.exportReference})
                            on {new Date(journal.exportedAt).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Reversal Modal */}
        {showReverseModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Reverse Journal Entry</h3>
                  <p className="text-xs text-gray-500">
                    This will create an offsetting reversal entry
                  </p>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-700">
                    Reversing a journal will create a new reversal entry with equal and opposite
                    lines and mark the original as reversed. This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reversal Reason * <span className="text-gray-400">(min 3 characters)</span>
                </label>
                <textarea
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  rows={3}
                  placeholder="Describe why this journal is being reversed…"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowReverseModal(null);
                    setReversalReason('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => void handleReverse(showReverseModal)}
                  disabled={reversalReason.trim().length < 3 || busyId === showReverseModal}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {busyId === showReverseModal ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RotateCcw className="w-4 h-4" />
                  )}
                  {busyId === showReverseModal ? 'Reversing…' : 'Reverse Entry'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Send className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Export to Accounting System</h3>
                  <p className="text-xs text-gray-500">
                    Record the downstream export reference for this journal
                  </p>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">System *</label>
                <select
                  value={exportSystem}
                  onChange={(e) => setExportSystem(e.target.value as AccountingSystem)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ACCOUNTING_SYSTEMS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Export Reference * <span className="text-gray-400">(min 3 characters)</span>
                </label>
                <input
                  type="text"
                  value={exportReference}
                  onChange={(e) => setExportReference(e.target.value)}
                  placeholder="e.g. QB-INV-2026-0042"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowExportModal(null);
                    setExportReference('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => void handleExport(showExportModal)}
                  disabled={exportReference.trim().length < 3 || busyId === showExportModal}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {busyId === showExportModal ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {busyId === showExportModal ? 'Exporting…' : 'Export'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
