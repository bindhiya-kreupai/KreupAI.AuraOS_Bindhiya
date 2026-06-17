/**
 * EPIC-22-S02: Benefits eligibility rule engine.
 *
 * Closes the audit's "no eligibility rule engine (S02 = 0%)" gap by
 * threading the safe-expression DSL through the catalogue's `policyJson`.
 *
 * Catalogue rows can carry an optional eligibility expression at
 * `policyJson.eligibilityExpression` (string). When present it is
 * evaluated against an `EligibilityContext` per employee; when absent
 * the engine falls back to the existing structural checks
 * (countryCode, minGrade, employment status, mandatory flag).
 *
 * The engine returns a typed verdict:
 *   {
 *     eligible: boolean,
 *     reasonCode: string,   // ELIGIBLE / NOT_IN_COUNTRY / GRADE_BELOW_MIN
 *                           // / EXPRESSION_FALSE / EXPRESSION_ERROR /
 *                           // EMPLOYMENT_INACTIVE
 *     reason: string,       // bilingual EN
 *     reasonAr: string,     // bilingual AR
 *     catalogueId: string,
 *     benefitCode: string,
 *   }
 *
 * A bulk method `evaluateAllForEmployee` checks the active catalogue
 * across all benefit codes and returns the verdicts in one pass.
 *
 * Example expression (stored as TEXT in `policyJson.eligibilityExpression`):
 *
 *   employee.tenureMonths >= 12 && employee.grade.level >= 5
 *
 * Same grammar as the red-flag and KPI engines (see expression-dsl).
 */

import { prisma } from '@aura/database';
import {
  evaluateRule,
  ExpressionParseError,
  ExpressionRuntimeError,
  type EvaluationContext,
} from '@/lib/services/expression-dsl/expression.service';

export interface EligibilityContext extends EvaluationContext {
  employee: {
    id: string;
    countryCode?: string;
    grade?: { code?: string; level?: number };
    tenureMonths?: number;
    employmentStatus?: string;
    isProbation?: boolean;
    hasDependants?: boolean;
    nationality?: string;
    /** Any other domain-specific fields callers want to expose. */
    [k: string]: unknown;
  };
}

export type EligibilityReasonCode =
  | 'ELIGIBLE'
  | 'NOT_IN_COUNTRY'
  | 'GRADE_BELOW_MIN'
  | 'EXPRESSION_FALSE'
  | 'EXPRESSION_ERROR'
  | 'EMPLOYMENT_INACTIVE'
  | 'CATALOGUE_INACTIVE';

export interface EligibilityVerdict {
  eligible: boolean;
  reasonCode: EligibilityReasonCode;
  reason: string;
  reasonAr: string;
  catalogueId: string;
  benefitCode: string;
}

const REASON_MAP: Record<EligibilityReasonCode, { en: string; ar: string }> = {
  ELIGIBLE: { en: 'Eligible', ar: 'مؤهل' },
  NOT_IN_COUNTRY: {
    en: 'Benefit is restricted to a country that does not match this employee',
    ar: 'الميزة مقيدة بدولة لا تطابق هذا الموظف',
  },
  GRADE_BELOW_MIN: {
    en: 'Employee grade is below the catalogue minimum',
    ar: 'درجة الموظف أقل من الحد الأدنى للكتالوج',
  },
  EXPRESSION_FALSE: {
    en: 'Eligibility expression evaluated to false',
    ar: 'تعبير الأهلية أعطى نتيجة سلبية',
  },
  EXPRESSION_ERROR: {
    en: 'Eligibility expression could not be evaluated',
    ar: 'تعذر تقييم تعبير الأهلية',
  },
  EMPLOYMENT_INACTIVE: {
    en: 'Employee is not in active employment',
    ar: 'الموظف ليس في عمل نشط',
  },
  CATALOGUE_INACTIVE: {
    en: 'Catalogue entry is not ACTIVE for the given date',
    ar: 'إدخال الكتالوج غير نشط للتاريخ المحدد',
  },
};

