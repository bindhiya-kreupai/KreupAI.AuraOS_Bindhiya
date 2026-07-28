/**
 * EPIC-27: Termination & Separation Compliance.
 *
 * Case orchestrates the full separation lifecycle across types
 * (RESIGNATION / EMPLOYER_TERMINATION / TERMINATION_FOR_CAUSE /
 * MUTUAL_SEPARATION / REDUNDANCY / END_OF_CONTRACT / PROBATION_END /
 * ABANDONMENT / DEATH / RETIREMENT) with status FSM (DRAFT → SUBMITTED
 * → APPROVED → IN_CLEARANCE → SETTLED → CLOSED / WITHDRAWN). Clearance
 * register seeds department checklists (HR / IT / FINANCE / SECURITY /
 * LINE_MANAGER / ADMIN) with completion tracking. Handover register
 * tracks asset / knowledge / document transfer to successor. Exit
 * interview register captures satisfaction, reason and rehire intent.
 * Monthly certificate refuses to sign while clearances are pending on
 * closed cases, exit interviews are missing, IT access remains open
 * after case close, or abandonment cases stay unresolved.
 *
 * Country notice-period defaults (representative, configurable):
 *   UAE   — 30 days unlimited / probation 14
 *   KSA   — 60 days unlimited / probation 90
 *   BAHRAIN / QATAR / OMAN / KUWAIT — 30 days
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

export type SeparationType =
  | 'RESIGNATION'
  | 'EMPLOYER_TERMINATION'
  | 'TERMINATION_FOR_CAUSE'
  | 'MUTUAL_SEPARATION'
  | 'REDUNDANCY'
  | 'END_OF_CONTRACT'
  | 'PROBATION_END'
  | 'ABANDONMENT'
  | 'DEATH'
  | 'RETIREMENT';

export type ClearanceDept =
  'HR' | 'IT' | 'FINANCE' | 'SECURITY' | 'LINE_MANAGER' | 'ADMIN' | 'LEGAL';

export const DEFAULT_NOTICE_DAYS: Record<string, number> = {
  UAE: 30,
  KSA: 60,
  BAHRAIN: 30,
  QATAR: 30,
  OMAN: 30,
  KUWAIT: 30,
};

export const DEFAULT_CLEARANCE_CHECKLIST: Record<ClearanceDept, string[]> = {
  HR: [
    'Confirm last working date',
    'Collect ID card and access badges',
    'Verify leave balance',
    'Sign separation acceptance',
  ],
  IT: [
    'Disable email and SSO access',
    'Recover laptop and peripherals',
    'Wipe and inventory devices',
    'Revoke VPN and cloud access',
  ],
  FINANCE: [
    'Reconcile advances and loans',
    'Process final salary',
    'Settle expense claims',
    'Issue final salary statement',
  ],
  SECURITY: ['Recover access badge', 'Update visitor logs', 'Revoke building access'],
  LINE_MANAGER: [
    'Complete handover document',
    'Identify successor',
    'Approve outstanding work items',
  ],
  ADMIN: ['Recover company assets', 'Cancel parking', 'Close meal cards'],
  LEGAL: ['Sign non-disclosure reminder', 'Review settlement agreement'],
};

/** EPIC-27-S08: pure notice compliance check. */
export function isNoticeCompliant(
  noticeRequiredDays: number,
  noticeServedDays: number,
  noticeBuyout: boolean
): boolean {
  if (noticeBuyout) return true;
  return noticeServedDays >= noticeRequiredDays;
}

