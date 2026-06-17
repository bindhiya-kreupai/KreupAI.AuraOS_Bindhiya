import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveRuleValue, resolveRuleObject } from '../rule-value.helper';

vi.mock('../rule-pack.service', () => ({
  countryRulePackService: {
    resolveRule: vi.fn(),
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

import { countryRulePackService } from '../rule-pack.service';
import { logger } from '@/lib/logger';

describe('resolveRuleValue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the rule value when an active pack contains the key', async () => {
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue({
      domain: 'PAYROLL',
      ruleKey: 'WPS_SALARY_WINDOW_DAYS',
      value: 7,
    } as any);

    const result = await resolveRuleValue<number>('SA', 'PAYROLL', 'WPS_SALARY_WINDOW_DAYS', 15);
    expect(result).toBe(7);
  });

  it('returns the fallback when no active pack exists for the country', async () => {
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue(null);

    const result = await resolveRuleValue<number>('AE', 'PAYROLL', 'WPS_SALARY_WINDOW_DAYS', 15);
    expect(result).toBe(15);
  });

  it('returns the fallback when the rule exists but the value is null', async () => {
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue({
      domain: 'PAYROLL',
      ruleKey: 'WPS_SALARY_WINDOW_DAYS',
      value: null,
    } as any);

    const result = await resolveRuleValue<number>('AE', 'PAYROLL', 'WPS_SALARY_WINDOW_DAYS', 15);
    expect(result).toBe(15);
  });

  it('returns the fallback (with a warning) when the rule service throws', async () => {
    vi.mocked(countryRulePackService.resolveRule).mockRejectedValue(new Error('db down'));

    const result = await resolveRuleValue<number>('AE', 'PAYROLL', 'WPS_SALARY_WINDOW_DAYS', 15, {
      source: 'unit-test',
    });
    expect(result).toBe(15);
    expect(logger.warn).toHaveBeenCalledOnce();
  });
});

describe('resolveRuleObject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('merges rule pack fields over the fallback (rule wins on shared keys)', async () => {
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue({
      domain: 'EOSB',
      ruleKey: 'GRATUITY_FORMULA',
      value: { firstPeriodDaysPerYear: 25, capYears: 3 },
    } as any);

    const result = await resolveRuleObject('AE', 'EOSB', 'GRATUITY_FORMULA', {
      firstPeriodDaysPerYear: 21,
      secondPeriodDaysPerYear: 30,
      breakpointYears: 5,
      capYears: 2,
    });

    expect(result).toEqual({
      firstPeriodDaysPerYear: 25, // overridden
      secondPeriodDaysPerYear: 30, // from fallback
      breakpointYears: 5, // from fallback
      capYears: 3, // overridden
    });
  });

  it('returns the unchanged fallback when no rule pack exists', async () => {
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue(null);

    const fallback = { firstPeriodDaysPerYear: 21, secondPeriodDaysPerYear: 30 };
    const result = await resolveRuleObject('AE', 'EOSB', 'GRATUITY_FORMULA', fallback);

    expect(result).toEqual(fallback);
  });

  it('returns the unchanged fallback when the rule value is not an object', async () => {
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue({
      value: 'not-an-object',
    } as any);

    const fallback = { firstPeriodDaysPerYear: 21 };
    const result = await resolveRuleObject('AE', 'EOSB', 'GRATUITY_FORMULA', fallback);

    expect(result).toEqual(fallback);
  });
});
