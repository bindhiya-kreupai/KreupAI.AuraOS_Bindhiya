/**
 * EPIC-14 UAE — MOHRE work-permit expiry calendar.
 *
 * Closes the audit gap "MOHRE work-permit expiry calendar" for
 * EPIC-14 (UAE GPSSA / Ministry of Human Resources & Emiratisation).
 *
 * MOHRE work permits are issued for 1 or 2 years. Renewal can be
 * lodged up to 60 days BEFORE expiry; lodging late (after expiry)
 * incurs a fine starting on day 1 of overdue, escalating after 30
 * and 90 days. A 10-day "wage-protection" grace also runs for
 * already-cancelled permits.
 *
 * This pure evaluator produces a per-permit row + roll-up totals so
 * the dashboard can render an "overdue / due-soon / penalty" timeline
 * with bilingual reason text.
 *
 * Constraints used (current UAE MOHRE baseline):
 *   - Renewal window opens 60 days BEFORE expiry.
 *   - Penalty band 1 (LOW): 1-30 days overdue → AED 100/day.
 *   - Penalty band 2 (MEDIUM): 31-90 days overdue → AED 200/day.
 *   - Penalty band 3 (HIGH): 91+ days overdue → AED 500/day + risk
 *     of company-level ban.
 *
 * Numeric defaults are tenant-overridable via the input shape so
 * country-rule-pack updates can flow through without a code change.
 */

export type MohrePermitStatus =
  | 'ACTIVE'
  | 'RENEWAL_WINDOW_OPEN'
  | 'DUE_SOON'
  | 'OVERDUE'
  | 'PENALTY_MEDIUM'
  | 'PENALTY_HIGH'
  | 'COMPANY_BAN_RISK';

export interface MohrePermitInput {
  /** Internal permit / employee identifier. */
  permitId: string;
  employeeId: string;
  /** When the work-permit currently expires. */
  expiresAt: Date;
  /** Whether the renewal has been lodged already. */
  renewalLodged?: boolean;
  /** Whether the permit has been cancelled (only `wageProtectionGraceDays` of grace remain). */
  cancelled?: boolean;
}

export interface MohrePermitCalendarInput {
  permits: MohrePermitInput[];
  asOf?: Date;
  /** Optional overrides (per tenant / country-rule-pack). */
  renewalWindowDays?: number;
  dueSoonWindowDays?: number;
  lowBandMaxDays?: number;
  mediumBandMaxDays?: number;
  highBandMaxDays?: number;
  feePerDayAed?: { low: number; medium: number; high: number };
  wageProtectionGraceDays?: number;
}

export interface MohrePermitRow {
  permitId: string;
  employeeId: string;
  expiresAt: Date;
  status: MohrePermitStatus;
  daysToExpiry: number;
  daysOverdue: number;
  /** Estimated penalty AED accrued to date when overdue. */
  estimatedPenaltyAed: number;
  reason: string;
  reasonAr: string;
}

export interface MohrePermitReport {
  rows: MohrePermitRow[];
  totals: {
    active: number;
    renewalWindowOpen: number;
    dueSoon: number;
    overdue: number;
    penaltyMedium: number;
    penaltyHigh: number;
    companyBanRisk: number;
    totalEstimatedPenaltyAed: number;
  };
  /** True when at least one HIGH or COMPANY_BAN_RISK row exists. */
  companyBanRisk: boolean;
}

function diffDays(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / 86400000);
}

const DEFAULTS = {
  renewalWindowDays: 60,
  dueSoonWindowDays: 15,
  lowBandMaxDays: 30,
  mediumBandMaxDays: 90,
  highBandMaxDays: 180,
  feePerDayAed: { low: 100, medium: 200, high: 500 },
  wageProtectionGraceDays: 10,
};

