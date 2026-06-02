// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
'use client';

import React, { useState } from 'react';
import {
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Download,
  Upload,
  Eye,
  MoreVertical,
  RefreshCw,
  FileText,
  BarChart3,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type GosiStatus =
  | 'PENDING'
  | 'VALIDATING'
  | 'VALIDATED'
  | 'SUBMITTED'
  | 'PROCESSING'
  | 'ACCEPTED'
  | 'PARTIALLY_ACCEPTED'
  | 'REJECTED'
  | 'FAILED';

interface GosiSubmission {
  id: string;
  contributionMonth: string;
  status: GosiStatus;
  totalEmployees: number;
  totalSaudis: number;
  totalNonSaudis: number;
  totalEmployeeContribution: number;
  totalEmployerContribution: number;
  grandTotal: number;
  submissionDate: string | null;
  fileName: string | null;
  createdAt: string;
}

interface MonthlyBreakdown {
  month: string;
  saudis: number;
  nonSaudis: number;
  employeeContrib: number;
  employerContrib: number;
  total: number;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const MOCK_SUBMISSIONS: GosiSubmission[] = [
  {
    id: 'gosi-001',
    contributionMonth: '2026-01',
    status: 'ACCEPTED',
    totalEmployees: 87,
    totalSaudis: 54,
    totalNonSaudis: 33,
    totalEmployeeContribution: 142680,
    totalEmployerContribution: 169920,
    grandTotal: 312600,
    submissionDate: '2026-01-15T10:00:00Z',
    fileName: 'GOSI_SUB2026_JAN2026_1738051100.csv',
    createdAt: '2026-01-12T09:00:00Z',
  },
  {
    id: 'gosi-002',
    contributionMonth: '2025-12',
    status: 'ACCEPTED',
    totalEmployees: 85,
    totalSaudis: 52,
    totalNonSaudis: 33,
    totalEmployeeContribution: 139620,
    totalEmployerContribution: 166080,
    grandTotal: 305700,
    submissionDate: '2025-12-15T10:00:00Z',
    fileName: 'GOSI_SUB2026_DEC2025_1735344000.csv',
    createdAt: '2025-12-12T09:00:00Z',
  },
  {
    id: 'gosi-003',
    contributionMonth: '2025-11',
    status: 'ACCEPTED',
    totalEmployees: 83,
    totalSaudis: 50,
    totalNonSaudis: 33,
    totalEmployeeContribution: 136500,
    totalEmployerContribution: 162000,
    grandTotal: 298500,
    submissionDate: '2025-11-15T10:00:00Z',
    fileName: 'GOSI_SUB2026_NOV2025_1732752000.csv',
    createdAt: '2025-11-12T09:00:00Z',
  },
  {
    id: 'gosi-004',
    contributionMonth: '2026-02',
    status: 'PENDING',
    totalEmployees: 0,
    totalSaudis: 0,
    totalNonSaudis: 0,
    totalEmployeeContribution: 0,
    totalEmployerContribution: 0,
    grandTotal: 0,
    submissionDate: null,
    fileName: null,
    createdAt: '2026-02-25T08:00:00Z',
  },
];

const MOCK_TREND: MonthlyBreakdown[] = [
  {
    month: 'Sep 25',
    saudis: 48,
    nonSaudis: 32,
    employeeContrib: 128400,
    employerContrib: 152640,
    total: 281040,
  },
  {
    month: 'Oct 25',
    saudis: 49,
    nonSaudis: 32,
    employeeContrib: 130620,
    employerContrib: 155520,
    total: 286140,
  },
  {
    month: 'Nov 25',
    saudis: 50,
    nonSaudis: 33,
    employeeContrib: 136500,
    employerContrib: 162000,
    total: 298500,
  },
  {
    month: 'Dec 25',
    saudis: 52,
    nonSaudis: 33,
    employeeContrib: 139620,
    employerContrib: 166080,
    total: 305700,
  },
  {
    month: 'Jan 26',
    saudis: 54,
    nonSaudis: 33,
    employeeContrib: 142680,
    employerContrib: 169920,
    total: 312600,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  GosiStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  PENDING: {
    label: 'Pending',
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
    icon: Clock,
  },
  VALIDATING: {
    label: 'Validating',
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
    icon: RefreshCw,
  },
  VALIDATED: {
    label: 'Validated',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200',
    icon: CheckCircle2,
  },
  SUBMITTED: {
    label: 'Submitted',
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
    icon: Upload,
  },
  PROCESSING: {
    label: 'Processing',
    color: 'text-purple-600',
    bg: 'bg-purple-50 border-purple-200',
    icon: RefreshCw,
  },
  ACCEPTED: {
    label: 'Accepted',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200',
    icon: CheckCircle2,
  },
  PARTIALLY_ACCEPTED: {
    label: 'Partial',
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
    icon: AlertTriangle,
  },
  REJECTED: {
    label: 'Rejected',
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
    icon: XCircle,
  },
  FAILED: { label: 'Failed', color: 'text-red-600', bg: 'bg-red-50 border-red-200', icon: XCircle },
};

const formatSAR = (n: number): string =>
  new Intl.NumberFormat('en-SA', {
    style: 'currency',
    currency: 'SAR',
    maximumFractionDigits: 0,
  }).format(n);

const formatMonth = (ym: string): string => {
  const [y, m] = ym.split('-');
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
  return `${months[parseInt(m, 10) - 1]} ${y}`;
};

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-SA', { day: 'numeric', month: 'short', year: 'numeric' });

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
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

function StatusBadge({ status }: { status: GosiStatus }) {
  const c = STATUS_CONFIG[status];
  const Icon = c.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${c.color} ${c.bg}`}
    >
      <Icon className="h-3 w-3" />
      {c.label}
    </span>
  );
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function GosiDashboard() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'submissions' | 'trend'>('submissions');

  const _selected = MOCK_SUBMISSIONS.find((s) => s.id === selectedId) ?? null;

  const _ytdEmployees = MOCK_SUBMISSIONS.filter((s) => s.status === 'ACCEPTED').reduce(
    (acc, s) => acc + s.totalEmployees,
    0
  );
  const ytdTotal = MOCK_SUBMISSIONS.filter((s) => s.status === 'ACCEPTED').reduce(
    (acc, s) => acc + s.grandTotal,
    0
  );
  const maxTotal = Math.max(...MOCK_TREND.map((t) => t.total));

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-600 p-2.5">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">GOSI Compliance</h1>
            <p className="text-sm text-slate-500">
              KSA General Organization for Social Insurance — Monthly Contribution Management
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700">
            <FileText className="h-4 w-4" />
            Generate File
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Employees"
          value="87"
          sub="54 Saudi · 33 Non-Saudi"
          icon={Users}
          accent="bg-blue-500"
        />
        <StatCard
          label="This Month"
          value={formatSAR(312600)}
          sub="Jan 2026 grand total"
          icon={DollarSign}
          accent="bg-emerald-500"
        />
        <StatCard
          label="YTD Contributions"
          value={formatSAR(ytdTotal)}
          sub={`${MOCK_SUBMISSIONS.filter((s) => s.status === 'ACCEPTED').length} accepted submissions`}
          icon={TrendingUp}
          accent="bg-violet-500"
        />
        <StatCard
          label="Compliance"
          value="100%"
          sub="All submissions on time"
          icon={CheckCircle2}
          accent="bg-emerald-500"
        />
      </div>

      {/* Saudi vs Non-Saudi breakdown */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Workforce Composition — Jan 2026</p>
            <p className="text-xs text-slate-500">GOSI contribution basis by nationality</p>
          </div>
          <BarChart3 className="h-4 w-4 text-slate-400" />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                <span className="text-sm text-slate-700">Saudi Nationals</span>
              </div>
              <span className="text-sm font-bold text-slate-900">54 (62%)</span>
            </div>
            <MiniBar value={54} max={87} color="bg-blue-500" />
            <div className="mt-3 space-y-1.5 rounded-lg bg-blue-50 p-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Pension (9.75% each)</span>
                <span className="font-medium text-slate-900">{formatSAR(127350)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">SANED (0.75% each)</span>
                <span className="font-medium text-slate-900">{formatSAR(9810)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Occ. Hazards (2% ER)</span>
                <span className="font-medium text-slate-900">{formatSAR(13500)}</span>
              </div>
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-violet-500" />
                <span className="text-sm text-slate-700">Non-Saudi</span>
              </div>
              <span className="text-sm font-bold text-slate-900">33 (38%)</span>
            </div>
            <MiniBar value={33} max={87} color="bg-violet-500" />
            <div className="mt-3 space-y-1.5 rounded-lg bg-violet-50 p-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">SANED only (2% each)</span>
                <span className="font-medium text-slate-900">{formatSAR(5940)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">No pension / annuities</span>
                <span className="font-medium text-slate-500">—</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">No occ. hazards</span>
                <span className="font-medium text-slate-500">—</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex gap-1 border-b border-slate-200 px-4 pt-3">
          {(['submissions', 'trend'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-t-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-emerald-600 text-emerald-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab === 'submissions' ? 'Monthly Submissions' : 'Trend'}
            </button>
          ))}
        </div>

        {activeTab === 'submissions' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Month
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Saudi
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Non-Saudi
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Employee
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Employer
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Grand Total
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
                {MOCK_SUBMISSIONS.map((s) => (
                  <tr
                    key={s.id}
                    className="group cursor-pointer hover:bg-slate-50"
                    onClick={() => setSelectedId(s.id === selectedId ? null : s.id)}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-900">
                          {formatMonth(s.contributionMonth)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-medium text-slate-900">
                      {s.totalSaudis || '—'}
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-medium text-slate-900">
                      {s.totalNonSaudis || '—'}
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-medium text-slate-900">
                      {s.totalEmployeeContribution > 0
                        ? formatSAR(s.totalEmployeeContribution)
                        : '—'}
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-medium text-slate-900">
                      {s.totalEmployerContribution > 0
                        ? formatSAR(s.totalEmployerContribution)
                        : '—'}
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-bold text-emerald-700">
                      {s.grandTotal > 0 ? formatSAR(s.grandTotal) : '—'}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {s.submissionDate ? formatDate(s.submissionDate) : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {s.fileName && (
                          <button
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                        <button className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'trend' && (
          <div className="p-5">
            <p className="mb-4 text-sm font-medium text-slate-700">
              Monthly Contribution Trend (SAR)
            </p>
            <div className="space-y-3">
              {MOCK_TREND.map((t) => (
                <div key={t.month} className="grid grid-cols-[80px_1fr_120px] items-center gap-3">
                  <span className="text-xs font-medium text-slate-600">{t.month}</span>
                  <div className="relative h-6 overflow-hidden rounded bg-slate-100">
                    <div
                      className="absolute inset-y-0 left-0 flex items-center bg-emerald-500/20"
                      style={{ width: `${(t.employeeContrib / maxTotal) * 100}%` }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 border-r-2 border-emerald-600"
                      style={{ width: `${(t.employeeContrib / maxTotal) * 100}%` }}
                    />
                    <div
                      className="absolute inset-y-0 right-0 flex items-center justify-end bg-blue-500/20"
                      style={{ width: `${(t.employerContrib / maxTotal) * 100}%`, left: 'auto' }}
                    />
                  </div>
                  <span className="text-right text-xs font-semibold text-slate-900">
                    {formatSAR(t.total)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-sm bg-emerald-400" />
                Employee contributions
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-sm bg-blue-400" />
                Employer contributions
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GosiDashboard;
