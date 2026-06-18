/**
 * EPIC-29 Payroll compliance — three audit-flagged 🟡 sub-stories:
 *
 *  S-MINWAGE   — minimum-wage enforcer per country (UAE, KSA, BH, QA, OM, KW)
 *  S-DEDREC    — statutory-deduction reconciliation (GOSI / WPS / pension)
 *  S-PAYSLIP   — payslip-completeness checker (mandatory fields per country)
 *
 * Pure evaluators with bilingual reason text. Defaults are sourced from
 * widely-published GCC minima as of 2026 — overridable per tenant via the
 * existing country rule pack (services not invoked here; this is a pure
 * evaluator layer the API and rule pack consume).
 */

export type ComplianceOutcome = 'PASS' | 'WARN' | 'FAIL';

export interface BilingualReason {
  code: string;
  en: string;
  ar: string;
}

// =============================================================================
// S-MINWAGE — Minimum-wage enforcer per country
// =============================================================================

/**
 * Default minima (basic monthly salary, local currency). Use the country
 * rule pack to override at runtime.
 *
 *   - UAE has no statutory monthly minimum for general expats; we apply
 *     the Emirati minima of AED 3,000–4,000 by qualification. For non-
 *     nationals we treat it as informational only (PASS but record source).
 *   - KSA Saudization-tracked minimum is SAR 4,000 for nationals to count
 *     in Nitaqat (2024 reform).
 *   - Bahrain has BHD 350 for Bahrainis (Tamkeen support floor).
 *   - Qatar minimum is QAR 1,000 + housing/food allowances.
 *   - Oman has OMR 325 for nationals.
 *   - Kuwait has KWD 75 for nationals in private sector.
 */
export interface MinWagePolicy {
  countryCode: string;
  /** Local-currency monthly minimum applicable to nationals. */
  nationalMin: number;
  /** Local-currency monthly minimum applicable to non-nationals (0 = no statutory). */
  nonNationalMin: number;
  currency: string;
}

export const DEFAULT_MIN_WAGES: MinWagePolicy[] = [
  { countryCode: 'AE', nationalMin: 4000, nonNationalMin: 0, currency: 'AED' },
  { countryCode: 'SA', nationalMin: 4000, nonNationalMin: 0, currency: 'SAR' },
  { countryCode: 'BH', nationalMin: 350, nonNationalMin: 0, currency: 'BHD' },
  { countryCode: 'QA', nationalMin: 1000, nonNationalMin: 1000, currency: 'QAR' },
  { countryCode: 'OM', nationalMin: 325, nonNationalMin: 0, currency: 'OMR' },
  { countryCode: 'KW', nationalMin: 75, nonNationalMin: 0, currency: 'KWD' },
];

export interface MinWageCheckInput {
  countryCode: string;
  basicSalary: number;
  currency: string;
  isNational: boolean;
  /** Optional per-tenant override of the policy floor. */
  overridePolicy?: MinWagePolicy;
}

export interface MinWageVerdict {
  outcome: ComplianceOutcome;
  applicableMin: number;
  shortfall: number;
  policy: MinWagePolicy;
  reason: BilingualReason;
}

export function enforceMinimumWage(input: MinWageCheckInput): MinWageVerdict {
  const policy =
    input.overridePolicy ??
    DEFAULT_MIN_WAGES.find((p) => p.countryCode === input.countryCode) ??
    null;
  if (!policy) {
    return {
      outcome: 'WARN',
      applicableMin: 0,
      shortfall: 0,
      policy: {
        countryCode: input.countryCode,
        nationalMin: 0,
        nonNationalMin: 0,
        currency: input.currency,
      },
      reason: {
        code: 'MINWAGE_NO_POLICY',
        en: `No minimum-wage policy configured for country ${input.countryCode}.`,
        ar: `لا توجد سياسة حد أدنى للأجور مهيأة للدولة ${input.countryCode}.`,
      },
    };
  }
  if (input.currency !== policy.currency) {
    return {
      outcome: 'WARN',
      applicableMin: 0,
      shortfall: 0,
      policy,
      reason: {
        code: 'MINWAGE_CURRENCY_MISMATCH',
        en: `Currency ${input.currency} does not match policy currency ${policy.currency}.`,
        ar: `العملة ${input.currency} لا تتطابق مع العملة المعتمدة ${policy.currency}.`,
      },
    };
  }
  const applicableMin = input.isNational ? policy.nationalMin : policy.nonNationalMin;
  if (applicableMin === 0) {
    return {
      outcome: 'PASS',
      applicableMin: 0,
      shortfall: 0,
      policy,
      reason: {
        code: 'MINWAGE_NOT_APPLICABLE',
        en: `No statutory minimum applies in ${input.countryCode} for this group.`,
        ar: `لا يوجد حد أدنى قانوني في ${input.countryCode} لهذه الفئة.`,
      },
    };
  }
  const shortfall = Math.max(0, applicableMin - input.basicSalary);
  if (shortfall > 0) {
    return {
      outcome: 'FAIL',
      applicableMin,
      shortfall: round2(shortfall),
      policy,
      reason: {
        code: 'MINWAGE_SHORTFALL',
        en: `Basic salary ${input.basicSalary} ${input.currency} is ${shortfall} below the ${applicableMin} minimum.`,
        ar: `الراتب الأساسي ${input.basicSalary} ${input.currency} أقل بـ ${shortfall} عن الحد الأدنى ${applicableMin}.`,
      },
    };
  }
  return {
    outcome: 'PASS',
    applicableMin,
    shortfall: 0,
    policy,
    reason: {
      code: 'MINWAGE_OK',
      en: `Basic salary ${input.basicSalary} ${input.currency} meets the ${applicableMin} minimum.`,
      ar: `الراتب الأساسي ${input.basicSalary} ${input.currency} يلبي الحد الأدنى ${applicableMin}.`,
    },
  };
}

