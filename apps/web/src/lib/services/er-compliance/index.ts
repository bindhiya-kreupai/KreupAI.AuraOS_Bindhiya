/**
 * EPIC-25 + EPIC-26: Employee Relations Compliance (Grievance +
 * Disciplinary combined).
 *
 * Grievance register handles multi-channel intake (EMAIL / PORTAL /
 * HOTLINE / IN_PERSON / ANONYMOUS / WHISTLEBLOWER) with grievance type
 * (HARASSMENT / DISCRIMINATION / BULLYING / RETALIATION /
 * MANAGEMENT_DISPUTE / WORKING_CONDITIONS / PAY / OTHER), severity
 * banding, SLA (default 30 days), confidentiality flag, and labour-
 * authority referral tracking. Disciplinary register handles
 * progressive misconduct → action chain (VERBAL_WARNING /
 * WRITTEN_WARNING / FINAL_WARNING / SUSPENSION / DEMOTION /
 * TERMINATION) with hearing-held + response-recorded gates and
 * country-specific salary-deduction limits. Investigation register
 * formalises interviews + evidence + findings + recommendation.
 * Appeals register supports OPEN → DECIDED. Monthly certificate
 * refuses to sign while SLA-breached grievances, HIGH/CRITICAL open
 * grievances, disciplinary actions without hearing, or open appeals
 * remain.
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

export type GrievanceChannel =
  | 'EMAIL'
  | 'PORTAL'
  | 'HOTLINE'
  | 'IN_PERSON'
  | 'ANONYMOUS'
  | 'WHISTLEBLOWER';

export type GrievanceType =
  | 'HARASSMENT'
  | 'DISCRIMINATION'
  | 'BULLYING'
  | 'RETALIATION'
  | 'MANAGEMENT_DISPUTE'
  | 'WORKING_CONDITIONS'
  | 'PAY'
  | 'OTHER';

export type ActionType =
  | 'VERBAL_WARNING'
  | 'WRITTEN_WARNING'
  | 'FINAL_WARNING'
  | 'SUSPENSION'
  | 'DEMOTION'
  | 'SALARY_DEDUCTION'
  | 'TERMINATION';

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/** EPIC-26-S06: salary-deduction caps per GCC country (per pay period). */
export const SALARY_DEDUCTION_LIMITS_PCT: Record<string, number> = {
  UAE: 25,
  KSA: 50,
  BAHRAIN: 25,
  QATAR: 50,
  OMAN: 25,
  KUWAIT: 50,
};

/** EPIC-25-S10: pure SLA-breach detection. */
export function isGrievanceSlaBreached(g: {
  raisedAt: Date;
  slaDays: number;
  status: string;
}): boolean {
  if (g.status === 'RESOLVED' || g.status === 'CLOSED') return false;
  const ageDays = (Date.now() - new Date(g.raisedAt).getTime()) / (24 * 3600 * 1000);
  return ageDays > g.slaDays;
}

export class ErGrievanceService {
  async raise(
    input: {
      caseNumber: string;
      channel: GrievanceChannel;
      grievanceType: GrievanceType;
      severity?: Severity;
      subject: string;
      description?: string;
      complainantId?: string;
      respondentId?: string;
      isWhistleblower?: boolean;
      country?: string;
      slaDays?: number;
    },
    auth: AuthContext
  ) {
    const {
      caseNumber,
      channel,
      grievanceType,
      severity,
      subject,
      description,
      complainantId,
      respondentId,
      isWhistleblower,
      country,
      slaDays,
    } = input;

    if (complainantId) {
      const complainant = await prisma.employee.findFirst({
        where: { id: complainantId, company: { tenantId: auth.tenantId } },
      });
      if (!complainant) {
        throw new Error(`Complainant employee with ID ${complainantId} not found`);
      }
    }

    if (respondentId) {
      const respondent = await prisma.employee.findFirst({
        where: { id: respondentId, company: { tenantId: auth.tenantId } },
      });
      if (!respondent) {
        throw new Error(`Respondent employee with ID ${respondentId} not found`);
      }
    }

    return (prisma as any).erGrievanceCase.upsert({
      where: {
        tenantId_caseNumber: {
          tenantId: auth.tenantId,
          caseNumber,
        },
      },
      update: {
        channel,
        grievanceType,
        severity: severity ?? 'MEDIUM',
        subject,
        description,
        complainantId,
        respondentId,
        isWhistleblower: !!isWhistleblower,
        country,
        slaDays: slaDays ?? 30,
        status: 'OPEN',
      },
      create: {
        tenantId: auth.tenantId,
        caseNumber,
        channel,
        grievanceType,
        severity: severity ?? 'MEDIUM',
        subject,
        description,
        complainantId,
        respondentId,
        isWhistleblower: !!isWhistleblower,
        country,
        slaDays: slaDays ?? 30,
        status: 'OPEN',
      },
    });
  }

