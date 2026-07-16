/**
 * EPIC-18: Bahrainization Compliance (Bahrain nationalization).
 *
 * Calculates Bahraini-employee ratio per entity, gates LMRA work-permit
 * privileges when below target, drives government-tender eligibility, and
 * detects artificial Bahrainization via SIO + payroll cross-checks.
 *
 * Default targets (representative, configurable per sector/size with
 * effective dating):
 *   PRIVATE / SMALL  : 10%
 *   PRIVATE / MEDIUM : 15%
 *   PRIVATE / LARGE  : 20%
 *   PRIVATE / GIANT  : 25%
 *   GOVT_TENDER min   : 50% (eligibility threshold)
 *
 * RAG bands derived from gap-to-target:
 *   GREEN  — gap >=  0% (at or above target)
 *   AMBER  — gap >= -2% (within 2pp of target)
 *   RED    — gap <  -2% (LMRA-gated)
 */

import { prisma } from '@aura/database';
import {
  normalisePaging,
  prismaPageArgs,
  buildPaginatedResult,
  type PaginationInput,
  type PaginatedResult,
} from '@/lib/services/pagination';

export interface AuthContext {
  tenantId: string;
  userId: string;
}

export type BahRAG = 'GREEN' | 'AMBER' | 'RED';

export const DEFAULT_BAHRAINIZATION_TARGETS: Array<{
  sector: string;
  sizeBracket: string;
  targetRatioPct: number;
  tenderEligibilityMinPct: number;
  basis: string;
}> = [
  {
    sector: 'PRIVATE',
    sizeBracket: 'SMALL',
    targetRatioPct: 10,
    tenderEligibilityMinPct: 50,
    basis: 'LMRA default for SMALL private establishments',
  },
  {
    sector: 'PRIVATE',
    sizeBracket: 'MEDIUM',
    targetRatioPct: 15,
    tenderEligibilityMinPct: 50,
    basis: 'LMRA default for MEDIUM private establishments',
  },
  {
    sector: 'PRIVATE',
    sizeBracket: 'LARGE',
    targetRatioPct: 20,
    tenderEligibilityMinPct: 50,
    basis: 'LMRA default for LARGE private establishments',
  },
  {
    sector: 'PRIVATE',
    sizeBracket: 'GIANT',
    targetRatioPct: 25,
    tenderEligibilityMinPct: 50,
    basis: 'LMRA default for GIANT private establishments',
  },
];

export class BahrainizationConfigService {
  async upsertConfig(
    input: {
      id?: string;
      legalEntityId?: string;
      establishmentName: string;
      sector: string;
      sizeBracket: string;
      bahrainiHeadcount: number;
      totalHeadcount: number;
      lmraEstablishmentId?: string;
    },
    auth: AuthContext
  ) {
    if (input.id) {
      return (prisma as any).bahrainizationConfig.update({
        where: { id: input.id },
        data: {
          establishmentName: input.establishmentName,
          sector: input.sector,
          sizeBracket: input.sizeBracket,
          bahrainiHeadcount: input.bahrainiHeadcount,
          totalHeadcount: input.totalHeadcount,
          lmraEstablishmentId: input.lmraEstablishmentId,
          isInScope: input.totalHeadcount > 0,
        },
      });
    }

    if (input.legalEntityId) {
      return (prisma as any).bahrainizationConfig.upsert({
        where: {
          tenantId_legalEntityId: {
            tenantId: auth.tenantId,
            legalEntityId: input.legalEntityId,
          },
        },
        update: {
          establishmentName: input.establishmentName,
          sector: input.sector,
          sizeBracket: input.sizeBracket,
          bahrainiHeadcount: input.bahrainiHeadcount,
          totalHeadcount: input.totalHeadcount,
          lmraEstablishmentId: input.lmraEstablishmentId,
          isInScope: input.totalHeadcount > 0,
        },
        create: {
          tenantId: auth.tenantId,
          legalEntityId: input.legalEntityId,
          establishmentName: input.establishmentName,
          sector: input.sector,
          sizeBracket: input.sizeBracket,
          bahrainiHeadcount: input.bahrainiHeadcount,
          totalHeadcount: input.totalHeadcount,
          lmraEstablishmentId: input.lmraEstablishmentId,
          isInScope: input.totalHeadcount > 0,
        },
      });
    }

    return (prisma as any).bahrainizationConfig.create({
      data: {
        tenantId: auth.tenantId,
        legalEntityId: null,
        establishmentName: input.establishmentName,
        sector: input.sector,
        sizeBracket: input.sizeBracket,
        bahrainiHeadcount: input.bahrainiHeadcount,
        totalHeadcount: input.totalHeadcount,
        lmraEstablishmentId: input.lmraEstablishmentId,
        isInScope: input.totalHeadcount > 0,
      },
    });
  }

  async listConfigs(tenantId: string) {
    return (prisma as any).bahrainizationConfig.findMany({
      where: { tenantId },
      orderBy: { establishmentName: 'asc' },
    });
  }

