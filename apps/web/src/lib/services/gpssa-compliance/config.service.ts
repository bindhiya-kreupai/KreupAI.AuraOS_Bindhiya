import { prisma } from '@aura/database';
import type { AuthContext, NationalityClass } from './types';
import { GPSSA_RATE_SEEDS } from './seeds';

const GPSSA_NUMBER_PATTERN = /^\d{6,12}$/;

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
}

export const gpssaConfigService = new GpssaConfigService();