export function evaluateMohrePermitCalendar(input: MohrePermitCalendarInput): MohrePermitReport {
  const asOf = input.asOf ?? new Date();
  const renewalWindow = input.renewalWindowDays ?? DEFAULTS.renewalWindowDays;
  const dueSoon = input.dueSoonWindowDays ?? DEFAULTS.dueSoonWindowDays;
  const low = input.lowBandMaxDays ?? DEFAULTS.lowBandMaxDays;
  const medium = input.mediumBandMaxDays ?? DEFAULTS.mediumBandMaxDays;
  const high = input.highBandMaxDays ?? DEFAULTS.highBandMaxDays;
  const fees = input.feePerDayAed ?? DEFAULTS.feePerDayAed;
  const cancelledGrace = input.wageProtectionGraceDays ?? DEFAULTS.wageProtectionGraceDays;

  const rows: MohrePermitRow[] = input.permits.map((p) => {
    const daysToExpiry = diffDays(p.expiresAt, asOf);
    const daysOverdue = -daysToExpiry; // positive when past expiry
    let status: MohrePermitStatus;
    let estimatedPenaltyAed = 0;
    let reason: string;
    let reasonAr: string;

    if (p.cancelled) {
      if (daysOverdue <= cancelledGrace) {
        status = 'OVERDUE';
        reason = `Permit cancelled — within ${cancelledGrace}-day wage-protection grace`;
        reasonAr = `تصريح ملغى — ضمن مهلة حماية الأجور (${cancelledGrace} يوم)`;
      } else {
        status = 'PENALTY_HIGH';
        const billableDays = daysOverdue - cancelledGrace;
        estimatedPenaltyAed = billableDays * fees.high;
        reason = `Cancelled permit ${daysOverdue}d past expiry — wage-protection grace exhausted`;
        reasonAr = `تصريح ملغى مضى عليه ${daysOverdue} يوم — انتهت مهلة حماية الأجور`;
      }
    } else if (p.renewalLodged) {
      status = 'ACTIVE';
      reason = `Renewal lodged for permit (expires ${p.expiresAt.toISOString().slice(0, 10)})`;
      reasonAr = `تم تقديم طلب تجديد التصريح (ينتهي ${p.expiresAt.toISOString().slice(0, 10)})`;
    } else if (daysToExpiry > renewalWindow) {
      status = 'ACTIVE';
      reason = `Permit valid — renewal window opens in ${daysToExpiry - renewalWindow}d`;
      reasonAr = `التصريح ساري — نافذة التجديد تفتح خلال ${daysToExpiry - renewalWindow} يوم`;
    } else if (daysToExpiry > dueSoon) {
      status = 'RENEWAL_WINDOW_OPEN';
      reason = `Renewal window open — ${daysToExpiry}d to expiry`;
      reasonAr = `نافذة التجديد مفتوحة — ${daysToExpiry} يوم حتى الانتهاء`;
    } else if (daysToExpiry >= 0) {
      status = 'DUE_SOON';
      reason = `Permit expires in ${daysToExpiry}d — lodge renewal now`;
      reasonAr = `التصريح ينتهي خلال ${daysToExpiry} يوم — قدّم طلب التجديد الآن`;
    } else if (daysOverdue <= low) {
      status = 'OVERDUE';
      estimatedPenaltyAed = daysOverdue * fees.low;
      reason = `Permit expired ${daysOverdue}d ago — AED ${fees.low}/day penalty accrued`;
      reasonAr = `انتهى التصريح منذ ${daysOverdue} يوم — غرامة ${fees.low} درهم يومياً`;
    } else if (daysOverdue <= medium) {
      status = 'PENALTY_MEDIUM';
      estimatedPenaltyAed = low * fees.low + (daysOverdue - low) * fees.medium;
      reason = `Permit expired ${daysOverdue}d ago — AED ${fees.medium}/day penalty in effect`;
      reasonAr = `انتهى التصريح منذ ${daysOverdue} يوم — غرامة ${fees.medium} درهم يومياً`;
    } else if (daysOverdue <= high) {
      status = 'PENALTY_HIGH';
      estimatedPenaltyAed =
        low * fees.low + (medium - low) * fees.medium + (daysOverdue - medium) * fees.high;
      reason = `Permit expired ${daysOverdue}d ago — AED ${fees.high}/day penalty`;
      reasonAr = `انتهى التصريح منذ ${daysOverdue} يوم — غرامة ${fees.high} درهم يومياً`;
    } else {
      status = 'COMPANY_BAN_RISK';
      estimatedPenaltyAed =
        low * fees.low + (medium - low) * fees.medium + (daysOverdue - medium) * fees.high;
      reason = `Permit expired ${daysOverdue}d ago — company-level ban risk triggered`;
      reasonAr = `انتهى التصريح منذ ${daysOverdue} يوم — خطر حظر على الشركة`;
    }

    return {
      permitId: p.permitId,
      employeeId: p.employeeId,
      expiresAt: p.expiresAt,
      status,
      daysToExpiry,
      daysOverdue: daysOverdue > 0 ? daysOverdue : 0,
      estimatedPenaltyAed: Math.max(0, Math.round(estimatedPenaltyAed)),
      reason,
      reasonAr,
    };
  });

  const totals = {
    active: rows.filter((r) => r.status === 'ACTIVE').length,
    renewalWindowOpen: rows.filter((r) => r.status === 'RENEWAL_WINDOW_OPEN').length,
    dueSoon: rows.filter((r) => r.status === 'DUE_SOON').length,
    overdue: rows.filter((r) => r.status === 'OVERDUE').length,
    penaltyMedium: rows.filter((r) => r.status === 'PENALTY_MEDIUM').length,
    penaltyHigh: rows.filter((r) => r.status === 'PENALTY_HIGH').length,
    companyBanRisk: rows.filter((r) => r.status === 'COMPANY_BAN_RISK').length,
    totalEstimatedPenaltyAed: rows.reduce((s, r) => s + r.estimatedPenaltyAed, 0),
  };
  const companyBanRisk = totals.companyBanRisk > 0;
  return { rows, totals, companyBanRisk };
}
