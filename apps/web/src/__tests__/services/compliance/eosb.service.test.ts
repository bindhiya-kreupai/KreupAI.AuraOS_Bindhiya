/**
 * EOSB Service Tests
 *
 * Comprehensive test suite for End of Service Benefits (Gratuity) calculations
 * across all GCC countries and India
 */

import { describe, it, expect } from '@jest/globals';
import { EOSBService } from '@/lib/services/compliance/eosb.service';

describe('EOSBService', () => {
  describe('UAE EOSB Calculations', () => {
    const countryCode = 'AE';

    it('should return zero for less than 1 year service', () => {
      const result = EOSBService.calculate({
        countryCode,
        lastBasicSalary: 10000,
        yearsOfService: 0.5,
        terminationType: 'EMPLOYER_TERMINATION',
      });

      expect(result.totalAmount).toBe(0);
      expect(result.isEligible).toBe(false);
    });

    it('should calculate 21 days per year for first 5 years', () => {
      const result = EOSBService.calculate({
        countryCode,
        lastBasicSalary: 10000,
        yearsOfService: 3,
        terminationType: 'EMPLOYER_TERMINATION',
      });

      // 21 days * 3 years * (10000 / 30)
      expect(result.totalAmount).toBe(21000);
      expect(result.isEligible).toBe(true);
    });

    it('should calculate 30 days per year after 5 years', () => {
      const result = EOSBService.calculate({
        countryCode,
        lastBasicSalary: 10000,
        yearsOfService: 7,
        terminationType: 'EMPLOYER_TERMINATION',
      });

      // First 5 years: 21 * 5 * (10000/30) = 35000
      // Next 2 years: 30 * 2 * (10000/30) = 20000
      // Total: 55000
      expect(result.totalAmount).toBe(55000);
    });

    it('should apply 1/3 factor for resignation 1-3 years', () => {
      const result = EOSBService.calculate({
        countryCode,
        lastBasicSalary: 10000,
        yearsOfService: 2,
        terminationType: 'RESIGNATION',
      });

      // 21 days * 2 years * (10000 / 30) * 1/3
      expect(result.totalAmount).toBeCloseTo(4666.67, 0);
    });

    it('should apply 2/3 factor for resignation 3-5 years', () => {
      const result = EOSBService.calculate({
        countryCode,
        lastBasicSalary: 10000,
        yearsOfService: 4,
        terminationType: 'RESIGNATION',
      });

      // 21 days * 4 years * (10000 / 30) * 2/3
      expect(result.totalAmount).toBeCloseTo(18666.67, 0);
    });

    it('should give full amount for resignation after 5 years', () => {
      const result = EOSBService.calculate({
        countryCode,
        lastBasicSalary: 10000,
        yearsOfService: 6,
        terminationType: 'RESIGNATION',
      });

      // Full calculation: 5 years @ 21 days + 1 year @ 30 days
      const expected = (21 * 5 + 30 * 1) * (10000 / 30);
      expect(result.totalAmount).toBe(expected);
    });

    it('should cap at 24 months salary', () => {
      const result = EOSBService.calculate({
        countryCode,
        lastBasicSalary: 10000,
        yearsOfService: 25,
        terminationType: 'EMPLOYER_TERMINATION',
      });

      // Should be capped at 24 months = 240000
      expect(result.totalAmount).toBe(240000);
      expect(result.cappedAt24Months).toBe(true);
    });
  });

  describe('Saudi Arabia EOSB Calculations', () => {
    const countryCode = 'SA';

    it('should return zero for less than 2 years service', () => {
      const result = EOSBService.calculate({
        countryCode,
        lastBasicSalary: 10000,
        yearsOfService: 1.5,
        terminationType: 'EMPLOYER_TERMINATION',
      });

      expect(result.totalAmount).toBe(0);
      expect(result.isEligible).toBe(false);
    });

    it('should calculate 15 days per year for first 5 years', () => {
      const result = EOSBService.calculate({
        countryCode,
        lastBasicSalary: 10000,
        yearsOfService: 4,
        terminationType: 'EMPLOYER_TERMINATION',
      });

      // 15 days * 4 years * (10000 / 30) = 20000
      expect(result.totalAmount).toBe(20000);
    });

    it('should calculate 30 days per year after 5 years', () => {
      const result = EOSBService.calculate({
        countryCode,
        lastBasicSalary: 10000,
        yearsOfService: 8,
        terminationType: 'EMPLOYER_TERMINATION',
      });

      // First 5 years: 15 * 5 * (10000/30) = 25000
      // Next 3 years: 30 * 3 * (10000/30) = 30000
      // Total: 55000
      expect(result.totalAmount).toBe(55000);
    });

    it('should apply 1/3 factor for resignation 2-5 years', () => {
      const result = EOSBService.calculate({
        countryCode,
        lastBasicSalary: 10000,
        yearsOfService: 4,
        terminationType: 'RESIGNATION',
      });

      // 15 days * 4 years * (10000 / 30) * 1/3
      expect(result.totalAmount).toBeCloseTo(6666.67, 0);
    });

    it('should apply 2/3 factor for resignation 5-10 years', () => {
      const result = EOSBService.calculate({
        countryCode,
        lastBasicSalary: 10000,
        yearsOfService: 7,
        terminationType: 'RESIGNATION',
      });

      // First 5 years: 15 * 5 * (10000/30) = 25000
      // Next 2 years: 30 * 2 * (10000/30) = 20000
      // Total: 45000 * 2/3 = 30000
      expect(result.totalAmount).toBeCloseTo(30000, 0);
    });
  });

  describe('Qatar EOSB Calculations', () => {
    const countryCode = 'QA';

    it('should calculate 3 weeks per year (21 days)', () => {
      const result = EOSBService.calculate({
        countryCode,
        lastBasicSalary: 10000,
        yearsOfService: 5,
        terminationType: 'EMPLOYER_TERMINATION',
      });

      // 21 days * 5 years * (10000 / 30)
      expect(result.totalAmount).toBe(35000);
    });
  });

  describe('Bahrain EOSB Calculations', () => {
    const countryCode = 'BH';

    it('should calculate 15 days for first 3 years', () => {
      const result = EOSBService.calculate({
        countryCode,
        lastBasicSalary: 9000,
        yearsOfService: 2,
        terminationType: 'EMPLOYER_TERMINATION',
      });

      // 15 days * 2 years * (9000 / 30) = 9000
      expect(result.totalAmount).toBe(9000);
    });

    it('should calculate 30 days after 3 years', () => {
      const result = EOSBService.calculate({
        countryCode,
        lastBasicSalary: 9000,
        yearsOfService: 5,
        terminationType: 'EMPLOYER_TERMINATION',
      });

      // First 3 years: 15 * 3 * 300 = 13500
      // Next 2 years: 30 * 2 * 300 = 18000
      // Total: 31500
      expect(result.totalAmount).toBe(31500);
    });
  });

  describe('Oman EOSB Calculations', () => {
    const countryCode = 'OM';

    it('should calculate 15 days per year for expats', () => {
      const result = EOSBService.calculate({
        countryCode,
        lastBasicSalary: 12000,
        yearsOfService: 6,
        terminationType: 'EMPLOYER_TERMINATION',
      });

      // 15 days * 6 years * (12000 / 30) = 36000
      expect(result.totalAmount).toBe(36000);
    });
  });

  describe('Kuwait EOSB Calculations', () => {
    const countryCode = 'KW';

    it('should calculate correctly for Kuwait', () => {
      const result = EOSBService.calculate({
        countryCode,
        lastBasicSalary: 15000,
        yearsOfService: 7,
        terminationType: 'EMPLOYER_TERMINATION',
      });

      // First 5 years: 15 * 5 * 500 = 37500
      // Next 2 years: 30 * 2 * 500 = 30000
      // Total: 67500
      expect(result.totalAmount).toBe(67500);
    });
  });

  describe('India Gratuity Calculations', () => {
    const countryCode = 'IN';

    it('should return zero for less than 5 years service', () => {
      const result = EOSBService.calculate({
        countryCode,
        lastBasicSalary: 50000,
        yearsOfService: 4.5,
        terminationType: 'RESIGNATION',
      });

      expect(result.totalAmount).toBe(0);
      expect(result.isEligible).toBe(false);
    });

    it('should calculate 15 days per year for eligible employees', () => {
      const result = EOSBService.calculate({
        countryCode,
        lastBasicSalary: 50000,
        yearsOfService: 10,
        terminationType: 'RESIGNATION',
      });

      // 15 days * 10 years * (50000 / 26) (India uses 26 working days)
      // 15 * 10 * 1923.08 = 288461.54
      expect(result.totalAmount).toBeCloseTo(288461.54, 0);
    });
  });

  describe('getCountryRules', () => {
    it('should return rules for all supported countries', () => {
      const countries = ['AE', 'SA', 'BH', 'QA', 'OM', 'KW', 'IN'];

      countries.forEach(code => {
        const rules = EOSBService.getCountryRules(code);
        expect(rules).toBeDefined();
        expect(rules.countryCode).toBe(code);
        expect(rules.minServiceMonths).toBeGreaterThan(0);
      });
    });

    it('should throw error for unsupported country', () => {
      expect(() => EOSBService.getCountryRules('XX')).toThrow();
    });
  });

  describe('getSupportedCountries', () => {
    it('should return all 7 supported countries', () => {
      const countries = EOSBService.getSupportedCountries();

      expect(countries).toHaveLength(7);
      expect(countries.map(c => c.code)).toEqual(
        expect.arrayContaining(['AE', 'SA', 'BH', 'QA', 'OM', 'KW', 'IN'])
      );
    });

    it('should include Arabic names', () => {
      const countries = EOSBService.getSupportedCountries();

      countries.forEach(country => {
        expect(country.nameAr).toBeDefined();
        expect(country.nameAr.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle partial years correctly', () => {
      const result = EOSBService.calculate({
        countryCode: 'AE',
        lastBasicSalary: 12000,
        yearsOfService: 3.5,
        terminationType: 'EMPLOYER_TERMINATION',
      });

      // 21 days * 3.5 years * (12000 / 30)
      expect(result.totalAmount).toBe(29400);
    });

    it('should handle zero salary gracefully', () => {
      const result = EOSBService.calculate({
        countryCode: 'AE',
        lastBasicSalary: 0,
        yearsOfService: 5,
        terminationType: 'EMPLOYER_TERMINATION',
      });

      expect(result.totalAmount).toBe(0);
    });

    it('should handle very long service periods', () => {
      const result = EOSBService.calculate({
        countryCode: 'AE',
        lastBasicSalary: 20000,
        yearsOfService: 30,
        terminationType: 'EMPLOYER_TERMINATION',
      });

      // Should be capped at 24 months = 480000
      expect(result.totalAmount).toBe(480000);
      expect(result.cappedAt24Months).toBe(true);
    });

    it('should provide breakdown in response', () => {
      const result = EOSBService.calculate({
        countryCode: 'AE',
        lastBasicSalary: 15000,
        yearsOfService: 7,
        terminationType: 'EMPLOYER_TERMINATION',
      });

      expect(result.breakdown).toBeDefined();
      expect(result.breakdown.dailyRate).toBe(500);
      expect(result.breakdown.yearsInFirstPeriod).toBe(5);
      expect(result.breakdown.yearsInSecondPeriod).toBe(2);
    });
  });
});