// =============================================================================
// S-DEDREC — Statutory-deduction reconciliation
// =============================================================================

export interface DeductionLine {
  code: string;
  amount: number;
}

export interface DeductionReconInput {
  payslip: DeductionLine[];
  remittance: DeductionLine[];
  /** Tolerance in absolute amount per code (default 0.01). */
  toleranceAbs?: number;
}

export interface DeductionMismatch {
  code: string;
  payslipAmount: number;
  remittanceAmount: number;
  delta: number;
  reason: BilingualReason;
}

export interface DeductionReconVerdict {
  outcome: ComplianceOutcome;
  mismatches: DeductionMismatch[];
  summary: BilingualReason;
}

export function reconcileStatutoryDeductions(input: DeductionReconInput): DeductionReconVerdict {
  const tol = input.toleranceAbs ?? 0.01;
  const map = new Map<string, { payslip?: number; remit?: number }>();
  for (const r of input.payslip) {
    const e = map.get(r.code) ?? {};
    e.payslip = (e.payslip ?? 0) + r.amount;
    map.set(r.code, e);
  }
  for (const r of input.remittance) {
    const e = map.get(r.code) ?? {};
    e.remit = (e.remit ?? 0) + r.amount;
    map.set(r.code, e);
  }
  const mismatches: DeductionMismatch[] = [];
  for (const [code, v] of map) {
    const payslip = v.payslip ?? 0;
    const remit = v.remit ?? 0;
    const delta = remit - payslip;
    if (Math.abs(delta) > tol) {
      mismatches.push({
        code,
        payslipAmount: round2(payslip),
        remittanceAmount: round2(remit),
        delta: round2(delta),
        reason: {
          code: 'DEDUCTION_MISMATCH',
          en: `Deduction "${code}" mismatch — payslip ${payslip.toFixed(2)} vs remittance ${remit.toFixed(2)} (Δ ${delta.toFixed(2)}).`,
          ar: `الخصم "${code}" غير متطابق — كشف ${payslip.toFixed(2)} مقابل تحويل ${remit.toFixed(2)} (الفارق ${delta.toFixed(2)}).`,
        },
      });
    }
  }
  const outcome: ComplianceOutcome =
    mismatches.length === 0 ? 'PASS' : mismatches.length === 1 ? 'WARN' : 'FAIL';
  const summary: BilingualReason =
    outcome === 'PASS'
      ? {
          code: 'DEDREC_OK',
          en: 'Statutory deductions reconcile between payslip and remittance.',
          ar: 'الخصومات القانونية متطابقة بين الكشف والتحويل.',
        }
      : outcome === 'WARN'
        ? {
            code: 'DEDREC_ONE_OFF',
            en: '1 deduction mismatch — investigate before posting.',
            ar: 'خصم واحد غير متطابق — يلزم التحقيق قبل الترحيل.',
          }
        : {
            code: 'DEDREC_MULTI',
            en: `${mismatches.length} deduction mismatches — block payroll close.`,
            ar: `${mismatches.length} خصومات غير متطابقة — يلزم تعليق إقفال الرواتب.`,
          };
  return { outcome, mismatches, summary };
}

// =============================================================================
// S-PAYSLIP — Payslip completeness checker
// =============================================================================

export interface PayslipFields {
  employeeId?: string;
  employeeName?: string;
  employerName?: string;
  payPeriodStart?: string;
  payPeriodEnd?: string;
  basicSalary?: number;
  allowances?: number;
  deductions?: number;
  netPay?: number;
  /** Optional country-specific: WPS reference, GOSI line, etc. */
  wpsReference?: string;
  gosiAmount?: number;
}

export interface PayslipCheckInput {
  countryCode: string;
  payslip: PayslipFields;
}

export interface PayslipVerdict {
  outcome: ComplianceOutcome;
  missingFields: string[];
  reasons: BilingualReason[];
}

const BASE_REQUIRED: Array<keyof PayslipFields> = [
  'employeeId',
  'employeeName',
  'employerName',
  'payPeriodStart',
  'payPeriodEnd',
  'basicSalary',
  'netPay',
];

const COUNTRY_REQUIRED: Record<string, Array<keyof PayslipFields>> = {
  AE: ['wpsReference'],
  SA: ['gosiAmount'],
  BH: [],
  QA: ['wpsReference'],
  OM: [],
  KW: [],
};

export function checkPayslipCompleteness(input: PayslipCheckInput): PayslipVerdict {
  const required = [...BASE_REQUIRED, ...(COUNTRY_REQUIRED[input.countryCode] ?? [])];
  const missing: string[] = [];
  for (const f of required) {
    const v = (input.payslip as any)[f];
    if (v === undefined || v === null || v === '') missing.push(f);
  }
  const reasons: BilingualReason[] = missing.map((f) => ({
    code: 'PAYSLIP_FIELD_MISSING',
    en: `Mandatory field "${f}" is missing on the payslip.`,
    ar: `الحقل الإلزامي "${f}" مفقود في كشف الراتب.`,
  }));
  if (missing.length === 0) {
    reasons.push({
      code: 'PAYSLIP_COMPLETE',
      en: 'All mandatory payslip fields are populated.',
      ar: 'جميع الحقول الإلزامية لكشف الراتب مكتملة.',
    });
  }
  const outcome: ComplianceOutcome =
    missing.length === 0 ? 'PASS' : missing.length <= 2 ? 'WARN' : 'FAIL';
  return { outcome, missingFields: missing, reasons };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