export class SeparationCaseService {
  async open(
    input: {
      caseNumber: string;
      employeeId: string;
      country: string;
      separationType: SeparationType;
      reason?: string;
      noticeRequiredDays?: number;
      lastWorkingDate?: Date;
    },
    auth: AuthContext
  ) {
    const noticeDays =
      input.noticeRequiredDays ??
      (input.country && DEFAULT_NOTICE_DAYS[input.country]
        ? DEFAULT_NOTICE_DAYS[input.country]
        : 30);
    const isAbandonment = input.separationType === 'ABANDONMENT';
    const isDeath = input.separationType === 'DEATH';
    const created = await (prisma as any).separationCase.upsert({
      where: {
        aura_separation_case_unique: {
          tenantId: auth.tenantId,
          caseNumber: input.caseNumber,
        },
      },
      update: {
        employeeId: input.employeeId,
        country: input.country,
        separationType: input.separationType,
        reason: input.reason,
        noticeRequiredDays: noticeDays,
        lastWorkingDate: input.lastWorkingDate,
        deathInService: isDeath,
        status: 'DRAFT',
      },
      create: {
        tenantId: auth.tenantId,
        caseNumber: input.caseNumber,
        employeeId: input.employeeId,
        country: input.country,
        separationType: input.separationType,
        reason: input.reason,
        noticeRequiredDays: noticeDays,
        lastWorkingDate: input.lastWorkingDate,
        deathInService: isDeath,
        status: 'DRAFT',
      },
    });
    // Auto-seed clearance checklists across standard departments.
    const departments: ClearanceDept[] = [
      'HR',
      'IT',
      'FINANCE',
      'SECURITY',
      'LINE_MANAGER',
      'ADMIN',
    ];
    for (const d of departments) {
      const items = DEFAULT_CLEARANCE_CHECKLIST[d] ?? [];
      try {
        await (prisma as any).separationClearance.create({
          data: {
            tenantId: auth.tenantId,
            caseId: created.id,
            department: d,
            checklistJson: items.map((label) => ({ label, done: false })),
            completedItems: 0,
            totalItems: items.length,
            status: 'PENDING',
          },
        });
      } catch (err) {
        if (!String(err).includes('Unique')) throw err;
      }
    }
    if (isAbandonment) {
      // Default to 7 days unauthorised absence baseline; caller can update.
      await (prisma as any).separationCase.update({
        where: { id: created.id },
        data: { abandonmentDays: 7 },
      });
    }
    return created;
  }

  async submit(id: string, auth: AuthContext) {
    return (prisma as any).separationCase.update({
      where: { id },
      data: { status: 'SUBMITTED', submittedAt: new Date() },
    });
  }

  async approve(id: string, auth: AuthContext) {
    return (prisma as any).separationCase.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approverId: auth.userId,
      },
    });
  }

  async setNoticeServed(
    id: string,
    days: number,
    buyout: boolean,
    buyoutAmount: number | undefined,
    _auth: AuthContext
  ) {
    return (prisma as any).separationCase.update({
      where: { id },
      data: {
        noticeServedDays: days,
        noticeBuyout: buyout,
        noticeBuyoutAmount: buyoutAmount ?? 0,
      },
    });
  }

  async setGardenLeave(id: string, value: boolean, _auth: AuthContext) {
    return (prisma as any).separationCase.update({
      where: { id },
      data: { gardenLeave: value },
    });
  }

  async setSettlement(
    id: string,
    input: {
      settlementAgreementSigned: boolean;
      settlementAmount?: number;
      eosbCalculationId?: string;
    },
    _auth: AuthContext
  ) {
    return (prisma as any).separationCase.update({
      where: { id },
      data: input,
    });
  }

  async setVisaExitLink(id: string, visaExitCaseId: string, _auth: AuthContext) {
    return (prisma as any).separationCase.update({
      where: { id },
      data: { visaExitCaseId },
    });
  }

  async setSiClosure(id: string, siClosureRef: string, _auth: AuthContext) {
    return (prisma as any).separationCase.update({
      where: { id },
      data: { siClosureRef },
    });
  }

  async revokeItAccess(id: string, auth: AuthContext) {
    return (prisma as any).separationCase.update({
      where: { id },
      data: { itAccessRevoked: true, itAccessRevokedAt: new Date() },
    });
  }

  async close(id: string, auth: AuthContext) {
    const c = await (prisma as any).separationCase.findUnique({ where: { id } });
    if (!c) throw new Error('case not found');
    const pending = await (prisma as any).separationClearance.count({
      where: { tenantId: auth.tenantId, caseId: id, status: { not: 'CLEARED' } },
    });
    if (pending > 0) throw new Error(`${pending} clearance(s) still pending`);
    return (prisma as any).separationCase.update({
      where: { id },
      data: { status: 'CLOSED' },
    });
  }
   async delete(id: string, _auth: AuthContext) {
    await (prisma as any).separationClearance.deleteMany({ where: { caseId: id } });
    await (prisma as any).separationHandover.deleteMany({ where: { caseId: id } });
    return (prisma as any).separationCase.delete({ where: { id } });
  }

  async list(
    tenantId: string,
    filter: { status?: string; separationType?: string; employeeId?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.separationType ? { separationType: filter.separationType } : {}),
      ...(filter.employeeId ? { employeeId: filter.employeeId } : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).separationCase.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).separationCase.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
}

