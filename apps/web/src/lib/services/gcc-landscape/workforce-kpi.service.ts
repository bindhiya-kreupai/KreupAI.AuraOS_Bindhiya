import { prisma } from '@aura/database';
import type { AuthContext } from './types';

export interface LocalizationTargetInput {
  countryCode: string;
  legalEntityId?: string | null;
  targetPct: number;
  amberThreshold?: number; // distance below target where status flips to AMBER
  redThreshold?: number;
  programme?: string;
  effectiveFrom?: Date;
}

export interface KpiSnapshotInput {
  countryCode?: string | null;
  legalEntityId?: string | null;
  snapshotDate?: Date;
}

export interface KpiBucket {
  tenantId: string;
  countryCode: string | null;
  legalEntityId: string | null;
  totalHeadcount: number;
  nationalCount: number;
  gccOtherCount: number;
  expatCount: number;
}

export type RagStatus = 'GREEN' | 'AMBER' | 'RED';

export function rag(actualPct: number, targetPct: number, amber: number, red: number): RagStatus {
  const gap = targetPct - actualPct;
  if (gap >= red) return 'RED';
  if (gap >= amber) return 'AMBER';
  return 'GREEN';
}

/**
 * EPIC-01-S07: Workforce localization & KPI baseline.
 *
 * Aggregates current classifications into per-entity / per-country / tenant rollups,
 * computes national % vs target, RAG status, and persists timestamped snapshots for
 * trend tracking.
 */
export class WorkforceKpiService {
  async setTarget(input: LocalizationTargetInput, auth: AuthContext) {
    const countryCode = input.countryCode.trim().toUpperCase();
    if (input.targetPct < 0 || input.targetPct > 100) {
      throw new Error('targetPct must be 0..100');
    }
    const effectiveFrom = input.effectiveFrom ?? new Date();
    return (prisma as any).localizationTarget.create({
      data: {
        tenantId: auth.tenantId,
        countryCode,
        legalEntityId: input.legalEntityId ?? null,
        targetPct: input.targetPct,
        amberThreshold: input.amberThreshold ?? 5,
        redThreshold: input.redThreshold ?? 10,
        programme: input.programme,
        effectiveFrom,
        createdBy: auth.userId,
        updatedBy: auth.userId,
      },
    });
  }

  async getActiveTarget(tenantId: string, countryCode: string, legalEntityId?: string | null) {
    const rows = await (prisma as any).localizationTarget.findMany({
      where: {
        tenantId,
        countryCode,
        legalEntityId: legalEntityId ?? null,
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }],
      },
      orderBy: { effectiveFrom: 'desc' },
      take: 1,
    });
    return rows[0] ?? null;
  }

  async computeBuckets(tenantId: string): Promise<KpiBucket[]> {
    const rows = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
      `SELECT
         "countryOfEmployment" AS "countryCode",
         "workforceClass",
         COUNT(*)::int AS "headcount"
       FROM aura_workforce_classification
       WHERE "tenantId" = $1 AND "effectiveTo" IS NULL
       GROUP BY "countryOfEmployment", "workforceClass"`,
      tenantId
    );

    const byCountry = new Map<string, KpiBucket>();
    for (const row of rows) {
      const country = String(row.countryCode);
      const cls = String(row.workforceClass);
      const count = Number(row.headcount ?? 0);
      const bucket =
        byCountry.get(country) ??
        ({
          tenantId,
          countryCode: country,
          legalEntityId: null,
          totalHeadcount: 0,
          nationalCount: 0,
          gccOtherCount: 0,
          expatCount: 0,
        } as KpiBucket);
      bucket.totalHeadcount += count;
      if (cls === 'NATIONAL') bucket.nationalCount += count;
      else if (cls === 'GCC_NATIONAL_OTHER') bucket.gccOtherCount += count;
      else if (cls === 'EXPAT') bucket.expatCount += count;
      byCountry.set(country, bucket);
    }
    return Array.from(byCountry.values());
  }

  async takeSnapshot(input: KpiSnapshotInput, auth: AuthContext) {
    const buckets = await this.computeBuckets(auth.tenantId);
    const snapshotDate = input.snapshotDate ?? new Date();
    const written: Array<Record<string, unknown>> = [];

    for (const bucket of buckets) {
      const nationalPct =
        bucket.totalHeadcount === 0
          ? 0
          : Number(((bucket.nationalCount / bucket.totalHeadcount) * 100).toFixed(2));
      const target = await this.getActiveTarget(auth.tenantId, bucket.countryCode!, null);
      const targetPct = target ? Number(target.targetPct) : null;
      const ragStatus =
        targetPct == null
          ? null
          : rag(nationalPct, targetPct, Number(target.amberThreshold), Number(target.redThreshold));

      const row = await (prisma as any).workforceKpiSnapshot.upsert({
        where: {
          aura_workforce_kpi_snapshot_unique_key: {
            tenantId: auth.tenantId,
            countryCode: bucket.countryCode,
            legalEntityId: null,
            snapshotDate,
          },
        },
        update: {
          totalHeadcount: bucket.totalHeadcount,
          nationalCount: bucket.nationalCount,
          gccOtherCount: bucket.gccOtherCount,
          expatCount: bucket.expatCount,
          nationalPct,
          targetPct: targetPct ?? null,
          ragStatus,
        },
        create: {
          tenantId: auth.tenantId,
          countryCode: bucket.countryCode,
          legalEntityId: null,
          snapshotDate,
          totalHeadcount: bucket.totalHeadcount,
          nationalCount: bucket.nationalCount,
          gccOtherCount: bucket.gccOtherCount,
          expatCount: bucket.expatCount,
          nationalPct,
          targetPct: targetPct ?? null,
          ragStatus,
        },
      });
      written.push(row);
    }
    return { snapshots: written, snapshotDate };
  }

  async latestKpis(tenantId: string, countryCode?: string) {
    return (prisma as any).workforceKpiSnapshot.findMany({
      where: {
        tenantId,
        ...(countryCode ? { countryCode: countryCode.toUpperCase() } : {}),
      },
      orderBy: { snapshotDate: 'desc' },
      take: 50,
    });
  }
}

export const workforceKpiService = new WorkforceKpiService();
