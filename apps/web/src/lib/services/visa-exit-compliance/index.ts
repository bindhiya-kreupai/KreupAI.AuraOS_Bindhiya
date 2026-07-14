/**
 * EPIC-29: Visa / Work Permit / Immigration Exit Compliance.
 *
 * Orchestrates the case from opening (last-working-day trigger) to
 * closure (visa cancelled, grace expired or extended, dependents
 * cascaded, ticket issued, SI closure recorded, final settlement linked,
 * authority-portal evidence captured). PRO action register tracks the
 * mukhtar / typist / authority-portal tasks. Monthly certificate
 * aggregates KPIs and refuses to sign while overdue PRO actions,
 * missing evidence, or grace expiries remain.
 *
 * Default grace periods per country (configurable, representative):
 *   UAE — 30 days post-cancellation
 *   KSA — 60 days exit-re-entry
 *   BAHRAIN — 30 days
 *   QATAR — 30 days
 *   OMAN — 30 days
 *   KUWAIT — 60 days
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

export type ExitScenario =
  | 'RESIGNATION'
  | 'TERMINATION'
  | 'END_OF_CONTRACT'
  | 'RETIREMENT'
  | 'TRANSFER'
  | 'ABSCONDING'
  | 'DEATH';

export type CaseStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'AWAITING_AUTHORITY'
  | 'AWAITING_EMPLOYEE'
  | 'CLOSED'
  | 'CANCELLED';

export const DEFAULT_GRACE_DAYS: Record<string, number> = {
  UAE: 30,
  KSA: 60,
  BAHRAIN: 30,
  QATAR: 30,
  OMAN: 30,
  KUWAIT: 60,
};

/** EPIC-29-S03 / S17: standard PRO action list per scenario. */
export const PRO_ACTIONS_BY_SCENARIO: Record<
  string,
  Array<{ actionCode: string; label: string; authority?: string; offsetDays?: number }>
> = {
  DEFAULT: [
    {
      actionCode: 'CANCEL_WORK_PERMIT',
      label: 'Cancel work permit',
      authority: 'MOHRE',
      offsetDays: 7,
    },
    {
      actionCode: 'CANCEL_RESIDENCE_VISA',
      label: 'Cancel residence visa',
      authority: 'GDRFA',
      offsetDays: 14,
    },
    {
      actionCode: 'CASCADE_DEPENDENTS',
      label: 'Cascade dependent visas',
      authority: 'GDRFA',
      offsetDays: 14,
    },
    { actionCode: 'ISSUE_REPATRIATION_TICKET', label: 'Issue repatriation ticket', offsetDays: 7 },
    { actionCode: 'CLOSE_SI', label: 'Close social insurance registration', offsetDays: 30 },
    {
      actionCode: 'EXIT_STAMPING',
      label: 'Exit stamping confirmation',
      authority: 'GDRFA',
      offsetDays: 30,
    },
  ],
  ABSCONDING: [
    {
      actionCode: 'FILE_ABSCONDING_REPORT',
      label: 'File absconding report',
      authority: 'MOHRE',
      offsetDays: 3,
    },
    {
      actionCode: 'CANCEL_WORK_PERMIT',
      label: 'Cancel work permit',
      authority: 'MOHRE',
      offsetDays: 30,
    },
    {
      actionCode: 'CANCEL_RESIDENCE_VISA',
      label: 'Cancel residence visa',
      authority: 'GDRFA',
      offsetDays: 60,
    },
    { actionCode: 'CLOSE_SI', label: 'Close social insurance registration', offsetDays: 30 },
  ],
};

export class VisaExitCaseService {
  async open(
    input: {
      employeeId: string;
      countryCode: string;
      scenario: ExitScenario;
      lastWorkingDate?: Date;
      visaNumber?: string;
      workPermitNumber?: string;
      passportNumber?: string;
      dependentsCount?: number;
      ticketRequired?: boolean;
      ownerId?: string;
      proAssigneeId?: string;
      notes?: string;
    },
    auth: AuthContext
  ) {
    const created = await (prisma as any).visaExitCase.create({
      data: {
        tenantId: auth.tenantId,
        ...input,
        scenario: input.scenario,
        status: 'OPEN',
        absconding: input.scenario === 'ABSCONDING',
        abscondingReportedAt: input.scenario === 'ABSCONDING' ? new Date() : null,
      },
    });

    const actions =
      PRO_ACTIONS_BY_SCENARIO[input.scenario === 'ABSCONDING' ? 'ABSCONDING' : 'DEFAULT'];
    const base = input.lastWorkingDate ?? new Date();
    for (const a of actions) {
      const due = new Date(base);
      due.setDate(due.getDate() + (a.offsetDays ?? 7));
      await (prisma as any).visaExitProAction.create({
        data: {
          tenantId: auth.tenantId,
          caseId: created.id,
          actionCode: a.actionCode,
          label: a.label,
          authority: a.authority,
          dueDate: due,
          status: 'OPEN',
        },
      });
    }
    return created;
  }

