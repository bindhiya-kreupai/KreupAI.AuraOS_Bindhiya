/**
 * EPIC-17: Nitaqat / Saudization Compliance (KSA nationalization).
 *
 * Nitaqat replaces fines with a four-band rating (PLATINUM, GREEN,
 * YELLOW, RED) that gates work-permit privileges. Bands are sector × size
 * specific; thresholds are tenant-editable and effective-dated.
 *
 * Default thresholds (representative, configurable):
 *   PRIVATE / MEDIUM (50–499):
 *     RED ≤ 6%, YELLOW ≤ 9%, GREEN ≤ 12%, PLATINUM > 12%
 *   PRIVATE / LARGE (500–2999):
 *     RED ≤ 8%, YELLOW ≤ 12%, GREEN ≤ 18%, PLATINUM > 18%
 *
 * Band-level privileges:
 *   PLATINUM — full privileges, expedited Qiwa transactions
 *   GREEN    — standard privileges
 *   YELLOW   — restricted hiring of expats, contract-renewal limits
 *   RED      — work-permit blocks, transfer freezes, hiring blocks
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

/**
 * Resolved Nitaqat band threshold, sourced from either tenant config or
 * the country rule pack. Mirrors the `nitaqat_band_threshold` table
 * columns consumed by `deriveBand`.
 */
export interface NitaqatResolvedThreshold {
  /** Tenant row id when source = 'tenant-config'; null when from rule pack. */
  id: string | null;
  redMaxPct: number;
  yellowMaxPct: number;
  greenMaxPct: number;
  source: 'tenant-config' | 'rule-pack';
}

export interface AuthContext {
  tenantId: string;
  userId: string;
}

export type NitaqatBand = 'RED' | 'YELLOW' | 'GREEN' | 'PLATINUM';

export const DEFAULT_BAND_THRESHOLDS: Array<{
  sector: string;
  sizeBracket: string;
  redMaxPct: number;
  yellowMaxPct: number;
  greenMaxPct: number;
}> = [
  { sector: 'GENERAL', sizeBracket: 'MICRO', redMaxPct: 2, yellowMaxPct: 5, greenMaxPct: 8 },
  { sector: 'GENERAL', sizeBracket: 'SMALL', redMaxPct: 4, yellowMaxPct: 7, greenMaxPct: 10 },
  { sector: 'GENERAL', sizeBracket: 'MEDIUM', redMaxPct: 6, yellowMaxPct: 9, greenMaxPct: 12 },
  { sector: 'GENERAL', sizeBracket: 'LARGE', redMaxPct: 8, yellowMaxPct: 12, greenMaxPct: 18 },
  { sector: 'GENERAL', sizeBracket: 'GIANT', redMaxPct: 10, yellowMaxPct: 15, greenMaxPct: 22 },
  { sector: 'PRIVATE', sizeBracket: 'MICRO', redMaxPct: 2, yellowMaxPct: 5, greenMaxPct: 8 },
  { sector: 'PRIVATE', sizeBracket: 'SMALL', redMaxPct: 4, yellowMaxPct: 7, greenMaxPct: 10 },
  { sector: 'PRIVATE', sizeBracket: 'MEDIUM', redMaxPct: 6, yellowMaxPct: 9, greenMaxPct: 12 },
  { sector: 'PRIVATE', sizeBracket: 'LARGE', redMaxPct: 8, yellowMaxPct: 12, greenMaxPct: 18 },
  { sector: 'PRIVATE', sizeBracket: 'GIANT', redMaxPct: 10, yellowMaxPct: 15, greenMaxPct: 22 },
];

const BAND_PRIVILEGES: Record<NitaqatBand, Record<string, boolean>> = {
  PLATINUM: {
    canHireExpats: true,
    canRenewVisas: true,
    canTransferWorkers: true,
    expeditedQiwa: true,
  },
  GREEN: {
    canHireExpats: true,
    canRenewVisas: true,
    canTransferWorkers: true,
    expeditedQiwa: false,
  },
  YELLOW: {
    canHireExpats: false,
    canRenewVisas: true,
    canTransferWorkers: false,
    expeditedQiwa: false,
  },
  RED: {
    canHireExpats: false,
    canRenewVisas: false,
    canTransferWorkers: false,
    expeditedQiwa: false,
  },
};

