/**
 * EPIC-15 Bahrain — LMRA work-permit renewal calendar + SIO
 * contribution due-date evaluator + IGA wage-protection check.
 *
 * Closes the audit gaps for EPIC-15:
 *   - "LMRA work-permit renewal calendar"
 *   - "SIO contribution due-date evaluator"
 *   - "IGA wage protection check"
 *
 * Three independent pure evaluators, each producing a typed verdict
 * with bilingual reason strings.
 *
 * Rule baselines (current 2026 LMRA / SIO / IGA):
 *   - LMRA work permits: valid for 2 years; renewal lodged from
 *     90 days before expiry; after expiry a 30-day grace at
 *     BHD 5/day, beyond that BHD 10/day, beyond 120 days
 *     mandatory exit + ban risk.
 *   - SIO monthly contribution: filed by day 15 of the *following*
 *     month, settled by the last day of the following month. Bahrain
 *     weekend = Fri + Sat; deadline shifts to Sun if it falls on
 *     either day.
 *   - IGA wage-protection: salary must be credited to the employee's
 *     bank account by day 10 of the following month. Overdue rows
 *     incur escalating severity at day +3 (WARN) and day +10 (BLOCK).
 */

// ============================================================================
// LMRA work-permit calendar
// ============================================================================

export type LmraPermitStatus =
  | 'ACTIVE'
  | 'RENEWAL_WINDOW_OPEN'
  | 'DUE_SOON'
  | 'OVERDUE'
  | 'PENALTY_HIGH'
  | 'MANDATORY_EXIT';

export interface LmraPermitInput {
  permitId: string;
  employeeId: string;
  expiresAt: Date;
  renewalLodged?: boolean;
}

export interface LmraPermitCalendarInput {
  permits: LmraPermitInput[];
  asOf?: Date;
  renewalWindowDays?: number;
  dueSoonWindowDays?: number;
  lowBandMaxDays?: number;
  highBandMaxDays?: number;
  feePerDayBhd?: { low: number; high: number };
}

export interface LmraPermitRow {
  permitId: string;
  employeeId: string;
  expiresAt: Date;
  status: LmraPermitStatus;
  daysToExpiry: number;
  daysOverdue: number;
  estimatedPenaltyBhd: number;
  reason: string;
  reasonAr: string;
}

export interface LmraPermitReport {
  rows: LmraPermitRow[];
  totals: {
    active: number;
    renewalWindowOpen: number;
    dueSoon: number;
    overdue: number;
    penaltyHigh: number;
    mandatoryExit: number;
    totalEstimatedPenaltyBhd: number;
  };
  mandatoryExitTriggered: boolean;
}

const LMRA_DEFAULTS = {
  renewalWindowDays: 90,
  dueSoonWindowDays: 30,
  lowBandMaxDays: 30,
  highBandMaxDays: 120,
  feePerDayBhd: { low: 5, high: 10 },
};

function diffDays(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / 86400000);
}

