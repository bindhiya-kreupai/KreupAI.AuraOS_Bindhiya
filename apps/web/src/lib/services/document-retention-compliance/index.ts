/**
 * EPIC-30: Document Retention & HR Audit Compliance.
 *
 * Retention schedule per country × record type with effective dating;
 * documents register the actual files, deriving retentionUntil from the
 * schedule. Documents may be expiry-tracked, classified, placed under
 * litigation hold, and disposed via an approved workflow. Disposal
 * refuses any document under litigation hold or before retentionUntil.
 * HR audit cycle samples documents and raises severity-tagged findings.
 * Monthly certificate aggregates and refuses to sign while critical
 * findings or pending disposals exist.
 *
 * Default GCC retention schedule (representative, configurable):
 *   CONTRACT             — 7 years
 *   PAYROLL_RECORD       — 7 years
 *   WPS_FILE             — 5 years
 *   SOCIAL_INSURANCE     — 7 years
 *   IMMIGRATION_RECORD   — 5 years
 *   ATTENDANCE_LOG       — 2 years
 *   LEAVE_RECORD         — 2 years
 *   PERFORMANCE_RECORD   — 5 years
 *   TRAINING_RECORD      — 5 years
 *   DISCIPLINARY_RECORD  — 10 years
 *   MEDICAL_RECORD       — 30 years (regulated)
 *   HSE_INJURY_RECORD    — 30 years
 *   SEPARATION_RECORD    — 10 years
 *   RECRUITMENT_RECORD   — 2 years
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

export type DocClassification = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';

export const DEFAULT_RETENTION: Array<{
  recordType: string;
  retentionYears: number;
  classification: DocClassification;
  basis: string;
}> = [
  {
    recordType: 'CONTRACT',
    retentionYears: 7,
    classification: 'CONFIDENTIAL',
    basis: 'Labour law standard',
  },
  {
    recordType: 'PAYROLL_RECORD',
    retentionYears: 7,
    classification: 'CONFIDENTIAL',
    basis: 'Tax / labour records',
  },
  {
    recordType: 'WPS_FILE',
    retentionYears: 5,
    classification: 'CONFIDENTIAL',
    basis: 'Wage protection retention',
  },
  {
    recordType: 'SOCIAL_INSURANCE',
    retentionYears: 7,
    classification: 'CONFIDENTIAL',
    basis: 'Social insurance regulation',
  },
  {
    recordType: 'IMMIGRATION_RECORD',
    retentionYears: 5,
    classification: 'CONFIDENTIAL',
    basis: 'Immigration / visa retention',
  },
  {
    recordType: 'ATTENDANCE_LOG',
    retentionYears: 2,
    classification: 'INTERNAL',
    basis: 'Operational',
  },
  {
    recordType: 'LEAVE_RECORD',
    retentionYears: 2,
    classification: 'INTERNAL',
    basis: 'Operational',
  },
  {
    recordType: 'PERFORMANCE_RECORD',
    retentionYears: 5,
    classification: 'CONFIDENTIAL',
    basis: 'Operational',
  },
  {
    recordType: 'TRAINING_RECORD',
    retentionYears: 5,
    classification: 'INTERNAL',
    basis: 'Training history',
  },
  {
    recordType: 'DISCIPLINARY_RECORD',
    retentionYears: 10,
    classification: 'RESTRICTED',
    basis: 'Litigation defence',
  },
  {
    recordType: 'MEDICAL_RECORD',
    retentionYears: 30,
    classification: 'RESTRICTED',
    basis: 'Medical regulation',
  },
  {
    recordType: 'HSE_INJURY_RECORD',
    retentionYears: 30,
    classification: 'RESTRICTED',
    basis: 'HSE / work injury regulation',
  },
  {
    recordType: 'SEPARATION_RECORD',
    retentionYears: 10,
    classification: 'CONFIDENTIAL',
    basis: 'Post-separation defence',
  },
  {
    recordType: 'RECRUITMENT_RECORD',
    retentionYears: 2,
    classification: 'INTERNAL',
    basis: 'Recruitment audit trail',
  },
];

export class DocRetentionScheduleService {
  async seedDefaults(auth: AuthContext, countryCode?: string, effectiveFrom: Date = new Date()) {
    const created: string[] = [];
    for (const r of DEFAULT_RETENTION) {
      try {
        await (prisma as any).docRetentionSchedule.create({
          data: {
            tenantId: auth.tenantId,
            countryCode: countryCode ?? null,
            ...r,
            effectiveFrom,
            status: 'ACTIVE',
          },
        });
        created.push(r.recordType);
      } catch (err) {
        if (!String(err).includes('Unique')) throw err;
      }
    }
    return { created };
  }

  async resolve(
    tenantId: string,
    recordType: string,
    countryCode: string | null,
    asOf: Date = new Date()
  ) {
    const rows = await (prisma as any).docRetentionSchedule.findMany({
      where: {
        tenantId,
        recordType,
        status: 'ACTIVE',
        effectiveFrom: { lte: asOf },
        OR: [{ countryCode: countryCode ?? null }, { countryCode: null }],
      },
      orderBy: [{ countryCode: 'desc' }, { effectiveFrom: 'desc' }],
      take: 1,
    });
    return rows[0] ?? null;
  }

  async list(tenantId: string) {
    return (prisma as any).docRetentionSchedule.findMany({
      where: { tenantId, status: 'ACTIVE' },
      orderBy: [{ recordType: 'asc' }, { countryCode: 'asc' }],
    });
  }
}

export const docRetentionScheduleService = new DocRetentionScheduleService();

export class HrDocumentService {
  async upsert(
    input: {
      id?: string;
      employeeId?: string;
      recordType: string;
      title: string;
      fileUrl?: string;
      classification?: DocClassification;
      issuedAt?: Date;
      expiresAt?: Date;
      countryCode?: string;
      metadata?: Record<string, unknown>;
    },
    auth: AuthContext
  ) {
    const schedule = await docRetentionScheduleService.resolve(
      auth.tenantId,
      input.recordType,
      input.countryCode ?? null
    );
    const retentionUntil = schedule
      ? new Date(
          (input.issuedAt ?? new Date()).getTime() +
            schedule.retentionYears * 365.25 * 24 * 3600 * 1000
        )
      : null;
    const data = {
      tenantId: auth.tenantId,
      employeeId: input.employeeId ?? null,
      recordType: input.recordType,
      title: input.title,
      fileUrl: input.fileUrl,
      classification: input.classification ?? schedule?.classification ?? 'INTERNAL',
      issuedAt: input.issuedAt,
      expiresAt: input.expiresAt,
      retentionUntil,
      metadataJson: input.metadata ?? {},
    };
    if (input.id) {
      return (prisma as any).hrDocument.update({ where: { id: input.id }, data });
    }
    return (prisma as any).hrDocument.create({ data });
  }

  async list(
    tenantId: string,
    filter: {
      employeeId?: string;
      recordType?: string;
      status?: string;
      expiringSoon?: boolean;
      onLitigationHold?: boolean;
    } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const now = new Date();
    const soon = new Date(now.getTime() + 60 * 24 * 3600 * 1000);
    const where = {
      tenantId,
      ...(filter.employeeId ? { employeeId: filter.employeeId } : {}),
      ...(filter.recordType ? { recordType: filter.recordType } : {}),
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.expiringSoon ? { expiresAt: { gte: now, lte: soon }, status: 'ACTIVE' } : {}),
      ...(filter.onLitigationHold ? { litigationHoldId: { not: null } } : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).hrDocument.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).hrDocument.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
}

export const hrDocumentService = new HrDocumentService();

export class DocLitigationHoldService {
  async start(
    input: {
      caseNumber: string;
      subject: string;
      scopeFilter: { recordType?: string; employeeId?: string };
    },
    auth: AuthContext
  ) {
    const hold = await (prisma as any).docLitigationHold.upsert({
      where: {
        aura_doc_litigation_hold_unique: {
          tenantId: auth.tenantId,
          caseNumber: input.caseNumber,
        },
      },
      update: {
        subject: input.subject,
        scopeFilter: input.scopeFilter,
        status: 'ACTIVE',
        startedAt: new Date(),
        startedBy: auth.userId,
      },
      create: {
        tenantId: auth.tenantId,
        caseNumber: input.caseNumber,
        subject: input.subject,
        scopeFilter: input.scopeFilter,
        startedAt: new Date(),
        startedBy: auth.userId,
        status: 'ACTIVE',
      },
    });
    // Apply hold to matching documents.
    const updated = await (prisma as any).hrDocument.updateMany({
      where: {
        tenantId: auth.tenantId,
        ...(input.scopeFilter.recordType ? { recordType: input.scopeFilter.recordType } : {}),
        ...(input.scopeFilter.employeeId ? { employeeId: input.scopeFilter.employeeId } : {}),
        status: 'ACTIVE',
        litigationHoldId: null,
      },
      data: { litigationHoldId: hold.id },
    });
    await (prisma as any).docLitigationHold.update({
      where: { id: hold.id },
      data: { heldDocCount: updated.count },
    });
    return hold;
  }

  async release(caseNumber: string, auth: AuthContext) {
    const hold = await (prisma as any).docLitigationHold.findUnique({
      where: {
        aura_doc_litigation_hold_unique: { tenantId: auth.tenantId, caseNumber },
      },
    });
    if (!hold) throw new Error('hold not found');
    await (prisma as any).hrDocument.updateMany({
      where: { tenantId: auth.tenantId, litigationHoldId: hold.id },
      data: { litigationHoldId: null },
    });
    return (prisma as any).docLitigationHold.update({
      where: { id: hold.id },
      data: { status: 'RELEASED', endedAt: new Date(), endedBy: auth.userId },
    });
  }

  async list(tenantId: string, filter: { status?: string } = {}) {
    return (prisma as any).docLitigationHold.findMany({
      where: { tenantId, ...(filter.status ? { status: filter.status } : {}) },
      orderBy: { startedAt: 'desc' },
    });
  }
}

export const docLitigationHoldService = new DocLitigationHoldService();

export class DocDisposalService {
  /**
   * EPIC-30-S11: disposal workflow. Refuses any document on litigation
   * hold or before its retentionUntil.
   */
  async request(input: { documentIds: string[]; reason: string }, auth: AuthContext) {
    const docs = await (prisma as any).hrDocument.findMany({
      where: { tenantId: auth.tenantId, id: { in: input.documentIds } },
    });
    const now = new Date();
    const blocked: string[] = [];
    for (const d of docs as Array<Record<string, unknown>>) {
      if (d.litigationHoldId) blocked.push(`${d.id} on litigation hold`);
      else if (d.retentionUntil && new Date(d.retentionUntil as string) > now)
        blocked.push(`${d.id} retention until ${d.retentionUntil}`);
    }
    return (prisma as any).docDisposalRequest.create({
      data: {
        tenantId: auth.tenantId,
        documentIds: input.documentIds,
        reason: input.reason,
        requestedBy: auth.userId,
        status: blocked.length ? 'BLOCKED' : 'PENDING',
        blockedReason: blocked.length ? blocked.join('; ') : null,
      },
    });
  }

  async approve(id: string, auth: AuthContext) {
    return (prisma as any).docDisposalRequest.update({
      where: { id },
      data: { status: 'APPROVED', approverId: auth.userId, approvedAt: new Date() },
    });
  }

  async execute(id: string, auth: AuthContext) {
    const req = await (prisma as any).docDisposalRequest.findUnique({ where: { id } });
    if (!req) throw new Error('disposal request not found');
    if (req.status !== 'APPROVED') throw new Error('disposal not approved');
    const ids = req.documentIds as string[];
    await (prisma as any).hrDocument.updateMany({
      where: { tenantId: auth.tenantId, id: { in: ids } },
      data: {
        status: 'DISPOSED',
        disposedAt: new Date(),
        disposedBy: auth.userId,
        disposalReason: req.reason,
      },
    });
    return (prisma as any).docDisposalRequest.update({
      where: { id },
      data: { status: 'EXECUTED', executedAt: new Date(), executedBy: auth.userId },
    });
  }

  async list(tenantId: string, filter: { status?: string } = {}) {
    return (prisma as any).docDisposalRequest.findMany({
      where: { tenantId, ...(filter.status ? { status: filter.status } : {}) },
      orderBy: { requestedAt: 'desc' },
    });
  }
}

