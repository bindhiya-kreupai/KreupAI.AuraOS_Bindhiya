import { prisma } from '@aura/database';
import type { AuthContext, Severity } from './types';

export interface ExceptionInput {
  domain: string;
  registerCode: string; // e.g., PAYROLL_EXCEPTION, IMMIGRATION_EXCEPTION
  sourceType: string;
  sourceId: string;
  title: string;
  description: string;
  severity: Severity;
  ownerRole: string;
  dueDate?: Date;
  redFlagId?: string;
}

/**
 * EPIC-37-S06 / S07 / S08: compliance exception register.
 *
 * Single register table, partitioned per domain by registerCode.
 * Payroll, immigration and audit exception registers share the same engine.
 */
export class ComplianceExceptionService {
  async raise(input: ExceptionInput, auth: AuthContext) {
    return (prisma as any).complianceException.create({
      data: {
        tenantId: auth.tenantId,
        domain: input.domain,
        registerCode: input.registerCode,
        sourceType: input.sourceType,
        sourceId: input.sourceId,
        title: input.title,
        description: input.description,
        severity: input.severity,
        ownerRole: input.ownerRole,
        dueDate: input.dueDate,
        status: 'OPEN',
        redFlagId: input.redFlagId,
      },
    });
  }

  async close(exceptionId: string, auth: AuthContext) {
    return (prisma as any).complianceException.update({
      where: { id: exceptionId },
      data: { status: 'CLOSED', closedAt: new Date() },
    });
  }

  async accept(exceptionId: string, auth: AuthContext) {
    return (prisma as any).complianceException.update({
      where: { id: exceptionId },
      data: { status: 'ACCEPTED' },
    });
  }

  async list(
    tenantId: string,
    filter: { domain?: string; registerCode?: string; status?: string; severity?: string } = {}
  ) {
    return (prisma as any).complianceException.findMany({
      where: {
        tenantId,
        ...(filter.domain ? { domain: filter.domain } : {}),
        ...(filter.registerCode ? { registerCode: filter.registerCode } : {}),
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.severity ? { severity: filter.severity } : {}),
      },
      orderBy: [{ severity: 'asc' }, { dueDate: 'asc' }],
      take: 500,
    });
  }

  async countOpenCritical(tenantId: string, domain?: string) {
    return (prisma as any).complianceException.count({
      where: {
        tenantId,
        severity: 'CRITICAL',
        status: 'OPEN',
        ...(domain ? { domain } : {}),
      },
    });
  }
}

export const complianceExceptionService = new ComplianceExceptionService();
