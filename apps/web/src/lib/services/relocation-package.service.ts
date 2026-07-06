import { prisma } from '@aura/database';
import { BaseService } from './base.service';

export type RelocationTier = 'executive' | 'senior' | 'standard';
export type RelocationStatus =
  | 'INITIATED'
  | 'PLANNING'
  | 'IN_TRANSIT'
  | 'HOUSING_SEARCH'
  | 'CLOSING'
  | 'COMPLETED'
  | 'CANCELLED';

export const RELOCATION_TIERS: RelocationTier[] = ['executive', 'senior', 'standard'];
export const RELOCATION_STATUSES: RelocationStatus[] = [
  'INITIATED',
  'PLANNING',
  'IN_TRANSIT',
  'HOUSING_SEARCH',
  'CLOSING',
  'COMPLETED',
  'CANCELLED',
];

/**
 * Static tier catalogue surfaced to the UI as "policy details". Kept in code
 * (not a table) because it is configuration, not per-tenant relocation data.
 */
export const RELOCATION_TIER_POLICIES: Array<{
  tier: RelocationTier;
  title: string;
  benefits: string[];
  color: string;
}> = [
  {
    tier: 'executive',
    title: 'Tier 1: Executive',
    benefits: [
      'Full Packing & Moving',
      'Temp Housing (3 months)',
      'School Search',
      'Spousal Support',
      'Lump Sum $10k',
    ],
    color: 'border-t-purple-500',
  },
  {
    tier: 'senior',
    title: 'Tier 2: Senior Mgmt',
    benefits: ['Packing & Moving', 'Temp Housing (1 month)', 'Home Finding', 'Lump Sum $5k'],
    color: 'border-t-indigo-500',
  },
  {
    tier: 'standard',
    title: 'Tier 3: Individual',
    benefits: ['Moving Allowance', 'Temp Housing (2 weeks)', 'Lump Sum $2k'],
    color: 'border-t-emerald-500',
  },
];

export class RelocationPackageService extends BaseService {
  constructor() {
    super('RelocationPackageService');
  }

  async list(params: {
    tenantId: string;
    employeeId?: string;
    tier?: RelocationTier;
    status?: RelocationStatus;
    page?: number;
    limit?: number;
  }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 50, 200);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { tenantId: params.tenantId, isDeleted: false };
    if (params.employeeId) where.employeeId = params.employeeId;
    if (params.tier) where.tier = params.tier;
    if (params.status) where.status = params.status;

    const [items, total] = await Promise.all([
      prisma.relocationPackage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.relocationPackage.count({ where }),
    ]);

    return { items, total, page, pageSize: limit, hasNextPage: skip + items.length < total };
  }

  async getById(id: string, tenantId: string) {
    return prisma.relocationPackage.findFirst({
      where: { id, tenantId, isDeleted: false },
    });
  }

  async create(input: {
    tenantId: string;
    employeeId: string;
    employeeName: string;
    tier: RelocationTier;
    originLocation: string;
    destination: string;
    budgetAmount?: number;
    currency?: string;
    startDate?: Date;
    targetDate?: Date;
    status?: RelocationStatus;
    notes?: string;
    actorId: string;
  }) {
    return prisma.relocationPackage.create({
      data: {
        tenantId: input.tenantId,
        employeeId: input.employeeId,
        employeeName: input.employeeName,
        tier: input.tier,
        originLocation: input.originLocation,
        destination: input.destination,
        status: input.status ?? 'INITIATED',
        budgetAmount: input.budgetAmount ?? 0,
        currency: input.currency ?? 'USD',
        startDate: input.startDate ?? null,
        targetDate: input.targetDate ?? null,
        notes: input.notes ?? null,
        createdBy: input.actorId,
      },
    });
  }

  async update(
    id: string,
    tenantId: string,
    actorId: string,
    patch: Partial<{
      tier: RelocationTier;
      originLocation: string;
      destination: string;
      status: RelocationStatus;
      budgetAmount: number;
      spentAmount: number;
      currency: string;
      startDate: Date;
      targetDate: Date;
      notes: string;
    }>
  ) {
    const existing = await this.getById(id, tenantId);
    if (!existing) return null;
    return prisma.relocationPackage.update({
      where: { id: existing.id },
      data: {
        tier: patch.tier ?? undefined,
        originLocation: patch.originLocation ?? undefined,
        destination: patch.destination ?? undefined,
        status: patch.status ?? undefined,
        budgetAmount: patch.budgetAmount ?? undefined,
        spentAmount: patch.spentAmount ?? undefined,
        currency: patch.currency ?? undefined,
        startDate: patch.startDate ?? undefined,
        targetDate: patch.targetDate ?? undefined,
        notes: patch.notes ?? undefined,
        updatedBy: actorId,
      },
    });
  }

  async complete(id: string, tenantId: string, actorId: string, satisfaction?: number) {
    const existing = await this.getById(id, tenantId);
    if (!existing) return null;
    return prisma.relocationPackage.update({
      where: { id: existing.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        satisfaction: satisfaction ?? undefined,
        updatedBy: actorId,
      },
    });
  }

  async softDelete(id: string, tenantId: string, actorId: string) {
    const existing = await this.getById(id, tenantId);
    if (!existing) return null;
    return prisma.relocationPackage.update({
      where: { id: existing.id },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: actorId },
    });
  }
}

export const relocationPackageService = new RelocationPackageService();
