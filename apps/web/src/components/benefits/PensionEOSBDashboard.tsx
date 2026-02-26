'use client';

/**
 * @component PensionEOSBDashboard
 * @description Pension and EOSB dashboard — EOSB liability gauge, employee EOSB lookup,
 *   provision breakdown, aging analysis, retirement calculator, contribution history.
 * @project AURA HCM Platform
 * @section 18.6 — Pension & EOSB Management
 *
 * Legal References:
 *  UAE EOSB: Federal Decree-Law No. 33 of 2021, Article 51
 *  KSA EOSB: Saudi Labour Law Article 84
 *  India Gratuity: Payment of Gratuity Act 1972
 */

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  Search,
  RefreshCw,
  Calendar,
  Target,
  CheckCircle2,
  Info,
  Shield,
  Globe,
} from 'lucide-react';
import type {
  EOSBCalculation,
  EOSBLiabilitySummary,
  PensionPlan,
  ContributionRecord,
  RetirementProjection,
} from '@/services/pensionEosbService';
import { PensionEOSBService } from '@/services/pensionEosbService';

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtCurrency(n: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(n));
}

// ── Gauge ──────────────────────────────────────────────────────────────────────

function LiabilityGauge({ current, projected }: { current: number; projected: number }) {
  const percent = Math.round((current / projected) * 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDash = (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="10" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="10"
            strokeDasharray={`${strokeDash} ${circumference - strokeDash}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-bold text-slate-800">{percent}%</p>
          <p className="text-xs text-slate-400">of target</p>
        </div>
      </div>
      <div className="text-center mt-2">
        <p className="text-xs text-slate-500">Current Provision</p>
        <p className="text-sm font-bold text-blue-600">AED {(current / 1_000_000).toFixed(1)}M</p>
      </div>
    </div>
  );
}

// ── Contribution Chart ─────────────────────────────────────────────────────────

function ContributionBar({ records }: { records: ContributionRecord[] }) {
  const max = Math.max(...records.map((r) => r.totalContribution));
  return (
    <div className="space-y-2">
      {records.map((r) => (
        <div key={r.id} className="flex items-center gap-3">
          <p className="text-xs text-slate-500 w-16 shrink-0">{r.period}</p>
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
              <div
                className="h-full flex rounded-full overflow-hidden"
                style={{ width: `${(r.totalContribution / max) * 100}%` }}
              >
                <div
                  className="flex-1 bg-blue-500"
                  style={{ width: `${(r.employeeContribution / r.totalContribution) * 100}%` }}
                />
                <div className="flex-1 bg-emerald-400" />
              </div>
            </div>
            <p className="text-xs font-medium text-slate-700 w-16 text-right">
              ${fmtNumber(r.totalContribution)}
            </p>
          </div>
        </div>
      ))}
      <div className="flex items-center gap-4 pt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-blue-500 rounded" />
          <p className="text-xs text-slate-500">Employee</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-emerald-400 rounded" />
          <p className="text-xs text-slate-500">Employer</p>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

type Tab = 'eosb' | 'pension' | 'retirement';

export default function PensionEOSBDashboard() {
  const [liability, setLiability] = useState<EOSBLiabilitySummary | null>(null);
  const [employeeEOSB, setEmployeeEOSB] = useState<EOSBCalculation | null>(null);
  const [pensionPlans, setPensionPlans] = useState<PensionPlan[]>([]);
  const [contributions, setContributions] = useState<ContributionRecord[]>([]);
  const [projection, setProjection] = useState<RetirementProjection | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('eosb');
  const [searchEmployee, setSearchEmployee] = useState('');
  const [searching, setSearching] = useState(false);

  // Retirement calculator state
  const [retirementAge, setRetirementAge] = useState(65);
  const [currentAge, setCurrentAge] = useState(35);
  const [currentSalary, setCurrentSalary] = useState(140000);
  const [currentSavings, setCurrentSavings] = useState(85000);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    Promise.all([
      PensionEOSBService.getEOSBLiability(),
      PensionEOSBService.getPensionPlans(),
      PensionEOSBService.getContributionHistory('emp-0445'),
    ]).then(([lib, plans, contribs]) => {
      setLiability(lib);
      setPensionPlans(plans);
      setContributions(contribs);
      setLoading(false);
    });
  }, []);

  async function searchEmployeeEOSB() {
    setSearching(true);
    try {
      const result = await PensionEOSBService.calculateEOSB('emp-0201');
      setEmployeeEOSB(result);
    } finally {
      setSearching(false);
    }
  }

  async function calculateRetirement() {
    setCalculating(true);
    try {
      const proj = await PensionEOSBService.projectRetirement('emp-0445', {
        retirementAge,
        currentAge,
        currentSalary,
        currentSavings,
      });
      setProjection(proj);
    } finally {
      setCalculating(false);
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'eosb', label: 'EOSB / Gratuity' },
    { id: 'pension', label: 'Pension Plans' },
    { id: 'retirement', label: 'Retirement Planner' },
  ];

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Pension & EOSB Management</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          End-of-service benefits, pension plans, and retirement planning
        </p>
      </div>

      {/* Summary Cards */}
      {liability && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: 'Total EOSB Liability',
              value: `AED ${(liability.totalLiability / 1_000_000).toFixed(1)}M`,
              sub: liability.entityName,
              icon: Shield,
              color: 'text-blue-600',
              bg: 'bg-blue-50',
            },
            {
              label: 'Projected Year-End',
              value: `AED ${(liability.projectedYearEnd / 1_000_000).toFixed(1)}M`,
              sub: '+11.3% increase',
              icon: TrendingUp,
              color: 'text-purple-600',
              bg: 'bg-purple-50',
            },
            {
              label: 'Monthly Provision',
              value: `AED ${(liability.monthlyProvision / 1000).toFixed(0)}K`,
              sub: 'Current monthly accrual',
              icon: Calendar,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50',
            },
            {
              label: 'Employees Covered',
              value: liability.byYearsOfServiceBand.reduce((s, b) => s + b.employeeCount, 0),
              sub: 'With EOSB entitlement',
              icon: Users,
              color: 'text-amber-600',
              bg: 'bg-amber-50',
            },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-500">{card.label}</p>
                <div className={`p-1.5 rounded-lg ${card.bg}`}>
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <p className="text-xl font-bold text-slate-900">{card.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-700 bg-blue-50'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* EOSB Tab */}
          {activeTab === 'eosb' && liability && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Liability Gauge */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 flex flex-col items-center">
                  <p className="text-sm font-semibold text-slate-700 mb-4">
                    EOSB Provision vs Projected
                  </p>
                  <LiabilityGauge
                    current={liability.totalLiability}
                    projected={liability.projectedYearEnd}
                  />
                  <div className="w-full mt-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Current Liability</span>
                      <span className="font-bold text-blue-700">
                        AED {fmtNumber(liability.totalLiability)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Year-End Projection</span>
                      <span className="font-bold text-slate-700">
                        AED {fmtNumber(liability.projectedYearEnd)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Monthly Provision</span>
                      <span className="font-bold text-emerald-700">
                        AED {fmtNumber(liability.monthlyProvision)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Years of Service Bands */}
                <div className="lg:col-span-2">
                  <p className="text-sm font-semibold text-slate-700 mb-3">EOSB Aging Analysis</p>
                  <div className="space-y-3">
                    {liability.byYearsOfServiceBand.map((band, i) => {
                      const colors = [
                        'bg-blue-400',
                        'bg-indigo-400',
                        'bg-purple-400',
                        'bg-amber-400',
                        'bg-red-400',
                      ];
                      const maxLiability = Math.max(
                        ...liability.byYearsOfServiceBand.map((b) => b.totalLiability)
                      );
                      const width =
                        maxLiability > 0 ? (band.totalLiability / maxLiability) * 100 : 0;
                      return (
                        <div key={band.band}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-medium text-slate-700">{band.band}</p>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span>{band.employeeCount} emp</span>
                              <span className="font-semibold text-slate-800">
                                AED {fmtNumber(band.totalLiability)}
                              </span>
                            </div>
                          </div>
                          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${colors[i]} rounded-full transition-all`}
                              style={{ width: `${width}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Employee EOSB Lookup */}
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">Employee EOSB Lookup</p>
                <div className="flex gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchEmployee}
                      onChange={(e) => setSearchEmployee(e.target.value)}
                      placeholder="Search employee name or ID..."
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      onKeyDown={(e) => e.key === 'Enter' && searchEmployeeEOSB()}
                    />
                  </div>
                  <button
                    onClick={searchEmployeeEOSB}
                    disabled={searching}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2"
                  >
                    {searching && <RefreshCw className="w-4 h-4 animate-spin" />}
                    Calculate EOSB
                  </button>
                </div>

                {employeeEOSB && (
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-bold text-blue-900">{employeeEOSB.employeeName}</p>
                        <p className="text-xs text-blue-600">
                          {employeeEOSB.jurisdiction} · {employeeEOSB.yearsOfService} years of
                          service
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-800">
                          {employeeEOSB.currency} {fmtNumber(employeeEOSB.eosbAmount)}
                        </p>
                        <p className="text-xs text-blue-600">Current EOSB Entitlement</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {employeeEOSB.calculationBreakdown.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <div className="flex-1">
                            <span className="font-medium text-blue-800">{item.period}</span>
                            <span className="text-blue-600 ml-2">({item.rateLabel})</span>
                          </div>
                          <span className="font-bold text-blue-800">
                            {employeeEOSB.currency} {fmtNumber(item.amount)}
                          </span>
                        </div>
                      ))}
                      {employeeEOSB.cappedAt && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                          <Info className="w-3.5 h-3.5 shrink-0" />
                          Capped at 2 years&apos; basic salary (UAE Labour Law Article 51):{' '}
                          {employeeEOSB.currency} {fmtNumber(employeeEOSB.cappedAt)}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-blue-600 mt-3 border-t border-blue-200 pt-2">
                      {employeeEOSB.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pension Plans Tab */}
          {activeTab === 'pension' && (
            <div className="space-y-4">
              {pensionPlans.map((plan) => (
                <div key={plan.id} className="border border-slate-200 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Globe className="w-4 h-4 text-slate-400" />
                        <p className="font-semibold text-slate-800">{plan.name}</p>
                      </div>
                      <p className="text-xs text-slate-500">
                        {plan.provider} · {plan.country}
                      </p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium capitalize">
                      {plan.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">{plan.description}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                    {[
                      {
                        label: 'Employee Contribution',
                        value: `${plan.employeeContributionRate}%`,
                      },
                      {
                        label: 'Employer Match',
                        value: `${plan.employerMatchRate}% (up to ${plan.employerMatchCap}%)`,
                      },
                      {
                        label: 'Vesting',
                        value:
                          plan.vestingSchedule.length === 1 &&
                          plan.vestingSchedule[0].vestedPercent === 100
                            ? 'Immediate'
                            : `${plan.vestingSchedule[plan.vestingSchedule.length - 1].years}-year graded`,
                      },
                      { label: 'Country', value: plan.country },
                    ].map((item) => (
                      <div key={item.label} className="bg-slate-50 rounded-lg p-2.5">
                        <p className="text-xs text-slate-500 mb-0.5">{item.label}</p>
                        <p className="text-xs font-semibold text-slate-700">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>

                  {/* Vesting Schedule */}
                  {plan.vestingSchedule.length > 1 && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-xs font-medium text-slate-500 mb-2">Vesting Schedule</p>
                      <div className="flex gap-2">
                        {plan.vestingSchedule.map((v) => (
                          <div key={v.years} className="text-center flex-1">
                            <div
                              className={`h-1 rounded-full mb-1 ${v.vestedPercent === 100 ? 'bg-emerald-500' : v.vestedPercent > 0 ? 'bg-blue-400' : 'bg-slate-200'}`}
                            />
                            <p className="text-xs text-slate-500">Yr {v.years}</p>
                            <p className="text-xs font-bold text-slate-700">{v.vestedPercent}%</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Contribution History */}
              <div className="border border-slate-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-slate-700 mb-3">Contribution History</p>
                <ContributionBar records={contributions} />
              </div>
            </div>
          )}

          {/* Retirement Planner Tab */}
          {activeTab === 'retirement' && (
            <div className="max-w-2xl space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Current Age: <span className="text-blue-600 font-bold">{currentAge}</span>
                  </label>
                  <input
                    type="range"
                    min="22"
                    max="64"
                    value={currentAge}
                    onChange={(e) => setCurrentAge(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Retirement Age: <span className="text-blue-600 font-bold">{retirementAge}</span>
                  </label>
                  <input
                    type="range"
                    min={currentAge + 1}
                    max="72"
                    value={retirementAge}
                    onChange={(e) => setRetirementAge(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Annual Salary ($)
                  </label>
                  <input
                    type="number"
                    value={currentSalary}
                    onChange={(e) => setCurrentSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Current Savings ($)
                  </label>
                  <input
                    type="number"
                    value={currentSavings}
                    onChange={(e) => setCurrentSavings(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>

              <button
                onClick={calculateRetirement}
                disabled={calculating}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-sm"
              >
                {calculating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Target className="w-4 h-4" />
                )}
                Calculate Retirement Projection
              </button>

              {projection && (
                <div className="space-y-4">
                  {/* Key Numbers */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      {
                        label: 'Projected Balance',
                        value: `$${(projection.projectedBalance / 1_000_000).toFixed(2)}M`,
                        color: 'text-blue-700',
                      },
                      {
                        label: 'Monthly Income',
                        value: `$${fmtNumber(projection.monthlyRetirementIncome)}`,
                        color: 'text-emerald-700',
                      },
                      {
                        label: 'Replacement Ratio',
                        value: `${projection.replacementRatio}%`,
                        color:
                          projection.replacementRatio >= 70 ? 'text-emerald-700' : 'text-amber-700',
                      },
                      {
                        label: 'Years to Retire',
                        value: projection.yearsToRetirement,
                        color: 'text-purple-700',
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center"
                      >
                        <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Scenarios */}
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-3">
                      Growth Rate Scenarios
                    </p>
                    <div className="space-y-2">
                      {projection.scenarios.map((s) => (
                        <div
                          key={s.label}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200"
                        >
                          <p className="text-sm font-medium text-slate-700">{s.label}</p>
                          <div className="text-right">
                            <p className="text-sm font-bold text-slate-800">
                              ${(s.projectedBalance / 1_000_000).toFixed(2)}M
                            </p>
                            <p className="text-xs text-slate-500">
                              ${fmtNumber(s.monthlyIncome)}/mo income
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-800">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    Projections assume{' '}
                    {((projection.annualContribution / projection.currentSalary) * 100).toFixed(0)}%
                    annual contribution ({fmtCurrency(projection.annualContribution, 'USD')}).
                    Actual results will vary. This is not financial advice.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
