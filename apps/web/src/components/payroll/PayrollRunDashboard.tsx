'use client';

import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Lock,
  TrendingUp,
  TrendingDown,
  Users,
  IndianRupee,
  BarChart3,
  Eye,
  AlertCircle,
  Loader2,
  CheckSquare,
  Send,
  Download,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PayrollStep = 'INITIALIZE' | 'CALCULATE' | 'REVIEW' | 'APPROVE' | 'FINALIZE' | 'DISBURSE';
type RunStatus =
  | 'DRAFT'
  | 'INITIALIZED'
  | 'CALCULATING'
  | 'CALCULATED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'FINALIZED'
  | 'DISBURSED'
  | 'REVERSED';

interface PayrollRun {
  id: string;
  period: string;
  status: RunStatus;
  totalEmployees: number;
  processedCount: number;
  errorCount: number;
  totalGross: number;
  totalDeductions: number;
  totalNetPay: number;
  totalEmployerCost: number;
  lastPeriodGross: number;
  createdAt: string;
  finalizedAt: string | null;
}

interface DepartmentRow {
  department: string;
  headcount: number;
  gross: number;
  deductions: number;
  netPay: number;
  prevGross: number;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const MOCK_CURRENT_RUN: PayrollRun = {
  id: 'run-2026-02',
  period: '2026-02',
  status: 'CALCULATING',
  totalEmployees: 247,
  processedCount: 178,
  errorCount: 2,
  totalGross: 18540000,
  totalDeductions: 3245000,
  totalNetPay: 15295000,
  totalEmployerCost: 20764800,
  lastPeriodGross: 18225000,
  createdAt: '2026-02-20',
  finalizedAt: null,
};

const MOCK_DEPARTMENTS: DepartmentRow[] = [
  {
    department: 'Engineering',
    headcount: 82,
    gross: 9840000,
    deductions: 1722000,
    netPay: 8118000,
    prevGross: 9635000,
  },
  {
    department: 'Sales',
    headcount: 55,
    gross: 4125000,
    deductions: 721875,
    netPay: 3403125,
    prevGross: 4042500,
  },
  {
    department: 'Finance',
    headcount: 22,
    gross: 1980000,
    deductions: 346500,
    netPay: 1633500,
    prevGross: 1940000,
  },
  {
    department: 'HR',
    headcount: 18,
    gross: 1440000,
    deductions: 252000,
    netPay: 1188000,
    prevGross: 1440000,
  },
  {
    department: 'Operations',
    headcount: 70,
    gross: 1155000,
    deductions: 202125,
    netPay: 952875,
    prevGross: 1167500,
  },
];

const MOCK_PAST_RUNS: PayrollRun[] = [
  {
    id: 'run-2026-01',
    period: '2026-01',
    status: 'FINALIZED',
    totalEmployees: 243,
    processedCount: 243,
    errorCount: 0,
    totalGross: 18225000,
    totalDeductions: 3187500,
    totalNetPay: 15037500,
    totalEmployerCost: 20412000,
    lastPeriodGross: 17850000,
    createdAt: '2026-01-20',
    finalizedAt: '2026-01-30',
  },
  {
    id: 'run-2025-12',
    period: '2025-12',
    status: 'DISBURSED',
    totalEmployees: 239,
    processedCount: 239,
    errorCount: 0,
    totalGross: 17850000,
    totalDeductions: 3123750,
    totalNetPay: 14726250,
    totalEmployerCost: 20016000,
    lastPeriodGross: 17600000,
    createdAt: '2025-12-20',
    finalizedAt: '2025-12-30',
  },
];

// ---------------------------------------------------------------------------
// Step Configuration
// ---------------------------------------------------------------------------

const PAYROLL_STEPS: { id: PayrollStep; label: string; description: string }[] = [
  { id: 'INITIALIZE', label: 'Initialize', description: 'Set up payroll run for the period' },
  { id: 'CALCULATE', label: 'Calculate', description: 'Process all employee payrolls' },
  { id: 'REVIEW', label: 'Review', description: 'Verify results and check variances' },
  { id: 'APPROVE', label: 'Approve', description: 'Manager/HR approves the run' },
  { id: 'FINALIZE', label: 'Finalize', description: 'Lock and generate payslips' },
  { id: 'DISBURSE', label: 'Disburse', description: 'Generate bank file and pay' },
];

function getStepIndex(status: RunStatus): number {
  const map: Record<RunStatus, number> = {
    DRAFT: -1,
    INITIALIZED: 0,
    CALCULATING: 1,
    CALCULATED: 1,
    UNDER_REVIEW: 2,
    APPROVED: 3,
    FINALIZED: 4,
    DISBURSED: 5,
    REVERSED: 5,
  };
  return map[status] ?? -1;
}

function fmt(n: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    notation: 'compact',
  }).format(n);
}