export const separationCaseService = new SeparationCaseService();

export class SeparationClearanceService {
  async updateChecklist(
    id: string,
    completedItems: number,
    blockerNotes: string | undefined,
    _auth: AuthContext
  ) {
    const cur = await (prisma as any).separationClearance.findUnique({ where: { id } });
    if (!cur) throw new Error('clearance not found');
    return (prisma as any).separationClearance.update({
      where: { id },
      data: {
        completedItems,
        blockerNotes,
        status: completedItems >= cur.totalItems ? 'CLEARED' : 'IN_PROGRESS',
        clearedAt: completedItems >= cur.totalItems ? new Date() : null,
        clearedBy: completedItems >= cur.totalItems ? _auth.userId : null,
      },
    });
  }
   async delete(id: string, _auth: AuthContext) {
    return (prisma as any).separationClearance.delete({ where: { id } });
  }

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
      (prisma as any).separationClearance.findMany({
        where,
        orderBy: { department: 'asc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).separationClearance.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
}

export const separationClearanceService = new SeparationClearanceService();

export class SeparationHandoverService {
  async add(
    input: {
      caseId: string;
      itemDescription: string;
      itemType: string;
      successorId?: string;
    },
    auth: AuthContext
  ) {
    return (prisma as any).separationHandover.create({
      data: {
        tenantId: auth.tenantId,
        caseId: input.caseId,
        itemDescription: input.itemDescription,
        itemType: input.itemType,
        successorId: input.successorId,
        status: 'PENDING',
      },
    });
  }

  async complete(id: string, evidenceUrl: string | undefined, auth: AuthContext) {
    return (prisma as any).separationHandover.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        completedBy: auth.userId,
        evidenceUrl,
      },
    });
  }

    async delete(id: string, _auth: AuthContext) {
    return (prisma as any).separationHandover.delete({ where: { id } });
  }


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
      (prisma as any).separationHandover.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).separationHandover.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
}

export const separationHandoverService = new SeparationHandoverService();

export class SeparationExitInterviewService {
  async upsert(
    input: {
      caseId: string;
      conductedAt?: Date;
      satisfactionScore?: number;
      reasonCode?: string;
      reasonDetail?: string;
      willingToRehire?: boolean;
      feedback?: Record<string, unknown>;
    },
    auth: AuthContext
  ) {
    return (prisma as any).separationExitInterview.upsert({
      where: {
        aura_separation_exit_interview_unique: {
          tenantId: auth.tenantId,
          caseId: input.caseId,
        },
      },
      update: {
        ...input,
        feedbackJson: input.feedback ?? {},
        conductedBy: input.conductedAt ? auth.userId : null,
        status: input.conductedAt ? 'COMPLETED' : 'PENDING',
      },
      create: {
        tenantId: auth.tenantId,
        ...input,
        feedbackJson: input.feedback ?? {},
        conductedBy: input.conductedAt ? auth.userId : null,
        status: input.conductedAt ? 'COMPLETED' : 'PENDING',
      },
    });
  }

  async list(
    tenantId: string,
    filter: { status?: string; caseId?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.caseId ? { caseId: filter.caseId } : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).separationExitInterview.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).separationExitInterview.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
}

export const separationExitInterviewService = new SeparationExitInterviewService();

