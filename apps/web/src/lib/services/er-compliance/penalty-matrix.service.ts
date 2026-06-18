/**
 * EPIC-26-S02 + S09: Disciplinary penalty matrix + precedent engine.
 *
 * Closes two audit gaps:
 *
 *   S02 — "penalty matrix evaluation engine missing"
 *     A misconduct + severity + prior-history tuple maps to a recommended
 *     `ActionType`. Country can override; rule pack can override the
 *     defaults without a deploy (per EPIC-02).
 *
 *   S09 — "consistency/precedent engine missing"
 *     Given a fresh disciplinary draft, scan the tenant's prior closed
 *     actions for similar misconduct and surface outcomes that diverge
 *     from the new recommendation. Auditors look at this to defend
 *     "we treated this person the same as the last person".
 *
 * Storage strategy: the matrix is shipped as a hardcoded fallback (UAE
 * Labour Law 33/2021 §39 / KSA Labour Law §80 / similar). A country
 * pack can override any subset of rules via
 *   countryRulePackService.resolveRule(<country>, 'ER',
 *     'PENALTY_MATRIX', at)
 * — value is the same shape as `DEFAULT_PENALTY_MATRIX`.
 *
 * No schema change required.
 */

import { prisma } from '@aura/database';
import { resolveRuleValue } from '@/lib/services/gcc-rule-library/rule-value.helper';

export type ActionType =
  | 'VERBAL_WARNING'
  | 'WRITTEN_WARNING'
  | 'FINAL_WRITTEN_WARNING'
  | 'SUSPENSION'
  | 'SALARY_DEDUCTION'
  | 'DEMOTION'
  | 'TERMINATION'
  | 'TERMINATION_FOR_CAUSE';

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/**
 * Recognised misconduct categories. The penalty matrix is keyed by
 * this union — country rule-packs that override the matrix may add
 * new types, but the typed evaluator (and the Zod schema on the API
 * route) treat these as the canonical set.
 */
export type MisconductType =
  | 'THEFT'
  | 'VIOLENCE'
  | 'FRAUD'
  | 'DRUGS_ALCOHOL'
  | 'SAFETY_VIOLATION'
  | 'ABSENTEEISM'
  | 'INSUBORDINATION'
  | 'POLICY_VIOLATION';

export const MISCONDUCT_TYPES = [
  'THEFT',
  'VIOLENCE',
  'FRAUD',
  'DRUGS_ALCOHOL',
  'SAFETY_VIOLATION',
  'ABSENTEEISM',
  'INSUBORDINATION',
  'POLICY_VIOLATION',
] as const;

export interface PenaltyMatrixRule {
  /** Typed union; rule-pack overrides MAY introduce custom strings. */
  misconductType: MisconductType | (string & {});
  severity?: Severity;
  /** Minimum number of similar prior actions for this rule to apply. */
  priorCount?: number;
  recommendedAction: ActionType;
  /** Optional suspension days when recommendedAction is SUSPENSION. */
  suspensionDays?: number;
  /** Optional salary deduction (%) when recommendedAction is SALARY_DEDUCTION. */
  salaryDeductionPct?: number;
  justification: string;
  justificationAr: string;
}

/**
 * Representative DEFAULT_PENALTY_MATRIX. Ordering matters: the engine
 * picks the FIRST matching rule (most specific first). Callers can
 * override via the rule pack without changing this file.
 */
