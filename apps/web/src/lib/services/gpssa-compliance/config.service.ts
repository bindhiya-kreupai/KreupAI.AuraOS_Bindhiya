import { prisma } from '@aura/database';
import type { AuthContext, NationalityClass } from './types';
import { GPSSA_RATE_SEEDS } from './seeds';
import { resolveRuleObject } from '../gcc-rule-library/rule-value.helper';

const GPSSA_NUMBER_PATTERN = /^\d{6,12}$/;

/**
 * Shape of a GPSSA rate sourced from either tenant-level config or the
 * country rule pack. Mirrors the `gpssa_contribution_rate` table
 * columns consumed by the calculation service (employer / employee /
 * government three-way split).
 */
export interface GpssaResolvedRate {
  /** Tenant rate row id when source = 'tenant-config'; null when from rule pack. */
  id: string | null;
  employerPct: number;
  employeePct: number;
  governmentPct: number;
  wageFloor: number | null;
  wageCeiling: number | null;
  /** Where the rate came from — useful for audit / debugging. */
  source: 'tenant-config' | 'rule-pack';
}

/**
 * EPIC-14-S01..S03: GPSSA establishment + rate configuration.
 */
export class GpssaConfigService {
  validateGpssaNumber(n: string) {
    return GPSSA_NUMBER_PATTERN.test(n);
  }

  async createEstablishment(
    input: {
      gpssaNumber: string;
      establishmentName: string;
      mohreNumber?: string;
      legalEntityId?: string;
    },
    auth: AuthContext
  ) {
    if (!this.validateGpssaNumber(input.gpssaNumber)) {
      throw new Error('gpssaNumber must be 6–12 digits');
    }
    return (prisma as any).gpssaEstablishment.create({
      data: {
        tenantId: auth.tenantId,
        gpssaNumber: input.gpssaNumber,
        mohreNumber: input.mohreNumber,
        establishmentName: input.establishmentName,
        legalEntityId: input.legalEntityId,
        isInScope: true,
      },
    });
  }

  async listEstablishments(tenantId: string) {
    return (prisma as any).gpssaEstablishment.findMany({
      where: { tenantId },
      orderBy: { establishmentName: 'asc' },
    });
  }

  async seedRates(auth: AuthContext, effectiveFrom: Date = new Date()) {
    const created: string[] = [];
    for (const r of GPSSA_RATE_SEEDS) {
      await (prisma as any).gpssaContributionRate.create({
        data: {
          tenantId: auth.tenantId,
          nationalityClass: r.nationalityClass,
          employerPct: r.employerPct,
          employeePct: r.employeePct,
          governmentPct: r.governmentPct,
          wageFloor: r.wageFloor,
          wageCeiling: r.wageCeiling,
          effectiveFrom,
          status: 'ACTIVE',
          citation: r.citation,
          createdBy: auth.userId,
        },
      });
      created.push(r.nationalityClass);
    }
    return { created };
  }

  async listRates(tenantId: string) {
    return (prisma as any).gpssaContributionRate.findMany({
      where: { tenantId, status: 'ACTIVE' },
      orderBy: [{ nationalityClass: 'asc' }, { effectiveFrom: 'desc' }],
    });
  }

  async resolveRate(tenantId: string, cls: NationalityClass, asOf: Date = new Date()) {
    const rows = await (prisma as any).gpssaContributionRate.findMany({
      where: {
        tenantId,
        nationalityClass: cls,
        status: 'ACTIVE',
        effectiveFrom: { lte: asOf },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: asOf } }],
      },
      orderBy: { effectiveFrom: 'desc' },
      take: 1,
    });
    return rows[0] ?? null;
  }

  /**
   * Rule-engine-aware rate resolution.
   *
   * Resolution order:
   *   1. tenant-level config (existing `resolveRate`).
   *   2. country rule pack — looks up
   *      SOCIAL_INSURANCE / GPSSA_RATES_<CLASS> (e.g.
   *      GPSSA_RATES_NATIONAL) which is expected to carry
   *      `{ employerPct, employeePct, governmentPct, wageFloor?, wageCeiling? }`.
   *   3. null — caller throws today (preserves existing behaviour).
   *
   * Architecture in place; the rule-pack hop is a no-op until the seeds
   * are expanded to carry the full rate shape (audit 2026-06-17
   * Pattern 1, GPSSA section).
   *
   * @param countryCode defaults to 'AE' (GPSSA is the UAE authority).
   */
  async resolveRateWithRulePack(
    tenantId: string,
    cls: NationalityClass,
    countryCode: string = 'AE',
    asOf: Date = new Date()
  ): Promise<GpssaResolvedRate | null> {
    const tenant = await this.resolveRate(tenantId, cls, asOf);
    if (tenant) {
      return {
        id: tenant.id ?? null,
        employerPct: Number(tenant.employerPct),
        employeePct: Number(tenant.employeePct),
        governmentPct: Number(tenant.governmentPct ?? 0),
        wageFloor: tenant.wageFloor != null ? Number(tenant.wageFloor) : null,
        wageCeiling: tenant.wageCeiling != null ? Number(tenant.wageCeiling) : null,
        source: 'tenant-config',
      };
    }

    const ruleKey = `GPSSA_RATES_${cls}`;
    const seeded = await resolveRuleObject<{
      employerPct?: number;
      employeePct?: number;
      governmentPct?: number;
      wageFloor?: number | null;
      wageCeiling?: number | null;
    }>(
      countryCode,
      'SOCIAL_INSURANCE',
      ruleKey,
      {},
      {
        at: asOf,
        source: `gpssa.resolveRate(${cls})`,
      }
    );

    if (typeof seeded.employerPct === 'number' && typeof seeded.employeePct === 'number') {
      return {
        id: null,
        employerPct: seeded.employerPct,
        employeePct: seeded.employeePct,
        governmentPct: seeded.governmentPct ?? 0,
        wageFloor: seeded.wageFloor ?? null,
        wageCeiling: seeded.wageCeiling ?? null,
        source: 'rule-pack',
      };
    }
    return null;
  }
}

export const gpssaConfigService = new GpssaConfigService();