export class SeparationCertificateService {
  async dashboard(tenantId: string, period: string) {
    const [y, m] = period.split('-').map(Number);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);
    const casesOpened = await (prisma as any).separationCase.count({
      where: { tenantId, createdAt: { gte: start, lte: end } },
    });
    const casesClosed = await (prisma as any).separationCase.count({
      where: { tenantId, status: 'CLOSED', updatedAt: { gte: start, lte: end } },
    });
    const closedCases = await (prisma as any).separationCase.findMany({
      where: { tenantId, status: 'CLOSED', updatedAt: { gte: start, lte: end } },
      select: { id: true, separationType: true, noticeServedDays: true, deathInService: true },
    });
    const byType: Record<string, number> = {};
    let noticeSum = 0;
    let noticeCount = 0;
    let deathInServiceCount = 0;
    for (const c of closedCases as Array<Record<string, unknown>>) {
      const t = String(c.separationType);
      byType[t] = (byType[t] ?? 0) + 1;
      if (typeof c.noticeServedDays === 'number') {
        noticeSum += c.noticeServedDays;
        noticeCount += 1;
      }
      if (c.deathInService) deathInServiceCount += 1;
    }
    const averageNoticeServed = noticeCount > 0 ? Number((noticeSum / noticeCount).toFixed(2)) : 0;
    const abandonmentCases = await (prisma as any).separationCase.count({
      where: { tenantId, separationType: 'ABANDONMENT', status: { not: 'CLOSED' } },
    });
    const clearancesPending = await (prisma as any).separationClearance.count({
      where: { tenantId, status: { not: 'CLEARED' } },
    });
    const handoverPending = await (prisma as any).separationHandover.count({
      where: { tenantId, status: 'PENDING' },
    });
    // Exit interview missing: closed cases without an exit interview record.
    let exitInterviewMissing = 0;
    for (const c of closedCases as Array<{ id: string }>) {
      const ei = await (prisma as any).separationExitInterview.findUnique({
        where: {
          aura_separation_exit_interview_unique: { tenantId, caseId: c.id },
        },
      });
      if (!ei || ei.status !== 'COMPLETED') exitInterviewMissing += 1;
    }
    const itAccessOpenAfterClose = await (prisma as any).separationCase.count({
      where: { tenantId, status: 'CLOSED', itAccessRevoked: false },
    });
    return {
      period,
      casesOpened,
      casesClosed,
      casesByType: byType,
      averageNoticeServed,
      abandonmentCases,
      clearancesPending,
      handoverPending,
      exitInterviewMissing,
      itAccessOpenAfterClose,
      deathInServiceCount,
    };
  }

  async generate(period: string, auth: AuthContext) {
    const stats = await this.dashboard(auth.tenantId, period);
    const reasons: string[] = [];
    if (stats.itAccessOpenAfterClose > 0)
      reasons.push(`${stats.itAccessOpenAfterClose} closed case(s) with IT access still open`);
    if (stats.abandonmentCases > 0)
      reasons.push(`${stats.abandonmentCases} unresolved abandonment case(s)`);
    if (stats.exitInterviewMissing > 0)
      reasons.push(`${stats.exitInterviewMissing} closed case(s) missing exit interview`);
    if (stats.clearancesPending > 0)
      reasons.push(`${stats.clearancesPending} pending clearance(s)`);
    const gatingReason = reasons.length ? `Blocked: ${reasons.join('; ')}` : null;
    return (prisma as any).separationCertificate.upsert({
      where: {
        aura_separation_certificate_unique: { tenantId: auth.tenantId, period },
      },
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
    const cert = await (prisma as any).separationCertificate.findUnique({
      where: { aura_separation_certificate_unique: { tenantId: auth.tenantId, period } },
    });
    if (!cert) throw new Error('certificate not generated');
    if (cert.gatingReason) throw new Error(`cannot sign while gated: ${cert.gatingReason}`);
    return (prisma as any).separationCertificate.update({
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
    return (prisma as any).separationCertificate.findMany({
      where: { tenantId },
      orderBy: { period: 'desc' },
      take: 24,
    });
  }
}

export const separationCertificateService = new SeparationCertificateService();

export const SEPARATION_CONSTANTS = { DEFAULT_NOTICE_DAYS, DEFAULT_CLEARANCE_CHECKLIST };
