import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@aura/database', () => ({
  prisma: {
    gosiContributionRate: { findMany: vi.fn() },
  },
}));

vi.mock('../../gcc-rule-library/rule-pack.service', () => ({
  countryRulePackService: { resolveRule: vi.fn() },
}));

vi.mock('@/lib/logger', () => ({
  logger: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

import { prisma } from '@aura/database';
import { countryRulePackService } from '../../gcc-rule-library/rule-pack.service';
import { GosiConfigService } from '../config.service';

const fakePrisma = prisma as unknown as {
  gosiContributionRate: { findMany: ReturnType<typeof vi.fn> };
};

/**
 * Tier-1 wiring test (audit 2026-06-17 Pattern 1).
 *
 * `resolveRateWithRulePack` MUST:
 *  - prefer tenant-level rate when one exists
 *  - fall back to the country rule pack when tenant config is null AND
 *    the rule pack carries a full rate object
 *  - return null when neither source has a full rate (preserves the
 *    existing "no GOSI rate configured" failure mode in the calculator)
 *  - tag the returned record with `source` so audit / debugging can
 *    tell where the rate came from
 */
describe('GosiConfigService.resolveRateWithRulePack', () => {
  let svc: GosiConfigService;
  beforeEach(() => {
    vi.clearAllMocks();
    svc = new GosiConfigService();
  });

  it('returns the tenant rate (tagged tenant-config) when one exists', async () => {
    fakePrisma.gosiContributionRate.findMany.mockResolvedValue([
      {
        id: 'rate-row-1',
        employerPct: 11.75,
        employeePct: 10,
        wageFloor: 1500,
        wageCeiling: 45000,
      },
    ]);
    // rule pack should NOT be consulted in this path
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue(null);

    const rate = await svc.resolveRateWithRulePack('t1', 'ANNUITIES', 'SAUDI');

    expect(rate).toEqual({
      id: 'rate-row-1',
      employerPct: 11.75,
      employeePct: 10,
      wageFloor: 1500,
      wageCeiling: 45000,
      source: 'tenant-config',
    });
    expect(countryRulePackService.resolveRule).not.toHaveBeenCalled();
  });

  it('falls back to the rule pack when no tenant rate exists AND the pack carries a full rate', async () => {
    fakePrisma.gosiContributionRate.findMany.mockResolvedValue([]);
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue({
      domain: 'SOCIAL_INSURANCE',
      ruleKey: 'GOSI_RATES_ANNUITIES_NATIONAL',
      value: { employerPct: 11.75, employeePct: 10, wageFloor: 1500, wageCeiling: 45000 },
    } as any);

    const rate = await svc.resolveRateWithRulePack('t1', 'ANNUITIES', 'SAUDI');

    expect(rate).toEqual({
      id: null, // rule-pack-sourced rates have no row id
      employerPct: 11.75,
      employeePct: 10,
      wageFloor: 1500,
      wageCeiling: 45000,
      source: 'rule-pack',
    });
  });

  it('returns null when tenant config is missing AND rule pack carries an incomplete rate', async () => {
    fakePrisma.gosiContributionRate.findMany.mockResolvedValue([]);
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue({
      domain: 'SOCIAL_INSURANCE',
      ruleKey: 'GOSI_EMPLOYER_PCT_NATIONAL',
      value: 11.75, // scalar — old-shape seed; not enough for a full rate
    } as any);

    const rate = await svc.resolveRateWithRulePack('t1', 'ANNUITIES', 'SAUDI');
    expect(rate).toBeNull();
  });

  it('builds the rule key from branch + class (e.g. GOSI_RATES_OCCUPATIONAL_HAZARDS_EXPAT)', async () => {
    fakePrisma.gosiContributionRate.findMany.mockResolvedValue([]);
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue(null);

    await svc.resolveRateWithRulePack('t1', 'OCCUPATIONAL_HAZARDS', 'EXPAT');
    expect(countryRulePackService.resolveRule).toHaveBeenCalledWith(
      'SA',
      'SOCIAL_INSURANCE',
      'GOSI_RATES_OCCUPATIONAL_HAZARDS_EXPAT',
      expect.any(Date)
    );
  });

  it('returns null when no rate is available in either source (preserves existing failure mode)', async () => {
    fakePrisma.gosiContributionRate.findMany.mockResolvedValue([]);
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue(null);

    const rate = await svc.resolveRateWithRulePack('t1', 'ANNUITIES', 'SAUDI');
    expect(rate).toBeNull();
  });
});
