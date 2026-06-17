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
    return (prisma as any).bahrainizationConfig.upsert({
      where: {
        aura_bahrainization_config_unique: {
          tenantId: auth.tenantId,
          legalEntityId: input.legalEntityId ?? null,
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
        legalEntityId: input.legalEntityId ?? null,
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
        aura_bahrainization_hire_unique: { tenantId: auth.tenantId, employeeId: input.employeeId },
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
      where: { aura_bahrainization_hire_unique: { tenantId: auth.tenantId, employeeId } },
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
      where: { aura_bahrainization_hire_unique: { tenantId: auth.tenantId, employeeId } },
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
      where: { aura_bahrainization_hire_unique: { tenantId: auth.tenantId, employeeId } },
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
    const config = await (prisma as any).bahrainizationConfig.findUnique({
      where: {
        aura_bahrainization_config_unique: {
          tenantId: auth.tenantId,
          legalEntityId: input.legalEntityId ?? null,
        },
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

    return (prisma as any).bahrainizationSnapshot.upsert({
      where: {
        aura_bahrainization_snapshot_unique: {
          tenantId: auth.tenantId,
          legalEntityId: input.legalEntityId ?? null,
          snapshotDate: input.snapshotDate,
        },
      },
      update: {
        bahrainiHeadcount: config.bahrainiHeadcount,
        totalHeadcount: config.totalHeadcount,
        ratioPct,
        targetRatioPct,
        gapPct,
        ragStatus,
        missedHires,
        lmraGated,
        tenderEligible,
      },
      create: {
        tenantId: auth.tenantId,
        legalEntityId: input.legalEntityId ?? null,
        snapshotDate: input.snapshotDate,
        bahrainiHeadcount: config.bahrainiHeadcount,
        totalHeadcount: config.totalHeadcount,
        ratioPct,
        targetRatioPct,
        gapPct,
        ragStatus,
        missedHires,
        lmraGated,
        tenderEligible,
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
        aura_bahrainization_certificate_unique: { tenantId: auth.tenantId, period },
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
    const cert = await (prisma as any).bahrainizationCertificate.findUnique({
      where: { aura_bahrainization_certificate_unique: { tenantId: auth.tenantId, period } },
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
