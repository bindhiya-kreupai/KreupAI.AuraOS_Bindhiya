'use client';

import React from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  Users,
  BarChart3,
  Clock,
  Loader2,
} from 'lucide-react';
import { useManufacturing } from '@/app/dashboard/manufacturing/hooks/useManufacturing';

export default function ProductionPage() {
  const { productionRuns, oeeMetrics, loading, error } = useManufacturing();

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-6rem)] items-center justify-center text-rose-500 font-bold">
        Error: {error}
      </div>
    );
  }

  // Derived stats
  const latestOEE = oeeMetrics.length > 0 ? oeeMetrics[oeeMetrics.length - 1] : null;
  const currentOEE = latestOEE ? Math.round(latestOEE.overallOEE) : 0;
  const targetOEE = latestOEE ? latestOEE.worldClassOEE : 85;

  const totalOutputToday = productionRuns.reduce((sum, run) => sum + (run.actualQuantity || 0), 0);
  const totalDowntime = productionRuns.reduce((sum, run) => {
    return sum + run.downtimeEvents.reduce((dSum, event) => dSum + (event.duration || 0), 0);
  }, 0);

  const avgLaborCost = 0.45; // Placeholder as labor cost isn't directly in the types yet

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-sky-500" />
            Production & Efficiency
          </h1>
          <p className="text-slate-500 text-sm">Real-time OEE, labor costs, and output tracking.</p>
        </div>
        <div
          className={`px-4 py-2 rounded-xl text-sm font-bold border ${
            currentOEE >= targetOEE
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/30'
              : 'bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 border-sky-100 dark:border-sky-800/30'
          }`}
        >
          Overall OEE: {currentOEE}% (Target: {targetOEE}%)
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-500">Output Today</span>
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {totalOutputToday.toLocaleString()}{' '}
            <span className="text-sm font-normal text-slate-400">units</span>
          </div>
          <div className="text-xs text-emerald-500 font-bold flex items-center mt-1">
            <TrendingUp className="w-3 h-3 mr-1" /> +5% vs avg
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-500">Downtime</span>
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {totalDowntime} <span className="text-sm font-normal text-slate-400">mins</span>
          </div>
          <div className="text-xs text-rose-500 font-bold flex items-center mt-1">
            <TrendingUp className="w-3 h-3 mr-1" /> +12% vs avg
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-500">Labor Cost</span>
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            ${avgLaborCost} <span className="text-sm font-normal text-slate-400">/ unit</span>
          </div>
          <div className="text-xs text-emerald-500 font-bold flex items-center mt-1">
            <TrendingDown className="w-3 h-3 mr-1" /> -2% vs avg
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-500">Utilization</span>
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {latestOEE ? latestOEE.performanceMetrics.performanceRate : 0}%{' '}
            <span className="text-sm font-normal text-slate-400">avg</span>
          </div>
          <div className="text-xs text-slate-400 font-bold flex items-center mt-1">
            {latestOEE?.trend || 'Stable'}
          </div>
        </div>
      </div>

      {/* Productivity Heatmap Mock - Enhanced with derived data */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex-1 overflow-y-auto">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500" /> Productivity Heatmap (Last 24h)
        </h3>

        <div className="grid grid-cols-12 gap-1 h-32 pr-2">
          {Array.from({ length: 24 }).map((_, i) => {
            // Mocking productivity based on hour for visualization
            const productive = [8, 9, 10, 11, 14, 15, 16, 17].includes(i);
            const moderate = [7, 12, 13, 18, 19].includes(i);

            const bg = productive
              ? 'bg-emerald-500'
              : moderate
                ? 'bg-indigo-400'
                : 'bg-slate-200 dark:bg-slate-800';
            const h = productive ? 'h-full' : moderate ? 'h-2/3' : 'h-1/3';

            return (
              <div key={i} className="flex flex-col justify-end items-center group relative">
                <div
                  className={`w-full ${h} ${bg} rounded-t-sm opacity-80 hover:opacity-100 transition-opacity`}
                ></div>
                <span className="text-[10px] text-slate-400 mt-2">{i}:00</span>
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs p-2 rounded whitespace-nowrap z-10 shadow-lg">
                  <div className="font-bold">Hour {i}:00</div>
                  <div>Status: {productive ? 'Optimized' : moderate ? 'Normal' : 'Low Shift'}</div>
                  <div>Efficiency: {productive ? '98%' : moderate ? '85%' : '45%'}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span className="w-3 h-3 bg-emerald-500 rounded-sm"></span> High Output
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span className="w-3 h-3 bg-indigo-400 rounded-sm"></span> Moderate
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span className="w-3 h-3 bg-slate-200 dark:bg-slate-800 rounded-sm"></span> Low / Shift
            Change
          </div>
        </div>
      </div>
    </div>
  );
}

