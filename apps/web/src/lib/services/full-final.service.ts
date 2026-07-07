import { prisma } from '@aura/database';
import { BaseService } from './base.service';

export type FullFinalStatus = 'DRAFT' | 'CALCULATED' | 'APPROVED' | 'PROCESSED' | 'CANCELED';

export type BreakdownKind = 'earning' | 'deduction' | 'tax';

export interface BreakdownLine {
  code: string;
  label: string;
  kind: BreakdownKind;
  amount: number;
  source: string;
}

export interface CalculationInput {
  tenantId: string;
  employeeId: string;
  countryCode: string;
  lastWorkingDay: Date;
  joiningDate: Date;
  basicSalary: number;
  grossSalary: number;
  currency?: string;
  exitRequestId?: string;
  earnedLeaveBalanceDays?: number;
  outstandingLoanAmount?: number;
  unservedNoticeDays?: number;
  proRataBonusBase?: number;
  otherEarnings?: number;
  otherDeductions?: number;
  noticePeriodDays?: number;
}

export interface CalculationResult {
  countryCode: string;
  currency: string;
  serviceMonths: number;
  unpaidSalary: number;
  leaveEncashment: number;
  gratuity: number;
  bonusProRata: number;
  loanRecovery: number;
  noticeRecovery: number;
  otherEarnings: number;
  otherDeductions: number;
  taxAmount: number;
  grossPayable: number;
  totalDeductions: number;
  netPayable: number;
  breakdown: BreakdownLine[];
}

const ALLOWED: Record<FullFinalStatus, FullFinalStatus[]> = {
  DRAFT: ['CALCULATED', 'CANCELED'],
  CALCULATED: ['APPROVED', 'CANCELED', 'DRAFT'],
  APPROVED: ['PROCESSED', 'CANCELED'],
  PROCESSED: [],
  CANCELED: [],
};

export class InvalidTransitionError extends Error {
  constructor(from: FullFinalStatus, to: FullFinalStatus) {
    super(`Invalid F&F status transition: ${from} → ${to}`);
    this.name = 'InvalidTransitionError';
  }
}

const round2 = (n: number) => Math.round(n * 100) / 100;

function monthsBetween(from: Date, to: Date): number {
  const years = to.getFullYear() - from.getFullYear();
  const months = to.getMonth() - from.getMonth();
  const dayFrac = (to.getDate() - from.getDate()) / 30;
  return Math.max(0, years * 12 + months + dayFrac);
}

/**
 * UAE end-of-service benefit (EOSB) — per Federal Law No 33 of 2021.
 * <5 years service: 21 days basic per year.
 * >=5 years service: 21 days basic for first 5 years, 30 days basic per year beyond.
 * Capped at 2 years' basic salary.
 */
function eosbUAE(basicSalary: number, serviceMonths: number): number {
  const dailyBasic = basicSalary / 30;
  const years = serviceMonths / 12;
  let days = 0;
  if (years <= 0) return 0;
  if (years <= 5) {
    days = 21 * years;
  } else {
    days = 21 * 5 + 30 * (years - 5);
  }
  const eosb = dailyBasic * days;
  const cap = basicSalary * 24;
  return Math.min(eosb, cap);
}

/**
 * KSA end-of-service per Labour Law Article 84.
 * <5 years: 1/2 month basic per year.
 * >=5 years: full month basic per year, with 1/2-month rate applied to first 5 years.
 */
function eosbKSA(basicSalary: number, serviceMonths: number): number {
  const years = serviceMonths / 12;
  if (years <= 0) return 0;
  if (years <= 5) {
    return basicSalary * (years * 0.5);
  }
  return basicSalary * (5 * 0.5 + (years - 5) * 1.0);
}

/**
 * India gratuity per Payment of Gratuity Act 1972: only payable after 5 years of
 * continuous service, computed as (15/26) × last drawn basic × years of service,
 * capped at INR 20,00,000.
 */
function gratuityIndia(basicSalary: number, serviceMonths: number): number {
  const years = serviceMonths / 12;
  if (years < 5) return 0;
  const yearsForCalc = Math.round(years);
  const gratuity = (15 / 26) * basicSalary * yearsForCalc;
  return Math.min(gratuity, 2_000_000);
}