function verdict(
  code: EligibilityReasonCode,
  catalogueId: string,
  benefitCode: string
): EligibilityVerdict {
  return {
    eligible: code === 'ELIGIBLE',
    reasonCode: code,
    reason: REASON_MAP[code].en,
    reasonAr: REASON_MAP[code].ar,
    catalogueId,
    benefitCode,
  };
}

/**
 * Pure (no IO) evaluator — split out so unit tests can drive it without
 * mocking prisma. The compound `BenefitEligibilityService` wraps this in
 * a DB-driven lookup.
 */
export function evaluateEligibilityAgainstCatalogue(
  catalogue: {
    id: string;
    benefitCode: string;
    countryCode?: string | null;
    minGrade?: string | null;
    policyJson?: Record<string, unknown> | null;
    status?: string | null;
  },
  ctx: EligibilityContext,
  asOf: Date = new Date(),
  effectiveFrom?: Date | null,
  effectiveTo?: Date | null
): EligibilityVerdict {
  const benefitCode = catalogue.benefitCode;
  const catalogueId = catalogue.id;

  // 0. Catalogue status / effective dating.
  if (catalogue.status && catalogue.status !== 'ACTIVE') {
    return verdict('CATALOGUE_INACTIVE', catalogueId, benefitCode);
  }
  if (effectiveFrom && asOf < effectiveFrom) {
    return verdict('CATALOGUE_INACTIVE', catalogueId, benefitCode);
  }
  if (effectiveTo && asOf > effectiveTo) {
    return verdict('CATALOGUE_INACTIVE', catalogueId, benefitCode);
  }

  // 1. Employment status (skip when caller did not provide a status — assume active).
  const empStatus = ctx.employee.employmentStatus;
  if (empStatus && empStatus !== 'ACTIVE') {
    return verdict('EMPLOYMENT_INACTIVE', catalogueId, benefitCode);
  }

  // 2. Country gate (when the catalogue is country-bound).
  if (catalogue.countryCode && ctx.employee.countryCode !== catalogue.countryCode) {
    return verdict('NOT_IN_COUNTRY', catalogueId, benefitCode);
  }

  // 3. Minimum grade gate.
  if (catalogue.minGrade) {
    const empGradeCode = ctx.employee.grade?.code;
    const empGradeLevel = ctx.employee.grade?.level;
    // Try numeric compare via "G5" → 5 first; otherwise string compare.
    const minNum = Number(String(catalogue.minGrade).replace(/[^\d.-]/g, ''));
    if (Number.isFinite(minNum) && typeof empGradeLevel === 'number') {
      if (empGradeLevel < minNum) {
        return verdict('GRADE_BELOW_MIN', catalogueId, benefitCode);
      }
    } else if (empGradeCode && empGradeCode < catalogue.minGrade) {
      return verdict('GRADE_BELOW_MIN', catalogueId, benefitCode);
    }
  }

  // 4. Free-form DSL expression — the main S02 closure.
  const expression = (catalogue.policyJson as Record<string, unknown> | undefined)
    ?.eligibilityExpression;
  if (typeof expression === 'string' && expression.trim().length > 0) {
    let errored = false;
    let errorMsg = '';
    const result = evaluateRule(expression, ctx, (err) => {
      errored = true;
      errorMsg = err.message;
    });
    if (errored) {
      // Surface the underlying error class so callers can decide whether
      // to swallow vs. fail-closed; default policy is fail-closed.
      const code: EligibilityReasonCode = 'EXPRESSION_ERROR';
      return {
        ...verdict(code, catalogueId, benefitCode),
        reason: `${REASON_MAP[code].en}: ${errorMsg}`,
      };
    }
    if (!result) {
      return verdict('EXPRESSION_FALSE', catalogueId, benefitCode);
    }
  }

  return verdict('ELIGIBLE', catalogueId, benefitCode);
}

