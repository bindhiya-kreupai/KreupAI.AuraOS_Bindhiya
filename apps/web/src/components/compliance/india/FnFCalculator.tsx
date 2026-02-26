'use client';

import React, { useState, useMemo } from 'react';
import {
  UserX,
  CheckCircle2,
  Clock,
  FileText,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  MinusCircle,
  PlusCircle,
  Download,
  Send,
  BadgeCheck,
  ReceiptText,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Jurisdiction = 'UAE' | 'KSA' | 'INDIA' | 'OTHER';
type TerminationReason =
  | 'RESIGNATION'
  | 'TERMINATION'
  | 'RETIREMENT'
  | 'REDUNDANCY'
  | 'END_OF_CONTRACT'
  | 'MUTUAL_AGREEMENT';
type SettlementStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'PROCESSED';

interface FnFInputs {
  // Employee
  employeeName: string;
  employeeCode: string;
  designation: string;
  department: string;
  joiningDate: string;
  lastWorkingDate: string;
  jurisdiction: Jurisdiction;
  reason: TerminationReason;

  // Salary
  basicSalary: string;
  grossSalary: string;
  daAllowance: string;

  // Leave
  unusedLeaveDays: string;

  // Bonus
  annualBonusTarget: string;
  bonusProrataMonths: string;

  // Deductions
  noticePeriodShortfall: string;
  outstandingLoan: string;
  salaryAdvance: string;
  otherDeductions: string;

  // India specific
  pfBalance: string;
}

// ---------------------------------------------------------------------------
// Gratuity/EOSB Calculation Helpers
// ---------------------------------------------------------------------------

function monthsDiff(from: Date, to: Date): number {
  const years = to.getFullYear() - from.getFullYear();
  const months = to.getMonth() - from.getMonth();
  const days = to.getDate() - from.getDate();
  return Math.max(years * 12 + months + (days >= 15 ? 1 : 0), 0);
}

function calculateGratuity(
  basicSalary: number,
  daAllowance: number,
  joiningDate: Date,
  lastWorkingDate: Date,
  jurisdiction: Jurisdiction,
  reason: TerminationReason
): {
  amount: number;
  isEligible: boolean;
  reason: string;
  yearsOfService: number;
  monthsOfService: number;
} {
  const totalMonths = monthsDiff(joiningDate, lastWorkingDate);
  const totalYears = totalMonths / 12;
  const completedYears = Math.floor(totalYears);

  if (jurisdiction === 'UAE') {
    const dailyRate = basicSalary / 30;
    if (totalMonths < 12) {
      return {
        amount: 0,
        isEligible: false,
        reason: 'Less than 1 year of service',
        yearsOfService: totalYears,
        monthsOfService: totalMonths,
      };
    }
    let amount = 0;
    if (completedYears <= 5) {
      amount = dailyRate * 21 * completedYears;
      if (reason !== 'RESIGNATION') {
        const partialMonths = totalMonths - completedYears * 12;
        amount += dailyRate * 21 * (partialMonths / 12);
      }
    } else {
      amount = dailyRate * 21 * 5;
      amount += dailyRate * 30 * (completedYears - 5);
      const partialMonths = totalMonths - completedYears * 12;
      amount += dailyRate * 30 * (partialMonths / 12);
    }
    return {
      amount: Math.round(amount),
      isEligible: true,
      reason: `${completedYears} years ${totalMonths % 12} months`,
      yearsOfService: totalYears,
      monthsOfService: totalMonths,
    };
  }

  if (jurisdiction === 'KSA') {
    const dailyRate = basicSalary / 30;
    if (totalMonths < 24 && reason === 'RESIGNATION') {
      return {
        amount: 0,
        isEligible: false,
        reason: 'Resignation with < 2 years service',
        yearsOfService: totalYears,
        monthsOfService: totalMonths,
      };
    }
    const resignFactor =
      reason === 'RESIGNATION' ? (completedYears >= 5 ? 1 : completedYears >= 2 ? 0.5 : 0) : 1;
    let amount = 0;
    if (completedYears <= 5) {
      amount = dailyRate * 15 * completedYears * resignFactor;
    } else {
      amount = dailyRate * 15 * 5 + dailyRate * 30 * (completedYears - 5);
      const partialMonths = totalMonths - completedYears * 12;
      amount += dailyRate * 30 * (partialMonths / 12);
    }
    return {
      amount: Math.round(amount),
      isEligible: amount > 0,
      reason: `${completedYears} years`,
      yearsOfService: totalYears,
      monthsOfService: totalMonths,
    };
  }

  if (jurisdiction === 'INDIA') {
    const dailyRate = (basicSalary + daAllowance) / 26;
    if (totalYears < 5) {
      return {
        amount: 0,
        isEligible: false,
        reason: `Less than 5 years of continuous service (${totalYears.toFixed(1)} years)`,
        yearsOfService: totalYears,
        monthsOfService: totalMonths,
      };
    }
    const remainingMonths = totalMonths % 12;
    const serviceYears = remainingMonths >= 6 ? completedYears + 1 : completedYears;
    const amount = Math.min(dailyRate * 15 * serviceYears, 2000000);
    return {
      amount: Math.round(amount),
      isEligible: true,
      reason: `${serviceYears} years (rounded up)`,
      yearsOfService: totalYears,
      monthsOfService: totalMonths,
    };
  }

  return {
    amount: 0,
    isEligible: false,
    reason: 'Jurisdiction not configured',
    yearsOfService: totalYears,
    monthsOfService: totalMonths,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatCurrency = (n: number, jurisdiction: Jurisdiction): string => {
  const currencies: Record<Jurisdiction, string> = {
    UAE: 'AED',
    KSA: 'SAR',
    INDIA: 'INR',
    OTHER: 'USD',
  };
  const locales: Record<Jurisdiction, string> = {
    UAE: 'en-AE',
    KSA: 'en-SA',
    INDIA: 'en-IN',
    OTHER: 'en-US',
  };
  return new Intl.NumberFormat(locales[jurisdiction], {
    style: 'currency',
    currency: currencies[jurisdiction],
    maximumFractionDigits: 0,
  }).format(n);
};

const REASONS: Record<TerminationReason, string> = {
  RESIGNATION: 'Resignation',
  TERMINATION: 'Termination',
  RETIREMENT: 'Retirement',
  REDUNDANCY: 'Redundancy',
  END_OF_CONTRACT: 'End of Contract',
  MUTUAL_AGREEMENT: 'Mutual Agreement',
};

const JURISDICTIONS: Record<Jurisdiction, string> = {
  UAE: 'UAE (EOSB)',
  KSA: 'Saudi Arabia',
  INDIA: 'India (Gratuity)',
  OTHER: 'Other',
};

const STATUS_CONFIG: Record<
  SettlementStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  DRAFT: {
    label: 'Draft',
    color: 'text-slate-600',
    bg: 'bg-slate-50 border-slate-200',
    icon: FileText,
  },
  PENDING_APPROVAL: {
    label: 'Pending Approval',
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
    icon: Clock,
  },
  APPROVED: {
    label: 'Approved',
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
// FnF Calculator
// ---------------------------------------------------------------------------

const DEFAULT_INPUTS: FnFInputs = {
  employeeName: 'Arun Kumar',
  employeeCode: 'EMP-001',
  designation: 'Senior Engineer',
  department: 'Engineering',
  joiningDate: '2020-03-15',
  lastWorkingDate: '2026-02-28',
  jurisdiction: 'INDIA',
  reason: 'RESIGNATION',
  basicSalary: '35000',
  grossSalary: '55000',
  daAllowance: '0',
  unusedLeaveDays: '12',
  annualBonusTarget: '60000',
  bonusProrataMonths: '2',
  noticePeriodShortfall: '10',
  outstandingLoan: '20000',
  salaryAdvance: '5000',
  otherDeductions: '0',
  pfBalance: '85000',
};

export function FnFCalculator() {
  const [inputs, setInputs] = useState<FnFInputs>(DEFAULT_INPUTS);
  const [status, setStatus] = useState<SettlementStatus>('DRAFT');
  const [expandedSection, setExpandedSection] = useState<string | null>('earnings');

  const set = (key: keyof FnFInputs, value: string) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  // Computed values
  const calc = useMemo(() => {
    const basic = parseFloat(inputs.basicSalary) || 0;
    const gross = parseFloat(inputs.grossSalary) || 0;
    const da = parseFloat(inputs.daAllowance) || 0;
    const joining = new Date(inputs.joiningDate);
    const lwd = new Date(inputs.lastWorkingDate);

    if (isNaN(joining.getTime()) || isNaN(lwd.getTime())) return null;

    // Last month salary (pro-rated)
    const daysInLWDMonth = new Date(lwd.getFullYear(), lwd.getMonth() + 1, 0).getDate();
    const workedDays = lwd.getDate();
    const lastMonthSalary = Math.round((gross / daysInLWDMonth) * workedDays);

    // Leave encashment
    const unusedDays = parseFloat(inputs.unusedLeaveDays) || 0;
    const dailyBasic = basic / 26;
    const leaveEncashment = Math.round(dailyBasic * unusedDays);

    // Gratuity
    const gratuity = calculateGratuity(basic, da, joining, lwd, inputs.jurisdiction, inputs.reason);

    // Bonus pro-rata
    const bonusMonths = parseFloat(inputs.bonusProrataMonths) || 0;
    const bonusTarget = parseFloat(inputs.annualBonusTarget) || 0;
    const bonusProrata = Math.round((bonusTarget / 12) * bonusMonths);

    // PF settlement (India only)
    const pfSettlement = inputs.jurisdiction === 'INDIA' ? parseFloat(inputs.pfBalance) || 0 : 0;

    // Total earnings
    const totalEarnings =
      lastMonthSalary + leaveEncashment + gratuity.amount + bonusProrata + pfSettlement;

    // Deductions
    const dailyGross = gross / daysInLWDMonth;
    const noticePeriodShortfall = parseFloat(inputs.noticePeriodShortfall) || 0;
    const noticePeriodRecovery = Math.round(dailyGross * noticePeriodShortfall);
    const loanRecovery = parseFloat(inputs.outstandingLoan) || 0;
    const advanceRecovery = parseFloat(inputs.salaryAdvance) || 0;
    const otherDed = parseFloat(inputs.otherDeductions) || 0;
    const totalDeductions = noticePeriodRecovery + loanRecovery + advanceRecovery + otherDed;

    const netSettlement = Math.max(totalEarnings - totalDeductions, 0);

    return {
      lastMonthSalary,
      workedDays,
      daysInLWDMonth,
      leaveEncashment,
      gratuity,
      bonusProrata,
      pfSettlement,
      totalEarnings,
      noticePeriodRecovery,
      loanRecovery,
      advanceRecovery,
      otherDed,
      totalDeductions,
      netSettlement,
      yearsOfService: gratuity.yearsOfService,
    };
  }, [inputs]);

  const toggleSection = (s: string) => setExpandedSection(expandedSection === s ? null : s);
  const fmt = (n: number) => formatCurrency(n, inputs.jurisdiction);

  const StatusBadge = ({ s }: { s: SettlementStatus }) => {
    const c = STATUS_CONFIG[s];
    const Icon = c.icon;
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${c.color} ${c.bg}`}
      >
        <Icon className="h-3 w-3" />
        {c.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-rose-600 p-2.5">
            <UserX className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Full & Final Settlement Calculator</h1>
            <p className="text-sm text-slate-500">
              Multi-jurisdiction settlement — UAE EOSB · KSA End of Service · India Gratuity
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge s={status} />
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <Download className="h-4 w-4" />
              Export PDF
            </button>
            <button
              onClick={() => setStatus('PENDING_APPROVAL')}
              disabled={status !== 'DRAFT'}
              className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Submit for Approval
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
        {/* LEFT — Input Form */}
        <div className="space-y-4">
          {/* Employee Details */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-slate-900">Employee Details</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Employee Name
                  </label>
                  <input
                    value={inputs.employeeName}
                    onChange={(e) => set('employeeName', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Employee Code
                  </label>
                  <input
                    value={inputs.employeeCode}
                    onChange={(e) => set('employeeCode', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Joining Date
                  </label>
                  <input
                    type="date"
                    value={inputs.joiningDate}
                    onChange={(e) => set('joiningDate', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Last Working Date
                  </label>
                  <input
                    type="date"
                    value={inputs.lastWorkingDate}
                    onChange={(e) => set('lastWorkingDate', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Jurisdiction
                  </label>
                  <select
                    value={inputs.jurisdiction}
                    onChange={(e) => set('jurisdiction', e.target.value as Jurisdiction)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  >
                    {Object.entries(JURISDICTIONS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Reason for Exit
                  </label>
                  <select
                    value={inputs.reason}
                    onChange={(e) => set('reason', e.target.value as TerminationReason)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  >
                    {Object.entries(REASONS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Salary */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-slate-900">Salary Components</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Gross Salary / Month
                  </label>
                  <input
                    type="number"
                    value={inputs.grossSalary}
                    onChange={(e) => set('grossSalary', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Basic Salary / Month
                  </label>
                  <input
                    type="number"
                    value={inputs.basicSalary}
                    onChange={(e) => set('basicSalary', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>
              {inputs.jurisdiction === 'INDIA' && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    DA Allowance / Month
                  </label>
                  <input
                    type="number"
                    value={inputs.daAllowance}
                    onChange={(e) => set('daAllowance', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Unused Leave Days
                  </label>
                  <input
                    type="number"
                    value={inputs.unusedLeaveDays}
                    onChange={(e) => set('unusedLeaveDays', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Annual Bonus Target
                  </label>
                  <input
                    type="number"
                    value={inputs.annualBonusTarget}
                    onChange={(e) => set('annualBonusTarget', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-slate-900">Deductions</p>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Notice Period Shortfall (days)
                </label>
                <input
                  type="number"
                  value={inputs.noticePeriodShortfall}
                  onChange={(e) => set('noticePeriodShortfall', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Outstanding Loan
                  </label>
                  <input
                    type="number"
                    value={inputs.outstandingLoan}
                    onChange={(e) => set('outstandingLoan', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Salary Advance
                  </label>
                  <input
                    type="number"
                    value={inputs.salaryAdvance}
                    onChange={(e) => set('salaryAdvance', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>
              {inputs.jurisdiction === 'INDIA' && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    PF Balance (to settle)
                  </label>
                  <input
                    type="number"
                    value={inputs.pfBalance}
                    onChange={(e) => set('pfBalance', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — Settlement Statement */}
        {calc && (
          <div className="space-y-4">
            {/* Header Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Full & Final Settlement</p>
                  <p className="text-xl font-bold text-slate-900">{inputs.employeeName}</p>
                  <p className="text-xs text-slate-400">
                    {inputs.employeeCode} · {inputs.designation} · {inputs.department}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Net Payable</p>
                  <p className="text-3xl font-extrabold text-rose-600">{fmt(calc.netSettlement)}</p>
                  <p className="text-xs text-slate-400">
                    {JURISDICTIONS[inputs.jurisdiction]} · {REASONS[inputs.reason]}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 text-xs">
                <div>
                  <p className="text-slate-500">Joining Date</p>
                  <p className="font-medium text-slate-900">
                    {new Date(inputs.joiningDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Last Working Date</p>
                  <p className="font-medium text-slate-900">
                    {new Date(inputs.lastWorkingDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Years of Service</p>
                  <p className="font-medium text-slate-900">
                    {calc.yearsOfService.toFixed(1)} years
                  </p>
                </div>
              </div>
            </div>

            {/* Earnings Section */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <button
                className="flex w-full items-center justify-between px-5 py-4"
                onClick={() => toggleSection('earnings')}
              >
                <div className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-slate-900">
                    Earnings & Entitlements
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold text-emerald-700">
                    {fmt(calc.totalEarnings)}
                  </span>
                  {expandedSection === 'earnings' ? (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  )}
                </div>
              </button>
              {expandedSection === 'earnings' && (
                <div className="border-t border-slate-100 px-5 py-4 space-y-2">
                  {[
                    {
                      label: 'Last Month Salary (pro-rated)',
                      amount: calc.lastMonthSalary,
                      detail: `${calc.workedDays} of ${calc.daysInLWDMonth} days`,
                    },
                    {
                      label: 'Leave Encashment',
                      amount: calc.leaveEncashment,
                      detail: `${inputs.unusedLeaveDays} unused days × daily basic rate`,
                    },
                    {
                      label:
                        inputs.jurisdiction === 'UAE'
                          ? 'EOSB (End of Service Benefit)'
                          : inputs.jurisdiction === 'KSA'
                            ? 'End of Service Award'
                            : 'Gratuity',
                      amount: calc.gratuity.amount,
                      detail: calc.gratuity.isEligible
                        ? calc.gratuity.reason
                        : calc.gratuity.reason,
                      alert: !calc.gratuity.isEligible,
                    },
                    {
                      label: 'Bonus Pro-rata',
                      amount: calc.bonusProrata,
                      detail: `${inputs.bonusProrataMonths} months of ${inputs.annualBonusTarget} annual target`,
                    },
                    inputs.jurisdiction === 'INDIA' && calc.pfSettlement > 0
                      ? {
                          label: 'PF Balance Settlement',
                          amount: calc.pfSettlement,
                          detail: 'Employee PF account balance',
                        }
                      : null,
                  ]
                    .filter(Boolean)
                    .map((item: any) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5 text-sm"
                      >
                        <div>
                          <p
                            className={`font-medium ${item.alert ? 'text-amber-700' : 'text-slate-800'}`}
                          >
                            {item.label}
                          </p>
                          <p className="text-xs text-slate-400">{item.detail}</p>
                          {item.alert && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                              <AlertTriangle className="h-3 w-3" />
                              Not eligible
                            </div>
                          )}
                        </div>
                        <span
                          className={`font-bold ${item.alert ? 'text-slate-400' : 'text-emerald-700'}`}
                        >
                          {fmt(item.amount)}
                        </span>
                      </div>
                    ))}
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-slate-900">
                    <span>Total Earnings</span>
                    <span className="text-emerald-700">{fmt(calc.totalEarnings)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Deductions Section */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <button
                className="flex w-full items-center justify-between px-5 py-4"
                onClick={() => toggleSection('deductions')}
              >
                <div className="flex items-center gap-2">
                  <MinusCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-semibold text-slate-900">
                    Deductions & Recoveries
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold text-red-600">
                    {fmt(calc.totalDeductions)}
                  </span>
                  {expandedSection === 'deductions' ? (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  )}
                </div>
              </button>
              {expandedSection === 'deductions' && (
                <div className="border-t border-slate-100 px-5 py-4 space-y-2">
                  {[
                    calc.noticePeriodRecovery > 0 && {
                      label: 'Notice Period Recovery',
                      amount: calc.noticePeriodRecovery,
                      detail: `${inputs.noticePeriodShortfall} days short-served`,
                    },
                    calc.loanRecovery > 0 && {
                      label: 'Outstanding Loan Recovery',
                      amount: calc.loanRecovery,
                      detail: 'Balance loan outstanding',
                    },
                    calc.advanceRecovery > 0 && {
                      label: 'Salary Advance Recovery',
                      amount: calc.advanceRecovery,
                      detail: 'Advance against salary',
                    },
                    calc.otherDed > 0 && {
                      label: 'Other Deductions',
                      amount: calc.otherDed,
                      detail: 'Miscellaneous recoveries',
                    },
                  ]
                    .filter(Boolean)
                    .map((item: any) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between rounded-lg bg-red-50 px-4 py-2.5 text-sm"
                      >
                        <div>
                          <p className="font-medium text-slate-800">{item.label}</p>
                          <p className="text-xs text-slate-400">{item.detail}</p>
                        </div>
                        <span className="font-bold text-red-600">- {fmt(item.amount)}</span>
                      </div>
                    ))}
                  {calc.totalDeductions === 0 && (
                    <p className="text-center text-sm text-slate-400 py-2">No deductions</p>
                  )}
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-slate-900">
                    <span>Total Deductions</span>
                    <span className="text-red-600">{fmt(calc.totalDeductions)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Net Settlement */}
            <div className="rounded-xl border-2 border-rose-300 bg-rose-50 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-rose-900">Net Settlement Amount</p>
                  <p className="text-xs text-rose-600">Total Earnings - Total Deductions</p>
                </div>
                <p className="text-4xl font-extrabold text-rose-700">{fmt(calc.netSettlement)}</p>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-rose-700">
                <span>Total Earnings: {fmt(calc.totalEarnings)}</span>
                <span>Less Deductions: {fmt(calc.totalDeductions)}</span>
                <span className="font-bold">Net Payable: {fmt(calc.netSettlement)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setStatus('PENDING_APPROVAL')}
                disabled={status !== 'DRAFT'}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 py-3 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                Submit for Approval
              </button>
              {status === 'PENDING_APPROVAL' && (
                <button
                  onClick={() => setStatus('APPROVED')}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  <BadgeCheck className="h-4 w-4" />
                  Approve Settlement
                </button>
              )}
              <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <ReceiptText className="h-4 w-4" />
                Print Statement
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FnFCalculator;
