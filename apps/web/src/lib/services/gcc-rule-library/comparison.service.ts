import { countryRulePackService } from './rule-pack.service';
import { COMPARISON_DIMENSIONS } from './rule-pack-seeds';

export type ComparisonDomain = keyof typeof COMPARISON_DIMENSIONS;

export interface ComparisonCell {
  countryCode: string;
  value: unknown;
  authority?: string;
  citation?: string;
  ruleId?: string;
}

export interface ComparisonRow {
  domain: string;
  ruleKey: string;
  cells: Record<string, ComparisonCell | null>;
}

const GCC = ['AE', 'SA', 'BH', 'QA', 'OM', 'KW'];

/**
 * EPIC-36-S05: live GCC comparison projection from authored rule packs.
 *
 * Each comparison cell is a live read of the current ACTIVE rule pack, so
 * publishing a new rule pack updates the comparison automatically.
 */
export class ComparisonService {
  async build(domain: ComparisonDomain): Promise<ComparisonRow[]> {
    const keys = COMPARISON_DIMENSIONS[domain];
    const packs = await Promise.all(
      GCC.map(async (cc) => ({ cc, pack: await countryRulePackService.getActivePack(cc) }))
    );

    return keys.map((ruleKey) => {
      const cells: Record<string, ComparisonCell | null> = {};
      for (const { cc, pack } of packs) {
        if (!pack) {
          cells[cc] = null;
          continue;
        }
        const rules = (pack.rules ?? []) as Array<{
          id: string;
          domain: string;
          ruleKey: string;
          value: unknown;
          authority?: string;
          citation?: string;
        }>;
        const rule = rules.find((r) => r.ruleKey === ruleKey);
        cells[cc] = rule
          ? {
              countryCode: cc,
              value: rule.value,
              authority: rule.authority,
              citation: rule.citation,
              ruleId: rule.id,
            }
          : null;
      }
      return { domain, ruleKey, cells };
    });
  }

  async overview() {
    const out: Array<{ countryCode: string; summary: string; title: string } | null> = [];
    for (const cc of GCC) {
      const pack = await countryRulePackService.getActivePack(cc);
      out.push(pack ? { countryCode: cc, summary: pack.summary, title: pack.title } : null);
    }
    return out.filter(Boolean);
  }
}

export const comparisonService = new ComparisonService();