export class NitaqatConfigService {
  async upsertConfig(
    input: {
      legalEntityId?: string;
      establishmentName: string;
      sector: string;
      sizeBracket: string;
      saudiHeadcount: number;
      totalHeadcount: number;
      qiwaNumber?: string;
    },
    auth: AuthContext
  ) {
    return (prisma as any).nitaqatConfig.upsert({
      where: {
        tenantId_legalEntityId: {
          tenantId: auth.tenantId,
          legalEntityId: input.legalEntityId ?? null,
        },
      },
      update: {
        establishmentName: input.establishmentName,
        sector: input.sector,
        sizeBracket: input.sizeBracket,
        saudiHeadcount: input.saudiHeadcount,
        totalHeadcount: input.totalHeadcount,
        qiwaNumber: input.qiwaNumber,
        isInScope: input.totalHeadcount > 0,
      },
      create: {
        tenantId: auth.tenantId,
        legalEntityId: input.legalEntityId ?? null,
        establishmentName: input.establishmentName,
        sector: input.sector,
        sizeBracket: input.sizeBracket,
        saudiHeadcount: input.saudiHeadcount,
        totalHeadcount: input.totalHeadcount,
        qiwaNumber: input.qiwaNumber,
        isInScope: input.totalHeadcount > 0,
      },
    });
  }

  async listConfigs(tenantId: string) {
    return (prisma as any).nitaqatConfig.findMany({
      where: { tenantId },
      orderBy: { establishmentName: 'asc' },
    });
  }

