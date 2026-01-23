"use client";

import React, { useState } from "react";
import {
  BarChart2,
  MapPin,
  TrendingUp,
  Info,
  ChevronDown,
  Globe,
  Briefcase,
} from "lucide-react";

interface SalaryRange {
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

interface GeographicAdjustment {
  location: string;
  factor: number;
  adjustedSalary: number;
}

interface BenchmarkData {
  role: string;
  level: string;
  currentSalary: number;
  percentile: number;
  marketRange: SalaryRange;
  industry: string;
  companySize: string;
  geographicAdjustments: GeographicAdjustment[];
  lastUpdated: string;
  dataSource: string;
  sampleSize: number;
}

const mockBenchmark: BenchmarkData = {
  role: "Senior Software Engineer",
  level: "L5",
  currentSalary: 165000,
  percentile: 62,
  marketRange: {
    p25: 140000,
    p50: 158000,
    p75: 182000,
    p90: 210000,
  },
  industry: "Technology",
  companySize: "1000-5000 employees",
  geographicAdjustments: [
    { location: "San Francisco, CA", factor: 1.25, adjustedSalary: 206250 },
    { location: "New York, NY", factor: 1.18, adjustedSalary: 194700 },
    { location: "Austin, TX", factor: 1.0, adjustedSalary: 165000 },
    { location: "Denver, CO", factor: 0.95, adjustedSalary: 156750 },
    { location: "Remote (US Avg)", factor: 0.92, adjustedSalary: 151800 },
  ],
  lastUpdated: "January 2026",
  dataSource: "Market Survey 2026",
  sampleSize: 2847,
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

export default function SalaryBenchmarking() {
  const [data] = useState<BenchmarkData>(mockBenchmark);
  const [showGeoDetails, setShowGeoDetails] = useState(false);

  const rangeMin = data.marketRange.p25;
  const rangeMax = data.marketRange.p90;
  const rangeSpan = rangeMax - rangeMin;

  const getPositionPercent = (value: number) =>
    Math.max(0, Math.min(100, ((value - rangeMin) / rangeSpan) * 100));

  const percentileColor = (p: number) => {
    if (p >= 75) return "text-aurora-green";
    if (p >= 50) return "text-celestial-indigo";
    if (p >= 25) return "text-yellow-600";
    return "text-red-500";
  };

  return (
    <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <BarChart2 className="w-6 h-6 text-celestial-indigo" />
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">
            Salary Benchmarking
          </h1>
        </div>
        <p className="text-silver-mist mb-6">
          See how your compensation compares to market data
        </p>

        {/* Role Context */}
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-silver-mist mb-1">Role</p>
              <p className="text-sm font-medium text-ink-black dark:text-pearl">{data.role}</p>
            </div>
            <div>
              <p className="text-xs text-silver-mist mb-1">Level</p>
              <p className="text-sm font-medium text-ink-black dark:text-pearl">{data.level}</p>
            </div>
            <div>
              <p className="text-xs text-silver-mist mb-1">Industry</p>
              <p className="text-sm font-medium text-ink-black dark:text-pearl flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                {data.industry}
              </p>
            </div>
            <div>
              <p className="text-xs text-silver-mist mb-1">Company Size</p>
              <p className="text-sm font-medium text-ink-black dark:text-pearl">{data.companySize}</p>
            </div>
          </div>
        </div>

        {/* Market Position */}
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-ink-black dark:text-pearl">
              Your Market Position
            </h2>
            <div className="flex items-center gap-2">
              <TrendingUp className={`w-4 h-4 ${percentileColor(data.percentile)}`} />
              <span className={`text-lg font-bold ${percentileColor(data.percentile)}`}>
                {data.percentile}th percentile
              </span>
            </div>
          </div>

          {/* Current Salary */}
          <div className="text-center mb-6">
            <p className="text-3xl font-bold text-ink-black dark:text-pearl">
              {formatCurrency(data.currentSalary)}
            </p>
            <p className="text-sm text-silver-mist mt-1">Your Current Base Salary</p>
          </div>

          {/* Range Bar */}
          <div className="relative pt-8 pb-6">
            <div className="absolute top-0 left-0 right-0 flex justify-between text-xs text-silver-mist">
              <span>25th</span>
              <span>50th</span>
              <span>75th</span>
              <span>90th</span>
            </div>

            <div className="relative w-full h-4 rounded-full bg-gradient-to-r from-red-200 via-yellow-200 via-green-200 to-emerald-200 dark:from-red-900/30 dark:via-yellow-900/30 dark:via-green-900/30 dark:to-emerald-900/30">
              {[data.marketRange.p25, data.marketRange.p50, data.marketRange.p75, data.marketRange.p90].map((val, idx) => (
                <div
                  key={idx}
                  className="absolute top-0 w-0.5 h-4 bg-white/60 dark:bg-pearl/30"
                  style={{ left: `${getPositionPercent(val)}%` }}
                />
              ))}

              <div
                className="absolute -top-1 w-6 h-6 rounded-full bg-celestial-indigo border-2 border-white dark:border-stellar-blue shadow-lg transform -translate-x-1/2"
                style={{ left: `${getPositionPercent(data.currentSalary)}%` }}
              >
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="text-xs font-medium text-celestial-indigo">You</span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-ink-black dark:text-pearl font-medium">
              <span>{formatCurrency(data.marketRange.p25)}</span>
              <span>{formatCurrency(data.marketRange.p50)}</span>
              <span>{formatCurrency(data.marketRange.p75)}</span>
              <span>{formatCurrency(data.marketRange.p90)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 mt-4 text-xs text-silver-mist">
            <Info className="w-3.5 h-3.5" />
            <span>
              Based on {data.sampleSize.toLocaleString()} data points | Updated: {data.lastUpdated} | Source: {data.dataSource}
            </span>
          </div>
        </div>

        {/* Geographic Adjustments */}
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
          <button
            onClick={() => setShowGeoDetails(!showGeoDetails)}
            className="w-full flex items-center justify-between p-5 hover:bg-cloud/30 dark:hover:bg-nebula-purple/10"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-celestial-indigo" />
              <h2 className="text-base font-semibold text-ink-black dark:text-pearl">
                Geographic Adjustments
              </h2>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-silver-mist transition-transform ${
                showGeoDetails ? "rotate-180" : ""
              }`}
            />
          </button>

          {showGeoDetails && (
            <div className="border-t border-cloud dark:border-nebula-purple/50 divide-y divide-cloud dark:divide-nebula-purple/50">
              {data.geographicAdjustments.map((geo) => (
                <div key={geo.location} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-silver-mist" />
                    <span className="text-sm text-ink-black dark:text-pearl">{geo.location}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        geo.factor >= 1
                          ? "bg-aurora-green/10 text-aurora-green"
                          : "bg-red-50 dark:bg-red-900/20 text-red-500"
                      }`}
                    >
                      {geo.factor >= 1 ? "+" : ""}{((geo.factor - 1) * 100).toFixed(0)}%
                    </span>
                    <span className="text-sm font-medium text-ink-black dark:text-pearl w-24 text-right">
                      {formatCurrency(geo.adjustedSalary)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
