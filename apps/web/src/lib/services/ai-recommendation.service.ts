import { prisma } from '@aura/database';
import { BaseService } from './base.service';

export type RecommendationStatus = 'OPEN' | 'ACCEPTED' | 'DISMISSED' | 'EXPIRED';

export type RecommendationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RecommendationCategory =
  'ATTRITION_INTERVENTION' | 'LEARNING_PATH' | 'INTERNAL_MOBILITY' | 'TASK_AUTOMATION' | 'INSIGHT';

const STATUS_TRANSITIONS: Record<RecommendationStatus, RecommendationStatus[]> = {
  OPEN: ['ACCEPTED', 'DISMISSED', 'EXPIRED'],
  ACCEPTED: [],
  DISMISSED: [],
  EXPIRED: [],
};

export class InvalidRecommendationTransitionError extends Error {
  constructor(from: RecommendationStatus, to: RecommendationStatus) {
    super(`Invalid recommendation transition: ${from} → ${to}`);
    this.name = 'InvalidRecommendationTransitionError';
  }
}

export class AIRecommendationService extends BaseService {
  constructor() {
    super('AIRecommendationService');
  }

  canTransition(from: RecommendationStatus, to: RecommendationStatus): boolean {
    return (STATUS_TRANSITIONS[from] ?? []).includes(to);
  }

  assertTransition(from: RecommendationStatus, to: RecommendationStatus): void {
    if (!this.canTransition(from, to)) throw new InvalidRecommendationTransitionError(from, to);
  }

  async create(input: {
    tenantId: string;
    category: RecommendationCategory;
    subjectType: string;
    subjectId: string;
    title: string;
    rationale: string;
    recommendedAction?: Record<string, unknown>;
    priority?: RecommendationPriority;
    generatingModelCardId?: string;
    expiresAt?: Date;
  }) {
    return (prisma as any).aIRecommendation.create({
      data: {
        tenantId: input.tenantId,
        category: input.category,
        subjectType: input.subjectType,
        subjectId: input.subjectId,
        title: input.title,
        rationale: input.rationale,
        recommendedAction: (input.recommendedAction ?? {}) as never,
        priority: input.priority ?? 'MEDIUM',
        status: 'OPEN',
        generatingModelCardId: input.generatingModelCardId ?? null,
        expiresAt: input.expiresAt ?? null,
      },
    });
  }

  async accept(id: string, tenantId: string, acceptedById: string) {
    const existing = await this.assertExists(id, tenantId);
    if (!existing) return null;
    this.assertTransition(existing.status as RecommendationStatus, 'ACCEPTED');
    return (prisma as any).aIRecommendation.update({
      where: { id },
      data: { status: 'ACCEPTED', acceptedAt: new Date(), acceptedById },
    });
  }

  async dismiss(id: string, tenantId: string, dismissedById: string, reason?: string) {
    const existing = await this.assertExists(id, tenantId);
    if (!existing) return null;
    this.assertTransition(existing.status as RecommendationStatus, 'DISMISSED');
    return (prisma as any).aIRecommendation.update({
      where: { id },
      data: {
        status: 'DISMISSED',
        dismissedAt: new Date(),
        dismissedById,
        dismissReason: reason ?? null,
      },
    });
  }

  /**
   * Cron-friendly: mark recommendations whose expiresAt has elapsed as EXPIRED.
   * Returns the count of updated rows for the job log.
   */
  async expireDue(tenantId: string): Promise<number> {
    const result = await (prisma as any).aIRecommendation.updateMany({
      where: {
        tenantId,
        status: 'OPEN',
        expiresAt: { lt: new Date(), not: null },
      },
      data: { status: 'EXPIRED' },
    });
    return result.count;
  }

  async list(params: {
    tenantId: string;
    category?: RecommendationCategory;
    subjectType?: string;
    subjectId?: string;
    status?: RecommendationStatus;
    priority?: RecommendationPriority;
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
    if (params.category) where.category = params.category;
    if (params.subjectType) where.subjectType = params.subjectType;
    if (params.subjectId) where.subjectId = params.subjectId;
    if (params.status) where.status = params.status;
    if (params.priority) where.priority = params.priority;
    const [items, total] = await Promise.all([
      (prisma as any).aIRecommendation.findMany({
        where,
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      (prisma as any).aIRecommendation.count({ where }),
    ]);
    return { items, total, page, pageSize: limit, hasNextPage: skip + items.length < total };
  }

  private async assertExists(id: string, tenantId: string) {
    return (prisma as any).aIRecommendation.findFirst({
      where: { id, tenantId, isDeleted: false },
    });
  }
}

export const aiRecommendationService = new AIRecommendationService();
