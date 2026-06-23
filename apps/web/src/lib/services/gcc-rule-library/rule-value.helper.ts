/**
 * Tier-1 cross-cutting helper that lets compliance services consume the
 * rule engine with a single line and a hardcoded fallback.
 *
 * Pattern surfaced by the 2026-06-17 GCC compliance rubric audit:
 * EPIC-02 shipped a rule engine + maker-checker + certificate, but
 * downstream compliance services (WPS, GOSI, GPSSA, EOSB, Emiratisation)
 * never consumed it — they used hardcoded constants. The EPIC's central
 * promise ("update rules without a deploy") was structurally broken.
 *
 * This helper closes that gap without forcing a big-bang refactor:
 *
 *   const days = await resolveRuleValue<number>(
 *     'AE',
 *     'PAYROLL',
 *     'WPS_SALARY_WINDOW_DAYS',
 *     15, // fallback when no active rule pack exists for this country
 *   );
 *
 * Semantics:
 *  - If an ACTIVE rule pack exists for the country AND it contains a rule
 *    matching (domain, ruleKey), the rule's `value` is returned.
 *  - Otherwise, the supplied fallback is returned. Behaviour never
 *    regresses for tenants that haven't yet seeded a rule pack.
 *  - Errors talking to the rule engine are NOT swallowed silently — they
 *    are logged via the standard logger so engineering can see when the
 *    fall-through path is being taken unexpectedly.
 */

import { countryRulePackService } from './rule-pack.service';
import { logger } from '@/lib/logger';

export interface ResolveRuleValueOptions {
  /** Resolution timestamp (default: now). Useful for back-dated runs. */
  at?: Date;
  /**
   * Best-effort context label included in error logs (e.g.
   * "eosb.calculateUAE"). Helps trace which call site fell through.
   */
  source?: string;
}

/**
 * Look up a single rule value from the active country rule pack, with a
 * typed hardcoded fallback. Returns the fallback when no active pack
 * exists, when the rule key is not in the pack, or when the rule's
 * `value` is null / undefined.
 */
export async function resolveRuleValue<T>(
  countryCode: string,
  domain: string,
  ruleKey: string,
  fallback: T,
  options: ResolveRuleValueOptions = {}
): Promise<T> {
  try {
    const rule = await countryRulePackService.resolveRule(
      countryCode,
      domain,
      ruleKey,
      options.at ?? new Date()
    );
    if (!rule) return fallback;
    const value = (rule as { value?: unknown }).value;
    if (value === null || value === undefined) return fallback;
    return value as T;
  } catch (error) {
    logger.warn(
      { error, countryCode, domain, ruleKey, source: options.source },
      'rule-value resolve failed; falling back to hardcoded default'
    );
    return fallback;
  }
}

/**
 * Convenience: resolve and merge a structured rule value (object) with
 * a fallback object. Top-level keys present in the rule value override
 * the corresponding fallback keys. Keys absent in the rule value retain
 * the fallback. Useful for rules like GRATUITY_FORMULA where only some
 * fields may be overridden per country.
 */
export async function resolveRuleObject<T extends object>(
  countryCode: string,
  domain: string,
  ruleKey: string,
  fallback: T,
  options: ResolveRuleValueOptions = {}
): Promise<T> {
  const resolved = await resolveRuleValue<Partial<T> | null>(
    countryCode,
    domain,
    ruleKey,
    null,
    options
  );
  if (!resolved || typeof resolved !== 'object') return fallback;
  return { ...fallback, ...resolved } as T;
}
