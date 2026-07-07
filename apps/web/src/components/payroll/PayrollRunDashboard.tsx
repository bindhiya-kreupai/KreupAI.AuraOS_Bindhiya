'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  RefreshCw,
  Lock,
  Users,
  IndianRupee,
  AlertCircle,
  Loader2,
  CheckSquare,
  Plus,
} from 'lucide-react';
import {
  PayrollRunLifecycleService,
  type PayrollRunV1,
} from '../../app/dashboard/payroll/services';
import { useCurrentUser } from '../../lib/auth/AuthProvider';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PayrollStep = 'DRAFT' | 'CALCULATE' | 'APPROVE' | 'FINALIZE';

interface Company {
  id: string;
  code: string;
  name: string;
}

const PAYROLL_STEPS: { id: PayrollStep; label: string; description: string }[] = [
  { id: 'DRAFT', label: 'Draft', description: 'Payroll run initialized for the period' },
  { id: 'CALCULATE', label: 'Calculate', description: 'Process all employee payrolls' },
  { id: 'APPROVE', label: 'Approve', description: 'Manager/HR approves the run' },
  { id: 'FINALIZE', label: 'Finalize', description: 'Lock, mark paid, generate payslips' },
];

function getStepIndex(status: string): number {
  const map: Record<string, number> = {
    DRAFT: 0,
    PROCESSING: 1,
    CALCULATED: 1,
    PENDING_APPROVAL: 1,
    APPROVED: 2,
    PAID: 3,
    DISBURSED: 3,
  };
  return map[status] ?? 0;
}

function num(v: number | string | undefined | null): number {
  if (v == null) return 0;
  return typeof v === 'string' ? Number(v) || 0 : v;
}

