'use client';

import React, { useState, useMemo } from 'react';
import {
  Receipt,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  IndianRupee,
  Download,
  FileText,
  Info,
  Calculator,
  BarChart3,
  BadgeCheck,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TaxRegime = 'NEW' | 'OLD';

interface TaxSlab {
  from: number;
  to: number | null;
  rate: number;
  label: string;
}

interface TDSQuarterRecord {
  quarter: number;
  period: string;
  status: 'NOT_FILED' | 'FILED' | 'PROCESSED';
  totalEmployees: number;
  totalGross: number;
  totalTDS: number;
  form24QStatus: 'NOT_FILED' | 'FILED' | 'PROCESSED';
  dueDate: string;
  filedDate: string | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NEW_SLABS: TaxSlab[] = [
  { from: 0, to: 300000, rate: 0, label: '0 – 3 Lakh' },
  { from: 300001, to: 700000, rate: 5, label: '3 – 7 Lakh' },
  { from: 700001, to: 1000000, rate: 10, label: '7 – 10 Lakh' },
  { from: 1000001, to: 1200000, rate: 15, label: '10 – 12 Lakh' },
  { from: 1200001, to: 1500000, rate: 20, label: '12 – 15 Lakh' },
  { from: 1500001, to: null, rate: 30, label: '15 Lakh+' },
];

const OLD_SLABS: TaxSlab[] = [
  { from: 0, to: 250000, rate: 0, label: '0 – 2.5 Lakh' },
  { from: 250001, to: 500000, rate: 5, label: '2.5 – 5 Lakh' },
  { from: 500001, to: 1000000, rate: 20, label: '5 – 10 Lakh' },
  { from: 1000001, to: null, rate: 30, label: '10 Lakh+' },
];

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const MOCK_QUARTERS: TDSQuarterRecord[] = [
  {
    quarter: 3,
    period: 'Oct – Dec 2025',
    status: 'FILED',
    totalEmployees: 124,
    totalGross: 24840000,
    totalTDS: 2235600,
    form24QStatus: 'FILED',
    dueDate: '2026-01-31',
    filedDate: '2026-01-25',
  },
  {
    quarter: 2,
    period: 'Jul – Sep 2025',
    status: 'FILED',
    totalEmployees: 120,
    totalGross: 24000000,
    totalTDS: 2160000,
    form24QStatus: 'PROCESSED',
    dueDate: '2025-10-31',
    filedDate: '2025-10-28',
  },
  {
    quarter: 1,
    period: 'Apr – Jun 2025',
    status: 'FILED',
    totalEmployees: 115,
    totalGross: 23000000,
    totalTDS: 2070000,
    form24QStatus: 'PROCESSED',
    dueDate: '2025-07-31',
    filedDate: '2025-07-29',
  },
  {
    quarter: 4,
    period: 'Jan – Mar 2026',
    status: 'NOT_FILED',
    totalEmployees: 0,
    totalGross: 0,
    totalTDS: 0,
    form24QStatus: 'NOT_FILED',
    dueDate: '2026-05-31',
    filedDate: null,
  },
];

const QUARTERLY_STATUS_CONFIG = {
  NOT_FILED: {
    label: 'Not Filed',
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
    icon: Clock,
  },
  FILED: {
    label: 'Filed',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200',
    icon: CheckCircle2,
  },
  PROCESSED: {
    label: 'Processed',
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
    icon: BadgeCheck,
  },
};

// ---------------------------------------------------------------------------
// Tax Calculation Helpers
// ---------------------------------------------------------------------------

function computeSlabTax(
  taxableIncome: number,
  slabs: TaxSlab[]
): {
  grossTax: number;
  breakdown: Array<{ label: string; rate: number; amount: number; tax: number }>;
} {
  let grossTax = 0;
  const breakdown: Array<{ label: string; rate: number; amount: number; tax: number }> = [];

  for (const slab of slabs) {
    if (taxableIncome <= slab.from - 1) break;
    const slabEnd = slab.to ?? Infinity;
    const inSlab = Math.min(taxableIncome, slabEnd) - (slab.from - 1);
    const taxInSlab = Math.max(inSlab, 0) * (slab.rate / 100);
    if (inSlab > 0) {
      breakdown.push({
        label: slab.label,
        rate: slab.rate,
        amount: Math.max(inSlab, 0),
        tax: Math.round(taxInSlab),
      });
    }
    grossTax += taxInSlab;
  }
  return { grossTax: Math.round(grossTax), breakdown };
}

function calculateTax(
  annualIncome: number,
  regime: TaxRegime,
  deductions: { sec80C: number; sec80D: number; nps: number }
) {
  const stdDeduction = regime === 'NEW' ? 75000 : 50000;
  const totalDed =
    regime === 'NEW'
      ? stdDeduction + Math.min(deductions.nps, 50000)
      : stdDeduction +
        Math.min(deductions.sec80C, 150000) +
        deductions.sec80D +
        Math.min(deductions.nps, 50000);

  const taxableIncome = Math.max(annualIncome - totalDed, 0);
  const slabs = regime === 'NEW' ? NEW_SLABS : OLD_SLABS;
  const { grossTax, breakdown } = computeSlabTax(taxableIncome, slabs);

  const rebateLimit = regime === 'NEW' ? 700000 : 500000;
  const rebate = taxableIncome <= rebateLimit ? grossTax : 0;
  const taxAfterRebate = Math.max(grossTax - rebate, 0);
  const cess = Math.round(taxAfterRebate * 0.04);
  const totalTax = taxAfterRebate + cess;
  const monthlyTDS = Math.round(totalTax / 12);

  return {
    taxableIncome,
    totalDeductions: totalDed,
    grossTax,
    rebate,
    taxAfterRebate,
    cess,
    totalTax,
    monthlyTDS,
    breakdown,
    effectiveRate: annualIncome > 0 ? ((totalTax / annualIncome) * 100).toFixed(2) : '0.00',
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatINR = (n: number, compact = false): string => {
  if (compact && n >= 100000) {
    return `Rs ${(n / 100000).toFixed(2)}L`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-1.5 text-2xl font-bold text-slate-900">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
        </div>
        <div className={`rounded-lg p-2.5 ${accent}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: 'NOT_FILED' | 'FILED' | 'PROCESSED' }) {
  const c = QUARTERLY_STATUS_CONFIG[status];
  const Icon = c.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${c.color} ${c.bg}`}
    >
      <Icon className="h-3 w-3" />
      {c.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// TDS Calculator Component
// ---------------------------------------------------------------------------
function TDSCalculatorPanel() {
  const [income, setIncome] = useState('800000');
  const [sec80C, setSec80C] = useState('150000');
  const [sec80D, setSec80D] = useState('25000');
  const [nps, setNps] = useState('0');

  const annualIncome = parseFloat(income) || 0;
  const ded = {
    sec80C: parseFloat(sec80C) || 0,
    sec80D: parseFloat(sec80D) || 0,
    nps: parseFloat(nps) || 0,
  };

  const newCalc = useMemo(
    () => calculateTax(annualIncome, 'NEW', ded),
    [annualIncome, sec80C, sec80D, nps]
  );
  const oldCalc = useMemo(
    () => calculateTax(annualIncome, 'OLD', ded),
    [annualIncome, sec80C, sec80D, nps]
  );

  const recommended = newCalc.totalTax <= oldCalc.totalTax ? 'NEW' : 'OLD';
  const saving = Math.abs(newCalc.totalTax - oldCalc.totalTax);

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Calculator className="h-4 w-4 text-indigo-600" />
        <p className="text-sm font-semibold text-indigo-900">
          TDS Calculator & Regime Comparison (FY 2024-25)
        </p>
      </div>

      {/* Inputs */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Annual Income (Rs)
          </label>
          <input
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Section 80C (Rs)</label>
          <input
            type="number"
            value={sec80C}
            onChange={(e) => setSec80C(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Section 80D (Rs)</label>
          <input
            type="number"
            value={sec80D}
            onChange={(e) => setSec80D(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            NPS 80CCD(1B) (Rs)
          </label>
          <input
            type="number"
            value={nps}
            onChange={(e) => setNps(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
      </div>

      {/* Comparison */}
      <div className="grid grid-cols-2 gap-4">
        {/* New Regime */}
        <div
          className={`rounded-xl border-2 p-4 ${recommended === 'NEW' ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-white'}`}
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-800">New Regime</p>
            {recommended === 'NEW' && (
              <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white">
                Recommended
              </span>
            )}
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Standard Deduction</span>
              <span className="font-medium">Rs 75,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Taxable Income</span>
              <span className="font-medium">{formatINR(newCalc.taxableIncome, true)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Gross Tax</span>
              <span className="font-medium">{formatINR(newCalc.grossTax, true)}</span>
            </div>
            {newCalc.rebate > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Rebate 87A</span>
                <span>- {formatINR(newCalc.rebate, true)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Cess (4%)</span>
              <span className="font-medium">{formatINR(newCalc.cess, true)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-slate-900">
              <span>Total Annual Tax</span>
              <span>{formatINR(newCalc.totalTax, true)}</span>
            </div>
            <div className="flex justify-between text-indigo-700">
              <span>Monthly TDS</span>
              <span className="font-bold">{formatINR(newCalc.monthlyTDS)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Effective Rate</span>
              <span>{newCalc.effectiveRate}%</span>
            </div>
          </div>
        </div>

        {/* Old Regime */}
        <div
          className={`rounded-xl border-2 p-4 ${recommended === 'OLD' ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-white'}`}
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-800">Old Regime</p>
            {recommended === 'OLD' && (
              <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white">
                Recommended
              </span>
            )}
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">80C (capped)</span>
              <span className="font-medium">{formatINR(Math.min(ded.sec80C, 150000), true)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Taxable Income</span>
              <span className="font-medium">{formatINR(oldCalc.taxableIncome, true)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Gross Tax</span>
              <span className="font-medium">{formatINR(oldCalc.grossTax, true)}</span>
            </div>
            {oldCalc.rebate > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Rebate 87A</span>
                <span>- {formatINR(oldCalc.rebate, true)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Cess (4%)</span>
              <span className="font-medium">{formatINR(oldCalc.cess, true)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-slate-900">
              <span>Total Annual Tax</span>
              <span>{formatINR(oldCalc.totalTax, true)}</span>
            </div>
            <div className="flex justify-between text-indigo-700">
              <span>Monthly TDS</span>
              <span className="font-bold">{formatINR(oldCalc.monthlyTDS)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Effective Rate</span>
              <span>{oldCalc.effectiveRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {saving > 0 && (
        <div className="mt-3 rounded-lg bg-emerald-100 px-4 py-2.5 text-sm">
          <span className="text-emerald-800 font-medium">
            Save {formatINR(saving)} annually with {recommended} Regime
          </span>
          <span className="ml-2 text-emerald-600 text-xs">
            ({formatINR(Math.round(saving / 12))}/month lower TDS)
          </span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Slab Chart
// ---------------------------------------------------------------------------
function TaxSlabChart({ regime }: { regime: TaxRegime }) {
  const slabs = regime === 'NEW' ? NEW_SLABS : OLD_SLABS;
  const maxRate = 30;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="mb-3 text-sm font-semibold text-slate-900">
        {regime === 'NEW' ? 'New' : 'Old'} Regime — Tax Slabs (FY 2024-25)
      </p>
      <div className="space-y-2">
        {slabs.map((slab) => (
          <div key={slab.label} className="grid grid-cols-[120px_1fr_50px] items-center gap-2">
            <span className="text-xs text-slate-600">{slab.label}</span>
            <div className="relative h-5 overflow-hidden rounded bg-slate-100">
              <div
                className={`h-full rounded ${slab.rate === 0 ? 'bg-emerald-200' : slab.rate <= 10 ? 'bg-blue-300' : slab.rate <= 20 ? 'bg-amber-400' : 'bg-red-400'}`}
                style={{ width: `${(slab.rate / maxRate) * 100}%` }}
              />
            </div>
            <span
              className={`text-right text-xs font-bold ${slab.rate === 0 ? 'text-emerald-600' : slab.rate <= 10 ? 'text-blue-600' : slab.rate <= 20 ? 'text-amber-700' : 'text-red-600'}`}
            >
              {slab.rate}%
            </span>
          </div>
        ))}
      </div>
      {regime === 'NEW' && (
        <div className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800">
          Standard deduction: Rs 75,000 | Rebate u/s 87A: Full rebate if income &lt;= Rs 7 Lakh
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------

export function IndiaTDSDashboard() {
  const [activeTab, setActiveTab] = useState<'quarters' | 'calculator' | 'slabs'>('quarters');
  const [slabRegime, setSlabRegime] = useState<TaxRegime>('NEW');

  const ytdTDS = MOCK_QUARTERS.filter((q) => q.status === 'FILED').reduce(
    (s, q) => s + q.totalTDS,
    0
  );
  const ytdGross = MOCK_QUARTERS.filter((q) => q.status === 'FILED').reduce(
    (s, q) => s + q.totalGross,
    0
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-600 p-2.5">
            <Receipt className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">India TDS Compliance</h1>
            <p className="text-sm text-slate-500">
              Tax Deducted at Source (Sec 192) — Quarterly Returns, Form 16 & Regime Analysis
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <FileText className="h-4 w-4" />
            Form 16 Bulk
          </button>
          <button className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            <Download className="h-4 w-4" />
            Form 24Q
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Active Employees"
          value="124"
          sub="FY 2024-25 payroll"
          icon={Users}
          accent="bg-indigo-500"
        />
        <StatCard
          label="YTD TDS Deducted"
          value={formatINR(ytdTDS, true)}
          sub="3 quarters filed"
          icon={IndianRupee}
          accent="bg-emerald-500"
        />
        <StatCard
          label="YTD Gross Salary"
          value={formatINR(ytdGross, true)}
          sub="Apr–Dec 2025"
          icon={TrendingUp}
          accent="bg-violet-500"
        />
        <StatCard
          label="Effective TDS Rate"
          value={ytdGross > 0 ? `${((ytdTDS / ytdGross) * 100).toFixed(1)}%` : '—'}
          sub="Blended rate all employees"
          icon={BarChart3}
          accent="bg-amber-500"
        />
      </div>

      {/* Tabs */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex gap-1 border-b border-slate-200 px-4 pt-3">
          {(['quarters', 'calculator', 'slabs'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-t-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab === 'quarters'
                ? 'Quarterly TDS (Form 24Q)'
                : tab === 'calculator'
                  ? 'TDS Calculator'
                  : 'Tax Slabs'}
            </button>
          ))}
        </div>

        {activeTab === 'quarters' && (
          <div className="p-5 space-y-3">
            {MOCK_QUARTERS.sort((a, b) => a.quarter - b.quarter).map((q) => (
              <div
                key={q.quarter}
                className="rounded-xl border border-slate-200 p-4 hover:bg-slate-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-lg bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-700">
                        Q{q.quarter}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">{q.period}</span>
                      <StatusBadge status={q.status} />
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                      <span>
                        Form 24Q: <StatusBadge status={q.form24QStatus} />
                      </span>
                      <span>
                        Due:{' '}
                        {new Date(q.dueDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      {q.filedDate && (
                        <span className="text-emerald-600">
                          Filed:{' '}
                          {new Date(q.filedDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                  {q.totalTDS > 0 && (
                    <div className="text-right">
                      <p className="text-lg font-bold text-indigo-700">
                        {formatINR(q.totalTDS, true)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {q.totalEmployees} employees · {formatINR(q.totalGross, true)} gross
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Form 16 info */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="text-xs text-amber-800">
                  <p className="font-semibold">Form 16 Generation</p>
                  <p className="mt-1">
                    Form 16 (Part A + Part B) must be issued to all employees by June 15 of the
                    assessment year. Part A is downloaded from TRACES after Form 24Q is processed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calculator' && (
          <div className="p-5">
            <TDSCalculatorPanel />
          </div>
        )}

        {activeTab === 'slabs' && (
          <div className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <p className="text-sm font-medium text-slate-700">View slabs for:</p>
              <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                {(['NEW', 'OLD'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setSlabRegime(r)}
                    className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                      slabRegime === r
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {r} Regime
                  </button>
                ))}
              </div>
            </div>
            <TaxSlabChart regime={slabRegime} />

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <p className="mb-2 text-sm font-semibold text-slate-900">Key Differences</p>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <p className="font-medium text-indigo-700">New Regime (Default FY2024-25)</p>
                  <div className="space-y-1 text-slate-600">
                    <p>+ Standard deduction: Rs 75,000</p>
                    <p>+ Lower rates for Rs 3L–15L income</p>
                    <p>+ Full rebate 87A up to Rs 7L income</p>
                    <p>- No 80C/80D/HRA/LTA deductions</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-slate-700">Old Regime</p>
                  <div className="space-y-1 text-slate-600">
                    <p>+ 80C deductions up to Rs 1.5L</p>
                    <p>+ 80D medical insurance deduction</p>
                    <p>+ HRA and LTA exemptions</p>
                    <p>- Higher rates (20% from Rs 5L–10L)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default IndiaTDSDashboard;
