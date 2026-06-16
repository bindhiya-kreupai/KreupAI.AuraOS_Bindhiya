import { prisma } from '@aura/database';
import type { AuthContext } from './types';

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

  async list(tenantId: string, filter: { status?: string; severity?: string } = {}) {
    return (prisma as any).wpsException.findMany({
      where: { tenantId, ...filter },
      orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }],
      take: 500,
    });
  }

  async listDelayFlags(
    tenantId: string,
    filter: { status?: string; severity?: string; period?: string } = {}
  ) {
    return (prisma as any).salaryDelayFlag.findMany({
      where: { tenantId, ...filter },
      orderBy: [{ raisedAt: 'desc' }],
      take: 500,
    });
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
