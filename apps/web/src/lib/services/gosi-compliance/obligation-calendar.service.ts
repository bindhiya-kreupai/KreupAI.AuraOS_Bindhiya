/**
 * EPIC-13 GOSI — Obligation calendar.
 *
 * Closes the audit gap "No obligation calendar" for EPIC-13 (KSA GOSI).
 *
 * GOSI monthly contribution rules (current 2026 baseline):
 *  - Wage data must be filed by the **15th** of every Gregorian month
 *    for the *previous* month (e.g. June wages filed by July 15).
 *  - Contribution settlement is due on the **last calendar day** of
 *    the month following the wage month.
 *  - If a due date falls on a Friday or Saturday (KSA weekend), the
 *    effective deadline shifts to the next Sunday.
 *  - A grace window of 30 days after the settlement deadline applies
 *    before fines accrue.
 *
 * Pure evaluator — no IO. Bilingual reason text on every obligation
 * row so the upstream dashboard renders without translation hops.
 */

export type GosiObligationKind = 'WAGE_FILING' | 'CONTRIBUTION_SETTLEMENT';

export type GosiObligationSeverity = 'OK' | 'DUE_SOON' | 'OVERDUE' | 'PENALTY_ACCRUING';

export interface GosiObligationInput {
  /** Wage month being reported (any day in the month is fine — only year+month read). */
  wageMonth: Date;
  /** Whether the establishment has already filed wages for this month. */
  wageFiled?: boolean;
  /** Whether the contribution has been settled for this month. */
  contributionSettled?: boolean;
  /** Evaluation date — defaults to today. */
  asOf?: Date;
}

export interface GosiObligationRow {
  kind: GosiObligationKind;
  /** ISO `yyyy-mm` of the wage month the obligation belongs to. */
  wageMonth: string;
  /** Statutory deadline before weekend shift. */
  statutoryDeadline: Date;
  /** Effective deadline after weekend shift to next Sunday. */
  effectiveDeadline: Date;
  /** End of grace window (effective deadline + 30 days). */
  graceEnd: Date;
  /** Days from `asOf` to `effectiveDeadline` (negative when past). */
  daysToDeadline: number;
  severity: GosiObligationSeverity;
  /** Whether the obligation has been satisfied. */
  satisfied: boolean;
  reason: string;
  reasonAr: string;
}

export interface GosiObligationReport {
  asOf: Date;
  rows: GosiObligationRow[];
  totals: {
    open: number;
    overdue: number;
    penaltyAccruing: number;
    dueSoon: number;
  };
}

/** End-of-month helper. */
function endOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 0, 0, 0));
}

/** Shift to the next Sunday when the date falls on a KSA weekend (Fri / Sat). */
function shiftPastKsaWeekend(d: Date): Date {
  const day = d.getUTCDay(); // 0 = Sun, 5 = Fri, 6 = Sat
  if (day === 5) return new Date(d.getTime() + 2 * 86400000); // Fri → Sun
  if (day === 6) return new Date(d.getTime() + 1 * 86400000); // Sat → Sun
  return d;
}

function ym(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function diffDays(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / 86400000);
}

function classify(
  effectiveDeadline: Date,
  graceEnd: Date,
  asOf: Date,
  satisfied: boolean
): GosiObligationSeverity {
  if (satisfied) return 'OK';
  if (asOf.getTime() > graceEnd.getTime()) return 'PENALTY_ACCRUING';
  if (asOf.getTime() > effectiveDeadline.getTime()) return 'OVERDUE';
  const days = diffDays(effectiveDeadline, asOf);
  if (days <= 5) return 'DUE_SOON';
  return 'OK';
}

const MSG: Record<
  GosiObligationKind,
  { en: (m: string, d: string) => string; ar: (m: string, d: string) => string }
> = {
  WAGE_FILING: {
    en: (m, d) => `GOSI wage filing for ${m} due ${d}`,
    ar: (m, d) => `إرسال أجور التأمينات لشهر ${m} حتى ${d}`,
  },
  CONTRIBUTION_SETTLEMENT: {
    en: (m, d) => `GOSI contribution settlement for ${m} due ${d}`,
    ar: (m, d) => `سداد اشتراك التأمينات لشهر ${m} حتى ${d}`,
  },
};

export function evaluateGosiObligations(inputs: GosiObligationInput[]): GosiObligationReport {
  const asOf = inputs[0]?.asOf ?? new Date();
  const rows: GosiObligationRow[] = [];
  for (const inp of inputs) {
    const wageMonthLabel = ym(inp.wageMonth);
    // Wage filing: 15th of the month following the wage month.
    const followingMonthStart = new Date(
      Date.UTC(inp.wageMonth.getUTCFullYear(), inp.wageMonth.getUTCMonth() + 1, 1)
    );
    const wageStat = new Date(
      Date.UTC(
        followingMonthStart.getUTCFullYear(),
        followingMonthStart.getUTCMonth(),
        15,
        23,
        59,
        59
      )
    );
    const wageEff = shiftPastKsaWeekend(wageStat);
    const wageGrace = new Date(wageEff.getTime() + 30 * 86400000);
    const wageSatisfied = !!inp.wageFiled;
    const wageSeverity = classify(wageEff, wageGrace, asOf, wageSatisfied);
    const wageDeadlineLabel = wageEff.toISOString().slice(0, 10);
    rows.push({
      kind: 'WAGE_FILING',
      wageMonth: wageMonthLabel,
      statutoryDeadline: wageStat,
      effectiveDeadline: wageEff,
      graceEnd: wageGrace,
      daysToDeadline: diffDays(wageEff, asOf),
      severity: wageSeverity,
      satisfied: wageSatisfied,
      reason: MSG.WAGE_FILING.en(wageMonthLabel, wageDeadlineLabel),
      reasonAr: MSG.WAGE_FILING.ar(wageMonthLabel, wageDeadlineLabel),
    });
    // Contribution settlement: last calendar day of the month following the wage month.
    const settlementStat = endOfMonth(followingMonthStart);
    settlementStat.setUTCHours(23, 59, 59);
    const settlementEff = shiftPastKsaWeekend(settlementStat);
    const settlementGrace = new Date(settlementEff.getTime() + 30 * 86400000);
    const settlementSatisfied = !!inp.contributionSettled;
    const settlementSeverity = classify(settlementEff, settlementGrace, asOf, settlementSatisfied);
    const settlementDeadlineLabel = settlementEff.toISOString().slice(0, 10);
    rows.push({
      kind: 'CONTRIBUTION_SETTLEMENT',
      wageMonth: wageMonthLabel,
      statutoryDeadline: settlementStat,
      effectiveDeadline: settlementEff,
      graceEnd: settlementGrace,
      daysToDeadline: diffDays(settlementEff, asOf),
      severity: settlementSeverity,
      satisfied: settlementSatisfied,
      reason: MSG.CONTRIBUTION_SETTLEMENT.en(wageMonthLabel, settlementDeadlineLabel),
      reasonAr: MSG.CONTRIBUTION_SETTLEMENT.ar(wageMonthLabel, settlementDeadlineLabel),
    });
  }
  const open = rows.filter((r) => !r.satisfied).length;
  const overdue = rows.filter((r) => r.severity === 'OVERDUE').length;
  const penaltyAccruing = rows.filter((r) => r.severity === 'PENALTY_ACCRUING').length;
  const dueSoon = rows.filter((r) => r.severity === 'DUE_SOON').length;
  return {
    asOf,
    rows,
    totals: { open, overdue, penaltyAccruing, dueSoon },
  };
}
