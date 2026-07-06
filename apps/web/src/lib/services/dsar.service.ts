import { prisma } from '@aura/database';
import { BaseService } from './base.service';

export type DSARStatus =
  'RECEIVED' | 'VERIFYING' | 'IN_PROGRESS' | 'FULFILLED' | 'REJECTED' | 'EXTENDED';

export type DSARRequestType =
  'ACCESS' | 'DELETION' | 'RECTIFICATION' | 'PORTABILITY' | 'OBJECTION' | 'RESTRICTION';

export type DSARSubjectType = 'EMPLOYEE' | 'CANDIDATE' | 'DEPENDENT' | 'EX_EMPLOYEE' | 'OTHER';

export type LegalBasis =
  | 'GDPR_ART_15'
  | 'GDPR_ART_17'
  | 'GDPR_ART_16'
  | 'GDPR_ART_20'
  | 'GDPR_ART_21'
  | 'GDPR_ART_18'
  | 'CCPA'
  | 'UAE_PDPL_ART_18'
  | 'KSA_PDPL'
  | 'OTHER';

const STATUS_TRANSITIONS: Record<DSARStatus, DSARStatus[]> = {
  RECEIVED: ['VERIFYING', 'REJECTED'],
  VERIFYING: ['IN_PROGRESS', 'REJECTED'],
  IN_PROGRESS: ['FULFILLED', 'REJECTED', 'EXTENDED'],
  EXTENDED: ['IN_PROGRESS', 'FULFILLED', 'REJECTED'],
  FULFILLED: [],
  REJECTED: [],
};

export class InvalidDSARTransitionError extends Error {
  constructor(from: DSARStatus, to: DSARStatus) {
    super(`Invalid DSAR transition: ${from} → ${to}`);
    this.name = 'InvalidDSARTransitionError';
  }
}

export class DSARDeadlineExceededError extends Error {
  constructor(dueBy: Date) {
    super(`DSAR SLA deadline exceeded (was due ${dueBy.toISOString().slice(0, 10)})`);
    this.name = 'DSARDeadlineExceededError';
  }
}

// Jurisdictional SLA defaults — days from receipt
const DEFAULT_SLA_DAYS: Record<LegalBasis, number> = {
  GDPR_ART_15: 30, // Right of access
  GDPR_ART_17: 30, // Right to erasure
  GDPR_ART_16: 30, // Right to rectification
  GDPR_ART_20: 30, // Right to data portability
  GDPR_ART_21: 30, // Right to object
  GDPR_ART_18: 30, // Restriction of processing
  CCPA: 45, // California 45-day clock (extendable to 90)
  UAE_PDPL_ART_18: 30,
  KSA_PDPL: 30,
  OTHER: 30,
};

const REQUEST_TO_BASIS: Record<DSARRequestType, LegalBasis> = {
  ACCESS: 'GDPR_ART_15',
  DELETION: 'GDPR_ART_17',
  RECTIFICATION: 'GDPR_ART_16',
  PORTABILITY: 'GDPR_ART_20',
  OBJECTION: 'GDPR_ART_21',
  RESTRICTION: 'GDPR_ART_18',
};

export class DSARService extends BaseService {
  constructor() {
    super('DSARService');
  }

  canTransition(from: DSARStatus, to: DSARStatus): boolean {
    return (STATUS_TRANSITIONS[from] ?? []).includes(to);
  }

  assertTransition(from: DSARStatus, to: DSARStatus): void {
    if (!this.canTransition(from, to)) throw new InvalidDSARTransitionError(from, to);
  }

  /**
   * Compute SLA deadline. Pure — jurisdictional defaults overridable per
   * request when the caller has specific legal-basis intel.
   */
  computeDueBy(requestType: DSARRequestType, receivedAt: Date, legalBasis?: LegalBasis): Date {
    const basis = legalBasis ?? REQUEST_TO_BASIS[requestType];
    const slaDays = DEFAULT_SLA_DAYS[basis] ?? 30;
    const due = new Date(receivedAt);
    due.setDate(due.getDate() + slaDays);
    return due;
  }

