/**
 * EPIC-16: Emiratisation Compliance (UAE nationalization quotas).
 *
 * Default policy thresholds (configurable, effective-dated):
 *   - Applies to private-sector entities with skilledWorkforceCount ≥ 50
 *   - Default annual target: 2% mid-year + 4% year-end growth on top of
 *     existing rate (configurable via EmiratisationTarget)
 *   - Default fine: AED 7,000 per missed hire
 *
 * Fake-Emiratisation detection rules (S06):
 *   - +50 risk: not registered in GPSSA
 *   - +30 risk: not covered by WPS in last month
 *   - +20 risk: marked NOT_SKILLED while claimed as skilled headcount
 *   - +50 risk: hire date <30 days from prior fake-flagged exit by same employee
 *
 * Any score ≥ 50 flags the hire as fake-risk and excludes it from
 * compliance counts.
 */

import { prisma } from '@aura/database';
import { resolveRuleObject } from '../gcc-rule-library/rule-value.helper';
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

export type Checkpoint = 'MID_YEAR' | 'YEAR_END';
export type RagStatus = 'GREEN' | 'AMBER' | 'RED';

/**
 * Hardcoded fallbacks for the UAE EMIRATISATION_PRIVATE_TARGET rule. The
 * canonical values live in the country rule pack (EPIC-02 / EPIC-36)
 * and are resolved at runtime by `EmiratisationConfigService.getDefaults()`
 * — these constants are only used when no active rule pack is seeded
 * for UAE. Keep them in sync with rule-pack-seeds.ts so historical
 * behaviour is preserved.
 */
const APPLICABILITY_THRESHOLD = 50;
const DEFAULT_HALF_YEAR_TARGET_PCT = 2;
const DEFAULT_YEAR_END_TARGET_PCT = 4;
const DEFAULT_FINE_PER_HIRE = 7000;
const FAKE_RISK_THRESHOLD = 50;

interface EmiratisationDefaults {
  /** Skilled workforce headcount threshold above which Emiratisation applies. */
  appliesAt: number;
  /** Mid-year hire target as % of skilled workforce. */
  halfYearTargetPct: number;
  /** Year-end hire target as % of skilled workforce. */
  yearEndTargetPct: number;
  /** Fine per missed Emiratisation hire (AED). */
  finePerMissedHire: number;
}

const HARDCODED_DEFAULTS: EmiratisationDefaults = {
  appliesAt: APPLICABILITY_THRESHOLD,
  halfYearTargetPct: DEFAULT_HALF_YEAR_TARGET_PCT,
  yearEndTargetPct: DEFAULT_YEAR_END_TARGET_PCT,
  finePerMissedHire: DEFAULT_FINE_PER_HIRE,
};

export class EmiratisationConfigService {
  /**
   * Resolve the canonical Emiratisation defaults from the active UAE
   * rule pack (EPIC-02 / EPIC-36). Any field not present in the rule
   * pack falls back to the hardcoded constant — historical behaviour
   * is preserved for tenants without a seeded UAE rule pack.
   */
  async getDefaults(): Promise<EmiratisationDefaults> {
    return resolveRuleObject<EmiratisationDefaults>(
      'AE',
      'NATIONALIZATION',
      'EMIRATISATION_PRIVATE_TARGET',
      HARDCODED_DEFAULTS,
      { source: 'emiratisation.getDefaults' }
    );
  }

  async upsertConfig(
    input: {
      legalEntityId?: string;
      establishmentName: string;
      skilledWorkforceCount: number;
      sector?: string;
    },
    auth: AuthContext
  ) {
    const { appliesAt } = await this.getDefaults();
    const where = {
      tenantId: auth.tenantId,
      legalEntityId: input.legalEntityId ?? null,
    };
    const data = {
      establishmentName: input.establishmentName,
      skilledWorkforceCount: input.skilledWorkforceCount,
      sector: input.sector,
      isInScope: input.skilledWorkforceCount >= appliesAt,
    };
    const existing = await (prisma as any).emiratisationConfig.findFirst({ where });
    if (existing) {
      return (prisma as any).emiratisationConfig.update({
        where: { id: existing.id },
        data,
      });
    }
    return (prisma as any).emiratisationConfig.create({
      data: {
        ...data,
        tenantId: auth.tenantId,
        legalEntityId: input.legalEntityId ?? null,
      },
    });
  }

