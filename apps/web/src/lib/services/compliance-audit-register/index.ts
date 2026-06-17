/**
 * Theme C — Compliance audit checklist + risk register.
 *
 * Closes EPIC-25-S12 (ER), EPIC-26-S11 (Disciplinary), EPIC-27-S17
 * (Separation), EPIC-28-S14 (EOSB), EPIC-29-S15 (Visa-Exit). One
 * generic two-table register shared across all five domains via a
 * `domainCode` discriminator + per-domain seeds.
 */

import { prisma } from '@aura/database';
import { DEFAULT_SEEDS, SUPPORTED_DOMAINS, type ChecklistSeed, type RiskSeed } from './seeds';
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

export type ChecklistStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLIANT' | 'NON_COMPLIANT' | 'WAIVED';

export type RiskBand = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RiskStatus = 'OPEN' | 'MITIGATED' | 'ACCEPTED' | 'TRANSFERRED' | 'CLOSED';

export { DEFAULT_SEEDS, SUPPORTED_DOMAINS };
export type { ChecklistSeed, RiskSeed };

/** Pure helper: derive risk band from likelihood × impact (1–5 each). */
export function riskBandFromScore(score: number): RiskBand {
  if (score >= 16) return 'CRITICAL';
  if (score >= 9) return 'HIGH';
  if (score >= 4) return 'MEDIUM';
  return 'LOW';
}

function clamp1to5(n: number, field: string): void {
  if (!Number.isInteger(n) || n < 1 || n > 5) {
    throw new Error(`${field} must be an integer between 1 and 5`);
  }
}

export class ComplianceChecklistService {
  async seed(domainCode: string, auth: AuthContext) {
    const seed = DEFAULT_SEEDS[domainCode];
    if (!seed) throw new Error(`no seeds for domain ${domainCode}`);
    const created: string[] = [];
    const skipped: string[] = [];
    for (const item of seed.checklist) {
      try {
        await (prisma as any).complianceAuditChecklistItem.create({
          data: {
            tenantId: auth.tenantId,
            domainCode,
            categoryCode: item.categoryCode,
            itemCode: item.itemCode,
            label: item.label,
            expectedBehavior: item.expectedBehavior,
            evidenceRequirement: item.evidenceRequirement,
            ownerRole: item.ownerRole,
            isMandatory: item.isMandatory,
          },
        });
        created.push(item.itemCode);
      } catch {
        skipped.push(item.itemCode);
      }
    }
    return { created, skipped };
  }

  async list(
    tenantId: string,
    filter: {
      domainCode?: string;
      categoryCode?: string;
      status?: ChecklistStatus;
      isMandatory?: boolean;
    } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      ...(filter.domainCode ? { domainCode: filter.domainCode } : {}),
      ...(filter.categoryCode ? { categoryCode: filter.categoryCode } : {}),
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.isMandatory !== undefined ? { isMandatory: filter.isMandatory } : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).complianceAuditChecklistItem.findMany({
        where,
        orderBy: [{ domainCode: 'asc' }, { categoryCode: 'asc' }, { itemCode: 'asc' }],
        ...prismaPageArgs(page),
      }),
      (prisma as any).complianceAuditChecklistItem.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }

  async update(
    itemCode: string,
    domainCode: string,
    input: {
      status?: ChecklistStatus;
      owner?: string;
      dueDate?: Date;
      evidenceUrl?: string;
      notes?: string;
    },
    auth: AuthContext
  ) {
    return (prisma as any).complianceAuditChecklistItem.update({
      where: {
        aura_compliance_audit_checklist_item_unique: {
          tenantId: auth.tenantId,
          domainCode,
          itemCode,
        },
      },
      data: {
        ...(input.status ? { status: input.status } : {}),
        ...(input.owner ? { owner: input.owner } : {}),
        ...(input.dueDate ? { dueDate: input.dueDate } : {}),
        ...(input.evidenceUrl !== undefined ? { evidenceUrl: input.evidenceUrl } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        ...(input.status === 'COMPLIANT'
          ? { completedAt: new Date(), completedBy: auth.userId }
          : {}),
      },
    });
  }

  async openMandatoryCount(tenantId: string, domainCode?: string): Promise<number> {
    return (prisma as any).complianceAuditChecklistItem.count({
      where: {
        tenantId,
        isMandatory: true,
        status: { in: ['OPEN', 'IN_PROGRESS', 'NON_COMPLIANT'] },
        ...(domainCode ? { domainCode } : {}),
      },
    });
  }
}

export const complianceChecklistService = new ComplianceChecklistService();

