import { prisma } from '@aura/database';
import type { AuthContext } from './types';
import { KPI_CATALOG_SEED, DEFAULT_DOMAIN_WEIGHTS, type KpiDefSeed } from './kpi-catalog-seed';

/**
 * EPIC-38-S01: KPI governance catalogue.
 *
 * Lifecycle: DRAFT → PENDING_REVIEW → ACTIVE.  Promoting a new version
 * supersedes the prior ACTIVE definition for that code.
 */
export class KpiCatalogService {
  async seedCatalog(auth: AuthContext) {
    const created: string[] = [];
    for (const seed of KPI_CATALOG_SEED) {
      const existing = await (prisma as any).kpiDefinition.findFirst({
        where: { tenantId: auth.tenantId, code: seed.code, status: 'ACTIVE' },
      });
      if (existing) continue;
      await this.upsertDraftDefinition(seed, auth).then((d) => this.approve(d.id, auth));
      // Seed default thresholds in same call
      if (seed.defaultThreshold) {
        await (prisma as any).kpiThreshold.upsert({
          where: {
            aura_kpi_threshold_unique: {
              tenantId: auth.tenantId,
              kpiCode: seed.code,
              countryCode: null,
            },
          },
          update: {
            greenMin: seed.defaultThreshold.greenMin ?? null,
            greenMax: seed.defaultThreshold.greenMax ?? null,
            amberMin: seed.defaultThreshold.amberMin ?? null,
            amberMax: seed.defaultThreshold.amberMax ?? null,
            redMin: seed.defaultThreshold.redMin ?? null,
            redMax: seed.defaultThreshold.redMax ?? null,
            statutoryRef: seed.defaultThreshold.statutoryRef,
            updatedBy: auth.userId,
          },
          create: {
            tenantId: auth.tenantId,
            kpiCode: seed.code,
            countryCode: null,
            greenMin: seed.defaultThreshold.greenMin ?? null,
            greenMax: seed.defaultThreshold.greenMax ?? null,
            amberMin: seed.defaultThreshold.amberMin ?? null,
            amberMax: seed.defaultThreshold.amberMax ?? null,
            redMin: seed.defaultThreshold.redMin ?? null,
            redMax: seed.defaultThreshold.redMax ?? null,
            statutoryRef: seed.defaultThreshold.statutoryRef,
            createdBy: auth.userId,
            updatedBy: auth.userId,
          },
        });
      }
      created.push(seed.code);
    }
    return { created };
  }

  async seedDomainWeights(auth: AuthContext) {
    const created: string[] = [];
    for (const [domain, weight] of Object.entries(DEFAULT_DOMAIN_WEIGHTS)) {
      const existing = await (prisma as any).kpiScorecardWeight.findUnique({
        where: { aura_kpi_scorecard_weight_unique: { tenantId: auth.tenantId, domain } },
      });
      if (existing) continue;
      await (prisma as any).kpiScorecardWeight.create({
        data: { tenantId: auth.tenantId, domain, weight },
      });
      created.push(domain);
    }
    return { created };
  }

  async upsertDraftDefinition(seed: KpiDefSeed, auth: AuthContext) {
    const last = await (prisma as any).kpiDefinition.findFirst({
      where: { tenantId: auth.tenantId, code: seed.code },
      orderBy: { version: 'desc' },
    });
    const version = (last?.version ?? 0) + 1;
    return (prisma as any).kpiDefinition.create({
      data: {
        tenantId: auth.tenantId,
        code: seed.code,
        name: seed.name,
        domain: seed.domain,
        description: seed.description,
        formula: seed.formula,
        dataSource: seed.dataSource,
        lineage: { defined: true },
        unit: seed.unit,
        frequency: seed.frequency,
        direction: seed.direction,
        ownerRole: seed.ownerRole,
        version,
        status: 'DRAFT',
        createdBy: auth.userId,
        updatedBy: auth.userId,
      },
    });
  }

  async approve(definitionId: string, auth: AuthContext) {
    const def = await (prisma as any).kpiDefinition.findUnique({ where: { id: definitionId } });
    if (!def) throw new Error('definition not found');
    if (def.status === 'ACTIVE') return def;
    if (def.status === 'RETIRED') throw new Error('cannot approve a RETIRED definition');
    return prisma.$transaction(async (tx) => {
      await (tx as any).kpiDefinition.updateMany({
        where: {
          tenantId: def.tenantId,
          code: def.code,
          status: 'ACTIVE',
          id: { not: def.id },
        },
        data: { status: 'RETIRED', supersededBy: def.id, updatedBy: auth.userId },
      });
      return (tx as any).kpiDefinition.update({
        where: { id: def.id },
        data: {
          status: 'ACTIVE',
          approvedAt: new Date(),
          approvedBy: auth.userId,
          reviewDueAt: new Date(Date.now() + 365 * 24 * 3600 * 1000),
          updatedBy: auth.userId,
        },
      });
    });
  }

  async list(tenantId: string, filter: { domain?: string; status?: string } = {}) {
    return (prisma as any).kpiDefinition.findMany({
      where: {
        tenantId,
        ...(filter.domain ? { domain: filter.domain } : {}),
        ...(filter.status ? { status: filter.status } : {}),
      },
      orderBy: [{ domain: 'asc' }, { code: 'asc' }, { version: 'desc' }],
    });
  }

  async getActive(tenantId: string, code: string) {
    return (prisma as any).kpiDefinition.findFirst({
      where: { tenantId, code, status: 'ACTIVE' },
      orderBy: { version: 'desc' },
    });
  }
}

export const kpiCatalogService = new KpiCatalogService();