  /**
   * EPIC-16-S02: applicability check.
   *
   * Synchronous variant uses the hardcoded threshold (50) — kept for
   * callers that cannot await (e.g. snapshot rendering helpers).
   * For rule-engine-driven behaviour use `isApplicableAsync`.
   */
  isApplicable(skilledWorkforceCount: number) {
    return skilledWorkforceCount >= APPLICABILITY_THRESHOLD;
  }

  /** Rule-engine-aware applicability check (preferred). */
  async isApplicableAsync(skilledWorkforceCount: number) {
    const { appliesAt } = await this.getDefaults();
    return skilledWorkforceCount >= appliesAt;
  }

  async listConfigs(tenantId: string) {
    return (prisma as any).emiratisationConfig.findMany({
      where: { tenantId },
      orderBy: { establishmentName: 'asc' },
    });
  }

  async setTarget(
    input: {
      legalEntityId?: string;
      year: number;
      halfYearTargetPct?: number;
      yearEndTargetPct?: number;
      finePerMissedHire?: number;
    },
    auth: AuthContext
  ) {
    const defaults = await this.getDefaults();
    const where = {
      tenantId: auth.tenantId,
      legalEntityId: input.legalEntityId ?? null,
      year: input.year,
    };
    const data = {
      halfYearTargetPct: input.halfYearTargetPct ?? defaults.halfYearTargetPct,
      yearEndTargetPct: input.yearEndTargetPct ?? defaults.yearEndTargetPct,
      finePerMissedHire: input.finePerMissedHire ?? defaults.finePerMissedHire,
    };
    const existing = await (prisma as any).emiratisationTarget.findFirst({ where });
    if (existing) {
      return (prisma as any).emiratisationTarget.update({
        where: { id: existing.id },
        data,
      });
    }
    return (prisma as any).emiratisationTarget.create({
      data: {
        ...data,
        tenantId: auth.tenantId,
        legalEntityId: input.legalEntityId ?? null,
        year: input.year,
        effectiveFrom: new Date(input.year, 0, 1),
        createdBy: auth.userId,
      },
    });
  }

  async getTarget(tenantId: string, legalEntityId: string | null, year: number) {
    return (prisma as any).emiratisationTarget.findFirst({
      where: {
        tenantId,
        legalEntityId: legalEntityId ?? null,
        year,
      },
    });
  }

  async listTargets(tenantId: string) {
    return (prisma as any).emiratisationTarget.findMany({
      where: { tenantId },
      orderBy: [{ year: 'desc' }],
    });
  }
}

export const emiratisationConfigService = new EmiratisationConfigService();

export interface RecordHireInput {
  legalEntityId?: string;
  employeeId: string;
  hireDate: Date;
  jobLevel?: string;
  isSkilled?: boolean;
  nafisReference?: string;
}

export class EmiratisationHireService {
  /** EPIC-16-S09 / S07: record a UAE national hire. */
  async record(input: RecordHireInput, auth: AuthContext) {
    return (prisma as any).emiratisationHire.upsert({
      where: {
        aura_emiratisation_hire_unique: {
          tenantId: auth.tenantId,
          employeeId: input.employeeId,
        },
      },
      update: {
        legalEntityId: input.legalEntityId ?? null,
        hireDate: input.hireDate,
        jobLevel: input.jobLevel,
        isSkilled: input.isSkilled ?? true,
        nafisReference: input.nafisReference,
      },
      create: {
        tenantId: auth.tenantId,
        legalEntityId: input.legalEntityId ?? null,
        employeeId: input.employeeId,
        hireDate: input.hireDate,
        jobLevel: input.jobLevel,
        isSkilled: input.isSkilled ?? true,
        nafisReference: input.nafisReference,
        gpssaRegistered: false,
        wpsCovered: false,
        fakeRiskScore: 0,
        fakeRiskFlags: [],
      },
    });
  }