export class ComplianceRiskService {
  async seed(domainCode: string, auth: AuthContext) {
    const seed = DEFAULT_SEEDS[domainCode];
    if (!seed) throw new Error(`no seeds for domain ${domainCode}`);
    const created: string[] = [];
    const skipped: string[] = [];
    for (const r of seed.risks) {
      const score = r.likelihood * r.impact;
      const band = riskBandFromScore(score);
      try {
        await (prisma as any).complianceRiskRegisterEntry.create({
          data: {
            tenantId: auth.tenantId,
            domainCode,
            riskCode: r.riskCode,
            title: r.title,
            description: r.description,
            category: r.category,
            likelihood: r.likelihood,
            impact: r.impact,
            score,
            band,
            ownerRole: r.ownerRole,
            controlRef: r.controlRef,
          },
        });
        created.push(r.riskCode);
      } catch {
        skipped.push(r.riskCode);
      }
    }
    return { created, skipped };
  }

  async upsert(
    input: {
      domainCode: string;
      riskCode: string;
      title: string;
      description?: string;
      category?: string;
      likelihood: number;
      impact: number;
      ownerRole?: string;
      controlRef?: string;
      mitigationPlan?: string;
      status?: RiskStatus;
    },
    auth: AuthContext
  ) {
    clamp1to5(input.likelihood, 'likelihood');
    clamp1to5(input.impact, 'impact');
    const score = input.likelihood * input.impact;
    const band = riskBandFromScore(score);
    return (prisma as any).complianceRiskRegisterEntry.upsert({
      where: {
        aura_compliance_risk_register_entry_unique: {
          tenantId: auth.tenantId,
          domainCode: input.domainCode,
          riskCode: input.riskCode,
        },
      },
      update: {
        title: input.title,
        description: input.description ?? null,
        category: input.category ?? null,
        likelihood: input.likelihood,
        impact: input.impact,
        score,
        band,
        ownerRole: input.ownerRole ?? null,
        controlRef: input.controlRef ?? null,
        mitigationPlan: input.mitigationPlan ?? null,
        ...(input.status ? { status: input.status } : {}),
      },
      create: {
        tenantId: auth.tenantId,
        domainCode: input.domainCode,
        riskCode: input.riskCode,
        title: input.title,
        description: input.description ?? null,
        category: input.category ?? null,
        likelihood: input.likelihood,
        impact: input.impact,
        score,
        band,
        ownerRole: input.ownerRole ?? null,
        controlRef: input.controlRef ?? null,
        mitigationPlan: input.mitigationPlan ?? null,
        status: (input.status ?? 'OPEN') as RiskStatus,
      },
    });
  }

  async list(
    tenantId: string,
    filter: {
      domainCode?: string;
      band?: RiskBand;
      status?: RiskStatus;
    } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      ...(filter.domainCode ? { domainCode: filter.domainCode } : {}),
      ...(filter.band ? { band: filter.band } : {}),
      ...(filter.status ? { status: filter.status } : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).complianceRiskRegisterEntry.findMany({
        where,
        orderBy: [{ band: 'desc' }, { score: 'desc' }],
        ...prismaPageArgs(page),
      }),
      (prisma as any).complianceRiskRegisterEntry.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }

  async review(
    riskCode: string,
    domainCode: string,
    input: { mitigationPlan?: string; status?: RiskStatus },
    auth: AuthContext
  ) {
    return (prisma as any).complianceRiskRegisterEntry.update({
      where: {
        aura_compliance_risk_register_entry_unique: {
          tenantId: auth.tenantId,
          domainCode,
          riskCode,
        },
      },
      data: {
        ...(input.mitigationPlan !== undefined ? { mitigationPlan: input.mitigationPlan } : {}),
        ...(input.status ? { status: input.status } : {}),
        reviewedAt: new Date(),
        reviewedBy: auth.userId,
      },
    });
  }

  async openHighOrCriticalCount(tenantId: string, domainCode?: string): Promise<number> {
    return (prisma as any).complianceRiskRegisterEntry.count({
      where: {
        tenantId,
        band: { in: ['HIGH', 'CRITICAL'] },
        status: 'OPEN',
        ...(domainCode ? { domainCode } : {}),
      },
    });
  }
}

export const complianceRiskService = new ComplianceRiskService();

export async function dashboardSummary(tenantId: string) {
  return Promise.all(
    SUPPORTED_DOMAINS.map(async (domainCode) => {
      const [openMandatory, openCritical] = await Promise.all([
        complianceChecklistService.openMandatoryCount(tenantId, domainCode),
        complianceRiskService.openHighOrCriticalCount(tenantId, domainCode),
      ]);
      return { domainCode, openMandatory, openHighOrCritical: openCritical };
    })
  );
}