  async seedDefaultTargets(auth: AuthContext, effectiveFrom: Date = new Date()) {
    const created: string[] = [];
    for (const t of DEFAULT_BAHRAINIZATION_TARGETS) {
      try {
        await (prisma as any).bahrainizationTarget.create({
          data: {
            tenantId: auth.tenantId,
            ...t,
            effectiveFrom,
            status: 'ACTIVE',
          },
        });
        created.push(`${t.sector}/${t.sizeBracket}`);
      } catch (err) {
        if (!String(err).includes('Unique')) throw err;
      }
    }
    return { created };
  }

  async resolveTarget(
    tenantId: string,
    sector: string,
    sizeBracket: string,
    asOf: Date = new Date()
  ) {
    const rows = await (prisma as any).bahrainizationTarget.findMany({
      where: {
        tenantId,
        sector,
        sizeBracket,
        status: 'ACTIVE',
        effectiveFrom: { lte: asOf },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: asOf } }],
      },
      orderBy: { effectiveFrom: 'desc' },
      take: 1,
    });
    return rows[0] ?? null;
  }

  async listTargets(tenantId: string) {
    return (prisma as any).bahrainizationTarget.findMany({
      where: { tenantId, status: 'ACTIVE' },
      orderBy: [{ sector: 'asc' }, { sizeBracket: 'asc' }],
    });
  }
}

export const bahrainizationConfigService = new BahrainizationConfigService();

/** EPIC-18-S04 / S05: pure ratio + RAG-derivation. */
export function deriveBahrainizationRag(ratioPct: number, targetRatioPct: number): BahRAG {
  const gap = ratioPct - targetRatioPct;
  if (gap >= 0) return 'GREEN';
  if (gap >= -2) return 'AMBER';
  return 'RED';
}

export function missedBahrainiHires(
  bahrainiHeadcount: number,
  totalHeadcount: number,
  targetRatioPct: number
): number {
  if (totalHeadcount === 0) return 0;
  const currentPct = (bahrainiHeadcount / totalHeadcount) * 100;
  if (currentPct >= targetRatioPct) return 0;
  // (bahraini + h) / (total + h) >= target/100
  // 100*(bahraini + h) >= target*(total + h)
  // 100*bahraini + 100h >= target*total + target*h
  // h*(100 - target) >= target*total - 100*bahraini
  const num = targetRatioPct * totalHeadcount - 100 * bahrainiHeadcount;
  const den = 100 - targetRatioPct;
  if (den <= 0) return 0;
  return Math.max(0, Math.ceil(num / den));
}

export class BahrainizationHireService {
  async record(
    input: {
      legalEntityId?: string;
      employeeId: string;
      hireDate: Date;
      jobLevel?: string;
      isBahraini?: boolean;
      cprNumber?: string;
    },
    auth: AuthContext
  ) {
    return (prisma as any).bahrainizationHire.upsert({
      where: {
        tenantId_employeeId: { tenantId: auth.tenantId, employeeId: input.employeeId },
      },
      update: {
        legalEntityId: input.legalEntityId ?? null,
        hireDate: input.hireDate,
        jobLevel: input.jobLevel,
        isBahraini: input.isBahraini ?? true,
        cprNumber: input.cprNumber,
      },
      create: {
        tenantId: auth.tenantId,
        legalEntityId: input.legalEntityId ?? null,
        employeeId: input.employeeId,
        hireDate: input.hireDate,
        jobLevel: input.jobLevel,
        isBahraini: input.isBahraini ?? true,
        cprNumber: input.cprNumber,
      },
    });
  }

  async linkEvidence(
    employeeId: string,
    input: { sioRegistered?: boolean; wageEvidenceLinked?: boolean; tamkeenSupported?: boolean },
    auth: AuthContext
  ) {
    return (prisma as any).bahrainizationHire.update({
      where: { tenantId_employeeId: { tenantId: auth.tenantId, employeeId } },
      data: {
        sioRegistered: input.sioRegistered ?? undefined,
        wageEvidenceLinked: input.wageEvidenceLinked ?? undefined,
        tamkeenSupported: input.tamkeenSupported ?? undefined,
      },
    });
  }

  /** EPIC-18-S06: artificial-Bahrainization detection. */
  async detectArtificialRisk(employeeId: string, auth: AuthContext) {
    const hire = await (prisma as any).bahrainizationHire.findUnique({
      where: { tenantId_employeeId: { tenantId: auth.tenantId, employeeId } },
    });
    if (!hire) throw new Error('hire not found');
    const flags: string[] = [];
    let score = 0;
    if (hire.isBahraini && !hire.sioRegistered) {
      flags.push('NO_SIO_REGISTRATION');
      score += 40;
    }
    if (hire.isBahraini && !hire.wageEvidenceLinked) {
      flags.push('NO_WAGE_EVIDENCE');
      score += 35;
    }
    if (!hire.cprNumber) {
      flags.push('NO_CPR_NUMBER');
      score += 15;
    }
    if (!hire.jobLevel) {
      flags.push('NO_JOB_LEVEL');
      score += 10;
    }
    return (prisma as any).bahrainizationHire.update({
      where: { tenantId_employeeId: { tenantId: auth.tenantId, employeeId } },
      data: { artificialRiskScore: score, artificialRiskFlags: flags },
    });
  }

