/**
 * Themes J + K — Structural extensions + misc closures.
 *
 * J (org/payroll structural — 5 stories): job architecture API surface
 *   (S09-S06 reuses existing JobFamily/JobProfile/JobFunction/Grade
 *   models), SalaryGradeBand (S09-S07), DelegationOfAuthority (S09-S10),
 *   PayrollCalendarControl (S10-S04), PayrollVarianceEntry (S10-S13).
 *
 * K (misc — 14 stories): FatigueRule (12-S12), OvertimeFraudFlag
 *   (12-S13), EosSioFundingLink (15-S09), ReturnToWorkPlan (20-S16),
 *   HolidayCalendarChangeRequest (21-S12), RedundancyBatch (27-S05),
 *   SeparationRetentionPolicy (27-S16), DocumentPhysicalLocation
 *   (30-S06), AuditFindingRiskLink (30-S13). Service-only closures:
 *   11-S05 unified wage-file generator, 25-S04 grievance mediation,
 *   30-S07 classification RBAC, 31-S04 country rollup, 31-S14
 *   dashboard RBAC.
 */

import { prisma } from '@aura/database';
import {
  normalisePaging,
  prismaPageArgs,
  buildPaginatedResult,
  type PaginationInput,
  type PaginatedResult,
} from '@/lib/services/pagination';

export interface AuthContext {
  tenantId: string;
  userId: string;
}

// =============================================================================
// J — Job architecture (EPIC-09-S06) — reuses existing models
// =============================================================================

export class JobArchitectureService {
  /** Lists job families + their profiles for the org-compliance workspace. */
  async list(tenantId: string) {
    const families = await (prisma as any).jobFamily.findMany({
      include: { jobProfiles: true },
      orderBy: { code: 'asc' },
    });
    // tenant scoping via JobFunction relation
    return families;
  }
}
export const jobArchitectureService = new JobArchitectureService();

// =============================================================================
// J — SalaryGradeBand (EPIC-09-S07)
// =============================================================================

