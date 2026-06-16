import { prisma } from '@aura/database';
import type { AuthContext } from './types';
import {
  TEMPLATE_SEEDS,
  RED_FLAG_RULE_SEEDS,
  type TemplateSeed,
  type ItemSeed,
} from './template-seeds';

/**
 * EPIC-37-S01: Checklist governance & template engine.
 *
 * Lifecycle:
 *   DRAFT -> approve() -> ACTIVE (prior ACTIVE for same code is RETIRED).
 * Templates are versioned; runs reference a frozen templateId so historical
 * runs remain queryable even when the template evolves.
 */
export class ChecklistTemplateService {
  async seedRedFlagRules(auth: AuthContext) {
    const created: string[] = [];
    for (const r of RED_FLAG_RULE_SEEDS) {
      const existing = await (prisma as any).redFlagRule.findUnique({
        where: { aura_red_flag_rule_unique: { tenantId: auth.tenantId, code: r.code } },
      });
      if (existing) continue;
      await (prisma as any).redFlagRule.create({
        data: {
          tenantId: auth.tenantId,
          code: r.code,
          name: r.name,
          domain: r.domain,
          expression: r.expression,
          thresholdJson: r.thresholdJson ?? {},
          countryCode: r.countryCode,
          severity: r.severity,
          isActive: true,
          createdBy: auth.userId,
          updatedBy: auth.userId,
        },
      });
      created.push(r.code);
    }
    return { created };
  }

  async seedTemplates(auth: AuthContext) {
    const created: string[] = [];
    for (const t of TEMPLATE_SEEDS) {
      const existing = await (prisma as any).checklistTemplate.findFirst({
        where: { tenantId: auth.tenantId, code: t.code, status: 'ACTIVE' },
      });
      if (existing) continue;
      const draft = await this.upsertDraft(t, auth);
      await this.approve(draft.id, auth);
      created.push(t.code);
    }
    return { created };
  }

  async upsertDraft(t: TemplateSeed, auth: AuthContext) {
    const last = await (prisma as any).checklistTemplate.findFirst({
      where: { tenantId: auth.tenantId, code: t.code },
      orderBy: { version: 'desc' },
    });
    const version = (last?.version ?? 0) + 1;
    return prisma.$transaction(async (tx) => {
      const template = await (tx as any).checklistTemplate.create({
        data: {
          tenantId: auth.tenantId,
          code: t.code,
          name: t.name,
          domain: t.domain,
          appendixRef: t.appendixRef,
          description: t.description,
          ownerRole: t.ownerRole,
          approverRole: t.approverRole,
          scope: {},
          version,
          status: 'DRAFT',
          reviewCadence: t.reviewCadence,
          createdBy: auth.userId,
          updatedBy: auth.userId,
        },
      });
      let ordering = 0;
      for (const item of t.items) {
        ordering += 10;
        await this.upsertItem(tx, template.id, ordering, item);
      }
      return template;
    });
  }

  private async upsertItem(tx: any, templateId: string, ordering: number, item: ItemSeed) {
    return (tx as any).checklistTemplateItem.upsert({
      where: {
        aura_checklist_item_unique: { templateId, code: item.code },
      },
      update: {
        ordering,
        controlObjective: item.controlObjective,
        description: item.description,
        evidenceRequired: item.evidenceRequired ?? true,
        isMandatory: item.isMandatory ?? true,
        weighting: item.weighting ?? 1,
        redFlagRuleCode: item.redFlagRuleCode,
      },
      create: {
        templateId,
        ordering,
        code: item.code,
        controlObjective: item.controlObjective,
        description: item.description,
        evidenceRequired: item.evidenceRequired ?? true,
        isMandatory: item.isMandatory ?? true,
        weighting: item.weighting ?? 1,
        redFlagRuleCode: item.redFlagRuleCode,
      },
    });
  }

  async approve(templateId: string, auth: AuthContext) {
    const t = await (prisma as any).checklistTemplate.findUnique({
      where: { id: templateId },
    });
    if (!t) throw new Error('template not found');
    if (t.status === 'ACTIVE') return t;
    if (t.status === 'RETIRED') throw new Error('cannot approve a RETIRED template');
    return prisma.$transaction(async (tx) => {
      await (tx as any).checklistTemplate.updateMany({
        where: {
          tenantId: t.tenantId,
          code: t.code,
          status: 'ACTIVE',
          id: { not: t.id },
        },
        data: { status: 'RETIRED', supersededBy: t.id, updatedBy: auth.userId },
      });
      return (tx as any).checklistTemplate.update({
        where: { id: t.id },
        data: {
          status: 'ACTIVE',
          approvedAt: new Date(),
          approvedBy: auth.userId,
          updatedBy: auth.userId,
        },
      });
    });
  }

  async list(tenantId: string, filter: { domain?: string; status?: string } = {}) {
    return (prisma as any).checklistTemplate.findMany({
      where: {
        tenantId,
        ...(filter.domain ? { domain: filter.domain } : {}),
        ...(filter.status ? { status: filter.status } : {}),
      },
      include: { items: { orderBy: { ordering: 'asc' } } },
      orderBy: [{ domain: 'asc' }, { code: 'asc' }, { version: 'desc' }],
    });
  }

  async getActiveByCode(tenantId: string, code: string) {
    return (prisma as any).checklistTemplate.findFirst({
      where: { tenantId, code, status: 'ACTIVE' },
      include: { items: { orderBy: { ordering: 'asc' } } },
      orderBy: { version: 'desc' },
    });
  }

  async listRedFlagRules(tenantId: string, filter: { domain?: string } = {}) {
    return (prisma as any).redFlagRule.findMany({
      where: { tenantId, ...(filter.domain ? { domain: filter.domain } : {}) },
      orderBy: { code: 'asc' },
    });
  }
}

export const checklistTemplateService = new ChecklistTemplateService();
