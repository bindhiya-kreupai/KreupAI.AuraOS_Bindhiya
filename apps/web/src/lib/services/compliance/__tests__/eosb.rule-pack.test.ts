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
import { EOSBService } from '../eosb.service';

/**
 * Tier-1 wiring test (audit 2026-06-17 Pattern 1).
 *
 * The same EOSB inputs MUST produce different results when the active
 * country rule pack carries an EOSB.GRATUITY_FORMULA override — this is
 * the proof that EPIC-02's promise ("update rules without a deploy") is
 * structurally honoured by the EOSB calculator. Identical inputs MUST
 * also fall back cleanly to the historical hardcoded result when no
 * rule pack is seeded.
 */
describe('EOSBService.calculateWithRulePack', () => {
  const baseInput = {
    employeeId: 'emp-1',
    countryCode: 'AE' as const,
    joiningDate: new Date('2018-01-01'),
    lastWorkingDate: new Date('2026-01-01'), // ~8 years
    basicSalary: 10_000,
    terminationType: 'END_OF_CONTRACT' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('falls back to the hardcoded UAE 21/30 formula when no rule pack exists', async () => {
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue(null);

    const ruled = await EOSBService.calculateWithRulePack(baseInput);
    const baseline = EOSBService.calculate(baseInput);

    expect(ruled.grossAmount).toBe(baseline.grossAmount);
    expect(ruled.calculationDetails.formula).toContain('21 days');
    expect(ruled.calculationDetails.formula).toContain('30 days');
  });

  it('applies an active rule pack override (40/60 days, 7-year breakpoint, 3-year cap)', async () => {
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue({
      domain: 'EOSB',
      ruleKey: 'GRATUITY_FORMULA',
      value: {
        firstPeriodDaysPerYear: 40,
        secondPeriodDaysPerYear: 60,
        breakpointYears: 7,
        capYears: 3,
      },
    } as any);

    const ruled = await EOSBService.calculateWithRulePack(baseInput);
    const baseline = EOSBService.calculate(baseInput);

    // Override values must change the formula label AND the gross amount.
    expect(ruled.calculationDetails.formula).toContain('40 days');
    expect(ruled.calculationDetails.formula).toContain('60 days');
    expect(ruled.calculationDetails.formula).toContain('(Years ≤ 7)');
    expect(ruled.grossAmount).not.toBe(baseline.grossAmount);
  });

  it('honours a partial override (only firstPeriodDaysPerYear) and inherits other fields from hardcoded defaults', async () => {
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue({
      domain: 'EOSB',
      ruleKey: 'GRATUITY_FORMULA',
      value: { firstPeriodDaysPerYear: 25 }, // only first-period days overridden
    } as any);

    const ruled = await EOSBService.calculateWithRulePack(baseInput);

    expect(ruled.calculationDetails.formula).toContain('25 days'); // overridden
    expect(ruled.calculationDetails.formula).toContain('30 days'); // hardcoded second-period default
    expect(ruled.calculationDetails.formula).toContain('(Years ≤ 5)'); // hardcoded breakpoint
  });

  it('routes a Saudi (KSA) input through the KSA branch and honours overrides there', async () => {
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue({
      domain: 'EOSB',
      ruleKey: 'GRATUITY_FORMULA',
      value: { firstPeriodDaysPerYear: 20 }, // override KSA first-period from 15 → 20
    } as any);

    const ruled = await EOSBService.calculateWithRulePack({
      ...baseInput,
      countryCode: 'SA' as const,
    });

    expect(ruled.calculationDetails.formula).toContain('20 days');
    expect(ruled.calculationDetails.law).toContain('Saudi Labour Law');
  });

  it('survives a rule-engine error and silently falls back to hardcoded defaults', async () => {
    vi.mocked(countryRulePackService.resolveRule).mockRejectedValue(new Error('db down'));

    const ruled = await EOSBService.calculateWithRulePack(baseInput);
    const baseline = EOSBService.calculate(baseInput);

    // Identical to baseline — a back-end outage in the rule engine must
    // never block a final-settlement calculation.
    expect(ruled.grossAmount).toBe(baseline.grossAmount);
  });
});
