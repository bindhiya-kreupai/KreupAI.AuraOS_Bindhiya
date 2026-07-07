import { prisma } from '@aura/database';
import { BaseService } from './base.service';

// visaPermit / visaRenewal exist in the deployed db-push database but are not in
// schema.prisma, so they are absent from the generated PrismaClient types.
const db = prisma as any;

export type VisaPermitStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELED' | 'RENEWED' | 'REVOKED';
export type RenewalStatus = 'REQUESTED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED' | 'CANCELED';

export const DOCUMENT_TYPES = [
  'passport',
  'visa',
  'emirates_id',
  'iqama',
  'work_permit',
  'labor_card',
  'medical',
  'residence_permit',
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

const RENEWAL_ALLOWED: Record<RenewalStatus, RenewalStatus[]> = {
  REQUESTED: ['IN_PROGRESS', 'CANCELED', 'REJECTED'],
  IN_PROGRESS: ['COMPLETED', 'REJECTED', 'CANCELED'],
  COMPLETED: [],
  REJECTED: [],
  CANCELED: [],
};

export class InvalidRenewalTransitionError extends Error {
  constructor(from: RenewalStatus, to: RenewalStatus) {
    super(`Invalid renewal transition: ${from} → ${to}`);
    this.name = 'InvalidRenewalTransitionError';
  }
}

const daysFromNow = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

export class VisaPermitService extends BaseService {
  constructor() {
    super('VisaPermitService');
  }

  async list(params: {
    tenantId: string;
    employeeId?: string;
    documentType?: DocumentType;
    status?: VisaPermitStatus;
    countryCode?: string;
    expiringWithinDays?: number;
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
    if (params.employeeId) where.employeeId = params.employeeId;
    if (params.documentType) where.documentType = params.documentType;
    if (params.status) where.status = params.status;
    if (params.countryCode) where.countryCode = params.countryCode.toUpperCase();
    if (params.expiringWithinDays !== undefined) {
      where.expiryDate = { lte: daysFromNow(params.expiringWithinDays) };
      where.status = where.status ?? 'ACTIVE';
    }

    const [items, total] = await Promise.all([
      db.visaPermit.findMany({
        where,
        orderBy: { expiryDate: 'asc' },
        skip,
        take: limit,
      }),
      db.visaPermit.count({ where }),
    ]);

    return { items, total, page, pageSize: limit, hasNextPage: skip + items.length < total };
  }

  async getById(id: string, tenantId: string) {
    return db.visaPermit.findFirst({
      where: { id, tenantId, isDeleted: false },
      include: { renewals: { orderBy: { startedAt: 'desc' } } },
    });
  }

  async create(input: {
    tenantId: string;
    employeeId: string;
    documentType: DocumentType;
    documentNumber: string;
    countryCode: string;
    issuingAuthority?: string;
    issueDate: Date;
    expiryDate: Date;
    category?: string;
    attachmentIds?: string[];
    notes?: string;
    metadata?: Record<string, unknown>;
    actorId: string;
  }) {
    return db.visaPermit.create({
      data: {
        tenantId: input.tenantId,
        employeeId: input.employeeId,
        documentType: input.documentType,
        documentNumber: input.documentNumber,
        countryCode: input.countryCode.toUpperCase(),
        issuingAuthority: input.issuingAuthority ?? null,
        issueDate: input.issueDate,
        expiryDate: input.expiryDate,
        category: input.category ?? null,
        attachmentIds: (input.attachmentIds ?? []) as object,
        notes: input.notes ?? null,
        metadata: (input.metadata ?? {}) as object,
        status: 'ACTIVE',
        createdBy: input.actorId,
      },
    });
  }

  async update(
    id: string,
    tenantId: string,
    actorId: string,
    patch: Partial<{
      documentNumber: string;
      issuingAuthority: string;
      issueDate: Date;
      expiryDate: Date;
      status: VisaPermitStatus;
      attachmentIds: string[];
      notes: string;
      metadata: Record<string, unknown>;
      category: string;
    }>
  ) {
    const existing = await this.getById(id, tenantId);
    if (!existing) return null;
    return db.visaPermit.update({
      where: { id },
      data: {
        documentNumber: patch.documentNumber ?? undefined,
        issuingAuthority: patch.issuingAuthority ?? undefined,
        issueDate: patch.issueDate ?? undefined,
        expiryDate: patch.expiryDate ?? undefined,
        status: patch.status ?? undefined,
        attachmentIds:
          patch.attachmentIds !== undefined ? (patch.attachmentIds as object) : undefined,
        notes: patch.notes ?? undefined,
        metadata: patch.metadata !== undefined ? (patch.metadata as object) : undefined,
        category: patch.category ?? undefined,
        updatedBy: actorId,
      },
    });
  }

  async softDelete(id: string, tenantId: string, actorId: string) {
    const existing = await this.getById(id, tenantId);
    if (!existing) return null;
    return db.visaPermit.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: actorId },
    });
  }

  async expiringSoon(params: { tenantId: string; days: number; employeeId?: string }) {
    return db.visaPermit.findMany({
      where: {
        tenantId: params.tenantId,
        isDeleted: false,
        status: 'ACTIVE',
        employeeId: params.employeeId ?? undefined,
        expiryDate: { lte: daysFromNow(params.days), gte: new Date() },
      },
      orderBy: { expiryDate: 'asc' },
    });
  }

  // ----- Renewals -----

  async startRenewal(
    visaPermitId: string,
    tenantId: string,
    actorId: string,
    input: { assignedTo?: string; vendorName?: string; estimatedCost?: number; notes?: string }
  ) {
    const permit = await db.visaPermit.findFirst({
      where: { id: visaPermitId, tenantId, isDeleted: false },
    });
    if (!permit) return null;
    return db.visaRenewal.create({
      data: {
        tenantId,
        visaPermitId,
        employeeId: permit.employeeId,
        status: 'REQUESTED',
        requestedBy: actorId,
        assignedTo: input.assignedTo ?? null,
        vendorName: input.vendorName ?? null,
        estimatedCost: input.estimatedCost ?? null,
        notes: input.notes ?? null,
        createdBy: actorId,
      },
    });
  }

  async transitionRenewal(
    renewalId: string,
    tenantId: string,
    actorId: string,
    to: RenewalStatus,
    completionData?: {
      newDocumentNumber?: string;
      newIssueDate?: Date;
      newExpiryDate?: Date;
      actualCost?: number;
      notes?: string;
    }
  ) {
    const existing = await db.visaRenewal.findFirst({
      where: { id: renewalId, tenantId, isDeleted: false },
    });
    if (!existing) return null;
    if (!(RENEWAL_ALLOWED[existing.status as RenewalStatus] ?? []).includes(to)) {
      throw new InvalidRenewalTransitionError(existing.status as RenewalStatus, to);
    }

    const isCompletion = to === 'COMPLETED';
    return prisma.$transaction(async (tx: any) => {
      const updated = await tx.visaRenewal.update({
        where: { id: renewalId },
        data: {
          status: to,
          completedAt: isCompletion ? new Date() : undefined,
          newDocumentNumber: completionData?.newDocumentNumber ?? undefined,
          newIssueDate: completionData?.newIssueDate ?? undefined,
          newExpiryDate: completionData?.newExpiryDate ?? undefined,
          actualCost: completionData?.actualCost ?? undefined,
          notes: completionData?.notes ?? undefined,
          updatedBy: actorId,
        },
      });

      // On completion, mark the original permit RENEWED and create a fresh ACTIVE permit
      // carrying the new document number and dates.
      if (isCompletion && completionData?.newExpiryDate) {
        const permit = await tx.visaPermit.findFirstOrThrow({
          where: { id: existing.visaPermitId, tenantId },
        });
        await tx.visaPermit.update({
          where: { id: permit.id },
          data: { status: 'RENEWED', updatedBy: actorId },
        });
        await tx.visaPermit.create({
          data: {
            tenantId,
            employeeId: permit.employeeId,
            documentType: permit.documentType,
            documentNumber: completionData.newDocumentNumber ?? permit.documentNumber,
            countryCode: permit.countryCode,
            issuingAuthority: permit.issuingAuthority,
            issueDate: completionData.newIssueDate ?? new Date(),
            expiryDate: completionData.newExpiryDate,
            category: permit.category,
            attachmentIds: permit.attachmentIds as object,
            notes: permit.notes,
            metadata: permit.metadata as object,
            status: 'ACTIVE',
            createdBy: actorId,
          },
        });
      }
      return updated;
    });
  }
}

export const visaPermitService = new VisaPermitService();
