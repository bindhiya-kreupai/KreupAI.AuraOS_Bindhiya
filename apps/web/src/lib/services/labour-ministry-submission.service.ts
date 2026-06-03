import { prisma } from '@aura/database';
import { BaseService } from './base.service';
import { createHash } from 'crypto';

export type SubmissionStatus =
  | 'DRAFT'
  | 'READY'
  | 'SUBMITTED'
  | 'ACKNOWLEDGED'
  | 'REJECTED'
  | 'RESUBMITTED';

export type Authority =
  | 'MOHRE' // UAE Ministry of Human Resources & Emiratisation
  | 'MUDAD' // KSA Wage Protection
  | 'GOSI' // KSA General Organization for Social Insurance
  | 'HRSD' // KSA Ministry of Human Resources & Social Development
  | 'EPFO' // India Employees' Provident Fund Organisation
  | 'PFRDA' // India Pension Fund Regulatory and Development Authority
  | 'ESIC'; // India Employees' State Insurance Corporation

export type SubmissionFormat = 'SIF' | 'CSV' | 'XML' | 'JSON' | 'XBRL' | 'FVU';

const STATUS_TRANSITIONS: Record<SubmissionStatus, SubmissionStatus[]> = {
  DRAFT: ['READY', 'REJECTED'],
  READY: ['SUBMITTED', 'DRAFT', 'REJECTED'],
  SUBMITTED: ['ACKNOWLEDGED', 'REJECTED'],
  ACKNOWLEDGED: [],
  REJECTED: ['RESUBMITTED', 'DRAFT'],
  RESUBMITTED: ['ACKNOWLEDGED', 'REJECTED'],
};

export class InvalidSubmissionTransitionError extends Error {
  constructor(from: SubmissionStatus, to: SubmissionStatus) {
    super(`Invalid submission transition: ${from} → ${to}`);
    this.name = 'InvalidSubmissionTransitionError';
  }
}

export class LabourMinistrySubmissionService extends BaseService {
  constructor() {
    super('LabourMinistrySubmissionService');
  }

  canTransition(from: SubmissionStatus, to: SubmissionStatus): boolean {
    return (STATUS_TRANSITIONS[from] ?? []).includes(to);
  }

  assertTransition(from: SubmissionStatus, to: SubmissionStatus): void {
    if (!this.canTransition(from, to)) throw new InvalidSubmissionTransitionError(from, to);
  }

  /**
   * Pure: hash a payload object for tamper detection. Used both when
   * sealing a payload for READY transition and when verifying the
   * acknowledged payload matches what was submitted.
   */
  hashPayload(payload: unknown): string {
    const canonical = JSON.stringify(payload, Object.keys(payload as object).sort());
    return createHash('sha256').update(canonical).digest('hex');
  }

  async createDraft(input: {
    tenantId: string;
    countryCode: string;
    authority: Authority;
    submissionType: string;
    periodStart: Date;
    periodEnd: Date;
    payload: Record<string, unknown>;
    format: SubmissionFormat;
    notes?: string;
    actorId: string;
  }) {
    return prisma.labourMinistrySubmission.create({
      data: {
        tenantId: input.tenantId,
        countryCode: input.countryCode.toUpperCase(),
        authority: input.authority,
        submissionType: input.submissionType,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        payload: input.payload as object,
        format: input.format,
        status: 'DRAFT',
        createdBy: input.actorId,
      },
    });
  }

  /**
   * Seal a DRAFT into READY. Computes the payload hash for tamper
   * detection and locks the payload field — subsequent edits require
   * dropping back to DRAFT.
   */
  async markReady(id: string, tenantId: string, actorId: string) {
    const r = await this.assertExists(id, tenantId);
    if (!r) return null;
    this.assertTransition(r.status as SubmissionStatus, 'READY');
    const hash = this.hashPayload(r.payload);
    return prisma.labourMinistrySubmission.update({
      where: { id },
      data: {
        status: 'READY',
        payloadHash: hash,
        updatedBy: actorId,
      },
    });
  }

  /**
   * Mark SUBMITTED with the authority-issued reference. Mirrors #85
   * placeholder-rejection contract — refs < 3 chars rejected.
   */
  async markSubmitted(
    id: string,
    tenantId: string,
    actorId: string,
    authorityRef: string,
    fileUrl?: string
  ) {
    if (!authorityRef || authorityRef.trim().length < 3) {
      throw new Error('A real authority-issued reference is required (no placeholders).');
    }
    const r = await this.assertExists(id, tenantId);
    if (!r) return null;
    this.assertTransition(r.status as SubmissionStatus, 'SUBMITTED');
    return prisma.labourMinistrySubmission.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        authorityRef,
        submittedAt: new Date(),
        fileUrl: fileUrl ?? null,
        updatedBy: actorId,
      },
    });
  }

  async markAcknowledged(id: string, tenantId: string, actorId: string) {
    const r = await this.assertExists(id, tenantId);
    if (!r) return null;
    this.assertTransition(r.status as SubmissionStatus, 'ACKNOWLEDGED');
    return prisma.labourMinistrySubmission.update({
      where: { id },
      data: {
        status: 'ACKNOWLEDGED',
        acknowledgedAt: new Date(),
        updatedBy: actorId,
      },
    });
  }

  async reject(id: string, tenantId: string, actorId: string, reason: string) {
    if (!reason || reason.trim().length < 3) {
      throw new Error('Rejection reason is required.');
    }
    const r = await this.assertExists(id, tenantId);
    if (!r) return null;
    this.assertTransition(r.status as SubmissionStatus, 'REJECTED');
    return prisma.labourMinistrySubmission.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectionReason: reason,
        updatedBy: actorId,
      },
    });
  }

  async resubmit(id: string, tenantId: string, actorId: string, newAuthorityRef: string) {
    if (!newAuthorityRef || newAuthorityRef.trim().length < 3) {
      throw new Error('A new real authority-issued reference is required.');
    }
    const r = await this.assertExists(id, tenantId);
    if (!r) return null;
    this.assertTransition(r.status as SubmissionStatus, 'RESUBMITTED');
    return prisma.labourMinistrySubmission.update({
      where: { id },
      data: {
        status: 'RESUBMITTED',
        authorityRef: newAuthorityRef,
        submittedAt: new Date(),
        updatedBy: actorId,
      },
    });
  }

  async list(params: {
    tenantId: string;
    authority?: Authority;
    countryCode?: string;
    status?: SubmissionStatus;
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
    if (params.authority) where.authority = params.authority;
    if (params.countryCode) where.countryCode = params.countryCode.toUpperCase();
    if (params.status) where.status = params.status;
    const [items, total] = await Promise.all([
      prisma.labourMinistrySubmission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.labourMinistrySubmission.count({ where }),
    ]);
    return { items, total, page, pageSize: limit, hasNextPage: skip + items.length < total };
  }

  private async assertExists(id: string, tenantId: string) {
    return prisma.labourMinistrySubmission.findFirst({
      where: { id, tenantId, isDeleted: false },
    });
  }
}

export const labourMinistrySubmissionService = new LabourMinistrySubmissionService();
