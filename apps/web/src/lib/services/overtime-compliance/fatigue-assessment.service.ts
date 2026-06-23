/**
 * EPIC-12 fatigue rule engine — operational assessment service.
 *
 * Closes the audit gap "FatigueRule has schema only — no operational
 * service". The schema (FatigueRule) and the basic upsert/list +
 * static `breachesRule()` helper already exist in
 * `structural-extensions/index.ts`; this service threads them into
 * live operational decisions:
 *
 *  - Pre-shift assessment: given a proposed shift for an employee,
 *    compute consecutive-days, rest-hours-before, weekly-hours from
 *    the existing AttendanceRecord rows and decide whether the
 *    proposed shift breaches the active FatigueRule.
 *
 *  - Bulk roster pre-screen: same check across a list of
 *    (employeeId, proposedStart) tuples — used by the roster builder
 *    to flag unsafe assignments before they are persisted.
 *
 *  - DoA escalation hint: when a breach is found AND the requesting
 *    actor's role is below an escalation threshold, the verdict
 *    flags `requiresDoaEscalation`. Caller decides what to do.
 *
 * All verdicts carry bilingual breach reasons (en + ar).
 *
 * Country override: the rule is resolved by `country` from the
 * employee context; the FatigueRule with the matching country wins,
 * else the row with country=NULL (the global default) is used.
 */

import { prisma } from '@aura/database';
import { FatigueRuleService } from '@/lib/services/structural-extensions';

export interface FatigueAssessmentInput {
  tenantId: string;
  employeeId: string;
  /** Proposed shift start datetime — used to compute rest-hours-before. */
  proposedStart: Date;
  /** Proposed shift end datetime — used to compute weekly-hours contribution. */
  proposedEnd: Date;
  /** Optional country to resolve a country-specific rule. */
  country?: string;
  /** Optional appliesTo cohort (driver / paramedic / engineer / ALL). */
  appliesTo?: string;
  /** Role of the actor proposing the shift — drives DoA escalation hint. */
  actorRole?: string;
}

export interface FatigueAssessmentVerdict {
  breaches: boolean;
  reasons: string[];
  reasonsEn: string[];
  reasonsAr: string[];
  measured: {
    consecutiveDays: number;
    restHoursBefore: number;
    weeklyHours: number;
    proposedShiftHours: number;
  };
  ruleApplied: {
    id: string;
    ruleCode: string;
    country: string | null;
    maxConsecutiveDays: number;
    minRestHoursBetweenShifts: number;
    maxWeeklyHours: number;
  } | null;
  /** True when no ACTIVE rule was found — caller should treat as "no policy". */
  noRule: boolean;
  /** Hint: a non-supervisor actor should escalate before forcing through. */
  requiresDoaEscalation: boolean;
}

const REASON_EN: Record<string, (n: number) => string> = {
  MAX_CONSECUTIVE_DAYS: (n) => `Max consecutive days exceeded (${n})`,
  MIN_REST_HOURS: (n) => `Insufficient rest hours between shifts (min ${n})`,
  MAX_WEEKLY_HOURS: (n) => `Weekly working-hours cap exceeded (${n})`,
};
const REASON_AR: Record<string, (n: number) => string> = {
  MAX_CONSECUTIVE_DAYS: (n) => `تم تجاوز الحد الأقصى للأيام المتتالية (${n})`,
  MIN_REST_HOURS: (n) => `ساعات راحة غير كافية بين الورديات (الحد الأدنى ${n})`,
  MAX_WEEKLY_HOURS: (n) => `تم تجاوز الحد الأسبوعي لساعات العمل (${n})`,
};

/** Roles that may bypass DoA escalation. */
const SENIOR_ROLES = new Set([
  'OPERATIONS_DIRECTOR',
  'HR_DIRECTOR',
  'COO',
  'CEO',
  'OPS_MANAGER',
  'DOA_APPROVER',
]);

/**
 * Pure helper. Given an attendance history (last 8 days worth of rows)
 * and a proposed shift window, compute the inputs the rule engine needs.
 * Split out so tests don't have to mock prisma to assert the arithmetic.
 */
