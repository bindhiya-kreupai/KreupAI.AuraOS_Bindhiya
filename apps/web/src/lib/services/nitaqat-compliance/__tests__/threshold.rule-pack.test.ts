import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@aura/database', () => ({
  prisma: {
    nitaqatBandThreshold: { findMany: vi.fn() },
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
import { NitaqatConfigService } from '../index';

const fakePrisma = prisma as unknown as {
  nitaqatBandThreshold: { findMany: ReturnType<typeof vi.fn> };
};

/**
 * Tier-1 wiring test (audit 2026-06-17 Pattern 1) — Nitaqat edition.
 *
 * `resolveThresholdWithRulePack` MUST:
 *  - prefer tenant-level threshold when one exists
 *  - fall back to KSA rule pack when tenant config is null AND the
 *    pack carries the {red, yellow, green} triplet
 *  - return null when neither source has a full triplet
 *  - tag results with `source` for audit traceability
 */
describe('NitaqatConfigService.resolveThresholdWithRulePack', () => {
  let svc: NitaqatConfigService;
  beforeEach(() => {
    vi.clearAllMocks();
    svc = new NitaqatConfigService();
  });

  it('returns the tenant threshold (tagged tenant-config) when one exists', async () => {
    fakePrisma.nitaqatBandThreshold.findMany.mockResolvedValue([
      { id: 'th-1', redMaxPct: 5, yellowMaxPct: 8, greenMaxPct: 11 },
    ]);
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue(null);

    const t = await svc.resolveThresholdWithRulePack('t1', 'PRIVATE', 'MEDIUM');

    expect(t).toEqual({
      id: 'th-1',
      redMaxPct: 5,
      yellowMaxPct: 8,
      greenMaxPct: 11,
      source: 'tenant-config',
    });
    expect(countryRulePackService.resolveRule).not.toHaveBeenCalled();
  });

  it('falls back to the KSA rule pack when no tenant config exists', async () => {
    fakePrisma.nitaqatBandThreshold.findMany.mockResolvedValue([]);
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue({
      domain: 'NATIONALIZATION',
      ruleKey: 'NITAQAT_BAND_THRESHOLDS_PRIVATE_LARGE',
      value: { redMaxPct: 8, yellowMaxPct: 12, greenMaxPct: 18 },
    } as any);

    const t = await svc.resolveThresholdWithRulePack('t1', 'PRIVATE', 'LARGE');

    expect(t).toEqual({
      id: null,
      redMaxPct: 8,
      yellowMaxPct: 12,
      greenMaxPct: 18,
      source: 'rule-pack',
    });
  });

  it('returns null when the rule pack carries a partial threshold (missing greenMaxPct)', async () => {
    fakePrisma.nitaqatBandThreshold.findMany.mockResolvedValue([]);
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue({
      value: { redMaxPct: 8, yellowMaxPct: 12 }, // greenMaxPct missing
    } as any);

    const t = await svc.resolveThresholdWithRulePack('t1', 'PRIVATE', 'LARGE');
    expect(t).toBeNull();
  });

  it('builds the rule key from sector + sizeBracket (PRIVATE / GIANT)', async () => {
    fakePrisma.nitaqatBandThreshold.findMany.mockResolvedValue([]);
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue(null);

    await svc.resolveThresholdWithRulePack('t1', 'PRIVATE', 'GIANT');
    expect(countryRulePackService.resolveRule).toHaveBeenCalledWith(
      'SA',
      'NATIONALIZATION',
      'NITAQAT_BAND_THRESHOLDS_PRIVATE_GIANT',
      expect.any(Date)
    );
  });

  it('returns null when neither source has a threshold (preserves existing failure mode)', async () => {
    fakePrisma.nitaqatBandThreshold.findMany.mockResolvedValue([]);
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue(null);

    const t = await svc.resolveThresholdWithRulePack('t1', 'PRIVATE', 'SMALL');
    expect(t).toBeNull();
  });
});
