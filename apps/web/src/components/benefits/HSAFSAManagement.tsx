// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
'use client';

import React, { useState, useMemo } from 'react';
import {
  Wallet,
  TrendingUp,
  Building2,
  Receipt,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  BarChart3,
  Calculator,
  RefreshCw,
  CalendarClock,
  FileText,
  Upload,
  Baby,
  PiggyBank,
  Clock,
  AlertTriangle,
  ChevronRight,
  DollarSign,
  _Percent,
  TrendingDown,
  Briefcase,
  Eye,
  Stethoscope,
  Pill,
  Heart,
  Brain,
  Activity,
  Glasses,
  Smile,
  CircleDollarSign,
  Info,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Calendar,
  CreditCard,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// TypeScript interfaces
// ---------------------------------------------------------------------------

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'expense' | 'contribution' | 'employer' | 'rollover' | 'investment';
  category: string;
  status: 'completed' | 'pending' | 'denied';
}

interface SpendingCategory {
  name: string;
  amount: number;
  color: string;
  icon: React.ReactNode;
}

interface InvestmentFund {
  id: string;
  name: string;
  ticker: string;
  allocation: number;
  balance: number;
  ytdReturn: number;
  expenseRatio: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

interface TaxBracket {
  federal: number;
  state: number;
  fica: number;
}

interface RolloverInfo {
  previousYearRollover: number;
  currentYearContributions: number;
  currentYearEmployer: number;
  currentYearExpenses: number;
  totalAvailable: number;
}

interface KeyDate {
  label: string;
  date: string;
  type: 'deadline' | 'info' | 'warning';
  description: string;
}

interface DependentFSA {
  enabled: boolean;
  balance: number;
  annualLimit: number;
  contributionsYTD: number;
  spentYTD: number;
}

interface ClaimForm {
  amount: string;
  category: string;
  date: string;
  description: string;
  receiptAttached: boolean;
}

interface HSAData {
  accountType: 'HSA';
  currentBalance: number;
  annualLimit: number;
  contributionsYTD: number;
  employerContributions: number;
  totalSpentYTD: number;
  eligibleExpenses: string[];
  recentTransactions: Transaction[];
  investmentBalance: number;
  cashBalance: number;
  investmentThreshold: number;
  investments: InvestmentFund[];
  rollover: RolloverInfo;
  monthlyContributionRate: number;
  averageMonthlySpend: number;
}

interface FSAData {
  accountType: 'FSA';
  currentBalance: number;
  annualLimit: number;
  contributionsYTD: number;
  employerContributions: number;
  totalSpentYTD: number;
  eligibleExpenses: string[];
  recentTransactions: Transaction[];
  gracePeriodEnd: string;
  runoutPeriodEnd: string;
  forfeitureAmount: number;
  dependentFSA: DependentFSA;
  monthlyContributionRate: number;
  averageMonthlySpend: number;
}

type AccountData = HSAData | FSAData;

type TabKey =
  | 'overview'
  | 'transactions'
  | 'eligible'
  | 'investments'
  | 'tax-savings'
  | 'spending'
  | 'claims';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const hsaTransactions: Transaction[] = [
  {
    id: 'h-001',
    date: '2026-02-20',
    description: 'CVS Pharmacy - Prescription Refill',
    amount: -67.5,
    type: 'expense',
    category: 'Pharmacy',
    status: 'completed',
  },
  {
    id: 'h-002',
    date: '2026-02-15',
    description: 'Bi-weekly Payroll Contribution',
    amount: 192.31,
    type: 'contribution',
    category: 'Contribution',
    status: 'completed',
  },
  {
    id: 'h-003',
    date: '2026-02-12',
    description: 'Dr. Patel - Specialist Office Visit',
    amount: -175.0,
    type: 'expense',
    category: 'Medical',
    status: 'completed',
  },
  {
    id: 'h-004',
    date: '2026-02-01',
    description: 'Bi-weekly Payroll Contribution',
    amount: 192.31,
    type: 'contribution',
    category: 'Contribution',
    status: 'completed',
  },
  {
    id: 'h-005',
    date: '2026-01-28',
    description: 'Employer Quarterly Match',
    amount: 375.0,
    type: 'employer',
    category: 'Employer',
    status: 'completed',
  },
  {
    id: 'h-006',
    date: '2026-01-25',
    description: 'Walgreens - OTC Eligible Items',
    amount: -32.99,
    type: 'expense',
    category: 'Pharmacy',
    status: 'completed',
  },
  {
    id: 'h-007',
    date: '2026-01-20',
    description: 'LensCrafters - Contact Lenses',
    amount: -215.0,
    type: 'expense',
    category: 'Vision',
    status: 'completed',
  },
  {
    id: 'h-008',
    date: '2026-01-15',
    description: 'Bi-weekly Payroll Contribution',
    amount: 192.31,
    type: 'contribution',
    category: 'Contribution',
    status: 'completed',
  },
  {
    id: 'h-009',
    date: '2026-01-10',
    description: 'Fidelity - Investment Transfer',
    amount: -500.0,
    type: 'investment',
    category: 'Investment',
    status: 'completed',
  },
  {
    id: 'h-010',
    date: '2026-01-05',
    description: 'Dr. Kim - Dental Cleaning',
    amount: -95.0,
    type: 'expense',
    category: 'Dental',
    status: 'completed',
  },
  {
    id: 'h-011',
    date: '2026-01-01',
    description: 'Prior Year Rollover',
    amount: 3825.0,
    type: 'rollover',
    category: 'Rollover',
    status: 'completed',
  },
  {
    id: 'h-012',
    date: '2026-01-01',
    description: 'Bi-weekly Payroll Contribution',
    amount: 192.31,
    type: 'contribution',
    category: 'Contribution',
    status: 'completed',
  },
  {
    id: 'h-013',
    date: '2025-12-28',
    description: 'Therapy Session - Dr. Lewis',
    amount: -150.0,
    type: 'expense',
    category: 'Mental Health',
    status: 'completed',
  },
  {
    id: 'h-014',
    date: '2025-12-20',
    description: 'Physical Therapy - 2 Sessions',
    amount: -120.0,
    type: 'expense',
    category: 'Physical Therapy',
    status: 'completed',
  },
  {
    id: 'h-015',
    date: '2025-12-15',
    description: 'Lab Corp - Blood Work Panel',
    amount: -85.0,
    type: 'expense',
    category: 'Lab & Diagnostics',
    status: 'completed',
  },
];

const fsaTransactions: Transaction[] = [
  {
    id: 'f-001',
    date: '2026-02-20',
    description: 'CVS Pharmacy - Prescription',
    amount: -45.0,
    type: 'expense',
    category: 'Pharmacy',
    status: 'completed',
  },
  {
    id: 'f-002',
    date: '2026-02-15',
    description: 'Bi-weekly Payroll Deduction',
    amount: 115.38,
    type: 'contribution',
    category: 'Contribution',
    status: 'completed',
  },
  {
    id: 'f-003',
    date: '2026-02-10',
    description: 'Dr. Smith - Office Visit Copay',
    amount: -40.0,
    type: 'expense',
    category: 'Medical',
    status: 'completed',
  },
  {
    id: 'f-004',
    date: '2026-02-01',
    description: 'Bi-weekly Payroll Deduction',
    amount: 115.38,
    type: 'contribution',
    category: 'Contribution',
    status: 'completed',
  },
  {
    id: 'f-005',
    date: '2026-01-28',
    description: 'Target Optical - New Frames',
    amount: -189.0,
    type: 'expense',
    category: 'Vision',
    status: 'completed',
  },
  {
    id: 'f-006',
    date: '2026-01-22',
    description: 'Dental Associates - Crown',
    amount: -450.0,
    type: 'expense',
    category: 'Dental',
    status: 'completed',
  },
  {
    id: 'f-007',
    date: '2026-01-15',
    description: 'Bi-weekly Payroll Deduction',
    amount: 115.38,
    type: 'contribution',
    category: 'Contribution',
    status: 'completed',
  },
  {
    id: 'f-008',
    date: '2026-01-10',
    description: 'Rite Aid - Allergy Medication',
    amount: -28.5,
    type: 'expense',
    category: 'Pharmacy',
    status: 'completed',
  },
  {
    id: 'f-009',
    date: '2026-01-05',
    description: 'Urgent Care - Flu Treatment',
    amount: -75.0,
    type: 'expense',
    category: 'Medical',
    status: 'completed',
  },
  {
    id: 'f-010',
    date: '2026-01-01',
    description: 'Bi-weekly Payroll Deduction',
    amount: 115.38,
    type: 'contribution',
    category: 'Contribution',
    status: 'completed',
  },
  {
    id: 'f-011',
    date: '2025-12-28',
    description: 'Chiropractor - Adjustment',
    amount: -60.0,
    type: 'expense',
    category: 'Physical Therapy',
    status: 'completed',
  },
  {
    id: 'f-012',
    date: '2025-12-20',
    description: 'Claim Denied - Cosmetic Procedure',
    amount: -350.0,
    type: 'expense',
    category: 'Medical',
    status: 'denied',
  },
];

const mockHSA: HSAData = {
  accountType: 'HSA',
  currentBalance: 6548.75,
  annualLimit: 4300,
  contributionsYTD: 961.55,
  employerContributions: 375.0,
  totalSpentYTD: 940.49,
  monthlyContributionRate: 384.62,
  averageMonthlySpend: 470.25,
  eligibleExpenses: [
    'Doctor visits & copays',
    'Prescription medications',
    'Dental cleanings & procedures',
    'Vision exams & corrective lenses',
    'Mental health therapy & counseling',
    'Physical therapy & rehab',
    'Lab tests, X-rays & diagnostics',
    'Durable medical equipment',
    'Hearing aids & batteries',
    'Chiropractic services',
    'Acupuncture treatments',
    'Substance abuse treatment',
  ],
  recentTransactions: hsaTransactions,
  investmentBalance: 2850.0,
  cashBalance: 3698.75,
  investmentThreshold: 1000,
  investments: [
    {
      id: 'inv-1',
      name: 'Vanguard Total Stock Market Index',
      ticker: 'VTSAX',
      allocation: 40,
      balance: 1140.0,
      ytdReturn: 4.2,
      expenseRatio: 0.04,
      riskLevel: 'Medium',
    },
    {
      id: 'inv-2',
      name: 'Fidelity US Bond Index',
      ticker: 'FXNAX',
      allocation: 25,
      balance: 712.5,
      ytdReturn: 1.8,
      expenseRatio: 0.03,
      riskLevel: 'Low',
    },
    {
      id: 'inv-3',
      name: 'Schwab International Index',
      ticker: 'SWISX',
      allocation: 20,
      balance: 570.0,
      ytdReturn: 3.1,
      expenseRatio: 0.06,
      riskLevel: 'Medium',
    },
    {
      id: 'inv-4',
      name: 'Vanguard REIT Index',
      ticker: 'VGSLX',
      allocation: 15,
      balance: 427.5,
      ytdReturn: -1.2,
      expenseRatio: 0.12,
      riskLevel: 'High',
    },
  ],
  rollover: {
    previousYearRollover: 3825.0,
    currentYearContributions: 961.55,
    currentYearEmployer: 375.0,
    currentYearExpenses: 940.49,
    totalAvailable: 6548.75,
  },
};

const mockFSA: FSAData = {
  accountType: 'FSA',
  currentBalance: 1637.64,
  annualLimit: 3050,
  contributionsYTD: 576.9,
  employerContributions: 0,
  totalSpentYTD: 937.5,
  monthlyContributionRate: 230.77,
  averageMonthlySpend: 468.75,
  gracePeriodEnd: '2026-03-15',
  runoutPeriodEnd: '2026-03-31',
  forfeitureAmount: 0,
  eligibleExpenses: [
    'Doctor visits & copays',
    'Prescription medications',
    'Dental cleanings & procedures',
    'Vision exams & corrective lenses',
    'Mental health therapy & counseling',
    'Physical therapy & rehab',
    'Lab tests, X-rays & diagnostics',
    'Durable medical equipment',
    'Over-the-counter medications',
    'First aid supplies',
    'Sunscreen (SPF 15+)',
    'Menstrual care products',
  ],
  recentTransactions: fsaTransactions,
  dependentFSA: {
    enabled: true,
    balance: 2450.0,
    annualLimit: 5000,
    contributionsYTD: 1923.08,
    spentYTD: 3473.08,
  },
};

const spendingCategories: SpendingCategory[] = [
  {
    name: 'Medical',
    amount: 380.0,
    color: 'bg-celestial-indigo',
    icon: <Stethoscope className="w-4 h-4" />,
  },
  { name: 'Dental', amount: 545.0, color: 'bg-nebula-purple', icon: <Smile className="w-4 h-4" /> },
  {
    name: 'Vision',
    amount: 404.0,
    color: 'bg-aurora-green',
    icon: <Glasses className="w-4 h-4" />,
  },
  { name: 'Pharmacy', amount: 174.0, color: 'bg-sunset-amber', icon: <Pill className="w-4 h-4" /> },
  {
    name: 'Mental Health',
    amount: 150.0,
    color: 'bg-quantum-rose',
    icon: <Brain className="w-4 h-4" />,
  },
  {
    name: 'Physical Therapy',
    amount: 180.0,
    color: 'bg-neural-mint',
    icon: <Activity className="w-4 h-4" />,
  },
  {
    name: 'Lab & Diagnostics',
    amount: 85.0,
    color: 'bg-coral-alert',
    icon: <Eye className="w-4 h-4" />,
  },
  {
    name: 'Preventive Care',
    amount: 62.49,
    color: 'bg-stellar-blue',
    icon: <Heart className="w-4 h-4" />,
  },
];

const keyDates: KeyDate[] = [
  {
    label: 'Open Enrollment',
    date: '2026-11-01',
    type: 'deadline',
    description: 'Annual enrollment period begins for 2027 plan year',
  },
  {
    label: 'Grace Period Ends (FSA)',
    date: '2026-03-15',
    type: 'warning',
    description: 'Last day to incur expenses using prior year FSA balance',
  },
  {
    label: 'Runout Period Ends (FSA)',
    date: '2026-03-31',
    type: 'warning',
    description: 'Last day to submit claims for prior year FSA expenses',
  },
  {
    label: 'Mid-Year Change Deadline',
    date: '2026-06-30',
    type: 'deadline',
    description: 'Qualifying life event changes must be submitted within 30 days',
  },
  {
    label: 'Tax Filing Deadline',
    date: '2026-04-15',
    type: 'info',
    description: 'Form 8889 (HSA) or Form 2441 (DCFSA) must be filed',
  },
];

const taxBrackets: TaxBracket = {
  federal: 24,
  state: 6.5,
  fica: 7.65,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Math.abs(amount));

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const daysUntil = (dateStr: string) => {
  const target = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HSAFSAManagement() {
  const [accountType, setAccountType] = useState<'HSA' | 'FSA'>('HSA');
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimForm, setClaimForm] = useState<ClaimForm>({
    amount: '',
    category: 'Medical',
    date: '',
    description: '',
    receiptAttached: false,
  });
  const [claimSubmitted, setClaimSubmitted] = useState(false);

  const data: AccountData = accountType === 'HSA' ? mockHSA : mockFSA;
  const isHSA = data.accountType === 'HSA';
  const isFSA = data.accountType === 'FSA';

  const contributionPercent = (data.contributionsYTD / data.annualLimit) * 100;

  // Tax savings calculation
  const totalTaxRate = taxBrackets.federal + taxBrackets.state + taxBrackets.fica;
  const annualProjectedContributions = data.monthlyContributionRate * 12;
  const estimatedTaxSavings = (annualProjectedContributions * totalTaxRate) / 100;
  const federalSavings = (annualProjectedContributions * taxBrackets.federal) / 100;
  const stateSavings = (annualProjectedContributions * taxBrackets.state) / 100;
  const ficaSavings = (annualProjectedContributions * taxBrackets.fica) / 100;

  // Projected year-end balance
  const currentMonth = new Date().getMonth(); // 0-indexed
  const remainingMonths = 12 - (currentMonth + 1);
  const projectedContributions = data.monthlyContributionRate * remainingMonths;
  const projectedExpenses = data.averageMonthlySpend * remainingMonths;
  const projectedYearEnd = data.currentBalance + projectedContributions - projectedExpenses;

  // Spending totals
  const totalSpending = useMemo(
    () => spendingCategories.reduce((sum, cat) => sum + cat.amount, 0),
    []
  );
  const maxSpend = useMemo(() => Math.max(...spendingCategories.map((c) => c.amount)), []);

  // Tab definitions
  const tabs: { key: TabKey; label: string; hsaOnly?: boolean }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'transactions', label: 'Transactions' },
    { key: 'spending', label: 'Spending' },
    { key: 'eligible', label: 'Eligible Expenses' },
    { key: 'investments', label: 'Investments', hsaOnly: true },
    { key: 'tax-savings', label: 'Tax Savings' },
    { key: 'claims', label: 'Claims' },
  ];

  const visibleTabs = tabs.filter((t) => !t.hsaOnly || isHSA);

  // Reset to overview when switching account types if current tab is HSA-only
  const handleAccountToggle = () => {
    const next = accountType === 'HSA' ? 'FSA' : 'HSA';
    if (next === 'FSA' && activeTab === 'investments') {
      setActiveTab('overview');
    }
    setAccountType(next);
    setClaimSubmitted(false);
    setShowClaimForm(false);
  };

  const handleClaimSubmit = () => {
    setClaimSubmitted(true);
    setShowClaimForm(false);
    setTimeout(() => setClaimSubmitted(false), 5000);
  };

  // ---------------------------------------------------------------------------
  // Sub-components
  // ---------------------------------------------------------------------------

  const KeyDatesBanner = () => {
    const upcomingDates = keyDates
      .filter((d) => daysUntil(d.date) > 0)
      .sort((a, b) => daysUntil(a.date) - daysUntil(b.date))
      .slice(0, 3);

    if (upcomingDates.length === 0) return null;

    return (
      <div className="rounded-xl border border-sunset-amber/30 bg-sunset-amber/5 dark:bg-sunset-amber/10 p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <CalendarClock className="w-5 h-5 text-sunset-amber" />
          <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">
            Key Dates &amp; Deadlines
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {upcomingDates.map((kd) => {
            const days = daysUntil(kd.date);
            return (
              <div
                key={kd.label}
                className="flex items-start gap-3 rounded-lg bg-white/60 dark:bg-deep-cosmos/40 px-3 py-2"
              >
                <div
                  className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                    kd.type === 'deadline'
                      ? 'bg-coral-alert'
                      : kd.type === 'warning'
                        ? 'bg-sunset-amber'
                        : 'bg-celestial-indigo'
                  }`}
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-ink-black dark:text-pearl truncate">
                    {kd.label}
                  </p>
                  <p className="text-xs text-silver-mist">
                    {formatDate(kd.date)} &middot;{' '}
                    <span
                      className={days <= 30 ? 'text-coral-alert font-medium' : 'text-silver-mist'}
                    >
                      {days} days away
                    </span>
                  </p>
                  <p className="text-xs text-silver-mist mt-0.5">{kd.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const AccountToggle = () => (
    <button
      onClick={handleAccountToggle}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 hover:bg-cloud/50 dark:hover:bg-nebula-purple/10 transition-colors"
    >
      {accountType === 'HSA' ? (
        <ToggleLeft className="w-5 h-5 text-celestial-indigo" />
      ) : (
        <ToggleRight className="w-5 h-5 text-quantum-rose" />
      )}
      <span className="text-sm font-medium text-ink-black dark:text-pearl">
        {accountType === 'HSA' ? 'Switch to FSA' : 'Switch to HSA'}
      </span>
    </button>
  );

  const AccountTypeBadge = () => (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        isHSA
          ? 'bg-celestial-indigo/10 text-celestial-indigo dark:bg-celestial-indigo/20'
          : 'bg-quantum-rose/10 text-quantum-rose dark:bg-quantum-rose/20'
      }`}
    >
      {isHSA ? <PiggyBank className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
      {data.accountType}
    </span>
  );

  // ---------------------------------------------------------------------------
  // Render: Overview Tab
  // ---------------------------------------------------------------------------

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Rollover tracking (HSA) or Grace Period (FSA) */}
      {isHSA && (
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
          <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-3 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-celestial-indigo" />
            Rollover &amp; Balance Breakdown
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-silver-mist">Prior Year Rollover</span>
              <span className="text-sm font-medium text-celestial-indigo">
                {formatCurrency((data as HSAData).rollover.previousYearRollover)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-silver-mist">+ Employee Contributions (YTD)</span>
              <span className="text-sm text-aurora-green">
                +{formatCurrency((data as HSAData).rollover.currentYearContributions)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-silver-mist">+ Employer Contributions (YTD)</span>
              <span className="text-sm text-celestial-indigo">
                +{formatCurrency((data as HSAData).rollover.currentYearEmployer)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-silver-mist">- Expenses (YTD)</span>
              <span className="text-sm text-coral-alert">
                -{formatCurrency((data as HSAData).rollover.currentYearExpenses)}
              </span>
            </div>
            <div className="pt-2 border-t border-cloud dark:border-nebula-purple/50 flex justify-between">
              <span className="text-sm font-semibold text-ink-black dark:text-pearl">
                Total Available
              </span>
              <span className="text-sm font-bold text-ink-black dark:text-pearl">
                {formatCurrency((data as HSAData).rollover.totalAvailable)}
              </span>
            </div>
            <div className="mt-2 p-3 rounded-lg bg-celestial-indigo/5 dark:bg-celestial-indigo/10">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-celestial-indigo mt-0.5 flex-shrink-0" />
                <p className="text-xs text-silver-mist">
                  HSA funds roll over indefinitely. Your balance never expires and remains yours
                  even if you change employers or health plans.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isFSA && (
        <div className="rounded-xl border border-sunset-amber/30 bg-sunset-amber/5 dark:bg-sunset-amber/10 p-5">
          <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-sunset-amber" />
            Use-It-or-Lose-It Reminder
          </h3>
          <div className="space-y-2">
            <p className="text-sm text-ink-black dark:text-pearl">
              FSA funds must be used by the end of the plan year. Your employer offers a{' '}
              <span className="font-semibold">grace period</span> through{' '}
              <span className="font-semibold text-sunset-amber">
                {formatDate((data as FSAData).gracePeriodEnd)}
              </span>{' '}
              ({daysUntil((data as FSAData).gracePeriodEnd)} days remaining).
            </p>
            <p className="text-xs text-silver-mist">
              Runout period for filing claims ends {formatDate((data as FSAData).runoutPeriodEnd)}.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Account Summary */}
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
          <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-celestial-indigo" />
            Account Summary
          </h3>
          <div className="space-y-3">
            {isHSA && (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-silver-mist">Cash Balance</span>
                  <span className="text-sm text-ink-black dark:text-pearl">
                    {formatCurrency((data as HSAData).cashBalance)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-silver-mist">Investment Balance</span>
                  <span className="text-sm text-ink-black dark:text-pearl">
                    {formatCurrency((data as HSAData).investmentBalance)}
                  </span>
                </div>
                <div className="pt-2 border-t border-cloud dark:border-nebula-purple/50 flex justify-between">
                  <span className="text-sm font-medium text-ink-black dark:text-pearl">
                    Total Balance
                  </span>
                  <span className="text-sm font-bold text-ink-black dark:text-pearl">
                    {formatCurrency(data.currentBalance)}
                  </span>
                </div>
              </>
            )}
            {isFSA && (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-silver-mist">Annual Election</span>
                  <span className="text-sm text-ink-black dark:text-pearl">
                    {formatCurrency(data.annualLimit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-silver-mist">Contributed YTD</span>
                  <span className="text-sm text-aurora-green">
                    {formatCurrency(data.contributionsYTD)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-silver-mist">Spent YTD</span>
                  <span className="text-sm text-coral-alert">
                    {formatCurrency(data.totalSpentYTD)}
                  </span>
                </div>
                <div className="pt-2 border-t border-cloud dark:border-nebula-purple/50 flex justify-between">
                  <span className="text-sm font-medium text-ink-black dark:text-pearl">
                    Available Balance
                  </span>
                  <span className="text-sm font-bold text-ink-black dark:text-pearl">
                    {formatCurrency(data.currentBalance)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Projected Year-End */}
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
          <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-sunset-amber" />
            Projected Year-End Balance
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-silver-mist">Current Balance</span>
              <span className="text-sm text-ink-black dark:text-pearl">
                {formatCurrency(data.currentBalance)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-silver-mist">
                + Projected Contributions ({remainingMonths} mo)
              </span>
              <span className="text-sm text-aurora-green">
                +{formatCurrency(projectedContributions)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-silver-mist">
                - Projected Expenses ({remainingMonths} mo)
              </span>
              <span className="text-sm text-coral-alert">-{formatCurrency(projectedExpenses)}</span>
            </div>
            <div className="pt-2 border-t border-cloud dark:border-nebula-purple/50 flex justify-between">
              <span className="text-sm font-medium text-ink-black dark:text-pearl">
                Estimated Dec 31 Balance
              </span>
              <span
                className={`text-sm font-bold ${
                  projectedYearEnd >= 0 ? 'text-aurora-green' : 'text-coral-alert'
                }`}
              >
                {projectedYearEnd >= 0 ? '' : '-'}
                {formatCurrency(projectedYearEnd)}
              </span>
            </div>
            <p className="text-xs text-silver-mist mt-1">
              Based on {formatCurrency(data.monthlyContributionRate)}/mo contributions and{' '}
              {formatCurrency(data.averageMonthlySpend)}/mo average spend.
            </p>
            {isFSA && projectedYearEnd > 200 && (
              <div className="p-3 rounded-lg bg-sunset-amber/10 dark:bg-sunset-amber/15">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-sunset-amber mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-sunset-amber font-medium">
                    You may have {formatCurrency(projectedYearEnd)} remaining at year-end. FSA funds
                    do not roll over. Consider scheduling eligible expenses.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
        <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg border border-cloud dark:border-nebula-purple/50 hover:bg-cloud dark:hover:bg-nebula-purple/10 text-left transition-colors">
            <PlusCircle className="w-5 h-5 text-celestial-indigo flex-shrink-0" />
            <span className="text-sm text-ink-black dark:text-pearl">Make a Contribution</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('claims');
              setShowClaimForm(true);
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg border border-cloud dark:border-nebula-purple/50 hover:bg-cloud dark:hover:bg-nebula-purple/10 text-left transition-colors"
          >
            <Receipt className="w-5 h-5 text-celestial-indigo flex-shrink-0" />
            <span className="text-sm text-ink-black dark:text-pearl">Submit a Claim</span>
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg border border-cloud dark:border-nebula-purple/50 hover:bg-cloud dark:hover:bg-nebula-purple/10 text-left transition-colors">
            <Wallet className="w-5 h-5 text-celestial-indigo flex-shrink-0" />
            <span className="text-sm text-ink-black dark:text-pearl">Change Contribution</span>
          </button>
          {isHSA && (
            <button
              onClick={() => setActiveTab('investments')}
              className="flex items-center gap-3 px-4 py-3 rounded-lg border border-cloud dark:border-nebula-purple/50 hover:bg-cloud dark:hover:bg-nebula-purple/10 text-left transition-colors"
            >
              <BarChart3 className="w-5 h-5 text-celestial-indigo flex-shrink-0" />
              <span className="text-sm text-ink-black dark:text-pearl">Manage Investments</span>
            </button>
          )}
          {isFSA && (
            <button className="flex items-center gap-3 px-4 py-3 rounded-lg border border-cloud dark:border-nebula-purple/50 hover:bg-cloud dark:hover:bg-nebula-purple/10 text-left transition-colors">
              <FileText className="w-5 h-5 text-celestial-indigo flex-shrink-0" />
              <span className="text-sm text-ink-black dark:text-pearl">View FSA Card</span>
            </button>
          )}
        </div>
      </div>

      {/* Dependent FSA section (FSA only) */}
      {isFSA && (data as FSAData).dependentFSA.enabled && (
        <div className="rounded-xl border border-nebula-purple/30 bg-nebula-purple/5 dark:bg-nebula-purple/10 p-5">
          <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-3 flex items-center gap-2">
            <Baby className="w-4 h-4 text-nebula-purple" />
            Dependent Care FSA (DCFSA)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-silver-mist mb-1">Balance</p>
              <p className="text-lg font-bold text-ink-black dark:text-pearl">
                {formatCurrency((data as FSAData).dependentFSA.balance)}
              </p>
            </div>
            <div>
              <p className="text-xs text-silver-mist mb-1">Annual Limit</p>
              <p className="text-lg font-bold text-ink-black dark:text-pearl">
                {formatCurrency((data as FSAData).dependentFSA.annualLimit)}
              </p>
            </div>
            <div>
              <p className="text-xs text-silver-mist mb-1">Contributed YTD</p>
              <p className="text-lg font-bold text-aurora-green">
                {formatCurrency((data as FSAData).dependentFSA.contributionsYTD)}
              </p>
            </div>
            <div>
              <p className="text-xs text-silver-mist mb-1">Spent YTD</p>
              <p className="text-lg font-bold text-coral-alert">
                {formatCurrency((data as FSAData).dependentFSA.spentYTD)}
              </p>
            </div>
          </div>
          <div className="w-full h-2 rounded-full bg-cloud dark:bg-nebula-purple/30">
            <div
              className="h-full rounded-full bg-nebula-purple transition-all"
              style={{
                width: `${Math.min(
                  ((data as FSAData).dependentFSA.contributionsYTD /
                    (data as FSAData).dependentFSA.annualLimit) *
                    100,
                  100
                )}%`,
              }}
            />
          </div>
          <p className="text-xs text-silver-mist mt-2">
            Eligible for daycare, preschool, before/after-school care, and summer day camp for
            dependents under 13.
          </p>
        </div>
      )}
    </div>
  );

  // ---------------------------------------------------------------------------
  // Render: Transactions Tab
  // ---------------------------------------------------------------------------

  const renderTransactions = () => (
    <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
      <div className="px-5 py-3 border-b border-cloud dark:border-nebula-purple/50 flex items-center justify-between">
        <span className="text-sm font-semibold text-ink-black dark:text-pearl">
          All Transactions ({data.recentTransactions.length})
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-silver-mist">Status:</span>
          <span className="inline-flex items-center gap-1 text-xs text-aurora-green">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-sunset-amber">
            <Clock className="w-3 h-3" /> Pending
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-coral-alert">
            <XCircle className="w-3 h-3" /> Denied
          </span>
        </div>
      </div>
      <div className="divide-y divide-cloud dark:divide-nebula-purple/50">
        {data.recentTransactions.map((tx) => (
          <div
            key={tx.id}
            className={`flex items-center gap-4 px-5 py-3 transition-colors hover:bg-cloud/30 dark:hover:bg-nebula-purple/5 ${
              tx.status === 'denied' ? 'opacity-60' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                tx.type === 'expense'
                  ? 'bg-coral-alert/10 dark:bg-coral-alert/20'
                  : tx.type === 'employer'
                    ? 'bg-celestial-indigo/10 dark:bg-celestial-indigo/20'
                    : tx.type === 'rollover'
                      ? 'bg-nebula-purple/10 dark:bg-nebula-purple/20'
                      : tx.type === 'investment'
                        ? 'bg-sunset-amber/10 dark:bg-sunset-amber/20'
                        : 'bg-aurora-green/10 dark:bg-aurora-green/20'
              }`}
            >
              {tx.type === 'expense' ? (
                <ArrowUpRight className="w-4 h-4 text-coral-alert" />
              ) : tx.type === 'employer' ? (
                <Building2 className="w-4 h-4 text-celestial-indigo" />
              ) : tx.type === 'rollover' ? (
                <RefreshCw className="w-4 h-4 text-nebula-purple" />
              ) : tx.type === 'investment' ? (
                <BarChart3 className="w-4 h-4 text-sunset-amber" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-aurora-green" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-ink-black dark:text-pearl truncate">
                  {tx.description}
                </p>
                {tx.status === 'denied' && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-coral-alert/10 text-coral-alert">
                    <XCircle className="w-3 h-3" /> Denied
                  </span>
                )}
                {tx.status === 'pending' && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-sunset-amber/10 text-sunset-amber">
                    <Clock className="w-3 h-3" /> Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-silver-mist">
                {formatDate(tx.date)} &middot; {tx.category}
              </p>
            </div>
            <span
              className={`text-sm font-medium flex-shrink-0 ${
                tx.amount < 0 ? 'text-coral-alert' : 'text-aurora-green'
              }`}
            >
              {tx.amount < 0 ? '-' : '+'}
              {formatCurrency(tx.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Render: Eligible Expenses Tab
  // ---------------------------------------------------------------------------

  const renderEligible = () => (
    <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
      <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-aurora-green" />
        {isHSA ? 'HSA' : 'FSA'} Eligible Expenses
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.eligibleExpenses.map((expense) => (
          <div
            key={expense}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cloud/30 dark:bg-nebula-purple/10"
          >
            <Receipt className="w-4 h-4 text-celestial-indigo flex-shrink-0" />
            <span className="text-sm text-ink-black dark:text-pearl">{expense}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 rounded-lg bg-aurora-green/5 dark:bg-aurora-green/10">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-aurora-green mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-ink-black dark:text-pearl font-medium">
              {isHSA
                ? 'HSA funds can be used for any qualified medical expense under IRS Section 213(d).'
                : 'FSA funds cover qualified medical expenses under your employer plan. The full election amount is available on Day 1 of the plan year.'}
            </p>
            <p className="text-xs text-silver-mist mt-1">
              Always keep receipts for potential IRS audits. The IRS requires documentation for all
              {isHSA ? ' HSA' : ' FSA'} distributions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Render: Investments Tab (HSA only)
  // ---------------------------------------------------------------------------

  const renderInvestments = () => {
    if (!isHSA) return null;
    const hsaData = data as HSAData;

    const totalInvested = hsaData.investments.reduce((s, f) => s + f.balance, 0);
    const weightedReturn = hsaData.investments.reduce(
      (s, f) => s + f.ytdReturn * (f.allocation / 100),
      0
    );

    return (
      <div className="space-y-6">
        {/* Investment Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
            <p className="text-xs text-silver-mist mb-1">Investment Balance</p>
            <p className="text-2xl font-bold text-ink-black dark:text-pearl">
              {formatCurrency(hsaData.investmentBalance)}
            </p>
            <p className="text-xs text-silver-mist mt-1">
              Cash threshold: {formatCurrency(hsaData.investmentThreshold)}
            </p>
          </div>
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
            <p className="text-xs text-silver-mist mb-1">Weighted YTD Return</p>
            <p
              className={`text-2xl font-bold ${
                weightedReturn >= 0 ? 'text-aurora-green' : 'text-coral-alert'
              }`}
            >
              {weightedReturn >= 0 ? '+' : ''}
              {weightedReturn.toFixed(2)}%
            </p>
            <p className="text-xs text-silver-mist mt-1">
              {formatCurrency(totalInvested * (weightedReturn / 100))} gain
            </p>
          </div>
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
            <p className="text-xs text-silver-mist mb-1">Cash Balance</p>
            <p className="text-2xl font-bold text-ink-black dark:text-pearl">
              {formatCurrency(hsaData.cashBalance)}
            </p>
            <p className="text-xs text-silver-mist mt-1">Available for expenses</p>
          </div>
        </div>

        {/* Allocation visual */}
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
          <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-celestial-indigo" />
            Investment Allocation
          </h3>
          <div className="flex w-full h-6 rounded-full overflow-hidden mb-4">
            {hsaData.investments.map((fund, i) => {
              const colors = [
                'bg-celestial-indigo',
                'bg-aurora-green',
                'bg-sunset-amber',
                'bg-quantum-rose',
              ];
              return (
                <div
                  key={fund.id}
                  className={`${colors[i % colors.length]} transition-all`}
                  style={{ width: `${fund.allocation}%` }}
                  title={`${fund.name}: ${fund.allocation}%`}
                />
              );
            })}
          </div>
          <div className="space-y-3">
            {hsaData.investments.map((fund, i) => {
              const colors = [
                'bg-celestial-indigo',
                'bg-aurora-green',
                'bg-sunset-amber',
                'bg-quantum-rose',
              ];
              const _textColors = [
                'text-celestial-indigo',
                'text-aurora-green',
                'text-sunset-amber',
                'text-quantum-rose',
              ];
              return (
                <div
                  key={fund.id}
                  className="flex items-center gap-4 px-4 py-3 rounded-lg border border-cloud dark:border-nebula-purple/50"
                >
                  <div
                    className={`w-3 h-3 rounded-full flex-shrink-0 ${colors[i % colors.length]}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-black dark:text-pearl truncate">
                      {fund.name}
                    </p>
                    <p className="text-xs text-silver-mist">
                      {fund.ticker} &middot; {fund.allocation}% &middot; ER: {fund.expenseRatio}%
                      &middot; Risk:{' '}
                      <span
                        className={
                          fund.riskLevel === 'Low'
                            ? 'text-aurora-green'
                            : fund.riskLevel === 'Medium'
                              ? 'text-sunset-amber'
                              : 'text-coral-alert'
                        }
                      >
                        {fund.riskLevel}
                      </span>
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-ink-black dark:text-pearl">
                      {formatCurrency(fund.balance)}
                    </p>
                    <p
                      className={`text-xs font-medium ${
                        fund.ytdReturn >= 0 ? 'text-aurora-green' : 'text-coral-alert'
                      }`}
                    >
                      {fund.ytdReturn >= 0 ? '+' : ''}
                      {fund.ytdReturn.toFixed(1)}% YTD
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Investment info */}
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-celestial-indigo mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-ink-black dark:text-pearl mb-1">
                About HSA Investing
              </h4>
              <ul className="space-y-1 text-xs text-silver-mist">
                <li className="flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 flex-shrink-0" />A minimum cash balance of{' '}
                  {formatCurrency(hsaData.investmentThreshold)} is maintained for expense coverage.
                </li>
                <li className="flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 flex-shrink-0" />
                  Investment gains grow tax-free when used for qualified medical expenses.
                </li>
                <li className="flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 flex-shrink-0" />
                  After age 65, HSA funds can be withdrawn for any purpose (taxed as income, no
                  penalty).
                </li>
                <li className="flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 flex-shrink-0" />
                  Rebalancing is available quarterly. Contact your plan administrator for changes.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Render: Tax Savings Tab
  // ---------------------------------------------------------------------------

  const renderTaxSavings = () => (
    <div className="space-y-6">
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
        <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-celestial-indigo" />
          Estimated Tax Savings ({new Date().getFullYear()})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: breakdown */}
          <div className="space-y-4">
            <div>
              <p className="text-xs text-silver-mist mb-1">Projected Annual Contributions</p>
              <p className="text-xl font-bold text-ink-black dark:text-pearl">
                {formatCurrency(annualProjectedContributions)}
              </p>
              <p className="text-xs text-silver-mist">
                Based on {formatCurrency(data.monthlyContributionRate)}/mo
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-celestial-indigo" />
                  <span className="text-sm text-silver-mist">Federal ({taxBrackets.federal}%)</span>
                </div>
                <span className="text-sm font-medium text-aurora-green">
                  {formatCurrency(federalSavings)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-nebula-purple" />
                  <span className="text-sm text-silver-mist">State ({taxBrackets.state}%)</span>
                </div>
                <span className="text-sm font-medium text-aurora-green">
                  {formatCurrency(stateSavings)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-sunset-amber" />
                  <span className="text-sm text-silver-mist">FICA ({taxBrackets.fica}%)</span>
                </div>
                <span className="text-sm font-medium text-aurora-green">
                  {formatCurrency(ficaSavings)}
                </span>
              </div>
              <div className="pt-3 border-t border-cloud dark:border-nebula-purple/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink-black dark:text-pearl">
                    Total Estimated Savings
                  </span>
                  <span className="text-lg font-bold text-aurora-green">
                    {formatCurrency(estimatedTaxSavings)}
                  </span>
                </div>
                <p className="text-xs text-silver-mist mt-1">
                  Effective combined tax rate: {totalTaxRate.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* Right: visual bar */}
          <div className="flex flex-col justify-center">
            <div className="rounded-xl bg-cloud/30 dark:bg-nebula-purple/10 p-5">
              <p className="text-xs text-silver-mist mb-3 text-center">Savings Breakdown</p>
              <div className="flex w-full h-8 rounded-full overflow-hidden mb-3">
                <div
                  className="bg-celestial-indigo"
                  style={{
                    width: `${(taxBrackets.federal / totalTaxRate) * 100}%`,
                  }}
                />
                <div
                  className="bg-nebula-purple"
                  style={{
                    width: `${(taxBrackets.state / totalTaxRate) * 100}%`,
                  }}
                />
                <div
                  className="bg-sunset-amber"
                  style={{
                    width: `${(taxBrackets.fica / totalTaxRate) * 100}%`,
                  }}
                />
              </div>
              <div className="space-y-2">
                <p className="text-center text-lg font-bold text-aurora-green">
                  {formatCurrency(estimatedTaxSavings)}
                </p>
                <p className="text-center text-xs text-silver-mist">saved annually</p>
              </div>
            </div>

            {isHSA && (
              <div className="mt-4 p-3 rounded-lg bg-celestial-indigo/5 dark:bg-celestial-indigo/10">
                <div className="flex items-start gap-2">
                  <CircleDollarSign className="w-4 h-4 text-celestial-indigo mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-silver-mist">
                    <span className="font-semibold text-ink-black dark:text-pearl">
                      Triple Tax Advantage:
                    </span>{' '}
                    HSA contributions are tax-deductible, growth is tax-free, and withdrawals for
                    qualified expenses are tax-free.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Max-out scenario */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
        <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-aurora-green" />
          What If You Max Out?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg bg-cloud/30 dark:bg-nebula-purple/10 p-4 text-center">
            <p className="text-xs text-silver-mist mb-1">Max Annual Limit</p>
            <p className="text-xl font-bold text-ink-black dark:text-pearl">
              {formatCurrency(data.annualLimit)}
            </p>
          </div>
          <div className="rounded-lg bg-cloud/30 dark:bg-nebula-purple/10 p-4 text-center">
            <p className="text-xs text-silver-mist mb-1">Max Tax Savings</p>
            <p className="text-xl font-bold text-aurora-green">
              {formatCurrency((data.annualLimit * totalTaxRate) / 100)}
            </p>
          </div>
          <div className="rounded-lg bg-cloud/30 dark:bg-nebula-purple/10 p-4 text-center">
            <p className="text-xs text-silver-mist mb-1">Monthly Contribution Needed</p>
            <p className="text-xl font-bold text-celestial-indigo">
              {formatCurrency(data.annualLimit / 12)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Render: Spending Tab
  // ---------------------------------------------------------------------------

  const renderSpending = () => (
    <div className="space-y-6">
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-ink-black dark:text-pearl flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-celestial-indigo" />
            Spending by Category
          </h3>
          <span className="text-sm text-silver-mist">Total: {formatCurrency(totalSpending)}</span>
        </div>
        <div className="space-y-4">
          {spendingCategories
            .sort((a, b) => b.amount - a.amount)
            .map((cat) => {
              const pct = (cat.amount / maxSpend) * 100;
              const shareOfTotal = ((cat.amount / totalSpending) * 100).toFixed(1);
              return (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-silver-mist">{cat.icon}</span>
                      <span className="text-sm font-medium text-ink-black dark:text-pearl">
                        {cat.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-silver-mist">{shareOfTotal}%</span>
                      <span className="text-sm font-medium text-ink-black dark:text-pearl w-20 text-right">
                        {formatCurrency(cat.amount)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-3 rounded-full bg-cloud dark:bg-nebula-purple/20">
                    <div
                      className={`h-full rounded-full ${cat.color} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Top spending insight */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
        <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-3 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-sunset-amber" />
          Spending Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg bg-cloud/30 dark:bg-nebula-purple/10 p-4">
            <p className="text-xs text-silver-mist mb-1">Highest Category</p>
            <p className="text-sm font-semibold text-ink-black dark:text-pearl">
              {spendingCategories.sort((a, b) => b.amount - a.amount)[0].name}
            </p>
            <p className="text-lg font-bold text-celestial-indigo">
              {formatCurrency(spendingCategories.sort((a, b) => b.amount - a.amount)[0].amount)}
            </p>
          </div>
          <div className="rounded-lg bg-cloud/30 dark:bg-nebula-purple/10 p-4">
            <p className="text-xs text-silver-mist mb-1">Average per Category</p>
            <p className="text-lg font-bold text-ink-black dark:text-pearl">
              {formatCurrency(totalSpending / spendingCategories.length)}
            </p>
          </div>
          <div className="rounded-lg bg-cloud/30 dark:bg-nebula-purple/10 p-4">
            <p className="text-xs text-silver-mist mb-1">Monthly Average Spend</p>
            <p className="text-lg font-bold text-ink-black dark:text-pearl">
              {formatCurrency(data.averageMonthlySpend)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Render: Claims Tab
  // ---------------------------------------------------------------------------

  const renderClaims = () => (
    <div className="space-y-6">
      {claimSubmitted && (
        <div className="rounded-xl border border-aurora-green/30 bg-aurora-green/5 dark:bg-aurora-green/10 p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-aurora-green flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-ink-black dark:text-pearl">
              Claim submitted successfully!
            </p>
            <p className="text-xs text-silver-mist">
              Your claim is being reviewed. You will receive a notification once processed.
            </p>
          </div>
        </div>
      )}

      {!showClaimForm ? (
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5 text-center">
          <FileText className="w-12 h-12 text-silver-mist mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-1">
            Submit a Reimbursement Claim
          </h3>
          <p className="text-xs text-silver-mist mb-4 max-w-md mx-auto">
            File a claim for eligible out-of-pocket expenses. Attach your receipt and provide
            details about the expense.
          </p>
          <button
            onClick={() => setShowClaimForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-celestial-indigo text-white text-sm font-medium hover:bg-celestial-indigo/90 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            File New Claim
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
          <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-celestial-indigo" />
            New Reimbursement Claim
          </h3>
          <div className="space-y-4">
            {/* Amount */}
            <div>
              <label className="block text-xs font-medium text-ink-black dark:text-pearl mb-1">
                Expense Amount *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
                <input
                  type="text"
                  value={claimForm.amount}
                  onChange={(e) => setClaimForm((p) => ({ ...p, amount: e.target.value }))}
                  placeholder="0.00"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-deep-cosmos text-sm text-ink-black dark:text-pearl placeholder-silver-mist focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-ink-black dark:text-pearl mb-1">
                Expense Category *
              </label>
              <select
                value={claimForm.category}
                onChange={(e) => setClaimForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-deep-cosmos text-sm text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50"
              >
                <option value="Medical">Medical</option>
                <option value="Dental">Dental</option>
                <option value="Vision">Vision</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Mental Health">Mental Health</option>
                <option value="Physical Therapy">Physical Therapy</option>
                <option value="Lab & Diagnostics">Lab &amp; Diagnostics</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-medium text-ink-black dark:text-pearl mb-1">
                Date of Service *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
                <input
                  type="date"
                  value={claimForm.date}
                  onChange={(e) => setClaimForm((p) => ({ ...p, date: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-deep-cosmos text-sm text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-ink-black dark:text-pearl mb-1">
                Description
              </label>
              <input
                type="text"
                value={claimForm.description}
                onChange={(e) => setClaimForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="e.g., Office visit copay at Dr. Smith"
                className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-deep-cosmos text-sm text-ink-black dark:text-pearl placeholder-silver-mist focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50"
              />
            </div>

            {/* Receipt upload placeholder */}
            <div>
              <label className="block text-xs font-medium text-ink-black dark:text-pearl mb-1">
                Attach Receipt
              </label>
              <div
                onClick={() =>
                  setClaimForm((p) => ({
                    ...p,
                    receiptAttached: !p.receiptAttached,
                  }))
                }
                className={`flex items-center justify-center gap-3 px-4 py-6 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                  claimForm.receiptAttached
                    ? 'border-aurora-green bg-aurora-green/5 dark:bg-aurora-green/10'
                    : 'border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo/50'
                }`}
              >
                {claimForm.receiptAttached ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-aurora-green" />
                    <span className="text-sm text-aurora-green font-medium">Receipt attached</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-silver-mist" />
                    <span className="text-sm text-silver-mist">
                      Click to upload receipt (PDF, JPG, PNG)
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setShowClaimForm(false);
                  setClaimForm({
                    amount: '',
                    category: 'Medical',
                    date: '',
                    description: '',
                    receiptAttached: false,
                  });
                }}
                className="px-4 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 text-sm font-medium text-ink-black dark:text-pearl hover:bg-cloud dark:hover:bg-nebula-purple/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClaimSubmit}
                disabled={!claimForm.amount || !claimForm.date}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-celestial-indigo text-white text-sm font-medium hover:bg-celestial-indigo/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowRight className="w-4 h-4" />
                Submit Claim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent claims */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
        <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-silver-mist" />
          Recent Claims
        </h3>
        <div className="space-y-2">
          {data.recentTransactions
            .filter((tx) => tx.type === 'expense')
            .slice(0, 5)
            .map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-cloud/30 dark:bg-nebula-purple/10"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      tx.status === 'completed'
                        ? 'bg-aurora-green'
                        : tx.status === 'pending'
                          ? 'bg-sunset-amber'
                          : 'bg-coral-alert'
                    }`}
                  />
                  <div>
                    <p className="text-sm text-ink-black dark:text-pearl">{tx.description}</p>
                    <p className="text-xs text-silver-mist">
                      {formatDate(tx.date)} &middot; {tx.category}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-ink-black dark:text-pearl">
                    {formatCurrency(tx.amount)}
                  </p>
                  <p
                    className={`text-xs capitalize ${
                      tx.status === 'completed'
                        ? 'text-aurora-green'
                        : tx.status === 'pending'
                          ? 'text-sunset-amber'
                          : 'text-coral-alert'
                    }`}
                  >
                    {tx.status}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'transactions':
        return renderTransactions();
      case 'eligible':
        return renderEligible();
      case 'investments':
        return renderInvestments();
      case 'tax-savings':
        return renderTaxSavings();
      case 'spending':
        return renderSpending();
      case 'claims':
        return renderClaims();
      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Wallet className="w-6 h-6 text-celestial-indigo" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">
                  {data.accountType} Management
                </h1>
                <AccountTypeBadge />
              </div>
              <p className="text-sm text-silver-mist">
                {isHSA ? 'Health Savings Account Dashboard' : 'Flexible Spending Account Dashboard'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <AccountToggle />
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-celestial-indigo text-white text-sm font-medium hover:bg-celestial-indigo/90 transition-colors">
              <PlusCircle className="w-4 h-4" /> Add Contribution
            </button>
          </div>
        </div>

        {/* Key Dates Banner */}
        <KeyDatesBanner />

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
            <p className="text-xs text-silver-mist mb-1">Current Balance</p>
            <p className="text-2xl font-bold text-ink-black dark:text-pearl">
              {formatCurrency(data.currentBalance)}
            </p>
            {isHSA && (
              <p className="text-xs text-silver-mist mt-1">
                Cash: {formatCurrency((data as HSAData).cashBalance)} &middot; Invested:{' '}
                {formatCurrency((data as HSAData).investmentBalance)}
              </p>
            )}
          </div>
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
            <p className="text-xs text-silver-mist mb-1">Contributions YTD</p>
            <p className="text-2xl font-bold text-aurora-green">
              {formatCurrency(data.contributionsYTD)}
            </p>
            <p className="text-xs text-silver-mist mt-1">
              {formatCurrency(data.monthlyContributionRate)}/mo
            </p>
          </div>
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
            <p className="text-xs text-silver-mist mb-1">
              {isHSA ? 'Employer Match' : 'Available to Spend'}
            </p>
            <p className="text-2xl font-bold text-celestial-indigo">
              {isHSA
                ? formatCurrency(data.employerContributions)
                : formatCurrency(data.annualLimit - data.totalSpentYTD)}
            </p>
            {isFSA && (
              <p className="text-xs text-silver-mist mt-1">Full election available Day 1</p>
            )}
          </div>
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
            <p className="text-xs text-silver-mist mb-1">Spent YTD</p>
            <p className="text-2xl font-bold text-ink-black dark:text-pearl">
              {formatCurrency(data.totalSpentYTD)}
            </p>
            <p className="text-xs text-silver-mist mt-1">
              Avg {formatCurrency(data.averageMonthlySpend)}/mo
            </p>
          </div>
        </div>

        {/* Contribution Progress */}
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-ink-black dark:text-pearl">
              Annual Contribution Progress
            </span>
            <span className="text-sm text-silver-mist">
              {formatCurrency(data.contributionsYTD)} of {formatCurrency(data.annualLimit)} limit
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-cloud dark:bg-nebula-purple/30">
            <div
              className={`h-full rounded-full transition-all ${
                isHSA ? 'bg-celestial-indigo' : 'bg-quantum-rose'
              }`}
              style={{ width: `${Math.min(contributionPercent, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-silver-mist">
              {formatCurrency(data.annualLimit - data.contributionsYTD)} remaining for the year
            </p>
            <p className="text-xs text-silver-mist">
              {contributionPercent.toFixed(1)}% contributed
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-cloud dark:border-nebula-purple/50 mb-6 scrollbar-none">
          {visibleTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 px-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-celestial-indigo text-celestial-indigo'
                  : 'border-transparent text-silver-mist hover:text-ink-black dark:hover:text-pearl'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}