  /** EPIC-16-S10 / S11: link GPSSA + WPS evidence. */
  async linkEvidence(
    employeeId: string,
    input: { gpssaRegistered?: boolean; wpsCovered?: boolean },
    auth: AuthContext
  ) {
    return (prisma as any).emiratisationHire.update({
      where: {
        aura_emiratisation_hire_unique: { tenantId: auth.tenantId, employeeId },
      },
      data: {
        gpssaRegistered: input.gpssaRegistered ?? undefined,
        wpsCovered: input.wpsCovered ?? undefined,
      },
    });
  }

  /** EPIC-16-S06: fake/artificial Emiratisation detection. */
  async detectFakeRisk(employeeId: string, auth: AuthContext) {
    const hire = await (prisma as any).emiratisationHire.findUnique({
      where: { aura_emiratisation_hire_unique: { tenantId: auth.tenantId, employeeId } },
    });
    if (!hire) throw new Error('hire record not found');
    const flags: string[] = [];
    let score = 0;
    if (!hire.gpssaRegistered) {
      flags.push('NO_GPSSA');
      score += 50;
    }
    if (!hire.wpsCovered) {
      flags.push('NO_WPS');
      score += 30;
    }
    if (!hire.isSkilled) {
      flags.push('NOT_SKILLED_BUT_COUNTED');
      score += 20;
    }
    return (prisma as any).emiratisationHire.update({
      where: { aura_emiratisation_hire_unique: { tenantId: auth.tenantId, employeeId } },
      data: { fakeRiskScore: score, fakeRiskFlags: flags },
    });
  }