function jurisdictionGratuity(
  code: string,
  basicSalary: number,
  serviceMonths: number
): {
  amount: number;
  basis: string;
} {
  const c = code.toUpperCase();
  if (c === 'AE')
    return { amount: eosbUAE(basicSalary, serviceMonths), basis: 'UAE EOSB (Federal Law 33/2021)' };
  if (c === 'SA')
    return { amount: eosbKSA(basicSalary, serviceMonths), basis: 'KSA EOSB (Labour Law Art. 84)' };
  if (c === 'IN')
    return { amount: gratuityIndia(basicSalary, serviceMonths), basis: 'India Gratuity Act 1972' };
  // Default: 21 days basic per year, no cap (sensible neutral)
  const dailyBasic = basicSalary / 30;
  const years = serviceMonths / 12;
  return { amount: dailyBasic * 21 * years, basis: 'Default 21-day-per-year basis' };
}

export class FullFinalService extends BaseService {
  constructor() {
    super('FullFinalService');
  }

  canTransition(from: FullFinalStatus, to: FullFinalStatus): boolean {
    return (ALLOWED[from] ?? []).includes(to);
  }

  assertTransition(from: FullFinalStatus, to: FullFinalStatus) {
    if (!this.canTransition(from, to)) throw new InvalidTransitionError(from, to);
  }

  /**
   * Pure calculation. Does not persist. Frontend uses this for the F&F preview;
   * backend uses it as the canonical computation invoked by `recordAndCalculate`.
   */
  calculate(input: CalculationInput): CalculationResult {
    const serviceMonths = Math.floor(monthsBetween(input.joiningDate, input.lastWorkingDay));
    const dailyBasic = input.basicSalary / 30;

    const lwd = input.lastWorkingDay;
    const daysWorkedThisMonth = lwd.getDate();
    const unpaidSalary = round2(dailyBasic * daysWorkedThisMonth);

    const leaveEncashment = round2((input.earnedLeaveBalanceDays ?? 0) * dailyBasic);

    const grat = jurisdictionGratuity(input.countryCode, input.basicSalary, serviceMonths);
    const gratuity = round2(grat.amount);

    const bonusBase = input.proRataBonusBase ?? 0;
    const monthsServedThisYear = lwd.getMonth() + 1 + lwd.getDate() / 30;
    const bonusProRata = round2((bonusBase * monthsServedThisYear) / 12);

    const loanRecovery = round2(input.outstandingLoanAmount ?? 0);
    const noticeRecovery = round2(((input.unservedNoticeDays ?? 0) * input.basicSalary) / 30);

    const otherEarnings = round2(input.otherEarnings ?? 0);
    const otherDeductions = round2(input.otherDeductions ?? 0);

    const grossEarnings = unpaidSalary + leaveEncashment + gratuity + bonusProRata + otherEarnings;

    // Naïve flat F&F tax: jurisdictional rule registry can refine.
    const taxableBase = grossEarnings - gratuity; // gratuity typically tax-exempt
    const flatRate = input.countryCode.toUpperCase() === 'IN' ? 0.1 : 0;
    const taxAmount = round2(taxableBase * flatRate);

    const totalDeductions = round2(loanRecovery + noticeRecovery + otherDeductions + taxAmount);
    const netPayable = round2(grossEarnings - totalDeductions);

    const breakdown: BreakdownLine[] = [
      {
        code: 'UNPAID_SAL',
        label: 'Unpaid salary (pro-rata to LWD)',
        kind: 'earning',
        amount: unpaidSalary,
        source: 'daily_basic * days_worked',
      },
      {
        code: 'LEAVE_ENC',
        label: 'Leave encashment',
        kind: 'earning',
        amount: leaveEncashment,
        source: 'leave_balance_days * daily_basic',
      },
      {
        code: 'GRATUITY',
        label: `Gratuity (${grat.basis})`,
        kind: 'earning',
        amount: gratuity,
        source: grat.basis,
      },
      {
        code: 'BONUS_PR',
        label: 'Bonus pro-rata',
        kind: 'earning',
        amount: bonusProRata,
        source: 'bonus_base * months_served / 12',
      },
      {
        code: 'OTHER_EARN',
        label: 'Other earnings',
        kind: 'earning',
        amount: otherEarnings,
        source: 'input',
      },
      {
        code: 'LOAN',
        label: 'Loan recovery',
        kind: 'deduction',
        amount: loanRecovery,
        source: 'outstanding_loan_amount',
      },
      {
        code: 'NOTICE_REC',
        label: 'Notice period recovery',
        kind: 'deduction',
        amount: noticeRecovery,
        source: 'unserved_notice_days * daily_basic',
      },
      {
        code: 'OTHER_DEDN',
        label: 'Other deductions',
        kind: 'deduction',
        amount: otherDeductions,
        source: 'input',
      },
      {
        code: 'TAX',
        label: 'Tax on F&F',
        kind: 'tax',
        amount: taxAmount,
        source: `flat_rate(${flatRate}) * (gross - gratuity)`,
      },
    ];

    return {
      countryCode: input.countryCode,
      currency: input.currency ?? 'USD',
      serviceMonths,
      unpaidSalary,
      leaveEncashment,
      gratuity,
      bonusProRata,
      loanRecovery,
      noticeRecovery,
      otherEarnings,
      otherDeductions,
      taxAmount,
      grossPayable: round2(grossEarnings),
      totalDeductions,
      netPayable,
      breakdown,
    };
  }

