import { prisma } from '@aura/database';
import { BaseService } from './base.service';

export type ConsentPurpose =
  | 'PAYROLL'
  | 'RECRUITMENT'
  | 'MARKETING'
  | 'ANALYTICS'
  | 'THIRD_PARTY_SHARING'
  | 'BACKGROUND_CHECK'
  | 'BIOMETRIC'
  | 'HEALTH_DATA';

export type ConsentLegalBasis =
  | 'CONSENT'
  | 'CONTRACT'
  | 'LEGAL_OBLIGATION'
  | 'LEGITIMATE_INTERESTS'
  | 'VITAL_INTERESTS'
  | 'PUBLIC_TASK';

export type ConsentSubjectType = 'EMPLOYEE' | 'CANDIDATE' | 'DEPENDENT' | 'EX_EMPLOYEE' | 'OTHER';

export class ConsentAlreadyRevokedError extends Error {
  constructor(id: string) {
    super(`Consent record ${id} is already revoked.`);
    this.name = 'ConsentAlreadyRevokedError';
  }
}

export class ConsentNotGrantedError extends Error {
  constructor(id: string) {
    super(`Consent record ${id} was never granted — nothing to revoke.`);
    this.name = 'ConsentNotGrantedError';
  }
}

export class ConsentRecordService extends BaseService {
  constructor() {
    super('ConsentRecordService');
  }

  async grant(input: {
    tenantId: string;
    subjectId: string;
    subjectType?: ConsentSubjectType;
    purpose: ConsentPurpose;
    policyVersion: string;
    legalBasis: ConsentLegalBasis;
    ipAddress?: string;
    userAgent?: string;
    notes?: string;
  }) {
    return prisma.consentRecord.create({
      data: {
        tenantId: input.tenantId,
        subjectId: input.subjectId,
        subjectType: input.subjectType ?? 'EMPLOYEE',
        purpose: input.purpose,
        policyVersion: input.policyVersion,
        legalBasis: input.legalBasis,
        granted: true,
        grantedAt: new Date(),
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
        notes: input.notes ?? null,
      },
    });
  }

  async revoke(id: string, tenantId: string, reason?: string) {
    const existing = await prisma.consentRecord.findFirst({ where: { id, tenantId } });
    if (!existing) return null;
    if (!existing.granted) throw new ConsentNotGrantedError(id);
    if (existing.revokedAt) throw new ConsentAlreadyRevokedError(id);
    return prisma.consentRecord.update({
      where: { id },
      data: {
        revokedAt: new Date(),
        notes: reason ? `${existing.notes ?? ''}\nRevocation: ${reason}`.trim() : existing.notes,
      },
    });
  }

  /**
   * Returns the active (granted + not revoked) consent for a subject + purpose
   * at the current policy version. Drives gates on payroll/recruitment/etc.
   */
  async activeConsentFor(tenantId: string, subjectId: string, purpose: ConsentPurpose) {
    return prisma.consentRecord.findFirst({
      where: { tenantId, subjectId, purpose, granted: true, revokedAt: null },
      orderBy: { grantedAt: 'desc' },
    });
  }

  async historyFor(tenantId: string, subjectId: string) {
    return prisma.consentRecord.findMany({
      where: { tenantId, subjectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async list(params: {
    tenantId: string;
    subjectId?: string;
    purpose?: ConsentPurpose;
    policyVersion?: string;
    activeOnly?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 50, 200);
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { tenantId: params.tenantId };
    if (params.subjectId) where.subjectId = params.subjectId;
    if (params.purpose) where.purpose = params.purpose;
    if (params.policyVersion) where.policyVersion = params.policyVersion;
    if (params.activeOnly) {
      where.granted = true;
      where.revokedAt = null;
    }
    const [items, total] = await Promise.all([
      prisma.consentRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.consentRecord.count({ where }),
    ]);
    return { items, total, page, pageSize: limit, hasNextPage: skip + items.length < total };
  }
}

export const consentRecordService = new ConsentRecordService();
