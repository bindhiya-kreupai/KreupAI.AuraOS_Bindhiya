// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
'use client';

import React, { useState, useMemo } from 'react';
import {
  PiggyBank,
  Building2,
  Clock,
  PieChart,
  ArrowUpRight,
  Calendar,
  SlidersHorizontal,
  Scale,
  UserPlus,
  FileEdit,
  Landmark,
  BarChart3,
  Users,
  Receipt,
  AlertTriangle,
  ChevronRight,
  Info,
  Check,
  Shield,
  _CircleDollarSign,
  Percent,
  Target,
  Heart,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// TypeScript Interfaces
// ---------------------------------------------------------------------------

interface InvestmentAllocation {
  name: string;
  ticker: string;
  percentage: number;
  targetPercentage: number;
  color: string;
  returnYTD: number;
  expenseRatio: number;
  feePaidYTD: number;
}

interface VestingSchedule {
  year: number;
  percentage: number;
  vested: boolean;
}

interface ScenarioProjection {
  rate: number;
  annualContribution: number;
  projectedAt65: number;
  monthlyRetirementIncome: number;
}

interface RothVsTraditionalComparison {
  currentTaxBracket: number;
  estimatedRetirementBracket: number;
  traditionalTaxSavingsNow: number;
  rothTaxFreeAtRetirement: number;
  traditional30YearValue: number;
  roth30YearValue: number;
}

interface CatchUpContribution {
  eligible: boolean;
  age: number;
  standardLimit: number;
  catchUpLimit: number;
  totalLimit: number;
  currentContribution: number;
}

interface ContributionChangeRequest {
  currentRate: number;
  newRate: number;
  effectiveDate: string;
}

interface LoanInfo {
  loansAvailable: boolean;
  maxLoanAmount: number;
  vestedBalance: number;
  outstandingLoanBalance: number;
  outstandingLoans: OutstandingLoan[];
  hardshipWithdrawalAvailable: boolean;
  hardshipRequirements: string[];
}

interface OutstandingLoan {
  id: string;
  originalAmount: number;
  remainingBalance: number;
  interestRate: number;
  monthlyPayment: number;
  maturityDate: string;
}

interface BalanceHistory {
  year: number;
  endBalance: number;
  contributions: number;
  growth: number;
}

interface Beneficiary {
  name: string;
  relationship: string;
  percentage: number;
  type: 'primary' | 'contingent';
  dateOfBirth: string;
}

interface FeeInfo {
  totalFeesYTD: number;
  adminFeesYTD: number;
  investmentFeesYTD: number;
  weightedExpenseRatio: number;
}

interface RebalancingAlert {
  needsRebalancing: boolean;
  drifts: AllocationDrift[];
  lastRebalancedDate: string;
  autoRebalanceEnabled: boolean;
}

interface AllocationDrift {
  fundName: string;
  currentPercent: number;
  targetPercent: number;
  driftPercent: number;
}

interface RetirementData {
  planType: string;
  planName: string;
  planNumber: string;
  currentBalance: number;
  contributionRate: number;
  maxContributionRate: number;
  annualSalary: number;
  annualContribution: number;
  employerMatchPercent: number;
  employerMatchLimit: number;
  employerMatchYTD: number;
  employeeContributionYTD: number;
  vestingSchedule: VestingSchedule[];
  currentVested: number;
  investments: InvestmentAllocation[];
  ytdReturn: number;
  ytdReturnPercent: number;
  projectedBalance65: number;
  scenarioProjections: ScenarioProjection[];
  rothVsTraditional: RothVsTraditionalComparison;
  catchUpContribution: CatchUpContribution;
  loanInfo: LoanInfo;
  balanceHistory: BalanceHistory[];
  beneficiaries: Beneficiary[];
  feeInfo: FeeInfo;
  rebalancingAlert: RebalancingAlert;
}

// ---------------------------------------------------------------------------
// Comprehensive Mock Data
// ---------------------------------------------------------------------------

const mockData: RetirementData = {
  planType: '401(k)',
  planName: 'KreupAI Retirement Savings Plan',
  planNumber: 'PLN-2024-0891',
  currentBalance: 187450.32,
  contributionRate: 12,
  maxContributionRate: 75,
  annualSalary: 165000,
  annualContribution: 19800,
  employerMatchPercent: 50,
  employerMatchLimit: 6,
  employerMatchYTD: 4950,
  employeeContributionYTD: 9900,
  vestingSchedule: [
    { year: 1, percentage: 25, vested: true },
    { year: 2, percentage: 50, vested: true },
    { year: 3, percentage: 75, vested: true },
    { year: 4, percentage: 100, vested: false },
  ],
  currentVested: 75,
  investments: [
    {
      name: 'S&P 500 Index',
      ticker: 'VFIAX',
      percentage: 45,
      targetPercentage: 40,
      color: '#4F46E5',
      returnYTD: 12.4,
      expenseRatio: 0.04,
      feePaidYTD: 33.74,
    },
    {
      name: 'International Equity',
      ticker: 'VTIAX',
      percentage: 20,
      targetPercentage: 25,
      color: '#10B981',
      returnYTD: 8.7,
      expenseRatio: 0.11,
      feePaidYTD: 41.24,
    },
    {
      name: 'Bond Index',
      ticker: 'VBTLX',
      percentage: 20,
      targetPercentage: 20,
      color: '#F59E0B',
      returnYTD: 3.2,
      expenseRatio: 0.05,
      feePaidYTD: 18.75,
    },
    {
      name: 'Target Date 2055',
      ticker: 'VFFVX',
      percentage: 10,
      targetPercentage: 10,
      color: '#8B5CF6',
      returnYTD: 9.8,
      expenseRatio: 0.12,
      feePaidYTD: 22.49,
    },
    {
      name: 'REIT Fund',
      ticker: 'VGSLX',
      percentage: 5,
      targetPercentage: 5,
      color: '#EC4899',
      returnYTD: 5.1,
      expenseRatio: 0.12,
      feePaidYTD: 11.24,
    },
  ],
  ytdReturn: 18234.56,
  ytdReturnPercent: 10.8,
  projectedBalance65: 2450000,
  scenarioProjections: [
    {
      rate: 6,
      annualContribution: 9900,
      projectedAt65: 1480000,
      monthlyRetirementIncome: 5920,
    },
    {
      rate: 10,
      annualContribution: 16500,
      projectedAt65: 2150000,
      monthlyRetirementIncome: 8600,
    },
    {
      rate: 12,
      annualContribution: 19800,
      projectedAt65: 2450000,
      monthlyRetirementIncome: 9800,
    },
    {
      rate: 15,
      annualContribution: 23375,
      projectedAt65: 2950000,
      monthlyRetirementIncome: 11800,
    },
    {
      rate: 20,
      annualContribution: 23500,
      projectedAt65: 3250000,
      monthlyRetirementIncome: 13000,
    },
  ],
  rothVsTraditional: {
    currentTaxBracket: 24,
    estimatedRetirementBracket: 22,
    traditionalTaxSavingsNow: 4752,
    rothTaxFreeAtRetirement: 588000,
    traditional30YearValue: 2450000,
    roth30YearValue: 2450000,
  },
  catchUpContribution: {
    eligible: false,
    age: 38,
    standardLimit: 23500,
    catchUpLimit: 7500,
    totalLimit: 23500,
    currentContribution: 19800,
  },
  loanInfo: {
    loansAvailable: true,
    maxLoanAmount: 70293.87,
    vestedBalance: 140587.74,
    outstandingLoanBalance: 8500,
    outstandingLoans: [
      {
        id: 'LN-2024-0012',
        originalAmount: 15000,
        remainingBalance: 8500,
        interestRate: 5.5,
        monthlyPayment: 287.42,
        maturityDate: '2027-06-15',
      },
    ],
    hardshipWithdrawalAvailable: true,
    hardshipRequirements: [
      'Medical expenses exceeding 7.5% of AGI',
      'Prevention of eviction or foreclosure',
      'Funeral or burial expenses',
      'Certain home repairs',
    ],
  },
  balanceHistory: [
    { year: 2023, endBalance: 128450, contributions: 18000, growth: 14200 },
    { year: 2024, endBalance: 162300, contributions: 19200, growth: 14650 },
    { year: 2025, endBalance: 187450, contributions: 19800, growth: 5350 },
  ],
  beneficiaries: [
    {
      name: 'Sarah Johnson',
      relationship: 'Spouse',
      percentage: 100,
      type: 'primary',
      dateOfBirth: '1990-03-15',
    },
    {
      name: 'Michael Johnson',
      relationship: 'Son',
      percentage: 50,
      type: 'contingent',
      dateOfBirth: '2018-07-22',
    },
    {
      name: 'Emily Johnson',
      relationship: 'Daughter',
      percentage: 50,
      type: 'contingent',
      dateOfBirth: '2021-01-10',
    },
  ],
  feeInfo: {
    totalFeesYTD: 127.46,
    adminFeesYTD: 45.0,
    investmentFeesYTD: 82.46,
    weightedExpenseRatio: 0.068,
  },
  rebalancingAlert: {
    needsRebalancing: true,
    drifts: [
      {
        fundName: 'S&P 500 Index',
        currentPercent: 45,
        targetPercent: 40,
        driftPercent: 5,
      },
      {
        fundName: 'International Equity',
        currentPercent: 20,
        targetPercent: 25,
        driftPercent: -5,
      },
    ],
    lastRebalancedDate: '2025-09-15',
    autoRebalanceEnabled: false,
  },
};

// ---------------------------------------------------------------------------
// Utility Helpers
// ---------------------------------------------------------------------------

const formatCurrency = (amount: number, decimals: number = 0) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(amount);

const formatPercent = (value: number, decimals: number = 1) =>
  `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;

// ---------------------------------------------------------------------------
// Sub-Components
// ---------------------------------------------------------------------------

function SectionCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-deep-cosmos/60 p-5 ${className}`}
    >
      {children}
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  badge,
}: {
  icon: React.ElementType;
  title: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-base font-semibold text-ink-black dark:text-pearl flex items-center gap-2">
        <Icon className="w-5 h-5 text-celestial-indigo" />
        {title}
      </h3>
      {badge}
    </div>
  );
}

