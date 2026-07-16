import { prisma } from '@aura/database';
import { BaseService } from './base.service';

export type CloudService =
  'COMPUTE' | 'STORAGE' | 'DB' | 'NETWORK' | 'OBSERVABILITY' | 'ML' | 'LICENSE';

export type CloudProvider = 'AWS' | 'GCP' | 'AZURE' | 'SUPABASE' | 'DATADOG' | 'OPENAI';

export interface CostRollup {
  total: number;
  currency: string;
  byService: Record<string, number>;
  byProvider: Record<string, number>;
  byRegion: Record<string, number>;
}

export class CloudCostService extends BaseService {
  constructor() {
    super('CloudCostService');
  }

  async record(input: {
    tenantId?: string | null;
    region: string;
    service: CloudService;
    resourceTag?: string;
    day: Date;
    costAmount: number;
    currency?: string;
    unitsConsumed?: number;
    unitMeasure?: string;
    provider: CloudProvider;
    metadata?: Record<string, unknown>;
  }) {
    return (prisma as any).cloudCostRecord.create({
      data: {
        tenantId: input.tenantId ?? null,
        region: input.region,
        service: input.service,
        resourceTag: input.resourceTag ?? null,
        day: input.day,
        costAmount: input.costAmount,
        currency: input.currency ?? 'USD',
        unitsConsumed: input.unitsConsumed ?? null,
        unitMeasure: input.unitMeasure ?? null,
        provider: input.provider,
        metadata: (input.metadata ?? {}) as never,
      },
    });
  }

  /**
   * Pure: collapse a list of cost rows into a multi-dimensional rollup.
   * Used by the FinOps dashboard for the "current month so far" tile.
   */
  rollup(
    rows: Array<{
      costAmount: number | string;
      service: string;
      provider: string;
      region: string;
      currency: string;
    }>
  ): CostRollup {
    const result: CostRollup = {
      total: 0,
      currency: 'USD',
      byService: {},
      byProvider: {},
      byRegion: {},
    };
    if (rows.length === 0) return result;
    result.currency = rows[0].currency;
    for (const r of rows) {
      const amt = typeof r.costAmount === 'string' ? Number(r.costAmount) : r.costAmount;
      result.total += amt;
      result.byService[r.service] = (result.byService[r.service] ?? 0) + amt;
      result.byProvider[r.provider] = (result.byProvider[r.provider] ?? 0) + amt;
      result.byRegion[r.region] = (result.byRegion[r.region] ?? 0) + amt;
    }
    result.total = Math.round(result.total * 100) / 100;
    return result;
  }

  async monthSoFar(tenantId: string | null, year: number, month: number): Promise<CostRollup> {
    const from = new Date(Date.UTC(year, month - 1, 1));
    const to = new Date(Date.UTC(year, month, 0, 23, 59, 59));
    const rows = await (prisma as any).cloudCostRecord.findMany({
      where: { tenantId: tenantId ?? null, day: { gte: from, lte: to } },
      select: { costAmount: true, service: true, provider: true, region: true, currency: true },
    });
    return this.rollup(
      (rows as any[]).map((r: any) => ({
        costAmount: r.costAmount.toString(),
        service: r.service,
        provider: r.provider,
        region: r.region,
        currency: r.currency,
      }))
    );
  }

  async list(params: {
    tenantId?: string | null;
    service?: CloudService;
    provider?: CloudProvider;
    region?: string;
    fromDay?: Date;
    toDay?: Date;
    page?: number;
    limit?: number;
  }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 50, 200);
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (params.tenantId !== undefined) where.tenantId = params.tenantId;
    if (params.service) where.service = params.service;
    if (params.provider) where.provider = params.provider;
    if (params.region) where.region = params.region;
    if (params.fromDay || params.toDay) {
      const day: Record<string, Date> = {};
      if (params.fromDay) day.gte = params.fromDay;
      if (params.toDay) day.lte = params.toDay;
      where.day = day;
    }
    const [items, total] = await Promise.all([
      (prisma as any).cloudCostRecord.findMany({
        where,
        orderBy: { day: 'desc' },
        skip,
        take: limit,
      }),
      (prisma as any).cloudCostRecord.count({ where }),
    ]);
    return { items, total, page, pageSize: limit, hasNextPage: skip + items.length < total };
  }
}

export const cloudCostService = new CloudCostService();
