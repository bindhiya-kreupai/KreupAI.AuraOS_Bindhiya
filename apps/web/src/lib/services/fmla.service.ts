import { prisma } from '@aura/database';
import { BaseService } from './base.service';

export type FMLAStatus =
  | 'DRAFT'
  | 'NOTICE_SENT'
  | 'CERTIFIED'
  | 'APPROVED'
  | 'ACTIVE'
  | 'INTERMITTENT'
  | 'EXHAUSTED'
  | 'COMPLETED'
  | 'DENIED'
  | 'CANCELED';

export type FMLAReason =
  | 'BIRTH'
  | 'ADOPTION'
  | 'FOSTER_CARE'
  | 'SELF_SERIOUS'
  | 'FAMILY_SERIOUS'
  | 'MILITARY_EXIGENCY'
  | 'MILITARY_CAREGIVER';

export type TrackingMethod =
  | 'CALENDAR_YEAR'
  | 'FIXED_FISCAL'
  | 'EMPLOYEE_ANNIVERSARY'
  | 'ROLLING_FORWARD'
  | 'ROLLING_BACKWARD';

export type FMLAFramework = 'FMLA' | 'CFRA' | 'OFLA' | 'PFML' | 'INTL_EQUIVALENT';

export type UsagePattern = 'CONTINUOUS' | 'INTERMITTENT' | 'REDUCED_SCHEDULE';

const STATUS_TRANSITIONS: Record<FMLAStatus, FMLAStatus[]> = {
  DRAFT: ['NOTICE_SENT', 'DENIED', 'CANCELED'],
  NOTICE_SENT: ['CERTIFIED', 'DENIED', 'CANCELED'],
  CERTIFIED: ['APPROVED', 'DENIED', 'CANCELED'],
  APPROVED: ['ACTIVE', 'CANCELED'],
  ACTIVE: ['INTERMITTENT', 'EXHAUSTED', 'COMPLETED', 'CANCELED'],
  INTERMITTENT: ['ACTIVE', 'EXHAUSTED', 'COMPLETED', 'CANCELED'],
  EXHAUSTED: ['COMPLETED'],
  COMPLETED: [],
  DENIED: [],
  CANCELED: [],
};

export class InvalidFMLATransitionError extends Error {
  constructor(from: FMLAStatus, to: FMLAStatus) {
    super(`Invalid FMLA case transition: ${from} → ${to}`);
    this.name = 'InvalidFMLATransitionError';
  }
}

export class IneligibleForFMLAError extends Error {
  reason: string;
  constructor(reason: string) {
    super(`Employee ineligible for FMLA: ${reason}`);
    this.name = 'IneligibleForFMLAError';
    this.reason = reason;
  }
}

export class EntitlementExceededError extends Error {
  attempted: number;
  remaining: number;
  constructor(attempted: number, remaining: number) {
    super(`FMLA entitlement exceeded: requested ${attempted}h, ${remaining}h remaining`);
    this.name = 'EntitlementExceededError';
    this.attempted = attempted;
    this.remaining = remaining;
  }
}

// ----- Eligibility (pure) -----
//
// US DOL § 825.110(a): an employee is eligible if they (1) have worked
// for the employer for ≥ 12 months and (2) worked ≥ 1,250 hours in the
// 12 months preceding the leave start.

export interface EligibilityInput {
  tenureMonths: number;
  hoursWorkedPrev12Mo: number;
  framework: FMLAFramework;
}

export interface EligibilityResult {
  eligible: boolean;
  reason: string | null;
}

const FRAMEWORK_THRESHOLDS: Record<FMLAFramework, { tenureMonths: number; hours: number }> = {
  FMLA: { tenureMonths: 12, hours: 1250 },
  CFRA: { tenureMonths: 12, hours: 1250 }, // California, mirrors FMLA
  OFLA: { tenureMonths: 6, hours: 0 }, // Oregon, 6 months tenure, no hours minimum (180-day variant)
  PFML: { tenureMonths: 6, hours: 0 }, // Generic state PFML; refined per state in extension
  INTL_EQUIVALENT: { tenureMonths: 0, hours: 0 }, // Pass-through for non-US analogs
};

