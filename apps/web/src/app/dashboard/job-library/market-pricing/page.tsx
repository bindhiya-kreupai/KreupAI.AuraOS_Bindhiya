'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, TrendingUp, Loader2, X } from 'lucide-react';
import { MarketPricingService } from '../services';
import type { MarketPricingBoard, MarketPricingRow, CompensationStrategy } from '../types';

const TREND_LABELS: Record<string, string> = {
  high_demand: 'High Demand',
  stable: 'Stable',
  declining: 'Declining',
};

const EMPTY_BOARD: MarketPricingBoard = {
  items: [],
  strategy: null,
  filters: { regions: [], industries: [] },
};

function fmtCurrency(value: number | null, currency: string): string {
  if (value == null) return '-';
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function MarketPricingPage() {
  const [board, setBoard] = useState<MarketPricingBoard>(EMPTY_BOARD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [region, setRegion] = useState('');

  const [strategyOpen, setStrategyOpen] = useState(false);
  const [percentile, setPercentile] = useState('50');
  const [scope, setScope] = useState('All roles');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await MarketPricingService.board(region ? { region } : undefined);
      setBoard(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load market pricing');
    } finally {
      setLoading(false);
    }
  }, [region]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 3000);
    return () => clearTimeout(t);
  }, [notice]);

  const openStrategy = (strategy: CompensationStrategy | null) => {
    setPercentile(String(strategy?.targetPercentile ?? 50));
    setScope(strategy?.scope ?? 'All roles');
    setFormError(null);
    setStrategyOpen(true);
  };

  const saveStrategy = async () => {
    const p = Number(percentile);
    if (Number.isNaN(p) || p < 1 || p > 100) {
      setFormError('Target percentile must be between 1 and 100');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await MarketPricingService.setStrategy({ targetPercentile: p, scope: scope.trim() });
      setNotice('Compensation strategy updated');
      setStrategyOpen(false);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to update strategy');
    } finally {
      setSaving(false);
    }
  };

  const regionOptions = ['', ...board.filters.regions];

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-500" />
            Market Pricing
          </h1>
          <p className="text-slate-500 text-sm">
            Benchmark and analyze compensation against market data.
          </p>
        </div>
      </div>

      {notice && (
        <div className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-sm shrink-0">
          {notice}
        </div>
      )}
      {error && (
        <div className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm shrink-0">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-3 flex gap-3 overflow-x-auto pb-2">
            {regionOptions.map((r) => (
              <button
                key={r || 'all'}
                onClick={() => setRegion(r)}
                className={`px-4 py-2 bg-white dark:bg-slate-900 border rounded-full text-sm font-bold shadow-sm whitespace-nowrap ${
                  region === r
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-slate-200 dark:border-slate-800 hover:border-indigo-500'
                }`}
              >
                Region: {r || 'All'}
              </button>
            ))}
          </div>

          {board.items.length === 0 ? (
            <div className="lg:col-span-3 flex flex-col items-center justify-center py-16 text-slate-400">
              <DollarSign className="w-12 h-12 opacity-20 mb-3" />
              <span className="font-bold">No market benchmarks found</span>
            </div>
          ) : (
            board.items.map((role: MarketPricingRow) => {
              const positive = role.diffPercent != null && role.diffPercent >= 0;
              return (
                <div
                  key={role.id}
                  className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg w-2/3">
                      {role.jobTitle}
                      {role.gradeLabel ? ` (${role.gradeLabel})` : ''}
                    </h3>
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold text-slate-500">
                      {TREND_LABELS[role.marketTrend] || role.marketTrend}
                    </span>
                  </div>

                  <div className="relative h-2 bg-slate-200 dark:bg-slate-800 rounded-full mt-6 mb-2">
                    <div className="absolute left-[20%] right-[20%] top-0 bottom-0 bg-emerald-200 dark:bg-emerald-900/30 rounded-full"></div>
                    <div
                      className="absolute top-[-4px] w-4 h-4 rounded-full bg-indigo-600 border-2 border-white dark:border-slate-900"
                      style={{ left: '48%' }}
                      title="Internal Median"
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 font-mono mb-4">
                    <span>{fmtCurrency(role.marketMin, role.currency)}</span>
                    <span className="font-bold text-emerald-600">
                      Market Mid: {fmtCurrency(role.marketMid, role.currency)}
                    </span>
                    <span>{fmtCurrency(role.marketMax, role.currency)}</span>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="text-xs text-slate-500">Internal Median</div>
                      <div className="font-bold">
                        {fmtCurrency(role.internalMedian, role.currency)}
                      </div>
                    </div>
                    <div
                      className={`text-right ${positive ? 'text-emerald-600' : 'text-rose-600'}`}
                    >
                      <div className="text-xs font-bold flex items-center justify-end gap-1">
                        <TrendingUp className={`w-3 h-3 ${positive ? '' : 'rotate-180'}`} />
                        {role.diffPercent == null
                          ? 'n/a'
                          : `${positive ? '+' : ''}${role.diffPercent}%`}
                      </div>
                      <div className="text-[10px] text-slate-400">vs Market</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Compensation Strategy</h3>
              <p className="text-slate-500 text-sm">
                {board.strategy
                  ? `We target the ${board.strategy.targetPercentile}th percentile of the market for ${board.strategy.scope}.`
                  : 'No compensation strategy has been configured yet.'}
              </p>
            </div>
            <button
              onClick={() => openStrategy(board.strategy)}
              className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90"
            >
              Adjust Strategy
            </button>
          </div>
        </div>
      )}

      {strategyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Adjust Compensation Strategy</h2>
              <button
                onClick={() => setStrategyOpen(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="px-3 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm">
                {formError}
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-500">Target Percentile</label>
              <input
                type="number"
                min={1}
                max={100}
                value={percentile}
                onChange={(e) => setPercentile(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500">Scope</label>
              <input
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                placeholder="e.g. Technology roles"
                className="mt-1 w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setStrategyOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold"
              >
                Cancel
              </button>
              <button
                onClick={saveStrategy}
                disabled={saving}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-60"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Strategy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
