import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../gcc-rule-library/rule-pack.service', () => ({
  countryRulePackService: { resolveRule: vi.fn() },
}));

vi.mock('@/lib/logger', () => ({
  logger: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

import { countryRulePackService } from '../../gcc-rule-library/rule-pack.service';
import { LabourLawService } from '../labour-law.service';

/**
 * Tier-1 wrap-over follow-up (audit 2026-06-17 §9).
 *
 * Annual leave entitlement is now rule-engine-driven for callers that
 * opt into `calculateAnnualLeaveWithRulePack`. Sync `calculateAnnualLeave`
 * stays on the hardcoded `LABOUR_LAW_CONFIGS` for back-compat.
 */
describe('LabourLawService.calculateAnnualLeaveWithRulePack', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reads ANNUAL_LEAVE_DAYS from the active country rule pack (UAE → 30)', async () => {
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue({
      domain: 'LEAVE',
      ruleKey: 'ANNUAL_LEAVE_DAYS',
      value: 30,
    } as any);

    // Past the threshold so the rule-pack value is the one used.
    const days = await LabourLawService.calculateAnnualLeaveWithRulePack('AE', 5);
    expect(days).toBe(30);
  });

  it('honours an override (UAE 30 → 35) without touching the sync hardcoded path', async () => {
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue({
      value: 35,
    } as any);

    const ruled = await LabourLawService.calculateAnnualLeaveWithRulePack('AE', 5);
    const sync = LabourLawService.calculateAnnualLeave('AE', 5);

    expect(ruled).toBe(35);
    expect(sync).toBe(30); // hardcoded UAE annualAfterYears
  });

  it('falls back to the hardcoded LABOUR_LAW_CONFIGS value when no rule pack exists', async () => {
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue(null);

    const ruled = await LabourLawService.calculateAnnualLeaveWithRulePack('AE', 5);
    const sync = LabourLawService.calculateAnnualLeave('AE', 5);

    expect(ruled).toBe(sync);
  });

  it('preserves the UAE first-year special case (2 days × months)', async () => {
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue({ value: 30 } as any);

    // 6 months service in UAE → 2 days × 6 = 12 days
    const days = await LabourLawService.calculateAnnualLeaveWithRulePack('AE', 0.5);
    expect(days).toBe(12);
  });

  it('survives a rule-engine error and silently falls back to hardcoded', async () => {
    vi.mocked(countryRulePackService.resolveRule).mockRejectedValue(new Error('db down'));

    const ruled = await LabourLawService.calculateAnnualLeaveWithRulePack('AE', 5);
    const sync = LabourLawService.calculateAnnualLeave('AE', 5);

    expect(ruled).toBe(sync);
  });
});
