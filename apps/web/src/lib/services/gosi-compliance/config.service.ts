import { prisma } from '@aura/database';
import type { AuthContext, GosiBranch, NationalityClass } from './types';
import { BRANCH_APPLICABILITY, RATE_SEEDS } from './seeds';
import { resolveRuleObject } from '../gcc-rule-library/rule-value.helper';

/**
 * Shape of a GOSI rate sourced from either tenant-level config or the
 * country rule pack. Mirrors the `gosi_contribution_rate` table columns
 * consumed by the calculation service.
 */
export interface GosiResolvedRate {
  /** Tenant rate row id when source = 'tenant-config'; null when from rule pack. */
  id: string | null;
  employerPct: number;
  employeePct: number;
  wageFloor: number | null;
  wageCeiling: number | null;
  /** Where the rate came from — useful for audit / debugging. */
  source: 'tenant-config' | 'rule-pack';
}

const GOSI_NUMBER_PATTERN = /^\d{6,12}$/;

/**
 * EPIC-13-S01..S04: establishment, branch and rate configuration.
 */
export class GosiConfigService {
  validateGosiNumber(gosiNumber: string) {
    return GOSI_NUMBER_PATTERN.test(gosiNumber);
  }

  async createEstablishment(
    input: { gosiNumber: string; establishmentName: string; legalEntityId?: string },
    auth: AuthContext
  ) {
    if (!this.validateGosiNumber(input.gosiNumber)) {
      throw new Error('gosiNumber must be 6–12 digits');
    }
    return (prisma as any).gosiEstablishment.create({
      data: {
        tenantId: auth.tenantId,
        gosiNumber: input.gosiNumber,
        establishmentName: input.establishmentName,
        legalEntityId: input.legalEntityId,
        isInScope: true,
      },
    });
  }

  async listEstablishments(tenantId: string) {
    return (prisma as any).gosiEstablishment.findMany({
      where: { tenantId },
      orderBy: { establishmentName: 'asc' },
    });
  }

  async seedBranches(auth: AuthContext) {
    const created: string[] = [];
    for (const [branch, applies] of Object.entries(BRANCH_APPLICABILITY)) {
      const existing = await (prisma as any).gosiBranchConfig.findUnique({
        where: { tenantId_branch: { tenantId: auth.tenantId, branch } },
      });
      if (existing) continue;
      await (prisma as any).gosiBranchConfig.create({
        data: { tenantId: auth.tenantId, branch, appliesTo: applies, isActive: true },
      });
      created.push(branch);
    }
    return { created };
  }

  async listBranches(tenantId: string) {
    return (prisma as any).gosiBranchConfig.findMany({
      where: { tenantId, isActive: true },
      orderBy: { branch: 'asc' },
    });
  }

  async seedRates(auth: AuthContext, effectiveFrom: Date = new Date()) {
    const created: string[] = [];
    for (const r of RATE_SEEDS) {
      await (prisma as any).gosiContributionRate.create({
        data: {
          tenantId: auth.tenantId,
          branch: r.branch,
          nationalityClass: r.nationalityClass,
          employerPct: r.employerPct,
          employeePct: r.employeePct,
          wageFloor: r.wageFloor,
          wageCeiling: r.wageCeiling,
          effectiveFrom,
          status: 'ACTIVE',
          citation: r.citation,
          createdBy: auth.userId,
        },
      });
      created.push(`${r.branch}/${r.nationalityClass}`);
    }
    return { created };
  }

  async listRates(tenantId: string) {
    return (prisma as any).gosiContributionRate.findMany({
      where: { tenantId, status: 'ACTIVE' },
      orderBy: [{ branch: 'asc' }, { nationalityClass: 'asc' }, { effectiveFrom: 'desc' }],
    });
  }

  async resolveRate(
    tenantId: string,
    branch: GosiBranch,
    nationalityClass: NationalityClass,
    asOf: Date = new Date()
  ) {
    const rows = await (prisma as any).gosiContributionRate.findMany({
      where: {
        tenantId,
        branch,
        nationalityClass,
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
   *   1. tenant-level config (existing `resolveRate`) — wins; lets a
   *      tenant negotiate / override GOSI rates.
   *   2. country rule pack — regulatory baseline. Looks up
   *      SOCIAL_INSURANCE / GOSI_RATES_<BRANCH>_<CLASS> (e.g.
   *      GOSI_RATES_ANNUITIES_NATIONAL) which is expected to carry
   *      `{ employerPct, employeePct, wageFloor?, wageCeiling? }`.
   *   3. null — caller decides whether to throw / treat-as-zero.
   *
   * Behaviour: the rule-pack hop is a NO-OP until the seeds are
   * expanded to carry the full rate shape. Today only an
   * `GOSI_EMPLOYER_PCT_NATIONAL` scalar is seeded (see audit
   * 2026-06-17 Pattern 1, GOSI section). Architecture is in place so
   * the seed-expansion PR is the only remaining change.
   *
   * @param countryCode defaults to 'SA' (GOSI is a Saudi authority)
   */
  async resolveRateWithRulePack(
    tenantId: string,
    branch: GosiBranch,
    nationalityClass: NationalityClass,
    countryCode: string = 'SA',
    asOf: Date = new Date()
  ): Promise<GosiResolvedRate | null> {
    const tenant = await this.resolveRate(tenantId, branch, nationalityClass, asOf);
    if (tenant) {
      return {
        id: tenant.id ?? null,
        employerPct: Number(tenant.employerPct),
        employeePct: Number(tenant.employeePct),
        wageFloor: tenant.wageFloor != null ? Number(tenant.wageFloor) : null,
        wageCeiling: tenant.wageCeiling != null ? Number(tenant.wageCeiling) : null,
        source: 'tenant-config',
      };
    }

    const ruleKey = `GOSI_RATES_${branch}_${nationalityClass}`;
    const seeded = await resolveRuleObject<{
      employerPct?: number;
      employeePct?: number;
      wageFloor?: number | null;
      wageCeiling?: number | null;
    }>(
      countryCode,
      'SOCIAL_INSURANCE',
      ruleKey,
      {},
      {
        at: asOf,
        source: `gosi.resolveRate(${branch}/${nationalityClass})`,
      }
    );

    if (typeof seeded.employerPct === 'number' && typeof seeded.employeePct === 'number') {
      return {
        id: null,
        employerPct: seeded.employerPct,
        employeePct: seeded.employeePct,
        wageFloor: seeded.wageFloor ?? null,
        wageCeiling: seeded.wageCeiling ?? null,
        source: 'rule-pack',
      };
    }
    return null;
  }
}

export const gosiConfigService = new GosiConfigService();