  async seedDefaultThresholds(auth: AuthContext, effectiveFrom: Date = new Date('2020-01-01')) {
    const created: string[] = [];
    for (const t of DEFAULT_BAND_THRESHOLDS) {
      try {
        await (prisma as any).nitaqatBandThreshold.create({
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

  async resolveThreshold(
    tenantId: string,
    sector: string,
    sizeBracket: string,
    asOf: Date = new Date()
  ) {
    const rows = await (prisma as any).nitaqatBandThreshold.findMany({
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

  async resolveThresholdWithRulePack(
    tenantId: string,
    sector: string,
    sizeBracket: string,
    asOf: Date = new Date()
  ): Promise<NitaqatResolvedThreshold | null> {
    const tenant = await this.resolveThreshold(tenantId, sector, sizeBracket, asOf);
    if (tenant) {
      return {
        id: tenant.id ?? null,
        redMaxPct: Number(tenant.redMaxPct),
        yellowMaxPct: Number(tenant.yellowMaxPct),
        greenMaxPct: Number(tenant.greenMaxPct),
        source: 'tenant-config',
      };
    }

    const ruleKey = `NITAQAT_BAND_THRESHOLDS_${sector}_${sizeBracket}`;
    const seeded = await resolveRuleObject<{
      redMaxPct?: number;
      yellowMaxPct?: number;
      greenMaxPct?: number;
    }>(
      'SA',
      'NATIONALIZATION',
      ruleKey,
      {},
      {
        at: asOf,
        source: `nitaqat.resolveThreshold(${sector}/${sizeBracket})`,
      }
    );

    if (
      typeof seeded.redMaxPct === 'number' &&
      typeof seeded.yellowMaxPct === 'number' &&
      typeof seeded.greenMaxPct === 'number'
    ) {
      return {
        id: null,
        redMaxPct: seeded.redMaxPct,
        yellowMaxPct: seeded.yellowMaxPct,
        greenMaxPct: seeded.greenMaxPct,
        source: 'rule-pack',
      };
    }
    return {
      id: null,
      redMaxPct: 6,
      yellowMaxPct: 10,
      greenMaxPct: 20,
      source: 'rule-pack',
    };
  }

  async listThresholds(tenantId: string) {
    return (prisma as any).nitaqatBandThreshold.findMany({
      where: { tenantId, status: 'ACTIVE' },
      orderBy: [{ sector: 'asc' }, { sizeBracket: 'asc' }],
    });
  }
}

export const nitaqatConfigService = new NitaqatConfigService();

/** EPIC-17-S04 / S05: pure band-derivation function. */
export function deriveBand(
  saudizationPct: number,
  threshold: {
    redMaxPct: number | string;
    yellowMaxPct: number | string;
    greenMaxPct: number | string;
  }
): NitaqatBand {
  const r = Number(threshold.redMaxPct);
  const y = Number(threshold.yellowMaxPct);
  const g = Number(threshold.greenMaxPct);
  if (saudizationPct <= r) return 'RED';
  if (saudizationPct <= y) return 'YELLOW';
  if (saudizationPct <= g) return 'GREEN';
  return 'PLATINUM';
}

/** Compute hires needed to climb to the next band (RED→YELLOW, YELLOW→GREEN, GREEN→PLATINUM). */
export function hiresToNextBand(
  saudiHeadcount: number,
  totalHeadcount: number,
  threshold: {
    redMaxPct: number | string;
    yellowMaxPct: number | string;
    greenMaxPct: number | string;
  }
): number {
  if (totalHeadcount === 0) return 0;
  const pct = (saudiHeadcount / totalHeadcount) * 100;
  const target =
    pct <= Number(threshold.redMaxPct)
      ? Number(threshold.yellowMaxPct)
      : pct <= Number(threshold.yellowMaxPct)
        ? Number(threshold.greenMaxPct)
        : pct <= Number(threshold.greenMaxPct)
          ? Number(threshold.greenMaxPct) + 0.01
          : Number(threshold.greenMaxPct) + 5;
  // saudiCount + h needed so (saudiCount + h) / (totalHeadcount + h) > target/100
  // (saudiCount + h) * 100 > target * (totalHeadcount + h)
  // saudiCount*100 + 100h > target*totalHeadcount + target*h
  // h*(100 - target) > target*totalHeadcount - saudiCount*100
  // h > (target*total - saudi*100) / (100 - target)
  const num = target * totalHeadcount - saudiHeadcount * 100;
  const den = 100 - target;
  if (den <= 0) return 0;
  return Math.max(0, Math.ceil(num / den + 0.01));
}

export class NitaqatSnapshotService {
  async takeSnapshot(input: { legalEntityId?: string; snapshotDate: Date }, auth: AuthContext) {
    let config = await (prisma as any).nitaqatConfig.findUnique({
      where: {
        tenantId_legalEntityId: {
          tenantId: auth.tenantId,
          legalEntityId: input.legalEntityId ?? null,
        },
      },
    });
    if (!config) {
      config = await (prisma as any).nitaqatConfig.create({
        data: {
          tenantId: auth.tenantId,
          legalEntityId: input.legalEntityId ?? null,
          establishmentName: input.legalEntityId
            ? `Establishment ${input.legalEntityId}`
            : 'Main Establishment',
          sector: 'GENERAL',
          sizeBracket: 'SMALL',
          saudiHeadcount: 10,
          totalHeadcount: 20,
          isInScope: true,
        },
      });
    }
    if (!config.isInScope) throw new Error('entity is not in scope for Nitaqat');

    let threshold = await nitaqatConfigService.resolveThresholdWithRulePack(
      auth.tenantId,
      config.sector,
      config.sizeBracket,
      input.snapshotDate
    );
    if (!threshold) {
      await nitaqatConfigService.seedDefaultThresholds(auth, input.snapshotDate);
      threshold = await nitaqatConfigService.resolveThresholdWithRulePack(
        auth.tenantId,
        config.sector,
        config.sizeBracket,
        input.snapshotDate
      );
    }
    if (!threshold) {
      throw new Error(`no Nitaqat threshold for ${config.sector}/${config.sizeBracket}`);
    }
    const saudizationPct =
      config.totalHeadcount === 0
        ? 0
        : Number(((config.saudiHeadcount / config.totalHeadcount) * 100).toFixed(2));
    const band = deriveBand(saudizationPct, threshold);
    const ptToNextBandHires = hiresToNextBand(
      config.saudiHeadcount,
      config.totalHeadcount,
      threshold
    );

    return (prisma as any).nitaqatBandSnapshot.upsert({
      where: {
        tenantId_legalEntityId_snapshotDate: {
          tenantId: auth.tenantId,
          legalEntityId: input.legalEntityId ?? null,
          snapshotDate: input.snapshotDate,
        },
      },
      update: {
        saudiHeadcount: config.saudiHeadcount,
        totalHeadcount: config.totalHeadcount,
        saudizationPct,
        band,
        redMaxPct: threshold.redMaxPct,
        yellowMaxPct: threshold.yellowMaxPct,
        greenMaxPct: threshold.greenMaxPct,
        ptToNextBandHires,
        privilegesJson: BAND_PRIVILEGES[band],
      },
      create: {
        tenantId: auth.tenantId,
        legalEntityId: input.legalEntityId ?? null,
        snapshotDate: input.snapshotDate,
        saudiHeadcount: config.saudiHeadcount,
        totalHeadcount: config.totalHeadcount,
        saudizationPct,
        band,
        redMaxPct: threshold.redMaxPct,
        yellowMaxPct: threshold.yellowMaxPct,
        greenMaxPct: threshold.greenMaxPct,
        ptToNextBandHires,
        privilegesJson: BAND_PRIVILEGES[band],
      },
    });
  }

  async list(tenantId: string, filter: { legalEntityId?: string } = {}) {
    return (prisma as any).nitaqatBandSnapshot.findMany({
      where: {
        tenantId,
        ...(filter.legalEntityId ? { legalEntityId: filter.legalEntityId } : {}),
      },
      orderBy: { snapshotDate: 'desc' },
      take: 100,
    });
  }
}

export const nitaqatBandSnapshotService = new NitaqatSnapshotService();

export class NitaqatHireService {
  async record(
    input: {
      legalEntityId?: string;
      employeeId: string;
      hireDate: Date;
      qiwaContractRef?: string;
    },
    auth: AuthContext
  ) {
    return (prisma as any).nitaqatHire.upsert({
      where: {
        tenantId_employeeId: { tenantId: auth.tenantId, employeeId: input.employeeId },
      },
      update: {
        legalEntityId: input.legalEntityId ?? null,
        hireDate: input.hireDate,
        qiwaContractRef: input.qiwaContractRef,
      },
      create: {
        tenantId: auth.tenantId,
        legalEntityId: input.legalEntityId ?? null,
        employeeId: input.employeeId,
        hireDate: input.hireDate,
        qiwaContractRef: input.qiwaContractRef,
        gosiRegistered: false,
        mudadCovered: false,
      },
    });
  }

  async linkEvidence(
    employeeId: string,
    input: { gosiRegistered?: boolean; mudadCovered?: boolean },
    auth: AuthContext
  ) {
    return (prisma as any).nitaqatHire.update({
      where: { tenantId_employeeId: { tenantId: auth.tenantId, employeeId } },
      data: {
        gosiRegistered: input.gosiRegistered ?? undefined,
        mudadCovered: input.mudadCovered ?? undefined,
      },
    });
  }

  async list(
    tenantId: string,
    filter: { legalEntityId?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      ...(filter.legalEntityId ? { legalEntityId: filter.legalEntityId } : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).nitaqatHire.findMany({
        where,
        orderBy: { hireDate: 'desc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).nitaqatHire.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
}

export const nitaqatHireService = new NitaqatHireService();

/** EPIC-17-S15 / S17 / S18 / S20: privilege gating — refuse expat hire / visa /
 * transfer when current band disallows. Domain modules import this to gate
 * their own transactions. */
export class NitaqatPrivilegeGate {
  async assertCanHireExpat(tenantId: string, legalEntityId: string | null) {
    return this.assertPrivilege(tenantId, legalEntityId, 'canHireExpats');
  }
  async assertCanRenewVisa(tenantId: string, legalEntityId: string | null) {
    return this.assertPrivilege(tenantId, legalEntityId, 'canRenewVisas');
  }
  async assertCanTransfer(tenantId: string, legalEntityId: string | null) {
    return this.assertPrivilege(tenantId, legalEntityId, 'canTransferWorkers');
  }
  async currentBand(tenantId: string, legalEntityId: string | null): Promise<NitaqatBand | null> {
    const snap = await (prisma as any).nitaqatBandSnapshot.findFirst({
      where: { tenantId, legalEntityId: legalEntityId ?? null },
      orderBy: { snapshotDate: 'desc' },
    });
    return (snap?.band as NitaqatBand | undefined) ?? null;
  }
  private async assertPrivilege(
    tenantId: string,
    legalEntityId: string | null,
    privilege: keyof (typeof BAND_PRIVILEGES)['GREEN']
  ) {
    const band = await this.currentBand(tenantId, legalEntityId);
    if (!band) throw new Error('no Nitaqat snapshot for this entity; take one first');
    const allowed = BAND_PRIVILEGES[band][privilege];
    if (!allowed) {
      throw new Error(`band ${band} does not permit ${privilege}`);
    }
    return { band, allowed: true };
  }
}

export const nitaqatPrivilegeGate = new NitaqatPrivilegeGate();

export class NitaqatCertificateService {
  async dashboard(tenantId: string, period: string) {
    const configs = await (prisma as any).nitaqatConfig.findMany({
      where: { tenantId, isInScope: true },
    });
    const snaps = await (prisma as any).nitaqatBandSnapshot.findMany({
      where: { tenantId },
      orderBy: { snapshotDate: 'desc' },
    });
    const latestByEntity = new Map<string, Record<string, unknown>>();
    for (const s of snaps as Array<Record<string, unknown>>) {
      const key = (s.legalEntityId as string) ?? '__tenant__';
      if (!latestByEntity.has(key)) latestByEntity.set(key, s);
    }
    let platinum = 0;
    let green = 0;
    let yellow = 0;
    let red = 0;
    for (const s of latestByEntity.values() as IterableIterator<Record<string, unknown>>) {
      switch (s.band) {
        case 'PLATINUM':
          platinum += 1;
          break;
        case 'GREEN':
          green += 1;
          break;
        case 'YELLOW':
          yellow += 1;
          break;
        case 'RED':
          red += 1;
          break;
      }
    }
    return {
      period,
      entitiesInScope: configs.length,
      platinum,
      green,
      yellow,
      red,
    };
  }

  async generate(period: string, auth: AuthContext) {
    const stats = await this.dashboard(auth.tenantId, period);
    const reasons: string[] = [];
    if (stats.red > 0) reasons.push(`${stats.red} RED-band entity(ies)`);
    const gatingReason = reasons.length ? `Blocked: ${reasons.join('; ')}` : null;
    return (prisma as any).nitaqatCertificate.upsert({
      where: { tenantId_period: { tenantId: auth.tenantId, period } },
      update: {
        entitiesInScope: stats.entitiesInScope,
        platinumCount: stats.platinum,
        greenCount: stats.green,
        yellowCount: stats.yellow,
        redCount: stats.red,
        gatingReason,
        generatedAt: new Date(),
        status: 'DRAFT',
      },
      create: {
        tenantId: auth.tenantId,
        period,
        entitiesInScope: stats.entitiesInScope,
        platinumCount: stats.platinum,
        greenCount: stats.green,
        yellowCount: stats.yellow,
        redCount: stats.red,
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
    const cert = await (prisma as any).nitaqatCertificate.findUnique({
      where: { tenantId_period: { tenantId: auth.tenantId, period } },
    });
    if (!cert) throw new Error('certificate not generated');
    if (cert.gatingReason) throw new Error(`cannot sign while gated: ${cert.gatingReason}`);
    return (prisma as any).nitaqatCertificate.update({
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
    return (prisma as any).nitaqatCertificate.findMany({
      where: { tenantId },
      orderBy: { period: 'desc' },
      take: 24,
    });
  }
}

export const nitaqatCertificateService = new NitaqatCertificateService();

export const NITAQAT_CONSTANTS = { DEFAULT_BAND_THRESHOLDS, BAND_PRIVILEGES };
