import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../gcc-rule-library/rule-pack.service', () => ({
  countryRulePackService: {
    resolveRule: vi.fn(),
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

import { countryRulePackService } from '../../gcc-rule-library/rule-pack.service';
import { EmiratisationConfigService } from '../index';

/**
 * Tier-1 wiring test (audit 2026-06-17 Pattern 1).
 *
 * EmiratisationConfigService.getDefaults() must resolve the active UAE
 * EMIRATISATION_PRIVATE_TARGET rule when one is seeded, and fall back
 * to the hardcoded baseline (50 employees, 2% / 4% targets, AED 7,000
 * fine) when no rule pack exists. Partial overrides from the rule pack
 * must merge over the baseline (the rule wins on the keys it specifies).
 */
describe('EmiratisationConfigService rule-pack wiring', () => {
  let svc: EmiratisationConfigService;

  beforeEach(() => {
    vi.clearAllMocks();
    svc = new EmiratisationConfigService();
  });

  it('returns the hardcoded baseline when no UAE rule pack is seeded', async () => {
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue(null);

    const defaults = await svc.getDefaults();
    expect(defaults).toEqual({
      appliesAt: 50,
      halfYearTargetPct: 2,
      yearEndTargetPct: 4,
      finePerMissedHire: 7000,
    });
  });

  it('honours an active UAE rule pack override (all four fields)', async () => {
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue({
      domain: 'NATIONALIZATION',
      ruleKey: 'EMIRATISATION_PRIVATE_TARGET',
      value: {
        appliesAt: 100,
        halfYearTargetPct: 3,
        yearEndTargetPct: 6,
        finePerMissedHire: 10_000,
      },
    } as any);

    const defaults = await svc.getDefaults();
    expect(defaults).toEqual({
      appliesAt: 100,
      halfYearTargetPct: 3,
      yearEndTargetPct: 6,
      finePerMissedHire: 10_000,
    });
  });

  it('merges a partial override (only finePerMissedHire) over the hardcoded baseline', async () => {
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue({
      domain: 'NATIONALIZATION',
      ruleKey: 'EMIRATISATION_PRIVATE_TARGET',
      value: { finePerMissedHire: 12_500 },
    } as any);

    const defaults = await svc.getDefaults();
    expect(defaults).toEqual({
      appliesAt: 50, // baseline
      halfYearTargetPct: 2, // baseline
      yearEndTargetPct: 4, // baseline
      finePerMissedHire: 12_500, // overridden
    });
  });

  it('isApplicableAsync uses the rule-pack threshold instead of the hardcoded 50', async () => {
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue({
      domain: 'NATIONALIZATION',
      ruleKey: 'EMIRATISATION_PRIVATE_TARGET',
      value: { appliesAt: 100 },
    } as any);

    // 80 employees: would trigger the hardcoded threshold but NOT the rule-pack one
    await expect(svc.isApplicableAsync(80)).resolves.toBe(false);
    // 120 employees: triggers both
    await expect(svc.isApplicableAsync(120)).resolves.toBe(true);
  });

  it('isApplicable (sync legacy) still uses the hardcoded threshold for back-compat callers', () => {
    expect(svc.isApplicable(49)).toBe(false);
    expect(svc.isApplicable(50)).toBe(true);
    expect(svc.isApplicable(80)).toBe(true);
  });
});