export const docDisposalService = new DocDisposalService();

export class HrAuditService {
  async openCycle(
    input: { label: string; scope: Record<string, unknown>; sampleSize: number },
    auth: AuthContext
  ) {
    return (prisma as any).hrAuditCycle.create({
      data: {
        tenantId: auth.tenantId,
        label: input.label,
        scopeJson: input.scope,
        sampleSize: input.sampleSize,
        startedAt: new Date(),
        status: 'OPEN',
      },
    });
  }

  async raiseFinding(
    input: {
      auditCycleId: string;
      documentId?: string;
      employeeId?: string;
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      category: string;
      title: string;
      description?: string;
      remediation?: string;
    },
    auth: AuthContext
  ) {
    const f = await (prisma as any).hrAuditFinding.create({
      data: {
        tenantId: auth.tenantId,
        ...input,
        status: 'OPEN',
      },
    });
    await (prisma as any).hrAuditCycle.update({
      where: { id: input.auditCycleId },
      data: { findingsCount: { increment: 1 } },
    });
    return f;
  }

  async closeFinding(id: string, auth: AuthContext) {
    const f = await (prisma as any).hrAuditFinding.update({
      where: { id },
      data: { status: 'CLOSED', closedAt: new Date(), closedBy: auth.userId },
    });
    await (prisma as any).hrAuditCycle.update({
      where: { id: f.auditCycleId },
      data: { findingsClosedCount: { increment: 1 } },
    });
    return f;
  }

