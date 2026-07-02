import { describe, it, expect } from 'vitest';
import { computeTax, ExpatTaxService, FILING_STATUSES } from '@/lib/services/expat-tax.service';

describe('expat tax computation', () => {
  describe('computeTax (progressive brackets)', () => {
    it('returns 0 for zero or negative income', () => {
      expect(computeTax('US', 0)).toBe(0);
      expect(computeTax('US', -5000)).toBe(0);
    });

    it('returns 0 tax for zero-income-tax jurisdictions (UAE, KSA)', () => {
      expect(computeTax('AE', 250000)).toBe(0);
      expect(computeTax('SA', 500000)).toBe(0);
    });

    it('applies marginal US brackets progressively', () => {
      // 100k: 10% up to 11,600; 12% to 47,150; 22% to 100k
      // = 1160 + 4266 + 11627 = 17,053
      const tax = computeTax('US', 100000);
      expect(tax).toBeGreaterThan(16000);
      expect(tax).toBeLessThan(18000);
    });

    it('respects the UK 0% personal allowance band', () => {
      // 12,570 allowance at 0% → below-threshold income is tax free
      expect(computeTax('UK', 12000)).toBe(0);
      // Just above allowance taxed at 20%
      expect(computeTax('UK', 22570)).toBe(2000);
    });

    it('falls back to a flat 20% for unknown countries', () => {
      expect(computeTax('ZZ', 50000)).toBe(10000);
    });

    it('is case-insensitive on country code', () => {
      expect(computeTax('us', 100000)).toBe(computeTax('US', 100000));
    });
  });

  describe('ExpatTaxService.estimate (tax equalization)', () => {
    const service = new ExpatTaxService();

    it('computes company cost as hostTax minus hypoTax', () => {
      const r = service.estimate({ homeCountry: 'US', hostCountry: 'AE', baseSalary: 100000 });
      expect(r.hostTax).toBe(0); // UAE
      expect(r.hypoTax).toBeGreaterThan(0); // US
      expect(r.companyCost).toBe(r.hostTax - r.hypoTax);
      expect(r.companyCost).toBeLessThan(0); // advantageous assignment
    });

    it('uppercases country codes and defaults currency to USD', () => {
      const r = service.estimate({ homeCountry: 'us', hostCountry: 'de', baseSalary: 80000 });
      expect(r.homeCountry).toBe('US');
      expect(r.hostCountry).toBe('DE');
      expect(r.currency).toBe('USD');
    });

    it('carries through an explicit currency', () => {
      const r = service.estimate({
        homeCountry: 'UK',
        hostCountry: 'SG',
        baseSalary: 90000,
        currency: 'GBP',
      });
      expect(r.currency).toBe('GBP');
    });
  });

  it('exposes the canonical filing statuses', () => {
    expect(FILING_STATUSES).toEqual(['PENDING', 'IN_REVIEW', 'FILED', 'COMPLETED']);
  });
});