function fmtFull(n: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function PayrollRunDashboard() {
  const [run, setRun] = useState<PayrollRun>(MOCK_CURRENT_RUN);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

  const currentStepIdx = getStepIndex(run.status);
  const progressPct =
    run.totalEmployees > 0 ? Math.round((run.processedCount / run.totalEmployees) * 100) : 0;

  const grossVariance = run.totalGross - run.lastPeriodGross;
  const grossVariancePct =
    run.lastPeriodGross > 0 ? (grossVariance / run.lastPeriodGross) * 100 : 0;
  const isHighVariance = Math.abs(grossVariancePct) > 10;

  const handleAction = async (action: string) => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1500));

    const statusMap: Record<string, RunStatus> = {
      initialize: 'INITIALIZED',
      calculate: 'CALCULATING',
      review: 'UNDER_REVIEW',
      approve: 'APPROVED',
      finalize: 'FINALIZED',
      disburse: 'DISBURSED',
    };

    if (statusMap[action]) {
      setRun((prev) => ({
        ...prev,
        status: statusMap[action],
        processedCount: action === 'calculate' ? prev.totalEmployees : prev.processedCount,
      }));
    }
    setProcessing(false);
    setShowConfirm(null);
  };

  const getNextAction = (): {
    label: string;
    action: string;
    icon: React.ReactNode;
    color: string;
  } | null => {
    switch (run.status) {
      case 'DRAFT':
        return {
          label: 'Initialize Run',
          action: 'initialize',
          icon: <Play className="w-4 h-4" />,
          color: 'bg-indigo-600 hover:bg-indigo-700',
        };
      case 'INITIALIZED':
        return {
          label: 'Start Calculation',
          action: 'calculate',
          icon: <RefreshCw className="w-4 h-4" />,
          color: 'bg-blue-600 hover:bg-blue-700',
        };
      case 'CALCULATED':
        return {
          label: 'Send for Review',
          action: 'review',
          icon: <Eye className="w-4 h-4" />,
          color: 'bg-yellow-600 hover:bg-yellow-700',
        };
      case 'UNDER_REVIEW':
        return {
          label: 'Approve Payroll',
          action: 'approve',
          icon: <CheckSquare className="w-4 h-4" />,
          color: 'bg-green-600 hover:bg-green-700',
        };
      case 'APPROVED':
        return {
          label: 'Finalize Run',
          action: 'finalize',
          icon: <Lock className="w-4 h-4" />,
          color: 'bg-indigo-700 hover:bg-indigo-800',
        };
      case 'FINALIZED':
        return {
          label: 'Disburse Salaries',
          action: 'disburse',
          icon: <Send className="w-4 h-4" />,
          color: 'bg-emerald-600 hover:bg-emerald-700',
        };
      default:
        return null;
    }
  };

  const nextAction = getNextAction();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payroll Run Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage and monitor payroll processing pipeline
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${activeTab === 'history' ? 'bg-white border-indigo-300 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
            >
              History
            </button>
            <button
              onClick={() => setActiveTab('current')}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${activeTab === 'current' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
            >
              Current Run
            </button>
          </div>
        </div>

        {activeTab === 'current' && (
          <>
            {/* Payroll Pipeline Steps */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-800">
                  Payroll Pipeline — {run.period}
                </h2>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    run.status === 'DISBURSED'
                      ? 'bg-green-100 text-green-700'
                      : run.status === 'FINALIZED'
                        ? 'bg-blue-100 text-blue-700'
                        : run.status === 'CALCULATING'
                          ? 'bg-yellow-100 text-yellow-700'
                          : run.status === 'REVERSED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {run.status}
                </span>
              </div>

              {/* Steps */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2">
                {PAYROLL_STEPS.map((step, i) => {
                  const isCompleted = i < currentStepIdx;
                  const isCurrent = i === currentStepIdx;
                  return (
                    <React.Fragment key={step.id}>
                      <div
                        className={`flex flex-col items-center min-w-[90px] p-2 rounded-lg transition-colors ${
                          isCompleted
                            ? 'bg-green-50'
                            : isCurrent
                              ? 'bg-indigo-50 border border-indigo-200'
                              : 'bg-gray-50'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                            isCompleted
                              ? 'bg-green-500 text-white'
                              : isCurrent
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : isCurrent && processing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <span className="text-xs font-bold">{i + 1}</span>
                          )}
                        </div>
                        <p
                          className={`text-xs font-medium text-center ${isCurrent ? 'text-indigo-700' : isCompleted ? 'text-green-700' : 'text-gray-500'}`}
                        >
                          {step.label}
                        </p>
                      </div>
                      {i < PAYROLL_STEPS.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 min-w-[16px] ${i < currentStepIdx ? 'bg-green-400' : 'bg-gray-200'}`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Calculation Progress */}
              {run.status === 'CALCULATING' && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-yellow-700 font-medium">
                      Calculating payrolls...
                    </span>
                    <span className="text-sm text-yellow-700 font-bold">{progressPct}%</span>
                  </div>
                  <div className="w-full bg-yellow-200 rounded-full h-2">
                    <div
                      className="bg-yellow-600 h-2 rounded-full transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <p className="text-xs text-yellow-600 mt-1">
                    {run.processedCount} / {run.totalEmployees} processed · {run.errorCount} errors
                  </p>
                </div>
              )}

              {/* Errors alert */}
              {run.errorCount > 0 && (
                <div className="mt-3 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {run.errorCount} employee(s) had calculation errors. Review before proceeding.
                </div>
              )}

              {/* Next Action */}
              {nextAction && (
                <div className="mt-4 flex justify-end">
                  {showConfirm === nextAction.action ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Confirm {nextAction.label}?</span>
                      <button
                        onClick={() => setShowConfirm(null)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAction(nextAction.action)}
                        disabled={processing}
                        className={`flex items-center gap-2 px-4 py-1.5 text-white rounded-lg text-sm font-medium ${nextAction.color} disabled:opacity-60 transition-colors`}
                      >
                        {processing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          nextAction.icon
                        )}
                        {processing ? 'Processing...' : 'Confirm'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowConfirm(nextAction.action)}
                      className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium ${nextAction.color} transition-colors`}
                    >
                      {nextAction.icon}
                      {nextAction.label}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: 'Total Gross',
                  value: fmtFull(run.totalGross),
                  icon: <IndianRupee className="w-5 h-5" />,
                  color: 'text-blue-600',
                  bg: 'bg-blue-50',
                },
                {
                  label: 'Total Deductions',
                  value: fmtFull(run.totalDeductions),
                  icon: <TrendingDown className="w-5 h-5" />,
                  color: 'text-red-600',
                  bg: 'bg-red-50',
                },
                {
                  label: 'Net Pay',
                  value: fmtFull(run.totalNetPay),
                  icon: <TrendingUp className="w-5 h-5" />,
                  color: 'text-green-600',
                  bg: 'bg-green-50',
                },
                {
                  label: 'Headcount',
                  value: run.totalEmployees.toString(),
                  icon: <Users className="w-5 h-5" />,
                  color: 'text-indigo-600',
                  bg: 'bg-indigo-50',
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm p-4"
                >
                  <div
                    className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center mb-3 ${stat.color}`}
                  >
                    {stat.icon}
                  </div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-800 mt-0.5">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Variance alert */}
            {isHighVariance && (
              <div
                className={`flex items-start gap-3 p-4 rounded-xl border ${grossVariance > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}
              >
                <AlertTriangle
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${grossVariance > 0 ? 'text-yellow-500' : 'text-red-500'}`}
                />
                <div>
                  <p
                    className={`text-sm font-semibold ${grossVariance > 0 ? 'text-yellow-800' : 'text-red-800'}`}
                  >
                    High Variance Detected: {grossVariancePct > 0 ? '+' : ''}
                    {grossVariancePct.toFixed(1)}% vs last period
                  </p>
                  <p
                    className={`text-xs mt-0.5 ${grossVariance > 0 ? 'text-yellow-600' : 'text-red-600'}`}
                  >
                    Gross payroll changed by {fmtFull(Math.abs(grossVariance))} compared to{' '}
                    {MOCK_CURRENT_RUN.period.replace('02', '01')}. Review before approving.
                  </p>
                </div>
              </div>
            )}

            {/* Department Breakdown */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-800">Department-wise Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">
                        Department
                      </th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500">
                        Headcount
                      </th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500">
                        Gross Pay
                      </th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500">
                        Deductions
                      </th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500">
                        Net Pay
                      </th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500">
                        vs Last Month
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_DEPARTMENTS.map((dept) => {
                      const diff = dept.gross - dept.prevGross;
                      const diffPct = (diff / dept.prevGross) * 100;
                      const isHighDiff = Math.abs(diffPct) > 10;
                      return (
                        <tr
                          key={dept.department}
                          className="border-b border-gray-50 hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 font-medium text-gray-800">{dept.department}</td>
                          <td className="px-4 py-3 text-right text-gray-600">{dept.headcount}</td>
                          <td className="px-4 py-3 text-right text-gray-800">{fmt(dept.gross)}</td>
                          <td className="px-4 py-3 text-right text-red-600">
                            {fmt(dept.deductions)}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-indigo-700">
                            {fmt(dept.netPay)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                isHighDiff && diff > 0
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : isHighDiff && diff < 0
                                    ? 'bg-red-100 text-red-700'
                                    : diff > 0
                                      ? 'bg-green-100 text-green-700'
                                      : diff < 0
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {diff >= 0 ? '+' : ''}
                              {diffPct.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-indigo-50 font-semibold">
                      <td className="px-4 py-3 text-indigo-800">Total</td>
                      <td className="px-4 py-3 text-right text-indigo-800">{run.totalEmployees}</td>
                      <td className="px-4 py-3 text-right text-indigo-800">
                        {fmt(run.totalGross)}
                      </td>
                      <td className="px-4 py-3 text-right text-red-600">
                        {fmt(run.totalDeductions)}
                      </td>
                      <td className="px-4 py-3 text-right text-indigo-800">
                        {fmt(run.totalNetPay)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${grossVariancePct >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                        >
                          {grossVariancePct >= 0 ? '+' : ''}
                          {grossVariancePct.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
              <h2 className="text-sm font-semibold text-gray-800">Payroll Run History</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {MOCK_PAST_RUNS.map((r) => (
                <div key={r.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      r.status === 'DISBURSED'
                        ? 'bg-green-100'
                        : r.status === 'FINALIZED'
                          ? 'bg-blue-100'
                          : 'bg-gray-100'
                    }`}
                  >
                    {r.status === 'DISBURSED' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : r.status === 'FINALIZED' ? (
                      <Lock className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm">Payroll {r.period}</p>
                    <p className="text-xs text-gray-500">
                      {r.totalEmployees} employees · Finalized: {r.finalizedAt ?? '—'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">{fmt(r.totalNetPay)}</p>
                    <p className="text-xs text-gray-500">Net Pay</p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      r.status === 'DISBURSED'
                        ? 'bg-green-100 text-green-700'
                        : r.status === 'FINALIZED'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {r.status}
                  </span>
                  <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