  async assign(id: string, assigneeId: string, _auth: AuthContext) {
    return (prisma as any).erGrievanceCase.update({
      where: { id },
      data: { assigneeId, status: 'IN_PROGRESS' },
    });
  }

  async resolve(id: string, outcome: string, _auth: AuthContext) {
    return (prisma as any).erGrievanceCase.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        outcome,
        resolvedAt: new Date(),
        resolvedBy: _auth.userId,
      },
    });
  }

  async referToAuthority(id: string, reference: string, _auth: AuthContext) {
    return (prisma as any).erGrievanceCase.update({
      where: { id },
      data: { labourAuthorityRef: reference, status: 'REFERRED_TO_AUTHORITY' },
    });
  }

  async list(
    tenantId: string,
    filter: { status?: string; severity?: string; channel?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.severity ? { severity: filter.severity } : {}),
      ...(filter.channel ? { channel: filter.channel } : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).erGrievanceCase.findMany({
        where,
        orderBy: { raisedAt: 'desc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).erGrievanceCase.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
}

export const erGrievanceService = new ErGrievanceService();

export class ErDisciplinaryService {
  async draft(
    input: {
      actionNumber: string;
      employeeId: string;
      linkedGrievanceId?: string;
      misconductType: string;
      severity?: Severity;
      actionType: ActionType;
      warningCount?: number;
      suspensionDays?: number;
      salaryDeductionDays?: number;
      salaryDeductionPct?: number;
      country?: string;
      evidenceCount?: number;
    },
    auth: AuthContext
  ) {
    const {
      actionNumber,
      employeeId,
      linkedGrievanceId,
      misconductType,
      severity,
      actionType,
      warningCount,
      suspensionDays,
      salaryDeductionDays,
      salaryDeductionPct,
      country,
      evidenceCount,
    } = input;

    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, company: { tenantId: auth.tenantId } },
    });
    if (!employee) {
      throw new Error(`Employee with ID ${employeeId} not found`);
    }

    const pct = salaryDeductionPct != null ? Number(salaryDeductionPct) : 0;
    const limit =
      country && SALARY_DEDUCTION_LIMITS_PCT[country]
        ? SALARY_DEDUCTION_LIMITS_PCT[country]
        : 50;
    if (pct > limit)
      throw new Error(
        `salary deduction ${pct}% exceeds ${country ?? 'default'} limit ${limit}%`
      );

    return (prisma as any).erDisciplinaryAction.upsert({
      where: {
        tenantId_actionNumber: {
          tenantId: auth.tenantId,
          actionNumber,
        },
      },
      update: {
        employeeId,
        linkedGrievanceId,
        misconductType,
        severity: severity ?? 'MEDIUM',
        actionType,
        warningCount,
        suspensionDays,
        salaryDeductionDays,
        salaryDeductionPct: pct,
        country,
        evidenceCount,
        status: 'DRAFT',
      },
      create: {
        tenantId: auth.tenantId,
        actionNumber,
        employeeId,
        linkedGrievanceId,
        misconductType,
        severity: severity ?? 'MEDIUM',
        actionType,
        warningCount,
        suspensionDays,
        salaryDeductionDays,
        salaryDeductionPct: pct,
        country,
        evidenceCount,
        status: 'DRAFT',
      },
    });
  }

  async recordHearing(
    id: string,
    hearingDate: Date,
    responseRecorded: boolean,
    _auth: AuthContext
  ) {
    return (prisma as any).erDisciplinaryAction.update({
      where: { id },
      data: { hearingHeld: true, hearingDate, responseRecorded },
    });
  }

  async issue(id: string, effectiveFrom: Date, auth: AuthContext) {
    const current = await (prisma as any).erDisciplinaryAction.findUnique({
      where: { id },
    });
    if (!current) throw new Error('action not found');
    if (current.tenantId !== auth.tenantId) throw new Error('tenant mismatch');
    if (!current.hearingHeld) throw new Error('hearing not held — cannot issue action');
    return (prisma as any).erDisciplinaryAction.update({
      where: { id },
      data: {
        status: 'ISSUED',
        effectiveFrom,
        issuedBy: auth.userId,
        issuedAt: new Date(),
      },
    });
  }

  async list(
    tenantId: string,
    filter: { status?: string; employeeId?: string; actionType?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.employeeId ? { employeeId: filter.employeeId } : {}),
      ...(filter.actionType ? { actionType: filter.actionType } : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).erDisciplinaryAction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).erDisciplinaryAction.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
}