export const DEFAULT_PENALTY_MATRIX: PenaltyMatrixRule[] = [
  // GROSS MISCONDUCT — single occurrence is enough for termination.
  {
    misconductType: 'THEFT',
    severity: 'CRITICAL',
    recommendedAction: 'TERMINATION_FOR_CAUSE',
    justification: 'Theft is gross misconduct — immediate termination for cause',
    justificationAr: 'السرقة سوء سلوك جسيم - إنهاء فوري بسبب وجيه',
  },
  {
    misconductType: 'VIOLENCE',
    severity: 'CRITICAL',
    recommendedAction: 'TERMINATION_FOR_CAUSE',
    justification: 'Workplace violence — immediate termination for cause',
    justificationAr: 'العنف في مكان العمل - إنهاء فوري بسبب وجيه',
  },
  {
    misconductType: 'FRAUD',
    severity: 'CRITICAL',
    recommendedAction: 'TERMINATION_FOR_CAUSE',
    justification: 'Fraud — immediate termination for cause',
    justificationAr: 'الاحتيال - إنهاء فوري بسبب وجيه',
  },
  {
    misconductType: 'DRUGS_ALCOHOL',
    severity: 'CRITICAL',
    recommendedAction: 'TERMINATION_FOR_CAUSE',
    justification: 'Substance abuse on duty — immediate termination for cause',
    justificationAr: 'تعاطي المخدرات أثناء العمل - إنهاء فوري بسبب وجيه',
  },

  // SAFETY VIOLATION — progressive.
  {
    misconductType: 'SAFETY_VIOLATION',
    severity: 'HIGH',
    priorCount: 2,
    recommendedAction: 'TERMINATION',
    justification: 'Repeated safety violations (3+) — termination',
    justificationAr: 'انتهاكات السلامة المتكررة (3+) - إنهاء',
  },
  {
    misconductType: 'SAFETY_VIOLATION',
    severity: 'HIGH',
    priorCount: 1,
    recommendedAction: 'FINAL_WRITTEN_WARNING',
    justification: 'Second safety violation — final written warning',
    justificationAr: 'انتهاك السلامة الثاني - إنذار خطي نهائي',
  },
  {
    misconductType: 'SAFETY_VIOLATION',
    severity: 'HIGH',
    recommendedAction: 'WRITTEN_WARNING',
    justification: 'High-severity safety violation — written warning',
    justificationAr: 'انتهاك السلامة بدرجة عالية - إنذار خطي',
  },

  // ABSENTEEISM — progressive.
  {
    misconductType: 'ABSENTEEISM',
    severity: 'CRITICAL',
    recommendedAction: 'TERMINATION',
    justification: 'Job abandonment — termination',
    justificationAr: 'هجر العمل - إنهاء',
  },
  {
    misconductType: 'ABSENTEEISM',
    priorCount: 2,
    recommendedAction: 'SUSPENSION',
    suspensionDays: 3,
    justification: '3rd unauthorised absence — 3-day suspension',
    justificationAr: 'الغياب الثالث غير المصرح به - تعليق 3 أيام',
  },
  {
    misconductType: 'ABSENTEEISM',
    priorCount: 1,
    recommendedAction: 'WRITTEN_WARNING',
    justification: '2nd unauthorised absence — written warning',
    justificationAr: 'الغياب الثاني غير المصرح به - إنذار خطي',
  },
  {
    misconductType: 'ABSENTEEISM',
    recommendedAction: 'VERBAL_WARNING',
    justification: 'First unauthorised absence — verbal warning',
    justificationAr: 'الغياب الأول غير المصرح به - إنذار شفهي',
  },

  // INSUBORDINATION — progressive.
  {
    misconductType: 'INSUBORDINATION',
    priorCount: 2,
    recommendedAction: 'FINAL_WRITTEN_WARNING',
    justification: 'Repeated insubordination — final written warning',
    justificationAr: 'العصيان المتكرر - إنذار خطي نهائي',
  },
  {
    misconductType: 'INSUBORDINATION',
    priorCount: 1,
    recommendedAction: 'WRITTEN_WARNING',
    justification: 'Repeated insubordination — written warning',
    justificationAr: 'العصيان المتكرر - إنذار خطي',
  },
  {
    misconductType: 'INSUBORDINATION',
    recommendedAction: 'VERBAL_WARNING',
    justification: 'First insubordination — verbal warning',
    justificationAr: 'العصيان الأول - إنذار شفهي',
  },

  // POLICY_VIOLATION — generic catch-all.
  {
    misconductType: 'POLICY_VIOLATION',
    severity: 'HIGH',
    recommendedAction: 'WRITTEN_WARNING',
    justification: 'Policy violation (HIGH severity) — written warning',
    justificationAr: 'مخالفة السياسة (شديدة) - إنذار خطي',
  },
  {
    misconductType: 'POLICY_VIOLATION',
    severity: 'MEDIUM',
    recommendedAction: 'VERBAL_WARNING',
    justification: 'Policy violation (MEDIUM severity) — verbal warning',
    justificationAr: 'مخالفة السياسة (متوسطة) - إنذار شفهي',
  },
];

export interface PenaltyRecommendation {
  recommendedAction: ActionType;
  suspensionDays?: number;
  salaryDeductionPct?: number;
  justification: string;
  justificationAr: string;
  matchedRuleIndex: number;
  priorCount: number;
  /** True when no rule matched and the engine fell through to a default. */
  fallback: boolean;
}

const NULL_RECOMMENDATION: PenaltyRecommendation = {
  recommendedAction: 'VERBAL_WARNING',
  justification:
    'No penalty matrix rule matched — default to lowest-impact action and require maker-checker review',
  justificationAr: 'لم تتطابق أي قاعدة من مصفوفة العقوبات - الإجراء الأدنى مع المراجعة',
  matchedRuleIndex: -1,
  priorCount: 0,
  fallback: true,
};

