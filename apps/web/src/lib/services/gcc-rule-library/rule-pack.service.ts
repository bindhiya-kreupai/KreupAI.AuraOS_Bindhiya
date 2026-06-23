import { prisma } from '@aura/database';
import type { AuthContext } from './types';
import {
  GCC_WIDE_THEMES,
  RULE_PACK_SEEDS,
  type SeedRule,
  type SeedRulePack,
} from './rule-pack-seeds';

/**
 * EPIC-36-S01..S04: Rule-pack authoring, versioning, publication.
 *
 * Lifecycle:
 *   DRAFT -> publish() -> ACTIVE  (effectiveFrom set, registeredAt set,
 *                                  any prior ACTIVE for the same country
 *                                  is retired with effectiveTo = now).
 * A pack is "live" when status = ACTIVE and current date is within
 * [effectiveFrom, effectiveTo|now).
 */
export class CountryRulePackService {
  async seedThemes() {
    const created: string[] = [];
    for (const theme of GCC_WIDE_THEMES) {
      const existing = await (prisma as any).complianceTheme.findUnique({
        where: { code: theme.code },
      });
      if (existing) continue;
      await (prisma as any).complianceTheme.create({
        data: {
          code: theme.code,
          name: theme.name,
          description: theme.description,
          domains: theme.domains,
          isActive: true,
        },
      });
      created.push(theme.code);
    }
    return { created };
  }

  async listThemes() {
    return (prisma as any).complianceTheme.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async seedAuthoredRulePacks(auth: AuthContext) {
    const seeded: string[] = [];
    for (const seed of RULE_PACK_SEEDS) {
      const existing = await (prisma as any).countryRulePack.findFirst({
        where: { countryCode: seed.countryCode, status: 'ACTIVE' },
      });
      if (existing) continue;
      await this.createDraft(seed, auth).then((p) => this.publish(p.id, new Date(), auth));
      seeded.push(seed.countryCode);
    }
    return { seeded };
  }

  async createDraft(input: SeedRulePack, auth: AuthContext) {
    const last = await (prisma as any).countryRulePack.findFirst({
      where: { countryCode: input.countryCode },
      orderBy: { version: 'desc' },
    });
    const nextVersion = (last?.version ?? 0) + 1;
    return prisma.$transaction(async (tx) => {
      const pack = await (tx as any).countryRulePack.create({
        data: {
          countryCode: input.countryCode,
          version: nextVersion,
          status: 'DRAFT',
          title: input.title,
          summary: input.summary,
          effectiveFrom: new Date('2099-01-01'),
          createdBy: auth.userId,
          updatedBy: auth.userId,
        },
      });
      for (const rule of input.rules) {
        await this.upsertRuleOnPack(tx, pack.id, input.countryCode, rule);
      }
      return pack;
    });
  }

  private async upsertRuleOnPack(tx: any, rulePackId: string, countryCode: string, rule: SeedRule) {
    return (tx as any).countryRule.upsert({
      where: {
        aura_country_rule_pack_domain_key_unique: {
          rulePackId,
          domain: rule.domain,
          ruleKey: rule.ruleKey,
        },
      },
      update: {
        value: rule.value as object,
        formula: rule.formula,
        authority: rule.authority,
        citation: rule.citation,
      },
      create: {
        rulePackId,
        countryCode,
        domain: rule.domain,
        ruleKey: rule.ruleKey,
        value: rule.value as object,
        formula: rule.formula,
        authority: rule.authority,
        citation: rule.citation,
        effectiveFrom: new Date(),
      },
    });
  }

  async addOrUpdateRule(rulePackId: string, rule: SeedRule, auth: AuthContext) {
    const pack = await (prisma as any).countryRulePack.findUnique({
      where: { id: rulePackId },
    });
    if (!pack) throw new Error(`rule pack ${rulePackId} not found`);
    if (pack.status === 'RETIRED') {
      throw new Error('cannot edit a RETIRED rule pack — create a new draft version');
    }
    const updated = await this.upsertRuleOnPack(prisma, rulePackId, pack.countryCode, rule);
    await (prisma as any).countryRulePack.update({
      where: { id: rulePackId },
      data: { updatedBy: auth.userId },
    });
    return updated;
  }

  async publish(packId: string, effectiveFrom: Date, auth: AuthContext) {
    const pack = await (prisma as any).countryRulePack.findUnique({
      where: { id: packId },
    });
    if (!pack) throw new Error(`rule pack ${packId} not found`);
    if (pack.status !== 'DRAFT') {
      throw new Error(`cannot publish a pack with status ${pack.status}`);
    }
    return prisma.$transaction(async (tx) => {
      await (tx as any).countryRulePack.updateMany({
        where: {
          countryCode: pack.countryCode,
          status: 'ACTIVE',
          effectiveTo: null,
        },
        data: { effectiveTo: effectiveFrom, status: 'RETIRED', updatedBy: auth.userId },
      });
      return (tx as any).countryRulePack.update({
        where: { id: packId },
        data: {
          status: 'ACTIVE',
          effectiveFrom,
          registeredAt: new Date(),
          updatedBy: auth.userId,
        },
      });
    });
  }

  async getActivePack(countryCode: string, at: Date = new Date()) {
    return (prisma as any).countryRulePack.findFirst({
      where: {
        countryCode: countryCode.toUpperCase(),
        status: 'ACTIVE',
        effectiveFrom: { lte: at },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: at } }],
      },
      include: { rules: true },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  async listVersions(countryCode: string) {
    return (prisma as any).countryRulePack.findMany({
      where: { countryCode: countryCode.toUpperCase() },
      orderBy: { version: 'desc' },
    });
  }

  async listAll(status?: string) {
    return (prisma as any).countryRulePack.findMany({
      where: status ? { status } : {},
      orderBy: [{ countryCode: 'asc' }, { version: 'desc' }],
    });
  }

  async resolveRule(countryCode: string, domain: string, ruleKey: string, at: Date = new Date()) {
    const pack = await this.getActivePack(countryCode, at);
    if (!pack) return null;
    return ((pack.rules ?? []) as Array<{ domain: string; ruleKey: string }>).find(
      (r) => r.domain === domain && r.ruleKey === ruleKey
    );
  }
}

export const countryRulePackService = new CountryRulePackService();
