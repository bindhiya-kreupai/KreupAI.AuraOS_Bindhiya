'use client';

import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Info,
  RotateCcw,
  Play,
} from 'lucide-react';
import { autoAccruals } from '@/lib/services/ai-automation-client';

export default function AutoAccrualsPage() {
  const [rules, setRules] = useState<Array<{ id: string | number; name: string; logic: string }>>(
    []
  );
  const [projections, setProjections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAccruals();
  }, []);

  const fetchAccruals = async () => {
    const result = await autoAccruals.getRulesAndProjections();
    if (result.success && result.data) {
      const data = result.data as {
        rules?: Array<{ id: string | number; name: string; logic: string }>;
        projections?: any[];
      };
      setRules(data.rules || []);
      setProjections(data.projections || []);
    }
  };

  const handleRunCycle = async () => {
    setLoading(true);
    setMessage('');
    try {
      const preview = await autoAccruals.dryRun();
      if (preview.success && preview.data) {
        const data = preview.data as {
          rules?: Array<{ id: string | number; name: string; logic: string }>;
          projections?: any[];
        };
        setRules(data.rules || []);
        setProjections(data.projections || []);
        setMessage('Dry-run preview updated from leave accrual records.');
      } else {
        setMessage(preview.error || 'Dry-run failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCommitCycle = async () => {
    setLoading(true);
    setMessage('');
    try {
      const result = await autoAccruals.commitCycle();
      setMessage(result.success ? 'Commit cycle recorded.' : result.error || 'Commit failed');
      await fetchAccruals();
    } finally {
      setLoading(false);
    }
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
          {message && (
            <p className="text-xs text-indigo-600 dark:text-indigo-300 mt-1">{message}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button
            onClick={handleRunCycle}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" /> {loading ? 'Processing...' : 'Run Cycle'}
          </button>
          <button
            onClick={handleCommitCycle}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" /> Commit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* 1. Active Rules */}
        <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <h2 className="text-lg font-bold text-ink-black dark:text-pearl mb-4">
            Active Logic Rules
          </h2>
          <div className="space-y-3">
            {!rules.length && (
              <p className="text-sm text-silver-mist">No accrual rules loaded yet.</p>
            )}
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-lg"
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    {rule.name}
                  </h4>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <code className="text-xs text-indigo-600 dark:text-indigo-400 font-mono bg-indigo-50 dark:bg-indigo-900/20 px-1.5 py-0.5 rounded">
                  {rule.logic}
                </code>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 border-2 border-dashed border-slate-200 text-slate-500 text-xs font-bold rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition-colors">
            + Add New Rule
          </button>
        </div>

        {/* 2. Simulation Results */}
        <div className="lg:col-span-2 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-cloud dark:border-nebula-purple/50 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-ink-black dark:text-pearl">
                Projected Balances (Next Cycle)
              </h2>
              <p className="text-xs text-silver-mist">
                Preview of calculation results before committing.
              </p>
            </div>
            <div className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              {projections.filter((p) => p.status === 'Warning').length} warnings
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase text-silver-mist font-bold">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Leave Type</th>
                  <th className="px-6 py-4 text-right">Current</th>
                  <th className="px-6 py-4 text-right text-emerald-600">+ Accrued</th>
                  <th className="px-6 py-4 text-right">Projected</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud dark:divide-nebula-purple/20">
                {!projections.length && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-silver-mist">
                      No leave accrual rows found for this tenant. Run a dry-cycle after accruals
                      exist.
                    </td>
                  </tr>
                )}
                {projections.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-ink-black dark:text-pearl">
                      {row.employeeName || row.name || row.employeeId}
                      <div className="text-[10px] text-silver-mist">{row.employeeId || row.id}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {row.leaveType || row.type}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-600">
                      {Number(row.current || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-emerald-600 font-bold">
                      +{Number(row.accrued || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-ink-black font-bold">
                      {Number(row.projected || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 flex justify-center">
                      {row.status === 'Normal' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                          OK
                        </span>
                      )}
                      {row.status === 'Warning' && (
                        <div className="group relative">
                          <span className="cursor-help inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                            Warning <Info className="w-3 h-3" />
                          </span>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-slate-800 text-white text-[10px] rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 text-center">
                            {row.reason}
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
