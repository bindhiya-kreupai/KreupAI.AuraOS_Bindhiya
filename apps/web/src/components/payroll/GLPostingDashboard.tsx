'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type JournalStatus = 'DRAFT' | 'POSTED' | 'REVERSED' | 'CANCELLED';

interface JournalLine {
  lineNumber: number;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  narration: string;
  costCenter: string | null;
  department: string | null;
}

interface JournalEntry {
  id: string;
  payrollRunId: string;
  period: string;
  postingDate: string;
  referenceNumber: string;
  narration: string;
  currency: string;
  totalDebit: number;
  totalCredit: number;
  lines: JournalLine[];
  status: JournalStatus;
  postedByUserId: string | null;
  postedAt: string | null;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const MOCK_JOURNALS: JournalEntry[] = [
  {
    id: 'je-2026-02',
    payrollRunId: 'run-2026-02',
    period: '2026-02',
    postingDate: '2026-02-28',
    referenceNumber: 'PAY-JE-2026-02-001',
    narration: 'February 2026 Payroll — 247 employees',
    currency: 'INR',
    totalDebit: 21762600,
    totalCredit: 21762600,
    status: 'DRAFT',
    postedByUserId: null,
    postedAt: null,
    createdAt: '2026-02-25T10:00:00Z',
    lines: [
      {
        lineNumber: 1,
        accountCode: '5001',
        accountName: 'Salary Expense',
        debit: 18540000,
        credit: 0,
        narration: 'Feb 2026 Gross Salary — 247 employees',
        costCenter: 'CORP',
        department: null,
      },
      {
        lineNumber: 2,
        accountCode: '5002',
        accountName: 'PF Expense (Employer)',
        debit: 1668600,
        credit: 0,
        narration: 'Feb 2026 Employer PF Contribution',
        costCenter: 'CORP',
        department: null,
      },
      {
        lineNumber: 3,
        accountCode: '5004',
        accountName: 'Gratuity Expense',
        debit: 558000,
        credit: 0,
        narration: 'Feb 2026 Gratuity Provision',
        costCenter: 'CORP',
        department: null,
      },
      {
        lineNumber: 4,
        accountCode: '2101',
        accountName: 'Employee PF Payable',
        debit: 0,
        credit: 1668600,
        narration: 'Feb 2026 Employee PF to EPFO',
        costCenter: null,
        department: null,
      },
      {
        lineNumber: 5,
        accountCode: '2102',
        accountName: 'Employer PF Payable',
        debit: 0,
        credit: 1668600,
        narration: 'Feb 2026 Employer PF to EPFO',
        costCenter: null,
        department: null,
      },
      {
        lineNumber: 6,
        accountCode: '2105',
        accountName: 'TDS Payable',
        debit: 0,
        credit: 2224800,
        narration: 'Feb 2026 TDS u/s 192',
        costCenter: null,
        department: null,
      },
      {
        lineNumber: 7,
        accountCode: '2106',
        accountName: 'Professional Tax Payable',
        debit: 0,
        credit: 49400,
        narration: 'Feb 2026 Professional Tax',
        costCenter: null,
        department: null,
      },
      {
        lineNumber: 8,
        accountCode: '2107',
        accountName: 'Net Salary Payable',
        debit: 0,
        credit: 15353600,
        narration: 'Feb 2026 Net Salaries — Bank Pending',
        costCenter: null,
        department: null,
      },
      {
        lineNumber: 9,
        accountCode: '2108',
        accountName: 'Gratuity Provision',
        debit: 0,
        credit: 558000,
        narration: 'Feb 2026 Gratuity Provision Liability',
        costCenter: null,
        department: null,
      },
      {
        lineNumber: 10,
        accountCode: '2104',
        accountName: 'Employer ESI Payable',
        debit: 0,
        credit: 0,
        narration: 'Feb 2026 Employer ESI — Nil (above ESI ceiling)',
        costCenter: null,
        department: null,
      },
    ],
  },
  {
    id: 'je-2026-01',
    payrollRunId: 'run-2026-01',
    period: '2026-01',
    postingDate: '2026-01-31',
    referenceNumber: 'PAY-JE-2026-01-001',
    narration: 'January 2026 Payroll — 243 employees',
    currency: 'INR',
    totalDebit: 20895600,
    totalCredit: 20895600,
    status: 'POSTED',
    postedByUserId: 'user-002',
    postedAt: '2026-01-31T14:00:00Z',
    createdAt: '2026-01-30T10:00:00Z',
    lines: [],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmt(n: number): string {
  if (n === 0) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
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
  REVERSED: {
    label: 'Reversed',
    color: 'bg-red-100 text-red-700',
    icon: <RotateCcw className="w-3.5 h-3.5" />,
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-500',
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function GLPostingDashboard() {
  const [journals, setJournals] = useState(MOCK_JOURNALS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [posting, setPosting] = useState<string | null>(null);
  const [showReverseModal, setShowReverseModal] = useState<string | null>(null);
  const [reversalReason, setReversalReason] = useState('');

  const handlePost = async (journalId: string) => {
    setPosting(journalId);
    await new Promise((r) => setTimeout(r, 1500));
    setJournals((prev) =>
      prev.map((j) =>
        j.id === journalId
          ? {
              ...j,
              status: 'POSTED',
              postedAt: new Date().toISOString(),
              postedByUserId: 'user-001',
            }
          : j
      )
    );
    setPosting(null);
  };

  const handleReverse = async (journalId: string) => {
    if (!reversalReason.trim()) return;
    setPosting(journalId);
    await new Promise((r) => setTimeout(r, 1500));
    setJournals((prev) => prev.map((j) => (j.id === journalId ? { ...j, status: 'REVERSED' } : j)));
    setPosting(null);
    setShowReverseModal(null);
    setReversalReason('');
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
              label: 'Posted This Month',
              value: postedCount,
              color: 'text-green-600',
              bg: 'bg-green-50',
              icon: <CheckCircle2 className="w-5 h-5" />,
            },
            {
              label: 'Total Value',
              value: journals
                .filter((j) => j.status === 'DRAFT')
                .reduce((s, j) => s + j.totalDebit, 0),
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

        {/* Journal List */}
        <div className="space-y-4">
          {journals.map((journal) => {
            const isExpanded = expandedId === journal.id;
            const statusConf = STATUS_CONFIG[journal.status];
            const isPosting = posting === journal.id;

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
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${statusConf.color.replace('text', 'bg').replace('bg', 'text')}`}
                  >
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-800 text-sm">
                        {journal.referenceNumber}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${statusConf.color}`}
                      >
                        {statusConf.icon}
                        {statusConf.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{journal.narration}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {journal.postingDate}
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
                          handlePost(journal.id);
                        }}
                        disabled={isPosting}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                      >
                        {isPosting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        {isPosting ? 'Posting...' : 'Post to GL'}
                      </button>
                    )}
                    {journal.status === 'POSTED' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
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
                      }}
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
                {isExpanded && journal.lines.length > 0 && (
                  <div className="border-t border-gray-100">
                    <div className="bg-gray-50 px-5 py-2 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Journal Entry Lines
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="text-left px-4 py-2 text-gray-400 font-medium">#</th>
                            <th className="text-left px-4 py-2 text-gray-400 font-medium">
                              Account
                            </th>
                            <th className="text-left px-4 py-2 text-gray-400 font-medium">
                              Narration
                            </th>
                            <th className="text-left px-4 py-2 text-gray-400 font-medium">
                              Cost Center
                            </th>
                            <th className="text-right px-4 py-2 text-gray-400 font-medium">
                              Debit (INR)
                            </th>
                            <th className="text-right px-4 py-2 text-gray-400 font-medium">
                              Credit (INR)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {journal.lines
                            .filter((l) => l.debit > 0 || l.credit > 0)
                            .map((line) => (
                              <tr
                                key={line.lineNumber}
                                className="border-b border-gray-50 hover:bg-gray-50"
                              >
                                <td className="px-4 py-2.5 text-gray-400">{line.lineNumber}</td>
                                <td className="px-4 py-2.5">
                                  <span className="font-mono text-indigo-600 font-medium">
                                    {line.accountCode}
                                  </span>
                                  <span className="ml-2 text-gray-700">{line.accountName}</span>
                                </td>
                                <td className="px-4 py-2.5 text-gray-500 max-w-[240px] truncate">
                                  {line.narration}
                                </td>
                                <td className="px-4 py-2.5 text-gray-500">
                                  {line.costCenter ?? '—'}
                                </td>
                                <td className="px-4 py-2.5 text-right font-medium text-gray-800">
                                  {line.debit > 0
                                    ? new Intl.NumberFormat('en-IN').format(line.debit)
                                    : '—'}
                                </td>
                                <td className="px-4 py-2.5 text-right font-medium text-blue-700">
                                  {line.credit > 0
                                    ? new Intl.NumberFormat('en-IN').format(line.credit)
                                    : '—'}
                                </td>
                              </tr>
                            ))}
                          {/* Totals row */}
                          <tr className="bg-indigo-50 font-bold border-t border-indigo-200">
                            <td colSpan={4} className="px-4 py-2.5 text-indigo-800 text-right">
                              Total
                            </td>
                            <td className="px-4 py-2.5 text-right text-indigo-800">
                              {new Intl.NumberFormat('en-IN').format(journal.totalDebit)}
                            </td>
                            <td className="px-4 py-2.5 text-right text-blue-700">
                              {new Intl.NumberFormat('en-IN').format(journal.totalCredit)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    {journal.postedAt && (
                      <div className="px-5 py-2.5 bg-green-50 border-t border-green-100">
                        <p className="text-xs text-green-700">
                          <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                          Posted to GL on {new Date(journal.postedAt).toLocaleString()} by Finance
                          team
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

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
                    Reversing a posted journal will create a new reversal entry with equal and
                    opposite entries. This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reversal Reason *
                </label>
                <textarea
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  rows={3}
                  placeholder="Describe why this journal is being reversed..."
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
                  onClick={() => handleReverse(showReverseModal)}
                  disabled={!reversalReason.trim() || posting === showReverseModal}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {posting === showReverseModal ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RotateCcw className="w-4 h-4" />
                  )}
                  {posting === showReverseModal ? 'Reversing...' : 'Reverse Entry'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