  async transition(
    id: string,
    next: CaseStatus,
    subStatus: string | undefined,
    _auth: AuthContext
  ) {
    return (prisma as any).visaExitCase.update({
      where: { id },
      data: { status: next, subStatus },
    });
  }

  async setSettlement(id: string, finalSettlementId: string, _auth: AuthContext) {
    return (prisma as any).visaExitCase.update({
      where: { id },
      data: { finalSettlementId },
    });
  }

  async setSiClosure(id: string, siClosureRef: string, _auth: AuthContext) {
    return (prisma as any).visaExitCase.update({
      where: { id },
      data: { siClosureRef },
    });
  }

  async setTicketIssued(id: string, _auth: AuthContext) {
    return (prisma as any).visaExitCase.update({
      where: { id },
      data: { ticketIssued: true },
    });
  }

  async list(
    tenantId: string,
    filter: { status?: string; scenario?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.scenario ? { scenario: filter.scenario } : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).visaExitCase.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).visaExitCase.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }

  async get(id: string, tenantId: string) {
    const c = await (prisma as any).visaExitCase.findUnique({ where: { id } });
    if (!c || c.tenantId !== tenantId) return null;
    return c;
  }
}

export const visaExitCaseService = new VisaExitCaseService();

export class VisaExitProActionService {
  async list(
    tenantId: string,
    filter: { caseId?: string; status?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      ...(filter.caseId ? { caseId: filter.caseId } : {}),
      ...(filter.status ? { status: filter.status } : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).visaExitProAction.findMany({
        where,
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'asc' }],
        ...prismaPageArgs(page),
      }),
      (prisma as any).visaExitProAction.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }

  async complete(id: string, notes: string | undefined, auth: AuthContext) {
    return (prisma as any).visaExitProAction.update({
      where: { id },
      data: { status: 'COMPLETED', completedAt: new Date(), completedBy: auth.userId, notes },
    });
  }

  async assign(id: string, assigneeId: string, _auth: AuthContext) {
    return (prisma as any).visaExitProAction.update({
      where: { id },
      data: { assigneeId },
    });
  }
}

export const visaExitProActionService = new VisaExitProActionService();

export class VisaExitGraceService {
  async start(
    input: {
      caseId: string;
      grantedAt: Date;
      daysGranted?: number;
      graceType: string;
      countryCode?: string;
    },
    auth: AuthContext
  ) {
    const days =
      input.daysGranted ?? (input.countryCode ? (DEFAULT_GRACE_DAYS[input.countryCode] ?? 30) : 30);
    const expiresAt = new Date(input.grantedAt);
    expiresAt.setDate(expiresAt.getDate() + days);
    await (prisma as any).visaExitCase.update({
      where: { id: input.caseId },
      data: { graceExpiresAt: expiresAt },
    });
    return prisma.visaExitGrace.upsert({
      where: {
        tenantId_caseId: {
          tenantId: auth.tenantId,
          caseId: input.caseId,
        },
      },
      update: {
        grantedAt: input.grantedAt,
        expiresAt,
        daysGranted: days,
        graceType: input.graceType,
        status: 'ACTIVE',
      },
      create: {
        tenantId: auth.tenantId,
        caseId: input.caseId,
        grantedAt: input.grantedAt,
        expiresAt,
        daysGranted: days,
        graceType: input.graceType,
        status: 'ACTIVE',
      },
    });
  }

  async extend(caseId: string, extraDays: number, auth: AuthContext) {
    const cur = await (prisma as any).visaExitGrace.findUnique({
      where: {
        tenantId_caseId: {
          tenantId: auth.tenantId,
          caseId,
        },
      },
    });
    if (!cur) throw new Error('no grace record for case');
    const newExpiry = new Date(cur.expiresAt);
    newExpiry.setDate(newExpiry.getDate() + extraDays);
    await (prisma as any).visaExitCase.update({
      where: { id: caseId },
      data: { graceExpiresAt: newExpiry },
    });
    return (prisma as any).visaExitGrace.update({
      where: {
        tenantId_caseId: {
          tenantId: auth.tenantId,
          caseId,
        },
      },
      data: {
        expiresAt: newExpiry,
        daysGranted: cur.daysGranted + extraDays,
        extensionCount: cur.extensionCount + 1,
      },
    });
  }

