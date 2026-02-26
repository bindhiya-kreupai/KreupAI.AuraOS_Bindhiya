'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart2,
  MapPin,
  TrendingUp,
  ChevronDown,
  Globe,
  Briefcase,
  Shield,
  Calendar,
  Users,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Activity,
  Database,
  CheckCircle,
  AlertTriangle,
  Layers,
  Filter,
  Clock,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// TypeScript Interfaces
// ---------------------------------------------------------------------------

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

interface HistoricalTrend {
  year: string;
  p50: number;
  p75: number;
  growthPct: number;
}

interface RoleBenchmark {
  role: string;
  level: string;
  marketRange: SalaryRange;
  typicalExperience: string;
}

interface DataFreshness {
  surveyDate: string;
  sampleSize: number;
  confidenceLevel: number;
  dataSource: string;
  lastUpdated: string;
  methodology: string;
}

interface GapAnalysis {
  targetPercentile: string;
  targetAmount: number;
  currentAmount: number;
  gap: number;
  percentIncrease: number;
}

type IndustryKey = 'Technology' | 'Finance' | 'Healthcare';

type CompetivenessLevel = 'Below Market' | 'At Market' | 'Above Market';

interface IndustryData {
  marketRange: SalaryRange;
  companySize: string;
  sampleSize: number;
  historicalTrends: HistoricalTrend[];
  relatedRoles: RoleBenchmark[];
}

interface BenchmarkData {
  role: string;
  level: string;
  currentSalary: number;
  percentile: number;
  marketRange: SalaryRange;
  industry: IndustryKey;
  companySize: string;
  geographicAdjustments: GeographicAdjustment[];
  dataFreshness: DataFreshness;
  historicalTrends: HistoricalTrend[];
  relatedRoles: RoleBenchmark[];
}

// ---------------------------------------------------------------------------
// Mock Data — Industry-segmented datasets
// ---------------------------------------------------------------------------