function fmtFull(n: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${currency} ${n.toLocaleString()}`;
  }
}

function monthKey(): string {
  return new Date().toISOString().slice(0, 7);
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function PayrollRunDashboard() {
  const { loading: authLoading } = useCurrentUser();

  const [runs, setRuns] = useState<PayrollRunV1[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const loadCompanies = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/companies', { credentials: 'same-origin' });
      if (!res.ok) return;
      const body = await res.json();
      const list: Company[] = body?.data?.data ?? body?.data ?? [];
      setCompanies(Array.isArray(list) ? list : []);
    } catch {
      /* companies remain empty; create is disabled */
    }
  }, []);

  const loadRuns = useCallback(async () => {
    setLoading(true);
    try {
      const list = await PayrollRunLifecycleService.list({ limit: 50 });
      setRuns(list);
      setSelectedRunId((prev) => {
        if (prev && list.some((r) => r.id === prev)) return prev;
        const active = list.find((r) => !['PAID', 'DISBURSED'].includes(r.status));
        return active?.id ?? list[0]?.id ?? null;
      });
    } catch (e) {
      setFeedback({
        type: 'error',
        message: e instanceof Error ? e.message : 'Failed to load payroll runs',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCompanies();
    void loadRuns();
  }, [loadCompanies, loadRuns]);

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(t);
  }, [feedback]);

  const run = useMemo(
    () => runs.find((r) => r.id === selectedRunId) ?? null,
    [runs, selectedRunId]
  );

  const currentStepIdx = run ? getStepIndex(run.status) : 0;

  const handleCreate = useCallback(async () => {
    const company = companies[0];
    if (!company) {
      setFeedback({ type: 'error', message: 'No company available to create a payroll run.' });
      return;
    }
    setProcessing(true);
    try {
      const created = await PayrollRunLifecycleService.create({
        companyId: company.id,
        payrollMonth: monthKey(),
      });
      setFeedback({ type: 'success', message: `Payroll run created for ${created.payrollMonth}.` });
      await loadRuns();
      setSelectedRunId(created.id);
    } catch (e) {
      setFeedback({
        type: 'error',
        message: e instanceof Error ? e.message : 'Failed to create payroll run',
      });
    } finally {
      setProcessing(false);
    }
  }, [companies, loadRuns]);

  const handleAction = useCallback(
    async (action: string) => {
      if (!run) return;
      setProcessing(true);
      try {
        if (action === 'calculate') {
          await PayrollRunLifecycleService.calculate(run.id);
          setFeedback({ type: 'success', message: 'Payroll calculated successfully.' });
        } else if (action === 'approve') {
          await PayrollRunLifecycleService.approve(run.id);
          setFeedback({ type: 'success', message: 'Payroll run approved.' });
        } else if (action === 'finalize') {
          await PayrollRunLifecycleService.finalize(run.id);
          setFeedback({ type: 'success', message: 'Payroll finalized and marked as paid.' });
        }
        await loadRuns();
      } catch (e) {
        setFeedback({
          type: 'error',
          message: e instanceof Error ? e.message : `Failed to ${action} payroll run`,
        });
      } finally {
        setProcessing(false);
        setShowConfirm(null);
      }
    },
    [run, loadRuns]
  );

  const nextAction = useMemo((): {
    label: string;
    action: string;
    icon: React.ReactNode;
    color: string;
  } | null => {
    if (!run) return null;
    switch (run.status) {
      case 'DRAFT':
        return {
          label: 'Start Calculation',
          action: 'calculate',
          icon: <RefreshCw className="w-4 h-4" />,
          color: 'bg-blue-600 hover:bg-blue-700',
        };
      case 'CALCULATED':
      case 'PENDING_APPROVAL':
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
      default:
        return null;
    }
  }, [run]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm text-gray-500 font-medium">Loading payroll runs...</p>
        </div>
      </div>
    );
  }

  const currency = run?.currency ?? 'USD';

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payroll Run Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage and monitor the payroll processing pipeline
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
            <button
              onClick={handleCreate}
              disabled={processing || companies.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              <Plus className="w-4 h-4" /> New Run
            </button>
          </div>
        </div>

        {feedback && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg text-sm ${feedback.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            {feedback.message}
          </div>
        )}

        {activeTab === 'current' && !run && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-10 text-center">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-700">No Active Payroll Run</h3>
            <p className="text-sm text-gray-500 mt-1">
              Create a new run to begin the {monthKey()} payroll pipeline.
            </p>
          </div>
        )}

        {activeTab === 'current' && run && (
          <>
            {/* Payroll Pipeline Steps */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-800">
                  Payroll Pipeline — {run.payrollMonth}
                </h2>
                <span className="text-xs px-3 py-1 rounded-full font-medium bg-gray-100 text-gray-700">
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
                      disabled={processing}
                      className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium ${nextAction.color} transition-colors disabled:opacity-60`}
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
                  value: fmtFull(num(run.totalGrossSalary), currency),
                  icon: <IndianRupee className="w-5 h-5" />,
                  color: 'text-blue-600',
                  bg: 'bg-blue-50',
                },
                {
                  label: 'Total Deductions',
                  value: fmtFull(num(run.totalDeductions), currency),
                  icon: <IndianRupee className="w-5 h-5" />,
                  color: 'text-red-600',
                  bg: 'bg-red-50',
                },
                {
                  label: 'Net Pay',
                  value: fmtFull(num(run.totalNetSalary), currency),
                  icon: <IndianRupee className="w-5 h-5" />,
                  color: 'text-green-600',
                  bg: 'bg-green-50',
                },
                {
                  label: 'Headcount',
                  value: String(run.totalEmployees ?? run._count?.payslips ?? 0),
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
          </>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
              <h2 className="text-sm font-semibold text-gray-800">Payroll Run History</h2>
            </div>
            {runs.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">No payroll runs yet.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {runs.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedRunId(r.id);
                      setActiveTab('current');
                    }}
                    className="w-full text-left flex items-center gap-4 px-5 py-4 hover:bg-gray-50"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        ['PAID', 'DISBURSED'].includes(r.status)
                          ? 'bg-green-100'
                          : r.status === 'APPROVED'
                            ? 'bg-blue-100'
                            : 'bg-gray-100'
                      }`}
                    >
                      {['PAID', 'DISBURSED'].includes(r.status) ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : r.status === 'APPROVED' ? (
                        <Lock className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">Payroll {r.payrollMonth}</p>
                      <p className="text-xs text-gray-500">
                        {r.totalEmployees ?? r._count?.payslips ?? 0} employees · Paid:{' '}
                        {r.paidAt ? new Date(r.paidAt).toLocaleDateString() : '—'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-800">
                        {fmtFull(num(r.totalNetSalary), r.currency)}
                      </p>
                      <p className="text-xs text-gray-500">Net Pay</p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-600">
                      {r.status}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
