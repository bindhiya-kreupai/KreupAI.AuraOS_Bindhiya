'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Calculator,
  Percent,
  Calendar,
  DollarSign,
  TrendingUp,
  Info,
  CheckCircle2,
  Award,
  History,
  Receipt,
  Users,
  Star,
  Layers,
  ArrowRight,
  ArrowDown,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Eye,
  BarChart3,
  Shield,
  Zap,
  Clock,
  Gift,
  _Target,
  AlertCircle,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// TypeScript Interfaces
// ---------------------------------------------------------------------------

interface BonusScheme {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  defaultTargetPercent: number;
  frequency: 'annual' | 'quarterly' | 'one-time';
  performanceLinked: boolean;
  prorationEnabled: boolean;
  maxMultiplier: number;
  minMultiplier: number;
}

interface BonusComponent {
  id: string;
  name: string;
  type: 'base' | 'project' | 'retention' | 'spot' | 'custom';
  amount: number;
  description: string;
}

interface HistoricalPayout {
  year: number;
  quarter?: string;
  scheme: string;
  targetAmount: number;
  actualAmount: number;
  payoutDate: string;
  performanceRating: string;
  multiplierApplied: number;
}

interface TaxEstimation {
  grossAmount: number;
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  totalWithholding: number;
  netAmount: number;
  effectiveRate: number;
}

interface PeerComparison {
  teamMedian: number;
  companyMedian: number;
  teamP25: number;
  teamP75: number;
  companyP25: number;
  companyP75: number;
  teamSize: number;
  companySize: number;
}

interface PerformanceRating {
  label: string;
  description: string;
  multiplierMin: number;
  multiplierMax: number;
  color: string;
}

interface WaterfallStep {
  label: string;
  value: number;
  delta: number;
  type: 'base' | 'add' | 'subtract' | 'total';
}

interface BonusConfig {
  baseSalary: number;
  targetBonusPercent: number;
  performanceMultiplier: number;
  startDate: string;
  endDate: string;
  prorationMonths: number;
  companyPerformanceFactor: number;
}