export class BenefitEligibilityService {
  /**
   * Evaluate eligibility for one (tenant, benefitCode, employee) tuple
   * against the catalogue entry active on `asOf`.
   *
   * Returns `null` when no catalogue row matches the code at the date —
   * caller can interpret as "no policy → no opinion".
   */
  async evaluate(
    tenantId: string,
    benefitCode: string,
    ctx: EligibilityContext,
    asOf: Date = new Date()
  ): Promise<EligibilityVerdict | null> {
    const rows = await (prisma as any).benefitCatalogue.findMany({
      where: {
        tenantId,
        benefitCode,
        status: 'ACTIVE',
        effectiveFrom: { lte: asOf },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: asOf } }],
      },
      orderBy: { effectiveFrom: 'desc' },
      take: 1,
    });
    const row = rows[0];
    if (!row) return null;
    return evaluateEligibilityAgainstCatalogue(row, ctx, asOf, row.effectiveFrom, row.effectiveTo);
  }

  /**
   * Bulk-evaluate all ACTIVE catalogue rows for the tenant against the
   * employee context. Returns one verdict per benefit code (latest
   * effective row per code wins).
   */
  async evaluateAllForEmployee(
    tenantId: string,
    ctx: EligibilityContext,
    asOf: Date = new Date(),
    filter: { countryCode?: string; benefitType?: string } = {}
  ): Promise<EligibilityVerdict[]> {
    const rows = await (prisma as any).benefitCatalogue.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        ...(filter.countryCode ? { countryCode: filter.countryCode } : {}),
        ...(filter.benefitType ? { benefitType: filter.benefitType } : {}),
        effectiveFrom: { lte: asOf },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: asOf } }],
      },
      orderBy: [{ benefitCode: 'asc' }, { effectiveFrom: 'desc' }],
    });

    // Deduplicate by benefitCode keeping the row with the latest effectiveFrom.
    const latestByCode = new Map<string, (typeof rows)[number]>();
    for (const r of rows) {
      if (!latestByCode.has(r.benefitCode)) latestByCode.set(r.benefitCode, r);
    }

    return Array.from(latestByCode.values()).map((r) =>
      evaluateEligibilityAgainstCatalogue(r, ctx, asOf, r.effectiveFrom, r.effectiveTo)
    );
  }

  /**
   * Closes EPIC-22-S07 "mandatory cover gap detection" — pairs the
   * eligibility verdict with the employee's current BenefitCoverage rows
   * and surfaces:
   *   - mandatory benefits the employee is eligible for but NOT covered
   *   - mandatory benefits the employee is covered for but no longer
   *     eligible (e.g. country transfer, grade demotion).
   */
  async findMandatoryGaps(
    tenantId: string,
    employeeId: string,
    ctx: EligibilityContext,
    asOf: Date = new Date()
  ): Promise<{
    uncovered: EligibilityVerdict[];
    coveredButIneligible: Array<EligibilityVerdict & { coverageId: string }>;
  }> {
    const mandatoryRows = await (prisma as any).benefitCatalogue.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        isMandatory: true,
        effectiveFrom: { lte: asOf },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: asOf } }],
      },
    });
    const coverages = await (prisma as any).benefitCoverage.findMany({
      where: {
        tenantId,
        employeeId,
        status: 'ACTIVE',
      },
    });
    const covered = new Map<string, { id: string }>();
    for (const c of coverages) covered.set(c.benefitCatalogueId, { id: c.id });

    const uncovered: EligibilityVerdict[] = [];
    const coveredButIneligible: Array<EligibilityVerdict & { coverageId: string }> = [];

    for (const row of mandatoryRows) {
      const v = evaluateEligibilityAgainstCatalogue(
        row,
        ctx,
        asOf,
        row.effectiveFrom,
        row.effectiveTo
      );
      const hasCoverage = covered.has(row.id);
      if (v.eligible && !hasCoverage) uncovered.push(v);
      if (!v.eligible && hasCoverage) {
        coveredButIneligible.push({ ...v, coverageId: covered.get(row.id)!.id });
      }
    }

    return { uncovered, coveredButIneligible };
  }
}

export const benefitEligibilityService = new BenefitEligibilityService();

// Re-export the DSL error classes so callers do not need a second import.
export { ExpressionParseError, ExpressionRuntimeError };