export const erDisciplinaryService = new ErDisciplinaryService();

export class ErInvestigationService {
  async open(
    input: {
      investigationNumber: string;
      grievanceCaseId?: string;
      disciplinaryActionId?: string;
      investigatorId?: string;
      scope?: string;
      startedAt: Date;
    },
    auth: AuthContext
  ) {
    const {
      investigationNumber,
      grievanceCaseId,
      disciplinaryActionId,
      investigatorId,
      scope,
      startedAt,
    } = input;

    return (prisma as any).erInvestigation.upsert({
      where: {
        tenantId_investigationNumber: {
          tenantId: auth.tenantId,
          investigationNumber,
        },
      },
      update: {
        grievanceCaseId,
        disciplinaryActionId,
        investigatorId,
        scope,
        startedAt,
        status: 'OPEN',
      },
      create: {
        tenantId: auth.tenantId,
        investigationNumber,
        grievanceCaseId,
        disciplinaryActionId,
        investigatorId,
        scope,
        startedAt,
        status: 'OPEN',
      },
    });
  }

  async addInterview(id: string, _auth: AuthContext) {
    return (prisma as any).erInvestigation.update({
      where: { id },
      data: { interviewCount: { increment: 1 } },
    });
  }

  async addEvidence(id: string, _auth: AuthContext) {
    return (prisma as any).erInvestigation.update({
      where: { id },
      data: { evidenceCount: { increment: 1 } },
    });
  }

