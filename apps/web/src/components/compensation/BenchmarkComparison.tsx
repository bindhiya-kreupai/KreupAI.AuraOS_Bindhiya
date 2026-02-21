"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Target, MapPin } from "lucide-react";

interface BenchmarkData {
  department: string;
  headcount: number;
  avgSalary: number;
  median: number;
  min: number;
  max: number;
}

interface MarketComparison {
  overallPosition: string;
  dataSource: string;
}

interface PayEquity {
  compRatio: {
    average: number;
    belowRange: number;
    withinRange: number;
    aboveRange: number;
  };
}

export function BenchmarkComparison() {
  const [departments, setDepartments] = useState<BenchmarkData[]>([]);
  const [marketComparison, setMarketComparison] = useState<MarketComparison | null>(null);
  const [payEquity, setPayEquity] = useState<PayEquity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/analytics/compensation/')
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data) {
          setDepartments(result.data.byDepartment || []);
          setMarketComparison(result.data.marketComparison || null);
          setPayEquity(result.data.payEquity || null);
        } else {
          setError('Failed to load benchmark data');
        }
      })
      .catch((err) => {
        console.error('BenchmarkComparison fetch error:', err);
        setError('Failed to load benchmark data');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4 h-24" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5 h-40" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-300">
        {error}
      </div>
    );
  }

  const getPositionPercent = (salary: number, min: number, max: number) => {
    const range = max - min;
    if (range === 0) return 50;
    const position = ((salary - min) / range) * 100;
    return Math.max(0, Math.min(100, position));
  };

  const overallAvgSalary = departments.length > 0
    ? Math.round(departments.reduce((s, d) => s + d.avgSalary * d.headcount, 0) / departments.reduce((s, d) => s + d.headcount, 0))
    : 0;
  const overallMedian = departments.length > 0
    ? Math.round(departments.reduce((s, d) => s + d.median * d.headcount, 0) / departments.reduce((s, d) => s + d.headcount, 0))
    : 0;

  const avgCompaRatio = payEquity?.compRatio?.average ?? (overallMedian > 0 ? Math.round((overallAvgSalary / overallMedian) * 100) / 100 : 0);
  const aboveMarket = departments.filter(d => d.avgSalary > d.median).length;
  const belowMarket = departments.filter(d => d.avgSalary < d.median).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">Benchmark Comparison</h2>
        <p className="text-sm text-silver-mist mt-1">
          Compare department compensation against internal benchmarks.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist uppercase font-medium">Avg Compa-Ratio</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">{avgCompaRatio.toFixed(2)}</p>
          <p className="text-xs text-silver-mist">Target: 1.00</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist uppercase font-medium">Above Median</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">{aboveMarket}</p>
          <p className="text-xs text-silver-mist">of {departments.length} departments</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist uppercase font-medium">Below Median</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">{belowMarket}</p>
          <p className="text-xs text-silver-mist">of {departments.length} departments</p>
        </div>
      </div>

      {/* Benchmark Cards */}
      <div className="space-y-4">
        {departments.map((dept) => {
          const position = getPositionPercent(dept.avgSalary, dept.min, dept.max);
          const compaRatio = dept.median > 0 ? (dept.avgSalary / dept.median).toFixed(2) : 'N/A';
          const percentileLabel = dept.avgSalary < dept.median ? 'Below Median' : 'Above Median';

          return (
            <div
              key={dept.department}
              className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">
                    {dept.department}
                  </h3>
                  <p className="text-xs text-silver-mist">{dept.headcount} employees</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-ink-black dark:text-pearl">
                    ${dept.avgSalary.toLocaleString()}
                  </p>
                  <p className="text-xs text-silver-mist">Compa-ratio: {compaRatio}</p>
                </div>
              </div>

              {/* Visual Range Indicator */}
              <div className="space-y-2">
                <div className="relative h-8 flex items-center">
                  {/* Background bar */}
                  <div className="absolute inset-x-0 h-3 rounded-full bg-slate-50 dark:bg-deep-cosmos" />

                  {/* Percentile range */}
                  <div className="absolute h-3 rounded-full bg-celestial-indigo/20" style={{ left: "0%", right: "0%" }} />

                  {/* Median marker */}
                  <div
                    className="absolute h-5 w-0.5 bg-celestial-indigo/60"
                    style={{ left: `${dept.max > dept.min ? ((dept.median - dept.min) / (dept.max - dept.min)) * 100 : 50}%` }}
                  />

                  {/* Position indicator */}
                  <div
                    className="absolute w-4 h-4 rounded-full bg-celestial-indigo border-2 border-white dark:border-stellar-blue shadow-sm transform -translate-x-1/2"
                    style={{ left: `${position}%` }}
                  />
                </div>

                {/* Labels */}
                <div className="flex justify-between text-xs">
                  <div className="text-silver-mist">
                    <span className="block font-medium">Min</span>
                    <span>${(dept.min / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="text-center text-silver-mist">
                    <span className="block font-medium">Median</span>
                    <span>${(dept.median / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="text-right text-silver-mist">
                    <span className="block font-medium">Max</span>
                    <span>${(dept.max / 1000).toFixed(0)}K</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-50 dark:bg-deep-cosmos text-celestial-indigo font-medium">
                    {percentileLabel}
                  </span>
                  <span className="text-xs text-silver-mist">Source: {marketComparison?.dataSource ?? 'Internal Data'}</span>
                </div>
              </div>
            </div>
          );
        })}
        {departments.length === 0 && (
          <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-8 text-center text-sm text-silver-mist">
            No benchmark data available
          </div>
        )}
      </div>
    </div>
  );
}
