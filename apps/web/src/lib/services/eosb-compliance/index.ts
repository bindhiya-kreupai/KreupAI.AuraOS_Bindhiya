/**
 * EPIC-28: EOSB Compliance — persistence + workflow layer.
 *
 * The country-by-country math (UAE/KSA/BH/QA/OM/KW/IN) is already in
 * compliance/eosb.service.ts. This service persists:
 *   - finalized at-separation calculations (status DRAFT → APPROVED → SETTLED)
 *   - monthly accrual snapshots for GL provisioning with monthly delta
 *   - dispute register (OPEN → UNDER_REVIEW → RESOLVED)
 *   - monthly compliance certificate aggregating all of the above,
 *     refusing to sign while open disputes or unsettled calculations exist.
 */

import { prisma } from '@aura/database';
import { EOSBService } from '@/lib/services/compliance/eosb.service';
import type {
  EOSBCalculationInput,
  EOSBCalculationResult,
  SupportedCountryCode,
  TerminationType,
} from '@/lib/services/compliance/types';
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

export class EosbCalculationService {
  /**
   * Persist a finalized at-separation EOSB calculation.
   * Re-runs the calculator with current inputs and stores both inputs and
   * the resolved result for audit.
   */
  async finalize(
    input: {
      employeeId: string;
      countryCode: SupportedCountryCode;
      joiningDate: Date;
      lastWorkingDate: Date;
      basicSalary: number;
      terminationType: TerminationType;
      unpaidLeaveDays?: number;
      socialInsuranceOffset?: number;
    },
    auth: AuthContext
  ) {
    const employee = await prisma.employee.findFirst({
      where: {
        id: input.employeeId,
        company: {
          tenantId: auth.tenantId,
        },
      },
    });
    if (!employee) {
      throw new Error(`Employee with ID ${input.employeeId} not found`);
    }
    const calcInput: EOSBCalculationInput = {
      employeeId: input.employeeId,
      countryCode: input.countryCode,
      joiningDate: input.joiningDate,
      lastWorkingDate: input.lastWorkingDate,
      basicSalary: input.basicSalary,
      terminationType: input.terminationType,
    };
    const result: EOSBCalculationResult = EOSBService.calculate(calcInput);
    const offset = input.socialInsuranceOffset ?? 0;
    const netPayable = Math.max(0, result.netAmount - offset);

    return (prisma as any).eosbCalculation.upsert({
      where: {
        tenantId_employeeId_lastWorkingDate: {
          tenantId: auth.tenantId,
          employeeId: input.employeeId,
          lastWorkingDate: input.lastWorkingDate,
        },
      },
      update: {
        countryCode: input.countryCode,
        joiningDate: input.joiningDate,
        terminationType: input.terminationType,
        basicSalary: input.basicSalary,
        totalServiceYears: result.yearsOfService,
        totalServiceMonths: result.monthsOfService,
        unpaidLeaveDays: input.unpaidLeaveDays ?? 0,
        dailyRate: result.dailyRate,
        gratuityAmount: result.netAmount,
        socialInsuranceOffset: offset,
        netPayable,
        currency: result.currency,
        law: result.calculationDetails.law,
        formula: result.calculationDetails.formula,
        notesJson: result.calculationDetails.notes,
        status: 'DRAFT',
      },
      create: {
        tenantId: auth.tenantId,
        employeeId: input.employeeId,
        countryCode: input.countryCode,
        joiningDate: input.joiningDate,
        lastWorkingDate: input.lastWorkingDate,
        terminationType: input.terminationType,
        basicSalary: input.basicSalary,
        totalServiceYears: result.yearsOfService,
        totalServiceMonths: result.monthsOfService,
        unpaidLeaveDays: input.unpaidLeaveDays ?? 0,
        dailyRate: result.dailyRate,
        gratuityAmount: result.netAmount,
        socialInsuranceOffset: offset,
        netPayable,
        currency: result.currency,
        law: result.calculationDetails.law,
        formula: result.calculationDetails.formula,
        notesJson: result.calculationDetails.notes,
        status: 'DRAFT',
      },
    });
  }

  async approve(id: string, auth: AuthContext) {
    return (prisma as any).eosbCalculation.update({
      where: { id },
      data: { status: 'APPROVED', approvedAt: new Date(), approvedBy: auth.userId },
    });
  }

