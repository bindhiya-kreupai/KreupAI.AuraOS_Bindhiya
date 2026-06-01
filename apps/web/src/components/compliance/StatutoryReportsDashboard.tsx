// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
'use client';

import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Download,
  ChevronRight,
  Calendar,
  Globe,
  Bell,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ReportStatus = 'FILED' | 'GENERATED' | 'UPCOMING' | 'OVERDUE' | 'NOT_GENERATED';
type Country = 'UAE' | 'KSA' | 'IN' | 'US';

interface ComplianceReport {
  id: string;
  reportType: string;
  label: string;
  country: Country;
  period: string;
  dueDate: string;
  status: ReportStatus;
  filedDate: string | null;
  fileName: string | null;
  amount: number | null;
  currency: string;
  description: string;
}

interface ComplianceScore {
  country: Country;
  label: string;
  flag: string;
  score: number;
  filed: number;
  total: number;
  overdue: number;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const MOCK_SCORES: ComplianceScore[] = [
  { country: 'IN', label: 'India', flag: '🇮🇳', score: 100, filed: 8, total: 8, overdue: 0 },
  { country: 'AE', label: 'UAE', flag: '🇦🇪', score: 100, filed: 2, total: 2, overdue: 0 },
  { country: 'SA', label: 'KSA', flag: '🇸🇦', score: 85, filed: 6, total: 7, overdue: 1 },
  { country: 'US', label: 'United States', flag: '🇺🇸', score: 100, filed: 4, total: 4, overdue: 0 },
];

const MOCK_REPORTS: ComplianceReport[] = [
  // India
  {
    id: 'r1',
    reportType: 'INDIA_PF_ECR',
    label: 'PF ECR (EPFO)',
    country: 'IN',
    period: '2026-01',
    dueDate: '2026-02-15',
    status: 'FILED',
    filedDate: '2026-02-12',
    fileName: 'ECR_ENTITY001_2026-01.txt',
    amount: 3337800,
    currency: 'INR',
    description: 'Monthly PF Electronic Challan cum Return — 243 employees',
  },
  {
    id: 'r2',
    reportType: 'INDIA_PF_ECR',
    label: 'PF ECR (EPFO)',
    country: 'IN',
    period: '2026-02',
    dueDate: '2026-03-15',
    status: 'UPCOMING',
    filedDate: null,
    fileName: null,
    amount: null,
    currency: 'INR',
    description: 'Due in 18 days',
  },
  {
    id: 'r3',
    reportType: 'INDIA_ESI_RETURN',
    label: 'ESI Return (ESIC)',
    country: 'IN',
    period: '2025-H2',
    dueDate: '2025-11-11',
    status: 'FILED',
    filedDate: '2025-11-08',
    fileName: 'ESI_ENTITY001_2025-H2.pdf',
    amount: 145800,
    currency: 'INR',
    description: 'Half-yearly ESI return Apr-Sep 2025',
  },
  {
    id: 'r4',
    reportType: 'INDIA_FORM_24Q',
    label: 'Form 24Q (TDS Return)',
    country: 'IN',
    period: 'Q3 2025-26',
    dueDate: '2026-01-31',
    status: 'FILED',
    filedDate: '2026-01-28',
    fileName: 'Form24Q_Q3_2025-26.zip',
    amount: 29661600,
    currency: 'INR',
    description: 'Quarterly TDS return Oct-Dec 2025',
  },
  {
    id: 'r5',
    reportType: 'INDIA_FORM_24Q',
    label: 'Form 24Q (TDS Return)',
    country: 'IN',
    period: 'Q4 2025-26',
    dueDate: '2026-05-31',
    status: 'UPCOMING',
    filedDate: null,
    fileName: null,
    amount: null,
    currency: 'INR',
    description: 'Due in 95 days',
  },
  {
    id: 'r6',
    reportType: 'INDIA_PT_RETURN',
    label: 'Professional Tax Return',
    country: 'IN',
    period: '2026-01',
    dueDate: '2026-02-20',
    status: 'FILED',
    filedDate: '2026-02-18',
    fileName: 'PT_KA_2026-01.pdf',
    amount: 48600,
    currency: 'INR',
    description: 'Karnataka PT Return — 243 employees',
  },
  {
    id: 'r7',
    reportType: 'INDIA_PT_RETURN',
    label: 'Professional Tax Return',
    country: 'IN',
    period: '2026-02',
    dueDate: '2026-03-20',
    status: 'NOT_GENERATED',
    filedDate: null,
    fileName: null,
    amount: null,
    currency: 'INR',
    description: 'Due after payroll finalization',
  },
  {
    id: 'r8',
    reportType: 'INDIA_FORM_16',
    label: 'Form 16 (Annual TDS)',
    country: 'IN',
    period: 'FY 2025-26',
    dueDate: '2026-06-15',
    status: 'UPCOMING',
    filedDate: null,
    fileName: null,
    amount: null,
    currency: 'INR',
    description: 'Annual TDS certificate — all employees',
  },
  // UAE
  {
    id: 'r9',
    reportType: 'UAE_WPS_SUMMARY',
    label: 'WPS Submission (MoHRE)',
    country: 'AE',
    period: '2026-01',
    dueDate: '2026-01-14',
    status: 'FILED',
    filedDate: '2026-01-12',
    fileName: 'WPS_EMP001_JAN2026.sif',
    amount: 487500,
    currency: 'AED',
    description: 'Monthly WPS salary file — 247 employees',
  },
  {
    id: 'r10',
    reportType: 'UAE_WPS_SUMMARY',
    label: 'WPS Submission (MoHRE)',
    country: 'AE',
    period: '2026-02',
    dueDate: '2026-02-14',
    status: 'FILED',
    filedDate: '2026-02-13',
    fileName: 'WPS_EMP001_FEB2026.sif',
    amount: 492000,
    currency: 'AED',
    description: 'Monthly WPS salary file — 249 employees',
  },
  // KSA
  {
    id: 'r11',
    reportType: 'KSA_GOSI_RETURN',
    label: 'GOSI Monthly Return',
    country: 'SA',
    period: '2026-01',
    dueDate: '2026-01-10',
    status: 'FILED',
    filedDate: '2026-01-08',
    fileName: 'GOSI_2026-01.xml',
    amount: 1245000,
    currency: 'SAR',
    description: 'Monthly GOSI contributions — 185 employees',
  },
  {
    id: 'r12',
    reportType: 'KSA_GOSI_RETURN',
    label: 'GOSI Monthly Return',
    country: 'SA',
    period: '2026-02',
    dueDate: '2026-02-10',
    status: 'OVERDUE',
    filedDate: null,
    fileName: null,
    amount: null,
    currency: 'SAR',
    description: 'OVERDUE — was due Feb 10',
  },
];

const DEADLINES_UPCOMING = MOCK_REPORTS.filter(
  (r) => r.status === 'UPCOMING' || r.status === 'NOT_GENERATED'
)
  .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  .slice(0, 5);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  ReportStatus,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  FILED: {
    label: 'Filed',
    color: 'text-green-700',
    bg: 'bg-green-100',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  GENERATED: {
    label: 'Generated',
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    icon: <FileText className="w-3.5 h-3.5" />,
  },
  UPCOMING: {
    label: 'Upcoming',
    color: 'text-yellow-700',
    bg: 'bg-yellow-100',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  OVERDUE: {
    label: 'Overdue',
    color: 'text-red-700',
    bg: 'bg-red-100',
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
  },
  NOT_GENERATED: {
    label: 'Not Generated',
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

const COUNTRY_TABS: { id: Country; label: string; flag: string }[] = [
  { id: 'IN', label: 'India', flag: '🇮🇳' },
  { id: 'AE', label: 'UAE', flag: '🇦🇪' },
  { id: 'SA', label: 'KSA', flag: '🇸🇦' },
  { id: 'US', label: 'US', flag: '🇺🇸' },
];

function daysUntil(dateStr: string): number {
  const today = new Date();
  const due = new Date(dateStr);
  return Math.ceil((due.getTime() - today.getTime()) / 86400000);
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function StatutoryReportsDashboard() {
  const [activeCountry, setActiveCountry] = useState<Country>('IN');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const countryReports = MOCK_REPORTS.filter((r) => r.country === activeCountry);
  const overdueCount = MOCK_REPORTS.filter((r) => r.status === 'OVERDUE').length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Statutory Reports Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Track statutory filings and compliance status across all jurisdictions
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium hover:border-gray-300 transition-colors">
              <Calendar className="w-4 h-4 text-gray-500" /> Compliance Calendar
            </button>
          </div>
        </div>

        {/* Overdue Alert */}
        {overdueCount > 0 && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">
                {overdueCount} Overdue Filing{overdueCount > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                {MOCK_REPORTS.filter((r) => r.status === 'OVERDUE')
                  .map((r) => `${r.label} (${r.period})`)
                  .join(', ')}
              </p>
            </div>
          </div>
        )}

        {/* Compliance Scores */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {MOCK_SCORES.map((score) => (
            <div
              key={score.country}
              onClick={() => setActiveCountry(score.country as Country)}
              className={`bg-white border rounded-xl shadow-sm p-4 cursor-pointer transition-colors ${
                activeCountry === score.country
                  ? 'border-indigo-300 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{score.flag}</span>
                <span className="text-sm font-semibold text-gray-800">{score.label}</span>
              </div>
              {/* Score ring (CSS) */}
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12">
                  <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={
                        score.score === 100 ? '#10B981' : score.score >= 80 ? '#F59E0B' : '#EF4444'
                      }
                      strokeWidth="3"
                      strokeDasharray={`${score.score}, 100`}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
                    {score.score}%
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">
                    {score.filed}/{score.total} filed
                  </p>
                  {score.overdue > 0 && (
                    <p className="text-xs text-red-500 font-medium">{score.overdue} overdue</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Upcoming Deadlines Banner */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-semibold text-gray-800">Upcoming Deadlines</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {DEADLINES_UPCOMING.map((r) => {
              const days = daysUntil(r.dueDate);
              const urgency =
                days <= 3
                  ? 'bg-red-100 text-red-700 border-red-200'
                  : days <= 7
                    ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200';
              return (
                <div
                  key={r.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${urgency}`}
                >
                  <span>{COUNTRY_TABS.find((c) => c.id === r.country)?.flag}</span>
                  <span className="font-medium">{r.label}</span>
                  <span className="opacity-75">({r.period})</span>
                  <span className="font-bold">{days > 0 ? `${days}d` : 'Today'}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Country Tabs & Reports */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {COUNTRY_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCountry(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeCountry === tab.id
                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.flag}</span>
                <span>{tab.label}</span>
                {MOCK_REPORTS.filter((r) => r.country === tab.id && r.status === 'OVERDUE').length >
                  0 && <span className="w-2 h-2 bg-red-500 rounded-full" />}
              </button>
            ))}
          </div>

          {/* Reports List */}
          <div className="divide-y divide-gray-50">
            {countryReports.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Globe className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No statutory reports configured for this jurisdiction</p>
              </div>
            ) : (
              countryReports.map((report) => {
                const statusConf = STATUS_CONFIG[report.status];
                const isExpanded = expandedId === report.id;
                const days = daysUntil(report.dueDate);

                return (
                  <div key={report.id} className="hover:bg-gray-50 transition-colors">
                    <div
                      className="flex items-center gap-4 px-5 py-4 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : report.id)}
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${statusConf.bg}`}
                      >
                        <span className={statusConf.color}>{statusConf.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-gray-800 text-sm">{report.label}</p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-medium ${statusConf.bg} ${statusConf.color}`}
                          >
                            {statusConf.icon}
                            {statusConf.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{report.description}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Due: {report.dueDate}
                          </span>
                          <span>Period: {report.period}</span>
                          {report.filedDate && (
                            <span className="text-green-600">Filed: {report.filedDate}</span>
                          )}
                          {report.status === 'UPCOMING' && days > 0 && (
                            <span
                              className={`font-medium ${days <= 5 ? 'text-yellow-600' : 'text-blue-600'}`}
                            >
                              {days} days remaining
                            </span>
                          )}
                        </div>
                      </div>
                      {report.amount && (
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-semibold text-gray-800">
                            {new Intl.NumberFormat('en-IN', {
                              notation: 'compact',
                              maximumFractionDigits: 1,
                            }).format(report.amount)}{' '}
                            {report.currency}
                          </p>
                          <p className="text-xs text-gray-500">Amount</p>
                        </div>
                      )}
                      <div className="flex gap-2 flex-shrink-0">
                        {report.status !== 'FILED' && report.status !== 'GENERATED' && (
                          <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors">
                            Generate
                          </button>
                        )}
                        {report.fileName && (
                          <button className="p-1.5 text-gray-400 hover:text-indigo-600 border border-gray-200 rounded-lg hover:border-indigo-200 transition-colors">
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      {isExpanded ? (
                        <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </div>

                    {isExpanded && (
                      <div className="px-5 pb-4 bg-gray-50 border-t border-gray-100">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                          <div>
                            <span className="text-gray-500 text-xs">Report Type</span>
                            <p className="font-mono text-xs text-indigo-600 mt-0.5">
                              {report.reportType}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-xs">Period</span>
                            <p className="font-medium text-gray-800 mt-0.5">{report.period}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-xs">Due Date</span>
                            <p className="font-medium text-gray-800 mt-0.5">{report.dueDate}</p>
                          </div>
                          {report.filedDate && (
                            <div>
                              <span className="text-gray-500 text-xs">Filed Date</span>
                              <p className="font-medium text-green-700 mt-0.5">
                                {report.filedDate}
                              </p>
                            </div>
                          )}
                          {report.fileName && (
                            <div className="col-span-2">
                              <span className="text-gray-500 text-xs">File Name</span>
                              <p className="font-mono text-xs text-gray-700 mt-0.5 truncate">
                                {report.fileName}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
