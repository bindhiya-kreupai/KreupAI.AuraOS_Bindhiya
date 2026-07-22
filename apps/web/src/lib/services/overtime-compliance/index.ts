/**
 * EPIC-12: Overtime Compliance.
 *
 * Country-rule-driven OT engine: eligibility + caps per country/grade,
 * rate-card multipliers per OT type (WEEKDAY, NIGHT, REST_DAY, HOLIDAY,
 * RAMADAN), request → approval workflow, attendance-driven actuals with
 * fraud detection, budget control, and monthly certificate.
 *
 * Default GCC rate cards (representative, configurable):
 *   UAE     — WEEKDAY 1.25, NIGHT 1.50, REST_DAY 1.50, HOLIDAY 1.50, RAMADAN 1.25
 *   KSA     — WEEKDAY 1.50, HOLIDAY 2.00, REST_DAY 2.00, NIGHT 1.50
 *   BAHRAIN — WEEKDAY 1.25, NIGHT 1.50, REST_DAY 1.50, HOLIDAY 2.00
 *   QATAR   — WEEKDAY 1.25, NIGHT 1.50, REST_DAY 1.50, HOLIDAY 2.50
 *   OMAN    — WEEKDAY 1.25, NIGHT 1.50, REST_DAY 2.00, HOLIDAY 2.00
 *   KUWAIT  — WEEKDAY 1.25, NIGHT 1.50, REST_DAY 1.50, HOLIDAY 2.00
 *
 * Fraud heuristics:
 *   GHOST_HOURS       — OT actual without matching request
 *   EXCESSIVE_DAILY   — actualHours exceeds policy.maxDailyOtHours
 *   EXCESSIVE_MONTHLY — employee's monthly OT exceeds policy.maxMonthlyOtHours
 *   DUPLICATE_DATE    — same employee + date + type already exists
 *   UNAPPROVED        — request not in APPROVED state but actual posted
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

export type OtType = 'WEEKDAY' | 'NIGHT' | 'REST_DAY' | 'HOLIDAY' | 'RAMADAN';
export type OtCountry = 'UAE' | 'KSA' | 'BAHRAIN' | 'QATAR' | 'OMAN' | 'KUWAIT';

export const DEFAULT_RATE_CARDS: Array<{
  country: OtCountry;
  otType: OtType;
  multiplier: number;
  basis: string;
}> = [
  { country: 'UAE', otType: 'WEEKDAY', multiplier: 1.25, basis: 'BASIC' },
  { country: 'UAE', otType: 'NIGHT', multiplier: 1.5, basis: 'BASIC' },
  { country: 'UAE', otType: 'REST_DAY', multiplier: 1.5, basis: 'BASIC' },
  { country: 'UAE', otType: 'HOLIDAY', multiplier: 1.5, basis: 'BASIC' },
  { country: 'UAE', otType: 'RAMADAN', multiplier: 1.25, basis: 'BASIC' },
  { country: 'KSA', otType: 'WEEKDAY', multiplier: 1.5, basis: 'BASIC' },
  { country: 'KSA', otType: 'NIGHT', multiplier: 1.5, basis: 'BASIC' },
  { country: 'KSA', otType: 'REST_DAY', multiplier: 2.0, basis: 'BASIC' },
  { country: 'KSA', otType: 'HOLIDAY', multiplier: 2.0, basis: 'BASIC' },
  { country: 'BAHRAIN', otType: 'WEEKDAY', multiplier: 1.25, basis: 'BASIC' },
  { country: 'BAHRAIN', otType: 'NIGHT', multiplier: 1.5, basis: 'BASIC' },
  { country: 'BAHRAIN', otType: 'REST_DAY', multiplier: 1.5, basis: 'BASIC' },
  { country: 'BAHRAIN', otType: 'HOLIDAY', multiplier: 2.0, basis: 'BASIC' },
  { country: 'QATAR', otType: 'WEEKDAY', multiplier: 1.25, basis: 'BASIC' },
  { country: 'QATAR', otType: 'NIGHT', multiplier: 1.5, basis: 'BASIC' },
  { country: 'QATAR', otType: 'REST_DAY', multiplier: 1.5, basis: 'BASIC' },
  { country: 'QATAR', otType: 'HOLIDAY', multiplier: 2.5, basis: 'BASIC' },
  { country: 'OMAN', otType: 'WEEKDAY', multiplier: 1.25, basis: 'BASIC' },
  { country: 'OMAN', otType: 'NIGHT', multiplier: 1.5, basis: 'BASIC' },
  { country: 'OMAN', otType: 'REST_DAY', multiplier: 2.0, basis: 'BASIC' },
  { country: 'OMAN', otType: 'HOLIDAY', multiplier: 2.0, basis: 'BASIC' },
  { country: 'KUWAIT', otType: 'WEEKDAY', multiplier: 1.25, basis: 'BASIC' },
  { country: 'KUWAIT', otType: 'NIGHT', multiplier: 1.5, basis: 'BASIC' },
  { country: 'KUWAIT', otType: 'REST_DAY', multiplier: 1.5, basis: 'BASIC' },
  { country: 'KUWAIT', otType: 'HOLIDAY', multiplier: 2.0, basis: 'BASIC' },
];

export class OtPolicyService {
  async upsertPolicy(
    input: {
      country: string;
      grade?: string;
      isEligible?: boolean;
      standardDailyHours?: number;
      standardWeeklyHours?: number;
      maxDailyOtHours?: number;
      maxMonthlyOtHours?: number;
      requiresPreApproval?: boolean;
      allowsCompOff?: boolean;
      ramadanDailyHours?: number;
      effectiveFrom: Date;
    },
    auth: AuthContext
  ) {
    return (prisma as any).otPolicy.upsert({
      where: {
        tenantId_country_grade_effectiveFrom: {
          tenantId: auth.tenantId,
          country: input.country,
          grade: input.grade ?? null,
          effectiveFrom: input.effectiveFrom,
        },
      },
      update: { ...input, grade: input.grade ?? null, status: 'ACTIVE' },
      create: {
        tenantId: auth.tenantId,
        ...input,
        grade: input.grade ?? null,
        status: 'ACTIVE',
      },
    });
  }

  async listPolicies(tenantId: string) {
    return (prisma as any).otPolicy.findMany({
      where: { tenantId, status: 'ACTIVE' },
      orderBy: [{ country: 'asc' }, { grade: 'asc' }],
    });
  }

  async resolvePolicy(
    tenantId: string,
    country: string,
    grade: string | null,
    asOf: Date = new Date()
  ) {
    const rows = await (prisma as any).otPolicy.findMany({
      where: {
        tenantId,
        country,
        status: 'ACTIVE',
        effectiveFrom: { lte: asOf },
        OR: [{ grade: grade ?? null }, { grade: null }],
      },
      orderBy: [{ grade: 'desc' }, { effectiveFrom: 'desc' }],
      take: 1,
    });
    return rows[0] ?? null;
  }
}

export const otPolicyService = new OtPolicyService();

export class OtRateCardService {
  async seedDefaults(auth: AuthContext, effectiveFrom: Date = new Date()) {
    const created: string[] = [];
    for (const r of DEFAULT_RATE_CARDS) {
      try {
        await (prisma as any).otRateCard.create({
          data: {
            tenantId: auth.tenantId,
            ...r,
            effectiveFrom,
            status: 'ACTIVE',
          },
        });
        created.push(`${r.country}/${r.otType}`);
      } catch (err) {
        if (!String(err).includes('Unique')) throw err;
      }
    }
    return { created };
  }

  async listRateCards(tenantId: string) {
    return (prisma as any).otRateCard.findMany({
      where: { tenantId, status: 'ACTIVE' },
      orderBy: [{ country: 'asc' }, { otType: 'asc' }],
    });
  }

  async resolveMultiplier(
    tenantId: string,
    country: string,
    otType: string,
    asOf: Date = new Date()
  ): Promise<number | null> {
    const rows = await (prisma as any).otRateCard.findMany({
      where: {
        tenantId,
        country,
        otType,
        status: 'ACTIVE',
        effectiveFrom: { lte: asOf },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: asOf } }],
      },
      orderBy: { effectiveFrom: 'desc' },
      take: 1,
    });
    return rows[0] ? Number(rows[0].multiplier) : null;
  }
}

export const otRateCardService = new OtRateCardService();

export class OtRequestService {
  async create(
    input: {
      employeeId: string;
      country: string;
      requestDate: Date;
      plannedHours: number;
      otType: string;
      reason?: string;
      costCenterId?: string;
    },
    auth: AuthContext
  ) {
    const policy = await otPolicyService.resolvePolicy(
      auth.tenantId,
      input.country,
      null,
      input.requestDate
    );
    if (policy && !policy.isEligible) {
      throw new Error(`OT not eligible for country ${input.country}`);
    }
    if (policy && input.plannedHours > Number(policy.maxDailyOtHours)) {
      throw new Error(
        `Requested ${input.plannedHours}h exceeds maxDailyOtHours ${policy.maxDailyOtHours}`
      );
    }
    return (prisma as any).otRequest.create({
      data: {
        tenantId: auth.tenantId,
        ...input,
        status: 'PENDING',
      },
    });
  }

  async approve(requestId: string, auth: AuthContext) {
    return (prisma as any).otRequest.update({
      where: { id: requestId },
      data: { status: 'APPROVED', approverId: auth.userId, approvedAt: new Date() },
    });
  }

  async reject(requestId: string, reason: string, auth: AuthContext) {
    return (prisma as any).otRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        approverId: auth.userId,
        approvedAt: new Date(),
        rejectionReason: reason,
      },
    });
  }

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
      (prisma as any).otRequest.findMany({
        where,
        orderBy: { requestDate: 'desc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).otRequest.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
}

export const otRequestService = new OtRequestService();

/**
 * EPIC-12-S05 / S13: detect fraud signals on an attendance-derived OT actual.
 * Pure function — takes context, returns score + flags. Callable from tests.
 */
