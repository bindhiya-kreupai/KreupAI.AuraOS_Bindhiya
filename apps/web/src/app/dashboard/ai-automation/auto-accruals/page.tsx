'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Calculator, CheckCircle2, AlertCircle, RotateCcw, Play, Loader2 } from 'lucide-react';
import { APIClient } from '@/lib/api-client';

interface AccrualRecord {
  id?: string;
  employeeId: string;
  policyId: string;
  leaveYear: number;
  accrualMonth?: number | null;
  accrualDate: string;
  accruedDays: number;
  proRataFactor?: number | null;
  calculationNote?: string | null;
}

interface AccrualSummary {
  totalAccrued: number;
  totalEmployees: number;
  totalRecords: number;
}

interface RunResult {
  runId: string;
  processDate: string;
  processedCount: number;
  totalAccrued: number;
  policiesProcessed: number;
}

interface Feedback {
  type: 'success' | 'error';
  message: string;
}

export default function AutoAccrualsPage() {
  const [accruals, setAccruals] = useState<AccrualRecord[]>([]);
  const [summary, setSummary] = useState<AccrualSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const year = new Date().getFullYear();

  const fetchAccruals = useCallback(async () => {
    try {
      setLoading(true);
      const response = await APIClient.get<{
        data?: { accruals?: AccrualRecord[]; summary?: AccrualSummary };
      }>(`/leave/accrual?year=${year}`);
      const data = response?.data;
      setAccruals(data?.accruals ?? []);
      setSummary(data?.summary ?? null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load accrual history';
      setFeedback({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetchAccruals();
  }, [fetchAccruals]);

  const handleRunCycle = async () => {
    setRunning(true);
    setFeedback(null);
    try {
      const response = await APIClient.post<{ data?: RunResult }>('/leave/accrual', {
        processDate: new Date().toISOString(),
      });
      const result = response?.data;
      const processed = result?.processedCount ?? 0;
      const days = result?.totalAccrued ?? 0;
      setFeedback({
        type: 'success',
        message: `Accrual cycle complete: ${processed} balance(s) updated, ${days} day(s) accrued.`,
      });
      await fetchAccruals();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to run accrual cycle';
      setFeedback({ type: 'error', message });
    } finally {
      setRunning(false);
    }
  };

  const handleReset = () => {
    setFeedback(null);
    fetchAccruals();
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <Calculator className="w-6 h-6 text-indigo-500" />
            Auto Accruals Engine
          </h1>
          <p className="text-silver-mist text-sm mt-1">
            Automated leave calculation and balance projection.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            disabled={loading || running}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={handleRunCycle}
            disabled={running || loading}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {running ? 'Processing...' : 'Run Cycle'}
          </button>
        </div>
      </div>

      {feedback && (
        <div
          role="alert"
          className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          {feedback.message}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <SummaryCard
          label="Total Accrued Days"
          value={summary ? summary.totalAccrued.toFixed(2) : '0.00'}
          loading={loading}
        />
        <SummaryCard
          label="Employees Processed"
          value={summary ? String(summary.totalEmployees) : '0'}
          loading={loading}
        />
        <SummaryCard
          label="Accrual Records"
          value={summary ? String(summary.totalRecords) : '0'}
          loading={loading}
        />
      </div>

      {/* Accrual history */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-cloud dark:border-nebula-purple/50">
          <h2 className="text-lg font-bold text-ink-black dark:text-pearl">
            Accrual History ({year})
          </h2>
          <p className="text-xs text-silver-mist">
            Records generated by the accrual engine for the current leave year.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase text-silver-mist font-bold">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Policy</th>
                <th className="px-6 py-4 text-center">Month</th>
                <th className="px-6 py-4 text-right text-emerald-600">Accrued Days</th>
                <th className="px-6 py-4 text-right">Pro-Rata</th>
                <th className="px-6 py-4">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cloud dark:divide-nebula-purple/20">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-silver-mist">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading accrual history...
                    </span>
                  </td>
                </tr>
              ) : accruals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-silver-mist">
                    No accrual records for {year}. Run a cycle to generate accruals.
                  </td>
                </tr>
              ) : (
                accruals.map((row, i) => (
                  <tr
                    key={row.id || i}
                    className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-ink-black dark:text-pearl">
                      {row.employeeId}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-mono text-xs">
                      {row.policyId}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600">
                      {row.accrualMonth ?? '—'}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-emerald-600 font-bold">
                      +{Number(row.accruedDays).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-600">
                      {row.proRataFactor != null ? Number(row.proRataFactor).toFixed(2) : '1.00'}
                    </td>
                    <td className="px-6 py-4 text-xs text-silver-mist">
                      {row.calculationNote || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  loading,
}: {
  label: string;
  value: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
      <p className="text-xs font-bold text-silver-mist uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-black text-ink-black dark:text-pearl mt-2">
        {loading ? <Loader2 className="w-6 h-6 animate-spin text-indigo-500" /> : value}
      </p>
    </div>
  );
}
