'use client';

import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Upload,
  Download,
  RefreshCw,
  Calendar,
  DollarSign,
  Shield,
  TrendingUp,
  Eye,
  MoreVertical,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type WpsStatus =
  | 'PENDING'
  | 'VALIDATING'
  | 'VALIDATION_FAILED'
  | 'VALIDATED'
  | 'SUBMITTED'
  | 'PROCESSING'
  | 'ACCEPTED'
  | 'PARTIALLY_ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED';

interface WpsSubmission {
  id: string;
  payrollMonth: string;
  salaryMonth: string;
  status: WpsStatus;
  totalRecords: number;
  totalAmount: number;
  successCount: number;
  failureCount: number;
  submittedAt: string | null;
  molReferenceNumber: string | null;
  fileName: string | null;
  createdAt: string;
}

interface WpsStats {
  totalSubmissions: number;
  pendingSubmissions: number;
  acceptedThisYear: number;
  rejectedThisYear: number;
  totalAmountProcessed: number;
  complianceRate: number;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const MOCK_STATS: WpsStats = {
  totalSubmissions: 24,
  pendingSubmissions: 1,
  acceptedThisYear: 11,
  rejectedThisYear: 0,
  totalAmountProcessed: 5840000,
  complianceRate: 100,
};

const MOCK_SUBMISSIONS: WpsSubmission[] = [
  {
    id: 'sub-001',
    payrollMonth: '2026-01',
    salaryMonth: 'JAN2026',
    status: 'ACCEPTED',
    totalRecords: 247,
    totalAmount: 487500,
    successCount: 247,
    failureCount: 0,
    submittedAt: '2026-01-28T09:15:00Z',
    molReferenceNumber: 'MOL1738051200001',
    fileName: 'WPS_EMP001_JAN2026_1738051100.sif',
    createdAt: '2026-01-27T14:00:00Z',
  },
  {
    id: 'sub-002',
    payrollMonth: '2025-12',
    salaryMonth: 'DEC2025',
    status: 'ACCEPTED',
    totalRecords: 243,
    totalAmount: 481200,
    successCount: 243,
    failureCount: 0,
    submittedAt: '2025-12-28T10:00:00Z',
    molReferenceNumber: 'MOL1735344000001',
    fileName: 'WPS_EMP001_DEC2025_1735343900.sif',
    createdAt: '2025-12-27T12:00:00Z',
  },
  {
    id: 'sub-003',
    payrollMonth: '2025-11',
    salaryMonth: 'NOV2025',
    status: 'ACCEPTED',
    totalRecords: 241,
    totalAmount: 478300,
    successCount: 241,
    failureCount: 0,
    submittedAt: '2025-11-28T09:45:00Z',
    molReferenceNumber: 'MOL1732752000001',
    fileName: 'WPS_EMP001_NOV2025_1732751900.sif',
    createdAt: '2025-11-27T11:00:00Z',
  },
  {
    id: 'sub-004',
    payrollMonth: '2026-02',
    salaryMonth: 'FEB2026',
    status: 'PENDING',
    totalRecords: 0,
    totalAmount: 0,
    successCount: 0,
    failureCount: 0,
    submittedAt: null,
    molReferenceNumber: null,
    fileName: null,
    createdAt: '2026-02-25T08:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  WpsStatus,
  { label: string; color: string; bgColor: string; icon: React.ElementType }
> = {
  PENDING: {
    label: 'Pending',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-200',
    icon: Clock,
  },
  VALIDATING: {
    label: 'Validating',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    icon: RefreshCw,
  },
  VALIDATION_FAILED: {
    label: 'Validation Failed',
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    icon: XCircle,
  },
  VALIDATED: {
    label: 'Validated',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 border-emerald-200',
    icon: CheckCircle2,
  },
  SUBMITTED: {
    label: 'Submitted',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    icon: Upload,
  },
  PROCESSING: {
    label: 'Processing',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    icon: RefreshCw,
  },
  ACCEPTED: {
    label: 'Accepted',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 border-emerald-200',
    icon: CheckCircle2,
  },
  PARTIALLY_ACCEPTED: {
    label: 'Partial Accept',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-200',
    icon: AlertTriangle,
  },
  REJECTED: {
    label: 'Rejected',
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    icon: XCircle,
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'text-slate-500',
    bgColor: 'bg-slate-50 border-slate-200',
    icon: XCircle,
  },
};

const formatAmount = (amount: number): string =>
  new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' });

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-1.5 text-2xl font-bold text-slate-900">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
        </div>
        <div className={`rounded-lg p-2.5 ${accent}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: WpsStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${cfg.color} ${cfg.bgColor}`}
    >
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function WpsDashboard() {
  const [selectedSubmission, setSelectedSubmission] = useState<WpsSubmission | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  const filtered = MOCK_SUBMISSIONS.filter((s) => {
    if (activeTab === 'pending')
      return ['PENDING', 'VALIDATING', 'VALIDATED', 'SUBMITTED', 'PROCESSING'].includes(s.status);
    if (activeTab === 'accepted') return s.status === 'ACCEPTED';
    if (activeTab === 'rejected')
      return ['REJECTED', 'VALIDATION_FAILED', 'PARTIALLY_ACCEPTED'].includes(s.status);
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-600 p-2.5">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">WPS Compliance</h1>
            <p className="text-sm text-slate-500">
              UAE Wage Protection System — MoHRE SIF File Management
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
            <Download className="h-4 w-4" />
            Export Report
          </button>
          <button className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
            <Upload className="h-4 w-4" />
            Generate SIF File
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Compliance Rate"
          value={`${MOCK_STATS.complianceRate}%`}
          sub="All submissions accepted"
          icon={CheckCircle2}
          accent="bg-emerald-500"
        />
        <StatCard
          label="This Year"
          value={MOCK_STATS.acceptedThisYear}
          sub="Accepted submissions"
          icon={TrendingUp}
          accent="bg-blue-500"
        />
        <StatCard
          label="Amount Processed"
          value={formatAmount(MOCK_STATS.totalAmountProcessed)}
          sub="Total salaries protected"
          icon={DollarSign}
          accent="bg-violet-500"
        />
        <StatCard
          label="Pending"
          value={MOCK_STATS.pendingSubmissions}
          sub="Requires action"
          icon={AlertTriangle}
          accent={MOCK_STATS.pendingSubmissions > 0 ? 'bg-amber-500' : 'bg-slate-400'}
        />
      </div>

      {/* Timeline + Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200 px-4 pt-3">
          {(['all', 'pending', 'accepted', 'rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-t-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab === 'all' ? 'All Submissions' : tab}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Period
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Records
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Amount
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  MoHRE Ref
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Submitted
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((submission) => (
                <tr
                  key={submission.id}
                  className="group cursor-pointer hover:bg-slate-50"
                  onClick={() => setSelectedSubmission(submission)}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {submission.salaryMonth}
                        </p>
                        <p className="text-xs text-slate-500">{submission.payrollMonth}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={submission.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="text-sm font-medium text-slate-900">
                      {submission.totalRecords.toLocaleString()}
                    </div>
                    {submission.failureCount > 0 && (
                      <div className="text-xs text-red-500">{submission.failureCount} failed</div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-sm font-medium text-slate-900">
                      {submission.totalAmount > 0 ? formatAmount(submission.totalAmount) : '—'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs text-slate-500">
                      {submission.molReferenceNumber ?? '—'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-slate-500">
                      {submission.submittedAt ? formatDate(submission.submittedAt) : '—'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {submission.fileName && (
                        <button
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          title="Download SIF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        title="More Options"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-slate-500">
                    No submissions found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submission Detail Drawer */}
      {selectedSubmission && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          onClick={() => setSelectedSubmission(null)}
        >
          <div
            className="h-full w-full max-w-md overflow-y-auto bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  {selectedSubmission.salaryMonth}
                </h2>
                <p className="text-xs text-slate-500">Submission Details</p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Status</span>
                <StatusBadge status={selectedSubmission.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Total Records</span>
                <span className="text-sm font-medium text-slate-900">
                  {selectedSubmission.totalRecords.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Total Amount</span>
                <span className="text-sm font-medium text-slate-900">
                  {selectedSubmission.totalAmount > 0
                    ? formatAmount(selectedSubmission.totalAmount)
                    : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Success / Failed</span>
                <span className="text-sm font-medium">
                  <span className="text-emerald-600">{selectedSubmission.successCount}</span>
                  {' / '}
                  <span className="text-red-500">{selectedSubmission.failureCount}</span>
                </span>
              </div>
              {selectedSubmission.molReferenceNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">MoHRE Reference</span>
                  <span className="font-mono text-sm text-slate-900">
                    {selectedSubmission.molReferenceNumber}
                  </span>
                </div>
              )}
              {selectedSubmission.submittedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Submitted At</span>
                  <span className="text-sm text-slate-900">
                    {formatDate(selectedSubmission.submittedAt)}
                  </span>
                </div>
              )}
              {selectedSubmission.fileName && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-500" />
                      <span className="break-all font-mono text-xs text-slate-600">
                        {selectedSubmission.fileName}
                      </span>
                    </div>
                    <button className="ml-2 shrink-0 rounded p-1 text-slate-400 hover:bg-slate-200">
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Timeline
                </p>
                <div className="space-y-3">
                  {[
                    {
                      label: 'Created',
                      date: selectedSubmission.createdAt,
                      done: true,
                    },
                    {
                      label: 'Validated',
                      date: selectedSubmission.submittedAt,
                      done: !['PENDING', 'VALIDATING', 'VALIDATION_FAILED'].includes(
                        selectedSubmission.status
                      ),
                    },
                    {
                      label: 'Submitted to MoHRE',
                      date: selectedSubmission.submittedAt,
                      done: [
                        'SUBMITTED',
                        'PROCESSING',
                        'ACCEPTED',
                        'PARTIALLY_ACCEPTED',
                        'REJECTED',
                      ].includes(selectedSubmission.status),
                    },
                    {
                      label: 'Response Received',
                      date: null,
                      done: ['ACCEPTED', 'PARTIALLY_ACCEPTED', 'REJECTED'].includes(
                        selectedSubmission.status
                      ),
                    },
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center ${
                          step.done
                            ? 'border-emerald-500 bg-emerald-500'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {step.done && <CheckCircle2 className="h-3 w-3 text-white" />}
                      </div>
                      <div>
                        <p
                          className={`text-sm font-medium ${step.done ? 'text-slate-900' : 'text-slate-400'}`}
                        >
                          {step.label}
                        </p>
                        {step.date && step.done && (
                          <p className="text-xs text-slate-500">{formatDate(step.date)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WpsDashboard;