export interface FraudContext {
  hasApprovedRequest: boolean;
  duplicateExists: boolean;
  monthlyHoursSoFar: number;
  maxDailyOtHours: number;
  maxMonthlyOtHours: number;
  actualHours: number;
}

export function evaluateOtFraud(ctx: FraudContext): { score: number; flags: string[] } {
  const flags: string[] = [];
  let score = 0;
  if (!ctx.hasApprovedRequest) {
    flags.push('GHOST_HOURS');
    score += 40;
  }
  if (ctx.actualHours > ctx.maxDailyOtHours) {
    flags.push('EXCESSIVE_DAILY');
    score += 30;
  }
  if (ctx.monthlyHoursSoFar + ctx.actualHours > ctx.maxMonthlyOtHours) {
    flags.push('EXCESSIVE_MONTHLY');
    score += 20;
  }
  if (ctx.duplicateExists) {
    flags.push('DUPLICATE_DATE');
    score += 15;
  }
  return { score, flags };
}

export class OtActualService {
  /**
   * EPIC-12-S05 / S06 / S14: post an attendance-detected actual OT row.
   * Resolves multiplier from rate card, computes amount, and flags fraud.
   */
  async post(
    input: {
      employeeId: string;
      country: string;
      otDate: Date;
      otType: string;
      actualHours: number;
      hourlyRate?: number;
      currency?: string;
      requestId?: string;
      compOffHoursGranted?: number;
    },
    auth: AuthContext
  ) {
    const multiplier = await otRateCardService.resolveMultiplier(
      auth.tenantId,
      input.country,
      input.otType,
      input.otDate
    );
    if (multiplier == null) {
      throw new Error(`no rate card for ${input.country}/${input.otType}`);
    }
    const computedAmount =
      input.hourlyRate != null
        ? Number((input.hourlyRate * input.actualHours * multiplier).toFixed(2))
        : null;

    const policy = await otPolicyService.resolvePolicy(
      auth.tenantId,
      input.country,
      null,
      input.otDate
    );

    let hasApprovedRequest = false;
    if (input.requestId) {
      const req = await (prisma as any).otRequest.findUnique({ where: { id: input.requestId } });
      hasApprovedRequest = req?.status === 'APPROVED';
    }

    const periodStart = new Date(input.otDate.getFullYear(), input.otDate.getMonth(), 1);
    const periodEnd = new Date(
      input.otDate.getFullYear(),
      input.otDate.getMonth() + 1,
      0,
      23,
      59,
      59
    );
    const monthlyAgg = await (prisma as any).otActual.aggregate({
      _sum: { actualHours: true },
      where: {
        tenantId: auth.tenantId,
        employeeId: input.employeeId,
        otDate: { gte: periodStart, lte: periodEnd },
      },
    });
    const monthlyHoursSoFar = Number(monthlyAgg?._sum?.actualHours ?? 0);

    const existing = await (prisma as any).otActual.findUnique({
      where: {
        tenantId_employeeId_otDate_otType: {
          tenantId: auth.tenantId,
          employeeId: input.employeeId,
          otDate: input.otDate,
          otType: input.otType,
        },
      },
    });

    const fraud = evaluateOtFraud({
      hasApprovedRequest,
      duplicateExists: !!existing && existing.id !== undefined,
      monthlyHoursSoFar,
      maxDailyOtHours: Number(policy?.maxDailyOtHours ?? 2),
      maxMonthlyOtHours: Number(policy?.maxMonthlyOtHours ?? 40),
      actualHours: input.actualHours,
    });

    return (prisma as any).otActual.upsert({
      where: {
        tenantId_employeeId_otDate_otType: {
          tenantId: auth.tenantId,
          employeeId: input.employeeId,
          otDate: input.otDate,
          otType: input.otType,
        },
      },
      update: {
        actualHours: input.actualHours,
        multiplier,
        hourlyRate: input.hourlyRate,
        computedAmount,
        currency: input.currency ?? 'AED',
        requestId: input.requestId,
        compOffHoursGranted: input.compOffHoursGranted ?? 0,
        fraudScore: fraud.score,
        fraudFlags: fraud.flags,
      },
      create: {
        tenantId: auth.tenantId,
        ...input,
        multiplier,
        computedAmount,
        currency: input.currency ?? 'AED',
        compOffHoursGranted: input.compOffHoursGranted ?? 0,
        fraudScore: fraud.score,
        fraudFlags: fraud.flags,
      },
    });
  }