  async settle(id: string, paymentReference: string, _auth: AuthContext) {
    return (prisma as any).eosbCalculation.update({
      where: { id },
      data: {
        status: 'SETTLED',
        settledAt: new Date(),
        paymentReference,
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
      (prisma as any).eosbCalculation.findMany({
        where,
        orderBy: { lastWorkingDate: 'desc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).eosbCalculation.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
}

export const eosbCalculationService = new EosbCalculationService();

export class EosbAccrualService {
  /**
   * Snapshot accrual for the period — runs calc as-of period end, computes
   * delta vs prior period for GL posting.
   */
  async snapshot(
    input: {
      employeeId: string;
      period: string;
      countryCode: SupportedCountryCode;
      joiningDate: Date;
      basicSalary: number;
    },
    auth: AuthContext
  ) {
    const employee = await prisma.employee.findFirst({
      where: {
        id: input.employeeId,
        company: {
          tenantId: auth.tenantId,
        },
      },
    });
    if (!employee) {
      throw new Error(`Employee with ID ${input.employeeId} not found`);
    }
    const [y, m] = input.period.split('-').map(Number);
    const periodEnd = new Date(y, m, 0, 23, 59, 59);
    const result = EOSBService.calculate({
      employeeId: input.employeeId,
      countryCode: input.countryCode,
      joiningDate: input.joiningDate,
      lastWorkingDate: periodEnd,
      basicSalary: input.basicSalary,
      terminationType: 'END_OF_CONTRACT',
    });

    const priorMonth = new Date(y, m - 2, 0, 23, 59, 59);
    const priorPeriod = `${priorMonth.getFullYear()}-${String(priorMonth.getMonth() + 1).padStart(2, '0')}`;
    const prior = await (prisma as any).eosbAccrual.findUnique({
      where: {
        tenantId_employeeId_period: {
          tenantId: auth.tenantId,
          employeeId: input.employeeId,
          period: priorPeriod,
        },
      },
    });
    const monthDelta = result.netAmount - Number(prior?.accruedGratuity ?? 0);

    return (prisma as any).eosbAccrual.upsert({
      where: {
        tenantId_employeeId_period: {
          tenantId: auth.tenantId,
          employeeId: input.employeeId,
          period: input.period,
        },
      },
      update: {
        countryCode: input.countryCode,
        basicSalary: input.basicSalary,
        serviceMonths: result.monthsOfService,
        accruedGratuity: result.netAmount,
        monthDelta,
        currency: result.currency,
      },
      create: {
        tenantId: auth.tenantId,
        employeeId: input.employeeId,
        period: input.period,
        countryCode: input.countryCode,
        basicSalary: input.basicSalary,
        serviceMonths: result.monthsOfService,
        accruedGratuity: result.netAmount,
        monthDelta,
        currency: result.currency,
      },
    });
  }

  async markGlPosted(id: string, glJournalRef: string, _auth: AuthContext) {
    return (prisma as any).eosbAccrual.update({
      where: { id },
      data: { glPosted: true, glJournalRef },
    });
  }

  async list(
    tenantId: string,
    period?: string,
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = { tenantId, ...(period ? { period } : {}) };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).eosbAccrual.findMany({
        where,
        orderBy: [{ period: 'desc' }, { employeeId: 'asc' }],
        ...prismaPageArgs(page),
      }),
      (prisma as any).eosbAccrual.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
}

export const eosbAccrualService = new EosbAccrualService();

export class EosbDisputeService {
  async raise(
    input: {
      employeeId: string;
      calculationId?: string;
      subject: string;
      claimedAmount?: number;
      calculatedAmount?: number;
      currency: string;
      category: string;
    },
    auth: AuthContext
  ) {
    const employee = await prisma.employee.findFirst({
      where: {
        id: input.employeeId,
        company: {
          tenantId: auth.tenantId,
        },
      },
    });
    if (!employee) {
      throw new Error(`Employee with ID ${input.employeeId} not found`);
    }

    const {
      employeeId,
      calculationId,
      subject,
      claimedAmount,
      calculatedAmount,
      currency,
      category,
    } = input;

    return (prisma as any).eosbDispute.create({
      data: {
        tenantId: auth.tenantId,
        employeeId,
        calculationId: calculationId || null,
        subject,
        claimedAmount,
        calculatedAmount,
        currency,
        category,
        raisedBy: auth.userId,
        status: 'OPEN',
      },
    });
  }

  async transition(
    id: string,
    next: 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED' | 'WITHDRAWN',
    resolutionNotes: string | undefined,
    auth: AuthContext
  ) {
    return (prisma as any).eosbDispute.update({
      where: { id },
      data: {
        status: next,
        resolutionNotes,
        resolvedAt:
          next === 'RESOLVED' || next === 'REJECTED' || next === 'WITHDRAWN' ? new Date() : null,
        resolvedBy:
          next === 'RESOLVED' || next === 'REJECTED' || next === 'WITHDRAWN' ? auth.userId : null,
      },
    });
  }

  async list(
    tenantId: string,
    filter: { status?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = { tenantId, ...(filter.status ? { status: filter.status } : {}) };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).eosbDispute.findMany({
        where,
        orderBy: { raisedAt: 'desc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).eosbDispute.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
}

export const eosbDisputeService = new EosbDisputeService();

export class EosbCertificateService {
  async dashboard(tenantId: string, period: string) {
    const [y, m] = period.split('-').map(Number);
    const periodStart = new Date(y, m - 1, 1);
    const periodEnd = new Date(y, m, 0, 23, 59, 59);
    const calcAgg = await (prisma as any).eosbCalculation.aggregate({
      _sum: { netPayable: true },
      _count: { _all: true },
      where: { tenantId, lastWorkingDate: { gte: periodStart, lte: periodEnd } },
    });
    const accAgg = await (prisma as any).eosbAccrual.aggregate({
      _sum: { accruedGratuity: true },
      _count: { _all: true },
      where: { tenantId, period },
    });
    const openDisputesCount = await (prisma as any).eosbDispute.count({
      where: { tenantId, status: { in: ['OPEN', 'UNDER_REVIEW'] } },
    });
    const unsettledCount = await (prisma as any).eosbCalculation.count({
      where: {
        tenantId,
        lastWorkingDate: { gte: periodStart, lte: periodEnd },
        status: { not: 'SETTLED' },
      },
    });
    return {
      period,
      calcsCount: Number(calcAgg?._count?._all ?? 0),
      calcsTotalAmount: Number(calcAgg?._sum?.netPayable ?? 0),
      accrualsCount: Number(accAgg?._count?._all ?? 0),
      accrualsTotalAmount: Number(accAgg?._sum?.accruedGratuity ?? 0),
      openDisputesCount,
      unsettledCount,
    };
  }

  async generate(period: string, auth: AuthContext) {
    const stats = await this.dashboard(auth.tenantId, period);
    const reasons: string[] = [];
    if (stats.openDisputesCount > 0) reasons.push(`${stats.openDisputesCount} open dispute(s)`);
    if (stats.unsettledCount > 0) reasons.push(`${stats.unsettledCount} unsettled calculation(s)`);
    const gatingReason = reasons.length ? `Blocked: ${reasons.join('; ')}` : null;
    return (prisma as any).eosbCertificate.upsert({
      where: { tenantId_period: { tenantId: auth.tenantId, period } },
      update: {
        calcsCount: stats.calcsCount,
        calcsTotalAmount: stats.calcsTotalAmount,
        accrualsCount: stats.accrualsCount,
        accrualsTotalAmount: stats.accrualsTotalAmount,
        openDisputesCount: stats.openDisputesCount,
        unsettledCount: stats.unsettledCount,
        gatingReason,
        generatedAt: new Date(),
        status: 'DRAFT',
      },
      create: {
        tenantId: auth.tenantId,
        period,
        calcsCount: stats.calcsCount,
        calcsTotalAmount: stats.calcsTotalAmount,
        accrualsCount: stats.accrualsCount,
        accrualsTotalAmount: stats.accrualsTotalAmount,
        openDisputesCount: stats.openDisputesCount,
        unsettledCount: stats.unsettledCount,
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
    const cert = await (prisma as any).eosbCertificate.findUnique({
      where: { tenantId_period: { tenantId: auth.tenantId, period } },
    });
    if (!cert) throw new Error('certificate not generated');
    if (cert.gatingReason) throw new Error(`cannot sign while gated: ${cert.gatingReason}`);
    return (prisma as any).eosbCertificate.update({
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
    return (prisma as any).eosbCertificate.findMany({
      where: { tenantId },
      orderBy: { period: 'desc' },
      take: 24,
    });
  }
}

export const eosbCertificateService = new EosbCertificateService();