  async close(caseId: string, auth: AuthContext) {
    return (prisma as any).visaExitGrace.update({
      where: {
        tenantId_caseId: {
          tenantId: auth.tenantId,
          caseId,
        },
      },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
      },
    });
  }

  async list(
    tenantId: string,
    filter: { expiringWithinDays?: number } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    let dateFilter = {};
    if (filter.expiringWithinDays != null) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() + filter.expiringWithinDays);
      dateFilter = { expiresAt: { lte: cutoff }, status: 'ACTIVE' };
    }
    const where = { tenantId, ...dateFilter };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).visaExitGrace.findMany({
        where,
        orderBy: { expiresAt: 'asc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).visaExitGrace.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
}

export const visaExitGraceService = new VisaExitGraceService();

export class VisaExitEvidenceService {
  async capture(
    input: {
      caseId: string;
      portal: string;
      referenceNumber?: string;
      evidenceType: string;
      fileUrl?: string;
      validUntil?: Date;
      notes?: string;
    },
    auth: AuthContext
  ) {
    return (prisma as any).visaExitEvidence.create({
      data: {
        tenantId: auth.tenantId,
        ...input,
        capturedBy: auth.userId,
      },
    });
  }

  async list(
    tenantId: string,
    caseId?: string,
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = { tenantId, ...(caseId ? { caseId } : {}) };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).visaExitEvidence.findMany({
        where,
        orderBy: { capturedAt: 'desc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).visaExitEvidence.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
}

export const visaExitEvidenceService = new VisaExitEvidenceService();

export class VisaExitCertificateService {
  async dashboard(tenantId: string, period: string) {
    const [y, m] = period.split('-').map(Number);
    const periodStart = new Date(y, m - 1, 1);
    const periodEnd = new Date(y, m, 0, 23, 59, 59);
    const casesOpened = await (prisma as any).visaExitCase.count({
      where: { tenantId, createdAt: { gte: periodStart, lte: periodEnd } },
    });
    const casesClosed = await (prisma as any).visaExitCase.count({
      where: {
        tenantId,
        status: 'CLOSED',
        updatedAt: { gte: periodStart, lte: periodEnd },
      },
    });
    const casesAbsconding = await (prisma as any).visaExitCase.count({
      where: { tenantId, absconding: true, status: { not: 'CLOSED' } },
    });
    const graceExpiringCount = await (prisma as any).visaExitGrace.count({
      where: {
        tenantId,
        status: 'ACTIVE',
        expiresAt: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 3600 * 1000),
        },
      },
    });
    const overduePoActions = await (prisma as any).visaExitProAction.count({
      where: {
        tenantId,
        status: 'OPEN',
        dueDate: { lt: new Date() },
      },
    });
    const closedCases = await (prisma as any).visaExitCase.findMany({
      where: {
        tenantId,
        status: 'CLOSED',
        updatedAt: { gte: periodStart, lte: periodEnd },
      },
      select: { id: true },
    });
    let missingEvidenceCount = 0;
    for (const c of closedCases as Array<{ id: string }>) {
      const ev = await (prisma as any).visaExitEvidence.count({
        where: { tenantId, caseId: c.id },
      });
      if (ev === 0) missingEvidenceCount += 1;
    }
    return {
      period,
      casesOpened,
      casesClosed,
      casesAbsconding,
      graceExpiringCount,
      overduePoActions,
      missingEvidenceCount,
    };
  }

  async generate(period: string, auth: AuthContext) {
    const stats = await this.dashboard(auth.tenantId, period);
    const reasons: string[] = [];
    if (stats.overduePoActions > 0) reasons.push(`${stats.overduePoActions} overdue PRO action(s)`);
    if (stats.missingEvidenceCount > 0)
      reasons.push(`${stats.missingEvidenceCount} closed case(s) missing evidence`);
    if (stats.graceExpiringCount > 0)
      reasons.push(`${stats.graceExpiringCount} grace expiry/expiries within 7 days`);
    const gatingReason = reasons.length ? `Blocked: ${reasons.join('; ')}` : null;
    return (prisma as any).visaExitCertificate.upsert({
      where: { tenantId_period: { tenantId: auth.tenantId, period } },
      update: {
        casesOpened: stats.casesOpened,
        casesClosed: stats.casesClosed,
        casesAbsconding: stats.casesAbsconding,
        graceExpiringCount: stats.graceExpiringCount,
        overduePoActions: stats.overduePoActions,
        missingEvidenceCount: stats.missingEvidenceCount,
        gatingReason,
        generatedAt: new Date(),
        status: 'DRAFT',
      },
      create: {
        tenantId: auth.tenantId,
        period,
        casesOpened: stats.casesOpened,
        casesClosed: stats.casesClosed,
        casesAbsconding: stats.casesAbsconding,
        graceExpiringCount: stats.graceExpiringCount,
        overduePoActions: stats.overduePoActions,
        missingEvidenceCount: stats.missingEvidenceCount,
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
    const cert = await (prisma as any).visaExitCertificate.findUnique({
      where: { tenantId_period: { tenantId: auth.tenantId, period } },
    });
    if (!cert) throw new Error('certificate not generated');
    if (cert.gatingReason) throw new Error(`cannot sign while gated: ${cert.gatingReason}`);
    return (prisma as any).visaExitCertificate.update({
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
    return (prisma as any).visaExitCertificate.findMany({
      where: { tenantId },
      orderBy: { period: 'desc' },
      take: 24,
    });
  }
}

export const visaExitCertificateService = new VisaExitCertificateService();

export const VISA_EXIT_CONSTANTS = { DEFAULT_GRACE_DAYS, PRO_ACTIONS_BY_SCENARIO };