export function evaluateLmraPermitCalendar(input: LmraPermitCalendarInput): LmraPermitReport {
  const asOf = input.asOf ?? new Date();
  const renewalWindow = input.renewalWindowDays ?? LMRA_DEFAULTS.renewalWindowDays;
  const dueSoon = input.dueSoonWindowDays ?? LMRA_DEFAULTS.dueSoonWindowDays;
  const low = input.lowBandMaxDays ?? LMRA_DEFAULTS.lowBandMaxDays;
  const high = input.highBandMaxDays ?? LMRA_DEFAULTS.highBandMaxDays;
  const fees = input.feePerDayBhd ?? LMRA_DEFAULTS.feePerDayBhd;

  const rows: LmraPermitRow[] = input.permits.map((p) => {
    const daysToExpiry = diffDays(p.expiresAt, asOf);
    const daysOverdue = -daysToExpiry;
    let status: LmraPermitStatus;
    let estimatedPenaltyBhd = 0;
    let reason: string;
    let reasonAr: string;

    if (p.renewalLodged) {
      status = 'ACTIVE';
      reason = `LMRA renewal lodged (permit expires ${p.expiresAt.toISOString().slice(0, 10)})`;
      reasonAr = `تم تقديم طلب تجديد سوق العمل (ينتهي ${p.expiresAt.toISOString().slice(0, 10)})`;
    } else if (daysToExpiry > renewalWindow) {
      status = 'ACTIVE';
      reason = `LMRA permit valid — renewal window opens in ${daysToExpiry - renewalWindow}d`;
      reasonAr = `تصريح سوق العمل ساري — نافذة التجديد خلال ${daysToExpiry - renewalWindow} يوم`;
    } else if (daysToExpiry > dueSoon) {
      status = 'RENEWAL_WINDOW_OPEN';
      reason = `LMRA renewal window open — ${daysToExpiry}d to expiry`;
      reasonAr = `نافذة تجديد سوق العمل مفتوحة — ${daysToExpiry} يوم حتى الانتهاء`;
    } else if (daysToExpiry >= 0) {
      status = 'DUE_SOON';
      reason = `LMRA permit expires in ${daysToExpiry}d`;
      reasonAr = `تصريح سوق العمل ينتهي خلال ${daysToExpiry} يوم`;
    } else if (daysOverdue <= low) {
      status = 'OVERDUE';
      estimatedPenaltyBhd = daysOverdue * fees.low;
      reason = `Permit expired ${daysOverdue}d ago — BHD ${fees.low}/day accrued`;
      reasonAr = `انتهى التصريح منذ ${daysOverdue} يوم — غرامة ${fees.low} دينار يومياً`;
    } else if (daysOverdue <= high) {
      status = 'PENALTY_HIGH';
      estimatedPenaltyBhd = low * fees.low + (daysOverdue - low) * fees.high;
      reason = `Permit expired ${daysOverdue}d ago — BHD ${fees.high}/day penalty`;
      reasonAr = `انتهى التصريح منذ ${daysOverdue} يوم — غرامة ${fees.high} دينار يومياً`;
    } else {
      status = 'MANDATORY_EXIT';
      estimatedPenaltyBhd = low * fees.low + (high - low) * fees.high;
      reason = `Permit expired ${daysOverdue}d ago — mandatory exit triggered`;
      reasonAr = `انتهى التصريح منذ ${daysOverdue} يوم — مغادرة إجبارية`;
    }
    return {
      permitId: p.permitId,
      employeeId: p.employeeId,
      expiresAt: p.expiresAt,
      status,
      daysToExpiry,
      daysOverdue: daysOverdue > 0 ? daysOverdue : 0,
      estimatedPenaltyBhd: Math.max(0, Math.round(estimatedPenaltyBhd * 1000) / 1000),
      reason,
      reasonAr,
    };
  });

  const totals = {
    active: rows.filter((r) => r.status === 'ACTIVE').length,
    renewalWindowOpen: rows.filter((r) => r.status === 'RENEWAL_WINDOW_OPEN').length,
    dueSoon: rows.filter((r) => r.status === 'DUE_SOON').length,
    overdue: rows.filter((r) => r.status === 'OVERDUE').length,
    penaltyHigh: rows.filter((r) => r.status === 'PENALTY_HIGH').length,
    mandatoryExit: rows.filter((r) => r.status === 'MANDATORY_EXIT').length,
    totalEstimatedPenaltyBhd:
      Math.round(rows.reduce((s, r) => s + r.estimatedPenaltyBhd, 0) * 1000) / 1000,
  };
  return { rows, totals, mandatoryExitTriggered: totals.mandatoryExit > 0 };
}

// ============================================================================
// SIO contribution due-date evaluator
// ============================================================================

export type SioObligationKind = 'WAGE_FILING' | 'CONTRIBUTION_SETTLEMENT';
export type SioObligationSeverity = 'OK' | 'DUE_SOON' | 'OVERDUE' | 'PENALTY_ACCRUING';

export interface SioObligationInput {
  /** Any day in the wage month. */
  wageMonth: Date;
  wageFiled?: boolean;
  contributionSettled?: boolean;
  asOf?: Date;
}

export interface SioObligationRow {
  kind: SioObligationKind;
  wageMonth: string;
  statutoryDeadline: Date;
  effectiveDeadline: Date;
  graceEnd: Date;
  daysToDeadline: number;
  severity: SioObligationSeverity;
  satisfied: boolean;
  reason: string;
  reasonAr: string;
}

export interface SioObligationReport {
  asOf: Date;
  rows: SioObligationRow[];
  totals: {
    open: number;
    overdue: number;
    penaltyAccruing: number;
    dueSoon: number;
  };
}

function endOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 23, 59, 59));
}

/** Bahrain weekend = Fri (5) + Sat (6) — shift to next Sun. */
function shiftPastBahrainWeekend(d: Date): Date {
  const day = d.getUTCDay();
  if (day === 5) return new Date(d.getTime() + 2 * 86400000);
  if (day === 6) return new Date(d.getTime() + 1 * 86400000);
  return d;
}