  async list(
    tenantId: string,
    filter: { legalEntityId?: string; artificialRiskOnly?: boolean } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      ...(filter.legalEntityId ? { legalEntityId: filter.legalEntityId } : {}),
      ...(filter.artificialRiskOnly ? { artificialRiskScore: { gte: 50 } } : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).bahrainizationHire.findMany({
        where,
        orderBy: { hireDate: 'desc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).bahrainizationHire.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
}

export const bahrainizationHireService = new BahrainizationHireService();

export class BahrainizationSnapshotService {
  async takeSnapshot(input: { legalEntityId?: string; snapshotDate: Date }, auth: AuthContext) {
    // Prisma cannot use compound unique keys with null fields via findUnique.
    // Use findFirst with explicit null/undefined matching instead.
    const config = await (prisma as any).bahrainizationConfig.findFirst({
      where: {
        tenantId: auth.tenantId,
        legalEntityId: input.legalEntityId ?? null,
      },
    });
    if (!config) throw new Error('bahrainization config not found');
    if (!config.isInScope) throw new Error('entity is not in scope for Bahrainization');
    const target = await bahrainizationConfigService.resolveTarget(
      auth.tenantId,
      config.sector,
      config.sizeBracket,
      input.snapshotDate
    );
    if (!target) {
      throw new Error(
        `no Bahrainization target for ${config.sector}/${config.sizeBracket}; seed defaults first`
      );
    }
    const ratioPct =
      config.totalHeadcount === 0
        ? 0
        : Number(((config.bahrainiHeadcount / config.totalHeadcount) * 100).toFixed(2));
    const targetRatioPct = Number(target.targetRatioPct);
    const gapPct = Number((ratioPct - targetRatioPct).toFixed(2));
    const ragStatus = deriveBahrainizationRag(ratioPct, targetRatioPct);
    const missedHires = missedBahrainiHires(
      config.bahrainiHeadcount,
      config.totalHeadcount,
      targetRatioPct
    );
    const lmraGated = ragStatus === 'RED';
    const tenderEligible = target.tenderEligibilityMinPct
      ? ratioPct >= Number(target.tenderEligibilityMinPct)
      : ratioPct >= targetRatioPct;

    // Prisma upsert with a named constraint cannot handle null fields.
    // Use findFirst + update/create manually instead.
    const snapshotFields = {
      bahrainiHeadcount: config.bahrainiHeadcount,
      totalHeadcount: config.totalHeadcount,
      ratioPct,
      targetRatioPct,
      gapPct,
      ragStatus,
      missedHires,
      lmraGated,
      tenderEligible,
    };
    const existing = await (prisma as any).bahrainizationSnapshot.findFirst({
      where: {
        tenantId: auth.tenantId,
        legalEntityId: input.legalEntityId ?? null,
        snapshotDate: input.snapshotDate,
      },
    });
    if (existing) {
      return (prisma as any).bahrainizationSnapshot.update({
        where: { id: existing.id },
        data: snapshotFields,
      });
    }
    return (prisma as any).bahrainizationSnapshot.create({
      data: {
        tenantId: auth.tenantId,
        legalEntityId: input.legalEntityId ?? null,
        snapshotDate: input.snapshotDate,
        ...snapshotFields,
      },
    });
  }

  async list(tenantId: string, filter: { legalEntityId?: string } = {}) {
    return (prisma as any).bahrainizationSnapshot.findMany({
      where: {
        tenantId,
        ...(filter.legalEntityId ? { legalEntityId: filter.legalEntityId } : {}),
      },
      orderBy: { snapshotDate: 'desc' },
      take: 100,
    });
  }
}

export const bahrainizationSnapshotService = new BahrainizationSnapshotService();

/** EPIC-18-S03 / S15 / S17: LMRA work-permit gating + tender eligibility. */
export class BahrainizationGate {
  async assertCanHireExpat(tenantId: string, legalEntityId: string | null) {
    const snap = await this.currentSnapshot(tenantId, legalEntityId);
    if (!snap) throw new Error('no Bahrainization snapshot; take one first');
    if (snap.lmraGated) {
      throw new Error(
        `LMRA-gated: Bahrainization ${snap.ratioPct}% < target ${snap.targetRatioPct}% (gap ${snap.gapPct})`
      );
    }
    return { allowed: true, ratioPct: snap.ratioPct, targetRatioPct: snap.targetRatioPct };
  }

  async assertCanBidTender(tenantId: string, legalEntityId: string | null) {
    const snap = await this.currentSnapshot(tenantId, legalEntityId);
    if (!snap) throw new Error('no Bahrainization snapshot; take one first');
    if (!snap.tenderEligible) {
      throw new Error(
        `Tender ineligible: Bahrainization ${snap.ratioPct}% below required tender minimum`
      );
    }
    return { allowed: true, ratioPct: snap.ratioPct };
  }

  async currentSnapshot(tenantId: string, legalEntityId: string | null) {
    return (prisma as any).bahrainizationSnapshot.findFirst({
      where: { tenantId, legalEntityId: legalEntityId ?? null },
      orderBy: { snapshotDate: 'desc' },
    });
  }
}

export const bahrainizationGate = new BahrainizationGate();

export class BahrainizationCertificateService {
  async dashboard(tenantId: string, period: string) {
    const configs = await (prisma as any).bahrainizationConfig.findMany({
      where: { tenantId, isInScope: true },
    });
    const snaps = await (prisma as any).bahrainizationSnapshot.findMany({
      where: { tenantId },
      orderBy: { snapshotDate: 'desc' },
    });
    const latestByEntity = new Map<string, Record<string, unknown>>();
    for (const s of snaps as Array<Record<string, unknown>>) {
      const key = (s.legalEntityId as string) ?? '__tenant__';
      if (!latestByEntity.has(key)) latestByEntity.set(key, s);
    }
    let entitiesAtTarget = 0;
    let entitiesLmraGated = 0;
    let entitiesTenderEligible = 0;
    let totalMissedHires = 0;
    for (const s of latestByEntity.values() as IterableIterator<Record<string, unknown>>) {
      if (s.ragStatus === 'GREEN') entitiesAtTarget += 1;
      if (s.lmraGated) entitiesLmraGated += 1;
      if (s.tenderEligible) entitiesTenderEligible += 1;
      totalMissedHires += Number(s.missedHires ?? 0);
    }
    const artificialRiskCount = await (prisma as any).bahrainizationHire.count({
      where: { tenantId, artificialRiskScore: { gte: 50 } },
    });
    return {
      period,
      entitiesInScope: configs.length,
      entitiesAtTarget,
      entitiesLmraGated,
      entitiesTenderEligible,
      totalMissedHires,
      artificialRiskCount,
    };
  }

  async generate(period: string, auth: AuthContext) {
    const stats = await this.dashboard(auth.tenantId, period);
    const reasons: string[] = [];
    if (stats.entitiesLmraGated > 0)
      reasons.push(`${stats.entitiesLmraGated} LMRA-gated entity(ies)`);
    if (stats.artificialRiskCount > 0)
      reasons.push(`${stats.artificialRiskCount} artificial-Bahrainization risk hire(s)`);
    const gatingReason = reasons.length ? `Blocked: ${reasons.join('; ')}` : null;
    return (prisma as any).bahrainizationCertificate.upsert({
      where: {
        tenantId_period: { tenantId: auth.tenantId, period },
      },
      update: {
        entitiesInScope: stats.entitiesInScope,
        entitiesAtTarget: stats.entitiesAtTarget,
        entitiesLmraGated: stats.entitiesLmraGated,
        entitiesTenderEligible: stats.entitiesTenderEligible,
        totalMissedHires: stats.totalMissedHires,
        artificialRiskCount: stats.artificialRiskCount,
        gatingReason,
        generatedAt: new Date(),
        status: 'DRAFT',
      },
      create: {
        tenantId: auth.tenantId,
        period,
        entitiesInScope: stats.entitiesInScope,
        entitiesAtTarget: stats.entitiesAtTarget,
        entitiesLmraGated: stats.entitiesLmraGated,
        entitiesTenderEligible: stats.entitiesTenderEligible,
        totalMissedHires: stats.totalMissedHires,
        artificialRiskCount: stats.artificialRiskCount,
        gatingReason,
        generatedAt: new Date(),
        status: 'DRAFT',
      },
    });
  }

  async sign(
    period: string,
    attestations: Array<{ field: string; value: string }>,
    auth: AuthContext
  ) {
    const cert = await (prisma as any).bahrainizationCertificate.findFirst({
      where: { tenantId: auth.tenantId, period },
    });
    if (!cert) throw new Error('certificate not generated');
    if (cert.gatingReason) throw new Error(`cannot sign while gated: ${cert.gatingReason}`);
    return (prisma as any).bahrainizationCertificate.update({
      where: { id: cert.id },
      data: {
        status: 'SIGNED',
        signedAt: new Date(),
        signedBy: auth.userId,
        attestationsJson: attestations,
      },
    });
  }

  async list(tenantId: string) {
    return (prisma as any).bahrainizationCertificate.findMany({
      where: { tenantId },
      orderBy: { period: 'desc' },
      take: 24,
    });
  }
}

export const bahrainizationCertificateService = new BahrainizationCertificateService();

export const BAHRAINIZATION_CONSTANTS = { DEFAULT_BAHRAINIZATION_TARGETS };

// ─── BahrainizationDashboardFull interface ──────────────────────────────────

export interface BahrainizationDashboardFull {
  period: string;
  entitiesInScope: number;
  entitiesAtTarget: number;
  entitiesLmraGated: number;
  entitiesTenderEligible: number;
  totalMissedHires: number;
  artificialRiskCount: number;
  avgRatioPct: number;
  avgTargetPct: number;
  avgGapPct: number;
  ragDistribution: Array<{ name: string; value: number }>;
  monthlyTrend: Array<{
    month: string;
    avgRatio: number;
    avgTarget: number;
    lmraGated: number;
    tenderEligible: number;
  }>;
  sectorComparison: Array<{ sector: string; avgRatio: number; count: number }>;
  entityBreakdown: Array<{
    establishmentName: string;
    ratioPct: number;
    targetRatioPct: number;
    gapPct: number;
    ragStatus: string;
    lmraGated: boolean;
    tenderEligible: boolean;
  }>;
}

// The real dashboardFull used by the dashboard route:
export async function computeDashboardFull(
  tenantId: string,
  period: string
): Promise<BahrainizationDashboardFull> {
  const self = bahrainizationCertificateService;
  const base = await self.dashboard(tenantId, period);

  // Monthly trend — last 12 months of snapshots
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);

  const allSnaps = (await (prisma as any).bahrainizationSnapshot.findMany({
    where: {
      tenantId,
      snapshotDate: { gte: twelveMonthsAgo },
    },
    orderBy: { snapshotDate: 'asc' },
  })) as Array<Record<string, unknown>>;

  // Group by YYYY-MM
  const byMonth = new Map<
    string,
    { ratios: number[]; targets: number[]; lmraGated: number; tenderEligible: number }
  >();
  for (const s of allSnaps) {
    const date = new Date(s.snapshotDate as string);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!byMonth.has(key)) {
      byMonth.set(key, { ratios: [], targets: [], lmraGated: 0, tenderEligible: 0 });
    }
    const m = byMonth.get(key)!;
    m.ratios.push(Number(s.ratioPct ?? 0));
    m.targets.push(Number(s.targetRatioPct ?? 0));
    if (s.lmraGated) m.lmraGated += 1;
    if (s.tenderEligible) m.tenderEligible += 1;
  }

  const monthlyTrend = Array.from(byMonth.entries()).map(([month, m]) => ({
    month,
    avgRatio: m.ratios.length
      ? Number((m.ratios.reduce((a, b) => a + b, 0) / m.ratios.length).toFixed(1))
      : 0,
    avgTarget: m.targets.length
      ? Number((m.targets.reduce((a, b) => a + b, 0) / m.targets.length).toFixed(1))
      : 0,
    lmraGated: m.lmraGated,
    tenderEligible: m.tenderEligible,
  }));

  // Latest snapshots for sector comparison & entity breakdown
  const latestSnaps = (await (prisma as any).bahrainizationSnapshot.findMany({
    where: { tenantId },
    orderBy: { snapshotDate: 'desc' },
    take: 500,
  })) as Array<Record<string, unknown>>;

  const latestByEntity = new Map<string, Record<string, unknown>>();
  for (const s of latestSnaps) {
    const key = (s.legalEntityId as string) ?? '__tenant__';
    if (!latestByEntity.has(key)) latestByEntity.set(key, s);
  }

  // RAG distribution
  const ragDist = { GREEN: 0, AMBER: 0, RED: 0 };
  for (const s of latestByEntity.values()) {
    const rag = (s.ragStatus as string) ?? 'RED';
    if (rag in ragDist) ragDist[rag as keyof typeof ragDist] += 1;
  }
  const ragDistribution = [
    { name: 'Green (At Target)', value: ragDist.GREEN },
    { name: 'Amber (Near Target)', value: ragDist.AMBER },
    { name: 'Red (LMRA-Gated)', value: ragDist.RED },
  ];

  // Sector comparison — join with config
  const configs = (await (prisma as any).bahrainizationConfig.findMany({
    where: { tenantId, isInScope: true },
  })) as Array<Record<string, unknown>>;

  const bySector = new Map<string, number[]>();
  for (const cfg of configs) {
    const entityKey = (cfg.legalEntityId as string) ?? '__tenant__';
    const snap = latestByEntity.get(entityKey);
    if (!snap) continue;
    const sector = (cfg.sector as string) ?? 'UNKNOWN';
    if (!bySector.has(sector)) bySector.set(sector, []);
    bySector.get(sector)!.push(Number(snap.ratioPct ?? 0));
  }

  const sectorComparison = Array.from(bySector.entries()).map(([sector, ratios]) => ({
    sector,
    avgRatio: Number((ratios.reduce((a, b) => a + b, 0) / ratios.length).toFixed(1)),
    count: ratios.length,
  }));

  // Entity breakdown
  const entityBreakdown = configs
    .map((cfg) => {
      const entityKey = (cfg.legalEntityId as string) ?? '__tenant__';
      const snap = latestByEntity.get(entityKey);
      return {
        establishmentName: (cfg.establishmentName as string) ?? '—',
        ratioPct: snap ? Number(snap.ratioPct ?? 0) : 0,
        targetRatioPct: snap ? Number(snap.targetRatioPct ?? 0) : 0,
        gapPct: snap ? Number(snap.gapPct ?? 0) : 0,
        ragStatus: (snap?.ragStatus as string) ?? 'RED',
        lmraGated: Boolean(snap?.lmraGated ?? false),
        tenderEligible: Boolean(snap?.tenderEligible ?? false),
      };
    })
    .sort((a, b) => a.gapPct - b.gapPct);

  // Overall averages
  const allLatest = Array.from(latestByEntity.values());
  const avgRatioPct = allLatest.length
    ? Number(
        (allLatest.reduce((sum, s) => sum + Number(s.ratioPct ?? 0), 0) / allLatest.length).toFixed(
          1
        )
      )
    : 0;
  const avgTargetPct = allLatest.length
    ? Number(
        (
          allLatest.reduce((sum, s) => sum + Number(s.targetRatioPct ?? 0), 0) / allLatest.length
        ).toFixed(1)
      )
    : 0;
  const avgGapPct = Number((avgRatioPct - avgTargetPct).toFixed(1));

  return {
    ...base,
    avgRatioPct,
    avgTargetPct,
    avgGapPct,
    ragDistribution,
    monthlyTrend,
    sectorComparison,
    entityBreakdown,
  };
}

// ─── Extended Config Service methods (archive, delete, paginated list) ───────

export class BahrainizationConfigServiceExtended extends BahrainizationConfigService {
  async listPaginated(
    tenantId: string,
    filter: {
      search?: string;
      sector?: string;
      sizeBracket?: string;
      isInScope?: boolean;
      isGovernmentTenderEligible?: boolean;
      isDeleted?: boolean;
    } = {},
    paging?: PaginationInput,
    sort?: { field: string; dir: 'asc' | 'desc' }
  ): Promise<PaginatedResult<unknown>> {
    const where: Record<string, unknown> = {
      tenantId,
      ...(filter.isDeleted !== undefined ? { isDeleted: filter.isDeleted } : { isDeleted: false }),
      ...(filter.sector ? { sector: filter.sector } : {}),
      ...(filter.sizeBracket ? { sizeBracket: filter.sizeBracket } : {}),
      ...(filter.isInScope !== undefined ? { isInScope: filter.isInScope } : {}),
      ...(filter.isGovernmentTenderEligible !== undefined
        ? { isGovernmentTenderEligible: filter.isGovernmentTenderEligible }
        : {}),
    };
    if (filter.search) {
      where.OR = [
        { establishmentName: { contains: filter.search, mode: 'insensitive' } },
        { lmraEstablishmentId: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    const page = normalisePaging(paging);
    const sortField = sort?.field ?? 'establishmentName';
    const sortDir = sort?.dir ?? 'asc';
    const [items, total] = await Promise.all([
      (prisma as any).bahrainizationConfig.findMany({
        where,
        orderBy: { [sortField]: sortDir },
        ...prismaPageArgs(page),
      }),
      (prisma as any).bahrainizationConfig.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }

  async archive(id: string, tenantId: string): Promise<unknown> {
    return (prisma as any).bahrainizationConfig.update({
      where: { id, tenantId },
      data: { isDeleted: true },
    });
  }

  async restore(id: string, tenantId: string): Promise<unknown> {
    return (prisma as any).bahrainizationConfig.update({
      where: { id, tenantId },
      data: { isDeleted: false },
    });
  }

  async hardDelete(id: string, tenantId: string): Promise<unknown> {
    return (prisma as any).bahrainizationConfig.delete({ where: { id, tenantId } });
  }

  async listTargetsPaginated(
    tenantId: string,
    filter: { search?: string; sector?: string; sizeBracket?: string; isDeleted?: boolean } = {},
    paging?: PaginationInput,
    sort?: { field: string; dir: 'asc' | 'desc' }
  ): Promise<PaginatedResult<unknown>> {
    const where: Record<string, unknown> = {
      tenantId,
      status: filter.isDeleted === true ? 'ARCHIVED' : 'ACTIVE',
      ...(filter.sector ? { sector: filter.sector } : {}),
      ...(filter.sizeBracket ? { sizeBracket: filter.sizeBracket } : {}),
    };
    if (filter.search) {
      where.OR = [
        { sector: { contains: filter.search, mode: 'insensitive' } },
        { basis: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    const page = normalisePaging(paging);
    const sortField = sort?.field ?? 'sector';
    const sortDir = sort?.dir ?? 'asc';
    const [items, total] = await Promise.all([
      (prisma as any).bahrainizationTarget.findMany({
        where,
        orderBy: { [sortField]: sortDir },
        ...prismaPageArgs(page),
      }),
      (prisma as any).bahrainizationTarget.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }

  async createTarget(
    input: {
      sector: string;
      sizeBracket: string;
      targetRatioPct: number;
      tenderEligibilityMinPct?: number;
      effectiveFrom: Date;
      effectiveTo?: Date;
      basis?: string;
    },
    auth: AuthContext
  ): Promise<unknown> {
    return (prisma as any).bahrainizationTarget.create({
      data: {
        tenantId: auth.tenantId,
        ...input,
        status: 'ACTIVE',
      },
    });
  }

  async updateTarget(
    id: string,
    input: Partial<{
      targetRatioPct: number;
      tenderEligibilityMinPct: number;
      effectiveFrom: Date;
      effectiveTo: Date;
      basis: string;
      status: string;
    }>,
    tenantId: string
  ): Promise<unknown> {
    return (prisma as any).bahrainizationTarget.update({
      where: { id, tenantId },
      data: input,
    });
  }

  async archiveTarget(id: string, tenantId: string): Promise<unknown> {
    return (prisma as any).bahrainizationTarget.update({
      where: { id, tenantId },
      data: { status: 'ARCHIVED' },
    });
  }

  async deleteTarget(id: string, tenantId: string): Promise<unknown> {
    return (prisma as any).bahrainizationTarget.delete({ where: { id, tenantId } });
  }
}

export const bahrainizationConfigServiceExt = new BahrainizationConfigServiceExtended();

// ─── Extended Snapshot Service methods ──────────────────────────────────────

export class BahrainizationSnapshotServiceExtended extends BahrainizationSnapshotService {
  async listPaginated(
    tenantId: string,
    filter: {
      legalEntityId?: string;
      ragStatus?: string;
      lmraGated?: boolean;
      tenderEligible?: boolean;
      dateFrom?: string;
      dateTo?: string;
    } = {},
    paging?: PaginationInput,
    sort?: { field: string; dir: 'asc' | 'desc' }
  ): Promise<PaginatedResult<unknown>> {
    const where: Record<string, unknown> = {
      tenantId,
      ...(filter.legalEntityId ? { legalEntityId: filter.legalEntityId } : {}),
      ...(filter.ragStatus ? { ragStatus: filter.ragStatus } : {}),
      ...(filter.lmraGated !== undefined ? { lmraGated: filter.lmraGated } : {}),
      ...(filter.tenderEligible !== undefined ? { tenderEligible: filter.tenderEligible } : {}),
    };
    if (filter.dateFrom || filter.dateTo) {
      where.snapshotDate = {
        ...(filter.dateFrom ? { gte: new Date(filter.dateFrom) } : {}),
        ...(filter.dateTo ? { lte: new Date(filter.dateTo) } : {}),
      };
    }
    const page = normalisePaging(paging);
    const sortField = sort?.field ?? 'snapshotDate';
    const sortDir = sort?.dir ?? 'desc';
    const [items, total] = await Promise.all([
      (prisma as any).bahrainizationSnapshot.findMany({
        where,
        orderBy: { [sortField]: sortDir },
        ...prismaPageArgs(page),
      }),
      (prisma as any).bahrainizationSnapshot.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }

  async deleteSnapshot(id: string, tenantId: string): Promise<unknown> {
    return (prisma as any).bahrainizationSnapshot.delete({ where: { id, tenantId } });
  }
}

export const bahrainizationSnapshotServiceExt = new BahrainizationSnapshotServiceExtended();

// ─── Extended Certificate Service (paginated list, archive, delete) ──────────

export class BahrainizationCertificateServiceExtended extends BahrainizationCertificateService {
  async listPaginated(
    tenantId: string,
    filter: {
      status?: string;
      periodFrom?: string;
      periodTo?: string;
    } = {},
    paging?: PaginationInput,
    sort?: { field: string; dir: 'asc' | 'desc' }
  ): Promise<PaginatedResult<unknown>> {
    const where: Record<string, unknown> = {
      tenantId,
      ...(filter.status ? { status: filter.status } : {}),
    };
    if (filter.periodFrom || filter.periodTo) {
      where.period = {
        ...(filter.periodFrom ? { gte: filter.periodFrom } : {}),
        ...(filter.periodTo ? { lte: filter.periodTo } : {}),
      };
    }
    const page = normalisePaging(paging);
    const sortField = sort?.field ?? 'period';
    const sortDir = sort?.dir ?? 'desc';
    const [items, total] = await Promise.all([
      (prisma as any).bahrainizationCertificate.findMany({
        where,
        orderBy: { [sortField]: sortDir },
        ...prismaPageArgs(page),
      }),
      (prisma as any).bahrainizationCertificate.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }

  async deleteCertificate(id: string, tenantId: string): Promise<unknown> {
    return (prisma as any).bahrainizationCertificate.delete({ where: { id, tenantId } });
  }
}

export const bahrainizationCertificateServiceExt = new BahrainizationCertificateServiceExtended();

// ─── Extended Hire Service (archive/delete) ──────────────────────────────────

export class BahrainizationHireServiceExtended extends BahrainizationHireService {
  async listPaginatedExt(
    tenantId: string,
    filter: {
      legalEntityId?: string;
      artificialRiskOnly?: boolean;
      isBahraini?: boolean;
      sioRegistered?: boolean;
      wageEvidenceLinked?: boolean;
      tamkeenSupported?: boolean;
      search?: string;
      isDeleted?: boolean;
    } = {},
    paging?: PaginationInput,
    sort?: { field: string; dir: 'asc' | 'desc' }
  ): Promise<PaginatedResult<unknown>> {
    const where: Record<string, unknown> = {
      tenantId,
      ...(filter.legalEntityId ? { legalEntityId: filter.legalEntityId } : {}),
      ...(filter.artificialRiskOnly ? { artificialRiskScore: { gte: 50 } } : {}),
      ...(filter.isBahraini !== undefined ? { isBahraini: filter.isBahraini } : {}),
      ...(filter.sioRegistered !== undefined ? { sioRegistered: filter.sioRegistered } : {}),
      ...(filter.wageEvidenceLinked !== undefined
        ? { wageEvidenceLinked: filter.wageEvidenceLinked }
        : {}),
      ...(filter.tamkeenSupported !== undefined
        ? { tamkeenSupported: filter.tamkeenSupported }
        : {}),
      ...(filter.isDeleted !== undefined ? { isDeleted: filter.isDeleted } : { isDeleted: false }),
    };
    if (filter.search) {
      where.OR = [
        { cprNumber: { contains: filter.search, mode: 'insensitive' } },
        { jobLevel: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    const page = normalisePaging(paging);
    const sortField = sort?.field ?? 'hireDate';
    const sortDir = sort?.dir ?? 'desc';
    const [items, total] = await Promise.all([
      (prisma as any).bahrainizationHire.findMany({
        where,
        orderBy: { [sortField]: sortDir },
        ...prismaPageArgs(page),
      }),
      (prisma as any).bahrainizationHire.count({ where }),
    ]);

    const employeeIds = items.map((item: any) => item.employeeId).filter(Boolean);
    const employees = employeeIds.length
      ? await (prisma as any).employee.findMany({
          where: { id: { in: employeeIds } },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        })
      : [];

    const employeeMap = new Map(employees.map((e: any) => [e.id, e]));
    const enrichedItems = items.map((item: any) => ({
      ...item,
      employee: employeeMap.get(item.employeeId) || null,
    }));

    return buildPaginatedResult(enrichedItems, total, page);
  }

  async archiveHire(id: string, tenantId: string): Promise<unknown> {
    return (prisma as any).bahrainizationHire.update({
      where: { id, tenantId },
      data: { isDeleted: true },
    });
  }

  async restoreHire(id: string, tenantId: string): Promise<unknown> {
    return (prisma as any).bahrainizationHire.update({
      where: { id, tenantId },
      data: { isDeleted: false },
    });
  }

  async hardDeleteHire(id: string, tenantId: string): Promise<unknown> {
    return (prisma as any).bahrainizationHire.delete({ where: { id, tenantId } });
  }
}

export const bahrainizationHireServiceExt = new BahrainizationHireServiceExtended();

// ─── Export Service ──────────────────────────────────────────────────────────

type ExportEntity = 'config' | 'targets' | 'hires' | 'snapshots' | 'certificate';

function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';
  const keys = Object.keys(rows[0]);
  const header = keys.join(',');
  const body = rows
    .map((r) =>
      keys
        .map((k) => {
          const v = r[k];
          const s = v == null ? '' : String(v);
          return `"${s.replace(/"/g, '""')}"`;
        })
        .join(',')
    )
    .join('\n');
  return `${header}\n${body}`;
}

export class BahrainizationExportService {
  async exportData(
    tenantId: string,
    entity: ExportEntity,
    format: 'csv' | 'xlsx',
    filter: { ids?: string[] } & Record<string, unknown>
  ): Promise<{ filename: string; buffer: Buffer; mimeType: string }> {
    const rows = await this.fetchRows(tenantId, entity, filter);
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `bahrainization_${entity}_${timestamp}.${format}`;

    if (format === 'csv') {
      const csv = toCSV(rows as Record<string, unknown>[]);
      return {
        filename,
        buffer: Buffer.from(csv, 'utf-8'),
        mimeType: 'text/csv; charset=utf-8',
      };
    }

    // XLSX: simple tab-separated fallback (real xlsx would need exceljs)
    const csv = toCSV(rows as Record<string, unknown>[]);
    return {
      filename,
      buffer: Buffer.from(csv, 'utf-8'),
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }

  private async fetchRows(
    tenantId: string,
    entity: ExportEntity,
    filter: { ids?: string[] } & Record<string, unknown>
  ): Promise<unknown[]> {
    const idFilter = filter.ids?.length ? { id: { in: filter.ids } } : {};
    switch (entity) {
      case 'config':
        return (prisma as any).bahrainizationConfig.findMany({
          where: { tenantId, ...idFilter },
          orderBy: { establishmentName: 'asc' },
        });
      case 'targets':
        return (prisma as any).bahrainizationTarget.findMany({
          where: { tenantId, ...idFilter },
          orderBy: [{ sector: 'asc' }, { sizeBracket: 'asc' }],
        });
      case 'hires':
        return (prisma as any).bahrainizationHire.findMany({
          where: { tenantId, ...idFilter },
          orderBy: { hireDate: 'desc' },
        });
      case 'snapshots':
        return (prisma as any).bahrainizationSnapshot.findMany({
          where: { tenantId, ...idFilter },
          orderBy: { snapshotDate: 'desc' },
        });
      case 'certificate':
        return (prisma as any).bahrainizationCertificate.findMany({
          where: { tenantId, ...idFilter },
          orderBy: { period: 'desc' },
        });
      default:
        return [];
    }
  }
}

export const bahrainizationExportService = new BahrainizationExportService();
