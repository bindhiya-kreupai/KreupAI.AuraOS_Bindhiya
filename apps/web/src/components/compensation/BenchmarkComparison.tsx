"use client";

import React from "react";
import { BarChart3, TrendingUp, Target, MapPin } from "lucide-react";

interface BenchmarkData {
  id: string;
  employeeName: string;
  jobTitle: string;
  currentSalary: number;
  percentile25: number;
  percentile50: number;
  percentile75: number;
  marketSource: string;
  location: string;
}

const mockBenchmarks: BenchmarkData[] = [
  {
    id: "1",
    employeeName: "Sarah Chen",
    jobTitle: "Senior Software Engineer",
    currentSalary: 158000,
    percentile25: 135000,
    percentile50: 155000,
    percentile75: 180000,
    marketSource: "Radford 2025",
    location: "San Francisco, CA",
  },
  {
    id: "2",
    employeeName: "James Wilson",
    jobTitle: "Software Engineer II",
    currentSalary: 120000,
    percentile25: 110000,
    percentile50: 128000,
    percentile75: 148000,
    marketSource: "Radford 2025",
    location: "Austin, TX",
  },
  {
    id: "3",
    employeeName: "Maria Garcia",
    jobTitle: "Engineering Manager",
    currentSalary: 185000,
    percentile25: 170000,
    percentile50: 195000,
    percentile75: 225000,
    marketSource: "Mercer 2025",
    location: "New York, NY",
  },
  {
    id: "4",
    employeeName: "David Kim",
    jobTitle: "Product Designer",
    currentSalary: 135000,
    percentile25: 115000,
    percentile50: 130000,
    percentile75: 150000,
    marketSource: "Radford 2025",
    location: "Seattle, WA",
  },
];

export function BenchmarkComparison() {
  const getPositionPercent = (salary: number, p25: number, p75: number) => {
    const range = p75 - p25;
    if (range === 0) return 50;
    const position = ((salary - p25) / range) * 100;
    return Math.max(0, Math.min(100, position));
  };

  const getPercentileLabel = (salary: number, p25: number, p50: number, p75: number) => {
    if (salary < p25) return "Below 25th";
    if (salary < p50) return "25th - 50th";
    if (salary < p75) return "50th - 75th";
    return "Above 75th";
  };

  const avgCompaRatio =
    mockBenchmarks.reduce((s, b) => s + b.currentSalary / b.percentile50, 0) / mockBenchmarks.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">Benchmark Comparison</h2>
        <p className="text-sm text-silver-mist mt-1">
          Compare employee compensation against market percentiles.
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
            <span className="text-xs text-silver-mist uppercase font-medium">Above Market</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">
            {mockBenchmarks.filter((b) => b.currentSalary > b.percentile50).length}
          </p>
          <p className="text-xs text-silver-mist">of {mockBenchmarks.length} employees</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist uppercase font-medium">Below Market</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">
            {mockBenchmarks.filter((b) => b.currentSalary < b.percentile50).length}
          </p>
          <p className="text-xs text-silver-mist">of {mockBenchmarks.length} employees</p>
        </div>
      </div>

      {/* Benchmark Cards */}
      <div className="space-y-4">
        {mockBenchmarks.map((benchmark) => {
          const position = getPositionPercent(
            benchmark.currentSalary,
            benchmark.percentile25,
            benchmark.percentile75
          );
          const percentileLabel = getPercentileLabel(
            benchmark.currentSalary,
            benchmark.percentile25,
            benchmark.percentile50,
            benchmark.percentile75
          );
          const compaRatio = (benchmark.currentSalary / benchmark.percentile50).toFixed(2);

          return (
            <div
              key={benchmark.id}
              className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">
                    {benchmark.employeeName}
                  </h3>
                  <p className="text-xs text-silver-mist">{benchmark.jobTitle}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-silver-mist" />
                    <span className="text-xs text-silver-mist">{benchmark.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-ink-black dark:text-pearl">
                    ${benchmark.currentSalary.toLocaleString()}
                  </p>
                  <p className="text-xs text-silver-mist">Compa-ratio: {compaRatio}</p>
                </div>
              </div>

              {/* Visual Range Indicator */}
              <div className="space-y-2">
                <div className="relative h-8 flex items-center">
                  {/* Background bar */}
                  <div className="absolute inset-x-0 h-3 rounded-full bg-slate-50 dark:bg-deep-cosmos" />

                  {/* Percentile range (25th-75th) */}
                  <div className="absolute h-3 rounded-full bg-celestial-indigo/20" style={{ left: "0%", right: "0%" }} />

                  {/* 50th percentile marker */}
                  <div
                    className="absolute h-5 w-0.5 bg-celestial-indigo/60"
                    style={{ left: "50%" }}
                  />

                  {/* Employee position indicator */}
                  <div
                    className="absolute w-4 h-4 rounded-full bg-celestial-indigo border-2 border-white dark:border-stellar-blue shadow-sm transform -translate-x-1/2"
                    style={{ left: `${position}%` }}
                  />
                </div>

                {/* Labels */}
                <div className="flex justify-between text-xs">
                  <div className="text-silver-mist">
                    <span className="block font-medium">25th</span>
                    <span>${(benchmark.percentile25 / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="text-center text-silver-mist">
                    <span className="block font-medium">50th</span>
                    <span>${(benchmark.percentile50 / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="text-right text-silver-mist">
                    <span className="block font-medium">75th</span>
                    <span>${(benchmark.percentile75 / 1000).toFixed(0)}K</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-50 dark:bg-deep-cosmos text-celestial-indigo font-medium">
                    {percentileLabel}
                  </span>
                  <span className="text-xs text-silver-mist">Source: {benchmark.marketSource}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