export function evaluateEligibility(input: EligibilityInput): EligibilityResult {
  const t = FRAMEWORK_THRESHOLDS[input.framework];
  if (input.tenureMonths < t.tenureMonths) {
    return {
      eligible: false,
      reason: `Tenure ${input.tenureMonths}mo < required ${t.tenureMonths}mo`,
    };
  }
  if (input.hoursWorkedPrev12Mo < t.hours) {
    return {
      eligible: false,
      reason: `Hours worked ${input.hoursWorkedPrev12Mo} < required ${t.hours} in preceding 12 months`,
    };
  }
  return { eligible: true, reason: null };
}

// ----- Period calculation (pure) -----

export interface PeriodInput {
  method: TrackingMethod;
  startDate: Date;
  joiningDate?: Date;
  fiscalStart?: { month: number; day: number }; // 1-12 / 1-31
  /** Sum of hours used in the last 365 days, for ROLLING_BACKWARD */
  rollingPriorUsage?: number;
}

export interface PeriodResult {
  periodStart: Date;
  periodEnd: Date;
  /** Adjusted entitlement after subtracting rolling-backward prior usage. */
  effectiveEntitlementHours: number;
}

const STANDARD_ENTITLEMENT_HOURS = 480;

export function computePeriod(input: PeriodInput): PeriodResult {
  const { method, startDate } = input;
  const periodStart = new Date(startDate);
  let periodEnd: Date;
  let effectiveEntitlementHours = STANDARD_ENTITLEMENT_HOURS;

  switch (method) {
    case 'CALENDAR_YEAR': {
      periodStart.setMonth(0, 1);
      periodStart.setHours(0, 0, 0, 0);
      periodEnd = new Date(periodStart.getFullYear(), 11, 31, 23, 59, 59);
      break;
    }
    case 'FIXED_FISCAL': {
      const fy = input.fiscalStart ?? { month: 4, day: 1 };
      const fyStartYear =
        startDate.getMonth() + 1 > fy.month ||
        (startDate.getMonth() + 1 === fy.month && startDate.getDate() >= fy.day)
          ? startDate.getFullYear()
          : startDate.getFullYear() - 1;
      periodStart.setFullYear(fyStartYear, fy.month - 1, fy.day);
      periodStart.setHours(0, 0, 0, 0);
      periodEnd = new Date(periodStart);
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      periodEnd.setDate(periodEnd.getDate() - 1);
      break;
    }
    case 'EMPLOYEE_ANNIVERSARY': {
      const join = input.joiningDate ?? startDate;
      const annivThisYear = new Date(startDate.getFullYear(), join.getMonth(), join.getDate());
      periodStart.setTime(
        (annivThisYear <= startDate
          ? annivThisYear
          : new Date(annivThisYear.getFullYear() - 1, join.getMonth(), join.getDate())
        ).getTime()
      );
      periodStart.setHours(0, 0, 0, 0);
      periodEnd = new Date(periodStart);
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      periodEnd.setDate(periodEnd.getDate() - 1);
      break;
    }
    case 'ROLLING_FORWARD': {
      periodEnd = new Date(periodStart);
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      periodEnd.setDate(periodEnd.getDate() - 1);
      break;
    }
    case 'ROLLING_BACKWARD':
    default: {
      // Look back 365 days from the start. Effective entitlement is
      // 480 minus what's already been used in the rolling window.
      periodEnd = new Date(periodStart);
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      periodEnd.setDate(periodEnd.getDate() - 1);
      const used = input.rollingPriorUsage ?? 0;
      effectiveEntitlementHours = Math.max(0, STANDARD_ENTITLEMENT_HOURS - used);
      break;
    }
  }

  return { periodStart, periodEnd, effectiveEntitlementHours };
}

// ----- Service -----

export class FMLAService extends BaseService {
  constructor() {
    super('FMLAService');
  }

  canTransition(from: FMLAStatus, to: FMLAStatus): boolean {
    return (STATUS_TRANSITIONS[from] ?? []).includes(to);
  }

  assertTransition(from: FMLAStatus, to: FMLAStatus): void {
    if (!this.canTransition(from, to)) throw new InvalidFMLATransitionError(from, to);
  }