const industryDatasets: Record<IndustryKey, IndustryData> = {
  Technology: {
    marketRange: { p25: 140000, p50: 158000, p75: 182000, p90: 210000 },
    companySize: '1,000 - 5,000 employees',
    sampleSize: 2847,
    historicalTrends: [
      { year: 'FY2024', p50: 142000, p75: 164000, growthPct: 0 },
      { year: 'FY2025', p50: 150000, p75: 173000, growthPct: 5.6 },
      { year: 'FY2026', p50: 158000, p75: 182000, growthPct: 5.3 },
    ],
    relatedRoles: [
      {
        role: 'Software Engineer',
        level: 'L4',
        marketRange: { p25: 115000, p50: 130000, p75: 148000, p90: 168000 },
        typicalExperience: '3 - 5 years',
      },
      {
        role: 'Senior Software Engineer',
        level: 'L5',
        marketRange: { p25: 140000, p50: 158000, p75: 182000, p90: 210000 },
        typicalExperience: '5 - 8 years',
      },
      {
        role: 'Staff Engineer',
        level: 'L6',
        marketRange: { p25: 180000, p50: 205000, p75: 238000, p90: 275000 },
        typicalExperience: '8 - 12 years',
      },
      {
        role: 'Principal Engineer',
        level: 'L7',
        marketRange: { p25: 230000, p50: 268000, p75: 310000, p90: 365000 },
        typicalExperience: '12+ years',
      },
    ],
  },
  Finance: {
    marketRange: { p25: 135000, p50: 155000, p75: 178000, p90: 205000 },
    companySize: '5,000 - 20,000 employees',
    sampleSize: 1932,
    historicalTrends: [
      { year: 'FY2024', p50: 138000, p75: 160000, growthPct: 0 },
      { year: 'FY2025', p50: 146000, p75: 168000, growthPct: 5.8 },
      { year: 'FY2026', p50: 155000, p75: 178000, growthPct: 6.2 },
    ],
    relatedRoles: [
      {
        role: 'Software Engineer',
        level: 'L4',
        marketRange: { p25: 110000, p50: 126000, p75: 145000, p90: 162000 },
        typicalExperience: '3 - 5 years',
      },
      {
        role: 'Senior Software Engineer',
        level: 'L5',
        marketRange: { p25: 135000, p50: 155000, p75: 178000, p90: 205000 },
        typicalExperience: '5 - 8 years',
      },
      {
        role: 'Staff Engineer',
        level: 'L6',
        marketRange: { p25: 175000, p50: 198000, p75: 230000, p90: 265000 },
        typicalExperience: '8 - 12 years',
      },
      {
        role: 'Principal Engineer',
        level: 'L7',
        marketRange: { p25: 220000, p50: 258000, p75: 300000, p90: 350000 },
        typicalExperience: '12+ years',
      },
    ],
  },
  Healthcare: {
    marketRange: { p25: 120000, p50: 140000, p75: 162000, p90: 188000 },
    companySize: '2,000 - 10,000 employees',
    sampleSize: 1456,
    historicalTrends: [
      { year: 'FY2024', p50: 126000, p75: 148000, growthPct: 0 },
      { year: 'FY2025', p50: 133000, p75: 155000, growthPct: 5.6 },
      { year: 'FY2026', p50: 140000, p75: 162000, growthPct: 5.3 },
    ],
    relatedRoles: [
      {
        role: 'Software Engineer',
        level: 'L4',
        marketRange: { p25: 98000, p50: 114000, p75: 132000, p90: 150000 },
        typicalExperience: '3 - 5 years',
      },
      {
        role: 'Senior Software Engineer',
        level: 'L5',
        marketRange: { p25: 120000, p50: 140000, p75: 162000, p90: 188000 },
        typicalExperience: '5 - 8 years',
      },
      {
        role: 'Staff Engineer',
        level: 'L6',
        marketRange: { p25: 155000, p50: 180000, p75: 210000, p90: 245000 },
        typicalExperience: '8 - 12 years',
      },
      {
        role: 'Principal Engineer',
        level: 'L7',
        marketRange: { p25: 200000, p50: 235000, p75: 275000, p90: 320000 },
        typicalExperience: '12+ years',
      },
    ],
  },
};

const geographicAdjustments: GeographicAdjustment[] = [
  { location: 'San Francisco, CA', factor: 1.25, adjustedSalary: 206250 },
  { location: 'New York, NY', factor: 1.18, adjustedSalary: 194700 },
  { location: 'Austin, TX', factor: 1.0, adjustedSalary: 165000 },
  { location: 'Denver, CO', factor: 0.95, adjustedSalary: 156750 },
  { location: 'Remote (US Avg)', factor: 0.92, adjustedSalary: 151800 },
];

const industries: IndustryKey[] = ['Technology', 'Finance', 'Healthcare'];

// ---------------------------------------------------------------------------
// Utility Helpers
// ---------------------------------------------------------------------------

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);

