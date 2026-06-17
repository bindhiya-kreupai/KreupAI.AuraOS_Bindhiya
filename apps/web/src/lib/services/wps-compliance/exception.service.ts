import { prisma } from '@aura/database';
import type { AuthContext } from './types';
import {
  normalisePaging,
  prismaPageArgs,
  buildPaginatedResult,
  type PaginationInput,
  type PaginatedResult,
} from '@/lib/services/pagination';

export interface WpsExceptionInput {
  submissionId?: string;
  employeeId?: string;
  code: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  ownerRole: string;
  dueDate?: Date;
}

/**
 * EPIC-11-S08 / S09: WPS exception register + salary-delay flag controls.
 */
export class WpsExceptionService {
  async raise(input: WpsExceptionInput, auth: AuthContext) {
    return (prisma as any).wpsException.create({
      data: { tenantId: auth.tenantId, status: 'OPEN', ...input },
    });
  }

  async resolve(exceptionId: string, auth: AuthContext) {
    return (prisma as any).wpsException.update({
      where: { id: exceptionId },
      data: { status: 'RESOLVED', resolvedAt: new Date(), resolvedBy: auth.userId },
    });
  }

  async list(
    tenantId: string,
    filter: { status?: string; severity?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = { tenantId, ...filter };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).wpsException.findMany({
        where,
        orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }],
        ...prismaPageArgs(page),
      }),
      (prisma as any).wpsException.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }

  async listDelayFlags(
    tenantId: string,
    filter: { status?: string; severity?: string; period?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = { tenantId, ...filter };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).salaryDelayFlag.findMany({
        where,
        orderBy: [{ raisedAt: 'desc' }],
        ...prismaPageArgs(page),
      }),
      (prisma as any).salaryDelayFlag.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }

  async resolveDelayFlag(flagId: string) {
    return (prisma as any).salaryDelayFlag.update({
      where: { id: flagId },
      data: { status: 'RESOLVED', resolvedAt: new Date() },
    });
  }

  /**
   * EPIC-11-S09: detect salary delay against an arbitrary credited date.
   * Used during reconcile() to track per-employee delays.
   */
  async recordDelay(
    input: {
      employeeId: string;
      countryCode: string;
      period: string;
      dueDate: Date;
      creditedAt: Date;
      submissionId?: string;
    },
    auth: AuthContext
  ) {
    const ms = input.creditedAt.getTime() - input.dueDate.getTime();
    if (ms <= 0) return null;
    const daysLate = Math.ceil(ms / (24 * 3600 * 1000));
    const severity = daysLate > 15 ? 'CRITICAL' : daysLate > 7 ? 'HIGH' : 'MEDIUM';
    try {
      return await (prisma as any).salaryDelayFlag.create({
        data: {
          tenantId: auth.tenantId,
          submissionId: input.submissionId,
          employeeId: input.employeeId,
          countryCode: input.countryCode,
          period: input.period,
          dueDate: input.dueDate,
          creditedAt: input.creditedAt,
          daysLate,
          severity,
          status: 'OPEN',
        },
      });
    } catch (err) {
      if (String(err).includes('Unique')) return null;
      throw err;
    }
  }
}

export const wpsExceptionService = new WpsExceptionService();