  async openCase(input: {
    tenantId: string;
    employeeId: string;
    framework?: FMLAFramework;
    reason: FMLAReason;
    tenureMonths: number;
    hoursWorkedPrev12Mo: number;
    trackingMethod?: TrackingMethod;
    startDate: Date;
    expectedEndDate?: Date;
    joiningDate?: Date;
    fiscalStart?: { month: number; day: number };
    notes?: string;
    actorId: string;
  }) {
    const framework = input.framework ?? 'FMLA';
    const eligibility = evaluateEligibility({
      tenureMonths: input.tenureMonths,
      hoursWorkedPrev12Mo: input.hoursWorkedPrev12Mo,
      framework,
    });
    if (!eligibility.eligible) {
      throw new IneligibleForFMLAError(eligibility.reason ?? 'Unknown ineligibility');
    }

    const method = input.trackingMethod ?? 'ROLLING_BACKWARD';
    const rollingPriorUsage =
      method === 'ROLLING_BACKWARD'
        ? await this.sumUsageInPriorYear(input.tenantId, input.employeeId, input.startDate)
        : 0;
    const period = computePeriod({
      method,
      startDate: input.startDate,
      joiningDate: input.joiningDate,
      fiscalStart: input.fiscalStart,
      rollingPriorUsage,
    });

    // 21-day certification window (US DOL § 825.305(b))
    const certDue = new Date(input.startDate);
    certDue.setDate(certDue.getDate() + 21);

    return prisma.fMLACase.create({
      data: {
        tenantId: input.tenantId,
        employeeId: input.employeeId,
        framework,
        reason: input.reason,
        hoursWorkedPrev12Mo: input.hoursWorkedPrev12Mo,
        tenureMonths: input.tenureMonths,
        eligible: true,
        trackingMethod: method,
        periodStart: period.periodStart,
        periodEnd: period.periodEnd,
        entitlementHours: period.effectiveEntitlementHours,
        usedHours: 0,
        remainingHours: period.effectiveEntitlementHours,
        startDate: input.startDate,
        expectedEndDate: input.expectedEndDate ?? null,
        status: 'DRAFT',
        certificationDueBy: certDue,
        notes: input.notes ?? null,
        createdBy: input.actorId,
      },
    });
  }

  async sumUsageInPriorYear(tenantId: string, employeeId: string, asOf: Date): Promise<number> {
    const oneYearBack = new Date(asOf);
    oneYearBack.setFullYear(oneYearBack.getFullYear() - 1);
    const agg = await prisma.fMLAUsage.aggregate({
      where: {
        tenantId,
        employeeId,
        usageDate: { gte: oneYearBack, lte: asOf },
      },
      _sum: { hours: true },
    });
    return Number(agg._sum.hours ?? 0);
  }

  async issueNotice(id: string, tenantId: string, actorId: string, noticeReference: string) {
    if (!noticeReference || noticeReference.trim().length < 3) {
      throw new Error('A real WH-381 notice reference is required (no placeholders).');
    }
    const caseRow = await prisma.fMLACase.findFirst({ where: { id, tenantId, isDeleted: false } });
    if (!caseRow) return null;
    this.assertTransition(caseRow.status as FMLAStatus, 'NOTICE_SENT');
    return prisma.fMLACase.update({
      where: { id },
      data: {
        status: 'NOTICE_SENT',
        noticeIssuedAt: new Date(),
        noticeReference,
        updatedBy: actorId,
      },
    });
  }

  async recordCertification(id: string, tenantId: string, actorId: string) {
    const caseRow = await prisma.fMLACase.findFirst({ where: { id, tenantId, isDeleted: false } });
    if (!caseRow) return null;
    this.assertTransition(caseRow.status as FMLAStatus, 'CERTIFIED');
    return prisma.fMLACase.update({
      where: { id },
      data: { status: 'CERTIFIED', certificationReceived: new Date(), updatedBy: actorId },
    });
  }

  async approve(id: string, tenantId: string, actorId: string) {
    const caseRow = await prisma.fMLACase.findFirst({ where: { id, tenantId, isDeleted: false } });
    if (!caseRow) return null;
    this.assertTransition(caseRow.status as FMLAStatus, 'APPROVED');
    return prisma.fMLACase.update({
      where: { id },
      data: { status: 'APPROVED', updatedBy: actorId },
    });
  }

