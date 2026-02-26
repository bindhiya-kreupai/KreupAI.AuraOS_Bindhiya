'use client';

import React, { useState, useMemo } from 'react';
import {
  Award,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  ShieldCheck,
  Target,
  BarChart3,
  Receipt,
  CircleDollarSign,
  HandCoins,
  BadgeDollarSign,
  Activity,
  CalendarDays,
  Table2,
  PieChart,
  AlertTriangle,
  Info,
  Play,
  Banknote,
  Layers,
  Star,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// TypeScript interfaces
// ---------------------------------------------------------------------------

type GrantType = 'RSU' | 'ESOP' | 'Stock Option' | 'Performance Shares';

interface VestingEvent {
  date: string;
  shares: number;
  vested: boolean;
}

interface EquityGrant {
  id: string;
  grantName: string;
  grantType: GrantType;
  grantDate: string;
  totalShares: number;
  vestedShares: number;
  unvestedShares: number;
  vestingSchedule: string;
  cliffDate: string;
  currentSharePrice: number;
  grantPrice: number;
  vestingEvents: VestingEvent[];
  status: 'Active' | 'Fully Vested' | 'Expired' | 'Pending Cliff';
  performanceMultiplier?: number; // for Performance Shares only
}

interface StockPriceContext {
  currentPrice: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  allTimeHigh: number;
  previousClose: number;
  companyTicker: string;
  companyName: string;
}

interface TaxBracket {
  shortTermRate: number;
  longTermRate: number;
  label: string;
}

// ---------------------------------------------------------------------------
// Mock data — comprehensive with 4 grants of different types
// ---------------------------------------------------------------------------

const stockContext: StockPriceContext = {
  currentPrice: 147.82,
  fiftyTwoWeekHigh: 168.5,
  fiftyTwoWeekLow: 98.25,
  allTimeHigh: 172.3,
  previousClose: 145.6,
  companyTicker: 'KRPA',
  companyName: 'KreupAI Corp',
};

const taxBracket: TaxBracket = {
  shortTermRate: 0.32,
  longTermRate: 0.15,
  label: '32% / 15%',
};

const mockGrants: EquityGrant[] = [
  {
    id: 'grant-rsu-001',
    grantName: 'RSU Initial Hire Grant',
    grantType: 'RSU',
    grantDate: '2023-03-01',
    totalShares: 5000,
    vestedShares: 2500,
    unvestedShares: 2500,
    vestingSchedule: '4 years, 1 year cliff, quarterly vesting',
    cliffDate: '2024-03-01',
    currentSharePrice: stockContext.currentPrice,
    grantPrice: 92.0,
    status: 'Active',
    vestingEvents: [
      { date: '2024-03-01', shares: 1250, vested: true },
      { date: '2024-09-01', shares: 416, vested: true },
      { date: '2025-03-01', shares: 834, vested: true },
      { date: '2025-09-01', shares: 416, vested: false },
      { date: '2026-03-01', shares: 417, vested: false },
      { date: '2026-09-01', shares: 417, vested: false },
      { date: '2027-03-01', shares: 1250, vested: false },
    ],
  },
  {
    id: 'grant-esop-002',
    grantName: 'ESOP Annual Refresh',
    grantType: 'ESOP',
    grantDate: '2024-06-15',
    totalShares: 3000,
    vestedShares: 750,
    unvestedShares: 2250,
    vestingSchedule: '4 years, 1 year cliff, monthly vesting',
    cliffDate: '2025-06-15',
    currentSharePrice: stockContext.currentPrice,
    grantPrice: 110.5,
    status: 'Active',
    vestingEvents: [
      { date: '2025-06-15', shares: 750, vested: true },
      { date: '2026-06-15', shares: 750, vested: false },
      { date: '2027-06-15', shares: 750, vested: false },
      { date: '2028-06-15', shares: 750, vested: false },
    ],
  },
  {
    id: 'grant-iso-003',
    grantName: 'Stock Option — Promotion',
    grantType: 'Stock Option',
    grantDate: '2025-01-10',
    totalShares: 8000,
    vestedShares: 2000,
    unvestedShares: 6000,
    vestingSchedule: '4 years, 1 year cliff, monthly vesting',
    cliffDate: '2026-01-10',
    currentSharePrice: stockContext.currentPrice,
    grantPrice: 128.0,
    status: 'Active',
    vestingEvents: [
      { date: '2026-01-10', shares: 2000, vested: true },
      { date: '2027-01-10', shares: 2000, vested: false },
      { date: '2028-01-10', shares: 2000, vested: false },
      { date: '2029-01-10', shares: 2000, vested: false },
    ],
  },
  {
    id: 'grant-perf-004',
    grantName: 'Performance Shares — FY25 Target',
    grantType: 'Performance Shares',
    grantDate: '2025-04-01',
    totalShares: 2000,
    vestedShares: 0,
    unvestedShares: 2000,
    vestingSchedule: '3 years, performance-based cliff',
    cliffDate: '2026-04-01',
    currentSharePrice: stockContext.currentPrice,
    grantPrice: 135.0,
    status: 'Pending Cliff',
    performanceMultiplier: 1.25,
    vestingEvents: [
      { date: '2026-04-01', shares: 667, vested: false },
      { date: '2027-04-01', shares: 667, vested: false },
      { date: '2028-04-01', shares: 666, vested: false },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helper utilities
// ---------------------------------------------------------------------------

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toFixed(2)}`;
}

function formatCurrencyFull(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

function getGrantTypeBadge(type: GrantType): {
  bg: string;
  text: string;
  icon: React.ReactNode;
} {
  switch (type) {
    case 'RSU':
      return {
        bg: 'bg-celestial-indigo/10 dark:bg-celestial-indigo/20',
        text: 'text-celestial-indigo',
        icon: <Award className="w-3 h-3" />,
      };
    case 'ESOP':
      return {
        bg: 'bg-aurora-green/10 dark:bg-aurora-green/20',
        text: 'text-aurora-green',
        icon: <Briefcase className="w-3 h-3" />,
      };
    case 'Stock Option':
      return {
        bg: 'bg-nebula-purple/10 dark:bg-nebula-purple/20',
        text: 'text-nebula-purple',
        icon: <TrendingUp className="w-3 h-3" />,
      };
    case 'Performance Shares':
      return {
        bg: 'bg-sunset-amber/10 dark:bg-sunset-amber/20',
        text: 'text-sunset-amber',
        icon: <Target className="w-3 h-3" />,
      };
  }
}

function getStatusBadge(status: EquityGrant['status']): {
  bg: string;
  text: string;
} {
  switch (status) {
    case 'Active':
      return {
        bg: 'bg-aurora-green/10 dark:bg-aurora-green/20',
        text: 'text-aurora-green',
      };
    case 'Fully Vested':
      return {
        bg: 'bg-celestial-indigo/10 dark:bg-celestial-indigo/20',
        text: 'text-celestial-indigo',
      };
    case 'Expired':
      return {
        bg: 'bg-coral-alert/10 dark:bg-coral-alert/20',
        text: 'text-coral-alert',
      };
    case 'Pending Cliff':
      return {
        bg: 'bg-sunset-amber/10 dark:bg-sunset-amber/20',
        text: 'text-sunset-amber',
      };
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function DonutChart({
  vestedValue,
  unvestedValue,
}: {
  vestedValue: number;
  unvestedValue: number;
}) {
  const total = vestedValue + unvestedValue;
  if (total === 0) return null;
  const vestedDeg = (vestedValue / total) * 360;

  return (
    <div className="flex items-center gap-6">
      <div
        className="w-28 h-28 rounded-full flex-shrink-0 relative"
        style={{
          background: `conic-gradient(
            var(--color-celestial-indigo, #6366f1) 0deg ${vestedDeg}deg,
            var(--color-silver-mist, #94a3b8) ${vestedDeg}deg 360deg
          )`,
        }}
      >
        <div className="absolute inset-3 rounded-full bg-white dark:bg-stellar-blue flex items-center justify-center">
          <div className="text-center">
            <p className="text-xs font-bold text-ink-black dark:text-pearl">
              {((vestedValue / total) * 100).toFixed(0)}%
            </p>
            <p className="text-[9px] text-silver-mist">Vested</p>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-celestial-indigo" />
          <div>
            <p className="text-xs text-silver-mist">Vested Value</p>
            <p className="text-sm font-semibold text-ink-black dark:text-pearl">
              {formatCurrency(vestedValue)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-silver-mist" />
          <div>
            <p className="text-xs text-silver-mist">Unvested Value</p>
            <p className="text-sm font-semibold text-ink-black dark:text-pearl">
              {formatCurrency(unvestedValue)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function EquityManagement() {
  const [selectedGrant, setSelectedGrant] = useState<string>(mockGrants[0].id);
  const [activeTab, setActiveTab] = useState<'grants' | 'table' | 'calendar' | 'tax'>('grants');

  // ---- Aggregate portfolio calculations ----

  const portfolio = useMemo(() => {
    const totalVestedShares = mockGrants.reduce((s, g) => s + g.vestedShares, 0);
    const totalUnvestedShares = mockGrants.reduce((s, g) => s + g.unvestedShares, 0);
    const totalShares = totalVestedShares + totalUnvestedShares;
    const currentPrice = stockContext.currentPrice;
    const totalCurrentValue = totalShares * currentPrice;
    const totalVestedValue = totalVestedShares * currentPrice;
    const totalUnvestedValue = totalUnvestedShares * currentPrice;
    const totalCostBasis = mockGrants.reduce((s, g) => s + g.vestedShares * g.grantPrice, 0);
    const totalUnrealizedGain = totalVestedValue - totalCostBasis;
    const totalGrants = mockGrants.length;

    return {
      totalVestedShares,
      totalUnvestedShares,
      totalShares,
      currentPrice,
      totalCurrentValue,
      totalVestedValue,
      totalUnvestedValue,
      totalCostBasis,
      totalUnrealizedGain,
      totalGrants,
    };
  }, []);

  // ---- Upcoming vesting events (next 12 months) ----

  const upcomingVestingEvents = useMemo(() => {
    const now = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    const events: {
      date: string;
      shares: number;
      grantName: string;
      grantType: GrantType;
      grantId: string;
    }[] = [];

    mockGrants.forEach((grant) => {
      grant.vestingEvents.forEach((event) => {
        const eventDate = new Date(event.date);
        if (!event.vested && eventDate >= now && eventDate <= oneYearFromNow) {
          events.push({
            date: event.date,
            shares: event.shares,
            grantName: grant.grantName,
            grantType: grant.grantType,
            grantId: grant.id,
          });
        }
      });
    });

    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return events;
  }, []);

  // ---- Tax estimations ----

  const taxEstimation = useMemo(() => {
    let shortTermGains = 0;
    let longTermGains = 0;

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    mockGrants.forEach((grant) => {
      const gain = (grant.currentSharePrice - grant.grantPrice) * grant.vestedShares;
      if (gain <= 0) return;

      const grantDate = new Date(grant.grantDate);
      if (grantDate > oneYearAgo) {
        shortTermGains += gain;
      } else {
        longTermGains += gain;
      }
    });

    const shortTermTax = shortTermGains * taxBracket.shortTermRate;
    const longTermTax = longTermGains * taxBracket.longTermRate;
    const totalTax = shortTermTax + longTermTax;
    const netAfterTax = portfolio.totalVestedValue - portfolio.totalCostBasis - totalTax;

    return {
      shortTermGains,
      longTermGains,
      shortTermTax,
      longTermTax,
      totalTax,
      netAfterTax,
    };
  }, [portfolio]);

  // ---- 52-week range percentage ----

  const priceRangePercent = useMemo(() => {
    const range = stockContext.fiftyTwoWeekHigh - stockContext.fiftyTwoWeekLow;
    return ((stockContext.currentPrice - stockContext.fiftyTwoWeekLow) / range) * 100;
  }, []);

  const priceChange = stockContext.currentPrice - stockContext.previousClose;
  const priceChangePercent = (priceChange / stockContext.previousClose) * 100;
  const isPriceUp = priceChange >= 0;

  // ---- Tab definitions ----

  const tabs: {
    key: typeof activeTab;
    label: string;
    icon: React.ReactNode;
  }[] = [
    { key: 'grants', label: 'Grants', icon: <Layers className="w-4 h-4" /> },
    { key: 'table', label: 'Details Table', icon: <Table2 className="w-4 h-4" /> },
    {
      key: 'calendar',
      label: 'Vesting Calendar',
      icon: <CalendarDays className="w-4 h-4" />,
    },
    {
      key: 'tax',
      label: 'Tax Implications',
      icon: <Receipt className="w-4 h-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">Equity Management</h2>
        <p className="text-sm text-silver-mist mt-1">
          View and track your equity grants, vesting schedule, and portfolio performance.
        </p>
      </div>

      {/* ================================================================ */}
      {/* 1. TOTAL PORTFOLIO VALUE HERO CARD                               */}
      {/* ================================================================ */}

      <div className="bg-gradient-to-br from-celestial-indigo/5 via-white to-nebula-purple/5 dark:from-celestial-indigo/10 dark:via-stellar-blue dark:to-nebula-purple/10 rounded-2xl border border-cloud dark:border-nebula-purple/30 p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Left — Portfolio value */}
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-celestial-indigo" />
              <span className="text-xs font-semibold text-silver-mist uppercase tracking-wider">
                Total Portfolio Value
              </span>
            </div>
            <div>
              <p className="text-3xl font-bold text-ink-black dark:text-pearl">
                {formatCurrencyFull(portfolio.totalCurrentValue)}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {portfolio.totalUnrealizedGain >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-aurora-green" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-coral-alert" />
                )}
                <span
                  className={`text-sm font-semibold ${
                    portfolio.totalUnrealizedGain >= 0 ? 'text-aurora-green' : 'text-coral-alert'
                  }`}
                >
                  {portfolio.totalUnrealizedGain >= 0 ? '+' : ''}
                  {formatCurrencyFull(portfolio.totalUnrealizedGain)} unrealized gain
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-silver-mist">
              <span>
                <strong className="text-ink-black dark:text-pearl">
                  {formatNumber(portfolio.totalShares)}
                </strong>{' '}
                total shares
              </span>
              <span>
                <strong className="text-ink-black dark:text-pearl">{portfolio.totalGrants}</strong>{' '}
                grants
              </span>
              <span>
                Cost basis:{' '}
                <strong className="text-ink-black dark:text-pearl">
                  {formatCurrency(portfolio.totalCostBasis)}
                </strong>
              </span>
            </div>
          </div>

          {/* Right — Stock price context */}
          <div className="lg:w-80 space-y-3 bg-white/60 dark:bg-deep-cosmos/60 rounded-xl p-4 border border-cloud/50 dark:border-nebula-purple/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-celestial-indigo" />
                <span className="text-xs font-semibold text-silver-mist uppercase tracking-wider">
                  {stockContext.companyTicker}
                </span>
              </div>
              <span className="text-[10px] text-silver-mist">{stockContext.companyName}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-ink-black dark:text-pearl">
                ${stockContext.currentPrice.toFixed(2)}
              </span>
              <span
                className={`text-sm font-semibold flex items-center gap-0.5 ${
                  isPriceUp ? 'text-aurora-green' : 'text-coral-alert'
                }`}
              >
                {isPriceUp ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                {isPriceUp ? '+' : ''}
                {priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
              </span>
            </div>

            {/* 52-week range bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-silver-mist">
                <span>52W Low: ${stockContext.fiftyTwoWeekLow.toFixed(2)}</span>
                <span>52W High: ${stockContext.fiftyTwoWeekHigh.toFixed(2)}</span>
              </div>
              <div className="relative w-full h-1.5 rounded-full bg-slate-100 dark:bg-deep-cosmos overflow-hidden">
                <div
                  className="absolute h-full rounded-full bg-celestial-indigo"
                  style={{ width: `${priceRangePercent}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-silver-mist pt-1">
              <span>
                All-time high:{' '}
                <strong className="text-ink-black dark:text-pearl">
                  ${stockContext.allTimeHigh.toFixed(2)}
                </strong>
              </span>
              <span>
                All-time gain:{' '}
                <strong className="text-aurora-green">
                  +
                  {(
                    ((stockContext.currentPrice -
                      mockGrants.reduce((min, g) => Math.min(min, g.grantPrice), Infinity)) /
                      mockGrants.reduce((min, g) => Math.min(min, g.grantPrice), Infinity)) *
                    100
                  ).toFixed(1)}
                  %
                </strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 2. SUMMARY CARDS                                                 */}
      {/* ================================================================ */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist uppercase font-medium">Total Shares</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">
            {formatNumber(portfolio.totalShares)}
          </p>
          <p className="text-xs text-silver-mist mt-0.5">Across {portfolio.totalGrants} grants</p>
        </div>

        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-aurora-green" />
            <span className="text-xs text-silver-mist uppercase font-medium">Vested</span>
          </div>
          <p className="text-xl font-bold text-aurora-green">
            {formatNumber(portfolio.totalVestedShares)}
          </p>
          <p className="text-xs text-silver-mist mt-0.5">
            {((portfolio.totalVestedShares / portfolio.totalShares) * 100).toFixed(0)}% of total
            &middot; {formatCurrency(portfolio.totalVestedValue)}
          </p>
        </div>

        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-sunset-amber" />
            <span className="text-xs text-silver-mist uppercase font-medium">Unvested</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">
            {formatNumber(portfolio.totalUnvestedShares)}
          </p>
          <p className="text-xs text-silver-mist mt-0.5">
            {formatCurrency(portfolio.totalUnvestedValue)} pending
          </p>
        </div>

        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist uppercase font-medium">Total Value</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">
            {formatCurrency(portfolio.totalCurrentValue)}
          </p>
          <p className="text-xs text-silver-mist mt-0.5">
            @ ${portfolio.currentPrice.toFixed(2)}/share
          </p>
        </div>
      </div>

      {/* ================================================================ */}
      {/* VALUE BREAKDOWN DONUT + UPCOMING VESTING PREVIEW                 */}
      {/* ================================================================ */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Donut chart */}
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-4 h-4 text-celestial-indigo" />
            <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">
              Value Breakdown
            </h3>
          </div>
          <DonutChart
            vestedValue={portfolio.totalVestedValue}
            unvestedValue={portfolio.totalUnvestedValue}
          />
          <div className="mt-4 pt-3 border-t border-cloud dark:border-nebula-purple/30 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-silver-mist uppercase">Vested Gain</p>
              <p
                className={`text-sm font-semibold ${
                  portfolio.totalUnrealizedGain >= 0 ? 'text-aurora-green' : 'text-coral-alert'
                }`}
              >
                {portfolio.totalUnrealizedGain >= 0 ? '+' : ''}
                {formatCurrency(portfolio.totalUnrealizedGain)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-silver-mist uppercase">Est. Tax Liability</p>
              <p className="text-sm font-semibold text-quantum-rose">
                {formatCurrency(taxEstimation.totalTax)}
              </p>
            </div>
          </div>
        </div>

        {/* Upcoming vesting preview */}
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-sunset-amber" />
              <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">
                Next Vesting Events
              </h3>
            </div>
            <span className="text-[10px] text-silver-mist">Next 12 months</span>
          </div>
          {upcomingVestingEvents.length === 0 ? (
            <p className="text-xs text-silver-mist">
              No upcoming vesting events in the next 12 months.
            </p>
          ) : (
            <div className="space-y-2.5 max-h-64 overflow-y-auto">
              {upcomingVestingEvents.map((event, idx) => {
                const badge = getGrantTypeBadge(event.grantType);
                return (
                  <div
                    key={`${event.grantId}-${idx}`}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-deep-cosmos/50 border border-cloud/50 dark:border-nebula-purple/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center w-10">
                        <span className="text-[10px] text-silver-mist uppercase">
                          {new Date(event.date).toLocaleDateString('en-US', {
                            month: 'short',
                          })}
                        </span>
                        <span className="text-lg font-bold text-ink-black dark:text-pearl leading-tight">
                          {new Date(event.date).getDate()}
                        </span>
                        <span className="text-[10px] text-silver-mist">
                          {new Date(event.date).getFullYear()}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-ink-black dark:text-pearl">
                          {event.shares.toLocaleString()} shares
                        </p>
                        <p className="text-[10px] text-silver-mist truncate max-w-[140px]">
                          {event.grantName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}
                      >
                        {badge.icon}
                        {event.grantType}
                      </span>
                      <p className="text-xs font-medium text-ink-black dark:text-pearl mt-0.5">
                        ~{formatCurrency(event.shares * stockContext.currentPrice)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ================================================================ */}
      {/* TAB NAVIGATION                                                   */}
      {/* ================================================================ */}

      <div className="flex items-center gap-1 bg-slate-50 dark:bg-deep-cosmos rounded-xl p-1 border border-cloud dark:border-nebula-purple/30">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-white dark:bg-stellar-blue text-celestial-indigo shadow-sm border border-cloud dark:border-nebula-purple/50'
                : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ================================================================ */}
      {/* TAB: GRANTS LIST (expandable cards)                              */}
      {/* ================================================================ */}

      {activeTab === 'grants' && (
        <div className="space-y-4">
          {mockGrants.map((grant) => {
            const vestedPercent = (grant.vestedShares / grant.totalShares) * 100;
            const grantValue = grant.totalShares * grant.currentSharePrice;
            const vestedValue = grant.vestedShares * grant.currentSharePrice;
            const unrealizedGain =
              (grant.currentSharePrice - grant.grantPrice) * grant.vestedShares;
            const isExpanded = selectedGrant === grant.id;
            const typeBadge = getGrantTypeBadge(grant.grantType);
            const statusBadge = getStatusBadge(grant.status);
            const allTimeGainPerShare = grant.currentSharePrice - grant.grantPrice;
            const allTimeGainPercent = (allTimeGainPerShare / grant.grantPrice) * 100;

            return (
              <div
                key={grant.id}
                className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden transition-shadow hover:shadow-md dark:hover:shadow-nebula-purple/10"
              >
                {/* Collapsed header */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setSelectedGrant(isExpanded ? '' : grant.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Award className="w-4 h-4 text-celestial-indigo" />
                        <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">
                          {grant.grantName}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${typeBadge.bg} ${typeBadge.text}`}
                        >
                          {typeBadge.icon}
                          {grant.grantType}
                        </span>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusBadge.bg} ${statusBadge.text}`}
                        >
                          {grant.status}
                        </span>
                      </div>
                      <p className="text-xs text-silver-mist mt-0.5">
                        {grant.vestingSchedule} &middot; Granted {formatDateShort(grant.grantDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-sm font-bold text-ink-black dark:text-pearl">
                          {formatNumber(grant.totalShares)} shares
                        </p>
                        <p className="text-xs text-silver-mist">
                          Value: {formatCurrency(grantValue)}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-silver-mist flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-silver-mist flex-shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Vesting Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-silver-mist">Vesting Progress</span>
                      <span className="font-medium text-ink-black dark:text-pearl">
                        {vestedPercent.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-50 dark:bg-deep-cosmos overflow-hidden">
                      <div
                        className="h-full rounded-full bg-celestial-indigo transition-all"
                        style={{ width: `${vestedPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-silver-mist">
                      <span>{formatNumber(grant.vestedShares)} vested</span>
                      <span>{formatNumber(grant.unvestedShares)} unvested</span>
                    </div>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-cloud dark:border-nebula-purple/50 bg-slate-50 dark:bg-deep-cosmos">
                    {/* Key metrics */}
                    <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <p className="text-[10px] text-silver-mist uppercase">Grant Price</p>
                        <p className="text-sm font-medium text-ink-black dark:text-pearl">
                          ${grant.grantPrice.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-silver-mist uppercase">Current Price</p>
                        <p className="text-sm font-medium text-ink-black dark:text-pearl">
                          ${grant.currentSharePrice.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-silver-mist uppercase">Vested Value</p>
                        <p className="text-sm font-medium text-ink-black dark:text-pearl">
                          {formatCurrencyFull(vestedValue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-silver-mist uppercase">
                          Unrealized Gain (Vested)
                        </p>
                        <p
                          className={`text-sm font-medium ${
                            unrealizedGain >= 0 ? 'text-aurora-green' : 'text-coral-alert'
                          }`}
                        >
                          {unrealizedGain >= 0 ? '+' : ''}
                          {formatCurrencyFull(unrealizedGain)}
                        </p>
                      </div>
                    </div>

                    {/* Stock price context for this grant */}
                    <div className="px-4 pb-3">
                      <div className="bg-white/60 dark:bg-stellar-blue/30 rounded-lg p-3 border border-cloud/50 dark:border-nebula-purple/20">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="w-3.5 h-3.5 text-celestial-indigo" />
                          <span className="text-[10px] font-semibold text-silver-mist uppercase tracking-wider">
                            Price Performance
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <p className="text-[10px] text-silver-mist">52W High</p>
                            <p className="text-xs font-medium text-ink-black dark:text-pearl">
                              ${stockContext.fiftyTwoWeekHigh.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-silver-mist">52W Low</p>
                            <p className="text-xs font-medium text-ink-black dark:text-pearl">
                              ${stockContext.fiftyTwoWeekLow.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-silver-mist">Gain / Share</p>
                            <p
                              className={`text-xs font-medium ${
                                allTimeGainPerShare >= 0 ? 'text-aurora-green' : 'text-coral-alert'
                              }`}
                            >
                              {allTimeGainPerShare >= 0 ? '+' : ''}${allTimeGainPerShare.toFixed(2)}{' '}
                              ({allTimeGainPercent.toFixed(1)}%)
                            </p>
                          </div>
                          {grant.performanceMultiplier && (
                            <div>
                              <p className="text-[10px] text-silver-mist">Perf. Multiplier</p>
                              <p className="text-xs font-medium text-sunset-amber">
                                {grant.performanceMultiplier}x target
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Vesting Timeline */}
                    <div className="px-4 pb-4">
                      <h4 className="text-xs font-semibold text-ink-black dark:text-pearl mb-3 uppercase tracking-wide">
                        Vesting Timeline
                      </h4>
                      <div className="space-y-2">
                        {grant.vestingEvents.map((event, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div
                              className={`w-3 h-3 rounded-full flex-shrink-0 ${
                                event.vested ? 'bg-aurora-green' : 'bg-slate-300 dark:bg-slate-600'
                              }`}
                            />
                            <div className="flex-1 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3 h-3 text-silver-mist" />
                                <span className="text-xs text-ink-black dark:text-pearl">
                                  {formatDate(event.date)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-ink-black dark:text-pearl">
                                  {formatNumber(event.shares)} shares
                                </span>
                                <span
                                  className={`text-xs px-1.5 py-0.5 rounded ${
                                    event.vested
                                      ? 'bg-aurora-green/10 dark:bg-aurora-green/20 text-aurora-green'
                                      : 'bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                                  }`}
                                >
                                  {event.vested ? 'Vested' : 'Pending'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Exercise / Sell action buttons */}
                    <div className="px-4 pb-4 flex items-center gap-3">
                      {grant.grantType === 'Stock Option' ? (
                        <button
                          disabled
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-celestial-indigo text-white text-xs font-medium opacity-70 cursor-not-allowed"
                        >
                          <Play className="w-3.5 h-3.5" />
                          Exercise Options
                        </button>
                      ) : (
                        <button
                          disabled
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-celestial-indigo text-white text-xs font-medium opacity-70 cursor-not-allowed"
                        >
                          <Banknote className="w-3.5 h-3.5" />
                          Sell Vested Shares
                        </button>
                      )}
                      <button
                        disabled
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 text-silver-mist text-xs font-medium opacity-70 cursor-not-allowed bg-white dark:bg-stellar-blue"
                      >
                        <Info className="w-3.5 h-3.5" />
                        View Agreement
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB: GRANT DETAILS TABLE                                         */}
      {/* ================================================================ */}

      {activeTab === 'table' && (
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
          <div className="p-4 border-b border-cloud dark:border-nebula-purple/30">
            <div className="flex items-center gap-2">
              <Table2 className="w-4 h-4 text-celestial-indigo" />
              <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">
                All Grants — Detail View
              </h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-deep-cosmos border-b border-cloud dark:border-nebula-purple/30">
                  <th className="text-left px-4 py-3 font-semibold text-silver-mist uppercase tracking-wider">
                    Grant
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-silver-mist uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-silver-mist uppercase tracking-wider">
                    Grant Date
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-silver-mist uppercase tracking-wider">
                    Total
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-silver-mist uppercase tracking-wider">
                    Vested
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-silver-mist uppercase tracking-wider">
                    Unvested
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-silver-mist uppercase tracking-wider">
                    Grant Price
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-silver-mist uppercase tracking-wider">
                    Current Value
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-silver-mist uppercase tracking-wider">
                    Gain/Loss
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-silver-mist uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockGrants.map((grant, idx) => {
                  const value = grant.totalShares * grant.currentSharePrice;
                  const gain = (grant.currentSharePrice - grant.grantPrice) * grant.vestedShares;
                  const typeBadge = getGrantTypeBadge(grant.grantType);
                  const statusBadge = getStatusBadge(grant.status);

                  return (
                    <tr
                      key={grant.id}
                      className={`border-b border-cloud/50 dark:border-nebula-purple/20 hover:bg-slate-50/50 dark:hover:bg-deep-cosmos/30 transition-colors ${
                        idx % 2 === 0 ? '' : 'bg-slate-50/30 dark:bg-deep-cosmos/10'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink-black dark:text-pearl truncate max-w-[180px]">
                          {grant.grantName}
                        </p>
                        <p className="text-[10px] text-silver-mist">{grant.vestingSchedule}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${typeBadge.bg} ${typeBadge.text}`}
                        >
                          {typeBadge.icon}
                          {grant.grantType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink-black dark:text-pearl">
                        {formatDate(grant.grantDate)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-ink-black dark:text-pearl">
                        {formatNumber(grant.totalShares)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-aurora-green">
                        {formatNumber(grant.vestedShares)}
                      </td>
                      <td className="px-4 py-3 text-right text-ink-black dark:text-pearl">
                        {formatNumber(grant.unvestedShares)}
                      </td>
                      <td className="px-4 py-3 text-right text-ink-black dark:text-pearl">
                        ${grant.grantPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-ink-black dark:text-pearl">
                        {formatCurrency(value)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`font-medium ${
                            gain >= 0 ? 'text-aurora-green' : 'text-coral-alert'
                          }`}
                        >
                          {gain >= 0 ? '+' : ''}
                          {formatCurrency(gain)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusBadge.bg} ${statusBadge.text}`}
                        >
                          {grant.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 dark:bg-deep-cosmos border-t border-cloud dark:border-nebula-purple/30">
                  <td className="px-4 py-3 font-semibold text-ink-black dark:text-pearl">Totals</td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 text-right font-bold text-ink-black dark:text-pearl">
                    {formatNumber(portfolio.totalShares)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-aurora-green">
                    {formatNumber(portfolio.totalVestedShares)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-ink-black dark:text-pearl">
                    {formatNumber(portfolio.totalUnvestedShares)}
                  </td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 text-right font-bold text-ink-black dark:text-pearl">
                    {formatCurrency(portfolio.totalCurrentValue)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-bold ${
                        portfolio.totalUnrealizedGain >= 0
                          ? 'text-aurora-green'
                          : 'text-coral-alert'
                      }`}
                    >
                      {portfolio.totalUnrealizedGain >= 0 ? '+' : ''}
                      {formatCurrency(portfolio.totalUnrealizedGain)}
                    </span>
                  </td>
                  <td className="px-4 py-3" />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB: VESTING CALENDAR VIEW                                       */}
      {/* ================================================================ */}

      {activeTab === 'calendar' && (
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
          <div className="p-4 border-b border-cloud dark:border-nebula-purple/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-sunset-amber" />
                <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">
                  Vesting Calendar — Next 12 Months
                </h3>
              </div>
              <span className="text-[10px] text-silver-mist">
                {upcomingVestingEvents.length} upcoming event
                {upcomingVestingEvents.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {upcomingVestingEvents.length === 0 ? (
            <div className="p-8 text-center">
              <CalendarDays className="w-8 h-8 text-silver-mist mx-auto mb-2" />
              <p className="text-sm text-silver-mist">
                No upcoming vesting events in the next 12 months.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-cloud dark:divide-nebula-purple/20">
              {upcomingVestingEvents.map((event, idx) => {
                const badge = getGrantTypeBadge(event.grantType);
                const estValue = event.shares * stockContext.currentPrice;
                const monthsAway = Math.ceil(
                  (new Date(event.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)
                );

                return (
                  <div
                    key={`cal-${event.grantId}-${idx}`}
                    className="flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-deep-cosmos/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Date badge */}
                      <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-celestial-indigo/5 dark:bg-celestial-indigo/10 border border-celestial-indigo/20">
                        <span className="text-[10px] font-semibold text-celestial-indigo uppercase">
                          {new Date(event.date).toLocaleDateString('en-US', {
                            month: 'short',
                          })}
                        </span>
                        <span className="text-lg font-bold text-celestial-indigo leading-tight">
                          {new Date(event.date).getDate()}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-medium text-ink-black dark:text-pearl">
                            {formatNumber(event.shares)} shares vesting
                          </p>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}
                          >
                            {badge.icon}
                            {event.grantType}
                          </span>
                        </div>
                        <p className="text-xs text-silver-mist">{event.grantName}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold text-ink-black dark:text-pearl">
                        ~{formatCurrency(estValue)}
                      </p>
                      <p className="text-[10px] text-silver-mist">
                        in ~{monthsAway} month{monthsAway !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Calendar total */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-deep-cosmos">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-sunset-amber" />
                  <span className="text-xs font-semibold text-ink-black dark:text-pearl">
                    Total Upcoming
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-ink-black dark:text-pearl">
                    {formatNumber(upcomingVestingEvents.reduce((s, e) => s + e.shares, 0))} shares
                    &middot;{' '}
                    {formatCurrency(
                      upcomingVestingEvents.reduce(
                        (s, e) => s + e.shares * stockContext.currentPrice,
                        0
                      )
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB: TAX IMPLICATIONS PANEL                                      */}
      {/* ================================================================ */}

      {activeTab === 'tax' && (
        <div className="space-y-4">
          {/* Disclaimer */}
          <div className="flex items-start gap-3 p-3 bg-sunset-amber/5 dark:bg-sunset-amber/10 rounded-xl border border-sunset-amber/20">
            <AlertTriangle className="w-4 h-4 text-sunset-amber flex-shrink-0 mt-0.5" />
            <p className="text-xs text-sunset-amber leading-relaxed">
              Tax estimates are for informational purposes only and are based on simplified
              assumptions. Consult a qualified tax advisor for personalized guidance.
            </p>
          </div>

          {/* Tax summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <CircleDollarSign className="w-4 h-4 text-quantum-rose" />
                <span className="text-xs font-semibold text-silver-mist uppercase tracking-wider">
                  Estimated Total Tax
                </span>
              </div>
              <p className="text-2xl font-bold text-quantum-rose">
                {formatCurrencyFull(taxEstimation.totalTax)}
              </p>
              <p className="text-xs text-silver-mist mt-1">
                On {formatCurrencyFull(taxEstimation.shortTermGains + taxEstimation.longTermGains)}{' '}
                total gains
              </p>
            </div>

            <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <HandCoins className="w-4 h-4 text-coral-alert" />
                <span className="text-xs font-semibold text-silver-mist uppercase tracking-wider">
                  Short-Term Gains
                </span>
              </div>
              <p className="text-2xl font-bold text-ink-black dark:text-pearl">
                {formatCurrencyFull(taxEstimation.shortTermGains)}
              </p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-silver-mist">
                  Rate: {(taxBracket.shortTermRate * 100).toFixed(0)}%
                </p>
                <p className="text-xs font-medium text-coral-alert">
                  Tax: {formatCurrencyFull(taxEstimation.shortTermTax)}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <BadgeDollarSign className="w-4 h-4 text-aurora-green" />
                <span className="text-xs font-semibold text-silver-mist uppercase tracking-wider">
                  Long-Term Gains
                </span>
              </div>
              <p className="text-2xl font-bold text-ink-black dark:text-pearl">
                {formatCurrencyFull(taxEstimation.longTermGains)}
              </p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-silver-mist">
                  Rate: {(taxBracket.longTermRate * 100).toFixed(0)}%
                </p>
                <p className="text-xs font-medium text-aurora-green">
                  Tax: {formatCurrencyFull(taxEstimation.longTermTax)}
                </p>
              </div>
            </div>
          </div>

          {/* Net after tax */}
          <div className="bg-gradient-to-r from-celestial-indigo/5 to-aurora-green/5 dark:from-celestial-indigo/10 dark:to-aurora-green/10 rounded-xl border border-cloud dark:border-nebula-purple/30 p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-aurora-green" />
                  <span className="text-xs font-semibold text-silver-mist uppercase tracking-wider">
                    Net After Estimated Tax
                  </span>
                </div>
                <p className="text-2xl font-bold text-aurora-green">
                  {formatCurrencyFull(taxEstimation.netAfterTax)}
                </p>
              </div>
              <div className="text-right space-y-1">
                <div className="text-xs text-silver-mist">
                  Vested Value:{' '}
                  <strong className="text-ink-black dark:text-pearl">
                    {formatCurrencyFull(portfolio.totalVestedValue)}
                  </strong>
                </div>
                <div className="text-xs text-silver-mist">
                  Cost Basis:{' '}
                  <strong className="text-ink-black dark:text-pearl">
                    {formatCurrencyFull(portfolio.totalCostBasis)}
                  </strong>
                </div>
                <div className="text-xs text-silver-mist">
                  Est. Tax:{' '}
                  <strong className="text-quantum-rose">
                    -{formatCurrencyFull(taxEstimation.totalTax)}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Per-grant tax breakdown */}
          <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
            <div className="p-4 border-b border-cloud dark:border-nebula-purple/30">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-celestial-indigo" />
                <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">
                  Per-Grant Tax Estimation
                </h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-deep-cosmos border-b border-cloud dark:border-nebula-purple/30">
                    <th className="text-left px-4 py-3 font-semibold text-silver-mist uppercase tracking-wider">
                      Grant
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-silver-mist uppercase tracking-wider">
                      Vested Shares
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-silver-mist uppercase tracking-wider">
                      Gain
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-silver-mist uppercase tracking-wider">
                      Holding Period
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-silver-mist uppercase tracking-wider">
                      Rate
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-silver-mist uppercase tracking-wider">
                      Est. Tax
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockGrants
                    .filter((g) => g.vestedShares > 0)
                    .map((grant) => {
                      const gain =
                        (grant.currentSharePrice - grant.grantPrice) * grant.vestedShares;
                      const oneYearAgo = new Date();
                      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                      const isLongTerm = new Date(grant.grantDate) <= oneYearAgo;
                      const rate = isLongTerm ? taxBracket.longTermRate : taxBracket.shortTermRate;
                      const tax = Math.max(gain * rate, 0);

                      return (
                        <tr
                          key={grant.id}
                          className="border-b border-cloud/50 dark:border-nebula-purple/20"
                        >
                          <td className="px-4 py-3">
                            <p className="font-medium text-ink-black dark:text-pearl">
                              {grant.grantName}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-right text-ink-black dark:text-pearl">
                            {formatNumber(grant.vestedShares)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={gain >= 0 ? 'text-aurora-green' : 'text-coral-alert'}>
                              {gain >= 0 ? '+' : ''}
                              {formatCurrency(gain)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                isLongTerm
                                  ? 'bg-aurora-green/10 dark:bg-aurora-green/20 text-aurora-green'
                                  : 'bg-coral-alert/10 dark:bg-coral-alert/20 text-coral-alert'
                              }`}
                            >
                              {isLongTerm ? 'Long-Term' : 'Short-Term'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-ink-black dark:text-pearl">
                            {(rate * 100).toFixed(0)}%
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-quantum-rose">
                            {formatCurrency(tax)}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