  async recordAndCalculate(input: CalculationInput, actorId: string) {
    const calc = this.calculate(input);
    const record = await (prisma as any).fullFinalSettlement.create({
      data: {
        tenantId: input.tenantId,
        employeeId: input.employeeId,
        exitRequestId: input.exitRequestId ?? null,
        countryCode: input.countryCode,
        lastWorkingDay: input.lastWorkingDay,
        joiningDate: input.joiningDate,
        serviceMonths: calc.serviceMonths,
        basicSalary: input.basicSalary,
        grossSalary: input.grossSalary,
        currency: calc.currency,
        unpaidSalary: calc.unpaidSalary,
        leaveEncashment: calc.leaveEncashment,
        gratuity: calc.gratuity,
        bonusProRata: calc.bonusProRata,
        loanRecovery: calc.loanRecovery,
        noticeRecovery: calc.noticeRecovery,
        otherEarnings: calc.otherEarnings,
        otherDeductions: calc.otherDeductions,
        taxAmount: calc.taxAmount,
        grossPayable: calc.grossPayable,
        totalDeductions: calc.totalDeductions,
        netPayable: calc.netPayable,
        breakdown: calc.breakdown as object,
        status: 'CALCULATED',
        calculatedAt: new Date(),
        createdBy: actorId,
      },
    });
    return { record, calculation: calc };
  }

  async approve(id: string, tenantId: string, actorId: string) {
    const existing = await (prisma as any).fullFinalSettlement.findFirst({
      where: { id, tenantId, isDeleted: false },
    });
    if (!existing) return null;
    this.assertTransition(existing.status as FullFinalStatus, 'APPROVED');
    return (prisma as any).fullFinalSettlement.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedById: actorId,
        approvedAt: new Date(),
        updatedBy: actorId,
      },
    });
  }

  async process(id: string, tenantId: string, actorId: string, payrollRunId?: string) {
    const existing = await (prisma as any).fullFinalSettlement.findFirst({
      where: { id, tenantId, isDeleted: false },
    });
    if (!existing) return null;
    this.assertTransition(existing.status as FullFinalStatus, 'PROCESSED');
    return (prisma as any).fullFinalSettlement.update({
      where: { id },
      data: {
        status: 'PROCESSED',
        processedAt: new Date(),
        payrollRunId: payrollRunId ?? null,
        updatedBy: actorId,
      },
    });
  }

  async getById(id: string, tenantId: string) {
    return (prisma as any).fullFinalSettlement.findFirst({
      where: { id, tenantId, isDeleted: false },
    });
  }

  async list(params: {
    tenantId: string;
    employeeId?: string;
    status?: FullFinalStatus;
    countryCode?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 20, 100);
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { tenantId: params.tenantId, isDeleted: false };
    if (params.employeeId) where.employeeId = params.employeeId;
    if (params.status) where.status = params.status;
    if (params.countryCode) where.countryCode = params.countryCode.toUpperCase();
    const [items, total] = await Promise.all([
      (prisma as any).fullFinalSettlement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      (prisma as any).fullFinalSettlement.count({ where }),
    ]);
    return { items, total, page, pageSize: limit, hasNextPage: skip + items.length < total };
  }
}

export const fullFinalService = new FullFinalService();