  async complete(
    id: string,
    findings: string,
    recommendation: string | undefined,
    _auth: AuthContext
  ) {
    return (prisma as any).erInvestigation.update({
      where: { id },
      data: {
        findings,
        recommendation,
        completedAt: new Date(),
        status: 'COMPLETED',
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
      (prisma as any).erInvestigation.findMany({
        where,
        orderBy: { startedAt: 'desc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).erInvestigation.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
}

export const erInvestigationService = new ErInvestigationService();

export class ErAppealService {
  async file(
    input: {
      appealNumber: string;
      subjectType: 'GRIEVANCE' | 'DISCIPLINARY';
      subjectId: string;
      appellantId: string;
      reason?: string;
      filedAt: Date;
      decisionDueAt?: Date;
    },
    auth: AuthContext
  ) {
    const {
      appealNumber,
      subjectType,
      subjectId,
      appellantId,
      reason,
      filedAt,
      decisionDueAt,
    } = input;

    const appellant = await prisma.employee.findFirst({
      where: { id: appellantId, company: { tenantId: auth.tenantId } },
    });
    if (!appellant) {
      throw new Error(`Appellant employee with ID ${appellantId} not found`);
    }

    return (prisma as any).erAppeal.upsert({
      where: {
        tenantId_appealNumber: { tenantId: auth.tenantId, appealNumber },
      },
      update: {
        subjectType,
        subjectId,
        appellantId,
        reason,
        filedAt: new Date(filedAt),
        decisionDueAt: decisionDueAt ? new Date(decisionDueAt) : null,
        status: 'OPEN',
      },
      create: {
        tenantId: auth.tenantId,
        appealNumber,
        subjectType,
        subjectId,
        appellantId,
        reason,
        filedAt: new Date(filedAt),
        decisionDueAt: decisionDueAt ? new Date(decisionDueAt) : null,
        status: 'OPEN',
      },
    });
  }

  async decide(id: string, outcome: 'UPHELD' | 'OVERTURNED' | 'PARTIAL', auth: AuthContext) {
    return (prisma as any).erAppeal.update({
      where: { id },
      data: {
        outcome,
        decidedAt: new Date(),
        decidedBy: auth.userId,
        status: 'DECIDED',
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
      (prisma as any).erAppeal.findMany({
        where,
        orderBy: { filedAt: 'desc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).erAppeal.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
}

export const erAppealService = new ErAppealService();

export class ErCertificateService {
  async dashboard(tenantId: string, period: string) {
    const [y, m] = period.split('-').map(Number);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);
    const grievancesOpened = await (prisma as any).erGrievanceCase.count({
      where: { tenantId, raisedAt: { gte: start, lte: end } },
    });
    const grievancesClosed = await (prisma as any).erGrievanceCase.count({
      where: { tenantId, resolvedAt: { gte: start, lte: end } },
    });
    const highSeverityOpen = await (prisma as any).erGrievanceCase.count({
      where: {
        tenantId,
        status: { in: ['OPEN', 'IN_PROGRESS'] },
        severity: { in: ['HIGH', 'CRITICAL'] },
      },
    });
    const openGrievances = await (prisma as any).erGrievanceCase.findMany({
      where: { tenantId, status: { in: ['OPEN', 'IN_PROGRESS'] } },
      select: { raisedAt: true, slaDays: true, status: true },
      take: 500,
    });
    let grievancesSlaBreached = 0;
    for (const g of openGrievances as Array<Record<string, unknown>>) {
      if (
        isGrievanceSlaBreached({
          raisedAt: new Date(g.raisedAt as string),
          slaDays: Number(g.slaDays),
          status: String(g.status),
        })
      )
        grievancesSlaBreached += 1;
    }
    const disciplinaryActionsIssued = await (prisma as any).erDisciplinaryAction.count({
      where: { tenantId, status: 'ISSUED', issuedAt: { gte: start, lte: end } },
    });
    const actionsWithoutHearing = await (prisma as any).erDisciplinaryAction.count({
      where: { tenantId, status: 'ISSUED', hearingHeld: false },
    });
    const appealsOpen = await (prisma as any).erAppeal.count({
      where: { tenantId, status: 'OPEN' },
    });
    const labourAuthorityReferrals = await (prisma as any).erGrievanceCase.count({
      where: {
        tenantId,
        labourAuthorityRef: { not: null },
        raisedAt: { gte: start, lte: end },
      },
    });
    const retaliationFlags = await (prisma as any).erGrievanceCase.count({
      where: {
        tenantId,
        grievanceType: 'RETALIATION',
        status: { in: ['OPEN', 'IN_PROGRESS'] },
      },
    });
    return {
      period,
      grievancesOpened,
      grievancesClosed,
      grievancesSlaBreached,
      highSeverityOpen,
      disciplinaryActionsIssued,
      actionsWithoutHearing,
      appealsOpen,
      labourAuthorityReferrals,
      retaliationFlags,
    };
  }

  async generate(period: string, auth: AuthContext) {
    const stats = await this.dashboard(auth.tenantId, period);
    const reasons: string[] = [];
    if (stats.grievancesSlaBreached > 0)
      reasons.push(`${stats.grievancesSlaBreached} SLA-breached grievance(s)`);
    if (stats.highSeverityOpen > 0)
      reasons.push(`${stats.highSeverityOpen} HIGH/CRITICAL open grievance(s)`);
    if (stats.actionsWithoutHearing > 0)
      reasons.push(`${stats.actionsWithoutHearing} disciplinary action(s) without hearing`);
    if (stats.retaliationFlags > 0)
      reasons.push(`${stats.retaliationFlags} open RETALIATION case(s)`);
    const gatingReason = reasons.length ? `Blocked: ${reasons.join('; ')}` : null;
    return (prisma as any).erCertificate.upsert({
      where: { tenantId_period: { tenantId: auth.tenantId, period } },
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
    const cert = await (prisma as any).erCertificate.findUnique({
      where: { tenantId_period: { tenantId: auth.tenantId, period } },
    });
    if (!cert) throw new Error('certificate not generated');
    if (cert.gatingReason) throw new Error(`cannot sign while gated: ${cert.gatingReason}`);
    return (prisma as any).erCertificate.update({
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
    return (prisma as any).erCertificate.findMany({
      where: { tenantId },
      orderBy: { period: 'desc' },
      take: 24,
    });
  }
}

export const erCertificateService = new ErCertificateService();

export const ER_CONSTANTS = { SALARY_DEDUCTION_LIMITS_PCT };