interface WizardStep {
  num: number;
  label: string;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const BONUS_SCHEMES: BonusScheme[] = [
  {
    id: 'annual-performance',
    name: 'Annual Performance',
    description: 'Standard annual bonus tied to individual and company performance metrics',
    icon: <Award className="w-5 h-5" />,
    defaultTargetPercent: 20,
    frequency: 'annual',
    performanceLinked: true,
    prorationEnabled: true,
    maxMultiplier: 2.0,
    minMultiplier: 0,
  },
  {
    id: 'quarterly',
    name: 'Quarterly Bonus',
    description: 'Quarterly performance-based payout with rolling evaluations',
    icon: <Clock className="w-5 h-5" />,
    defaultTargetPercent: 5,
    frequency: 'quarterly',
    performanceLinked: true,
    prorationEnabled: true,
    maxMultiplier: 1.5,
    minMultiplier: 0.5,
  },
  {
    id: 'retention',
    name: 'Retention Bonus',
    description: 'Long-term retention incentive vesting over a defined period',
    icon: <Shield className="w-5 h-5" />,
    defaultTargetPercent: 15,
    frequency: 'annual',
    performanceLinked: false,
    prorationEnabled: true,
    maxMultiplier: 1.0,
    minMultiplier: 1.0,
  },
  {
    id: 'spot',
    name: 'Spot Bonus',
    description: 'Immediate recognition for exceptional contributions or milestones',
    icon: <Zap className="w-5 h-5" />,
    defaultTargetPercent: 3,
    frequency: 'one-time',
    performanceLinked: false,
    prorationEnabled: false,
    maxMultiplier: 1.0,
    minMultiplier: 1.0,
  },
];

const HISTORICAL_PAYOUTS: HistoricalPayout[] = [
  {
    year: 2025,
    scheme: 'Annual Performance',
    targetAmount: 33000,
    actualAmount: 37950,
    payoutDate: '2026-03-15',
    performanceRating: 'Exceeds Expectations',
    multiplierApplied: 1.15,
  },
  {
    year: 2024,
    scheme: 'Annual Performance',
    targetAmount: 30000,
    actualAmount: 31500,
    payoutDate: '2025-03-15',
    performanceRating: 'Meets Expectations',
    multiplierApplied: 1.05,
  },
  {
    year: 2024,
    quarter: 'Q3',
    scheme: 'Spot Bonus',
    targetAmount: 5000,
    actualAmount: 5000,
    payoutDate: '2024-10-01',
    performanceRating: 'N/A',
    multiplierApplied: 1.0,
  },
  {
    year: 2023,
    scheme: 'Annual Performance',
    targetAmount: 28000,
    actualAmount: 33600,
    payoutDate: '2024-03-15',
    performanceRating: 'Outstanding',
    multiplierApplied: 1.2,
  },
  {
    year: 2023,
    quarter: 'Q2',
    scheme: 'Retention Bonus',
    targetAmount: 20000,
    actualAmount: 20000,
    payoutDate: '2023-07-01',
    performanceRating: 'N/A',
    multiplierApplied: 1.0,
  },
];

const PERFORMANCE_RATINGS: PerformanceRating[] = [
  {
    label: 'Below Expectations',
    description:
      'Performance did not meet the minimum standards for the role. Requires immediate improvement plan.',
    multiplierMin: 0,
    multiplierMax: 0.5,
    color: 'coral-alert',
  },
  {
    label: 'Meets Expectations',
    description:
      'Consistently delivers expected results. Meets all core responsibilities and demonstrates competency.',
    multiplierMin: 0.5,
    multiplierMax: 1.0,
    color: 'sunset-amber',
  },
  {
    label: 'Exceeds Expectations',
    description:
      'Frequently goes above and beyond. Delivers high-quality work and takes on additional responsibilities.',
    multiplierMin: 1.0,
    multiplierMax: 1.5,
    color: 'aurora-green',
  },
  {
    label: 'Outstanding',
    description:
      'Exceptional performer. Consistently delivers transformative impact and is a role model for the team.',
    multiplierMin: 1.5,
    multiplierMax: 2.0,
    color: 'celestial-indigo',
  },
];

const MOCK_PEER_COMPARISON: PeerComparison = {
  teamMedian: 35000,
  companyMedian: 32000,
  teamP25: 28000,
  teamP75: 42000,
  companyP25: 24000,
  companyP75: 45000,
  teamSize: 12,
  companySize: 450,
};

const DEFAULT_BONUS_COMPONENTS: BonusComponent[] = [
  {
    id: 'comp-1',
    name: 'Base Performance Bonus',
    type: 'base',
    amount: 0,
    description: 'Primary performance-linked bonus',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);

const formatCurrencyPrecise = (amount: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amount);

const calculateTax = (grossAmount: number): TaxEstimation => {
  const federalRate = grossAmount > 50000 ? 0.32 : grossAmount > 25000 ? 0.24 : 0.22;
  const stateRate = 0.065;
  const ssRate = 0.062;
  const medicareRate = 0.0145;

  const federalTax = grossAmount * federalRate;
  const stateTax = grossAmount * stateRate;
  const socialSecurity = Math.min(grossAmount * ssRate, 10453);
  const medicare = grossAmount * medicareRate;
  const totalWithholding = federalTax + stateTax + socialSecurity + medicare;

  return {
    grossAmount,
    federalTax,
    stateTax,
    socialSecurity,
    medicare,
    totalWithholding,
    netAmount: grossAmount - totalWithholding,
    effectiveRate: grossAmount > 0 ? (totalWithholding / grossAmount) * 100 : 0,
  };
};

const getPerformanceRatingForMultiplier = (multiplier: number): PerformanceRating | undefined => {
  return (
    PERFORMANCE_RATINGS.find(
      (r) => multiplier >= r.multiplierMin && multiplier < r.multiplierMax
    ) || PERFORMANCE_RATINGS[PERFORMANCE_RATINGS.length - 1]
  );
};

let componentIdCounter = 2;
const generateComponentId = (): string => {
  componentIdCounter += 1;
  return `comp-${componentIdCounter}`;
};

// ---------------------------------------------------------------------------
// Sub-Components
// ---------------------------------------------------------------------------

function SchemeSelector({
  schemes,
  selectedSchemeId,
  onSelect,
}: {
  schemes: BonusScheme[];
  selectedSchemeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-ink-black dark:text-pearl flex items-center gap-2">
        <Gift className="w-4 h-4 text-celestial-indigo" />
        Bonus Scheme
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {schemes.map((scheme) => (
          <button
            key={scheme.id}
            onClick={() => onSelect(scheme.id)}
            className={`text-left p-3 rounded-lg border-2 transition-all ${
              selectedSchemeId === scheme.id
                ? 'border-celestial-indigo bg-celestial-indigo/5 dark:bg-celestial-indigo/10'
                : 'border-cloud dark:border-nebula-purple/30 hover:border-celestial-indigo/40 bg-white dark:bg-deep-cosmos/30'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={
                  selectedSchemeId === scheme.id ? 'text-celestial-indigo' : 'text-silver-mist'
                }
              >
                {scheme.icon}
              </span>
              <span className="text-sm font-semibold text-ink-black dark:text-pearl">
                {scheme.name}
              </span>
            </div>
            <p className="text-xs text-silver-mist leading-relaxed">{scheme.description}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-celestial-indigo/10 text-celestial-indigo font-medium">
                {scheme.frequency}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-aurora-green/10 text-aurora-green font-medium">
                {scheme.defaultTargetPercent}% target
              </span>
              {scheme.performanceLinked && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sunset-amber/10 text-sunset-amber font-medium">
                  perf-linked
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function HistoricalPayoutsPanel({ payouts }: { payouts: HistoricalPayout[] }) {
  const [expanded, setExpanded] = useState(false);
  const displayPayouts = expanded ? payouts : payouts.slice(0, 3);

  return (
    <div className="space-y-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <h3 className="text-sm font-semibold text-ink-black dark:text-pearl flex items-center gap-2">
          <History className="w-4 h-4 text-nebula-purple" />
          Historical Payouts
        </h3>
        {payouts.length > 3 && (
          <span className="text-xs text-celestial-indigo flex items-center gap-1">
            {expanded ? 'Show less' : `+${payouts.length - 3} more`}
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </span>
        )}
      </button>
      <div className="space-y-2">
        {displayPayouts.map((p, i) => (
          <div
            key={`${p.year}-${p.scheme}-${p.quarter ?? 'full'}-${i}`}
            className="flex items-center justify-between p-3 rounded-lg bg-cloud/30 dark:bg-nebula-purple/10 border border-cloud dark:border-nebula-purple/20"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-ink-black dark:text-pearl truncate">
                  {p.year} {p.quarter ? `${p.quarter} ` : ''}
                  {p.scheme}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] text-silver-mist">Paid {p.payoutDate}</span>
                <span className="text-[10px] text-silver-mist">{p.performanceRating}</span>
                <span className="text-[10px] text-celestial-indigo font-medium">
                  {p.multiplierApplied}x
                </span>
              </div>
            </div>
            <div className="text-right pl-3">
              <p className="text-sm font-bold text-ink-black dark:text-pearl">
                {formatCurrency(p.actualAmount)}
              </p>
              <p className="text-[10px] text-silver-mist">
                of {formatCurrency(p.targetAmount)} target
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TaxEstimationPanel({ tax }: { tax: TaxEstimation }) {
  const items = [
    { label: 'Gross Bonus', value: tax.grossAmount, highlight: true },
    { label: 'Federal Tax', value: -tax.federalTax, highlight: false },
    { label: 'State Tax', value: -tax.stateTax, highlight: false },
    { label: 'Social Security', value: -tax.socialSecurity, highlight: false },
    { label: 'Medicare', value: -tax.medicare, highlight: false },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-ink-black dark:text-pearl flex items-center gap-2">
        <Receipt className="w-4 h-4 text-sunset-amber" />
        Tax Estimation
      </h3>
      <div className="p-4 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-deep-cosmos/30">
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <span
                className={
                  item.highlight ? 'font-medium text-ink-black dark:text-pearl' : 'text-silver-mist'
                }
              >
                {item.label}
              </span>
              <span
                className={
                  item.value < 0
                    ? 'text-coral-alert font-medium'
                    : 'font-medium text-ink-black dark:text-pearl'
                }
              >
                {item.value < 0 ? '- ' : ''}
                {formatCurrencyPrecise(Math.abs(item.value))}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-cloud dark:border-nebula-purple/30 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink-black dark:text-pearl">
              Estimated Net Payout
            </p>
            <p className="text-[10px] text-silver-mist">
              Effective rate: {tax.effectiveRate.toFixed(1)}%
            </p>
          </div>
          <p className="text-lg font-bold text-aurora-green">{formatCurrency(tax.netAmount)}</p>
        </div>
      </div>
      <div className="flex items-start gap-2 p-2 rounded-lg bg-sunset-amber/5 border border-sunset-amber/20">
        <AlertCircle className="w-3.5 h-3.5 text-sunset-amber shrink-0 mt-0.5" />
        <p className="text-[10px] text-sunset-amber leading-relaxed">
          Tax estimates are approximate and based on supplemental wage withholding rates. Actual
          withholdings may vary based on your W-4 elections, filing status, and total annual
          compensation. Consult your tax advisor.
        </p>
      </div>
    </div>
  );
}

function PeerComparisonPanel({
  comparison,
  currentBonus,
}: {
  comparison: PeerComparison;
  currentBonus: number;
}) {
  const teamPercentile = useMemo(() => {
    if (currentBonus <= comparison.teamP25) return 25;
    if (currentBonus >= comparison.teamP75) return 75;
    const range = comparison.teamP75 - comparison.teamP25;
    return range > 0 ? 25 + ((currentBonus - comparison.teamP25) / range) * 50 : 50;
  }, [currentBonus, comparison]);

  const companyPercentile = useMemo(() => {
    if (currentBonus <= comparison.companyP25) return 25;
    if (currentBonus >= comparison.companyP75) return 75;
    const range = comparison.companyP75 - comparison.companyP25;
    return range > 0 ? 25 + ((currentBonus - comparison.companyP25) / range) * 50 : 50;
  }, [currentBonus, comparison]);

  const renderComparisonBar = (
    label: string,
    median: number,
    p25: number,
    p75: number,
    percentile: number,
    size: number
  ) => {
    const maxVal = Math.max(p75 * 1.3, currentBonus * 1.1);
    const medianPos = (median / maxVal) * 100;
    const p25Pos = (p25 / maxVal) * 100;
    const p75Pos = (p75 / maxVal) * 100;
    const yourPos = Math.min((currentBonus / maxVal) * 100, 100);

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-ink-black dark:text-pearl">{label}</span>
          <span className="text-[10px] text-silver-mist">{size} employees (anonymized)</span>
        </div>
        <div className="relative h-8 rounded-lg bg-cloud/50 dark:bg-nebula-purple/10 overflow-visible">
          {/* IQR range bar */}
          <div
            className="absolute top-1 bottom-1 rounded bg-celestial-indigo/15 dark:bg-celestial-indigo/20"
            style={{
              left: `${p25Pos}%`,
              width: `${p75Pos - p25Pos}%`,
            }}
          />
          {/* Median line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-celestial-indigo/60"
            style={{ left: `${medianPos}%` }}
          />
          {/* Your position marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-aurora-green border-2 border-white dark:border-deep-cosmos shadow-sm z-10"
            style={{ left: `${yourPos}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-silver-mist">
          <span>P25: {formatCurrency(p25)}</span>
          <span className="text-celestial-indigo font-medium">
            Median: {formatCurrency(median)}
          </span>
          <span>P75: {formatCurrency(p75)}</span>
        </div>
        <p className="text-[10px] text-silver-mist">
          Your bonus is at the{' '}
          <span className="font-semibold text-aurora-green">
            {percentile.toFixed(0)}th percentile
          </span>
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-ink-black dark:text-pearl flex items-center gap-2">
        <Users className="w-4 h-4 text-celestial-indigo" />
        Peer Comparison (Anonymized)
      </h3>
      <div className="p-4 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-deep-cosmos/30 space-y-5">
        {renderComparisonBar(
          'vs. Team',
          comparison.teamMedian,
          comparison.teamP25,
          comparison.teamP75,
          teamPercentile,
          comparison.teamSize
        )}
        {renderComparisonBar(
          'vs. Company',
          comparison.companyMedian,
          comparison.companyP25,
          comparison.companyP75,
          companyPercentile,
          comparison.companySize
        )}
      </div>
    </div>
  );
}

function PerformanceRatingDescriptions({ currentMultiplier }: { currentMultiplier: number }) {
  const activeRating = getPerformanceRatingForMultiplier(currentMultiplier);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-ink-black dark:text-pearl flex items-center gap-2">
        <Star className="w-4 h-4 text-sunset-amber" />
        Performance Rating Scale
      </h3>
      <div className="space-y-2">
        {PERFORMANCE_RATINGS.map((rating) => {
          const isActive = activeRating?.label === rating.label;
          return (
            <div
              key={rating.label}
              className={`p-3 rounded-lg border-2 transition-all ${
                isActive
                  ? `border-${rating.color}/50 bg-${rating.color}/5 dark:bg-${rating.color}/10`
                  : 'border-transparent bg-cloud/20 dark:bg-nebula-purple/5'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-sm font-semibold ${
                    isActive ? 'text-ink-black dark:text-pearl' : 'text-silver-mist'
                  }`}
                >
                  {rating.label}
                  {isActive && (
                    <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-celestial-indigo text-white">
                      Current
                    </span>
                  )}
                </span>
                <span className="text-xs text-silver-mist font-mono">
                  {rating.multiplierMin.toFixed(1)}x &ndash; {rating.multiplierMax.toFixed(1)}x
                </span>
              </div>
              {isActive && (
                <p className="text-xs text-silver-mist leading-relaxed mt-1">
                  {rating.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WaterfallBreakdown({ steps }: { steps: WaterfallStep[] }) {
  const maxVal = Math.max(...steps.map((s) => Math.abs(s.value)));

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-ink-black dark:text-pearl flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-celestial-indigo" />
        Calculation Breakdown
      </h3>
      <div className="p-4 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-deep-cosmos/30">
        <div className="space-y-2">
          {steps.map((wStep, i) => {
            const barWidth = maxVal > 0 ? (Math.abs(wStep.value) / maxVal) * 100 : 0;
            const isTotal = wStep.type === 'total';
            const isSubtract = wStep.type === 'subtract';

            return (
              <div key={`${wStep.label}-${i}`}>
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs ${
                      isTotal ? 'font-bold text-ink-black dark:text-pearl' : 'text-silver-mist'
                    }`}
                  >
                    {wStep.label}
                  </span>
                  <div className="flex items-center gap-2">
                    {wStep.delta !== 0 && !isTotal && i > 0 && (
                      <span
                        className={`text-[10px] font-medium ${
                          wStep.delta > 0 ? 'text-aurora-green' : 'text-coral-alert'
                        }`}
                      >
                        {wStep.delta > 0 ? '+' : ''}
                        {formatCurrency(wStep.delta)}
                      </span>
                    )}
                    <span
                      className={`text-xs font-semibold ${
                        isTotal ? 'text-celestial-indigo' : 'text-ink-black dark:text-pearl'
                      }`}
                    >
                      {formatCurrency(wStep.value)}
                    </span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-cloud/50 dark:bg-nebula-purple/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isTotal
                        ? 'bg-gradient-to-r from-celestial-indigo to-aurora-green'
                        : isSubtract
                          ? 'bg-coral-alert/60'
                          : 'bg-celestial-indigo/40'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                {i < steps.length - 1 && (
                  <div className="flex justify-center py-1">
                    <ArrowDown className="w-3 h-3 text-silver-mist/50" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BonusComponentsEditor({
  components,
  onChange,
}: {
  components: BonusComponent[];
  onChange: (components: BonusComponent[]) => void;
}) {
  const addComponent = () => {
    onChange([
      ...components,
      {
        id: generateComponentId(),
        name: '',
        type: 'custom',
        amount: 0,
        description: '',
      },
    ]);
  };

  const removeComponent = (id: string) => {
    if (components.length <= 1) return;
    onChange(components.filter((c) => c.id !== id));
  };

  const updateComponent = (id: string, field: keyof BonusComponent, value: string | number) => {
    onChange(components.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const totalAdditional = components.reduce((sum, c) => sum + c.amount, 0);

  const typeOptions: { value: BonusComponent['type']; label: string }[] = [
    { value: 'base', label: 'Base Bonus' },
    { value: 'project', label: 'Project Bonus' },
    { value: 'retention', label: 'Retention' },
    { value: 'spot', label: 'Spot Bonus' },
    { value: 'custom', label: 'Custom' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink-black dark:text-pearl flex items-center gap-2">
          <Layers className="w-4 h-4 text-nebula-purple" />
          Additional Bonus Components
        </h3>
        <button
          onClick={addComponent}
          className="flex items-center gap-1 text-xs text-celestial-indigo hover:text-celestial-indigo/80 font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Component
        </button>
      </div>
      <div className="space-y-2">
        {components.map((comp) => (
          <div
            key={comp.id}
            className="p-3 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-deep-cosmos/30"
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Component name"
                    value={comp.name}
                    onChange={(e) => updateComponent(comp.id, 'name', e.target.value)}
                    className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl focus:ring-2 focus:ring-celestial-indigo focus:outline-none"
                  />
                  <select
                    value={comp.type}
                    onChange={(e) =>
                      updateComponent(comp.id, 'type', e.target.value as BonusComponent['type'])
                    }
                    className="px-3 py-1.5 text-sm rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl focus:ring-2 focus:ring-celestial-indigo focus:outline-none"
                  >
                    {typeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-silver-mist" />
                    <input
                      type="number"
                      placeholder="Amount"
                      value={comp.amount || ''}
                      onChange={(e) => updateComponent(comp.id, 'amount', Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl focus:ring-2 focus:ring-celestial-indigo focus:outline-none"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={comp.description}
                    onChange={(e) => updateComponent(comp.id, 'description', e.target.value)}
                    className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl focus:ring-2 focus:ring-celestial-indigo focus:outline-none"
                  />
                </div>
              </div>
              <button
                onClick={() => removeComponent(comp.id)}
                disabled={components.length <= 1}
                className="p-1.5 rounded-lg text-silver-mist hover:text-coral-alert hover:bg-coral-alert/5 disabled:opacity-30 disabled:hover:text-silver-mist disabled:hover:bg-transparent transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {totalAdditional > 0 && (
        <div className="flex items-center justify-between p-2 rounded-lg bg-nebula-purple/5 border border-nebula-purple/20">
          <span className="text-xs text-silver-mist">Additional components total</span>
          <span className="text-sm font-bold text-nebula-purple">
            +{formatCurrency(totalAdditional)}
          </span>
        </div>
      )}
    </div>
  );
}

function RealTimePreviewSidebar({
  config,
  selectedScheme,
  bonusComponents,
  adjustedBonus,
  totalWithComponents,
  tax,
}: {
  config: BonusConfig;
  selectedScheme: BonusScheme;
  bonusComponents: BonusComponent[];
  adjustedBonus: number;
  totalWithComponents: number;
  tax: TaxEstimation;
}) {
  const additionalTotal = bonusComponents.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="rounded-xl border border-cloud dark:border-nebula-purple/30 bg-gradient-to-b from-white to-cloud/20 dark:from-deep-cosmos/50 dark:to-stellar-blue/30 p-5 sticky top-6">
      <div className="flex items-center gap-2 mb-4">
        <Eye className="w-4 h-4 text-celestial-indigo" />
        <h3 className="text-sm font-bold text-ink-black dark:text-pearl">Live Preview</h3>
        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-aurora-green/10 text-aurora-green font-medium animate-pulse">
          Real-time
        </span>
      </div>

      <div className="space-y-3">
        <div className="p-3 rounded-lg bg-white dark:bg-deep-cosmos/40 border border-cloud dark:border-nebula-purple/20">
          <p className="text-[10px] text-silver-mist uppercase tracking-wider mb-1">Scheme</p>
          <p className="text-sm font-semibold text-ink-black dark:text-pearl">
            {selectedScheme.name}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg bg-cloud/30 dark:bg-nebula-purple/10">
            <p className="text-[10px] text-silver-mist">Base Salary</p>
            <p className="text-sm font-bold text-ink-black dark:text-pearl">
              {formatCurrency(config.baseSalary)}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-cloud/30 dark:bg-nebula-purple/10">
            <p className="text-[10px] text-silver-mist">Target %</p>
            <p className="text-sm font-bold text-ink-black dark:text-pearl">
              {config.targetBonusPercent}%
            </p>
          </div>
          <div className="p-2 rounded-lg bg-cloud/30 dark:bg-nebula-purple/10">
            <p className="text-[10px] text-silver-mist">Perf. Mult.</p>
            <p className="text-sm font-bold text-ink-black dark:text-pearl">
              {config.performanceMultiplier.toFixed(2)}x
            </p>
          </div>
          <div className="p-2 rounded-lg bg-cloud/30 dark:bg-nebula-purple/10">
            <p className="text-[10px] text-silver-mist">Company Mult.</p>
            <p className="text-sm font-bold text-ink-black dark:text-pearl">
              {config.companyPerformanceFactor.toFixed(2)}x
            </p>
          </div>
        </div>

        <div className="p-2 rounded-lg bg-cloud/30 dark:bg-nebula-purple/10">
          <p className="text-[10px] text-silver-mist">
            Proration ({config.prorationMonths}/12 months)
          </p>
          <p className="text-sm font-bold text-ink-black dark:text-pearl">
            {((config.prorationMonths / 12) * 100).toFixed(1)}%
          </p>
        </div>

        <div className="border-t border-cloud dark:border-nebula-purple/20 pt-3">
          <div className="flex items-center justify-between text-xs text-silver-mist mb-1">
            <span>Calculated Bonus</span>
            <span>{formatCurrency(adjustedBonus)}</span>
          </div>
          {additionalTotal > 0 && (
            <div className="flex items-center justify-between text-xs text-silver-mist mb-1">
              <span>+ Components ({bonusComponents.filter((c) => c.amount > 0).length})</span>
              <span className="text-nebula-purple">+{formatCurrency(additionalTotal)}</span>
            </div>
          )}
        </div>

        <div className="p-3 rounded-lg bg-gradient-to-r from-celestial-indigo/10 to-aurora-green/10 border border-celestial-indigo/20">
          <p className="text-[10px] text-silver-mist uppercase tracking-wider mb-0.5">
            Total Gross Bonus
          </p>
          <p className="text-2xl font-bold text-ink-black dark:text-pearl">
            {formatCurrency(totalWithComponents)}
          </p>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-aurora-green/5 border border-aurora-green/20">
          <span className="text-xs text-silver-mist">Est. Net (after tax)</span>
          <span className="text-sm font-bold text-aurora-green">
            {formatCurrency(tax.netAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const initialConfig: BonusConfig = {
  baseSalary: 165000,
  targetBonusPercent: 20,
  performanceMultiplier: 1.15,
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  prorationMonths: 12,
  companyPerformanceFactor: 1.05,
};

export default function BonusCalculationWizard() {
  const [config, setConfig] = useState<BonusConfig>(initialConfig);
  const [step, setStep] = useState(1);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('annual-performance');
  const [bonusComponents, setBonusComponents] =
    useState<BonusComponent[]>(DEFAULT_BONUS_COMPONENTS);
  const [showPreview, setShowPreview] = useState(true);

  const selectedScheme = useMemo(
    () => BONUS_SCHEMES.find((s) => s.id === selectedSchemeId) ?? BONUS_SCHEMES[0],
    [selectedSchemeId]
  );

  const handleSchemeSelect = useCallback((id: string) => {
    const scheme = BONUS_SCHEMES.find((s) => s.id === id);
    if (scheme) {
      setSelectedSchemeId(id);
      setConfig((prev) => ({
        ...prev,
        targetBonusPercent: scheme.defaultTargetPercent,
        performanceMultiplier: scheme.performanceLinked ? prev.performanceMultiplier : 1.0,
        companyPerformanceFactor: scheme.performanceLinked ? prev.companyPerformanceFactor : 1.0,
      }));
    }
  }, []);

  // Calculations
  const targetBonus = config.baseSalary * (config.targetBonusPercent / 100);
  const prorationFactor = selectedScheme.prorationEnabled ? config.prorationMonths / 12 : 1;

  const effectivePerformanceMultiplier = selectedScheme.performanceLinked
    ? config.performanceMultiplier
    : 1.0;
  const effectiveCompanyFactor = selectedScheme.performanceLinked
    ? config.companyPerformanceFactor
    : 1.0;

  const adjustedBonus =
    targetBonus * effectivePerformanceMultiplier * prorationFactor * effectiveCompanyFactor;

  const additionalComponentsTotal = bonusComponents.reduce((sum, c) => sum + c.amount, 0);
  const totalWithComponents = adjustedBonus + additionalComponentsTotal;

  const tax = useMemo(() => calculateTax(totalWithComponents), [totalWithComponents]);

  // Waterfall steps
  const waterfallSteps = useMemo((): WaterfallStep[] => {
    const afterTarget = targetBonus;
    const afterPerformance = targetBonus * effectivePerformanceMultiplier;
    const afterCompany = targetBonus * effectivePerformanceMultiplier * effectiveCompanyFactor;
    const afterProration =
      targetBonus * effectivePerformanceMultiplier * effectiveCompanyFactor * prorationFactor;
    const afterComponents = afterProration + additionalComponentsTotal;

    const result: WaterfallStep[] = [
      {
        label: `Base Salary (${config.targetBonusPercent}% target)`,
        value: afterTarget,
        delta: 0,
        type: 'base',
      },
      {
        label: `Individual Performance (${effectivePerformanceMultiplier.toFixed(2)}x)`,
        value: afterPerformance,
        delta: afterPerformance - afterTarget,
        type: afterPerformance >= afterTarget ? 'add' : 'subtract',
      },
      {
        label: `Company Performance (${effectiveCompanyFactor.toFixed(2)}x)`,
        value: afterCompany,
        delta: afterCompany - afterPerformance,
        type: afterCompany >= afterPerformance ? 'add' : 'subtract',
      },
    ];

    if (selectedScheme.prorationEnabled && prorationFactor < 1) {
      result.push({
        label: `Proration (${config.prorationMonths}/12 months)`,
        value: afterProration,
        delta: afterProration - afterCompany,
        type: 'subtract',
      });
    }

    if (additionalComponentsTotal > 0) {
      result.push({
        label: `Additional Components`,
        value: afterComponents,
        delta: additionalComponentsTotal,
        type: 'add',
      });
    }

    result.push({
      label: 'Final Bonus',
      value: afterComponents,
      delta: 0,
      type: 'total',
    });

    return result;
  }, [
    targetBonus,
    effectivePerformanceMultiplier,
    effectiveCompanyFactor,
    prorationFactor,
    additionalComponentsTotal,
    config.targetBonusPercent,
    config.prorationMonths,
    selectedScheme.prorationEnabled,
  ]);

  const steps: WizardStep[] = [
    { num: 1, label: 'Base & Target' },
    { num: 2, label: 'Performance' },
    { num: 3, label: 'Proration' },
    { num: 4, label: 'Summary' },
  ];

  return (
    <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Calculator className="w-6 h-6 text-celestial-indigo" />
            <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">
              Bonus Calculation Wizard
            </h1>
          </div>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 text-sm text-silver-mist hover:text-ink-black dark:hover:text-pearl hover:border-celestial-indigo/40 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">{showPreview ? 'Hide' : 'Show'} Preview</span>
          </button>
        </div>
        <p className="text-silver-mist mb-6">
          Calculate and model your estimated bonus payout across multiple schemes and components
        </p>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <React.Fragment key={s.num}>
              <button
                onClick={() => setStep(s.num)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  step === s.num
                    ? 'bg-celestial-indigo text-white'
                    : step > s.num
                      ? 'bg-aurora-green/10 text-aurora-green'
                      : 'bg-cloud dark:bg-nebula-purple/20 text-silver-mist'
                }`}
              >
                {step > s.num ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">
                    {s.num}
                  </span>
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 ${
                    step > s.num ? 'bg-aurora-green' : 'bg-cloud dark:bg-nebula-purple/30'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Main Layout: Wizard + Sidebar */}
        <div
          className={`grid gap-6 ${
            showPreview ? 'lg:grid-cols-[1fr_320px]' : 'grid-cols-1 max-w-3xl'
          }`}
        >
          {/* Left: Wizard Content */}
          <div className="space-y-6">
            {/* Step Content Card */}
            <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
              {/* Step 1: Base & Target */}
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-ink-black dark:text-pearl flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-celestial-indigo" />
                    Base Salary & Target
                  </h2>

                  {/* Bonus Scheme Selector */}
                  <SchemeSelector
                    schemes={BONUS_SCHEMES}
                    selectedSchemeId={selectedSchemeId}
                    onSelect={handleSchemeSelect}
                  />

                  {/* Scheme Config Info */}
                  <div className="p-3 rounded-lg bg-celestial-indigo/5 border border-celestial-indigo/20">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-celestial-indigo shrink-0 mt-0.5" />
                      <div className="text-xs text-celestial-indigo space-y-1">
                        <p>
                          <span className="font-semibold">{selectedScheme.name}</span> &mdash;{' '}
                          {selectedScheme.frequency} payout
                          {selectedScheme.performanceLinked
                            ? ', performance-linked'
                            : ', fixed amount'}
                          {selectedScheme.prorationEnabled ? ', proration enabled' : ''}
                        </p>
                        <p>
                          Multiplier range: {selectedScheme.minMultiplier.toFixed(1)}x &ndash;{' '}
                          {selectedScheme.maxMultiplier.toFixed(1)}x
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Base Salary Input */}
                  <div>
                    <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-1">
                      Annual Base Salary
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
                      <input
                        type="number"
                        value={config.baseSalary}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            baseSalary: Number(e.target.value),
                          })
                        }
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl focus:ring-2 focus:ring-celestial-indigo focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Target Bonus Percentage Input */}
                  <div>
                    <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-1">
                      Target Bonus Percentage
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={config.targetBonusPercent}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            targetBonusPercent: Number(e.target.value),
                          })
                        }
                        className="w-full pr-9 pl-4 py-2.5 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl focus:ring-2 focus:ring-celestial-indigo focus:outline-none"
                      />
                      <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
                    </div>
                    <p className="text-xs text-silver-mist mt-1">
                      Target bonus: {formatCurrency(targetBonus)}
                    </p>
                  </div>

                  {/* Historical Payouts */}
                  <HistoricalPayoutsPanel payouts={HISTORICAL_PAYOUTS} />
                </div>
              )}

              {/* Step 2: Performance */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-ink-black dark:text-pearl flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-celestial-indigo" />
                    Performance Multipliers
                  </h2>

                  {!selectedScheme.performanceLinked && (
                    <div className="p-4 rounded-lg bg-sunset-amber/5 border border-sunset-amber/20">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-sunset-amber shrink-0 mt-0.5" />
                        <p className="text-sm text-sunset-amber">
                          The <strong>{selectedScheme.name}</strong> scheme is not
                          performance-linked. Multipliers are fixed at 1.0x. Switch to a
                          performance-linked scheme to adjust these values.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Individual Performance Multiplier */}
                  <div
                    className={
                      !selectedScheme.performanceLinked ? 'opacity-50 pointer-events-none' : ''
                    }
                  >
                    <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-2">
                      Individual Performance Multiplier: {config.performanceMultiplier.toFixed(2)}x
                    </label>
                    <input
                      type="range"
                      min={selectedScheme.minMultiplier}
                      max={selectedScheme.maxMultiplier}
                      step="0.05"
                      value={config.performanceMultiplier}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          performanceMultiplier: Number(e.target.value),
                        })
                      }
                      className="w-full h-2 accent-celestial-indigo"
                    />
                    <div className="flex justify-between text-xs text-silver-mist mt-1">
                      <span>{selectedScheme.minMultiplier.toFixed(1)}x (Below)</span>
                      <span>1x (Target)</span>
                      <span>{selectedScheme.maxMultiplier.toFixed(1)}x (Exceptional)</span>
                    </div>
                  </div>

                  {/* Company Performance Factor */}
                  <div
                    className={
                      !selectedScheme.performanceLinked ? 'opacity-50 pointer-events-none' : ''
                    }
                  >
                    <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-2">
                      Company Performance Factor: {config.companyPerformanceFactor.toFixed(2)}x
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="1.5"
                      step="0.05"
                      value={config.companyPerformanceFactor}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          companyPerformanceFactor: Number(e.target.value),
                        })
                      }
                      className="w-full h-2 accent-celestial-indigo"
                    />
                    <div className="flex justify-between text-xs text-silver-mist mt-1">
                      <span>0.5x</span>
                      <span>1x</span>
                      <span>1.5x</span>
                    </div>
                  </div>

                  {/* Combined Multiplier Info */}
                  <div className="p-3 rounded-lg bg-celestial-indigo/5 border border-celestial-indigo/20">
                    <div className="flex items-center gap-2 text-sm text-celestial-indigo">
                      <Info className="w-4 h-4" />
                      <span>
                        Combined multiplier:{' '}
                        {(effectivePerformanceMultiplier * effectiveCompanyFactor).toFixed(2)}x
                      </span>
                    </div>
                  </div>

                  {/* Performance Rating Descriptions */}
                  <PerformanceRatingDescriptions
                    currentMultiplier={effectivePerformanceMultiplier}
                  />
                </div>
              )}

              {/* Step 3: Proration */}
              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-ink-black dark:text-pearl flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-celestial-indigo" />
                    Proration & Additional Components
                  </h2>

                  {!selectedScheme.prorationEnabled && (
                    <div className="p-4 rounded-lg bg-sunset-amber/5 border border-sunset-amber/20">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-sunset-amber shrink-0 mt-0.5" />
                        <p className="text-sm text-sunset-amber">
                          The <strong>{selectedScheme.name}</strong> scheme does not support
                          proration. The full bonus amount applies regardless of start date.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Proration Months */}
                  <div
                    className={
                      !selectedScheme.prorationEnabled ? 'opacity-50 pointer-events-none' : ''
                    }
                  >
                    <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-1">
                      Eligible Months in Period
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={config.prorationMonths}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          prorationMonths: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl focus:ring-2 focus:ring-celestial-indigo focus:outline-none"
                    />
                    <p className="text-xs text-silver-mist mt-1">
                      For employees who joined mid-year or changed roles
                    </p>
                  </div>

                  {/* Proration Factor Display */}
                  <div className="p-4 rounded-lg bg-cloud/30 dark:bg-nebula-purple/10">
                    <p className="text-sm text-ink-black dark:text-pearl">
                      Proration factor:{' '}
                      <span className="font-bold">{(prorationFactor * 100).toFixed(1)}%</span>
                    </p>
                    <p className="text-xs text-silver-mist mt-1">
                      {selectedScheme.prorationEnabled
                        ? `${config.prorationMonths} of 12 months eligible`
                        : 'Proration not applicable for this scheme'}
                    </p>
                  </div>

                  {/* Multiple Bonus Components */}
                  <BonusComponentsEditor
                    components={bonusComponents}
                    onChange={setBonusComponents}
                  />
                </div>
              )}

              {/* Step 4: Summary */}
              {step === 4 && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">
                    Bonus Calculation Summary
                  </h2>

                  {/* Line Items */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-cloud dark:border-nebula-purple/50">
                      <span className="text-sm text-silver-mist">Bonus Scheme</span>
                      <span className="text-sm font-medium text-ink-black dark:text-pearl">
                        {selectedScheme.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-cloud dark:border-nebula-purple/50">
                      <span className="text-sm text-silver-mist">Base Salary</span>
                      <span className="text-sm font-medium text-ink-black dark:text-pearl">
                        {formatCurrency(config.baseSalary)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-cloud dark:border-nebula-purple/50">
                      <span className="text-sm text-silver-mist">
                        Target Bonus ({config.targetBonusPercent}%)
                      </span>
                      <span className="text-sm font-medium text-ink-black dark:text-pearl">
                        {formatCurrency(targetBonus)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-cloud dark:border-nebula-purple/50">
                      <span className="text-sm text-silver-mist">Individual Performance</span>
                      <span className="text-sm font-medium text-ink-black dark:text-pearl">
                        {effectivePerformanceMultiplier.toFixed(2)}x
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-cloud dark:border-nebula-purple/50">
                      <span className="text-sm text-silver-mist">Company Performance</span>
                      <span className="text-sm font-medium text-ink-black dark:text-pearl">
                        {effectiveCompanyFactor.toFixed(2)}x
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-cloud dark:border-nebula-purple/50">
                      <span className="text-sm text-silver-mist">
                        Proration ({config.prorationMonths}/12 months)
                      </span>
                      <span className="text-sm font-medium text-ink-black dark:text-pearl">
                        {(prorationFactor * 100).toFixed(1)}%
                      </span>
                    </div>
                    {additionalComponentsTotal > 0 && (
                      <div className="flex items-center justify-between py-2 border-b border-cloud dark:border-nebula-purple/50">
                        <span className="text-sm text-silver-mist">
                          Additional Components (
                          {bonusComponents.filter((c) => c.amount > 0).length})
                        </span>
                        <span className="text-sm font-medium text-nebula-purple">
                          +{formatCurrency(additionalComponentsTotal)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Final Payout Card */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-celestial-indigo/10 to-aurora-green/10 border border-celestial-indigo/20">
                    <p className="text-sm text-silver-mist mb-1">Estimated Gross Bonus Payout</p>
                    <p className="text-3xl font-bold text-ink-black dark:text-pearl">
                      {formatCurrency(totalWithComponents)}
                    </p>
                    <p className="text-xs text-silver-mist mt-1">
                      {formatCurrency(targetBonus)} x {effectivePerformanceMultiplier.toFixed(2)} x{' '}
                      {effectiveCompanyFactor.toFixed(2)} x {prorationFactor.toFixed(2)}
                      {additionalComponentsTotal > 0
                        ? ` + ${formatCurrency(additionalComponentsTotal)} components`
                        : ''}
                    </p>
                  </div>

                  {/* Waterfall Breakdown */}
                  <WaterfallBreakdown steps={waterfallSteps} />

                  {/* Tax Estimation */}
                  <TaxEstimationPanel tax={tax} />

                  {/* Peer Comparison */}
                  <PeerComparisonPanel
                    comparison={MOCK_PEER_COMPARISON}
                    currentBonus={totalWithComponents}
                  />
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
                className="px-4 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 text-ink-black dark:text-pearl disabled:opacity-40 hover:bg-cloud dark:hover:bg-nebula-purple/20 transition-colors"
              >
                Previous
              </button>
              {step < 4 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-celestial-indigo text-white font-medium hover:bg-celestial-indigo/90 transition-colors"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button className="flex items-center gap-2 px-6 py-2 rounded-lg bg-aurora-green text-white font-medium hover:bg-aurora-green/90 transition-colors">
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm Calculation
                </button>
              )}
            </div>
          </div>

          {/* Right: Real-Time Preview Sidebar */}
          {showPreview && (
            <div className="hidden lg:block">
              <RealTimePreviewSidebar
                config={config}
                selectedScheme={selectedScheme}
                bonusComponents={bonusComponents}
                adjustedBonus={adjustedBonus}
                totalWithComponents={totalWithComponents}
                tax={tax}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