function ym(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function classifySio(
  effective: Date,
  graceEnd: Date,
  asOf: Date,
  satisfied: boolean
): SioObligationSeverity {
  if (satisfied) return 'OK';
  if (asOf.getTime() > graceEnd.getTime()) return 'PENALTY_ACCRUING';
  if (asOf.getTime() > effective.getTime()) return 'OVERDUE';
  if (diffDays(effective, asOf) <= 5) return 'DUE_SOON';
  return 'OK';
}

export function evaluateSioObligations(inputs: SioObligationInput[]): SioObligationReport {
  const asOf = inputs[0]?.asOf ?? new Date();
  const rows: SioObligationRow[] = [];
  for (const inp of inputs) {
    const wageMonthLabel = ym(inp.wageMonth);
    const following = new Date(
      Date.UTC(inp.wageMonth.getUTCFullYear(), inp.wageMonth.getUTCMonth() + 1, 1)
    );
    const wageStat = new Date(
      Date.UTC(following.getUTCFullYear(), following.getUTCMonth(), 15, 23, 59, 59)
    );
    const wageEff = shiftPastBahrainWeekend(wageStat);
    const wageGrace = new Date(wageEff.getTime() + 30 * 86400000);
    const wageSat = !!inp.wageFiled;
    rows.push({
      kind: 'WAGE_FILING',
      wageMonth: wageMonthLabel,
      statutoryDeadline: wageStat,
      effectiveDeadline: wageEff,
      graceEnd: wageGrace,
      daysToDeadline: diffDays(wageEff, asOf),
      severity: classifySio(wageEff, wageGrace, asOf, wageSat),
      satisfied: wageSat,
      reason: `SIO wage filing for ${wageMonthLabel} due ${wageEff.toISOString().slice(0, 10)}`,
      reasonAr: `إرسال أجور التأمينات لشهر ${wageMonthLabel} حتى ${wageEff.toISOString().slice(0, 10)}`,
    });

    const settleStat = endOfMonth(following);
    const settleEff = shiftPastBahrainWeekend(settleStat);
    const settleGrace = new Date(settleEff.getTime() + 30 * 86400000);
    const settleSat = !!inp.contributionSettled;
    rows.push({
      kind: 'CONTRIBUTION_SETTLEMENT',
      wageMonth: wageMonthLabel,
      statutoryDeadline: settleStat,
      effectiveDeadline: settleEff,
      graceEnd: settleGrace,
      daysToDeadline: diffDays(settleEff, asOf),
      severity: classifySio(settleEff, settleGrace, asOf, settleSat),
      satisfied: settleSat,
      reason: `SIO contribution settlement for ${wageMonthLabel} due ${settleEff.toISOString().slice(0, 10)}`,
      reasonAr: `سداد اشتراك التأمينات لشهر ${wageMonthLabel} حتى ${settleEff.toISOString().slice(0, 10)}`,
    });
  }
  return {
    asOf,
    rows,
    totals: {
      open: rows.filter((r) => !r.satisfied).length,
      overdue: rows.filter((r) => r.severity === 'OVERDUE').length,
      penaltyAccruing: rows.filter((r) => r.severity === 'PENALTY_ACCRUING').length,
      dueSoon: rows.filter((r) => r.severity === 'DUE_SOON').length,
    },
  };
}

// ============================================================================
// IGA wage-protection check
// ============================================================================

export type IgaWageStatus = 'OK' | 'NOT_YET_DUE' | 'WARN' | 'BLOCK' | 'MISSING_CREDIT';

export interface IgaWageRow {
  employeeId: string;
  wageMonth: Date;
  /** When the salary actually landed in the employee's account. Omit when missing. */
  creditedAt?: Date;
  expectedAmountBhd: number;
  /** What actually got credited; defaults to 0 when undefined. */
  creditedAmountBhd?: number;
}

export interface IgaWageInput {
  rows: IgaWageRow[];
  asOf?: Date;
  /** Day-of-following-month by which salary must be credited. Default 10. */
  dueDayOfMonth?: number;
  /** Warn at +days_overdue, default 3. */
  warnAfterDays?: number;
  /** Block at +days_overdue, default 10. */
  blockAfterDays?: number;
  /** Acceptable shortfall percent (e.g. 1 BHD rounding noise). Default 0.5%. */
  shortfallTolerancePct?: number;
}

export interface IgaWageVerdictRow {
  employeeId: string;
  wageMonth: string;
  dueDate: Date;
  daysOverdue: number;
  status: IgaWageStatus;
  shortfallBhd: number;
  reason: string;
  reasonAr: string;
}

export interface IgaWageReport {
  rows: IgaWageVerdictRow[];
  totals: {
    ok: number;
    warn: number;
    block: number;
    missingCredit: number;
    totalShortfallBhd: number;
  };
  /** Boolean roll-up — any BLOCK or MISSING row triggers WPS escalation. */
  escalate: boolean;
}

export function evaluateIgaWageProtection(input: IgaWageInput): IgaWageReport {
  const asOf = input.asOf ?? new Date();
  const dueDay = input.dueDayOfMonth ?? 10;
  const warnAfter = input.warnAfterDays ?? 3;
  const blockAfter = input.blockAfterDays ?? 10;
  const shortfallTol = input.shortfallTolerancePct ?? 0.5;

  const rows: IgaWageVerdictRow[] = input.rows.map((row) => {
    const followingMonth = new Date(
      Date.UTC(row.wageMonth.getUTCFullYear(), row.wageMonth.getUTCMonth() + 1, 1)
    );
    const dueDate = shiftPastBahrainWeekend(
      new Date(
        Date.UTC(followingMonth.getUTCFullYear(), followingMonth.getUTCMonth(), dueDay, 23, 59, 59)
      )
    );
    const credited = row.creditedAmountBhd ?? 0;
    const shortfall = Math.max(0, row.expectedAmountBhd - credited);
    const shortfallPct = row.expectedAmountBhd > 0 ? (shortfall / row.expectedAmountBhd) * 100 : 0;
    const daysOverdue =
      row.creditedAt && row.creditedAt <= dueDate ? 0 : Math.max(0, diffDays(asOf, dueDate));

    let status: IgaWageStatus;
    let reason: string;
    let reasonAr: string;
    const wageMonthLabel = ym(row.wageMonth);

    if (!row.creditedAt && asOf < dueDate) {
      status = 'NOT_YET_DUE';
      reason = `Wage credit not yet due for ${wageMonthLabel} (deadline ${dueDate.toISOString().slice(0, 10)})`;
      reasonAr = `استحقاق الأجر لشهر ${wageMonthLabel} لم يحن بعد (${dueDate.toISOString().slice(0, 10)})`;
    } else if (!row.creditedAt) {
      status = 'MISSING_CREDIT';
      reason = `No wage credit recorded for ${wageMonthLabel} (overdue ${daysOverdue}d)`;
      reasonAr = `لا يوجد تسجيل لتحويل الأجور لشهر ${wageMonthLabel} (متأخر ${daysOverdue} يوم)`;
    } else if (row.creditedAt > dueDate && diffDays(asOf, dueDate) > blockAfter) {
      status = 'BLOCK';
      reason = `Wage credit ${daysOverdue}d past deadline — WPS block`;
      reasonAr = `تحويل الأجر متأخر ${daysOverdue} يوم — حظر حماية الأجور`;
    } else if (row.creditedAt > dueDate && diffDays(asOf, dueDate) > warnAfter) {
      status = 'WARN';
      reason = `Wage credit ${daysOverdue}d past deadline`;
      reasonAr = `تحويل الأجر متأخر ${daysOverdue} يوم`;
    } else if (shortfallPct > shortfallTol) {
      status = 'WARN';
      reason = `Shortfall ${shortfall.toFixed(3)} BHD (${shortfallPct.toFixed(2)}%) exceeds tolerance`;
      reasonAr = `نقص ${shortfall.toFixed(3)} دينار (${shortfallPct.toFixed(2)}%) يتجاوز الحد المسموح`;
    } else {
      status = 'OK';
      reason = `Wage credited on time for ${wageMonthLabel}`;
      reasonAr = `تم تحويل الأجر في موعده لشهر ${wageMonthLabel}`;
    }

    return {
      employeeId: row.employeeId,
      wageMonth: wageMonthLabel,
      dueDate,
      daysOverdue,
      status,
      shortfallBhd: Math.round(shortfall * 1000) / 1000,
      reason,
      reasonAr,
    };
  });

  const totals = {
    ok: rows.filter((r) => r.status === 'OK' || r.status === 'NOT_YET_DUE').length,
    warn: rows.filter((r) => r.status === 'WARN').length,
    block: rows.filter((r) => r.status === 'BLOCK').length,
    missingCredit: rows.filter((r) => r.status === 'MISSING_CREDIT').length,
    totalShortfallBhd: Math.round(rows.reduce((s, r) => s + r.shortfallBhd, 0) * 1000) / 1000,
  };
  return {
    rows,
    totals,
    escalate: totals.block + totals.missingCredit > 0,
  };
}
