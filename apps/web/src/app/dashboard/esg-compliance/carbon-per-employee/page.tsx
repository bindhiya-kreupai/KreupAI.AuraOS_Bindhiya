'use client';

import React, { useState, useEffect } from 'react';
import { Leaf, BarChart3, AlertCircle } from 'lucide-react';

export default function CarbonPerEmployeePage() {
  const [form, setForm] = useState({
    periodLabel: 'FY26',
    headcount: '100',
    scope1: '250',
    scope2: '150',
    scope3: '500',
    benchmarkPerFte: '8.0',
  });
  const [verdict, setVerdict] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/v1/esg-compliance/sustainability?action=carbon');
        const data = await res.json();
        if (data.success && data.data?.carbon) {
          const c = data.data.carbon;
          setForm({
            periodLabel: c.periodLabel || 'FY26',
            headcount: String(c.headcount ?? '100'),
            scope1: String(c.scope1 ?? '250'),
            scope2: String(c.scope2 ?? '150'),
            scope3: String(c.scope3 ?? '500'),
            benchmarkPerFte: String(c.benchmarkPerFte ?? '8.0'),
          });
        }
      } catch (err) {
        console.error('Failed to load carbon data', err);
      }
    }
    loadData();
  }, []);

  const calculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setVerdict(null);
    setLoading(true);

    try {
      const res = await fetch('/api/v1/esg-compliance/sustainability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'carbon',
          input: {
            periodLabel: form.periodLabel || undefined,
            headcount: Number(form.headcount),
            scope1: Number(form.scope1),
            scope2: Number(form.scope2),
            scope3: form.scope3 ? Number(form.scope3) : undefined,
            benchmarkPerFte: form.benchmarkPerFte ? Number(form.benchmarkPerFte) : undefined,
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.verdict) {
        setVerdict(data.data.verdict);
      } else {
        setError(data.error?.message || 'Calculation failed');
      }
    } catch (err: any) {
      setError(err.message || 'API error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 text-slate-950 dark:text-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <p className="text-sm uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider">
            EPIC-30 · ESG Sustainability
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Carbon per Employee Evaluator
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Compute corporate carbon intensity (tCO2e per FTE) and benchmark emissions profiles
            across scopes. All calculations are persisted to the database.
          </p>
        </header>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 text-rose-800 dark:text-rose-200 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Calculator Form */}
          <section className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Leaf className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="font-bold text-slate-900 dark:text-white">
                Emissions Intensity Inputs
              </h2>
            </div>
            <form onSubmit={calculate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col text-xs font-bold text-slate-600 dark:text-slate-350 gap-1.5">
                  Reporting Period
                  <input
                    type="text"
                    value={form.periodLabel}
                    onChange={(e) => setForm({ ...form, periodLabel: e.target.value })}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 bg-slate-50 dark:bg-slate-850 text-sm focus:border-slate-500 dark:focus:border-slate-400 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors outline-none"
                    placeholder="e.g. FY26"
                  />
                </label>
                <label className="flex flex-col text-xs font-bold text-slate-600 dark:text-slate-350 gap-1.5">
                  Employee Headcount (FTE) *
                  <input
                    type="number"
                    required
                    value={form.headcount}
                    onChange={(e) => setForm({ ...form, headcount: e.target.value })}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 bg-slate-50 dark:bg-slate-850 text-sm focus:border-slate-500 dark:focus:border-slate-400 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors outline-none"
                  />
                </label>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <label className="flex flex-col text-xs font-bold text-slate-600 dark:text-slate-350 gap-1.5">
                  Scope 1 (tCO2e) *
                  <input
                    type="number"
                    required
                    value={form.scope1}
                    onChange={(e) => setForm({ ...form, scope1: e.target.value })}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 bg-slate-50 dark:bg-slate-850 text-sm focus:border-slate-500 dark:focus:border-slate-400 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors outline-none"
                  />
                </label>
                <label className="flex flex-col text-xs font-bold text-slate-600 dark:text-slate-350 gap-1.5">
                  Scope 2 (tCO2e) *
                  <input
                    type="number"
                    required
                    value={form.scope2}
                    onChange={(e) => setForm({ ...form, scope2: e.target.value })}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 bg-slate-50 dark:bg-slate-850 text-sm focus:border-slate-500 dark:focus:border-slate-400 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors outline-none"
                  />
                </label>
                <label className="flex flex-col text-xs font-bold text-slate-600 dark:text-slate-350 gap-1.5">
                  Scope 3 (tCO2e)
                  <input
                    type="number"
                    value={form.scope3}
                    onChange={(e) => setForm({ ...form, scope3: e.target.value })}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 bg-slate-50 dark:bg-slate-850 text-sm focus:border-slate-500 dark:focus:border-slate-400 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors outline-none"
                  />
                </label>
              </div>

              <label className="flex flex-col text-xs font-bold text-slate-600 dark:text-slate-350 gap-1.5">
                Target Benchmark (tCO2e per FTE)
                <input
                  type="number"
                  step="0.1"
                  value={form.benchmarkPerFte}
                  onChange={(e) => setForm({ ...form, benchmarkPerFte: e.target.value })}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 bg-slate-50 dark:bg-slate-850 text-sm focus:border-slate-500 dark:focus:border-slate-400 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors outline-none"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-semibold py-2.5 text-sm shadow transition-colors cursor-pointer"
              >
                {loading ? 'Evaluating...' : 'Evaluate Carbon Intensity'}
              </button>
            </form>
          </section>

          {/* Results Summary */}
          <section className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                <BarChart3 className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                <h2 className="font-bold text-slate-900 dark:text-white">
                  Intensity Metrics Verdict
                </h2>
              </div>

              {verdict ? (
                <div className="space-y-6">
                  {/* Status Indicator */}
                  <div
                    className={`p-4 rounded-xl border flex flex-col gap-1.5 ${
                      verdict.intensityBand === 'HIGH'
                        ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
                        : verdict.intensityBand === 'LOW'
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-250'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-bold tracking-wider">
                        Verdict Result
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          verdict.intensityBand === 'HIGH'
                            ? 'bg-rose-600 text-white'
                            : verdict.intensityBand === 'LOW'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-600 text-white'
                        }`}
                      >
                        {verdict.intensityBand}{' '}
                        {verdict.intensityBand !== 'NO_BENCHMARK' && 'INTENSITY'}
                      </span>
                    </div>
                    <p className="text-lg font-bold mt-1">
                      {verdict.perEmployeeTco2e} tCO2e per Employee
                    </p>
                    <p className="text-xs opacity-90 mt-1 font-medium">{verdict.reason.en}</p>
                    <p className="text-xs opacity-90 font-medium" dir="rtl">
                      {verdict.reason.ar}
                    </p>
                  </div>

                  {/* Benchmark Comparison */}
                  {verdict.vsBenchmarkPct !== null && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                        <span>Comparison vs. Benchmark Target</span>
                        <span
                          className={
                            verdict.vsBenchmarkPct > 0
                              ? 'text-rose-600 dark:text-rose-455'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }
                        >
                          {verdict.vsBenchmarkPct > 0
                            ? `+${verdict.vsBenchmarkPct}% Above`
                            : `${verdict.vsBenchmarkPct}% Below`}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            verdict.vsBenchmarkPct > 0 ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                          style={{
                            width: `${Math.min(100, Math.max(10, 100 + verdict.vsBenchmarkPct))}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Metrics Breakdown Grid */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg p-3 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500">
                        Total Emissions
                      </span>
                      <p className="text-base font-bold text-slate-800 dark:text-slate-200 mt-1">
                        {verdict.totalEmissionsTco2e} tCO2e
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg p-3 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500">
                        Scope 1 / 2 / 3 Breakdown
                      </span>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1.5">
                        {verdict.scope1Pct}% / {verdict.scope2Pct}% / {verdict.scope3Pct}%
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-450 dark:text-slate-500 text-sm gap-2">
                  <Leaf className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                  <p>Enter data and run the calculator to view evaluation results.</p>
                </div>
              )}
            </div>
            {verdict && (
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-6 text-[10px] text-slate-400 dark:text-slate-555 text-center">
                Calculated on demand in accordance with the Greenhouse Gas (GHG) Protocol.
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
