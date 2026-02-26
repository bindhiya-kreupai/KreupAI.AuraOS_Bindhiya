'use client';

import React, { useState } from 'react';
import {
  HeartPulse,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  IndianRupee,
  Calendar,
  Download,
  FileText,
  Info,
  RefreshCw,
  Calculator,
  CheckCheck,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ESIStatus = 'PENDING' | 'GENERATED' | 'SUBMITTED' | 'FILED' | 'FAILED';

interface ESIMonthlyRecord {
  id: string;
  month: string;
  status: ESIStatus;
  totalEmployees: number;
  totalEligible: number;
  totalIneligible: number;
  totalEEContrib: number;
  totalERContrib: number;
  grandTotal: number;
  fileName: string | null;
  dueDate: string;
  filedDate: string | null;
}

interface EmployeeESISummary {
  employeeCode: string;
  employeeName: string;
  ipNumber: string;
  grossSalary: number;
  isEligible: boolean;
  eeContrib: number;
  erContrib: number;
  total: number;
  reason?: string;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const MOCK_ESI_RECORDS: ESIMonthlyRecord[] = [
  {
    id: 'esi-001',
    month: '2026-01',
    status: 'FILED',
    totalEmployees: 124,
    totalEligible: 89,
    totalIneligible: 35,
    totalEEContrib: 28755,
    totalERContrib: 124585,
    grandTotal: 153340,
    fileName: 'ESI_RETURN_TENANT_2026-01_1738100000.csv',
    dueDate: '2026-02-21',
    filedDate: '2026-02-18',
  },
  {
    id: 'esi-002',
    month: '2025-12',
    status: 'FILED',
    totalEmployees: 121,
    totalEligible: 86,
    totalIneligible: 35,
    totalEEContrib: 27795,
    totalERContrib: 120445,
    grandTotal: 148240,
    fileName: 'ESI_RETURN_TENANT_2025-12_1735500000.csv',
    dueDate: '2026-01-21',
    filedDate: '2026-01-17',
  },
  {
    id: 'esi-003',
    month: '2025-11',
    status: 'FILED',
    totalEmployees: 119,
    totalEligible: 84,
    totalIneligible: 35,
    totalEEContrib: 27150,
    totalERContrib: 117650,
    grandTotal: 144800,
    fileName: 'ESI_RETURN_TENANT_2025-11_1732900000.csv',
    dueDate: '2025-12-21',
    filedDate: '2025-12-15',
  },
  {
    id: 'esi-004',
    month: '2026-02',
    status: 'PENDING',
    totalEmployees: 0,
    totalEligible: 0,
    totalIneligible: 0,
    totalEEContrib: 0,
    totalERContrib: 0,
    grandTotal: 0,
    fileName: null,
    dueDate: '2026-03-21',
    filedDate: null,
  },
];

const MOCK_EMPLOYEES: EmployeeESISummary[] = [
  {
    employeeCode: 'EMP001',
    employeeName: 'Arun Kumar',
    ipNumber: '3112345678',
    grossSalary: 18000,
    isEligible: true,
    eeContrib: 135,
    erContrib: 585,
    total: 720,
  },
  {
    employeeCode: 'EMP002',
    employeeName: 'Priya Sharma',
    ipNumber: '3112345679',
    grossSalary: 21000,
    isEligible: true,
    eeContrib: 158,
    erContrib: 683,
    total: 841,
  },
  {
    employeeCode: 'EMP003',
    employeeName: 'Rahul Singh',
    ipNumber: '',
    grossSalary: 45000,
    isEligible: false,
    eeContrib: 0,
    erContrib: 0,
    total: 0,
    reason: 'Gross Rs 45,000 exceeds Rs 21,000 ceiling',
  },
  {
    employeeCode: 'EMP004',
    employeeName: 'Anjali Patel',
    ipNumber: '3112345680',
    grossSalary: 15000,
    isEligible: true,
    eeContrib: 113,
    erContrib: 488,
    total: 601,
  },
  {
    employeeCode: 'EMP005',
    employeeName: 'Vikram Reddy',
    ipNumber: '',
    grossSalary: 75000,
    isEligible: false,
    eeContrib: 0,
    erContrib: 0,
    total: 0,
    reason: 'Gross Rs 75,000 exceeds Rs 21,000 ceiling',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  ESIStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  PENDING: {
    label: 'Pending',
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
    icon: Clock,
  },
  GENERATED: {
    label: 'Generated',
    color: 'text-violet-600',
    bg: 'bg-violet-50 border-violet-200',
    icon: FileText,
  },
  SUBMITTED: {
    label: 'Submitted',
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
    icon: RefreshCw,
  },
  FILED: {
    label: 'Filed',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200',
    icon: CheckCircle2,
  },
  FAILED: { label: 'Failed', color: 'text-red-600', bg: 'bg-red-50 border-red-200', icon: XCircle },
};

const formatINR = (n: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
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

const formatDate = (d: string): string =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

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

function StatusBadge({ status }: { status: ESIStatus }) {
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

// ---------------------------------------------------------------------------
// ESI Eligibility Checker
// ---------------------------------------------------------------------------
function ESIEligibilityChecker() {
  const [gross, setGross] = useState('18000');
  const [isDisabled, setIsDisabled] = useState(false);

  const grossNum = parseFloat(gross) || 0;
  const ceiling = isDisabled ? 25000 : 21000;
  const isEligible = grossNum <= ceiling;
  const eeContrib = isEligible ? grossNum * 0.0075 : 0;
  const erContrib = isEligible ? grossNum * 0.0325 : 0;
  const total = eeContrib + erContrib;

  return (
    <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Calculator className="h-4 w-4 text-teal-600" />
        <p className="text-sm font-semibold text-teal-900">
          ESI Eligibility & Contribution Calculator
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Gross Monthly Salary (Rs)
            </label>
            <input
              type="number"
              value={gross}
              onChange={(e) => setGross(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="disabled-chk"
              checked={isDisabled}
              onChange={(e) => setIsDisabled(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-teal-600"
            />
            <label htmlFor="disabled-chk" className="text-xs text-slate-600">
              Person with Disability (ceiling Rs 25,000)
            </label>
          </div>
        </div>

        <div className="col-span-2">
          <div
            className={`rounded-lg border-2 p-4 ${isEligible ? 'border-emerald-300 bg-emerald-50' : 'border-red-200 bg-red-50'}`}
          >
            <div className="mb-3 flex items-center gap-2">
              {isEligible ? (
                <>
                  <CheckCheck className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-800">ESI Applicable</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-semibold text-red-800">Not Eligible for ESI</span>
                </>
              )}
            </div>
            {isEligible ? (
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="rounded bg-white px-3 py-2">
                  <p className="text-slate-500">Employee (0.75%)</p>
                  <p className="mt-1 font-bold text-teal-700">{formatINR(eeContrib)}</p>
                </div>
                <div className="rounded bg-white px-3 py-2">
                  <p className="text-slate-500">Employer (3.25%)</p>
                  <p className="mt-1 font-bold text-slate-900">{formatINR(erContrib)}</p>
                </div>
                <div className="rounded bg-teal-100 px-3 py-2">
                  <p className="text-teal-700">Total (4.00%)</p>
                  <p className="mt-1 font-bold text-teal-900">{formatINR(total)}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-red-700">
                Gross {formatINR(grossNum)} exceeds ESI ceiling of {formatINR(ceiling)}. No ESI
                contribution applicable. Employee not covered under ESI scheme.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------

export function IndiaESIDashboard() {
  const [activeTab, setActiveTab] = useState<'submissions' | 'employees' | 'info'>('submissions');
  const [showCalculator, setShowCalculator] = useState(false);

  const lastFiled = MOCK_ESI_RECORDS.find((r) => r.status === 'FILED');
  const ytdTotal = MOCK_ESI_RECORDS.filter((r) => r.status === 'FILED').reduce(
    (s, r) => s + r.grandTotal,
    0
  );
  const eligibleCount = MOCK_EMPLOYEES.filter((e) => e.isEligible).length;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-teal-600 p-2.5">
            <HeartPulse className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">India ESI Compliance</h1>
            <p className="text-sm text-slate-500">
              Employee State Insurance — Monthly Contribution & Eligibility Tracking
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Calculator className="h-4 w-4" />
            Eligibility Check
          </button>
          <button className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700">
            <FileText className="h-4 w-4" />
            Generate Return
          </button>
        </div>
      </div>

      {/* Eligibility Calculator */}
      {showCalculator && (
        <div className="mb-6">
          <ESIEligibilityChecker />
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="ESI-Eligible Employees"
          value={`${eligibleCount}/124`}
          sub={`${124 - eligibleCount} above Rs 21,000 ceiling`}
          icon={Users}
          accent="bg-teal-500"
        />
        <StatCard
          label="Last Month Total"
          value={formatINR(lastFiled?.grandTotal ?? 0)}
          sub={`${formatMonth(lastFiled?.month ?? '')} contribution`}
          icon={IndianRupee}
          accent="bg-emerald-500"
        />
        <StatCard
          label="YTD Contributions"
          value={formatINR(ytdTotal)}
          sub={`${MOCK_ESI_RECORDS.filter((r) => r.status === 'FILED').length} filed months`}
          icon={TrendingUp}
          accent="bg-violet-500"
        />
        <StatCard
          label="Compliance"
          value="100%"
          sub="All returns filed on time"
          icon={CheckCircle2}
          accent="bg-emerald-500"
        />
      </div>

      {/* Contribution Split */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="mb-4 text-sm font-semibold text-slate-900">Contribution Split — Jan 2026</p>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-teal-500" />
                <span className="text-sm text-slate-700">Employee (0.75%)</span>
              </div>
              <span className="text-sm font-bold text-slate-900">{formatINR(28755)}</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-teal-500"
                style={{ width: `${(28755 / 153340) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="text-sm text-slate-700">Employer (3.25%)</span>
              </div>
              <span className="text-sm font-bold text-slate-900">{formatINR(124585)}</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{ width: `${(124585 / 153340) * 100}%` }}
              />
            </div>
          </div>
          <div className="rounded-lg bg-teal-50 p-4">
            <p className="mb-3 text-xs font-semibold text-teal-900">ESI Benefits Coverage</p>
            <div className="space-y-2 text-xs text-slate-700">
              {[
                'Medical care for employee & family',
                'Sickness cash benefit (70% of wages)',
                'Maternity benefit (100% of wages)',
                'Disability benefit (90% of wages)',
                'Dependent allowance on death',
                'Funeral expenses',
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-teal-500 shrink-0" />
                  {benefit}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex gap-1 border-b border-slate-200 px-4 pt-3">
          {(['submissions', 'employees', 'info'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-t-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-teal-600 text-teal-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab === 'submissions'
                ? 'Monthly Returns'
                : tab === 'employees'
                  ? 'Eligibility Tracker'
                  : 'ESI Info'}
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
                    Eligible
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    EE Contrib
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    ER Contrib
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Grand Total
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Due / Filed
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {MOCK_ESI_RECORDS.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-900">
                          {formatMonth(rec.month)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={rec.status} />
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-medium text-slate-900">
                      {rec.totalEligible > 0 ? `${rec.totalEligible}/${rec.totalEmployees}` : '—'}
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-medium text-slate-900">
                      {rec.totalEEContrib > 0 ? formatINR(rec.totalEEContrib) : '—'}
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-medium text-slate-900">
                      {rec.totalERContrib > 0 ? formatINR(rec.totalERContrib) : '—'}
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-bold text-teal-700">
                      {rec.grandTotal > 0 ? formatINR(rec.grandTotal) : '—'}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      <div>Due: {formatDate(rec.dueDate)}</div>
                      {rec.filedDate && (
                        <div className="text-emerald-600">Filed: {formatDate(rec.filedDate)}</div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {rec.fileName && (
                        <button
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Employee
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    IP Number
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Gross Salary
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Eligibility
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    EE (0.75%)
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    ER (3.25%)
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {MOCK_EMPLOYEES.map((emp) => (
                  <tr key={emp.employeeCode} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{emp.employeeName}</p>
                        <p className="text-xs text-slate-400">{emp.employeeCode}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-sm text-slate-700">
                      {emp.ipNumber || <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-5 py-3 text-right text-sm text-slate-900">
                      {formatINR(emp.grossSalary)}
                    </td>
                    <td className="px-5 py-3">
                      {emp.isEligible ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" />
                          Eligible
                        </span>
                      ) : (
                        <div>
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-xs font-medium text-red-700">
                            <XCircle className="h-3 w-3" />
                            Not Eligible
                          </span>
                          {emp.reason && (
                            <p className="mt-1 text-xs text-slate-400">{emp.reason}</p>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right text-sm font-medium text-teal-700">
                      {emp.eeContrib > 0 ? formatINR(emp.eeContrib) : '—'}
                    </td>
                    <td className="px-5 py-3 text-right text-sm text-slate-900">
                      {emp.erContrib > 0 ? formatINR(emp.erContrib) : '—'}
                    </td>
                    <td className="px-5 py-3 text-right text-sm font-bold text-slate-900">
                      {emp.total > 0 ? formatINR(emp.total) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="p-5 space-y-4">
            <div className="rounded-xl border border-teal-100 bg-teal-50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Info className="h-4 w-4 text-teal-600" />
                <p className="text-sm font-semibold text-teal-900">
                  ESI Applicability & Rates (2024)
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <div className="flex justify-between rounded bg-white px-3 py-2">
                    <span className="text-slate-600">Applicability ceiling</span>
                    <span className="font-bold text-slate-900">Rs 21,000/month</span>
                  </div>
                  <div className="flex justify-between rounded bg-white px-3 py-2">
                    <span className="text-slate-600">Disability ceiling</span>
                    <span className="font-bold text-slate-900">Rs 25,000/month</span>
                  </div>
                  <div className="flex justify-between rounded bg-white px-3 py-2">
                    <span className="text-slate-600">Min establishment size</span>
                    <span className="font-bold text-slate-900">10 employees</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between rounded bg-white px-3 py-2">
                    <span className="text-slate-600">Employee contribution</span>
                    <span className="font-bold text-teal-700">0.75%</span>
                  </div>
                  <div className="flex justify-between rounded bg-white px-3 py-2">
                    <span className="text-slate-600">Employer contribution</span>
                    <span className="font-bold text-slate-900">3.25%</span>
                  </div>
                  <div className="flex justify-between rounded bg-white px-3 py-2">
                    <span className="text-slate-600">Total rate</span>
                    <span className="font-bold text-slate-900">4.00%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="mb-2 text-sm font-semibold text-slate-900">
                Contribution Periods & Due Dates
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-700">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="font-medium">Contribution Period 1</p>
                  <p className="text-slate-500">April 1 — September 30</p>
                  <p className="mt-1 text-teal-600 font-medium">Return due: November 11</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="font-medium">Contribution Period 2</p>
                  <p className="text-slate-500">October 1 — March 31</p>
                  <p className="mt-1 text-teal-600 font-medium">Return due: May 11</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default IndiaESIDashboard;