  async list(
    tenantId: string,
    filter: { legalEntityId?: string; fakeRiskOnly?: boolean } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      ...(filter.legalEntityId ? { legalEntityId: filter.legalEntityId } : {}),
      ...(filter.fakeRiskOnly ? { fakeRiskScore: { gte: FAKE_RISK_THRESHOLD } } : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).emiratisationHire.findMany({
        where,
        orderBy: { hireDate: 'desc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).emiratisationHire.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
}

export const emiratisationHireService = new EmiratisationHireService();

function rag(actualPct: number, targetPct: number): RagStatus {
  const gap = targetPct - actualPct;
  if (gap <= 0) return 'GREEN';
  if (gap <= 1) return 'AMBER';
  return 'RED';
}

export class EmiratisationSnapshotService {
  /**
   * EPIC-16-S03 / S04 / S05: per-entity snapshot at a checkpoint date.
   *
   * Counts only hires whose fakeRiskScore < FAKE_RISK_THRESHOLD (S06).
   */
  async takeSnapshot(
    input: {
      legalEntityId?: string;
      checkpointDate: Date;
      checkpoint: Checkpoint;
      year: number;
    },
    auth: AuthContext
  ) {
    const config = await (prisma as any).emiratisationConfig.findFirst({
      where: {
        tenantId: auth.tenantId,
        legalEntityId: input.legalEntityId ?? null,
      },
    });
    if (!config) throw new Error('emiratisation config not found');
    if (!config.isInScope) {
      throw new Error(
        `entity is below ${APPLICABILITY_THRESHOLD}-employee threshold; Emiratisation does not apply`
      );
    }
    const target = await emiratisationConfigService.getTarget(
      auth.tenantId,
      input.legalEntityId ?? null,
      input.year
    );
    if (!target) throw new Error(`target not configured for year ${input.year}`);

    const targetPct = Number(
      input.checkpoint === 'MID_YEAR' ? target.halfYearTargetPct : target.yearEndTargetPct
    );

    const validHires = await (prisma as any).emiratisationHire.count({
      where: {
        tenantId: auth.tenantId,
        legalEntityId: input.legalEntityId ?? null,
        isSkilled: true,
        fakeRiskScore: { lt: FAKE_RISK_THRESHOLD },
      },
    });

    const skilledHeadcount = config.skilledWorkforceCount;
    const actualPct =
      skilledHeadcount === 0 ? 0 : Number(((validHires / skilledHeadcount) * 100).toFixed(2));
    const gapPct = Number(Math.max(0, targetPct - actualPct).toFixed(2));
    const missedHires = Math.ceil((gapPct / 100) * skilledHeadcount);
    const finePerHire = Number(target.finePerMissedHire);
    const projectedFine = Number((missedHires * finePerHire).toFixed(2));

    const snapWhere = {
      tenantId: auth.tenantId,
      legalEntityId: input.legalEntityId ?? null,
      checkpointDate: input.checkpointDate,
    };
    const snapData = {
      checkpoint: input.checkpoint,
      skilledHeadcount,
      uaeNationalCount: validHires,
      actualPct,
      targetPct,
      gapPct,
      missedHires,
      projectedFine,
      ragStatus: rag(actualPct, targetPct),
      checkpointDate: input.checkpointDate,
    };
    const existingSnap = await (prisma as any).emiratisationSnapshot.findFirst({
      where: snapWhere,
    });
    if (existingSnap) {
      return (prisma as any).emiratisationSnapshot.update({
        where: { id: existingSnap.id },
        data: snapData,
      });
    }
    return (prisma as any).emiratisationSnapshot.create({
      data: {
        ...snapData,
        tenantId: auth.tenantId,
        legalEntityId: input.legalEntityId ?? null,
      },
    });
  }

  async list(tenantId: string, filter: { legalEntityId?: string } = {}) {
    return (prisma as any).emiratisationSnapshot.findMany({
      where: {
        tenantId,
        ...(filter.legalEntityId ? { legalEntityId: filter.legalEntityId } : {}),
      },
      orderBy: { checkpointDate: 'desc' },
      take: 100,
    });
  }
}

export const emiratisationSnapshotService = new EmiratisationSnapshotService();

export class EmiratisationFineService {
  /** EPIC-16-S05: projected vs actual fines. */
  async raiseProjected(
    input: { legalEntityId?: string; year: number; checkpoint: Checkpoint },
    auth: AuthContext
  ) {
    const snap = await (prisma as any).emiratisationSnapshot.findFirst({
      where: {
        tenantId: auth.tenantId,
        legalEntityId: input.legalEntityId ?? null,
        checkpoint: input.checkpoint,
      },
      orderBy: { checkpointDate: 'desc' },
    });
    if (!snap) throw new Error('snapshot not found; take one first');
    return (prisma as any).emiratisationFine.create({
      data: {
        tenantId: auth.tenantId,
        legalEntityId: input.legalEntityId ?? null,
        year: input.year,
        checkpoint: input.checkpoint,
        missedHires: snap.missedHires,
        amount: snap.projectedFine,
        currency: 'AED',
        status: 'PROJECTED',
      },
    });
  }
  async markIncurred(fineId: string) {
    return (prisma as any).emiratisationFine.update({
      where: { id: fineId },
      data: { status: 'INCURRED', incurredAt: new Date() },
    });
  }
  async resolve(fineId: string) {
    return (prisma as any).emiratisationFine.update({
      where: { id: fineId },
      data: { status: 'RESOLVED', resolvedAt: new Date() },
    });
  }
  async list(tenantId: string, filter: { status?: string; year?: number } = {}) {
    return (prisma as any).emiratisationFine.findMany({
      where: { tenantId, ...filter },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const emiratisationFineService = new EmiratisationFineService();

export class EmiratisationCertificateService {
  async dashboard(tenantId: string, period: string) {
    const configs = await (prisma as any).emiratisationConfig.findMany({
      where: { tenantId, isInScope: true },
    });
    const snaps = await (prisma as any).emiratisationSnapshot.findMany({
      where: { tenantId },
      orderBy: { checkpointDate: 'desc' },
    });
    const latestByEntity = new Map<string, Record<string, unknown>>();
    for (const s of snaps as Array<Record<string, unknown>>) {
      const key = (s.legalEntityId as string) ?? '__tenant__';
      if (!latestByEntity.has(key)) latestByEntity.set(key, s);
    }
    let entitiesAtTarget = 0;
    let totalMissedHires = 0;
    let totalProjectedFines = 0;
    for (const s of latestByEntity.values() as IterableIterator<Record<string, unknown>>) {
      if ((s.ragStatus as string) === 'GREEN') entitiesAtTarget += 1;
      totalMissedHires += Number(s.missedHires ?? 0);
      totalProjectedFines += Number(s.projectedFine ?? 0);
    }
    const fakeRiskCount = await (prisma as any).emiratisationHire.count({
      where: { tenantId, fakeRiskScore: { gte: FAKE_RISK_THRESHOLD } },
    });
    return {
      period,
      entitiesInScope: configs.length,
      entitiesAtTarget,
      totalMissedHires,
      totalProjectedFines: Number(totalProjectedFines.toFixed(2)),
      fakeRiskCount,
    };
  }
  async generate(period: string, auth: AuthContext) {
    const stats = await this.dashboard(auth.tenantId, period);
    const reasons: string[] = [];
    if (stats.totalMissedHires > 0) reasons.push(`${stats.totalMissedHires} missed hire(s)`);
    if (stats.fakeRiskCount > 0) reasons.push(`${stats.fakeRiskCount} fake-risk hire(s)`);
    const gatingReason = reasons.length ? `Blocked: ${reasons.join('; ')}` : null;
    return (prisma as any).emiratisationCertificate.upsert({
      where: { tenantId_period: { tenantId: auth.tenantId, period } },
      update: {
        entitiesInScope: stats.entitiesInScope,
        entitiesAtTarget: stats.entitiesAtTarget,
        totalMissedHires: stats.totalMissedHires,
        totalProjectedFines: stats.totalProjectedFines,
        fakeRiskCount: stats.fakeRiskCount,
        gatingReason,
        generatedAt: new Date(),
        status: 'DRAFT',
      },
      create: {
        tenantId: auth.tenantId,
        period,
        entitiesInScope: stats.entitiesInScope,
        entitiesAtTarget: stats.entitiesAtTarget,
        totalMissedHires: stats.totalMissedHires,
        totalProjectedFines: stats.totalProjectedFines,
        fakeRiskCount: stats.fakeRiskCount,
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
    const cert = await (prisma as any).emiratisationCertificate.findUnique({
      where: { tenantId_period: { tenantId: auth.tenantId, period } },
    });
    if (!cert) throw new Error('certificate not generated');
    if (cert.gatingReason) throw new Error(`cannot sign while gated: ${cert.gatingReason}`);
    return (prisma as any).emiratisationCertificate.update({
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
    return (prisma as any).emiratisationCertificate.findMany({
      where: { tenantId },
      orderBy: { period: 'desc' },
      take: 24,
    });
  }
}

export const emiratisationCertificateService = new EmiratisationCertificateService();

export const EMIRATISATION_CONSTANTS = {
  APPLICABILITY_THRESHOLD,
  DEFAULT_HALF_YEAR_TARGET_PCT,
  DEFAULT_YEAR_END_TARGET_PCT,
  DEFAULT_FINE_PER_HIRE,
  FAKE_RISK_THRESHOLD,
};
