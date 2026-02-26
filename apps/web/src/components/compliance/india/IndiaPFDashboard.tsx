'use client';

import React, { useState } from 'react';
import {
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  IndianRupee,
  Calendar,
  Download,
  FileText,
  BarChart3,
  RefreshCw,
  Calculator,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ECRStatus = 'PENDING' | 'GENERATING' | 'GENERATED' | 'SUBMITTED' | 'FILED' | 'FAILED';

interface PFMonthlyRecord {
  id: string;
  month: string;
  status: ECRStatus;
  totalEmployees: number;
  totalEPFWages: number;
  totalEEContrib: number;
  totalERContrib: number;
  totalEPSContrib: number;
  totalAdminCharges: number;
  grandTotal: number;
  ecrFileName: string | null;
  dueDate: string;
  filedDate: string | null;
}

interface EmployeePFSummary {
  employeeCode: string;
  employeeName: string;
  uan: string;
  basicPlusDa: number;
  cappedWages: number;
  isCapped: boolean;
  eeContrib: number;
  erContrib: number;
  epsContrib: number;
  total: number;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const MOCK_PF_RECORDS: PFMonthlyRecord[] = [
  {
    id: 'pf-001',
    month: '2026-01',
    status: 'FILED',
    totalEmployees: 124,
    totalEPFWages: 1860000,
    totalEEContrib: 223200,
    totalERContrib: 68262,
    totalEPSContrib: 154938,
    totalAdminCharges: 10230,
    grandTotal: 456630,
    ecrFileName: 'ECR_TENANT_2026-01_1738100000.txt',
    dueDate: '2026-02-15',
    filedDate: '2026-02-12',
  },
  {
    id: 'pf-002',
    month: '2025-12',
    status: 'FILED',
    totalEmployees: 121,
    totalEPFWages: 1815000,
    totalEEContrib: 217800,
    totalERContrib: 66612,
    totalEPSContrib: 151188,
    totalAdminCharges: 9983,
    grandTotal: 445583,
    ecrFileName: 'ECR_TENANT_2025-12_1735500000.txt',
    dueDate: '2026-01-15',
    filedDate: '2026-01-10',
  },
  {
    id: 'pf-003',
    month: '2025-11',
    status: 'FILED',
    totalEmployees: 119,
    totalEPFWages: 1785000,
    totalEEContrib: 214200,
    totalERContrib: 65511,
    totalEPSContrib: 148689,
    totalAdminCharges: 9818,
    grandTotal: 438218,
    ecrFileName: 'ECR_TENANT_2025-11_1732900000.txt',
    dueDate: '2025-12-15',
    filedDate: '2025-12-09',
  },
  {
    id: 'pf-004',
    month: '2026-02',
    status: 'PENDING',
    totalEmployees: 0,
    totalEPFWages: 0,
    totalEEContrib: 0,
    totalERContrib: 0,
    totalEPSContrib: 0,
    totalAdminCharges: 0,
    grandTotal: 0,
    ecrFileName: null,
    dueDate: '2026-03-15',
    filedDate: null,
  },
];

const MOCK_EMPLOYEES: EmployeePFSummary[] = [
  {
    employeeCode: 'EMP001',
    employeeName: 'Arun Kumar',
    uan: '100123456789',
    basicPlusDa: 25000,
    cappedWages: 15000,
    isCapped: true,
    eeContrib: 3000,
    erContrib: 551,
    epsContrib: 1250,
    total: 4801,
  },
  {
    employeeCode: 'EMP002',
    employeeName: 'Priya Sharma',
    uan: '100234567890',
    basicPlusDa: 12000,
    cappedWages: 12000,
    isCapped: false,
    eeContrib: 1440,
    erContrib: 440,
    epsContrib: 1000,
    total: 2880,
  },
  {
    employeeCode: 'EMP003',
    employeeName: 'Rahul Singh',
    uan: '100345678901',
    basicPlusDa: 18000,
    cappedWages: 15000,
    isCapped: true,
    eeContrib: 2160,
    erContrib: 551,
    epsContrib: 1250,
    total: 3961,
  },
  {
    employeeCode: 'EMP004',
    employeeName: 'Anjali Patel',
    uan: '100456789012',
    basicPlusDa: 10000,
    cappedWages: 10000,
    isCapped: false,
    eeContrib: 1200,
    erContrib: 367,
    epsContrib: 833,
    total: 2400,
  },
  {
    employeeCode: 'EMP005',
    employeeName: 'Vikram Reddy',
    uan: '100567890123',
    basicPlusDa: 14500,
    cappedWages: 14500,
    isCapped: false,
    eeContrib: 1740,
    erContrib: 532,
    epsContrib: 1208,
    total: 3480,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  ECRStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  PENDING: {
    label: 'Pending',
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
    icon: Clock,
  },
  GENERATING: {
    label: 'Generating',
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
    icon: RefreshCw,
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
    icon: CheckCircle2,
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

function StatusBadge({ status }: { status: ECRStatus }) {
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
// PF Rate Info Panel
// ---------------------------------------------------------------------------
function PFRatePanel() {
  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Info className="h-4 w-4 text-blue-600" />
        <p className="text-sm font-semibold text-blue-900">
          EPF Contribution Structure (FY 2024-25)
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="space-y-2">
          <p className="font-semibold text-slate-700">Employee Side</p>
          <div className="flex justify-between rounded bg-white px-3 py-1.5">
            <span className="text-slate-600">EPF (12% of Basic+DA)</span>
            <span className="font-bold text-slate-900">12%</span>
          </div>
          <p className="text-slate-500">No ceiling on employee contribution</p>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-slate-700">Employer Side (capped at Rs 15,000)</p>
          <div className="flex justify-between rounded bg-white px-3 py-1.5">
            <span className="text-slate-600">EPS (Pension Scheme)</span>
            <span className="font-bold text-slate-900">8.33%</span>
          </div>
          <div className="flex justify-between rounded bg-white px-3 py-1.5">
            <span className="text-slate-600">EPF (Provident Fund)</span>
            <span className="font-bold text-slate-900">3.67%</span>
          </div>
          <div className="flex justify-between rounded bg-white px-3 py-1.5">
            <span className="text-slate-600">Admin Charge</span>
            <span className="font-bold text-slate-900">0.50%</span>
          </div>
          <div className="flex justify-between rounded bg-white px-3 py-1.5">
            <span className="text-slate-600">EDLI Charge</span>
            <span className="font-bold text-slate-900">0.01%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------

export function IndiaPFDashboard() {
  const [activeTab, setActiveTab] = useState<'submissions' | 'employees' | 'rates'>('submissions');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcBasic, setCalcBasic] = useState('20000');
  const [calcDA, setCalcDA] = useState('0');

  const lastFiled = MOCK_PF_RECORDS.find((r) => r.status === 'FILED');
  const ytdTotal = MOCK_PF_RECORDS.filter((r) => r.status === 'FILED').reduce(
    (s, r) => s + r.grandTotal,
    0
  );

  // Live calculation
  const basic = parseFloat(calcBasic) || 0;
  const da = parseFloat(calcDA) || 0;
  const pfWages = basic + da;
  const cappedWages = Math.min(pfWages, 15000);
  const isCapped = pfWages > 15000;
  const eeContrib = pfWages * 0.12;
  const erEPS = cappedWages * 0.0833;
  const erEPF = cappedWages * 0.0367;
  const adminCharge = cappedWages * 0.005;
  const edli = cappedWages * 0.0001;
  const totalPayable = eeContrib + erEPS + erEPF + adminCharge + edli;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-orange-600 p-2.5">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">India PF / EPF Compliance</h1>
            <p className="text-sm text-slate-500">
              Employee Provident Fund — Monthly ECR Filing & Contribution Management
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Calculator className="h-4 w-4" />
            Calculator
          </button>
          <button className="flex items-center gap-1.5 rounded-lg bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700">
            <FileText className="h-4 w-4" />
            Generate ECR
          </button>
        </div>
      </div>

      {/* Calculator Panel */}
      {showCalculator && (
        <div className="mb-6 rounded-xl border border-orange-200 bg-orange-50 p-5 shadow-sm">
          <p className="mb-4 text-sm font-semibold text-orange-900">Quick PF Calculator</p>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Basic Salary (Rs)
              </label>
              <input
                type="number"
                value={calcBasic}
                onChange={(e) => setCalcBasic(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                DA Allowance (Rs)
              </label>
              <input
                type="number"
                value={calcDA}
                onChange={(e) => setCalcDA(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div className="col-span-2 grid grid-cols-3 gap-2 rounded-lg bg-white p-3 text-xs">
              <div>
                <p className="text-slate-500">PF Wages</p>
                <p className="font-bold text-slate-900">{formatINR(pfWages)}</p>
                {isCapped && <p className="text-amber-600">Capped at Rs 15,000</p>}
              </div>
              <div>
                <p className="text-slate-500">Employee (12%)</p>
                <p className="font-bold text-orange-700">{formatINR(eeContrib)}</p>
              </div>
              <div>
                <p className="text-slate-500">Employer (12%)</p>
                <p className="font-bold text-slate-900">{formatINR(erEPS + erEPF)}</p>
                <p className="text-slate-400">
                  EPS: {formatINR(erEPS)} | EPF: {formatINR(erEPF)}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between rounded-lg bg-orange-100 px-4 py-2">
            <span className="text-sm font-medium text-orange-900">
              Total Monthly Payable (incl. admin)
            </span>
            <span className="text-lg font-bold text-orange-700">{formatINR(totalPayable)}</span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Active PF Members"
          value="124"
          sub="ECR enrolled employees"
          icon={Users}
          accent="bg-orange-500"
        />
        <StatCard
          label="Last Month Total"
          value={formatINR(lastFiled?.grandTotal ?? 0)}
          sub={`${formatMonth(lastFiled?.month ?? '')} — all components`}
          icon={IndianRupee}
          accent="bg-emerald-500"
        />
        <StatCard
          label="YTD Contributions"
          value={formatINR(ytdTotal)}
          sub={`${MOCK_PF_RECORDS.filter((r) => r.status === 'FILED').length} filed months`}
          icon={TrendingUp}
          accent="bg-violet-500"
        />
        <StatCard
          label="Compliance"
          value="100%"
          sub="All ECRs filed on time"
          icon={CheckCircle2}
          accent="bg-emerald-500"
        />
      </div>

      {/* Contribution Breakdown */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Contribution Breakdown — Jan 2026
            </p>
            <p className="text-xs text-slate-500">EPF + EPS + Admin charges</p>
          </div>
          <BarChart3 className="h-4 w-4 text-slate-400" />
        </div>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {[
            {
              label: 'Employee EPF (12%)',
              amount: 223200,
              color: 'bg-orange-500',
              subLabel: 'Employee contribution',
            },
            {
              label: 'Employer EPF (3.67%)',
              amount: 68262,
              color: 'bg-blue-500',
              subLabel: 'To EPF account',
            },
            {
              label: 'EPS (8.33%)',
              amount: 154938,
              color: 'bg-violet-500',
              subLabel: 'Pension Scheme',
            },
            {
              label: 'Admin + EDLI',
              amount: 10230,
              color: 'bg-slate-400',
              subLabel: '0.50% + 0.01%',
            },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-slate-100 p-4">
              <div className={`mb-2 h-1 rounded-full ${item.color}`} />
              <p className="text-xs text-slate-500">{item.label}</p>
              <p className="mt-1 text-lg font-bold text-slate-900">{formatINR(item.amount)}</p>
              <p className="text-xs text-slate-400">{item.subLabel}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex gap-1 border-b border-slate-200 px-4 pt-3">
          {(['submissions', 'employees', 'rates'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-t-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-orange-600 text-orange-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab === 'submissions'
                ? 'Monthly ECR'
                : tab === 'employees'
                  ? 'Employee Summary'
                  : 'Rate Structure'}
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
                    Members
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    EE Contrib
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    ER Contrib
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Admin
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Grand Total
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Due Date
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {MOCK_PF_RECORDS.map((rec) => (
                  <React.Fragment key={rec.id}>
                    <tr
                      className="group cursor-pointer hover:bg-slate-50"
                      onClick={() => setExpandedRow(expandedRow === rec.id ? null : rec.id)}
                    >
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
                        {rec.totalEmployees || '—'}
                      </td>
                      <td className="px-5 py-4 text-right text-sm font-medium text-slate-900">
                        {rec.totalEEContrib > 0 ? formatINR(rec.totalEEContrib) : '—'}
                      </td>
                      <td className="px-5 py-4 text-right text-sm font-medium text-slate-900">
                        {rec.totalERContrib + rec.totalEPSContrib > 0
                          ? formatINR(rec.totalERContrib + rec.totalEPSContrib)
                          : '—'}
                      </td>
                      <td className="px-5 py-4 text-right text-sm text-slate-500">
                        {rec.totalAdminCharges > 0 ? formatINR(rec.totalAdminCharges) : '—'}
                      </td>
                      <td className="px-5 py-4 text-right text-sm font-bold text-orange-700">
                        {rec.grandTotal > 0 ? formatINR(rec.grandTotal) : '—'}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">
                        <span
                          className={
                            new Date(rec.dueDate) < new Date() && rec.status === 'PENDING'
                              ? 'text-red-600 font-medium'
                              : ''
                          }
                        >
                          {formatDate(rec.dueDate)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          {rec.ecrFileName && (
                            <button
                              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                              title="Download ECR"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          )}
                          {expandedRow === rec.id ? (
                            <ChevronUp className="h-4 w-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedRow === rec.id && rec.grandTotal > 0 && (
                      <tr className="bg-slate-50">
                        <td colSpan={9} className="px-5 py-4">
                          <div className="grid grid-cols-4 gap-4 text-xs">
                            <div className="rounded-lg bg-white p-3">
                              <p className="text-slate-500">EPF Wages (capped)</p>
                              <p className="mt-1 font-bold text-slate-900">
                                {formatINR(rec.totalEPFWages)}
                              </p>
                            </div>
                            <div className="rounded-lg bg-white p-3">
                              <p className="text-slate-500">EPS Contribution</p>
                              <p className="mt-1 font-bold text-slate-900">
                                {formatINR(rec.totalEPSContrib)}
                              </p>
                              <p className="text-slate-400">8.33% capped</p>
                            </div>
                            <div className="rounded-lg bg-white p-3">
                              <p className="text-slate-500">EPF (Employer)</p>
                              <p className="mt-1 font-bold text-slate-900">
                                {formatINR(rec.totalERContrib)}
                              </p>
                              <p className="text-slate-400">3.67% capped</p>
                            </div>
                            <div className="rounded-lg bg-white p-3">
                              <p className="text-slate-500">Filed Date</p>
                              <p className="mt-1 font-bold text-slate-900">
                                {rec.filedDate ? formatDate(rec.filedDate) : '—'}
                              </p>
                              <p className="text-slate-400 truncate">
                                {rec.ecrFileName ?? 'No file'}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
                    UAN
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Basic+DA
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Capped Wages
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    EE (12%)
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    ER EPF
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    EPS
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
                    <td className="px-5 py-3 font-mono text-sm text-slate-700">{emp.uan}</td>
                    <td className="px-5 py-3 text-right text-sm text-slate-900">
                      {formatINR(emp.basicPlusDa)}
                    </td>
                    <td className="px-5 py-3 text-right text-sm">
                      <span
                        className={emp.isCapped ? 'font-medium text-amber-600' : 'text-slate-900'}
                      >
                        {formatINR(emp.cappedWages)}
                        {emp.isCapped && <span className="ml-1 text-xs">(cap)</span>}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-sm font-medium text-orange-700">
                      {formatINR(emp.eeContrib)}
                    </td>
                    <td className="px-5 py-3 text-right text-sm text-slate-900">
                      {formatINR(emp.erContrib)}
                    </td>
                    <td className="px-5 py-3 text-right text-sm text-slate-900">
                      {formatINR(emp.epsContrib)}
                    </td>
                    <td className="px-5 py-3 text-right text-sm font-bold text-slate-900">
                      {formatINR(emp.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'rates' && (
          <div className="p-5">
            <PFRatePanel />
          </div>
        )}
      </div>
    </div>
  );
}

export default IndiaPFDashboard;
