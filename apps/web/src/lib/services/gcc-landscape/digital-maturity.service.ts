import { prisma } from '@aura/database';
import type { AuthContext } from './types';

export interface MaturityInput {
  domainCode: string;
  period: string;
  currentLevel: number;
  targetLevel: number;
  notes?: string;
}

const DOMAIN_SEEDS = [
  { code: 'PAYROLL', name: 'Payroll automation', ordering: 10 },
  { code: 'WPS', name: 'WPS / wage protection automation', ordering: 20 },
  { code: 'SOCIAL_INSURANCE', name: 'Social insurance automation', ordering: 30 },
  { code: 'NATIONALIZATION', name: 'Nationalization quota & planning automation', ordering: 40 },
  { code: 'IMMIGRATION', name: 'Visa / work permit automation', ordering: 50 },
  { code: 'RECORDS', name: 'Records and document retention automation', ordering: 60 },
] as const;

/**
 * EPIC-01-S09: Digital maturity scorecard.
 *
 * Tracks current vs target automation level per compliance domain on a 1..5 scale.
 * Snapshots are unique per (tenant, domain, period) — re-submitting the same period
 * overwrites the value; prior periods are retained for trend analysis.
 */
export class DigitalMaturityService {
  async seedDomains() {
    const created: string[] = [];
    for (const seed of DOMAIN_SEEDS) {
      const existing = await (prisma as any).digitalMaturityDomain.findUnique({
        where: { code: seed.code },
      });
      if (existing) continue;
      await (prisma as any).digitalMaturityDomain.create({
        data: {
          code: seed.code,
          name: seed.name,
          ordering: seed.ordering,
          isActive: true,
        },
      });
      created.push(seed.code);
    }
    return { created };
  }

  async listDomains() {
    return (prisma as any).digitalMaturityDomain.findMany({
      where: { isActive: true },
      orderBy: { ordering: 'asc' },
    });
  }

  async upsert(input: MaturityInput, auth: AuthContext) {
    if (input.currentLevel < 1 || input.currentLevel > 5) {
      throw new Error('currentLevel must be 1..5');
    }
    if (input.targetLevel < 1 || input.targetLevel > 5) {
      throw new Error('targetLevel must be 1..5');
    }
    const domain = await (prisma as any).digitalMaturityDomain.findUnique({
      where: { code: input.domainCode },
    });
    if (!domain) {
      throw new Error(`domain ${input.domainCode} not found; run seedDomains first`);
    }
    const gap = Math.max(0, input.targetLevel - input.currentLevel);
    return (prisma as any).digitalMaturitySnapshot.upsert({
      where: {
        aura_digital_maturity_snapshot_unique_key: {
          tenantId: auth.tenantId,
          domainId: domain.id,
          period: input.period,
        },
      },
      update: {
        currentLevel: input.currentLevel,
        targetLevel: input.targetLevel,
        gap,
        notes: input.notes,
        isImprovementPriority: gap >= 2,
        updatedBy: auth.userId,
      },
      create: {
        tenantId: auth.tenantId,
        domainId: domain.id,
        period: input.period,
        currentLevel: input.currentLevel,
        targetLevel: input.targetLevel,
        gap,
        notes: input.notes,
        isImprovementPriority: gap >= 2,
        createdBy: auth.userId,
        updatedBy: auth.userId,
      },
    });
  }

  async scorecard(tenantId: string, period?: string) {
    const domains = await this.listDomains();
    const where: Record<string, unknown> = { tenantId };
    if (period) where.period = period;
    const snapshots = await (prisma as any).digitalMaturitySnapshot.findMany({
      where,
      orderBy: [{ period: 'desc' }],
    });
    const byDomain = new Map<string, Array<Record<string, unknown>>>();
    for (const snap of snapshots as Array<Record<string, unknown>>) {
      const list = byDomain.get(snap.domainId as string) ?? [];
      list.push(snap);
      byDomain.set(snap.domainId as string, list);
    }
    const lines = domains.map((d: { id: string; code: string; name: string }) => {
      const list = byDomain.get(d.id) ?? [];
      const latest = list[0];
      return {
        domain: { code: d.code, name: d.name },
        latest,
        history: list,
      };
    });
    const computedIndex = this.computeIndex(lines);
    return { period: period ?? null, lines, index: computedIndex };
  }

  computeIndex(lines: Array<{ latest?: Record<string, unknown> | null }>) {
    const eligible = lines.filter((l) => l.latest).map((l) => l.latest!);
    if (eligible.length === 0) return { current: 0, target: 0, gap: 0 };
    const current =
      eligible.reduce((s, l) => s + Number((l as { currentLevel: number }).currentLevel ?? 0), 0) /
      eligible.length;
    const target =
      eligible.reduce((s, l) => s + Number((l as { targetLevel: number }).targetLevel ?? 0), 0) /
      eligible.length;
    return {
      current: Number(current.toFixed(2)),
      target: Number(target.toFixed(2)),
      gap: Number((target - current).toFixed(2)),
    };
  }
}

export const digitalMaturityService = new DigitalMaturityService();