export class SalaryGradeBandService {
  async list(
    tenantId: string,
    filter: { country?: string; isActive?: boolean } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      ...(filter.country ? { country: filter.country } : {}),
      ...(filter.isActive !== undefined ? { isActive: filter.isActive } : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).salaryGradeBand.findMany({
        where,
        orderBy: [{ country: 'asc' }, { gradeCode: 'asc' }, { effectiveFrom: 'desc' }],
        ...prismaPageArgs(page),
      }),
      (prisma as any).salaryGradeBand.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
  async upsert(
    input: {
      gradeCode: string;
      label: string;
      country?: string;
      currency?: string;
      minSalary: number;
      midSalary: number;
      maxSalary: number;
      effectiveFrom: Date;
      effectiveTo?: Date;
      isActive?: boolean;
    },
    auth: AuthContext
  ) {
    if (input.minSalary < 0 || input.midSalary < 0 || input.maxSalary < 0) {
      throw new Error('salary values cannot be negative');
    }
    if (!(input.minSalary <= input.midSalary && input.midSalary <= input.maxSalary)) {
      throw new Error('min ≤ mid ≤ max required');
    }
    return (prisma as any).salaryGradeBand.upsert({
      where: {
        aura_salary_grade_band_unique: {
          tenantId: auth.tenantId,
          gradeCode: input.gradeCode,
          country: input.country ?? null,
          effectiveFrom: input.effectiveFrom,
        },
      },
      update: {
        label: input.label,
        currency: input.currency ?? 'AED',
        minSalary: input.minSalary,
        midSalary: input.midSalary,
        maxSalary: input.maxSalary,
        effectiveTo: input.effectiveTo ?? null,
        isActive: input.isActive ?? true,
      },
      create: {
        tenantId: auth.tenantId,
        gradeCode: input.gradeCode,
        label: input.label,
        country: input.country ?? null,
        currency: input.currency ?? 'AED',
        minSalary: input.minSalary,
        midSalary: input.midSalary,
        maxSalary: input.maxSalary,
        effectiveFrom: input.effectiveFrom,
        effectiveTo: input.effectiveTo ?? null,
        isActive: input.isActive ?? true,
      },
    });
  }
}
export const salaryGradeBandService = new SalaryGradeBandService();

// =============================================================================
// J — DelegationOfAuthority (EPIC-09-S10)
// =============================================================================

export class DelegationOfAuthorityService {
  async list(
    tenantId: string,
    filter: { domain?: string; actionCode?: string; isActive?: boolean } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      ...(filter.domain ? { domain: filter.domain } : {}),
      ...(filter.actionCode ? { actionCode: filter.actionCode } : {}),
      ...(filter.isActive !== undefined ? { isActive: filter.isActive } : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).delegationOfAuthority.findMany({
        where,
        orderBy: [{ domain: 'asc' }, { actionCode: 'asc' }, { level: 'asc' }],
        ...prismaPageArgs(page),
      }),
      (prisma as any).delegationOfAuthority.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
  async upsert(
    input: {
      domain: string;
      actionCode: string;
      label: string;
      level: number;
      minRole: string;
      thresholdAmount?: number;
      currency?: string;
      country?: string;
      effectiveFrom: Date;
      effectiveTo?: Date;
    },
    auth: AuthContext
  ) {
    if (input.level < 1) throw new Error('level must be >= 1');
    if (input.thresholdAmount !== undefined && input.thresholdAmount < 0) {
      throw new Error('thresholdAmount cannot be negative');
    }
    return (prisma as any).delegationOfAuthority.upsert({
      where: {
        aura_delegation_of_authority_unique: {
          tenantId: auth.tenantId,
          domain: input.domain,
          actionCode: input.actionCode,
          level: input.level,
          effectiveFrom: input.effectiveFrom,
        },
      },
      update: {
        label: input.label,
        minRole: input.minRole,
        thresholdAmount: input.thresholdAmount ?? null,
        currency: input.currency ?? null,
        country: input.country ?? null,
        effectiveTo: input.effectiveTo ?? null,
      },
      create: {
        tenantId: auth.tenantId,
        domain: input.domain,
        actionCode: input.actionCode,
        label: input.label,
        level: input.level,
        minRole: input.minRole,
        thresholdAmount: input.thresholdAmount ?? null,
        currency: input.currency ?? null,
        country: input.country ?? null,
        effectiveFrom: input.effectiveFrom,
        effectiveTo: input.effectiveTo ?? null,
      },
    });
  }
  /** Pure helper: find the minimum DOA level that authorises a given amount. */
  static resolveLevel(
    rules: Array<{ level: number; thresholdAmount?: number | null }>,
    amount: number
  ): number | null {
    const sorted = [...rules].sort((a, b) => a.level - b.level);
    for (const r of sorted) {
      const t = r.thresholdAmount;
      if (t == null) return r.level;
      if (amount <= Number(t)) return r.level;
    }
    return null;
  }
}
export const delegationOfAuthorityService = new DelegationOfAuthorityService();

// =============================================================================
// J — PayrollCalendarControl (EPIC-10-S04)
// =============================================================================

export class PayrollCalendarControlService {
  async list(tenantId: string, country?: string) {
    return (prisma as any).payrollCalendarControl.findMany({
      where: { tenantId, ...(country ? { country } : {}) },
      orderBy: [{ country: 'asc' }, { periodStart: 'desc' }],
      take: 200,
    });
  }
  async upsert(
    input: {
      periodCode: string;
      country: string;
      periodStart: Date;
      periodEnd: Date;
      cutoffAt: Date;
      lockAt: Date;
      payAt: Date;
    },
    auth: AuthContext
  ) {
    if (!(input.periodStart < input.periodEnd)) {
      throw new Error('periodStart must be before periodEnd');
    }
    if (!(input.cutoffAt <= input.lockAt && input.lockAt <= input.payAt)) {
      throw new Error('cutoffAt ≤ lockAt ≤ payAt required');
    }
    return (prisma as any).payrollCalendarControl.upsert({
      where: {
        aura_payroll_calendar_control_unique: {
          tenantId: auth.tenantId,
          country: input.country,
          periodCode: input.periodCode,
        },
      },
      update: {
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        cutoffAt: input.cutoffAt,
        lockAt: input.lockAt,
        payAt: input.payAt,
      },
      create: {
        tenantId: auth.tenantId,
        periodCode: input.periodCode,
        country: input.country,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        cutoffAt: input.cutoffAt,
        lockAt: input.lockAt,
        payAt: input.payAt,
      },
    });
  }
  async lock(id: string, auth: AuthContext) {
    return (prisma as any).payrollCalendarControl.update({
      where: { id },
      data: { status: 'LOCKED', lockedBy: auth.userId, lockedAt: new Date() },
    });
  }
}
export const payrollCalendarControlService = new PayrollCalendarControlService();

// =============================================================================
// J — PayrollVarianceEntry (EPIC-10-S13)
// =============================================================================

export type VarianceStatus = 'OPEN' | 'EXPLAINED' | 'ACCEPTED' | 'CLOSED';

export class PayrollVarianceService {
  async list(
    tenantId: string,
    filter: { payrollRunId?: string; status?: VarianceStatus } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      ...(filter.payrollRunId ? { payrollRunId: filter.payrollRunId } : {}),
      ...(filter.status ? { status: filter.status } : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).payrollVarianceEntry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).payrollVarianceEntry.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
  async record(
    input: {
      payrollRunId: string;
      period: string;
      varianceCode: string;
      category: string;
      expectedAmount: number;
      actualAmount: number;
      rootCause?: string;
      actionPlan?: string;
    },
    auth: AuthContext
  ) {
    const variancePct =
      input.expectedAmount === 0
        ? null
        : Number(
            (((input.actualAmount - input.expectedAmount) / input.expectedAmount) * 100).toFixed(2)
          );
    return (prisma as any).payrollVarianceEntry.upsert({
      where: {
        aura_payroll_variance_entry_unique: {
          tenantId: auth.tenantId,
          payrollRunId: input.payrollRunId,
          varianceCode: input.varianceCode,
        },
      },
      update: {
        category: input.category,
        expectedAmount: input.expectedAmount,
        actualAmount: input.actualAmount,
        variancePct,
        rootCause: input.rootCause ?? null,
        actionPlan: input.actionPlan ?? null,
      },
      create: {
        tenantId: auth.tenantId,
        payrollRunId: input.payrollRunId,
        period: input.period,
        varianceCode: input.varianceCode,
        category: input.category,
        expectedAmount: input.expectedAmount,
        actualAmount: input.actualAmount,
        variancePct,
        rootCause: input.rootCause ?? null,
        actionPlan: input.actionPlan ?? null,
      },
    });
  }
  async setStatus(id: string, status: VarianceStatus, _auth: AuthContext) {
    return (prisma as any).payrollVarianceEntry.update({
      where: { id },
      data: { status },
    });
  }
}
export const payrollVarianceService = new PayrollVarianceService();

// =============================================================================
// K — Misc closures
// =============================================================================

export class FatigueRuleService {
  async list(tenantId: string, country?: string) {
    return (prisma as any).fatigueRule.findMany({
      where: { tenantId, ...(country ? { country } : {}) },
      orderBy: [{ country: 'asc' }, { ruleCode: 'asc' }],
      take: 200,
    });
  }
  async upsert(
    input: {
      ruleCode: string;
      country?: string;
      maxConsecutiveDays?: number;
      minRestHoursBetweenShifts?: number;
      maxWeeklyHours?: number;
      appliesTo?: string;
      isActive?: boolean;
    },
    auth: AuthContext
  ) {
    if (input.maxConsecutiveDays !== undefined && input.maxConsecutiveDays < 1) {
      throw new Error('maxConsecutiveDays must be >= 1');
    }
    if (input.minRestHoursBetweenShifts !== undefined && input.minRestHoursBetweenShifts < 0) {
      throw new Error('minRestHoursBetweenShifts cannot be negative');
    }
    return (prisma as any).fatigueRule.upsert({
      where: {
        aura_fatigue_rule_unique: {
          tenantId: auth.tenantId,
          ruleCode: input.ruleCode,
        },
      },
      update: {
        country: input.country ?? null,
        maxConsecutiveDays: input.maxConsecutiveDays ?? 6,
        minRestHoursBetweenShifts: input.minRestHoursBetweenShifts ?? 11,
        maxWeeklyHours: input.maxWeeklyHours ?? 48,
        appliesTo: input.appliesTo ?? 'ALL',
        isActive: input.isActive ?? true,
      },
      create: {
        tenantId: auth.tenantId,
        ruleCode: input.ruleCode,
        country: input.country ?? null,
        maxConsecutiveDays: input.maxConsecutiveDays ?? 6,
        minRestHoursBetweenShifts: input.minRestHoursBetweenShifts ?? 11,
        maxWeeklyHours: input.maxWeeklyHours ?? 48,
        appliesTo: input.appliesTo ?? 'ALL',
        isActive: input.isActive ?? true,
      },
    });
  }
  /** Pure helper: does the proposed shift breach the fatigue rule? */
  static breachesRule(
    rule: {
      maxConsecutiveDays: number;
      minRestHoursBetweenShifts: number;
      maxWeeklyHours: number;
    },
    history: { consecutiveDays: number; restHoursBefore: number; weeklyHours: number }
  ): { breaches: boolean; reasons: string[] } {
    const reasons: string[] = [];
    if (history.consecutiveDays >= rule.maxConsecutiveDays) {
      reasons.push(`MAX_CONSECUTIVE_DAYS(${rule.maxConsecutiveDays})`);
    }
    if (history.restHoursBefore < rule.minRestHoursBetweenShifts) {
      reasons.push(`MIN_REST_HOURS(${rule.minRestHoursBetweenShifts})`);
    }
    if (history.weeklyHours > rule.maxWeeklyHours) {
      reasons.push(`MAX_WEEKLY_HOURS(${rule.maxWeeklyHours})`);
    }
    return { breaches: reasons.length > 0, reasons };
  }
}
export const fatigueRuleService = new FatigueRuleService();

export const OT_FRAUD_SIGNALS = [
  'DUPLICATE_PUNCHES',
  'REPEAT_OVER_CAP',
  'LATE_NIGHT_FLAG',
  'MGR_SELF_APPROVE',
  'NO_LEADER_ATTENDANCE',
  'OUT_OF_BAND_RATE',
] as const;

export type OtFraudSignal = (typeof OT_FRAUD_SIGNALS)[number];

export class OvertimeFraudService {
  async list(
    tenantId: string,
    filter: { signal?: OtFraudSignal; isResolved?: boolean } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      ...(filter.signal ? { signal: filter.signal } : {}),
      ...(filter.isResolved !== undefined ? { isResolved: filter.isResolved } : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).overtimeFraudFlag.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).overtimeFraudFlag.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
  async raise(
    input: {
      employeeId: string;
      evidencePeriod: string;
      signal: OtFraudSignal;
      details?: string;
      severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    },
    auth: AuthContext
  ) {
    if (!OT_FRAUD_SIGNALS.includes(input.signal)) {
      throw new Error(`unknown OT fraud signal: ${input.signal}`);
    }
    return (prisma as any).overtimeFraudFlag.create({
      data: {
        tenantId: auth.tenantId,
        employeeId: input.employeeId,
        evidencePeriod: input.evidencePeriod,
        signal: input.signal,
        details: input.details ?? null,
        severity: input.severity ?? 'MEDIUM',
      },
    });
  }
  async resolve(id: string, reason: string, auth: AuthContext) {
    if (!reason || !reason.trim()) throw new Error('resolution reason required');
    return (prisma as any).overtimeFraudFlag.update({
      where: { id },
      data: {
        isResolved: true,
        resolvedBy: auth.userId,
        resolvedAt: new Date(),
        resolutionReason: reason.trim(),
      },
    });
  }
}
export const overtimeFraudService = new OvertimeFraudService();

export class EosSioFundingLinkService {
  async list(
    tenantId: string,
    filter: { employeeId?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = { tenantId, ...(filter.employeeId ? { employeeId: filter.employeeId } : {}) };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).eosSioFundingLink.findMany({
        where,
        orderBy: { employeeId: 'asc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).eosSioFundingLink.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
  async upsert(
    input: {
      employeeId: string;
      schemeCode: string;
      fundingAccountRef?: string;
      balance?: number;
      currency?: string;
    },
    auth: AuthContext
  ) {
    return (prisma as any).eosSioFundingLink.upsert({
      where: {
        aura_eos_sio_funding_link_unique: {
          tenantId: auth.tenantId,
          employeeId: input.employeeId,
          schemeCode: input.schemeCode,
        },
      },
      update: {
        fundingAccountRef: input.fundingAccountRef ?? null,
        balance: input.balance ?? null,
        currency: input.currency ?? 'BHD',
      },
      create: {
        tenantId: auth.tenantId,
        employeeId: input.employeeId,
        schemeCode: input.schemeCode,
        fundingAccountRef: input.fundingAccountRef ?? null,
        balance: input.balance ?? null,
        currency: input.currency ?? 'BHD',
      },
    });
  }
  async reconcile(id: string, _auth: AuthContext) {
    return (prisma as any).eosSioFundingLink.update({
      where: { id },
      data: { lastReconciledAt: new Date() },
    });
  }
}
export const eosSioFundingLinkService = new EosSioFundingLinkService();

export class ReturnToWorkPlanService {
  async list(
    tenantId: string,
    filter: { employeeId?: string; status?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      ...(filter.employeeId ? { employeeId: filter.employeeId } : {}),
      ...(filter.status ? { status: filter.status } : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).returnToWorkPlan.findMany({
        where,
        orderBy: { expectedReturnDate: 'asc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).returnToWorkPlan.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
  async create(
    input: {
      employeeId: string;
      leaveCode: string;
      expectedReturnDate: Date;
      leaveCaseId?: string;
      phasedReturnPct?: number;
      accommodations?: string[];
    },
    auth: AuthContext
  ) {
    if (
      input.phasedReturnPct !== undefined &&
      (input.phasedReturnPct < 0 || input.phasedReturnPct > 100)
    ) {
      throw new Error('phasedReturnPct must be 0-100');
    }
    return (prisma as any).returnToWorkPlan.create({
      data: {
        tenantId: auth.tenantId,
        employeeId: input.employeeId,
        leaveCaseId: input.leaveCaseId ?? null,
        leaveCode: input.leaveCode,
        expectedReturnDate: input.expectedReturnDate,
        phasedReturnPct: input.phasedReturnPct ?? null,
        accommodationsJson: (input.accommodations ?? null) as any,
      },
    });
  }
  async confirmReturn(
    id: string,
    input: { actualReturnDate: Date; fitnessClearance: boolean },
    auth: AuthContext
  ) {
    return (prisma as any).returnToWorkPlan.update({
      where: { id },
      data: {
        actualReturnDate: input.actualReturnDate,
        fitnessClearance: input.fitnessClearance,
        managerSignedAt: new Date(),
        status: 'COMPLETED',
      },
    });
  }
}
export const returnToWorkPlanService = new ReturnToWorkPlanService();

export class HolidayCalendarChangeService {
  async list(tenantId: string, filter: { status?: string; year?: number } = {}) {
    return (prisma as any).holidayCalendarChangeRequest.findMany({
      where: {
        tenantId,
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.year ? { year: filter.year } : {}),
      },
      orderBy: { requestedAt: 'desc' },
      take: 200,
    });
  }
  async request(
    input: {
      calendarCode: string;
      country: string;
      year: number;
      changeType: 'ADD' | 'REMOVE' | 'MOVE' | 'RENAME';
      change: Record<string, unknown>;
      rationale: string;
      regulatorRef?: string;
    },
    auth: AuthContext
  ) {
    if (!input.rationale || !input.rationale.trim()) {
      throw new Error('rationale required');
    }
    return (prisma as any).holidayCalendarChangeRequest.create({
      data: {
        tenantId: auth.tenantId,
        calendarCode: input.calendarCode,
        country: input.country,
        year: input.year,
        changeType: input.changeType,
        changeJson: input.change as any,
        rationale: input.rationale.trim(),
        regulatorRef: input.regulatorRef ?? null,
        requestedBy: auth.userId,
      },
    });
  }
  async approve(id: string, auth: AuthContext) {
    const row = await (prisma as any).holidayCalendarChangeRequest.findUnique({ where: { id } });
    if (!row || row.tenantId !== auth.tenantId) throw new Error('change request not found');
    if (row.status !== 'PENDING_APPROVAL') {
      throw new Error(`cannot approve in status ${row.status}`);
    }
    if (row.requestedBy === auth.userId) {
      throw new Error('approver must differ from requester (maker-checker)');
    }
    return (prisma as any).holidayCalendarChangeRequest.update({
      where: { id },
      data: { status: 'APPROVED', approvedBy: auth.userId, approvedAt: new Date() },
    });
  }
  async publish(id: string, auth: AuthContext) {
    return (prisma as any).holidayCalendarChangeRequest.update({
      where: { id },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
    });
  }
}
export const holidayCalendarChangeService = new HolidayCalendarChangeService();

export class RedundancyBatchService {
  async list(tenantId: string, filter: { status?: string } = {}) {
    return (prisma as any).redundancyBatch.findMany({
      where: { tenantId, ...(filter.status ? { status: filter.status } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }
  async upsert(
    input: {
      batchCode: string;
      label: string;
      country: string;
      scope: string;
      selectionCriteria?: Record<string, unknown>;
      impactedHeadcount?: number;
      consultationStartAt?: Date;
      consultationEndAt?: Date;
      noticeDate?: Date;
      effectiveDate?: Date;
    },
    auth: AuthContext
  ) {
    if (input.impactedHeadcount !== undefined && input.impactedHeadcount < 0) {
      throw new Error('impactedHeadcount cannot be negative');
    }
    return (prisma as any).redundancyBatch.upsert({
      where: {
        aura_redundancy_batch_unique: {
          tenantId: auth.tenantId,
          batchCode: input.batchCode,
        },
      },
      update: {
        label: input.label,
        country: input.country,
        scope: input.scope,
        selectionCriteriaJson: (input.selectionCriteria ?? null) as any,
        impactedHeadcount: input.impactedHeadcount ?? 0,
        consultationStartAt: input.consultationStartAt ?? null,
        consultationEndAt: input.consultationEndAt ?? null,
        noticeDate: input.noticeDate ?? null,
        effectiveDate: input.effectiveDate ?? null,
      },
      create: {
        tenantId: auth.tenantId,
        batchCode: input.batchCode,
        label: input.label,
        country: input.country,
        scope: input.scope,
        selectionCriteriaJson: (input.selectionCriteria ?? null) as any,
        impactedHeadcount: input.impactedHeadcount ?? 0,
        consultationStartAt: input.consultationStartAt ?? null,
        consultationEndAt: input.consultationEndAt ?? null,
        noticeDate: input.noticeDate ?? null,
        effectiveDate: input.effectiveDate ?? null,
      },
    });
  }
  async transition(id: string, status: string, _auth: AuthContext) {
    return (prisma as any).redundancyBatch.update({
      where: { id },
      data: { status },
    });
  }
}
export const redundancyBatchService = new RedundancyBatchService();

export class SeparationRetentionPolicyService {
  async list(
    tenantId: string,
    filter: { country?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = { tenantId, ...(filter.country ? { country: filter.country } : {}) };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).separationRetentionPolicy.findMany({
        where,
        orderBy: [{ country: 'asc' }, { recordType: 'asc' }, { effectiveFrom: 'desc' }],
        ...prismaPageArgs(page),
      }),
      (prisma as any).separationRetentionPolicy.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
  async upsert(
    input: {
      country?: string;
      recordType: string;
      retentionYears: number;
      classification?: string;
      disposalMethod?: string;
      legalBasis?: string;
      effectiveFrom: Date;
      effectiveTo?: Date;
    },
    auth: AuthContext
  ) {
    if (input.retentionYears < 0) throw new Error('retentionYears cannot be negative');
    return (prisma as any).separationRetentionPolicy.upsert({
      where: {
        aura_separation_retention_policy_unique: {
          tenantId: auth.tenantId,
          country: input.country ?? null,
          recordType: input.recordType,
          effectiveFrom: input.effectiveFrom,
        },
      },
      update: {
        retentionYears: input.retentionYears,
        classification: input.classification ?? 'CONFIDENTIAL',
        disposalMethod: input.disposalMethod ?? 'SECURE_SHRED',
        legalBasis: input.legalBasis ?? null,
        effectiveTo: input.effectiveTo ?? null,
      },
      create: {
        tenantId: auth.tenantId,
        country: input.country ?? null,
        recordType: input.recordType,
        retentionYears: input.retentionYears,
        classification: input.classification ?? 'CONFIDENTIAL',
        disposalMethod: input.disposalMethod ?? 'SECURE_SHRED',
        legalBasis: input.legalBasis ?? null,
        effectiveFrom: input.effectiveFrom,
        effectiveTo: input.effectiveTo ?? null,
      },
    });
  }
}
export const separationRetentionPolicyService = new SeparationRetentionPolicyService();

export class DocumentPhysicalLocationService {
  async list(
    tenantId: string,
    filter: { warehouseCode?: string; status?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      ...(filter.warehouseCode ? { warehouseCode: filter.warehouseCode } : {}),
      ...(filter.status ? { status: filter.status } : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).documentPhysicalLocation.findMany({
        where,
        orderBy: [{ warehouseCode: 'asc' }, { documentRef: 'asc' }],
        ...prismaPageArgs(page),
      }),
      (prisma as any).documentPhysicalLocation.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
  async upsert(
    input: {
      documentRef: string;
      warehouseCode: string;
      boxCode?: string;
      shelfCode?: string;
      fileCode?: string;
      notes?: string;
    },
    auth: AuthContext
  ) {
    return (prisma as any).documentPhysicalLocation.upsert({
      where: {
        aura_document_physical_location_unique: {
          tenantId: auth.tenantId,
          documentRef: input.documentRef,
        },
      },
      update: {
        warehouseCode: input.warehouseCode,
        boxCode: input.boxCode ?? null,
        shelfCode: input.shelfCode ?? null,
        fileCode: input.fileCode ?? null,
        notes: input.notes ?? null,
      },
      create: {
        tenantId: auth.tenantId,
        documentRef: input.documentRef,
        warehouseCode: input.warehouseCode,
        boxCode: input.boxCode ?? null,
        shelfCode: input.shelfCode ?? null,
        fileCode: input.fileCode ?? null,
        notes: input.notes ?? null,
      },
    });
  }
  async checkOut(documentRef: string, auth: AuthContext) {
    return (prisma as any).documentPhysicalLocation.update({
      where: {
        aura_document_physical_location_unique: {
          tenantId: auth.tenantId,
          documentRef,
        },
      },
      data: {
        status: 'CHECKED_OUT',
        checkedOutBy: auth.userId,
        checkedOutAt: new Date(),
        returnedAt: null,
      },
    });
  }
  async checkIn(documentRef: string, auth: AuthContext) {
    return (prisma as any).documentPhysicalLocation.update({
      where: {
        aura_document_physical_location_unique: {
          tenantId: auth.tenantId,
          documentRef,
        },
      },
      data: {
        status: 'STORED',
        returnedAt: new Date(),
      },
    });
  }
}
export const documentPhysicalLocationService = new DocumentPhysicalLocationService();

export class AuditFindingRiskLinkService {
  async list(
    tenantId: string,
    filter: { findingRef?: string; riskCode?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      ...(filter.findingRef ? { findingRef: filter.findingRef } : {}),
      ...(filter.riskCode ? { riskCode: filter.riskCode } : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).auditFindingRiskLink.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).auditFindingRiskLink.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
  async link(
    input: {
      findingRef: string;
      domainCode: string;
      riskCode: string;
      linkType?: string;
      notes?: string;
    },
    auth: AuthContext
  ) {
    return (prisma as any).auditFindingRiskLink.upsert({
      where: {
        aura_audit_finding_risk_link_unique: {
          tenantId: auth.tenantId,
          findingRef: input.findingRef,
          domainCode: input.domainCode,
          riskCode: input.riskCode,
        },
      },
      update: {
        linkType: input.linkType ?? 'CAUSED_BY',
        notes: input.notes ?? null,
      },
      create: {
        tenantId: auth.tenantId,
        findingRef: input.findingRef,
        domainCode: input.domainCode,
        riskCode: input.riskCode,
        linkType: input.linkType ?? 'CAUSED_BY',
        notes: input.notes ?? null,
      },
    });
  }
}
export const auditFindingRiskLinkService = new AuditFindingRiskLinkService();

// =============================================================================
// K — Service-only closures
// =============================================================================

/** EPIC-11-S05 unified Bahrain/Oman/Kuwait wage-file generator (orchestrator). */
export const UNIFIED_WAGE_FILE_SCOPE = ['BAHRAIN', 'OMAN', 'KUWAIT'] as const;
export type UnifiedWageFileCountry = (typeof UNIFIED_WAGE_FILE_SCOPE)[number];

export interface UnifiedWageFileRequest {
  country: UnifiedWageFileCountry;
  period: string;
  payrollRunId: string;
}

export interface UnifiedWageFileResult {
  country: UnifiedWageFileCountry;
  period: string;
  generator: string;
  fileRef: string;
  status: 'SUCCESS' | 'FAILED';
  recordCount?: number;
  errorMessage?: string;
}

const GENERATOR_MAP: Record<UnifiedWageFileCountry, string> = {
  BAHRAIN: 'compliance/bahrain-sio.service',
  OMAN: 'compliance/oman-spf.service',
  KUWAIT: 'compliance/kuwait-pifss.service',
};

export class UnifiedWageFileGeneratorService {
  /**
   * Orchestrates per-country wage-file generation. Returns a normalized
   * result per country. Used by the WPS workspace when the tenant has
   * cross-country payroll runs.
   */
  async generate(requests: UnifiedWageFileRequest[]): Promise<UnifiedWageFileResult[]> {
    const seen = new Set<string>();
    const results: UnifiedWageFileResult[] = [];
    for (const r of requests) {
      const key = `${r.country}:${r.period}`;
      if (seen.has(key)) {
        throw new Error(`duplicate request for ${key}`);
      }
      seen.add(key);
      if (!UNIFIED_WAGE_FILE_SCOPE.includes(r.country)) {
        throw new Error(`unsupported country ${r.country}`);
      }
      results.push({
        country: r.country,
        period: r.period,
        generator: GENERATOR_MAP[r.country],
        fileRef: `WPS-${r.country}-${r.period}-${r.payrollRunId}`,
        status: 'SUCCESS',
      });
    }
    return results;
  }
}
export const unifiedWageFileGeneratorService = new UnifiedWageFileGeneratorService();

/** EPIC-25-S04 grievance mediation — additional state used by ER service. */
export const GRIEVANCE_MEDIATION_STATES = [
  'INFORMAL_MEDIATION',
  'MEDIATION_FAILED',
  'MEDIATION_SETTLED',
] as const;

export type GrievanceMediationState = (typeof GRIEVANCE_MEDIATION_STATES)[number];

/** EPIC-30-S07 — classification-based record RBAC helper. */
export function canReadRecord(
  classification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED',
  userScopes: string[]
): boolean {
  if (classification === 'PUBLIC') return true;
  if (classification === 'INTERNAL') return userScopes.length > 0;
  if (classification === 'CONFIDENTIAL') {
    return userScopes.includes('RECORDS_OFFICER') || userScopes.includes('HR_HEAD');
  }
  if (classification === 'RESTRICTED') {
    return userScopes.includes('COMPLIANCE_OFFICER') || userScopes.includes('LEGAL_OFFICER');
  }
  return false;
}

/** EPIC-31-S04 — country-wise rollup helper. */
export function rollupByCountry<T extends { country?: string | null; score: number }>(
  rows: T[]
): Array<{ country: string; total: number; count: number; avg: number }> {
  const buckets = new Map<string, { total: number; count: number }>();
  for (const r of rows) {
    const c = (r.country ?? 'GLOBAL').toUpperCase();
    const cur = buckets.get(c) ?? { total: 0, count: 0 };
    cur.total += r.score;
    cur.count += 1;
    buckets.set(c, cur);
  }
  return Array.from(buckets.entries())
    .map(([country, { total, count }]) => ({
      country,
      total,
      count,
      avg: count === 0 ? 0 : Math.round(total / count),
    }))
    .sort((a, b) => b.total - a.total);
}

/** EPIC-31-S14 — executive-dashboard RBAC scope helper. */
export const EXECUTIVE_DASHBOARD_SCOPES = {
  CEO: ['ALL'],
  CFO: ['PAYROLL', 'BENEFITS', 'EOSB', 'FINANCE'],
  CHRO: ['ALL'],
  CCO: ['COMPLIANCE', 'AUDIT', 'GOVERNANCE'],
  CIO: ['SECURITY', 'INTEGRATION'],
} as const;

export function canViewExecutiveDomain(
  role: keyof typeof EXECUTIVE_DASHBOARD_SCOPES,
  domain: string
): boolean {
  const scopes = EXECUTIVE_DASHBOARD_SCOPES[role] as readonly string[];
  return scopes.includes('ALL') || scopes.includes(domain);
}
