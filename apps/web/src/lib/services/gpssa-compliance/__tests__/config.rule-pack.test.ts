import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@aura/database', () => ({
  prisma: {
    gpssaContributionRate: { findMany: vi.fn() },
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
import { GpssaConfigService } from '../config.service';

const fakePrisma = prisma as unknown as {
  gpssaContributionRate: { findMany: ReturnType<typeof vi.fn> };
};

/**
 * Tier-1 wiring test (audit 2026-06-17 Pattern 1) — GPSSA edition.
 *
 * GPSSA carries an extra `governmentPct` column compared with GOSI
 * (three-way split between employer, employee, and the State).
 */
describe('GpssaConfigService.resolveRateWithRulePack', () => {
  let svc: GpssaConfigService;
  beforeEach(() => {
    vi.clearAllMocks();
    svc = new GpssaConfigService();
  });

  it('returns the tenant rate (tagged tenant-config) when one exists', async () => {
    fakePrisma.gpssaContributionRate.findMany.mockResolvedValue([
      {
        id: 'rate-row-1',
        employerPct: 12.5,
        employeePct: 5,
        governmentPct: 6,
        wageFloor: 1000,
        wageCeiling: 50000,
      },
    ]);
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue(null);

    const rate = await svc.resolveRateWithRulePack('t1', 'NATIONAL');

    expect(rate).toEqual({
      id: 'rate-row-1',
      employerPct: 12.5,
      employeePct: 5,
      governmentPct: 6,
      wageFloor: 1000,
      wageCeiling: 50000,
      source: 'tenant-config',
    });
    expect(countryRulePackService.resolveRule).not.toHaveBeenCalled();
  });

  it('falls back to the rule pack when no tenant rate exists AND the pack carries a full rate', async () => {
    fakePrisma.gpssaContributionRate.findMany.mockResolvedValue([]);
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue({
      domain: 'SOCIAL_INSURANCE',
      ruleKey: 'GPSSA_RATES_NATIONAL',
      value: { employerPct: 12.5, employeePct: 5, governmentPct: 6 },
    } as any);

    const rate = await svc.resolveRateWithRulePack('t1', 'NATIONAL');

    expect(rate).toEqual({
      id: null,
      employerPct: 12.5,
      employeePct: 5,
      governmentPct: 6,
      wageFloor: null,
      wageCeiling: null,
      source: 'rule-pack',
    });
  });

  it('treats a missing governmentPct in the rule pack as 0 (employer + employee only)', async () => {
    fakePrisma.gpssaContributionRate.findMany.mockResolvedValue([]);
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue({
      value: { employerPct: 12.5, employeePct: 5 }, // no governmentPct
    } as any);

    const rate = await svc.resolveRateWithRulePack('t1', 'NATIONAL');
    expect(rate?.governmentPct).toBe(0);
  });

  it('returns null when neither source has a full rate (preserves existing failure mode)', async () => {
    fakePrisma.gpssaContributionRate.findMany.mockResolvedValue([]);
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue(null);

    const rate = await svc.resolveRateWithRulePack('t1', 'NATIONAL');
    expect(rate).toBeNull();
  });

  it('builds the rule key from class (e.g. GPSSA_RATES_EXPAT)', async () => {
    fakePrisma.gpssaContributionRate.findMany.mockResolvedValue([]);
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue(null);

    await svc.resolveRateWithRulePack('t1', 'EXPAT');
    expect(countryRulePackService.resolveRule).toHaveBeenCalledWith(
      'AE',
      'SOCIAL_INSURANCE',
      'GPSSA_RATES_EXPAT',
      expect.any(Date)
    );
  });
});