export function deriveHistoryMetrics(
  history: Array<{
    date: Date;
    workHours: number;
    clockOut: Date | null;
    shiftEndTime: Date | null;
  }>,
  proposedStart: Date,
  proposedEnd: Date
): {
  consecutiveDays: number;
  restHoursBefore: number;
  weeklyHours: number;
  proposedShiftHours: number;
} {
  // Sort by date ascending so we can walk backwards.
  const sorted = [...history].sort((a, b) => a.date.getTime() - b.date.getTime());

  // 1. Consecutive worked days ending the day BEFORE the proposed shift.
  const proposedDateOnly = new Date(proposedStart);
  proposedDateOnly.setHours(0, 0, 0, 0);
  let consecutiveDays = 0;
  const cursor = new Date(proposedDateOnly);
  cursor.setDate(cursor.getDate() - 1);
  for (let i = sorted.length - 1; i >= 0; i--) {
    const row = sorted[i];
    const d = new Date(row.date);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() === cursor.getTime() && row.workHours > 0) {
      consecutiveDays += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else if (d.getTime() < cursor.getTime()) {
      break;
    }
  }

  // 2. Rest hours since the last clockOut (or shiftEndTime fallback).
  const lastEnd = sorted
    .map((r) => r.clockOut ?? r.shiftEndTime)
    .filter((d): d is Date => !!d)
    .sort((a, b) => b.getTime() - a.getTime())[0];
  const restHoursBefore = lastEnd
    ? Math.max(0, (proposedStart.getTime() - lastEnd.getTime()) / (3600 * 1000))
    : 24; // no recent history → treat as well-rested.

  // 3. Weekly hours: sum within the 7 days ending at proposedStart, plus the
  //    proposed shift itself.
  const weekStart = new Date(proposedStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const weeklyWorked = sorted
    .filter(
      (r) => r.date.getTime() >= weekStart.getTime() && r.date.getTime() < proposedStart.getTime()
    )
    .reduce((acc, r) => acc + (r.workHours || 0), 0);
  const proposedShiftHours = Math.max(
    0,
    (proposedEnd.getTime() - proposedStart.getTime()) / (3600 * 1000)
  );
  const weeklyHours = weeklyWorked + proposedShiftHours;

  return {
    consecutiveDays,
    restHoursBefore: Math.round(restHoursBefore * 100) / 100,
    weeklyHours: Math.round(weeklyHours * 100) / 100,
    proposedShiftHours: Math.round(proposedShiftHours * 100) / 100,
  };
}

export class FatigueAssessmentService {
  private async resolveRule(tenantId: string, country?: string, appliesTo?: string) {
    const rows = await (prisma as any).fatigueRule.findMany({
      where: {
        tenantId,
        isActive: true,
        ...(appliesTo ? { OR: [{ appliesTo }, { appliesTo: 'ALL' }] } : {}),
      },
      orderBy: [{ country: 'desc' }], // country-specific first; null last.
    });
    if (!rows.length) return null;
    return (
      (country && rows.find((r: any) => r.country === country)) ||
      rows.find((r: any) => !r.country) ||
      rows[0]
    );
  }

  private async loadHistory(tenantId: string, employeeId: string, proposedStart: Date) {
    const since = new Date(proposedStart);
    since.setDate(since.getDate() - 8);
    return (prisma as any).attendanceRecord.findMany({
      where: {
        tenantId,
        employeeId,
        date: { gte: since, lt: proposedStart },
        isDeleted: false,
      },
      orderBy: { date: 'asc' },
      select: { date: true, workHours: true, clockOut: true, shiftEndTime: true },
    });
  }

  async assess(input: FatigueAssessmentInput): Promise<FatigueAssessmentVerdict> {
    const [rule, history] = await Promise.all([
      this.resolveRule(input.tenantId, input.country, input.appliesTo),
      this.loadHistory(input.tenantId, input.employeeId, input.proposedStart),
    ]);

    const metrics = deriveHistoryMetrics(history, input.proposedStart, input.proposedEnd);

    if (!rule) {
      return {
        breaches: false,
        reasons: [],
        reasonsEn: [],
        reasonsAr: [],
        measured: metrics,
        ruleApplied: null,
        noRule: true,
        requiresDoaEscalation: false,
      };
    }

    const ruleShape = {
      maxConsecutiveDays: rule.maxConsecutiveDays,
      minRestHoursBetweenShifts: rule.minRestHoursBetweenShifts,
      maxWeeklyHours: rule.maxWeeklyHours,
    };
    const { breaches, reasons } = FatigueRuleService.breachesRule(ruleShape, {
      consecutiveDays: metrics.consecutiveDays,
      restHoursBefore: metrics.restHoursBefore,
      weeklyHours: metrics.weeklyHours,
    });

    const reasonsEn: string[] = [];
    const reasonsAr: string[] = [];
    for (const code of reasons) {
      const [name, raw] = code.split('(');
      const num = Number((raw ?? '0').replace(')', ''));
      reasonsEn.push(REASON_EN[name]?.(num) ?? code);
      reasonsAr.push(REASON_AR[name]?.(num) ?? code);
    }

    const requiresDoaEscalation = breaches && !SENIOR_ROLES.has(input.actorRole ?? '');

    return {
      breaches,
      reasons,
      reasonsEn,
      reasonsAr,
      measured: metrics,
      ruleApplied: {
        id: rule.id,
        ruleCode: rule.ruleCode,
        country: rule.country,
        ...ruleShape,
      },
      noRule: false,
      requiresDoaEscalation,
    };
  }

  /** Bulk pre-screen for roster builders. */
  async bulkAssess(
    inputs: FatigueAssessmentInput[]
  ): Promise<Array<{ input: FatigueAssessmentInput; verdict: FatigueAssessmentVerdict }>> {
    const out: Array<{ input: FatigueAssessmentInput; verdict: FatigueAssessmentVerdict }> = [];
    for (const input of inputs) {
      const verdict = await this.assess(input);
      out.push({ input, verdict });
    }
    return out;
  }

  /**
   * Closes part of EPIC-12-S07 — comp-off mutual exclusivity check.
   *
   * Given an attempt to grant a comp-off day to an employee whose
   * existing approved OvertimeRequest already covers the same day,
   * returns a typed conflict result. The DB write itself stays in the
   * caller (overtime/leave service) so this method has no side
   * effects.
   */
  async checkCompOffMutualExclusivity(input: {
    tenantId: string;
    employeeId: string;
    compOffDate: Date;
  }): Promise<{ conflict: boolean; reason?: string; reasonAr?: string; otRequestId?: string }> {
    const day = new Date(input.compOffDate);
    day.setHours(0, 0, 0, 0);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);

    const ot = await (prisma as any).overtimeRequest?.findFirst?.({
      where: {
        tenantId: input.tenantId,
        employeeId: input.employeeId,
        date: { gte: day, lt: next },
        status: { in: ['APPROVED', 'PAID'] },
      },
      select: { id: true },
    });

    if (ot?.id) {
      return {
        conflict: true,
        reason: 'Comp-off cannot be granted on a day already paid as overtime',
        reasonAr: 'لا يمكن منح بدل الراحة في يوم تم دفعه بالفعل كعمل إضافي',
        otRequestId: ot.id,
      };
    }
    return { conflict: false };
  }
}

export const fatigueAssessmentService = new FatigueAssessmentService();
