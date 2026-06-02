'use client';

import React, { useState, useEffect } from 'react';
import { Zap, Calendar, ArrowRight, Play, Loader2 } from 'lucide-react';
import { PayrollRunService } from '../services';
import type { PayrollRun } from '../types';

export default function OffCyclePaymentsPage() {
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await PayrollRunService.getPayrollRuns();
      setPayrollRuns(result);
    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Off-cycle payments could be represented as cancelled/special payroll runs
  const completedRuns = payrollRuns.filter((r) => r.status === 'disbursed');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm text-slate-500 font-medium">Loading off-cycle payment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-500" />
            Off-cycle Payments
          </h1>
          <p className="text-slate-500 text-sm">
            Process ad-hoc payments outside the regular payroll schedule.
          </p>
        </div>
        <button
          onClick={() => {
            const reason = prompt('Reason for off-cycle run (e.g. "Bonus payout", "Correction"):');
            if (!reason?.trim()) return;
            const payDate = prompt('Pay date (YYYY-MM-DD):', new Date().toISOString().slice(0, 10));
            if (!payDate?.trim()) return;
            alert(
              `Off-cycle run "${reason}" scheduled for ${payDate}. Backend /api/payroll/off-cycle POST will trigger the actual calculation.`
            );
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2"
        >
          <Play className="w-4 h-4" /> Start New Run
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h3 className="font-bold text-lg mb-4">Run History</h3>
        {completedRuns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Zap className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">
              No Off-Cycle Payments
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              No ad-hoc payment runs have been processed yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {completedRuns.map((run) => (
              <div
                key={run.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/20 text-amber-600 rounded-lg group-hover:bg-white transition-colors">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold">{run.monthName}</h4>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <Calendar className="w-3 h-3" />{' '}
                      {run.disbursedAt ? new Date(run.disbursedAt).toLocaleDateString() : 'N/A'} -{' '}
                      {run.totalEmployees} Payees
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-4 md:mt-0">
                  <div className="font-mono font-bold text-lg">
                    ${run.totalNetPay.toLocaleString()}
                  </div>
                  <div className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-bold capitalize">
                    {run.status}
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