function StatRow({
  label,
  value,
  valueClassName = 'text-ink-black dark:text-pearl',
}: {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-silver-mist">{label}</span>
      <span className={`text-sm font-medium ${valueClassName}`}>{value}</span>
    </div>
  );
}

function Badge({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}) {
  const styles = {
    default: 'bg-cloud dark:bg-nebula-purple/20 text-silver-mist',
    success: 'bg-aurora-green/10 text-aurora-green border border-aurora-green/20',
    warning: 'bg-sunset-amber/10 text-sunset-amber border border-sunset-amber/20',
    danger: 'bg-coral-alert/10 text-coral-alert border border-coral-alert/20',
    info: 'bg-celestial-indigo/10 text-celestial-indigo border border-celestial-indigo/20',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function RetirementDashboard() {
  const data = mockData;

  // Scenario slider state
  const [selectedScenarioIdx, setSelectedScenarioIdx] = useState<number>(
    data.scenarioProjections.findIndex((s) => s.rate === data.contributionRate)
  );
  const selectedScenario =
    data.scenarioProjections[selectedScenarioIdx] ?? data.scenarioProjections[2];

  // Contribution change form state
  const [changeForm, setChangeForm] = useState<ContributionChangeRequest>({
    currentRate: data.contributionRate,
    newRate: data.contributionRate,
    effectiveDate: '2026-04-01',
  });
  const [changeSubmitted, setChangeSubmitted] = useState(false);

  // Roth vs Traditional tab
  const [showRoth, setShowRoth] = useState(false);

  // Balance history max for bar chart scaling
  const maxBalance = useMemo(
    () => Math.max(...data.balanceHistory.map((h) => h.endBalance)),
    [data.balanceHistory]
  );

  return (
    <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-1">
          <PiggyBank className="w-7 h-7 text-celestial-indigo" />
          <div>
            <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">
              Retirement Dashboard
            </h1>
            <p className="text-sm text-silver-mist">
              {data.planName} &middot; {data.planType} &middot;{' '}
              <span className="font-mono text-xs">{data.planNumber}</span>
            </p>
          </div>
        </div>

        {/* Rebalancing Alert Banner */}
        {data.rebalancingAlert.needsRebalancing && (
          <div className="mt-4 mb-2 rounded-xl border border-sunset-amber/40 bg-sunset-amber/5 dark:bg-sunset-amber/10 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-sunset-amber flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-sunset-amber">
                Portfolio Rebalancing Recommended
              </p>
              <p className="text-xs text-silver-mist mt-1">
                Your allocation has drifted from target. Last rebalanced on{' '}
                {data.rebalancingAlert.lastRebalancedDate}.
                {!data.rebalancingAlert.autoRebalanceEnabled &&
                  ' Auto-rebalancing is currently disabled.'}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {data.rebalancingAlert.drifts.map((d) => (
                  <span
                    key={d.fundName}
                    className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md ${
                      d.driftPercent > 0
                        ? 'bg-sunset-amber/10 text-sunset-amber'
                        : 'bg-celestial-indigo/10 text-celestial-indigo'
                    }`}
                  >
                    {d.fundName}: {d.driftPercent > 0 ? '+' : ''}
                    {d.driftPercent}%
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* ROW 1 — Balance & Contribution Rate                               */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-6">
          {/* Current Balance */}
          <SectionCard className="md:col-span-2 bg-gradient-to-br from-celestial-indigo/5 to-transparent dark:from-celestial-indigo/10">
            <p className="text-sm text-silver-mist mb-1">Current Balance</p>
            <p className="text-4xl font-bold text-ink-black dark:text-pearl">
              {formatCurrency(data.currentBalance, 2)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <ArrowUpRight className="w-4 h-4 text-aurora-green" />
              <span className="text-sm text-aurora-green font-medium">
                {formatCurrency(data.ytdReturn, 2)} ({formatPercent(data.ytdReturnPercent)}) YTD
              </span>
            </div>
            <div className="flex items-center gap-6 mt-4 text-xs text-silver-mist">
              <span>
                Vested:{' '}
                <span className="text-ink-black dark:text-pearl font-medium">
                  {formatCurrency(data.currentBalance * (data.currentVested / 100))}
                </span>
              </span>
              <span>
                Employee YTD:{' '}
                <span className="text-ink-black dark:text-pearl font-medium">
                  {formatCurrency(data.employeeContributionYTD)}
                </span>
              </span>
              <span>
                Employer YTD:{' '}
                <span className="text-ink-black dark:text-pearl font-medium">
                  {formatCurrency(data.employerMatchYTD)}
                </span>
              </span>
            </div>
            <p className="text-xs text-silver-mist mt-3">
              Projected at retirement (age 65):{' '}
              <span className="text-ink-black dark:text-pearl font-semibold">
                {formatCurrency(data.projectedBalance65)}
              </span>
            </p>
          </SectionCard>

          {/* Contribution Rate */}
          <SectionCard>
            <p className="text-sm text-silver-mist mb-1">Contribution Rate</p>
            <div className="flex items-baseline gap-1">
              <p className="text-3xl font-bold text-celestial-indigo">{data.contributionRate}%</p>
              <p className="text-sm text-silver-mist">of salary</p>
            </div>
            <p className="text-xs text-silver-mist mt-2">
              {formatCurrency(data.annualContribution)}/year
            </p>
            <div className="mt-3 w-full h-2 rounded-full bg-cloud dark:bg-nebula-purple/30">
              <div
                className="h-full rounded-full bg-celestial-indigo transition-all"
                style={{
                  width: `${(data.contributionRate / data.maxContributionRate) * 100}%`,
                }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <p className="text-xs text-silver-mist">Max: {data.maxContributionRate}%</p>
              <p className="text-xs text-silver-mist">
                IRS limit: {formatCurrency(data.catchUpContribution.totalLimit)}
              </p>
            </div>
            {data.catchUpContribution.eligible && (
              <div className="mt-3 p-2 rounded-lg bg-celestial-indigo/5 border border-celestial-indigo/20">
                <p className="text-xs text-celestial-indigo">
                  Catch-up eligible: +{formatCurrency(data.catchUpContribution.catchUpLimit)}{' '}
                  additional
                </p>
              </div>
            )}
          </SectionCard>
        </div>

        {/* ================================================================= */}
        {/* ROW 2 — Employer Match & Vesting                                  */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Employer Match */}
          <SectionCard>
            <SectionHeader icon={Building2} title="Employer Match" />
            <div className="space-y-3">
              <StatRow
                label="Match Formula"
                value={`${data.employerMatchPercent}% up to ${data.employerMatchLimit}% of salary`}
              />
              <StatRow
                label="Employer Match YTD"
                value={formatCurrency(data.employerMatchYTD)}
                valueClassName="text-aurora-green font-bold"
              />
              <StatRow
                label="Max Annual Match"
                value={formatCurrency(
                  ((data.annualSalary * data.employerMatchLimit) / 100) *
                    (data.employerMatchPercent / 100)
                )}
              />
              {data.contributionRate >= data.employerMatchLimit ? (
                <div className="p-3 rounded-lg bg-aurora-green/5 border border-aurora-green/20">
                  <p className="text-xs text-aurora-green flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    You are maximizing your employer match. Keep it up!
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-sunset-amber/5 border border-sunset-amber/20">
                  <p className="text-xs text-sunset-amber flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    Increase to {data.employerMatchLimit}% to get full employer match (
                    {formatCurrency(
                      ((data.annualSalary * data.employerMatchLimit) / 100) *
                        (data.employerMatchPercent / 100) -
                        data.employerMatchYTD * 2
                    )}{' '}
                    more per year).
                  </p>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Vesting Schedule */}
          <SectionCard>
            <SectionHeader icon={Clock} title="Vesting Schedule" />
            <div className="space-y-3">
              {data.vestingSchedule.map((vs) => (
                <div key={vs.year} className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      vs.vested
                        ? 'bg-aurora-green/10 text-aurora-green'
                        : 'bg-cloud dark:bg-nebula-purple/20 text-silver-mist'
                    }`}
                  >
                    {vs.vested ? <Check className="w-3.5 h-3.5" /> : vs.year}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-ink-black dark:text-pearl">Year {vs.year}</span>
                      <span
                        className={`text-sm font-medium ${
                          vs.vested ? 'text-aurora-green' : 'text-silver-mist'
                        }`}
                      >
                        {vs.percentage}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-cloud dark:bg-nebula-purple/30">
                      <div
                        className={`h-full rounded-full transition-all ${
                          vs.vested ? 'bg-aurora-green' : 'bg-silver-mist/30'
                        }`}
                        style={{ width: `${vs.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <p className="text-xs text-silver-mist pt-2 border-t border-cloud dark:border-nebula-purple/50">
                Currently {data.currentVested}% vested in employer contributions
              </p>
            </div>
          </SectionCard>
        </div>

        {/* ================================================================= */}
        {/* ROW 3 — Investment Allocation (full width)                        */}
        {/* ================================================================= */}
        <SectionCard className="mb-6">
          <SectionHeader icon={PieChart} title="Investment Allocation" />
          <div className="space-y-3">
            {data.investments.map((inv) => (
              <div key={inv.name} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: inv.color }}
                />
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-ink-black dark:text-pearl">{inv.name}</span>
                  <span className="text-xs text-silver-mist ml-1.5">{inv.ticker}</span>
                </div>
                <div className="w-32 hidden sm:block">
                  <div className="w-full h-2 rounded-full bg-cloud dark:bg-nebula-purple/30">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${inv.percentage}%`,
                        backgroundColor: inv.color,
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-ink-black dark:text-pearl w-12 text-right">
                  {inv.percentage}%
                </span>
                <span className="text-xs text-silver-mist w-14 text-right hidden md:block">
                  T: {inv.targetPercentage}%
                </span>
                <span
                  className={`text-xs font-medium w-16 text-right ${
                    inv.returnYTD >= 0 ? 'text-aurora-green' : 'text-coral-alert'
                  }`}
                >
                  {formatPercent(inv.returnYTD)}
                </span>
                <span className="text-xs text-silver-mist w-16 text-right hidden lg:block">
                  ER: {inv.expenseRatio.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ================================================================= */}
        {/* ROW 4 — Scenario Projections & Roth vs Traditional                */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Scenario Projections */}
          <SectionCard>
            <SectionHeader icon={SlidersHorizontal} title="Scenario Projections" />
            <div className="space-y-4">
              {/* Interactive Slider */}
              <div>
                <label className="text-xs text-silver-mist block mb-2">
                  Adjust contribution rate to see projections
                </label>
                <input
                  type="range"
                  min={0}
                  max={data.scenarioProjections.length - 1}
                  step={1}
                  value={selectedScenarioIdx}
                  onChange={(e) => setSelectedScenarioIdx(Number(e.target.value))}
                  className="w-full h-2 bg-cloud dark:bg-nebula-purple/30 rounded-full appearance-none cursor-pointer accent-celestial-indigo"
                />
                <div className="flex justify-between mt-1">
                  {data.scenarioProjections.map((s) => (
                    <span
                      key={s.rate}
                      className={`text-xs ${
                        s.rate === selectedScenario.rate
                          ? 'text-celestial-indigo font-bold'
                          : 'text-silver-mist'
                      }`}
                    >
                      {s.rate}%
                    </span>
                  ))}
                </div>
              </div>

              {/* Selected scenario detail */}
              <div className="rounded-lg border border-celestial-indigo/20 bg-celestial-indigo/5 dark:bg-celestial-indigo/10 p-4">
                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-sm text-silver-mist">
                    At {selectedScenario.rate}% contribution
                  </span>
                  <span className="text-lg font-bold text-celestial-indigo">
                    {formatCurrency(selectedScenario.projectedAt65)}
                  </span>
                </div>
                <div className="space-y-2">
                  <StatRow
                    label="Annual Contribution"
                    value={formatCurrency(selectedScenario.annualContribution)}
                  />
                  <StatRow
                    label="Est. Monthly Income at 65"
                    value={formatCurrency(selectedScenario.monthlyRetirementIncome)}
                    valueClassName="text-aurora-green font-semibold"
                  />
                </div>
              </div>

              {/* All scenarios comparison bars */}
              <div className="space-y-2">
                {data.scenarioProjections.map((s, idx) => {
                  const maxVal = Math.max(...data.scenarioProjections.map((p) => p.projectedAt65));
                  const pct = (s.projectedAt65 / maxVal) * 100;
                  const isSelected = idx === selectedScenarioIdx;
                  const isCurrent = s.rate === data.contributionRate;
                  return (
                    <div key={s.rate} className="flex items-center gap-3">
                      <span
                        className={`text-xs w-8 text-right ${
                          isSelected ? 'text-celestial-indigo font-bold' : 'text-silver-mist'
                        }`}
                      >
                        {s.rate}%
                      </span>
                      <div className="flex-1 h-4 rounded bg-cloud dark:bg-nebula-purple/20 relative overflow-hidden">
                        <div
                          className={`h-full rounded transition-all ${
                            isSelected
                              ? 'bg-celestial-indigo'
                              : isCurrent
                                ? 'bg-celestial-indigo/60'
                                : 'bg-silver-mist/40'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                        {isCurrent && (
                          <span className="absolute right-1 top-0.5 text-[10px] text-celestial-indigo font-medium">
                            current
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-ink-black dark:text-pearl w-16 text-right">
                        {formatCurrency(s.projectedAt65 / 1000)}k
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </SectionCard>

          {/* Roth vs Traditional Comparison */}
          <SectionCard>
            <SectionHeader icon={Scale} title="Roth vs Traditional Comparison" />
            {/* Toggle */}
            <div className="flex rounded-lg border border-cloud dark:border-nebula-purple/50 overflow-hidden mb-4">
              <button
                onClick={() => setShowRoth(false)}
                className={`flex-1 text-sm py-2 px-3 font-medium transition-colors ${
                  !showRoth
                    ? 'bg-celestial-indigo text-pearl'
                    : 'bg-transparent text-silver-mist hover:text-ink-black dark:hover:text-pearl'
                }`}
              >
                Traditional 401(k)
              </button>
              <button
                onClick={() => setShowRoth(true)}
                className={`flex-1 text-sm py-2 px-3 font-medium transition-colors ${
                  showRoth
                    ? 'bg-celestial-indigo text-pearl'
                    : 'bg-transparent text-silver-mist hover:text-ink-black dark:hover:text-pearl'
                }`}
              >
                Roth 401(k)
              </button>
            </div>

            <div className="space-y-3">
              {!showRoth ? (
                <>
                  <div className="p-3 rounded-lg bg-neural-mint/5 dark:bg-neural-mint/10 border border-neural-mint/20">
                    <p className="text-xs font-semibold text-neural-mint mb-1">Tax Savings Now</p>
                    <p className="text-lg font-bold text-ink-black dark:text-pearl">
                      {formatCurrency(data.rothVsTraditional.traditionalTaxSavingsNow)}/year
                    </p>
                    <p className="text-xs text-silver-mist mt-1">
                      Pre-tax contributions reduce your current taxable income
                    </p>
                  </div>
                  <StatRow
                    label="Current Tax Bracket"
                    value={`${data.rothVsTraditional.currentTaxBracket}%`}
                  />
                  <StatRow
                    label="Estimated Bracket at Retirement"
                    value={`${data.rothVsTraditional.estimatedRetirementBracket}%`}
                  />
                  <StatRow
                    label="Projected 30-Year Value"
                    value={formatCurrency(data.rothVsTraditional.traditional30YearValue)}
                    valueClassName="text-ink-black dark:text-pearl font-bold"
                  />
                  <div className="p-3 rounded-lg bg-sunset-amber/5 border border-sunset-amber/20">
                    <p className="text-xs text-sunset-amber flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Withdrawals in retirement are taxed as ordinary income
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 rounded-lg bg-aurora-green/5 dark:bg-aurora-green/10 border border-aurora-green/20">
                    <p className="text-xs font-semibold text-aurora-green mb-1">
                      Tax-Free at Retirement
                    </p>
                    <p className="text-lg font-bold text-ink-black dark:text-pearl">
                      {formatCurrency(data.rothVsTraditional.rothTaxFreeAtRetirement)}
                    </p>
                    <p className="text-xs text-silver-mist mt-1">
                      Estimated tax-free withdrawals over retirement
                    </p>
                  </div>
                  <StatRow label="Contributions" value="After-tax dollars" />
                  <StatRow
                    label="Growth & Withdrawals"
                    value="100% tax-free"
                    valueClassName="text-aurora-green font-semibold"
                  />
                  <StatRow
                    label="Projected 30-Year Value"
                    value={formatCurrency(data.rothVsTraditional.roth30YearValue)}
                    valueClassName="text-ink-black dark:text-pearl font-bold"
                  />
                  <div className="p-3 rounded-lg bg-celestial-indigo/5 border border-celestial-indigo/20">
                    <p className="text-xs text-celestial-indigo flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Best if you expect your tax bracket to be higher in retirement
                    </p>
                  </div>
                </>
              )}

              {/* Side by Side Summary */}
              <div className="pt-3 border-t border-cloud dark:border-nebula-purple/50">
                <p className="text-xs font-semibold text-ink-black dark:text-pearl mb-2">
                  Quick Comparison
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 rounded-lg bg-cloud/50 dark:bg-nebula-purple/10">
                    <p className="text-[10px] text-silver-mist uppercase tracking-wide">
                      Traditional
                    </p>
                    <p className="text-xs font-bold text-ink-black dark:text-pearl mt-1">
                      Save {formatCurrency(data.rothVsTraditional.traditionalTaxSavingsNow)}/yr tax
                    </p>
                    <p className="text-[10px] text-silver-mist">Taxed on withdrawal</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-cloud/50 dark:bg-nebula-purple/10">
                    <p className="text-[10px] text-silver-mist uppercase tracking-wide">Roth</p>
                    <p className="text-xs font-bold text-ink-black dark:text-pearl mt-1">
                      {formatCurrency(data.rothVsTraditional.rothTaxFreeAtRetirement)} tax-free
                    </p>
                    <p className="text-[10px] text-silver-mist">Tax-free growth</p>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ================================================================= */}
        {/* ROW 5 — Catch-Up Contributions & Contribution Change Form         */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Catch-Up Contributions */}
          <SectionCard>
            <SectionHeader
              icon={UserPlus}
              title="Catch-Up Contributions"
              badge={
                data.catchUpContribution.eligible ? (
                  <Badge variant="success">Eligible</Badge>
                ) : (
                  <Badge variant="default">Not Eligible</Badge>
                )
              }
            />
            <div className="space-y-3">
              <StatRow label="Your Age" value={`${data.catchUpContribution.age}`} />
              <StatRow
                label="Standard IRS Limit (2026)"
                value={formatCurrency(data.catchUpContribution.standardLimit)}
              />
              <StatRow
                label="Catch-Up Limit (Age 50+)"
                value={formatCurrency(data.catchUpContribution.catchUpLimit)}
              />
              <div className="border-t border-cloud dark:border-nebula-purple/50 pt-2">
                <StatRow
                  label="Your Total Limit"
                  value={formatCurrency(data.catchUpContribution.totalLimit)}
                  valueClassName="text-celestial-indigo font-bold"
                />
              </div>

              {/* Progress toward limit */}
              <div>
                <div className="flex justify-between text-xs text-silver-mist mb-1">
                  <span>Current annual contribution</span>
                  <span>
                    {formatCurrency(data.catchUpContribution.currentContribution)} /{' '}
                    {formatCurrency(data.catchUpContribution.totalLimit)}
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-cloud dark:bg-nebula-purple/30">
                  <div
                    className="h-full rounded-full bg-celestial-indigo transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        (data.catchUpContribution.currentContribution /
                          data.catchUpContribution.totalLimit) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {!data.catchUpContribution.eligible ? (
                <div className="p-3 rounded-lg bg-celestial-indigo/5 border border-celestial-indigo/20">
                  <p className="text-xs text-celestial-indigo flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    Catch-up contributions are available at age 50+. You have{' '}
                    {50 - data.catchUpContribution.age} years until eligibility.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-aurora-green/5 border border-aurora-green/20">
                  <p className="text-xs text-aurora-green flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    You can contribute up to {formatCurrency(
                      data.catchUpContribution.totalLimit
                    )}{' '}
                    total this year!
                  </p>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Contribution Change Form */}
          <SectionCard>
            <SectionHeader icon={FileEdit} title="Change Contribution Rate" />
            {changeSubmitted ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-12 h-12 rounded-full bg-aurora-green/10 flex items-center justify-center mb-3">
                  <Check className="w-6 h-6 text-aurora-green" />
                </div>
                <p className="text-sm font-semibold text-ink-black dark:text-pearl">
                  Change Request Submitted
                </p>
                <p className="text-xs text-silver-mist mt-1 text-center">
                  Your contribution rate will change from {changeForm.currentRate}% to{' '}
                  {changeForm.newRate}% effective {changeForm.effectiveDate}.
                </p>
                <button
                  onClick={() => setChangeSubmitted(false)}
                  className="mt-4 text-xs text-celestial-indigo hover:underline"
                >
                  Submit another change
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-silver-mist block mb-1">Current Rate</label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-cloud/30 dark:bg-nebula-purple/10">
                    <Percent className="w-4 h-4 text-silver-mist" />
                    <span className="text-sm text-ink-black dark:text-pearl font-medium">
                      {changeForm.currentRate}%
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-silver-mist block mb-1">
                    New Contribution Rate
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={data.maxContributionRate}
                      value={changeForm.newRate}
                      onChange={(e) =>
                        setChangeForm((f) => ({
                          ...f,
                          newRate: Math.min(Number(e.target.value), data.maxContributionRate),
                        }))
                      }
                      className="flex-1 px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-deep-cosmos text-sm text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50"
                    />
                    <span className="text-sm text-silver-mist">%</span>
                  </div>
                  <p className="text-xs text-silver-mist mt-1">
                    New annual: ~{formatCurrency((data.annualSalary * changeForm.newRate) / 100)}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-silver-mist block mb-1">Effective Date</label>
                  <input
                    type="date"
                    value={changeForm.effectiveDate}
                    onChange={(e) =>
                      setChangeForm((f) => ({
                        ...f,
                        effectiveDate: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-deep-cosmos text-sm text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50"
                  />
                </div>
                <button
                  onClick={() => setChangeSubmitted(true)}
                  disabled={changeForm.newRate === changeForm.currentRate}
                  className="w-full py-2.5 rounded-lg bg-celestial-indigo text-pearl text-sm font-medium hover:bg-celestial-indigo/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Submit Change Request
                </button>
                <p className="text-[10px] text-silver-mist text-center">
                  Changes typically take effect within 1-2 pay periods after the effective date.
                </p>
              </div>
            )}
          </SectionCard>
        </div>

        {/* ================================================================= */}
        {/* ROW 6 — Loan Info & Balance Growth Timeline                       */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Loan & Hardship Withdrawal */}
          <SectionCard>
            <SectionHeader
              icon={Landmark}
              title="Loans & Hardship Withdrawals"
              badge={
                data.loanInfo.loansAvailable ? (
                  <Badge variant="info">Loans Available</Badge>
                ) : (
                  <Badge variant="default">Loans Unavailable</Badge>
                )
              }
            />
            <div className="space-y-3">
              <StatRow
                label="Vested Balance"
                value={formatCurrency(data.loanInfo.vestedBalance, 2)}
              />
              <StatRow
                label="Max Loan Amount (50% vested)"
                value={formatCurrency(data.loanInfo.maxLoanAmount, 2)}
              />
              <StatRow
                label="Outstanding Loan Balance"
                value={formatCurrency(data.loanInfo.outstandingLoanBalance)}
                valueClassName={
                  data.loanInfo.outstandingLoanBalance > 0
                    ? 'text-sunset-amber font-bold'
                    : 'text-aurora-green font-bold'
                }
              />

              {/* Outstanding loans detail */}
              {data.loanInfo.outstandingLoans.length > 0 && (
                <div className="border-t border-cloud dark:border-nebula-purple/50 pt-3">
                  <p className="text-xs font-semibold text-ink-black dark:text-pearl mb-2">
                    Active Loans
                  </p>
                  {data.loanInfo.outstandingLoans.map((loan) => (
                    <div
                      key={loan.id}
                      className="p-3 rounded-lg bg-cloud/30 dark:bg-nebula-purple/10 border border-cloud dark:border-nebula-purple/30 space-y-1.5"
                    >
                      <div className="flex justify-between">
                        <span className="text-xs font-mono text-silver-mist">{loan.id}</span>
                        <span className="text-xs text-sunset-amber font-medium">
                          {formatCurrency(loan.remainingBalance)} remaining
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-silver-mist">Original</p>
                          <p className="text-ink-black dark:text-pearl font-medium">
                            {formatCurrency(loan.originalAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-silver-mist">Rate</p>
                          <p className="text-ink-black dark:text-pearl font-medium">
                            {loan.interestRate}%
                          </p>
                        </div>
                        <div>
                          <p className="text-silver-mist">Monthly</p>
                          <p className="text-ink-black dark:text-pearl font-medium">
                            {formatCurrency(loan.monthlyPayment, 2)}
                          </p>
                        </div>
                      </div>
                      <p className="text-[10px] text-silver-mist">Matures: {loan.maturityDate}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Hardship Withdrawal */}
              {data.loanInfo.hardshipWithdrawalAvailable && (
                <div className="border-t border-cloud dark:border-nebula-purple/50 pt-3">
                  <p className="text-xs font-semibold text-ink-black dark:text-pearl mb-2 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-silver-mist" />
                    Hardship Withdrawal Qualifying Events
                  </p>
                  <ul className="space-y-1">
                    {data.loanInfo.hardshipRequirements.map((req, i) => (
                      <li key={i} className="text-xs text-silver-mist flex items-start gap-1.5">
                        <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-silver-mist/60" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Balance Growth Timeline */}
          <SectionCard>
            <SectionHeader icon={BarChart3} title="Balance Growth Timeline" />
            <div className="space-y-4">
              {/* Bar chart using CSS */}
              <div className="flex items-end gap-4 h-48 px-2">
                {data.balanceHistory.map((h) => {
                  const heightPct = (h.endBalance / maxBalance) * 100;
                  const growthPct = (h.growth / h.endBalance) * 100;
                  const contribPct = (h.contributions / h.endBalance) * 100;
                  const basePct = 100 - growthPct - contribPct;
                  return (
                    <div key={h.year} className="flex-1 flex flex-col items-center gap-1">
                      {/* Balance label */}
                      <span className="text-xs font-bold text-ink-black dark:text-pearl">
                        {formatCurrency(h.endBalance)}
                      </span>
                      {/* Stacked bar */}
                      <div
                        className="w-full rounded-t-lg overflow-hidden flex flex-col-reverse transition-all"
                        style={{ height: `${heightPct}%` }}
                      >
                        {/* Base (prior balance) */}
                        <div
                          className="w-full bg-celestial-indigo/30"
                          style={{ height: `${basePct}%` }}
                        />
                        {/* Contributions */}
                        <div
                          className="w-full bg-celestial-indigo/60"
                          style={{ height: `${contribPct}%` }}
                        />
                        {/* Growth */}
                        <div
                          className="w-full bg-aurora-green"
                          style={{ height: `${growthPct}%` }}
                        />
                      </div>
                      {/* Year label */}
                      <span className="text-xs text-silver-mist font-medium">{h.year}</span>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-celestial-indigo/30" />
                  <span className="text-silver-mist">Prior Balance</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-celestial-indigo/60" />
                  <span className="text-silver-mist">Contributions</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-aurora-green" />
                  <span className="text-silver-mist">Growth</span>
                </span>
              </div>

              {/* Year-over-year detail table */}
              <div className="border-t border-cloud dark:border-nebula-purple/50 pt-3">
                <div className="grid grid-cols-4 text-[10px] text-silver-mist uppercase tracking-wider mb-2 px-1">
                  <span>Year</span>
                  <span className="text-right">Contributions</span>
                  <span className="text-right">Growth</span>
                  <span className="text-right">End Balance</span>
                </div>
                {data.balanceHistory.map((h) => (
                  <div
                    key={h.year}
                    className="grid grid-cols-4 text-xs px-1 py-1.5 border-b border-cloud/50 dark:border-nebula-purple/20 last:border-0"
                  >
                    <span className="text-ink-black dark:text-pearl font-medium">{h.year}</span>
                    <span className="text-right text-celestial-indigo">
                      {formatCurrency(h.contributions)}
                    </span>
                    <span className="text-right text-aurora-green">{formatCurrency(h.growth)}</span>
                    <span className="text-right text-ink-black dark:text-pearl font-semibold">
                      {formatCurrency(h.endBalance)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ================================================================= */}
        {/* ROW 7 — Beneficiaries & Fee Transparency                         */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Beneficiary Information */}
          <SectionCard>
            <SectionHeader icon={Users} title="Beneficiary Information" />
            <div className="space-y-4">
              {/* Primary */}
              <div>
                <p className="text-xs font-semibold text-silver-mist uppercase tracking-wider mb-2">
                  Primary Beneficiary
                </p>
                {data.beneficiaries
                  .filter((b) => b.type === 'primary')
                  .map((b) => (
                    <div
                      key={b.name}
                      className="flex items-center gap-3 p-3 rounded-lg bg-celestial-indigo/5 dark:bg-celestial-indigo/10 border border-celestial-indigo/20"
                    >
                      <div className="w-10 h-10 rounded-full bg-celestial-indigo/10 flex items-center justify-center">
                        <Heart className="w-5 h-5 text-celestial-indigo" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-ink-black dark:text-pearl">
                          {b.name}
                        </p>
                        <p className="text-xs text-silver-mist">
                          {b.relationship} &middot; DOB: {b.dateOfBirth}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-celestial-indigo">
                        {b.percentage}%
                      </span>
                    </div>
                  ))}
              </div>

              {/* Contingent */}
              <div>
                <p className="text-xs font-semibold text-silver-mist uppercase tracking-wider mb-2">
                  Contingent Beneficiaries
                </p>
                <div className="space-y-2">
                  {data.beneficiaries
                    .filter((b) => b.type === 'contingent')
                    .map((b) => (
                      <div
                        key={b.name}
                        className="flex items-center gap-3 p-3 rounded-lg border border-cloud dark:border-nebula-purple/30"
                      >
                        <div className="w-8 h-8 rounded-full bg-cloud dark:bg-nebula-purple/20 flex items-center justify-center">
                          <Users className="w-4 h-4 text-silver-mist" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-ink-black dark:text-pearl">
                            {b.name}
                          </p>
                          <p className="text-xs text-silver-mist">
                            {b.relationship} &middot; DOB: {b.dateOfBirth}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-ink-black dark:text-pearl">
                          {b.percentage}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-cloud/30 dark:bg-nebula-purple/10 border border-cloud dark:border-nebula-purple/30">
                <p className="text-xs text-silver-mist flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  Review your beneficiaries annually or after major life events (marriage, divorce,
                  birth of a child).
                </p>
              </div>
            </div>
          </SectionCard>

          {/* Fee Transparency */}
          <SectionCard>
            <SectionHeader icon={Receipt} title="Fee Transparency" />
            <div className="space-y-3">
              {/* Fee Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-cloud/30 dark:bg-nebula-purple/10 text-center">
                  <p className="text-[10px] text-silver-mist uppercase tracking-wider">
                    Total Fees YTD
                  </p>
                  <p className="text-lg font-bold text-ink-black dark:text-pearl mt-1">
                    {formatCurrency(data.feeInfo.totalFeesYTD, 2)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-cloud/30 dark:bg-nebula-purple/10 text-center">
                  <p className="text-[10px] text-silver-mist uppercase tracking-wider">
                    Admin Fees
                  </p>
                  <p className="text-lg font-bold text-ink-black dark:text-pearl mt-1">
                    {formatCurrency(data.feeInfo.adminFeesYTD, 2)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-cloud/30 dark:bg-nebula-purple/10 text-center">
                  <p className="text-[10px] text-silver-mist uppercase tracking-wider">
                    Investment Fees
                  </p>
                  <p className="text-lg font-bold text-ink-black dark:text-pearl mt-1">
                    {formatCurrency(data.feeInfo.investmentFeesYTD, 2)}
                  </p>
                </div>
              </div>

              <StatRow
                label="Weighted Avg Expense Ratio"
                value={`${data.feeInfo.weightedExpenseRatio.toFixed(3)}%`}
                valueClassName="text-aurora-green font-bold"
              />

              {/* Per-fund expense ratios */}
              <div className="border-t border-cloud dark:border-nebula-purple/50 pt-3">
                <p className="text-xs font-semibold text-ink-black dark:text-pearl mb-2">
                  Expense Ratios by Fund
                </p>
                <div className="space-y-2">
                  {data.investments.map((inv) => (
                    <div key={inv.name} className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: inv.color }}
                      />
                      <span className="text-xs text-ink-black dark:text-pearl flex-1 truncate">
                        {inv.name}
                      </span>
                      <span className="text-xs font-mono text-silver-mist w-14 text-right">
                        {inv.expenseRatio.toFixed(2)}%
                      </span>
                      <span className="text-xs text-silver-mist w-20 text-right">
                        {formatCurrency(inv.feePaidYTD, 2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fee context */}
              <div className="p-3 rounded-lg bg-aurora-green/5 border border-aurora-green/20">
                <p className="text-xs text-aurora-green flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  Your weighted expense ratio of {data.feeInfo.weightedExpenseRatio.toFixed(3)}% is
                  well below the industry average of 0.44%.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ================================================================= */}
        {/* ROW 8 — Rebalancing Detail (full width, only if needed)           */}
        {/* ================================================================= */}
        {data.rebalancingAlert.needsRebalancing && (
          <SectionCard className="mb-6">
            <SectionHeader
              icon={Target}
              title="Allocation Drift Detail"
              badge={<Badge variant="warning">Rebalancing Needed</Badge>}
            />
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.investments.map((inv) => {
                  const drift = inv.percentage - inv.targetPercentage;
                  const absDrift = Math.abs(drift);
                  const isOverweight = drift > 0;
                  return (
                    <div
                      key={inv.name}
                      className={`p-3 rounded-lg border ${
                        absDrift >= 3
                          ? isOverweight
                            ? 'border-sunset-amber/30 bg-sunset-amber/5 dark:bg-sunset-amber/10'
                            : 'border-celestial-indigo/30 bg-celestial-indigo/5 dark:bg-celestial-indigo/10'
                          : 'border-cloud dark:border-nebula-purple/30 bg-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: inv.color }}
                        />
                        <span className="text-sm font-medium text-ink-black dark:text-pearl truncate">
                          {inv.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-silver-mist">Current</span>
                            <span className="text-ink-black dark:text-pearl font-medium">
                              {inv.percentage}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-cloud dark:bg-nebula-purple/30">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${inv.percentage}%`,
                                backgroundColor: inv.color,
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-silver-mist">Target</span>
                            <span className="text-ink-black dark:text-pearl font-medium">
                              {inv.targetPercentage}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-cloud dark:bg-nebula-purple/30">
                            <div
                              className="h-full rounded-full opacity-50"
                              style={{
                                width: `${inv.targetPercentage}%`,
                                backgroundColor: inv.color,
                              }}
                            />
                          </div>
                        </div>
                        <span
                          className={`text-xs font-bold w-12 text-right ${
                            absDrift >= 3
                              ? isOverweight
                                ? 'text-sunset-amber'
                                : 'text-celestial-indigo'
                              : 'text-aurora-green'
                          }`}
                        >
                          {drift > 0 ? '+' : ''}
                          {drift}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-cloud dark:border-nebula-purple/50">
                <div className="flex items-center gap-2 text-xs text-silver-mist">
                  <Calendar className="w-3.5 h-3.5" />
                  Last rebalanced: {data.rebalancingAlert.lastRebalancedDate}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-silver-mist">Auto-rebalance:</span>
                  <span
                    className={
                      data.rebalancingAlert.autoRebalanceEnabled
                        ? 'text-aurora-green font-medium'
                        : 'text-sunset-amber font-medium'
                    }
                  >
                    {data.rebalancingAlert.autoRebalanceEnabled ? 'On' : 'Off'}
                  </span>
                </div>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Footer disclaimer */}
        <div className="mt-4 pb-6">
          <p className="text-[10px] text-silver-mist/60 text-center leading-relaxed">
            The projections shown are hypothetical and for illustrative purposes only. They are not
            guarantees of future performance. Actual results will vary. Investment returns and
            principal value will fluctuate, so investments may be worth more or less than the
            original cost. Past performance does not guarantee future results. Consult a financial
            advisor for personalized advice.
          </p>
        </div>
      </div>
    </div>
  );
}
