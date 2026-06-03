import { prisma } from '@aura/database';
import { BaseService } from './base.service';

export type DPAStatus = 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';

export type TransferMechanism = 'SCC_2021_914' | 'BCR' | 'ADEQUACY' | 'NONE';

const STATUS_TRANSITIONS: Record<DPAStatus, DPAStatus[]> = {
  DRAFT: ['ACTIVE', 'TERMINATED'],
  ACTIVE: ['EXPIRED', 'TERMINATED'],
  EXPIRED: ['ACTIVE', 'TERMINATED'],
  TERMINATED: [],
};

export class InvalidDPATransitionError extends Error {
  constructor(from: DPAStatus, to: DPAStatus) {
    super(`Invalid DPA transition: ${from} → ${to}`);
    this.name = 'InvalidDPATransitionError';
  }
}

export class MissingTransferMechanismError extends Error {
  constructor(vendorCountry: string) {
    super(
      `Vendor in ${vendorCountry} requires a transferMechanism (SCC_2021_914 | BCR | ADEQUACY) before activation.`
    );
    this.name = 'MissingTransferMechanismError';
  }
}

// Countries the EU Commission has determined provide adequate protection
// (https://commission.europa.eu/law/law-topic/data-protection/international-dimension-data-protection/adequacy-decisions_en).
// Used to skip the SCC requirement when the receiving country is adequate.
const ADEQUATE_COUNTRIES = new Set([
  'AD',
  'AR',
  'CA',
  'FO',
  'GG',
  'IL',
  'IM',
  'JP',
  'JE',
  'NZ',
  'KR',
  'CH',
  'UY',
  'GB',
]);

export class DPAService extends BaseService {
  constructor() {
    super('DPAService');
  }

  canTransition(from: DPAStatus, to: DPAStatus): boolean {
    return (STATUS_TRANSITIONS[from] ?? []).includes(to);
  }

  assertTransition(from: DPAStatus, to: DPAStatus): void {
    if (!this.canTransition(from, to)) throw new InvalidDPATransitionError(from, to);
  }

  /**
   * GDPR Art. 46 — outbound transfers to non-EEA countries require an
   * appropriate safeguard unless the destination has an adequacy decision.
   * Pure; used by activate() and exposed for callers that need to render
   * the requirement in UI before submitting.
   */
  requiresTransferMechanism(vendorCountry?: string | null): boolean {
    if (!vendorCountry) return false;
    const cc = vendorCountry.toUpperCase();
    return !ADEQUATE_COUNTRIES.has(cc);
  }

  async create(input: {
    tenantId: string;
    vendorName: string;
    vendorCountry?: string;
    scope: string;
    effectiveFrom: Date;
    effectiveTo?: Date;
    isSubProcessor?: boolean;
    jurisdiction?: string;
    transferMechanism?: TransferMechanism;
    documentUrl?: string;
    notes?: string;
    actorId: string;
  }) {
    return prisma.dataProcessingAgreement.create({
      data: {
        tenantId: input.tenantId,
        vendorName: input.vendorName,
        vendorCountry: input.vendorCountry ?? null,
        scope: input.scope,
        effectiveFrom: input.effectiveFrom,
        effectiveTo: input.effectiveTo ?? null,
        status: 'DRAFT',
        isSubProcessor: input.isSubProcessor ?? false,
        jurisdiction: input.jurisdiction ?? null,
        transferMechanism: input.transferMechanism ?? null,
        documentUrl: input.documentUrl ?? null,
        notes: input.notes ?? null,
        createdBy: input.actorId,
      },
    });
  }

  async activate(id: string, tenantId: string, actorId: string, signedAt?: Date) {
    const existing = await this.assertExists(id, tenantId);
    if (!existing) return null;
    this.assertTransition(existing.status as DPAStatus, 'ACTIVE');
    if (
      this.requiresTransferMechanism(existing.vendorCountry) &&
      (!existing.transferMechanism || existing.transferMechanism === 'NONE')
    ) {
      throw new MissingTransferMechanismError(existing.vendorCountry ?? 'UNKNOWN');
    }
    return prisma.dataProcessingAgreement.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        signedAt: signedAt ?? new Date(),
        updatedBy: actorId,
      },
    });
  }

  async expire(id: string, tenantId: string, actorId: string) {
    const existing = await this.assertExists(id, tenantId);
    if (!existing) return null;
    this.assertTransition(existing.status as DPAStatus, 'EXPIRED');
    return prisma.dataProcessingAgreement.update({
      where: { id },
      data: { status: 'EXPIRED', updatedBy: actorId },
    });
  }

  async terminate(id: string, tenantId: string, actorId: string, reason: string) {
    if (!reason || reason.trim().length < 5) {
      throw new Error('Termination reason is required (minimum 5 chars).');
    }
    const existing = await this.assertExists(id, tenantId);
    if (!existing) return null;
    this.assertTransition(existing.status as DPAStatus, 'TERMINATED');
    return prisma.dataProcessingAgreement.update({
      where: { id },
      data: {
        status: 'TERMINATED',
        notes: `${existing.notes ?? ''}\nTermination: ${reason}`.trim(),
        updatedBy: actorId,
      },
    });
  }

  async recordReview(id: string, tenantId: string, reviewerId: string, notes?: string) {
    const existing = await this.assertExists(id, tenantId);
    if (!existing) return null;
    return prisma.dataProcessingAgreement.update({
      where: { id },
      data: {
        reviewedAt: new Date(),
        reviewedById: reviewerId,
        notes: notes ? `${existing.notes ?? ''}\nReview: ${notes}`.trim() : existing.notes,
        updatedBy: reviewerId,
      },
    });
  }

  /**
   * Returns DPAs expiring within `withinDays`. Drives the privacy-ops review
   * surface so renewals are queued before the effectiveTo date passes.
   */
  async expiryWatch(tenantId: string, withinDays = 60) {
    const horizon = new Date();
    horizon.setDate(horizon.getDate() + withinDays);
    return prisma.dataProcessingAgreement.findMany({
      where: {
        tenantId,
        isDeleted: false,
        status: 'ACTIVE',
        effectiveTo: { lte: horizon, not: null },
      },
      orderBy: { effectiveTo: 'asc' },
    });
  }

  async list(params: {
    tenantId: string;
    status?: DPAStatus;
    vendorName?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 50, 200);
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { tenantId: params.tenantId, isDeleted: false };
    if (params.status) where.status = params.status;
    if (params.vendorName) where.vendorName = { contains: params.vendorName, mode: 'insensitive' };
    const [items, total] = await Promise.all([
      prisma.dataProcessingAgreement.findMany({
        where,
        orderBy: { effectiveFrom: 'desc' },
        skip,
        take: limit,
      }),
      prisma.dataProcessingAgreement.count({ where }),
    ]);
    return { items, total, page, pageSize: limit, hasNextPage: skip + items.length < total };
  }

  private async assertExists(id: string, tenantId: string) {
    return prisma.dataProcessingAgreement.findFirst({
      where: { id, tenantId, isDeleted: false },
    });
  }
}

export const dpaService = new DPAService();
