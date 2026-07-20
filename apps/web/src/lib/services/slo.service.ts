import { prisma } from '@aura/database';
import { BaseService } from './base.service';

export type SLOIndicatorType =
  'LATENCY_P95' | 'LATENCY_P99' | 'ERROR_RATE' | 'AVAILABILITY' | 'THROUGHPUT';

export type SLOUnit = 'PCT' | 'MS' | 'RPS' | 'COUNT';

export type ErrorBudgetWindow = '7d' | '30d' | '90d';

export class InvalidSLOTargetError extends Error {
  constructor(reason: string) {
    super(`Invalid SLO target: ${reason}`);
    this.name = 'InvalidSLOTargetError';
  }
}

export class SLOService extends BaseService {
  constructor() {
    super('SLOService');
  }

  /**
   * Pure: percentage targets must be in (0, 100]. Latency must be > 0.
   * Throughput must be > 0. Throws InvalidSLOTargetError otherwise.
   */
  validateTarget(indicatorType: SLOIndicatorType, unit: SLOUnit, targetValue: number): void {
    if (!Number.isFinite(targetValue)) {
      throw new InvalidSLOTargetError('targetValue must be a finite number');
    }
    if (unit === 'PCT') {
      if (targetValue <= 0 || targetValue > 100) {
        throw new InvalidSLOTargetError('PCT targets must be in (0, 100]');
      }
    }
    if (unit === 'MS' || unit === 'RPS' || unit === 'COUNT') {
      if (targetValue <= 0) {
        throw new InvalidSLOTargetError(`${unit} targets must be > 0`);
      }
    }
    if (indicatorType === 'AVAILABILITY' && unit !== 'PCT') {
      throw new InvalidSLOTargetError('AVAILABILITY must use PCT unit');
    }
    if ((indicatorType === 'LATENCY_P95' || indicatorType === 'LATENCY_P99') && unit !== 'MS') {
      throw new InvalidSLOTargetError(`${indicatorType} must use MS unit`);
    }
  }

  /**
   * Pure: monthly error-budget minutes given an availability target.
   * 99.95% over a 30d window = 21.6 minutes / month.
   */
  errorBudgetMinutes(availabilityPct: number, windowDays: number): number {
    if (availabilityPct <= 0 || availabilityPct >= 100) return 0;
    const totalMinutes = windowDays * 24 * 60;
    return totalMinutes * (1 - availabilityPct / 100);
  }

  async create(input: {
    tenantId?: string | null;
    serviceName: string;
    indicatorType: SLOIndicatorType;
    routePattern?: string;
    targetValue: number;
    unit: SLOUnit;
    errorBudgetWindow?: ErrorBudgetWindow;
    ownerTeam: string;
    runbookUrl?: string;
    alertChannel?: string;
    description?: string;
    actorId: string;
  }) {
    this.validateTarget(input.indicatorType, input.unit, input.targetValue);
    return (prisma as any).serviceLevelObjective.create({
      data: {
        tenantId: input.tenantId ?? null,
        serviceName: input.serviceName,
        indicatorType: input.indicatorType,
        routePattern: input.routePattern ?? null,
        targetValue: input.targetValue,
        unit: input.unit,
        errorBudgetWindow: input.errorBudgetWindow ?? '30d',
        ownerTeam: input.ownerTeam,
        runbookUrl: input.runbookUrl ?? null,
        alertChannel: input.alertChannel ?? null,
        description: input.description ?? null,
        createdBy: input.actorId,
      },
    });
  }

  async update(
    id: string,
    tenantId: string | null,
    actorId: string,
    patch: Partial<{
      targetValue: number;
      runbookUrl: string;
      alertChannel: string;
      ownerTeam: string;
      description: string;
      errorBudgetWindow: ErrorBudgetWindow;
    }>
  ) {
    const existing = await (prisma as any).serviceLevelObjective.findFirst({
      where: { id, tenantId: tenantId ?? null, isDeleted: false },
    });
    if (!existing) return null;
    if (patch.targetValue !== undefined) {
      this.validateTarget(
        existing.indicatorType as SLOIndicatorType,
        existing.unit as SLOUnit,
        patch.targetValue
      );
    }
    return (prisma as any).serviceLevelObjective.update({
      where: { id },
      data: { ...patch, updatedBy: actorId },
    });
  }

  async list(params: {
    tenantId?: string | null;
    serviceName?: string;
    indicatorType?: SLOIndicatorType;
    page?: number;
    limit?: number;
  }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 50, 200);
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { isDeleted: false };
    if (params.tenantId !== undefined) where.tenantId = params.tenantId;
    if (params.serviceName) where.serviceName = params.serviceName;
    if (params.indicatorType) where.indicatorType = params.indicatorType;
    const [items, total] = await Promise.all([
      (prisma as any).serviceLevelObjective.findMany({
        where,
        orderBy: [{ serviceName: 'asc' }, { indicatorType: 'asc' }],
        skip,
        take: limit,
      }),
      (prisma as any).serviceLevelObjective.count({ where }),
    ]);
    return { items, total, page, pageSize: limit, hasNextPage: skip + items.length < total };
  }
}

export const sloService = new SLOService();
