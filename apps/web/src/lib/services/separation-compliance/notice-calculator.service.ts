/**
 * EPIC-27 notice period calculator with buyout valuation.
 *
 * Closes the audit gap "no notice calculator with buyout". The
 * SeparationCaseService.setNoticeServed already stores
 * (noticeServedDays, noticeBuyout, noticeBuyoutAmount), but
 * provides no calculator — the buyout amount is taken from caller
 * input verbatim, with no sanity check.
 *
 * This service computes the buyout amount the GCC labour authority
 * would recognise, given:
 *   - the employee's basic-salary (and optional fixed allowances
 *     that count toward the notice computation per country),
 *   - the required notice days from the labour-law / contract,
 *   - the days actually served (or to be served),
 *   - the country (rule-pack override for daily basis / allowance
 *     treatment).
 *
 * Two scenarios:
 *
 *   computeBuyoutForUnservedDays(input) — employer terminates and
 *   wants to "buy out" the unserved portion of the notice. The
 *   amount is paid TO the employee.
 *
 *   computeRecoveryForShortNotice(input) — employee resigns and
 *   serves less than the required notice. The amount is paid BY
 *   the employee (recovered from the final settlement, capped by
 *   the labour-law allowed deduction).
 *
 * Both return a typed verdict with a justifiable formula string and
 * bilingual breakdown that the separation case can persist into
 * SeparationCase.calculationDetails.
 *
 * Country rule pack key: ('SEPARATION', 'NOTICE_BUYOUT_FORMULA', at)
 * value shape = NoticeBuyoutFormula override (any subset of fields
 * overrides DEFAULT_BUYOUT_FORMULA).
 */

import { resolveRuleObject } from '@/lib/services/gcc-rule-library/rule-value.helper';

export interface NoticeBuyoutFormula {
  /** Divisor used to convert monthly salary → daily salary. */
  daysPerMonth: number;
  /** Include housingAllowance + transportAllowance in the daily basis? */
  includeFixedAllowances: boolean;
  /** Maximum deduction (as a fraction of monthly basic) when recovering from employee. */
  maxDeductionPerMonthPct: number;
}

export const DEFAULT_BUYOUT_FORMULA: NoticeBuyoutFormula = {
  daysPerMonth: 30,
  includeFixedAllowances: false,
  maxDeductionPerMonthPct: 0.5, // standard GCC cap
};

export interface SalaryComponents {
  basicSalary: number;
  housingAllowance?: number;
  transportAllowance?: number;
  currency: string;
}

export interface BuyoutInput {
  salary: SalaryComponents;
  noticeRequiredDays: number;
  noticeServedDays: number;
  countryCode?: string;
  formulaOverride?: Partial<NoticeBuyoutFormula>;
}

export interface BuyoutVerdict {
  unservedDays: number;
  dailyRate: number;
  amount: number;
  currency: string;
  formula: string;
  formulaAr: string;
  breakdown: Array<{ label: string; labelAr: string; value: number }>;
  formulaApplied: NoticeBuyoutFormula;
}

function resolveFormula(
  formula: NoticeBuyoutFormula,
  override?: Partial<NoticeBuyoutFormula>
): NoticeBuyoutFormula {
  return { ...formula, ...(override ?? {}) };
}

function dailyBasis(salary: SalaryComponents, formula: NoticeBuyoutFormula): number {
  const fixed = formula.includeFixedAllowances
    ? (salary.housingAllowance ?? 0) + (salary.transportAllowance ?? 0)
    : 0;
  const monthly = salary.basicSalary + fixed;
  return monthly / formula.daysPerMonth;
}

/**
 * Pure helper for the employer-buyout direction (paid TO employee).
 */