  /** EPIC-12-S14: mark posted to payroll. */
  async postToPayroll(id: string, _auth: AuthContext) {
    return (prisma as any).otActual.update({
      where: { id },
      data: { payrollPosted: true, payrollPostedAt: new Date() },
    });
  }

  async list(
    tenantId: string,
    filter: {
      employeeId?: string;
      fraudOnly?: boolean;
      period?: string;
    } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    let dateFilter = {};
    if (filter.period) {
      const [y, m] = filter.period.split('-').map(Number);
      if (y && m) {
        dateFilter = {
          otDate: {
            gte: new Date(y, m - 1, 1),
            lte: new Date(y, m, 0, 23, 59, 59),
          },
        };
      }
    }
    const where = {
      tenantId,
      ...(filter.employeeId ? { employeeId: filter.employeeId } : {}),
      ...(filter.fraudOnly ? { fraudScore: { gte: 40 } } : {}),
      ...dateFilter,
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).otActual.findMany({
        where,
        orderBy: { otDate: 'desc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).otActual.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
}

export const otActualService = new OtActualService();

export class OtBudgetService {
  async upsertBudget(
    input: {
      period: string;
      costCenterId?: string;
      country?: string;
      budgetHours: number;
      budgetAmount: number;
      currency?: string;
    },
    auth: AuthContext
  ) {
    return (prisma as any).otBudget.upsert({
      where: {
        tenantId_period_costCenterId: {
          tenantId: auth.tenantId,
          period: input.period,
          costCenterId: input.costCenterId ?? null,
        },
      },
      update: {
        country: input.country ?? null,
        budgetHours: input.budgetHours,
        budgetAmount: input.budgetAmount,
        currency: input.currency ?? 'AED',
      },
      create: {
        tenantId: auth.tenantId,
        period: input.period,
        costCenterId: input.costCenterId ?? null,
        country: input.country ?? null,
        budgetHours: input.budgetHours,
        budgetAmount: input.budgetAmount,
        currency: input.currency ?? 'AED',
      },
    });
  }

  async refreshActuals(period: string, auth: AuthContext) {
    const budgets = await (prisma as any).otBudget.findMany({
      where: { tenantId: auth.tenantId, period },
    });
    for (const b of budgets as Array<Record<string, unknown>>) {
      const [y, m] = period.split('-').map(Number);
      const agg = await (prisma as any).otActual.aggregate({
        _sum: { actualHours: true, computedAmount: true },
        where: {
          tenantId: auth.tenantId,
          otDate: { gte: new Date(y, m - 1, 1), lte: new Date(y, m, 0, 23, 59, 59) },
        },
      });
      await (prisma as any).otBudget.update({
        where: { id: b.id as string },
        data: {
          actualHours: agg?._sum?.actualHours ?? 0,
          actualAmount: agg?._sum?.computedAmount ?? 0,
        },
      });
    }
    return { refreshed: budgets.length };
  }

  async list(tenantId: string, period?: string) {
    return (prisma as any).otBudget.findMany({
      where: { tenantId, ...(period ? { period } : {}) },
      orderBy: [{ period: 'desc' }, { costCenterId: 'asc' }],
    });
  }
}

export const otBudgetService = new OtBudgetService();

export class OtCertificateService {
  async dashboard(tenantId: string, period: string) {
    const [y, m] = period.split('-').map(Number);
    const periodStart = new Date(y, m - 1, 1);
    const periodEnd = new Date(y, m, 0, 23, 59, 59);
    const agg = await (prisma as any).otActual.aggregate({
      _sum: { actualHours: true, computedAmount: true },
      _count: { _all: true },
      where: { tenantId, otDate: { gte: periodStart, lte: periodEnd } },
    });
    const fraudCount = await (prisma as any).otActual.count({
      where: {
        tenantId,
        otDate: { gte: periodStart, lte: periodEnd },
        fraudScore: { gte: 40 },
      },
    });
    const budgets = await (prisma as any).otBudget.findMany({
      where: { tenantId, period },
    });
    let budgetBreachCount = 0;
    for (const b of budgets as Array<Record<string, unknown>>) {
      if (Number(b.actualAmount ?? 0) > Number(b.budgetAmount ?? 0)) budgetBreachCount += 1;
    }
    const exceedsCount = await (prisma as any).otActual.count({
      where: {
        tenantId,
        otDate: { gte: periodStart, lte: periodEnd },
        fraudFlags: { array_contains: 'EXCESSIVE_DAILY' as any },
      },
    });
    return {
      period,
      totalHours: Number(agg?._sum?.actualHours ?? 0),
      totalAmount: Number(agg?._sum?.computedAmount ?? 0),
      actualsCount: Number(agg?._count?._all ?? 0),
      fraudCount,
      exceedsCount,
      budgetBreachCount,
    };
  }

  async generate(period: string, auth: AuthContext) {
    const stats = await this.dashboard(auth.tenantId, period);
    const reasons: string[] = [];
    if (stats.fraudCount > 0) reasons.push(`${stats.fraudCount} fraud-flagged actual(s)`);
    if (stats.budgetBreachCount > 0) reasons.push(`${stats.budgetBreachCount} budget breach(es)`);
    const gatingReason = reasons.length ? `Blocked: ${reasons.join('; ')}` : null;
    return (prisma as any).otCertificate.upsert({
      where: { tenantId_period: { tenantId: auth.tenantId, period } },
      update: {
        totalHours: stats.totalHours,
        totalAmount: stats.totalAmount,
        exceedsCount: stats.exceedsCount,
        fraudCount: stats.fraudCount,
        budgetBreachCount: stats.budgetBreachCount,
        gatingReason,
        generatedAt: new Date(),
        status: 'DRAFT',
      },
      create: {
        tenantId: auth.tenantId,
        period,
        totalHours: stats.totalHours,
        totalAmount: stats.totalAmount,
        exceedsCount: stats.exceedsCount,
        fraudCount: stats.fraudCount,
        budgetBreachCount: stats.budgetBreachCount,
        gatingReason,
        generatedAt: new Date(),
        status: 'DRAFT',
      },
    });
  }

  async sign(
    period: string,
    attestations: Array<{ field: string; value: string }>,
    auth: AuthContext
  ) {
    const cert = await (prisma as any).otCertificate.findUnique({
      where: { tenantId_period: { tenantId: auth.tenantId, period } },
    });
    if (!cert) throw new Error('certificate not generated');
    if (cert.gatingReason) throw new Error(`cannot sign while gated: ${cert.gatingReason}`);
    return (prisma as any).otCertificate.update({
      where: { id: cert.id },
      data: {
        status: 'SIGNED',
        signedAt: new Date(),
        signedBy: auth.userId,
        attestationsJson: attestations,
      },
    });
  }

  async list(tenantId: string) {
    return (prisma as any).otCertificate.findMany({
      where: { tenantId },
      orderBy: { period: 'desc' },
      take: 24,
    });
  }
}

export const otCertificateService = new OtCertificateService();

export const OT_CONSTANTS = { DEFAULT_RATE_CARDS };