  async activate(id: string, tenantId: string, actorId: string, intermittent = false) {
    const caseRow = await prisma.fMLACase.findFirst({ where: { id, tenantId, isDeleted: false } });
    if (!caseRow) return null;
    const target: FMLAStatus = intermittent ? 'INTERMITTENT' : 'ACTIVE';
    this.assertTransition(caseRow.status as FMLAStatus, target);
    return prisma.fMLACase.update({
      where: { id },
      data: { status: target, updatedBy: actorId },
    });
  }

  async deny(id: string, tenantId: string, actorId: string, reason: string) {
    const caseRow = await prisma.fMLACase.findFirst({ where: { id, tenantId, isDeleted: false } });
    if (!caseRow) return null;
    this.assertTransition(caseRow.status as FMLAStatus, 'DENIED');
    return prisma.fMLACase.update({
      where: { id },
      data: { status: 'DENIED', denialReason: reason, updatedBy: actorId },
    });
  }

  async cancel(id: string, tenantId: string, actorId: string) {
    const caseRow = await prisma.fMLACase.findFirst({ where: { id, tenantId, isDeleted: false } });
    if (!caseRow) return null;
    this.assertTransition(caseRow.status as FMLAStatus, 'CANCELED');
    return prisma.fMLACase.update({
      where: { id },
      data: { status: 'CANCELED', updatedBy: actorId },
    });
  }

  /**
   * Record FMLA-counted absence hours for a date. Increments usedHours,
   * decrements remainingHours, auto-flips the case to EXHAUSTED when
   * remaining hits 0.
   */
  async recordUsage(input: {
    tenantId: string;
    caseId: string;
    usageDate: Date;
    hours: number;
    pattern?: UsagePattern;
    leaveRequestId?: string;
    notes?: string;
    actorId: string;
  }) {
    if (input.hours <= 0) throw new Error('hours must be > 0');
    const caseRow = await prisma.fMLACase.findFirst({
      where: { id: input.caseId, tenantId: input.tenantId, isDeleted: false },
    });
    if (!caseRow) return null;
    if (input.hours > caseRow.remainingHours) {
      throw new EntitlementExceededError(input.hours, caseRow.remainingHours);
    }

    return prisma.$transaction(async (tx) => {
      const usage = await tx.fMLAUsage.create({
        data: {
          caseId: input.caseId,
          tenantId: input.tenantId,
          employeeId: caseRow.employeeId,
          usageDate: input.usageDate,
          hours: input.hours,
          pattern: input.pattern ?? 'CONTINUOUS',
          leaveRequestId: input.leaveRequestId ?? null,
          notes: input.notes ?? null,
          createdBy: input.actorId,
        },
      });

      const newUsed = caseRow.usedHours + input.hours;
      const newRemaining = caseRow.entitlementHours - newUsed;
      const exhausted = newRemaining <= 0;
      const nextStatus: FMLAStatus = exhausted ? 'EXHAUSTED' : (caseRow.status as FMLAStatus);

      const updated = await tx.fMLACase.update({
        where: { id: input.caseId },
        data: {
          usedHours: newUsed,
          remainingHours: Math.max(0, newRemaining),
          status: nextStatus,
          updatedBy: input.actorId,
        },
      });

      return { usage, case: updated };
    });
  }

  async list(params: {
    tenantId: string;
    employeeId?: string;
    status?: FMLAStatus;
    framework?: FMLAFramework;
    page?: number;
    limit?: number;
  }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 50, 200);
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { tenantId: params.tenantId, isDeleted: false };
    if (params.employeeId) where.employeeId = params.employeeId;
    if (params.status) where.status = params.status;
    if (params.framework) where.framework = params.framework;
    const [items, total] = await Promise.all([
      prisma.fMLACase.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: 'desc' },
        include: { usages: true },
      }),
      prisma.fMLACase.count({ where }),
    ]);
    return { items, total, page, pageSize: limit, hasNextPage: skip + items.length < total };
  }
}

export const fmlaService = new FMLAService();