const formatPct = (value: number, decimals = 1): string =>
  `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SalaryBenchmarking() {
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryKey>('Technology');
  const [showGeoDetails, setShowGeoDetails] = useState(false);
  const [showTrendDetails, setShowTrendDetails] = useState(true);
  const [showRoleComparison, setShowRoleComparison] = useState(true);

  const currentSalary = 165000;
  const currentRole = 'Senior Software Engineer';
  const currentLevel = 'L5';

  // Derived data based on selected industry
  const industryData = industryDatasets[selectedIndustry];

  const data: BenchmarkData = useMemo(
    () => ({
      role: currentRole,
      level: currentLevel,
      currentSalary,
      percentile: Math.round(
        (() => {
          const mr = industryData.marketRange;
          if (currentSalary <= mr.p25) return 25 * (currentSalary / mr.p25);
          if (currentSalary <= mr.p50)
            return 25 + 25 * ((currentSalary - mr.p25) / (mr.p50 - mr.p25));
          if (currentSalary <= mr.p75)
            return 50 + 25 * ((currentSalary - mr.p50) / (mr.p75 - mr.p50));
          if (currentSalary <= mr.p90)
            return 75 + 15 * ((currentSalary - mr.p75) / (mr.p90 - mr.p75));
          return 95;
        })()
      ),
      marketRange: industryData.marketRange,
      industry: selectedIndustry,
      companySize: industryData.companySize,
      geographicAdjustments,
      dataFreshness: {
        surveyDate: 'January 2026',
        sampleSize: industryData.sampleSize,
        confidenceLevel: 95,
        dataSource: `${selectedIndustry} Market Survey 2026`,
        lastUpdated: '2026-01-15',
        methodology: 'Employer-reported, verified',
      },
      historicalTrends: industryData.historicalTrends,
      relatedRoles: industryData.relatedRoles,
    }),
    [selectedIndustry, industryData]
  );

  // Compa-ratio = current salary / market median
  const compaRatio = data.currentSalary / data.marketRange.p50;

  // Competitiveness determination
  const competitiveness: CompetivenessLevel = useMemo(() => {
    if (compaRatio < 0.95) return 'Below Market';
    if (compaRatio <= 1.05) return 'At Market';
    return 'Above Market';
  }, [compaRatio]);

  // Gap analysis
  const gapAnalysis: GapAnalysis[] = useMemo(() => {
    const targets: { label: string; value: number }[] = [
      { label: 'P50', value: data.marketRange.p50 },
      { label: 'P75', value: data.marketRange.p75 },
      { label: 'P90', value: data.marketRange.p90 },
    ];
    return targets.map((t) => ({
      targetPercentile: t.label,
      targetAmount: t.value,
      currentAmount: data.currentSalary,
      gap: t.value - data.currentSalary,
      percentIncrease: ((t.value - data.currentSalary) / data.currentSalary) * 100,
    }));
  }, [data]);

  // Range bar helpers
  const rangeMin = data.marketRange.p25;
  const rangeMax = data.marketRange.p90;
  const rangeSpan = rangeMax - rangeMin;

  const getPositionPercent = (value: number): number =>
    Math.max(0, Math.min(100, ((value - rangeMin) / rangeSpan) * 100));

  const percentileColor = (p: number): string => {
    if (p >= 75) return 'text-aurora-green';
    if (p >= 50) return 'text-celestial-indigo';
    if (p >= 25) return 'text-sunset-amber';
    return 'text-coral-alert';
  };

  const competitivenessConfig: Record<
    CompetivenessLevel,
    { bg: string; text: string; icon: React.ReactNode }
  > = {
    'Below Market': {
      bg: 'bg-coral-alert/10 dark:bg-coral-alert/20',
      text: 'text-coral-alert',
      icon: <ArrowDownRight className="w-3.5 h-3.5" />,
    },
    'At Market': {
      bg: 'bg-celestial-indigo/10 dark:bg-celestial-indigo/20',
      text: 'text-celestial-indigo',
      icon: <Minus className="w-3.5 h-3.5" />,
    },
    'Above Market': {
      bg: 'bg-aurora-green/10 dark:bg-aurora-green/20',
      text: 'text-aurora-green',
      icon: <ArrowUpRight className="w-3.5 h-3.5" />,
    },
  };

  const cc = competitivenessConfig[competitiveness];

  // Historical trend bar chart max for scaling
  const trendMax = useMemo(
    () => Math.max(...data.historicalTrends.map((t) => t.p75)),
    [data.historicalTrends]
  );

  return (
    <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* ---------------------------------------------------------------- */}
        {/* Header                                                           */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex items-center gap-3 mb-1">
          <BarChart2 className="w-6 h-6 text-celestial-indigo" />
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Salary Benchmarking</h1>
        </div>
        <p className="text-silver-mist mb-6">See how your compensation compares to market data</p>

        {/* ---------------------------------------------------------------- */}
        {/* Industry Filter Tabs                                             */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-4 h-4 text-silver-mist" />
          <span className="text-xs font-medium text-silver-mist mr-1">Industry:</span>
          {industries.map((ind) => (
            <button
              key={ind}
              onClick={() => setSelectedIndustry(ind)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedIndustry === ind
                  ? 'bg-celestial-indigo text-white shadow-sm'
                  : 'bg-cloud/60 dark:bg-deep-cosmos/60 text-silver-mist hover:bg-cloud dark:hover:bg-deep-cosmos hover:text-ink-black dark:hover:text-pearl'
              }`}
            >
              {ind}
            </button>
          ))}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Role Context Card                                                */}
        {/* ---------------------------------------------------------------- */}
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
              <p className="text-sm font-medium text-ink-black dark:text-pearl">
                {data.companySize}
              </p>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Market Position + Competitiveness + Compa-Ratio                   */}
        {/* ---------------------------------------------------------------- */}
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-6 mb-6">
          {/* Heading row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <h2 className="text-base font-semibold text-ink-black dark:text-pearl">
              Your Market Position
            </h2>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Competitiveness Badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cc.bg} ${cc.text}`}
              >
                {cc.icon}
                {competitiveness}
              </span>
              {/* Percentile */}
              <div className="flex items-center gap-1.5">
                <TrendingUp className={`w-4 h-4 ${percentileColor(data.percentile)}`} />
                <span className={`text-lg font-bold ${percentileColor(data.percentile)}`}>
                  {data.percentile}th percentile
                </span>
              </div>
            </div>
          </div>

          {/* Salary + Compa-Ratio side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Current Salary */}
            <div className="text-center md:text-left">
              <p className="text-3xl font-bold text-ink-black dark:text-pearl">
                {formatCurrency(data.currentSalary)}
              </p>
              <p className="text-sm text-silver-mist mt-1">Your Current Base Salary</p>
            </div>

            {/* Compa-Ratio Gauge */}
            <div className="flex flex-col items-center md:items-end">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-celestial-indigo" />
                <span className="text-xs font-medium text-silver-mist uppercase tracking-wide">
                  Compa-Ratio
                </span>
              </div>
              <div className="w-full max-w-[220px]">
                {/* Gauge track */}
                <div className="relative w-full h-3 rounded-full bg-cloud dark:bg-deep-cosmos overflow-hidden">
                  {/* Fill — clamp between 0 and 140% mapped to bar width */}
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all ${
                      compaRatio < 0.95
                        ? 'bg-coral-alert'
                        : compaRatio <= 1.05
                          ? 'bg-celestial-indigo'
                          : 'bg-aurora-green'
                    }`}
                    style={{
                      width: `${Math.min(100, (compaRatio / 1.4) * 100)}%`,
                    }}
                  />
                  {/* 1.0 marker line */}
                  <div
                    className="absolute inset-y-0 w-0.5 bg-ink-black/30 dark:bg-pearl/30"
                    style={{ left: `${(1.0 / 1.4) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-silver-mist">
                  <span>0.70</span>
                  <span>1.00</span>
                  <span>1.40</span>
                </div>
              </div>
              <p className="mt-1.5">
                <span
                  className={`text-xl font-bold ${
                    compaRatio < 0.95
                      ? 'text-coral-alert'
                      : compaRatio <= 1.05
                        ? 'text-celestial-indigo'
                        : 'text-aurora-green'
                  }`}
                >
                  {compaRatio.toFixed(2)}
                </span>
                <span className="text-xs text-silver-mist ml-1.5">(salary / median)</span>
              </p>
            </div>
          </div>

          {/* Range Bar — preserved from original */}
          <div className="relative pt-8 pb-6">
            <div className="absolute top-0 left-0 right-0 flex justify-between text-xs text-silver-mist">
              <span>25th</span>
              <span>50th</span>
              <span>75th</span>
              <span>90th</span>
            </div>

            <div className="relative w-full h-4 rounded-full bg-gradient-to-r from-red-200 via-yellow-300 to-emerald-200 dark:from-red-900/30 dark:via-yellow-900/30 dark:to-emerald-900/30">
              {[
                data.marketRange.p25,
                data.marketRange.p50,
                data.marketRange.p75,
                data.marketRange.p90,
              ].map((val, idx) => (
                <div
                  key={idx}
                  className="absolute top-0 w-0.5 h-4 bg-white/60 dark:bg-pearl/30"
                  style={{ left: `${getPositionPercent(val)}%` }}
                />
              ))}

              <div
                className="absolute -top-1 w-6 h-6 rounded-full bg-celestial-indigo border-2 border-white dark:border-stellar-blue shadow-lg transform -translate-x-1/2"
                style={{
                  left: `${getPositionPercent(data.currentSalary)}%`,
                }}
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

          {/* Data Freshness Indicator */}
          <div className="mt-4 p-3 rounded-lg bg-cloud/40 dark:bg-deep-cosmos/40">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-silver-mist">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Survey: {data.dataFreshness.surveyDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Sample: {data.dataFreshness.sampleSize.toLocaleString()} respondents
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                {data.dataFreshness.confidenceLevel}% confidence
              </span>
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                {data.dataFreshness.dataSource}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {data.dataFreshness.methodology}
              </span>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Salary Range Gap Analysis                                        */}
        {/* ---------------------------------------------------------------- */}
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-nebula-purple" />
            <h2 className="text-base font-semibold text-ink-black dark:text-pearl">Gap Analysis</h2>
          </div>
          <p className="text-xs text-silver-mist mb-4">
            How much your salary needs to increase to reach each percentile threshold.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {gapAnalysis.map((g) => {
              const isAbove = g.gap <= 0;
              return (
                <div
                  key={g.targetPercentile}
                  className={`rounded-lg p-4 border ${
                    isAbove
                      ? 'border-aurora-green/30 bg-aurora-green/5 dark:bg-aurora-green/10'
                      : 'border-cloud dark:border-nebula-purple/40 bg-white dark:bg-deep-cosmos/30'
                  }`}
                >
                  <p className="text-xs font-medium text-silver-mist mb-1">
                    To reach {g.targetPercentile}
                  </p>
                  <p className="text-lg font-bold text-ink-black dark:text-pearl">
                    {formatCurrency(g.targetAmount)}
                  </p>
                  {isAbove ? (
                    <div className="flex items-center gap-1 mt-2">
                      <CheckCircle className="w-3.5 h-3.5 text-aurora-green" />
                      <span className="text-xs font-medium text-aurora-green">
                        Already above by {formatCurrency(Math.abs(g.gap))}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-sunset-amber" />
                        <span className="text-xs font-medium text-sunset-amber">
                          Gap: {formatCurrency(g.gap)} ({formatPct(g.percentIncrease)})
                        </span>
                      </div>
                      {/* Mini progress bar */}
                      <div className="mt-2 w-full h-1.5 rounded-full bg-cloud dark:bg-deep-cosmos overflow-hidden">
                        <div
                          className="h-full rounded-full bg-celestial-indigo transition-all"
                          style={{
                            width: `${Math.min(100, (g.currentAmount / g.targetAmount) * 100)}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between mt-0.5 text-[10px] text-silver-mist">
                        <span>Current</span>
                        <span>{g.targetPercentile}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Historical Market Trends — CSS bar chart                         */}
        {/* ---------------------------------------------------------------- */}
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden mb-6">
          <button
            onClick={() => setShowTrendDetails(!showTrendDetails)}
            className="w-full flex items-center justify-between p-5 hover:bg-cloud/30 dark:hover:bg-nebula-purple/10"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-celestial-indigo" />
              <h2 className="text-base font-semibold text-ink-black dark:text-pearl">
                Historical Market Trends
              </h2>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-silver-mist transition-transform ${
                showTrendDetails ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showTrendDetails && (
            <div className="border-t border-cloud dark:border-nebula-purple/50 p-5">
              <p className="text-xs text-silver-mist mb-5">
                3-year salary trend for {data.role} ({data.industry} sector)
              </p>

              {/* Bar chart built with CSS */}
              <div className="flex items-end gap-6 justify-center h-48 mb-4">
                {data.historicalTrends.map((t, idx) => {
                  const p50Height = (t.p50 / trendMax) * 100;
                  const p75Height = (t.p75 / trendMax) * 100;
                  return (
                    <div key={t.year} className="flex flex-col items-center gap-1">
                      <div className="flex items-end gap-1.5 h-40">
                        {/* P50 bar */}
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-celestial-indigo font-medium mb-1">
                            {formatCurrency(t.p50)}
                          </span>
                          <div
                            className="w-8 rounded-t-md bg-celestial-indigo/70 dark:bg-celestial-indigo/50 transition-all"
                            style={{ height: `${p50Height}%` }}
                          />
                        </div>
                        {/* P75 bar */}
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-nebula-purple font-medium mb-1">
                            {formatCurrency(t.p75)}
                          </span>
                          <div
                            className="w-8 rounded-t-md bg-nebula-purple/70 dark:bg-nebula-purple/50 transition-all"
                            style={{ height: `${p75Height}%` }}
                          />
                        </div>
                      </div>
                      {/* Year label */}
                      <span className="text-xs font-medium text-ink-black dark:text-pearl mt-1">
                        {t.year}
                      </span>
                      {/* Growth badge */}
                      {idx > 0 && (
                        <span className="text-[10px] text-aurora-green font-medium flex items-center gap-0.5">
                          <TrendingUp className="w-3 h-3" />
                          {formatPct(t.growthPct)}
                        </span>
                      )}
                      {idx === 0 && <span className="text-[10px] text-silver-mist">Baseline</span>}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 text-xs text-silver-mist">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-celestial-indigo/70 dark:bg-celestial-indigo/50" />
                  P50 (Median)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-nebula-purple/70 dark:bg-nebula-purple/50" />
                  P75
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Multi-Role Comparison Table                                      */}
        {/* ---------------------------------------------------------------- */}
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden mb-6">
          <button
            onClick={() => setShowRoleComparison(!showRoleComparison)}
            className="w-full flex items-center justify-between p-5 hover:bg-cloud/30 dark:hover:bg-nebula-purple/10"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-celestial-indigo" />
              <h2 className="text-base font-semibold text-ink-black dark:text-pearl">
                Multi-Role Comparison
              </h2>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-silver-mist transition-transform ${
                showRoleComparison ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showRoleComparison && (
            <div className="border-t border-cloud dark:border-nebula-purple/50">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-cloud/30 dark:bg-deep-cosmos/30">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-silver-mist uppercase tracking-wide">
                        Role / Level
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-silver-mist uppercase tracking-wide">
                        Experience
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-silver-mist uppercase tracking-wide">
                        P25
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-silver-mist uppercase tracking-wide">
                        P50
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-silver-mist uppercase tracking-wide">
                        P75
                      </th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-silver-mist uppercase tracking-wide">
                        P90
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cloud dark:divide-nebula-purple/30">
                    {data.relatedRoles.map((r) => {
                      const isCurrent = r.level === data.level;
                      return (
                        <tr
                          key={r.level}
                          className={
                            isCurrent
                              ? 'bg-celestial-indigo/5 dark:bg-celestial-indigo/10'
                              : 'hover:bg-cloud/20 dark:hover:bg-nebula-purple/5'
                          }
                        >
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              {isCurrent && (
                                <span className="w-1.5 h-1.5 rounded-full bg-celestial-indigo flex-shrink-0" />
                              )}
                              <div>
                                <p
                                  className={`font-medium ${
                                    isCurrent
                                      ? 'text-celestial-indigo'
                                      : 'text-ink-black dark:text-pearl'
                                  }`}
                                >
                                  {r.role}
                                </p>
                                <p className="text-[10px] text-silver-mist">
                                  {r.level}
                                  {isCurrent && ' (Current)'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-silver-mist">
                            {r.typicalExperience}
                          </td>
                          <td className="px-4 py-3 text-right text-ink-black dark:text-pearl font-medium tabular-nums">
                            {formatCurrency(r.marketRange.p25)}
                          </td>
                          <td className="px-4 py-3 text-right text-ink-black dark:text-pearl font-medium tabular-nums">
                            {formatCurrency(r.marketRange.p50)}
                          </td>
                          <td className="px-4 py-3 text-right text-ink-black dark:text-pearl font-medium tabular-nums">
                            {formatCurrency(r.marketRange.p75)}
                          </td>
                          <td className="px-5 py-3 text-right text-ink-black dark:text-pearl font-medium tabular-nums">
                            {formatCurrency(r.marketRange.p90)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Visual range comparison */}
              <div className="p-5 border-t border-cloud dark:border-nebula-purple/50">
                <p className="text-xs text-silver-mist mb-4">
                  Visual range comparison ({data.industry} sector)
                </p>
                {data.relatedRoles.map((r) => {
                  const globalMax = data.relatedRoles[data.relatedRoles.length - 1].marketRange.p90;
                  const leftPct = (r.marketRange.p25 / globalMax) * 100;
                  const widthPct = ((r.marketRange.p90 - r.marketRange.p25) / globalMax) * 100;
                  const midPct = ((r.marketRange.p50 - r.marketRange.p25) / globalMax) * 100;
                  const isCurrent = r.level === data.level;

                  return (
                    <div key={r.level} className="flex items-center gap-3 mb-3">
                      <span
                        className={`text-xs w-8 text-right font-medium flex-shrink-0 ${
                          isCurrent ? 'text-celestial-indigo' : 'text-silver-mist'
                        }`}
                      >
                        {r.level}
                      </span>
                      <div className="flex-1 relative h-5">
                        {/* Range bar */}
                        <div
                          className={`absolute inset-y-0 rounded-full ${
                            isCurrent
                              ? 'bg-celestial-indigo/30 dark:bg-celestial-indigo/20'
                              : 'bg-cloud dark:bg-deep-cosmos/60'
                          }`}
                          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                        />
                        {/* Median marker */}
                        <div
                          className={`absolute inset-y-0 w-0.5 ${
                            isCurrent ? 'bg-celestial-indigo' : 'bg-silver-mist/60'
                          }`}
                          style={{
                            left: `${leftPct + midPct}%`,
                          }}
                        />
                        {/* Current salary marker for current role */}
                        {isCurrent && (
                          <div
                            className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-celestial-indigo border-2 border-white dark:border-stellar-blue shadow"
                            style={{
                              left: `${(data.currentSalary / globalMax) * 100}%`,
                            }}
                          />
                        )}
                      </div>
                      <span className="text-[10px] text-silver-mist w-20 text-right flex-shrink-0 tabular-nums">
                        {formatCurrency(r.marketRange.p25)} - {formatCurrency(r.marketRange.p90)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Geographic Adjustments — preserved from original                  */}
        {/* ---------------------------------------------------------------- */}
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
                showGeoDetails ? 'rotate-180' : ''
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
                          ? 'bg-aurora-green/10 text-aurora-green'
                          : 'bg-red-50 dark:bg-red-900/20 text-red-500'
                      }`}
                    >
                      {geo.factor >= 1 ? '+' : ''}
                      {((geo.factor - 1) * 100).toFixed(0)}%
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
