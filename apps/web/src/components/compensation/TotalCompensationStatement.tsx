'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Gift,
  Heart,
  PieChart,
  Download,
  Calendar,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Shield,
  BarChart3,
  Printer,
  Building2,
  Clock,
  Award,
  Banknote,
  CreditCard,
  FileText,
  Percent,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────

type FiscalYear = 'FY2026' | 'FY2025' | 'FY2024';

interface LineItem {
  label: string;
  employeeAmount: number;
  employerAmount: number;
  note?: string;
}

interface CompensationCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  colorClass: string;
  bgClass: string;
  lineItems: LineItem[];
  total: number;
  previousYearTotal: number;
}

interface EmployeeInfo {
  name: string;
  id: string;
  role: string;
  department: string;
  grade: string;
  dateOfJoining: string;
  manager: string;
  location: string;
}

interface StatementData {
  employee: EmployeeInfo;
  fiscalYear: FiscalYear;
  generatedDate: string;
  categories: CompensationCategory[];
  totalCompensation: number;
  previousYearTotal: number;
  employerTotal: number;
  currency: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_STATEMENTS: Record<FiscalYear, StatementData> = {
  FY2026: {
    employee: {
      name: 'Alex Johnson',
      id: 'EMP-4521',
      role: 'Senior Software Engineer',
      department: 'Engineering',
      grade: 'L5 — Senior',
      dateOfJoining: 'March 15, 2021',
      manager: 'Sarah Chen',
      location: 'San Francisco, CA',
    },
    fiscalYear: 'FY2026',
    generatedDate: 'February 1, 2026',
    currency: 'USD',
    totalCompensation: 298500,
    previousYearTotal: 268200,
    employerTotal: 51400,
    categories: [
      {
        id: 'direct',
        label: 'Cash Compensation',
        icon: DollarSign,
        color: '#6366F1',
        colorClass: 'text-celestial-indigo',
        bgClass: 'bg-celestial-indigo/10',
        total: 210000,
        previousYearTotal: 192000,
        lineItems: [
          { label: 'Base Salary', employeeAmount: 175000, employerAmount: 0 },
          {
            label: 'Annual Performance Bonus',
            employeeAmount: 26250,
            employerAmount: 0,
            note: 'Target 15% · Actual 120% attainment',
          },
          { label: 'Allowances (Housing, Transport)', employeeAmount: 6000, employerAmount: 0 },
          { label: 'Overtime Pay', employeeAmount: 0, employerAmount: 0 },
          { label: 'Shift / On-Call Differential', employeeAmount: 2750, employerAmount: 0 },
        ],
      },
      {
        id: 'equity',
        label: 'Equity & Stock',
        icon: BarChart3,
        color: '#8B5CF6',
        colorClass: 'text-nebula-purple',
        bgClass: 'bg-nebula-purple/10',
        total: 42000,
        previousYearTotal: 35000,
        lineItems: [
          {
            label: 'Restricted Stock Units (RSU)',
            employeeAmount: 35000,
            employerAmount: 0,
            note: '350 shares · 4-year graded vesting',
          },
          {
            label: 'Employee Stock Purchase Plan',
            employeeAmount: 7000,
            employerAmount: 0,
            note: '15% discount · 6-month lookback',
          },
        ],
      },
      {
        id: 'benefits',
        label: 'Health & Insurance',
        icon: Heart,
        color: '#F43F5E',
        colorClass: 'text-quantum-rose',
        bgClass: 'bg-quantum-rose/10',
        total: 24800,
        previousYearTotal: 22400,
        lineItems: [
          {
            label: 'Medical Insurance (PPO)',
            employeeAmount: 3600,
            employerAmount: 14400,
            note: 'Family plan · Employer covers 80%',
          },
          { label: 'Dental Insurance', employeeAmount: 480, employerAmount: 1440 },
          { label: 'Vision Insurance', employeeAmount: 180, employerAmount: 360 },
          {
            label: 'Life Insurance (2× Salary)',
            employeeAmount: 0,
            employerAmount: 1740,
            note: 'Employer-paid',
          },
          {
            label: 'Disability Insurance (STD + LTD)',
            employeeAmount: 0,
            employerAmount: 2600,
            note: 'Employer-paid',
          },
        ],
      },
      {
        id: 'retirement',
        label: 'Retirement & Savings',
        icon: Shield,
        color: '#10B981',
        colorClass: 'text-neural-mint',
        bgClass: 'bg-neural-mint/10',
        total: 17500,
        previousYearTotal: 15000,
        lineItems: [
          {
            label: '401(k) Employee Contribution',
            employeeAmount: 7000,
            employerAmount: 0,
            note: '4% of base',
          },
          {
            label: '401(k) Employer Match',
            employeeAmount: 0,
            employerAmount: 7000,
            note: '100% match up to 4%',
          },
          {
            label: 'Pension / Profit Sharing',
            employeeAmount: 0,
            employerAmount: 3500,
            note: 'Discretionary · Based on company profit',
          },
        ],
      },
      {
        id: 'perks',
        label: 'Perks & Other',
        icon: Gift,
        color: '#F59E0B',
        colorClass: 'text-sunset-amber',
        bgClass: 'bg-sunset-amber/10',
        total: 4200,
        previousYearTotal: 3800,
        lineItems: [
          {
            label: 'Education Reimbursement',
            employeeAmount: 0,
            employerAmount: 2000,
            note: 'Annual tuition reimbursement',
          },
          { label: 'Wellness Stipend', employeeAmount: 0, employerAmount: 600 },
          { label: 'Home Office Stipend', employeeAmount: 0, employerAmount: 1000 },
          { label: 'Commuter Benefits', employeeAmount: 0, employerAmount: 600 },
        ],
      },
    ],
  },
  FY2025: {
    employee: {
      name: 'Alex Johnson',
      id: 'EMP-4521',
      role: 'Software Engineer',
      department: 'Engineering',
      grade: 'L4 — Mid',
      dateOfJoining: 'March 15, 2021',
      manager: 'Sarah Chen',
      location: 'San Francisco, CA',
    },
    fiscalYear: 'FY2025',
    generatedDate: 'February 1, 2025',
    currency: 'USD',
    totalCompensation: 268200,
    previousYearTotal: 235000,
    employerTotal: 44800,
    categories: [
      {
        id: 'direct',
        label: 'Cash Compensation',
        icon: DollarSign,
        color: '#6366F1',
        colorClass: 'text-celestial-indigo',
        bgClass: 'bg-celestial-indigo/10',
        total: 192000,
        previousYearTotal: 172000,
        lineItems: [
          { label: 'Base Salary', employeeAmount: 158000, employerAmount: 0 },
          {
            label: 'Annual Performance Bonus',
            employeeAmount: 23700,
            employerAmount: 0,
            note: 'Target 15% · Actual 110% attainment',
          },
          { label: 'Allowances (Housing, Transport)', employeeAmount: 5800, employerAmount: 0 },
          { label: 'Overtime Pay', employeeAmount: 2000, employerAmount: 0 },
          { label: 'Shift / On-Call Differential', employeeAmount: 2500, employerAmount: 0 },
        ],
      },
      {
        id: 'equity',
        label: 'Equity & Stock',
        icon: BarChart3,
        color: '#8B5CF6',
        colorClass: 'text-nebula-purple',
        bgClass: 'bg-nebula-purple/10',
        total: 35000,
        previousYearTotal: 28000,
        lineItems: [
          {
            label: 'Restricted Stock Units (RSU)',
            employeeAmount: 28000,
            employerAmount: 0,
            note: '280 shares · 4-year graded vesting',
          },
          { label: 'Employee Stock Purchase Plan', employeeAmount: 7000, employerAmount: 0 },
        ],
      },
      {
        id: 'benefits',
        label: 'Health & Insurance',
        icon: Heart,
        color: '#F43F5E',
        colorClass: 'text-quantum-rose',
        bgClass: 'bg-quantum-rose/10',
        total: 22400,
        previousYearTotal: 19200,
        lineItems: [
          { label: 'Medical Insurance (PPO)', employeeAmount: 3200, employerAmount: 12800 },
          { label: 'Dental Insurance', employeeAmount: 450, employerAmount: 1350 },
          { label: 'Vision Insurance', employeeAmount: 160, employerAmount: 320 },
          { label: 'Life Insurance (2× Salary)', employeeAmount: 0, employerAmount: 1580 },
          { label: 'Disability Insurance (STD + LTD)', employeeAmount: 0, employerAmount: 2540 },
        ],
      },
      {
        id: 'retirement',
        label: 'Retirement & Savings',
        icon: Shield,
        color: '#10B981',
        colorClass: 'text-neural-mint',
        bgClass: 'bg-neural-mint/10',
        total: 15000,
        previousYearTotal: 12800,
        lineItems: [
          { label: '401(k) Employee Contribution', employeeAmount: 6320, employerAmount: 0 },
          { label: '401(k) Employer Match', employeeAmount: 0, employerAmount: 6320 },
          { label: 'Pension / Profit Sharing', employeeAmount: 0, employerAmount: 2360 },
        ],
      },
      {
        id: 'perks',
        label: 'Perks & Other',
        icon: Gift,
        color: '#F59E0B',
        colorClass: 'text-sunset-amber',
        bgClass: 'bg-sunset-amber/10',
        total: 3800,
        previousYearTotal: 3000,
        lineItems: [
          { label: 'Education Reimbursement', employeeAmount: 0, employerAmount: 1800 },
          { label: 'Wellness Stipend', employeeAmount: 0, employerAmount: 500 },
          { label: 'Home Office Stipend', employeeAmount: 0, employerAmount: 1000 },
          { label: 'Commuter Benefits', employeeAmount: 0, employerAmount: 500 },
        ],
      },
    ],
  },
  FY2024: {
    employee: {
      name: 'Alex Johnson',
      id: 'EMP-4521',
      role: 'Software Engineer',
      department: 'Engineering',
      grade: 'L4 — Mid',
      dateOfJoining: 'March 15, 2021',
      manager: 'Sarah Chen',
      location: 'San Francisco, CA',
    },
    fiscalYear: 'FY2024',
    generatedDate: 'February 1, 2024',
    currency: 'USD',
    totalCompensation: 235000,
    previousYearTotal: 210000,
    employerTotal: 38600,
    categories: [
      {
        id: 'direct',
        label: 'Cash Compensation',
        icon: DollarSign,
        color: '#6366F1',
        colorClass: 'text-celestial-indigo',
        bgClass: 'bg-celestial-indigo/10',
        total: 172000,
        previousYearTotal: 155000,
        lineItems: [
          { label: 'Base Salary', employeeAmount: 142000, employerAmount: 0 },
          {
            label: 'Annual Performance Bonus',
            employeeAmount: 21300,
            employerAmount: 0,
            note: 'Target 15% · Actual 105% attainment',
          },
          { label: 'Allowances (Housing, Transport)', employeeAmount: 5200, employerAmount: 0 },
          { label: 'Overtime Pay', employeeAmount: 1500, employerAmount: 0 },
          { label: 'Shift / On-Call Differential', employeeAmount: 2000, employerAmount: 0 },
        ],
      },
      {
        id: 'equity',
        label: 'Equity & Stock',
        icon: BarChart3,
        color: '#8B5CF6',
        colorClass: 'text-nebula-purple',
        bgClass: 'bg-nebula-purple/10',
        total: 28000,
        previousYearTotal: 22000,
        lineItems: [
          { label: 'Restricted Stock Units (RSU)', employeeAmount: 22000, employerAmount: 0 },
          { label: 'Employee Stock Purchase Plan', employeeAmount: 6000, employerAmount: 0 },
        ],
      },
      {
        id: 'benefits',
        label: 'Health & Insurance',
        icon: Heart,
        color: '#F43F5E',
        colorClass: 'text-quantum-rose',
        bgClass: 'bg-quantum-rose/10',
        total: 19200,
        previousYearTotal: 18000,
        lineItems: [
          { label: 'Medical Insurance (PPO)', employeeAmount: 2800, employerAmount: 11200 },
          { label: 'Dental Insurance', employeeAmount: 400, employerAmount: 1200 },
          { label: 'Vision Insurance', employeeAmount: 140, employerAmount: 280 },
          { label: 'Life Insurance (2× Salary)', employeeAmount: 0, employerAmount: 1420 },
          { label: 'Disability Insurance (STD + LTD)', employeeAmount: 0, employerAmount: 1760 },
        ],
      },
      {
        id: 'retirement',
        label: 'Retirement & Savings',
        icon: Shield,
        color: '#10B981',
        colorClass: 'text-neural-mint',
        bgClass: 'bg-neural-mint/10',
        total: 12800,
        previousYearTotal: 12000,
        lineItems: [
          { label: '401(k) Employee Contribution', employeeAmount: 5680, employerAmount: 0 },
          { label: '401(k) Employer Match', employeeAmount: 0, employerAmount: 5680 },
          { label: 'Pension / Profit Sharing', employeeAmount: 0, employerAmount: 1440 },
        ],
      },
      {
        id: 'perks',
        label: 'Perks & Other',
        icon: Gift,
        color: '#F59E0B',
        colorClass: 'text-sunset-amber',
        bgClass: 'bg-sunset-amber/10',
        total: 3000,
        previousYearTotal: 3000,
        lineItems: [
          { label: 'Education Reimbursement', employeeAmount: 0, employerAmount: 1500 },
          { label: 'Wellness Stipend', employeeAmount: 0, employerAmount: 500 },
          { label: 'Home Office Stipend', employeeAmount: 0, employerAmount: 500 },
          { label: 'Commuter Benefits', employeeAmount: 0, employerAmount: 500 },
        ],
      },
    ],
  },
};

// ── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);

const pct = (value: number, total: number) =>
  total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';

const yoyChange = (current: number, previous: number) =>
  previous > 0 ? (((current - previous) / previous) * 100).toFixed(1) : '0.0';

// ── Category Detail Section ────────────────────────────────────────────────

function CategorySection({
  category,
  totalCompensation,
  isExpanded,
  onToggle,
}: {
  category: CompensationCategory;
  totalCompensation: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const Icon = category.icon;
  const changeNum = parseFloat(yoyChange(category.total, category.previousYearTotal));
  const isPositive = changeNum >= 0;
  const employeeTotal = category.lineItems.reduce((s, li) => s + li.employeeAmount, 0);
  const employerTotal = category.lineItems.reduce((s, li) => s + li.employerAmount, 0);

  return (
    <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 overflow-hidden print:break-inside-avoid">
      {/* Category Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 hover:bg-cloud/30 dark:hover:bg-nebula-purple/10 transition-colors text-left"
      >
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${category.bgClass}`}
        >
          <Icon className={`w-5 h-5 ${category.colorClass}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink-black dark:text-pearl">{category.label}</p>
          <p className="text-xs text-silver-mist">
            {pct(category.total, totalCompensation)}% of total
          </p>
        </div>
        <div className="text-right mr-2">
          <p className="text-base font-bold text-ink-black dark:text-pearl">
            {fmt(category.total)}
          </p>
          <div
            className={`flex items-center gap-0.5 text-xs justify-end ${isPositive ? 'text-neural-mint' : 'text-coral-alert'}`}
          >
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPositive ? '+' : ''}
            {changeNum}% YoY
          </div>
        </div>
        <div className="flex-shrink-0 text-silver-mist">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Line Items */}
      {isExpanded && (
        <div className="border-t border-cloud dark:border-nebula-purple/20">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-cloud/30 dark:bg-nebula-purple/10 text-xs font-medium text-silver-mist">
            <div className="col-span-5">Component</div>
            <div className="col-span-2 text-right">Employee</div>
            <div className="col-span-2 text-right">Employer</div>
            <div className="col-span-3 text-right">Total</div>
          </div>

          {/* Line Items */}
          {category.lineItems.map((item) => {
            const lineTotal = item.employeeAmount + item.employerAmount;
            if (lineTotal === 0) return null;
            return (
              <div
                key={item.label}
                className="grid grid-cols-12 gap-2 px-4 py-2.5 border-t border-cloud/50 dark:border-nebula-purple/10 text-sm"
              >
                <div className="col-span-5">
                  <span className="text-ink-black dark:text-pearl">{item.label}</span>
                  {item.note && <p className="text-xs text-silver-mist mt-0.5">{item.note}</p>}
                </div>
                <div className="col-span-2 text-right text-ink-black dark:text-pearl tabular-nums">
                  {item.employeeAmount > 0 ? fmt(item.employeeAmount) : '—'}
                </div>
                <div className="col-span-2 text-right text-celestial-indigo tabular-nums">
                  {item.employerAmount > 0 ? fmt(item.employerAmount) : '—'}
                </div>
                <div className="col-span-3 text-right font-medium text-ink-black dark:text-pearl tabular-nums">
                  {fmt(lineTotal)}
                </div>
              </div>
            );
          })}

          {/* Subtotals Row */}
          <div className="grid grid-cols-12 gap-2 px-4 py-2.5 border-t border-cloud dark:border-nebula-purple/20 bg-cloud/20 dark:bg-nebula-purple/5 text-sm font-semibold">
            <div className="col-span-5 text-ink-black dark:text-pearl">Subtotal</div>
            <div className="col-span-2 text-right text-ink-black dark:text-pearl tabular-nums">
              {fmt(employeeTotal)}
            </div>
            <div className="col-span-2 text-right text-celestial-indigo tabular-nums">
              {fmt(employerTotal)}
            </div>
            <div className="col-span-3 text-right text-ink-black dark:text-pearl tabular-nums">
              {fmt(category.total)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function TotalCompensationStatement() {
  const [selectedYear, setSelectedYear] = useState<FiscalYear>('FY2026');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['direct']));
  const [showEmployerCosts, setShowEmployerCosts] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  const data = MOCK_STATEMENTS[selectedYear];

  const toggleCategory = useCallback((id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedCategories(new Set(data.categories.map((c) => c.id)));
  }, [data]);

  const collapseAll = useCallback(() => {
    setExpandedCategories(new Set());
  }, []);

  // ── Pie chart gradient ────────────────────────────────────────────
  const generateConicGradient = () => {
    let accumulated = 0;
    const stops = data.categories.map((cat) => {
      const percentage = (cat.total / data.totalCompensation) * 100;
      const start = accumulated;
      accumulated += percentage;
      return `${cat.color} ${start}% ${accumulated}%`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  };

  // ── PDF / Print ───────────────────────────────────────────────────
  const handleExportPDF = useCallback(() => {
    // Expand all categories for printing
    setExpandedCategories(new Set(data.categories.map((c) => c.id)));

    setTimeout(() => {
      window.print();
    }, 100);
  }, [data]);

  // ── YoY change ────────────────────────────────────────────────────
  const totalChange = parseFloat(yoyChange(data.totalCompensation, data.previousYearTotal));
  const isTotalPositive = totalChange >= 0;

  // ── Employer total ────────────────────────────────────────────────
  const employerGrandTotal = data.categories.reduce(
    (sum, cat) => sum + cat.lineItems.reduce((s, li) => s + li.employerAmount, 0),
    0
  );
  const employeeGrandTotal = data.categories.reduce(
    (sum, cat) => sum + cat.lineItems.reduce((s, li) => s + li.employeeAmount, 0),
    0
  );

  // ── Summary stats ─────────────────────────────────────────────────
  const summaryStats = [
    {
      label: 'Cash Compensation',
      value: data.categories.find((c) => c.id === 'direct')?.total ?? 0,
      icon: Banknote,
      colorClass: 'text-celestial-indigo',
      bgClass: 'bg-celestial-indigo/10',
    },
    {
      label: 'Equity Value',
      value: data.categories.find((c) => c.id === 'equity')?.total ?? 0,
      icon: BarChart3,
      colorClass: 'text-nebula-purple',
      bgClass: 'bg-nebula-purple/10',
    },
    {
      label: 'Benefits Value',
      value:
        (data.categories.find((c) => c.id === 'benefits')?.total ?? 0) +
        (data.categories.find((c) => c.id === 'retirement')?.total ?? 0),
      icon: Shield,
      colorClass: 'text-neural-mint',
      bgClass: 'bg-neural-mint/10',
    },
    {
      label: 'Employer Paid',
      value: employerGrandTotal,
      icon: Building2,
      colorClass: 'text-sunset-amber',
      bgClass: 'bg-sunset-amber/10',
    },
  ];

  return (
    <div
      ref={printRef}
      className="p-4 sm:p-6 bg-white dark:bg-stellar-blue min-h-screen print:bg-white print:text-black"
    >
      <div className="max-w-5xl mx-auto">
        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-6 h-6 text-celestial-indigo" />
              <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">
                Total Compensation Statement
              </h1>
            </div>
            <p className="text-silver-mist text-sm">
              Confidential — For {data.employee.name} ({data.employee.id})
            </p>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            {/* Fiscal Year Selector */}
            <div className="flex rounded-lg border border-cloud dark:border-nebula-purple/30 overflow-hidden">
              {(['FY2024', 'FY2025', 'FY2026'] as FiscalYear[]).map((fy) => (
                <button
                  key={fy}
                  onClick={() => setSelectedYear(fy)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedYear === fy
                      ? 'bg-celestial-indigo text-white'
                      : 'text-silver-mist hover:bg-cloud dark:hover:bg-nebula-purple/20'
                  }`}
                >
                  {fy}
                </button>
              ))}
            </div>

            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 text-ink-black dark:text-pearl text-xs font-medium hover:bg-cloud dark:hover:bg-nebula-purple/20"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-celestial-indigo text-white text-xs font-medium hover:opacity-90"
            >
              <Download className="w-3.5 h-3.5" />
              Export PDF
            </button>
          </div>
        </div>

        {/* ── Employee Info Bar ─────────────────────────────────────── */}
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 p-4 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm print:border-gray-300">
          {[
            { icon: Briefcase, label: 'Role', value: data.employee.role },
            {
              icon: Building2,
              label: 'Department',
              value: `${data.employee.department} · ${data.employee.grade}`,
            },
            { icon: Calendar, label: 'Date of Joining', value: data.employee.dateOfJoining },
            {
              icon: Clock,
              label: 'Statement Period',
              value: `${data.fiscalYear} · Generated ${data.generatedDate}`,
            },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-2">
              <item.icon className="w-4 h-4 text-silver-mist flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-silver-mist">{item.label}</p>
                <p className="text-ink-black dark:text-pearl font-medium">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Total Compensation Hero ──────────────────────────────── */}
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 p-6 mb-6 bg-gradient-to-br from-celestial-indigo/5 via-transparent to-nebula-purple/5 print:border-gray-300">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-silver-mist uppercase tracking-wider mb-1">
                Total Annual Compensation · {data.fiscalYear}
              </p>
              <h2 className="text-4xl font-bold text-ink-black dark:text-pearl">
                {fmt(data.totalCompensation)}
              </h2>
              <div
                className={`flex items-center gap-1 mt-1 text-sm font-medium ${isTotalPositive ? 'text-neural-mint' : 'text-coral-alert'}`}
              >
                {isTotalPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {isTotalPositive ? '+' : ''}
                {totalChange}% vs previous year ({fmt(data.previousYearTotal)})
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-center px-4 py-2 rounded-lg bg-white dark:bg-deep-cosmos/50 border border-cloud dark:border-nebula-purple/20">
                <p className="text-xs text-silver-mist">Your Cost</p>
                <p className="text-lg font-bold text-ink-black dark:text-pearl">
                  {fmt(employeeGrandTotal)}
                </p>
              </div>
              <div className="text-center px-4 py-2 rounded-lg bg-celestial-indigo/5 border border-celestial-indigo/20">
                <p className="text-xs text-celestial-indigo">Employer Paid</p>
                <p className="text-lg font-bold text-celestial-indigo">{fmt(employerGrandTotal)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Summary Stat Cards ───────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {summaryStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-cloud dark:border-nebula-purple/20 p-3 print:border-gray-300"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${stat.bgClass}`}
                >
                  <stat.icon className={`w-3.5 h-3.5 ${stat.colorClass}`} />
                </div>
                <span className="text-xs text-silver-mist">{stat.label}</span>
              </div>
              <p className="text-lg font-bold text-ink-black dark:text-pearl tabular-nums">
                {fmt(stat.value)}
              </p>
              <p className="text-xs text-silver-mist">
                {pct(stat.value, data.totalCompensation)}% of total
              </p>
            </div>
          ))}
        </div>

        {/* ── Charts Row ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Donut Chart */}
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 p-6 print:border-gray-300">
            <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-celestial-indigo" />
              Compensation Mix
            </h3>
            <div className="flex items-center gap-6">
              <div className="relative flex-shrink-0">
                <div
                  className="w-40 h-40 rounded-full"
                  style={{ background: generateConicGradient() }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-white dark:bg-stellar-blue flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-[10px] text-silver-mist">Total</p>
                      <p className="text-xs font-bold text-ink-black dark:text-pearl">
                        {fmt(data.totalCompensation)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2 flex-1">
                {data.categories.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-xs text-ink-black dark:text-pearl flex-1 truncate">
                      {cat.label}
                    </span>
                    <span className="text-xs text-silver-mist tabular-nums">
                      {pct(cat.total, data.totalCompensation)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Horizontal Stacked Bar */}
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 p-6 print:border-gray-300">
            <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-celestial-indigo" />
              Year-over-Year Comparison
            </h3>

            {(['FY2026', 'FY2025', 'FY2024'] as FiscalYear[]).map((fy) => {
              const fyData = MOCK_STATEMENTS[fy];
              const maxTotal = Math.max(
                MOCK_STATEMENTS.FY2026.totalCompensation,
                MOCK_STATEMENTS.FY2025.totalCompensation,
                MOCK_STATEMENTS.FY2024.totalCompensation
              );
              return (
                <div key={fy} className="mb-4 last:mb-0">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span
                      className={`font-medium ${fy === selectedYear ? 'text-ink-black dark:text-pearl' : 'text-silver-mist'}`}
                    >
                      {fy}
                    </span>
                    <span
                      className={`tabular-nums ${fy === selectedYear ? 'font-semibold text-ink-black dark:text-pearl' : 'text-silver-mist'}`}
                    >
                      {fmt(fyData.totalCompensation)}
                    </span>
                  </div>
                  <div className="h-6 rounded-lg bg-cloud/50 dark:bg-nebula-purple/10 overflow-hidden flex">
                    {fyData.categories.map((cat) => {
                      const width = (cat.total / maxTotal) * 100;
                      return (
                        <div
                          key={cat.id}
                          className="h-full transition-all relative group"
                          style={{ width: `${width}%`, backgroundColor: cat.color }}
                          title={`${cat.label}: ${fmt(cat.total)}`}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Mini legend */}
            <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-cloud dark:border-nebula-purple/20">
              {data.categories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-[10px] text-silver-mist">{cat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Controls ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-3 print:hidden">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">
              Detailed Breakdown
            </h3>
            <label className="flex items-center gap-1.5 text-xs text-silver-mist cursor-pointer">
              <input
                type="checkbox"
                checked={showEmployerCosts}
                onChange={(e) => setShowEmployerCosts(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-cloud dark:border-nebula-purple/30 text-celestial-indigo focus:ring-celestial-indigo/30"
              />
              Show employer costs
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={expandAll} className="text-xs text-celestial-indigo hover:underline">
              Expand all
            </button>
            <span className="text-xs text-silver-mist">|</span>
            <button onClick={collapseAll} className="text-xs text-celestial-indigo hover:underline">
              Collapse all
            </button>
          </div>
        </div>

        {/* ── Category Sections ────────────────────────────────────── */}
        <div className="space-y-3 mb-6">
          {data.categories.map((cat) => (
            <CategorySection
              key={cat.id}
              category={cat}
              totalCompensation={data.totalCompensation}
              isExpanded={expandedCategories.has(cat.id)}
              onToggle={() => toggleCategory(cat.id)}
            />
          ))}
        </div>

        {/* ── Grand Total ──────────────────────────────────────────── */}
        <div className="rounded-xl border-2 border-celestial-indigo/30 bg-celestial-indigo/5 p-4 mb-6 print:border-gray-400">
          <div className="grid grid-cols-12 gap-2 text-sm font-bold">
            <div className="col-span-5 flex items-center gap-2 text-ink-black dark:text-pearl">
              <Award className="w-5 h-5 text-celestial-indigo" />
              Grand Total — {data.fiscalYear}
            </div>
            {showEmployerCosts && (
              <>
                <div className="col-span-2 text-right text-ink-black dark:text-pearl tabular-nums">
                  {fmt(employeeGrandTotal)}
                </div>
                <div className="col-span-2 text-right text-celestial-indigo tabular-nums">
                  {fmt(employerGrandTotal)}
                </div>
              </>
            )}
            <div
              className={`text-right text-ink-black dark:text-pearl tabular-nums ${showEmployerCosts ? 'col-span-3' : 'col-span-7'}`}
            >
              {fmt(data.totalCompensation)}
            </div>
          </div>
        </div>

        {/* ── Horizontal Bar Chart — Employee vs Employer Split ───── */}
        {showEmployerCosts && (
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 p-6 mb-6 print:border-gray-300">
            <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
              <Percent className="w-4 h-4 text-celestial-indigo" />
              Employee vs Employer Contribution by Category
            </h3>
            <div className="space-y-3">
              {data.categories.map((cat) => {
                const empTotal = cat.lineItems.reduce((s, li) => s + li.employeeAmount, 0);
                const erTotal = cat.lineItems.reduce((s, li) => s + li.employerAmount, 0);
                const catTotal = empTotal + erTotal;
                const empPct = catTotal > 0 ? (empTotal / catTotal) * 100 : 0;
                const erPct = catTotal > 0 ? (erTotal / catTotal) * 100 : 0;

                return (
                  <div key={cat.id}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-ink-black dark:text-pearl font-medium">
                        {cat.label}
                      </span>
                      <span className="text-silver-mist tabular-nums">{fmt(catTotal)}</span>
                    </div>
                    <div className="h-5 rounded-md overflow-hidden flex bg-cloud/30 dark:bg-nebula-purple/10">
                      {empPct > 0 && (
                        <div
                          className="h-full flex items-center justify-center text-[10px] font-medium text-white"
                          style={{ width: `${empPct}%`, backgroundColor: cat.color }}
                        >
                          {empPct >= 15 && `You ${empPct.toFixed(0)}%`}
                        </div>
                      )}
                      {erPct > 0 && (
                        <div
                          className="h-full flex items-center justify-center text-[10px] font-medium text-white"
                          style={{ width: `${erPct}%`, backgroundColor: `${cat.color}99` }}
                        >
                          {erPct >= 15 && `Employer ${erPct.toFixed(0)}%`}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-cloud dark:border-nebula-purple/20">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-celestial-indigo" />
                <span className="text-xs text-silver-mist">Employee contribution</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-celestial-indigo/60" />
                <span className="text-xs text-silver-mist">Employer contribution</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Compensation Growth Timeline ────────────────────────── */}
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 p-6 mb-6 print:border-gray-300">
          <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-celestial-indigo" />
            Compensation Growth Summary
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cloud dark:border-nebula-purple/20">
                  <th className="text-left py-2 text-xs font-medium text-silver-mist">Category</th>
                  {(['FY2024', 'FY2025', 'FY2026'] as FiscalYear[]).map((fy) => (
                    <th
                      key={fy}
                      className={`text-right py-2 text-xs font-medium ${fy === selectedYear ? 'text-celestial-indigo' : 'text-silver-mist'}`}
                    >
                      {fy}
                    </th>
                  ))}
                  <th className="text-right py-2 text-xs font-medium text-silver-mist">
                    3-Yr Growth
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.categories.map((cat) => {
                  const fy24 = MOCK_STATEMENTS.FY2024.categories.find((c) => c.id === cat.id);
                  const fy25 = MOCK_STATEMENTS.FY2025.categories.find((c) => c.id === cat.id);
                  const fy26 = MOCK_STATEMENTS.FY2026.categories.find((c) => c.id === cat.id);
                  const growth = fy24 && fy26 ? parseFloat(yoyChange(fy26.total, fy24.total)) : 0;
                  const isPos = growth >= 0;
                  return (
                    <tr
                      key={cat.id}
                      className="border-b border-cloud/50 dark:border-nebula-purple/10"
                    >
                      <td className="py-2.5 text-ink-black dark:text-pearl font-medium flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.label}
                      </td>
                      <td className="py-2.5 text-right tabular-nums text-silver-mist">
                        {fmt(fy24?.total ?? 0)}
                      </td>
                      <td className="py-2.5 text-right tabular-nums text-silver-mist">
                        {fmt(fy25?.total ?? 0)}
                      </td>
                      <td className="py-2.5 text-right tabular-nums font-semibold text-ink-black dark:text-pearl">
                        {fmt(fy26?.total ?? 0)}
                      </td>
                      <td
                        className={`py-2.5 text-right tabular-nums font-medium ${isPos ? 'text-neural-mint' : 'text-coral-alert'}`}
                      >
                        {isPos ? '+' : ''}
                        {growth}%
                      </td>
                    </tr>
                  );
                })}
                <tr className="font-bold">
                  <td className="py-2.5 text-ink-black dark:text-pearl">Grand Total</td>
                  <td className="py-2.5 text-right tabular-nums text-silver-mist">
                    {fmt(MOCK_STATEMENTS.FY2024.totalCompensation)}
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-silver-mist">
                    {fmt(MOCK_STATEMENTS.FY2025.totalCompensation)}
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-ink-black dark:text-pearl">
                    {fmt(MOCK_STATEMENTS.FY2026.totalCompensation)}
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-neural-mint">
                    +
                    {yoyChange(
                      MOCK_STATEMENTS.FY2026.totalCompensation,
                      MOCK_STATEMENTS.FY2024.totalCompensation
                    )}
                    %
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Footer / Disclaimer ────────────────────────────────── */}
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 p-4 text-xs text-silver-mist print:border-gray-300">
          <p className="font-medium text-ink-black dark:text-pearl mb-1">Disclaimer</p>
          <p>
            This statement is intended for informational purposes only and reflects compensation
            data as of {data.generatedDate}. Actual values may vary based on tax withholdings,
            benefit elections, equity vesting schedules, and other factors. Stock values are based
            on the grant-date fair market value and may differ from current market prices. This
            document is confidential and intended solely for the named employee. Please contact HR
            for questions or corrections.
          </p>
        </div>
      </div>

      {/* ── Print Styles ─────────────────────────────────────────── */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid;
          }
          nav,
          aside,
          header,
          footer,
          [data-sidebar],
          [data-topbar] {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export { type FiscalYear, type LineItem, type CompensationCategory, type StatementData };