/**
 * Pure (no IO) evaluator. The matrix is already loaded; this function
 * walks it in order and returns the first matching rule. Split out so
 * unit tests can drive it without prisma or the rule pack.
 */
export function evaluatePenaltyMatrix(
  matrix: PenaltyMatrixRule[],
  input: {
    misconductType: MisconductType | (string & {});
    severity?: Severity;
    priorCount: number;
  }
): PenaltyRecommendation {
  for (let i = 0; i < matrix.length; i++) {
    const r = matrix[i];
    if (r.misconductType !== input.misconductType) continue;
    if (r.severity && r.severity !== input.severity) continue;
    if (typeof r.priorCount === 'number' && input.priorCount < r.priorCount) continue;
    return {
      recommendedAction: r.recommendedAction,
      suspensionDays: r.suspensionDays,
      salaryDeductionPct: r.salaryDeductionPct,
      justification: r.justification,
      justificationAr: r.justificationAr,
      matchedRuleIndex: i,
      priorCount: input.priorCount,
      fallback: false,
    };
  }
  return { ...NULL_RECOMMENDATION, priorCount: input.priorCount };
}

export class PenaltyMatrixService {
  /**
   * Resolve the active penalty matrix for a country: rule pack first
   * (per EPIC-02), hardcoded default second.
   */
  async resolveMatrix(countryCode: string | undefined, at: Date = new Date()) {
    if (!countryCode) return DEFAULT_PENALTY_MATRIX;
    const override = await resolveRuleValue<PenaltyMatrixRule[] | null>(
      countryCode,
      'ER',
      'PENALTY_MATRIX',
      null,
      { at, source: 'PenaltyMatrixService.resolveMatrix' }
    );
    return Array.isArray(override) && override.length > 0 ? override : DEFAULT_PENALTY_MATRIX;
  }

  /**
   * Count the employee's prior CLOSED disciplinary actions of the same
   * misconductType. Used as the `priorCount` input to the matrix.
   */
  async countPriors(
    tenantId: string,
    employeeId: string,
    misconductType: MisconductType | (string & {}),
    asOf: Date = new Date()
  ): Promise<number> {
    const total = await (prisma as any).erDisciplinaryAction.count({
      where: {
        tenantId,
        employeeId,
        misconductType,
        status: 'ISSUED',
        effectiveFrom: { lt: asOf },
      },
    });
    return total ?? 0;
  }

  /**
   * Single-shot: given a misconduct, return the recommendation for
   * (tenant, employee, country, at). Reads the prior count and the
   * country matrix; returns the matched rule.
   */
  async recommend(
    tenantId: string,
    input: {
      employeeId: string;
      misconductType: MisconductType | (string & {});
      severity?: Severity;
      countryCode?: string;
      asOf?: Date;
    }
  ): Promise<PenaltyRecommendation> {
    const at = input.asOf ?? new Date();
    const [matrix, priorCount] = await Promise.all([
      this.resolveMatrix(input.countryCode, at),
      this.countPriors(tenantId, input.employeeId, input.misconductType, at),
    ]);
    return evaluatePenaltyMatrix(matrix, {
      misconductType: input.misconductType,
      severity: input.severity,
      priorCount,
    });
  }

  /**
   * EPIC-26-S09 precedent engine: scan prior CLOSED actions for the
   * same misconduct across the tenant and surface those whose
   * `actionType` diverges from the supplied `recommended`. Auditors
   * use this list to defend a recommendation as consistent (or to
   * justify the divergence in writing).
   */
  async findInconsistentPrecedents(
    tenantId: string,
    input: {
      misconductType: MisconductType | (string & {});
      severity?: Severity;
      recommended: ActionType;
      lookbackMonths?: number;
    }
  ): Promise<
    Array<{
      id: string;
      employeeId: string;
      actionType: ActionType;
      severity: Severity;
      effectiveFrom: Date;
      issuedBy: string | null;
    }>
  > {
    const months = input.lookbackMonths ?? 24;
    const since = new Date();
    since.setMonth(since.getMonth() - months);
    const rows = await (prisma as any).erDisciplinaryAction.findMany({
      where: {
        tenantId,
        misconductType: input.misconductType,
        ...(input.severity ? { severity: input.severity } : {}),
        status: 'ISSUED',
        effectiveFrom: { gte: since },
        NOT: { actionType: input.recommended },
      },
      orderBy: { effectiveFrom: 'desc' },
      take: 100,
      select: {
        id: true,
        employeeId: true,
        actionType: true,
        severity: true,
        effectiveFrom: true,
        issuedBy: true,
      },
    });
    return rows ?? [];
  }
}

export const penaltyMatrixService = new PenaltyMatrixService();
