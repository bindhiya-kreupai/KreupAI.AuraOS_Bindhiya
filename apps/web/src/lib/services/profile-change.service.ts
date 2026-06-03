import { prisma } from '@aura/database';
import { BaseService } from './base.service';

export type ProfileChangeCategory =
  | 'bank'
  | 'address'
  | 'emergency_contact'
  | 'dependent'
  | 'personal'
  | 'tax';

export type ProfileChangeStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'APPLIED'
  | 'CANCELED';

const ALLOWED_TRANSITIONS: Record<ProfileChangeStatus, ProfileChangeStatus[]> = {
  DRAFT: ['SUBMITTED', 'CANCELED'],
  SUBMITTED: ['APPROVED', 'REJECTED', 'CANCELED'],
  APPROVED: ['APPLIED', 'CANCELED'],
  REJECTED: [],
  APPLIED: [],
  CANCELED: [],
};

export class InvalidTransitionError extends Error {
  constructor(from: ProfileChangeStatus, to: ProfileChangeStatus) {
    super(`Invalid status transition: ${from} → ${to}`);
    this.name = 'InvalidTransitionError';
  }
}

export class ProfileChangeService extends BaseService {
  constructor() {
    super('ProfileChangeService');
  }

  canTransition(from: ProfileChangeStatus, to: ProfileChangeStatus): boolean {
    return (ALLOWED_TRANSITIONS[from] ?? []).includes(to);
  }

  assertTransition(from: ProfileChangeStatus, to: ProfileChangeStatus): void {
    if (!this.canTransition(from, to)) {
      throw new InvalidTransitionError(from, to);
    }
  }

  async list(params: {
    tenantId: string;
    employeeId?: string;
    status?: ProfileChangeStatus;
    category?: ProfileChangeCategory;
    page?: number;
    limit?: number;
  }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      tenantId: params.tenantId,
      isDeleted: false,
    };
    if (params.employeeId) where.employeeId = params.employeeId;
    if (params.status) where.status = params.status;
    if (params.category) where.category = params.category;

    const [items, total] = await Promise.all([
      prisma.profileChangeRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.profileChangeRequest.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize: limit,
      hasNextPage: skip + items.length < total,
    };
  }

  async getById(id: string, tenantId: string) {
    return prisma.profileChangeRequest.findFirst({
      where: { id, tenantId, isDeleted: false },
    });
  }

  async create(input: {
    tenantId: string;
    employeeId: string;
    requestedById: string;
    category: ProfileChangeCategory;
    fieldPath?: string;
    beforeValues?: Record<string, unknown>;
    afterValues: Record<string, unknown>;
    justification?: string;
    attachmentIds?: string[];
    effectiveDate?: Date;
  }) {
    return prisma.profileChangeRequest.create({
      data: {
        tenantId: input.tenantId,
        employeeId: input.employeeId,
        requestedById: input.requestedById,
        category: input.category,
        fieldPath: input.fieldPath ?? null,
        beforeValues: (input.beforeValues ?? {}) as object,
        afterValues: (input.afterValues ?? {}) as object,
        justification: input.justification ?? null,
        attachmentIds: (input.attachmentIds ?? []) as object,
        effectiveDate: input.effectiveDate ?? null,
        status: 'DRAFT',
        createdBy: input.requestedById,
      },
    });
  }

  async updateDraft(
    id: string,
    tenantId: string,
    actorId: string,
    patch: Partial<{
      afterValues: Record<string, unknown>;
      justification: string;
      attachmentIds: string[];
      effectiveDate: Date;
      fieldPath: string;
    }>
  ) {
    const existing = await this.getById(id, tenantId);
    if (!existing) return null;
    if (existing.status !== 'DRAFT') {
      throw new InvalidTransitionError(existing.status as ProfileChangeStatus, 'DRAFT');
    }
    return prisma.profileChangeRequest.update({
      where: { id },
      data: {
        afterValues: patch.afterValues !== undefined ? (patch.afterValues as object) : undefined,
        justification: patch.justification !== undefined ? patch.justification : undefined,
        attachmentIds:
          patch.attachmentIds !== undefined ? (patch.attachmentIds as object) : undefined,
        effectiveDate: patch.effectiveDate !== undefined ? patch.effectiveDate : undefined,
        fieldPath: patch.fieldPath !== undefined ? patch.fieldPath : undefined,
        updatedBy: actorId,
      },
    });
  }

  async submit(id: string, tenantId: string, actorId: string) {
    const existing = await this.getById(id, tenantId);
    if (!existing) return null;
    this.assertTransition(existing.status as ProfileChangeStatus, 'SUBMITTED');
    return prisma.profileChangeRequest.update({
      where: { id },
      data: { status: 'SUBMITTED', submittedAt: new Date(), updatedBy: actorId },
    });
  }

  async approve(id: string, tenantId: string, actorId: string, notes?: string) {
    const existing = await this.getById(id, tenantId);
    if (!existing) return null;
    this.assertTransition(existing.status as ProfileChangeStatus, 'APPROVED');
    return prisma.profileChangeRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedById: actorId,
        reviewedAt: new Date(),
        reviewNotes: notes ?? null,
        updatedBy: actorId,
      },
    });
  }

  async reject(id: string, tenantId: string, actorId: string, notes?: string) {
    const existing = await this.getById(id, tenantId);
    if (!existing) return null;
    this.assertTransition(existing.status as ProfileChangeStatus, 'REJECTED');
    return prisma.profileChangeRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedById: actorId,
        reviewedAt: new Date(),
        reviewNotes: notes ?? null,
        updatedBy: actorId,
      },
    });
  }

  async cancel(id: string, tenantId: string, actorId: string) {
    const existing = await this.getById(id, tenantId);
    if (!existing) return null;
    this.assertTransition(existing.status as ProfileChangeStatus, 'CANCELED');
    return prisma.profileChangeRequest.update({
      where: { id },
      data: { status: 'CANCELED', updatedBy: actorId },
    });
  }

  /**
   * Mark APPLIED after the downstream mutation has happened. We do not perform
   * the mutation here — payroll/employee services own their domains and the
   * approver of an approved change is responsible for confirming application.
   */
  async markApplied(id: string, tenantId: string, actorId: string) {
    const existing = await this.getById(id, tenantId);
    if (!existing) return null;
    this.assertTransition(existing.status as ProfileChangeStatus, 'APPLIED');
    return prisma.profileChangeRequest.update({
      where: { id },
      data: { status: 'APPLIED', appliedAt: new Date(), updatedBy: actorId },
    });
  }
}

export const profileChangeService = new ProfileChangeService();