  async closeCycle(id: string, _auth: AuthContext) {
    return (prisma as any).hrAuditCycle.update({
      where: { id },
      data: { status: 'CLOSED', closedAt: new Date() },
    });
  }

  async listCycles(tenantId: string) {
    return (prisma as any).hrAuditCycle.findMany({
      where: { tenantId },
      orderBy: { startedAt: 'desc' },
    });
  }

  async listFindings(tenantId: string, filter: { auditCycleId?: string; status?: string } = {}) {
    return (prisma as any).hrAuditFinding.findMany({
      where: {
        tenantId,
        ...(filter.auditCycleId ? { auditCycleId: filter.auditCycleId } : {}),
        ...(filter.status ? { status: filter.status } : {}),
      },
      orderBy: [{ severity: 'desc' }, { raisedAt: 'desc' }],
    });
  }
}

export const hrAuditService = new HrAuditService();

export class DocComplianceCertificateService {
  async dashboard(tenantId: string, period: string) {
    const now = new Date();
    const soon = new Date(now.getTime() + 60 * 24 * 3600 * 1000);
    const activeDocs = await (prisma as any).hrDocument.count({
      where: { tenantId, status: 'ACTIVE' },
    });
    const expiringSoonCount = await (prisma as any).hrDocument.count({
      where: { tenantId, status: 'ACTIVE', expiresAt: { gte: now, lte: soon } },
    });
    const expiredCount = await (prisma as any).hrDocument.count({
      where: { tenantId, status: 'ACTIVE', expiresAt: { lt: now } },
    });
    const litigationHoldCount = await (prisma as any).docLitigationHold.count({
      where: { tenantId, status: 'ACTIVE' },
    });
    const pendingDisposalCount = await (prisma as any).docDisposalRequest.count({
      where: { tenantId, status: { in: ['PENDING', 'BLOCKED'] } },
    });
    const openFindingsCount = await (prisma as any).hrAuditFinding.count({
      where: { tenantId, status: 'OPEN' },
    });
    const criticalFindingsCount = await (prisma as any).hrAuditFinding.count({
      where: { tenantId, status: 'OPEN', severity: 'CRITICAL' },
    });
    return {
      period,
      activeDocs,
      expiringSoonCount,
      expiredCount,
      litigationHoldCount,
      pendingDisposalCount,
      openFindingsCount,
      criticalFindingsCount,
    };
  }

