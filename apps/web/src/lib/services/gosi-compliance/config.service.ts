import { prisma } from '@aura/database';
import type { AuthContext, GosiBranch, NationalityClass } from './types';
import { BRANCH_APPLICABILITY, RATE_SEEDS } from './seeds';

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
        where: { aura_gosi_branch_config_unique: { tenantId: auth.tenantId, branch } },
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
}

export const gosiConfigService = new GosiConfigService();