  async receive(input: {
    tenantId: string;
    subjectType?: DSARSubjectType;
    subjectId?: string;
    subjectEmail: string;
    requestType: DSARRequestType;
    legalBasis?: LegalBasis;
    notes?: string;
    actorId: string;
  }) {
    const receivedAt = new Date();
    const legalBasis = input.legalBasis ?? REQUEST_TO_BASIS[input.requestType];
    const dueBy = this.computeDueBy(input.requestType, receivedAt, legalBasis);
    return (prisma as any).dsarRequest.create({
      data: {
        tenantId: input.tenantId,
        subjectType: input.subjectType ?? 'EMPLOYEE',
        subjectId: input.subjectId ?? null,
        subjectEmail: input.subjectEmail,
        requestType: input.requestType,
        status: 'RECEIVED',
        legalBasis,
        receivedAt,
        dueBy,
        notes: input.notes ?? null,
        createdBy: input.actorId,
      },
    });
  }

  async startVerification(id: string, tenantId: string, actorId: string) {
    const r = await this.assertExists(id, tenantId);
    if (!r) return null;
    this.assertTransition(r.status as DSARStatus, 'VERIFYING');
    return (prisma as any).dsarRequest.update({
      where: { id },
      data: { status: 'VERIFYING', reviewedById: actorId, updatedBy: actorId },
    });
  }

  async startWork(id: string, tenantId: string, actorId: string) {
    const r = await this.assertExists(id, tenantId);
    if (!r) return null;
    this.assertTransition(r.status as DSARStatus, 'IN_PROGRESS');
    return (prisma as any).dsarRequest.update({
      where: { id },
      data: { status: 'IN_PROGRESS', reviewedById: actorId, updatedBy: actorId },
    });
  }

  async extend(id: string, tenantId: string, actorId: string, reason: string, newDueBy?: Date) {
    if (!reason || reason.trim().length < 5) {
      throw new Error('Extension reason is required (minimum 5 chars).');
    }
    const r = await this.assertExists(id, tenantId);
    if (!r) return null;
    this.assertTransition(r.status as DSARStatus, 'EXTENDED');
    return (prisma as any).dsarRequest.update({
      where: { id },
      data: {
        status: 'EXTENDED',
        extendedAt: new Date(),
        extensionReason: reason,
        dueBy: newDueBy ?? r.dueBy,
        updatedBy: actorId,
      },
    });
  }

  async fulfill(id: string, tenantId: string, actorId: string, artifactUrl?: string) {
    const r = await this.assertExists(id, tenantId);
    if (!r) return null;
    this.assertTransition(r.status as DSARStatus, 'FULFILLED');
    return (prisma as any).dsarRequest.update({
      where: { id },
      data: {
        status: 'FULFILLED',
        fulfilledAt: new Date(),
        artifactUrl: artifactUrl ?? null,
        updatedBy: actorId,
      },
    });
  }

  async reject(id: string, tenantId: string, actorId: string, reason: string) {
    if (!reason || reason.trim().length < 5) {
      throw new Error('Rejection reason is required (minimum 5 chars).');
    }
    const r = await this.assertExists(id, tenantId);
    if (!r) return null;
    this.assertTransition(r.status as DSARStatus, 'REJECTED');
    return (prisma as any).dsarRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        updatedBy: actorId,
      },
    });
  }

  async list(params: {
    tenantId: string;
    status?: DSARStatus;
    overdue?: boolean;
    requestType?: DSARRequestType;
    page?: number;
    limit?: number;
  }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 50, 200);
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {
      tenantId: params.tenantId,
      isDeleted: false,
    };
    if (params.status) where.status = params.status;
    if (params.requestType) where.requestType = params.requestType;
    if (params.overdue) {
      where.dueBy = { lt: new Date() };
      where.status = { notIn: ['FULFILLED', 'REJECTED'] };
    }
    const [items, total] = await Promise.all([
      (prisma as any).dsarRequest.findMany({
        where,
        orderBy: { dueBy: 'asc' },
        skip,
        take: limit,
      }),
      (prisma as any).dsarRequest.count({ where }),
    ]);
    return { items, total, page, pageSize: limit, hasNextPage: skip + items.length < total };
  }

  /**
   * Job helper: returns requests within their last 5 days where status is
   * still pre-fulfillment. Drives the SLA-warning surface.
   */
  async slaWarningWindow(tenantId: string, withinDays = 5) {
    const horizon = new Date();
    horizon.setDate(horizon.getDate() + withinDays);
    return (prisma as any).dsarRequest.findMany({
      where: {
        tenantId,
        isDeleted: false,
        status: { notIn: ['FULFILLED', 'REJECTED'] },
        dueBy: { lte: horizon },
      },
      orderBy: { dueBy: 'asc' },
    });
  }

  private async assertExists(id: string, tenantId: string) {
    return (prisma as any).dsarRequest.findFirst({ where: { id, tenantId, isDeleted: false } });
  }
}

export const dsarService = new DSARService();