  async generate(period: string, auth: AuthContext) {
    const stats = await this.dashboard(auth.tenantId, period);
    const reasons: string[] = [];
    if (stats.criticalFindingsCount > 0)
      reasons.push(`${stats.criticalFindingsCount} CRITICAL finding(s)`);
    if (stats.expiredCount > 0) reasons.push(`${stats.expiredCount} expired document(s)`);
    if (stats.pendingDisposalCount > 0)
      reasons.push(`${stats.pendingDisposalCount} pending disposal request(s)`);
    const gatingReason = reasons.length ? `Blocked: ${reasons.join('; ')}` : null;
    return (prisma as any).docComplianceCertificate.upsert({
      where: { aura_doc_compliance_certificate_unique: { tenantId: auth.tenantId, period } },
      update: {
        ...stats,
        gatingReason,
        generatedAt: new Date(),
        status: 'DRAFT',
      },
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
    const cert = await (prisma as any).docComplianceCertificate.findUnique({
      where: { aura_doc_compliance_certificate_unique: { tenantId: auth.tenantId, period } },
    });
    if (!cert) throw new Error('certificate not generated');
    if (cert.gatingReason) throw new Error(`cannot sign while gated: ${cert.gatingReason}`);
    return (prisma as any).docComplianceCertificate.update({
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
    return (prisma as any).docComplianceCertificate.findMany({
      where: { tenantId },
      orderBy: { period: 'desc' },
      take: 24,
    });
  }
}

export const docComplianceCertificateService = new DocComplianceCertificateService();

export const DOC_RETENTION_CONSTANTS = { DEFAULT_RETENTION };
