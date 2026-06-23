/**
 * EPIC-21: Public & Religious Holidays Compliance.
 *
 * Overlay on existing Holiday + HolidayCalendar models.
 * Adds country × holiday-class (NATIONAL / RELIGIOUS / ISLAMIC_NEW_YEAR /
 * EID_AL_FITR / EID_AL_ADHA / RAMADAN_OBSERVANCE / SPECIAL / SECTOR)
 * pay rule with base + OT multipliers and comp-off accrual, holiday-
 * work approval workflow, comp-off ledger with expiry, and monthly
 * compliance certificate. Certificate refuses to sign while pending
 * work approvals, unapproved holiday work, or comp-offs expiring within
 * 30 days remain.
 *
 * Default rates (representative — configurable):
 *   UAE NATIONAL/RELIGIOUS — base 1×, OT ×2.5, comp-off 1d
 *   KSA RELIGIOUS — base 1×, OT ×2, comp-off 1d
 *   BH/QA/OM/KW — base 1×, OT ×2, comp-off 1d
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

export type HolidayClass =
  | 'NATIONAL'
  | 'RELIGIOUS'
  | 'EID_AL_FITR'
  | 'EID_AL_ADHA'
  | 'ISLAMIC_NEW_YEAR'
  | 'RAMADAN_OBSERVANCE'
  | 'SPECIAL'
  | 'SECTOR';

export const DEFAULT_PAY_RULES: Array<{
  country: string;
  holidayClass: HolidayClass;
  baseMultiplier: number;
  otMultiplier: number;
  compOffDaysAccrued: number;
}> = [
  {
    country: 'UAE',
    holidayClass: 'NATIONAL',
    baseMultiplier: 1,
    otMultiplier: 2.5,
    compOffDaysAccrued: 1,
  },
  {
    country: 'UAE',
    holidayClass: 'RELIGIOUS',
    baseMultiplier: 1,
    otMultiplier: 2.5,
    compOffDaysAccrued: 1,
  },
  {
    country: 'UAE',
    holidayClass: 'EID_AL_FITR',
    baseMultiplier: 1,
    otMultiplier: 2.5,
    compOffDaysAccrued: 1,
  },
  {
    country: 'UAE',
    holidayClass: 'EID_AL_ADHA',
    baseMultiplier: 1,
    otMultiplier: 2.5,
    compOffDaysAccrued: 1,
  },
  {
    country: 'KSA',
    holidayClass: 'NATIONAL',
    baseMultiplier: 1,
    otMultiplier: 2,
    compOffDaysAccrued: 1,
  },
  {
    country: 'KSA',
    holidayClass: 'RELIGIOUS',
    baseMultiplier: 1,
    otMultiplier: 2,
    compOffDaysAccrued: 1,
  },
  {
    country: 'KSA',
    holidayClass: 'EID_AL_FITR',
    baseMultiplier: 1,
    otMultiplier: 2,
    compOffDaysAccrued: 1,
  },
  {
    country: 'KSA',
    holidayClass: 'EID_AL_ADHA',
    baseMultiplier: 1,
    otMultiplier: 2,
    compOffDaysAccrued: 1,
  },
  {
    country: 'BAHRAIN',
    holidayClass: 'NATIONAL',
    baseMultiplier: 1,
    otMultiplier: 2,
    compOffDaysAccrued: 1,
  },
  {
    country: 'BAHRAIN',
    holidayClass: 'RELIGIOUS',
    baseMultiplier: 1,
    otMultiplier: 2,
    compOffDaysAccrued: 1,
  },
  {
    country: 'QATAR',
    holidayClass: 'NATIONAL',
    baseMultiplier: 1,
    otMultiplier: 2.5,
    compOffDaysAccrued: 1,
  },
  {
    country: 'QATAR',
    holidayClass: 'RELIGIOUS',
    baseMultiplier: 1,
    otMultiplier: 2.5,
    compOffDaysAccrued: 1,
  },
  {
    country: 'OMAN',
    holidayClass: 'NATIONAL',
    baseMultiplier: 1,
    otMultiplier: 2,
    compOffDaysAccrued: 1,
  },
  {
    country: 'OMAN',
    holidayClass: 'RELIGIOUS',
    baseMultiplier: 1,
    otMultiplier: 2,
    compOffDaysAccrued: 1,
  },
  {
    country: 'KUWAIT',
    holidayClass: 'NATIONAL',
    baseMultiplier: 1,
    otMultiplier: 2,
    compOffDaysAccrued: 1,
  },
  {
    country: 'KUWAIT',
    holidayClass: 'RELIGIOUS',
    baseMultiplier: 1,
    otMultiplier: 2,
    compOffDaysAccrued: 1,
  },
];

export class HolidayPayRuleService {
  async seedDefaults(auth: AuthContext, effectiveFrom: Date = new Date()) {
    const created: string[] = [];
    for (const r of DEFAULT_PAY_RULES) {
      try {
        await (prisma as any).holidayPayRule.create({
          data: { tenantId: auth.tenantId, ...r, effectiveFrom, status: 'ACTIVE' },
        });
        created.push(`${r.country}/${r.holidayClass}`);
      } catch (err) {
        if (!String(err).includes('Unique')) throw err;
      }
    }
    return { created };
  }

  async upsert(
    input: {
      country: string;
      holidayClass: HolidayClass;
      baseMultiplier?: number;
      otMultiplier?: number;
      compOffDaysAccrued?: number;
      isPaid?: boolean;
      ramadanReducedHours?: number;
      effectiveFrom: Date;
    },
    auth: AuthContext
  ) {
    return (prisma as any).holidayPayRule.upsert({
      where: {
        aura_holiday_pay_rule_unique: {
          tenantId: auth.tenantId,
          country: input.country,
          holidayClass: input.holidayClass,
          effectiveFrom: input.effectiveFrom,
        },
      },
      update: { ...input, status: 'ACTIVE' },
      create: { tenantId: auth.tenantId, ...input, status: 'ACTIVE' },
    });
  }

  async list(tenantId: string, filter: { country?: string } = {}) {
    return (prisma as any).holidayPayRule.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        ...(filter.country ? { country: filter.country } : {}),
      },
      orderBy: [{ country: 'asc' }, { holidayClass: 'asc' }],
    });
  }

  async resolve(tenantId: string, country: string, holidayClass: string, asOf: Date = new Date()) {
    const rows = await (prisma as any).holidayPayRule.findMany({
      where: {
        tenantId,
        country,
        holidayClass,
        status: 'ACTIVE',
        effectiveFrom: { lte: asOf },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: asOf } }],
      },
      orderBy: { effectiveFrom: 'desc' },
      take: 1,
    });
    return rows[0] ?? null;
  }
}

export const holidayPayRuleService = new HolidayPayRuleService();

export class HolidayWorkApprovalService {
  async request(
    input: {
      employeeId: string;
      holidayDate: Date;
      holidayLabel?: string;
      holidayClass: HolidayClass;
      country: string;
      plannedHours: number;
      reason?: string;
    },
    auth: AuthContext
  ) {
    return (prisma as any).holidayWorkApproval.create({
      data: {
        tenantId: auth.tenantId,
        ...input,
        requestedBy: auth.userId,
        status: 'PENDING',
      },
    });
  }

  async approve(id: string, auth: AuthContext) {
    const req = await (prisma as any).holidayWorkApproval.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approverId: auth.userId,
        approvedAt: new Date(),
      },
    });
    // Auto-accrue comp-off based on pay rule
    const rule = await holidayPayRuleService.resolve(
      auth.tenantId,
      req.country,
      req.holidayClass,
      req.holidayDate
    );
    if (rule && Number(rule.compOffDaysAccrued) > 0) {
      const expiresAt = new Date(req.holidayDate);
      expiresAt.setMonth(expiresAt.getMonth() + 6);
      await (prisma as any).holidayCompOff.create({
        data: {
          tenantId: auth.tenantId,
          employeeId: req.employeeId,
          workApprovalId: id,
          earnedDate: req.holidayDate,
          daysAccrued: rule.compOffDaysAccrued,
          expiresAt,
          status: 'AVAILABLE',
        },
      });
    }
    return req;
  }

  async reject(id: string, reason: string, auth: AuthContext) {
    return (prisma as any).holidayWorkApproval.update({
      where: { id },
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
    filter: { status?: string; employeeId?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.employeeId ? { employeeId: filter.employeeId } : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).holidayWorkApproval.findMany({
        where,
        orderBy: { holidayDate: 'desc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).holidayWorkApproval.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
}

export const holidayWorkApprovalService = new HolidayWorkApprovalService();

export class HolidayCompOffService {
  async consume(id: string, daysToConsume: number, _auth: AuthContext) {
    const cur = await (prisma as any).holidayCompOff.findUnique({ where: { id } });
    if (!cur) throw new Error('comp-off not found');
    const available = Number(cur.daysAccrued) - Number(cur.daysConsumed);
    if (daysToConsume > available) throw new Error(`only ${available}d available`);
    const newConsumed = Number(cur.daysConsumed) + daysToConsume;
    return (prisma as any).holidayCompOff.update({
      where: { id },
      data: {
        daysConsumed: newConsumed,
        status: newConsumed >= Number(cur.daysAccrued) ? 'CONSUMED' : 'AVAILABLE',
      },
    });
  }

  async list(
    tenantId: string,
    filter: { employeeId?: string; expiringSoonDays?: number } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    let dateFilter = {};
    if (filter.expiringSoonDays != null) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() + filter.expiringSoonDays);
      dateFilter = { expiresAt: { gte: new Date(), lte: cutoff }, status: 'AVAILABLE' };
    }
    const where = {
      tenantId,
      ...(filter.employeeId ? { employeeId: filter.employeeId } : {}),
      ...dateFilter,
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).holidayCompOff.findMany({
        where,
        orderBy: { earnedDate: 'desc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).holidayCompOff.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
}

export const holidayCompOffService = new HolidayCompOffService();

export class HolidayCertificateService {
  async dashboard(tenantId: string, period: string) {
    const [y, m] = period.split('-').map(Number);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);
    let publishedHolidaysCount = 0;
    let provisionalCount = 0;
    try {
      publishedHolidaysCount = await (prisma as any).holiday.count({
        where: { tenantId, date: { gte: start, lte: end } },
      });
      provisionalCount = await (prisma as any).holiday.count({
        where: { tenantId, isProvisional: true, date: { gte: start, lte: end } },
      });
    } catch {
      publishedHolidaysCount = 0;
      provisionalCount = 0;
    }
    const workApprovalsTotal = await (prisma as any).holidayWorkApproval.count({
      where: { tenantId, holidayDate: { gte: start, lte: end } },
    });
    const workApprovalsPending = await (prisma as any).holidayWorkApproval.count({
      where: { tenantId, status: 'PENDING' },
    });
    const compOffAgg = await (prisma as any).holidayCompOff.aggregate({
      _sum: { daysAccrued: true, daysConsumed: true },
      where: { tenantId, status: 'AVAILABLE' },
    });
    const compOffAvailableDays =
      Number(compOffAgg?._sum?.daysAccrued ?? 0) - Number(compOffAgg?._sum?.daysConsumed ?? 0);
    const compOffExpiringSoon = await (prisma as any).holidayCompOff.count({
      where: {
        tenantId,
        status: 'AVAILABLE',
        expiresAt: {
          gte: new Date(),
          lte: new Date(Date.now() + 30 * 24 * 3600 * 1000),
        },
      },
    });
    // Unapproved holiday work: requests that already happened but still PENDING.
    const unapprovedHolidayWorkCount = await (prisma as any).holidayWorkApproval.count({
      where: { tenantId, status: 'PENDING', holidayDate: { lt: new Date() } },
    });
    return {
      period,
      publishedHolidaysCount,
      provisionalCount,
      workApprovalsTotal,
      workApprovalsPending,
      compOffAvailableDays,
      compOffExpiringSoon,
      unapprovedHolidayWorkCount,
    };
  }

  async generate(period: string, auth: AuthContext) {
    const stats = await this.dashboard(auth.tenantId, period);
    const reasons: string[] = [];
    if (stats.workApprovalsPending > 0)
      reasons.push(`${stats.workApprovalsPending} pending approval(s)`);
    if (stats.unapprovedHolidayWorkCount > 0)
      reasons.push(`${stats.unapprovedHolidayWorkCount} unapproved past-date holiday work`);
    if (stats.compOffExpiringSoon > 0)
      reasons.push(`${stats.compOffExpiringSoon} comp-off expiring ≤30d`);
    const gatingReason = reasons.length ? `Blocked: ${reasons.join('; ')}` : null;
    return (prisma as any).holidayCertificate.upsert({
      where: { aura_holiday_certificate_unique: { tenantId: auth.tenantId, period } },
      update: { ...stats, gatingReason, generatedAt: new Date(), status: 'DRAFT' },
      create: {
        tenantId: auth.tenantId,
        ...stats,
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
    const cert = await (prisma as any).holidayCertificate.findUnique({
      where: { aura_holiday_certificate_unique: { tenantId: auth.tenantId, period } },
    });
    if (!cert) throw new Error('certificate not generated');
    if (cert.gatingReason) throw new Error(`cannot sign while gated: ${cert.gatingReason}`);
    return (prisma as any).holidayCertificate.update({
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
    return (prisma as any).holidayCertificate.findMany({
      where: { tenantId },
      orderBy: { period: 'desc' },
      take: 24,
    });
  }
}

export const holidayCertificateService = new HolidayCertificateService();

export const HOLIDAY_CONSTANTS = { DEFAULT_PAY_RULES };