export function computeBuyoutForUnservedDays(
  input: BuyoutInput,
  formula: NoticeBuyoutFormula = DEFAULT_BUYOUT_FORMULA
): BuyoutVerdict {
  const fApplied = resolveFormula(formula, input.formulaOverride);
  const unservedDays = Math.max(0, input.noticeRequiredDays - input.noticeServedDays);
  const dailyRate = dailyBasis(input.salary, fApplied);
  const amount = Math.round(unservedDays * dailyRate * 100) / 100;
  return {
    unservedDays,
    dailyRate: Math.round(dailyRate * 100) / 100,
    amount,
    currency: input.salary.currency,
    formula: `${unservedDays} unserved days × ${input.salary.currency} ${dailyRate.toFixed(2)}/day = ${input.salary.currency} ${amount.toFixed(2)}`,
    formulaAr: `${unservedDays} يوم غير مخدوم × ${input.salary.currency} ${dailyRate.toFixed(2)}/يوم = ${input.salary.currency} ${amount.toFixed(2)}`,
    breakdown: [
      {
        label: 'Notice required (days)',
        labelAr: 'الإشعار المطلوب (أيام)',
        value: input.noticeRequiredDays,
      },
      {
        label: 'Notice served (days)',
        labelAr: 'الإشعار المؤدى (أيام)',
        value: input.noticeServedDays,
      },
      { label: 'Unserved (days)', labelAr: 'غير مخدوم (أيام)', value: unservedDays },
      {
        label: 'Daily rate',
        labelAr: 'الأجر اليومي',
        value: Math.round(dailyRate * 100) / 100,
      },
      { label: 'Buyout amount', labelAr: 'مبلغ الإخلاء', value: amount },
    ],
    formulaApplied: fApplied,
  };
}

/**
 * Pure helper for the employee-resignation recovery direction
 * (paid BY employee, capped per maxDeductionPerMonthPct).
 */
export function computeRecoveryForShortNotice(
  input: BuyoutInput,
  formula: NoticeBuyoutFormula = DEFAULT_BUYOUT_FORMULA
): BuyoutVerdict & { cappedByLaw: boolean; uncappedAmount: number } {
  const v = computeBuyoutForUnservedDays(input, formula);
  const fApplied = v.formulaApplied;
  const cap = Math.round(input.salary.basicSalary * fApplied.maxDeductionPerMonthPct * 100) / 100;
  const cappedByLaw = v.amount > cap;
  const finalAmount = cappedByLaw ? cap : v.amount;
  return {
    ...v,
    amount: finalAmount,
    cappedByLaw,
    uncappedAmount: v.amount,
    formula: cappedByLaw
      ? `${v.formula} → capped at ${fApplied.maxDeductionPerMonthPct * 100}% of monthly basic = ${input.salary.currency} ${finalAmount.toFixed(2)}`
      : v.formula,
    formulaAr: cappedByLaw
      ? `${v.formulaAr} → محدد بـ ${fApplied.maxDeductionPerMonthPct * 100}٪ من الأساسي الشهري = ${input.salary.currency} ${finalAmount.toFixed(2)}`
      : v.formulaAr,
    breakdown: cappedByLaw
      ? [
          ...v.breakdown,
          {
            label: `Legal cap (${fApplied.maxDeductionPerMonthPct * 100}% of basic)`,
            labelAr: `الحد القانوني (${fApplied.maxDeductionPerMonthPct * 100}٪ من الأساسي)`,
            value: cap,
          },
        ]
      : v.breakdown,
  };
}

export class NoticeBuyoutService {
  async resolveFormula(country?: string, at: Date = new Date()): Promise<NoticeBuyoutFormula> {
    if (!country) return DEFAULT_BUYOUT_FORMULA;
    return resolveRuleObject<NoticeBuyoutFormula>(
      country,
      'SEPARATION',
      'NOTICE_BUYOUT_FORMULA',
      DEFAULT_BUYOUT_FORMULA,
      { at, source: 'NoticeBuyoutService.resolveFormula' }
    );
  }

  async employerBuyout(input: BuyoutInput): Promise<BuyoutVerdict> {
    const formula = await this.resolveFormula(input.countryCode);
    return computeBuyoutForUnservedDays(input, formula);
  }

  async employeeRecovery(
    input: BuyoutInput
  ): Promise<BuyoutVerdict & { cappedByLaw: boolean; uncappedAmount: number }> {
    const formula = await this.resolveFormula(input.countryCode);
    return computeRecoveryForShortNotice(input, formula);
  }
}

export const noticeBuyoutService = new NoticeBuyoutService();
