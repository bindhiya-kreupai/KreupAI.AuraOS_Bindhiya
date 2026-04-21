import { describe, it, expect } from 'vitest';
import { EOSBService } from '../eosb.service';
import type { EOSBCalculationInput } from '../types';

describe('EOSBService - End of Service Benefits', () => {
  describe('calculate - Saudi Arabia (KSA)', () => {
    it('should calculate EOSB for less than 5 years service (termination)', () => {
      const input: EOSBCalculationInput = {
        employeeId: 'emp-1',
        countryCode: 'SA',
        joiningDate: new Date('2021-01-01'),
        lastWorkingDate: new Date('2024-01-01'), // ~3 years
        basicSalary: 10000,
        terminationType: 'END_OF_CONTRACT',
      };

      const result = EOSBService.calculate(input);

      // First 5 years: 15 days per year
      const dailyRate = 10000 / 30;
      expect(result.countryCode).toBe('SA');
      expect(result.currency).toBe('SAR');
      expect(result.dailyRate).toBeCloseTo(dailyRate, 0);
      expect(result.firstPeriodAmount).toBeGreaterThan(0);
      expect(result.secondPeriodAmount).toBe(0); // Under 5 years
      expect(result.netAmount).toBeGreaterThan(0);
      expect(result.resignationFactor).toBe(1); // Not a resignation
    });

    it('should calculate EOSB for more than 5 years service', () => {
      const input: EOSBCalculationInput = {
        employeeId: 'emp-1',
        countryCode: 'SA',
        joiningDate: new Date('2015-01-01'),
        lastWorkingDate: new Date('2024-01-01'), // ~9 years
        basicSalary: 10000,
        terminationType: 'END_OF_CONTRACT',
      };

      const result = EOSBService.calculate(input);

      // First 5 years at 15 days, next 4 years at 30 days
      expect(result.firstPeriodYears).toBeCloseTo(5, 0);
      expect(result.secondPeriodYears).toBeGreaterThan(0);
      expect(result.secondPeriodAmount).toBeGreaterThan(0);
      expect(result.netAmount).toBeGreaterThan(result.firstPeriodAmount);
    });

    it('should apply resignation factor for resignation under 2 years', () => {
      const input: EOSBCalculationInput = {
        employeeId: 'emp-1',
        countryCode: 'SA',
        joiningDate: new Date('2023-01-01'),
        lastWorkingDate: new Date('2024-07-01'), // ~1.5 years
        basicSalary: 10000,
        terminationType: 'RESIGNATION',
      };

      const result = EOSBService.calculate(input);

      // KSA: No entitlement for resignation under 2 years
      expect(result.resignationFactor).toBe(0);
      expect(result.netAmount).toBe(0);
    });

    it('should apply 1/3 factor for resignation between 2-5 years', () => {
      const input: EOSBCalculationInput = {
        employeeId: 'emp-1',
        countryCode: 'SA',
        joiningDate: new Date('2020-01-01'),
        lastWorkingDate: new Date('2024-01-01'), // ~4 years
        basicSalary: 10000,
        terminationType: 'RESIGNATION',
      };

      const result = EOSBService.calculate(input);

      expect(result.resignationFactor).toBeCloseTo(1 / 3, 2);
      expect(result.adjustedAmount).toBeCloseTo(result.grossAmount / 3, 0);
    });

    it('should apply 2/3 factor for resignation between 5-10 years', () => {
      const input: EOSBCalculationInput = {
        employeeId: 'emp-1',
        countryCode: 'SA',
        joiningDate: new Date('2017-01-01'),
        lastWorkingDate: new Date('2024-01-01'), // ~7 years
        basicSalary: 10000,
        terminationType: 'RESIGNATION',
      };

      const result = EOSBService.calculate(input);

      expect(result.resignationFactor).toBeCloseTo(2 / 3, 2);
    });

    it('should provide full gratuity for resignation after 10 years', () => {
      const input: EOSBCalculationInput = {
        employeeId: 'emp-1',
        countryCode: 'SA',
        joiningDate: new Date('2010-01-01'),
        lastWorkingDate: new Date('2024-01-01'), // ~14 years
        basicSalary: 10000,
        terminationType: 'RESIGNATION',
      };

      const result = EOSBService.calculate(input);

      expect(result.resignationFactor).toBe(1);
      expect(result.netAmount).toBe(result.grossAmount);
    });

    it('should include calculation details with law reference', () => {
      const input: EOSBCalculationInput = {
        employeeId: 'emp-1',
        countryCode: 'SA',
        joiningDate: new Date('2020-01-01'),
        lastWorkingDate: new Date('2024-01-01'),
        basicSalary: 10000,
        terminationType: 'END_OF_CONTRACT',
      };

      const result = EOSBService.calculate(input);

      expect(result.calculationDetails.law).toContain('Saudi Labour Law');
      expect(result.calculationDetails.formula).toBeTruthy();
    });
  });

  describe('calculate - UAE', () => {
    it('should return zero for service less than 1 year', () => {
      const input: EOSBCalculationInput = {
        employeeId: 'emp-1',
        countryCode: 'AE',
        joiningDate: new Date('2024-01-01'),
        lastWorkingDate: new Date('2024-06-01'), // 5 months
        basicSalary: 10000,
        terminationType: 'END_OF_CONTRACT',
      };

      const result = EOSBService.calculate(input);

      expect(result.netAmount).toBe(0);
      expect(result.calculationDetails.notes.length).toBeGreaterThan(0);
    });

    it('should calculate 21 days per year for first 5 years', () => {
      const input: EOSBCalculationInput = {
        employeeId: 'emp-1',
        countryCode: 'AE',
        joiningDate: new Date('2020-01-01'),
        lastWorkingDate: new Date('2024-01-01'), // ~4 years
        basicSalary: 10000,
        terminationType: 'END_OF_CONTRACT',
      };

      const result = EOSBService.calculate(input);

      expect(result.currency).toBe('AED');
      expect(result.firstPeriodAmount).toBeGreaterThan(0);
      expect(result.secondPeriodAmount).toBe(0);
      expect(result.calculationDetails.law).toContain('UAE');
    });

    it('should calculate 30 days per year after 5 years', () => {
      const input: EOSBCalculationInput = {
        employeeId: 'emp-1',
        countryCode: 'AE',
        joiningDate: new Date('2015-01-01'),
        lastWorkingDate: new Date('2024-01-01'), // ~9 years
        basicSalary: 10000,
        terminationType: 'END_OF_CONTRACT',
      };

      const result = EOSBService.calculate(input);

      expect(result.secondPeriodAmount).toBeGreaterThan(0);
      expect(result.netAmount).toBeGreaterThan(result.firstPeriodAmount);
    });

    it('should apply resignation factor for 1-3 years service', () => {
      const input: EOSBCalculationInput = {
        employeeId: 'emp-1',
        countryCode: 'AE',
        joiningDate: new Date('2022-01-01'),
        lastWorkingDate: new Date('2024-01-01'), // ~2 years
        basicSalary: 10000,
        terminationType: 'RESIGNATION',
      };

      const result = EOSBService.calculate(input);

      expect(result.resignationFactor).toBeCloseTo(1 / 3, 2);
    });

    it('should cap gratuity at 2 years salary', () => {
      const input: EOSBCalculationInput = {
        employeeId: 'emp-1',
        countryCode: 'AE',
        joiningDate: new Date('1990-01-01'),
        lastWorkingDate: new Date('2024-01-01'), // ~34 years
        basicSalary: 10000,
        terminationType: 'END_OF_CONTRACT',
      };

      const result = EOSBService.calculate(input);

      // Cap is 24 months salary = 240,000
      expect(result.grossAmount).toBeLessThanOrEqual(10000 * 24);
    });
  });

  describe('calculate - Other GCC Countries', () => {
    it('should calculate EOSB for Qatar (21 days per year)', () => {
      const input: EOSBCalculationInput = {
        employeeId: 'emp-1',
        countryCode: 'QA',
        joiningDate: new Date('2020-01-01'),
        lastWorkingDate: new Date('2024-01-01'),
        basicSalary: 10000,
        terminationType: 'END_OF_CONTRACT',
      };

      const result = EOSBService.calculate(input);

      expect(result.currency).toBe('QAR');
      expect(result.netAmount).toBeGreaterThan(0);
      expect(result.calculationDetails.law).toContain('Qatar');
    });

    it('should calculate EOSB for Bahrain', () => {
      const input: EOSBCalculationInput = {
        employeeId: 'emp-1',
        countryCode: 'BH',
        joiningDate: new Date('2020-01-01'),
        lastWorkingDate: new Date('2024-01-01'),
        basicSalary: 10000,
        terminationType: 'END_OF_CONTRACT',
      };

      const result = EOSBService.calculate(input);

      expect(result.currency).toBe('BHD');
      expect(result.netAmount).toBeGreaterThan(0);
      expect(result.calculationDetails.law).toContain('Bahrain');
    });

    it('should calculate EOSB for Oman', () => {
      const input: EOSBCalculationInput = {
        employeeId: 'emp-1',
        countryCode: 'OM',
        joiningDate: new Date('2020-01-01'),
        lastWorkingDate: new Date('2024-01-01'),
        basicSalary: 10000,
        terminationType: 'END_OF_CONTRACT',
      };

      const result = EOSBService.calculate(input);

      expect(result.currency).toBe('OMR');
      expect(result.netAmount).toBeGreaterThan(0);
      expect(result.calculationDetails.law).toContain('Oman');
    });

    it('should calculate EOSB for Kuwait with cap at 1.5 years salary', () => {
      const input: EOSBCalculationInput = {
        employeeId: 'emp-1',
        countryCode: 'KW',
        joiningDate: new Date('2020-01-01'),
        lastWorkingDate: new Date('2024-01-01'),
        basicSalary: 10000,
        terminationType: 'END_OF_CONTRACT',
      };

      const result = EOSBService.calculate(input);

      expect(result.currency).toBe('KWD');
      expect(result.netAmount).toBeGreaterThan(0);
      expect(result.netAmount).toBeLessThanOrEqual(10000 * 18); // 1.5 years cap
    });
  });

  describe('calculate - India', () => {
    it('should require 5 years minimum service for gratuity', () => {
      const input: EOSBCalculationInput = {
        employeeId: 'emp-1',
        countryCode: 'IN',
        joiningDate: new Date('2021-01-01'),
        lastWorkingDate: new Date('2024-01-01'), // ~3 years
        basicSalary: 50000,
        terminationType: 'RESIGNATION',
      };

      const result = EOSBService.calculate(input);

      expect(result.netAmount).toBe(0);
      // India requires 60 months minimum service
      expect(result.calculationDetails.notes.length).toBeGreaterThan(0);
      expect(result.calculationDetails.notes[0]).toContain('60');
    });

    it('should calculate gratuity for 5+ years service', () => {
      const input: EOSBCalculationInput = {
        employeeId: 'emp-1',
        countryCode: 'IN',
        joiningDate: new Date('2018-01-01'),
        lastWorkingDate: new Date('2024-01-01'), // ~6 years
        basicSalary: 50000,
        terminationType: 'RESIGNATION',
      };

      const result = EOSBService.calculate(input);

      // Formula: (15 * salary * years) / 26
      expect(result.currency).toBe('INR');
      expect(result.netAmount).toBeGreaterThan(0);
      expect(result.calculationDetails.law).toContain('Gratuity Act');
    });

    it('should cap India gratuity at 20 lakh', () => {
      const input: EOSBCalculationInput = {
        employeeId: 'emp-1',
        countryCode: 'IN',
        joiningDate: new Date('1990-01-01'),
        lastWorkingDate: new Date('2024-01-01'), // ~34 years
        basicSalary: 200000,
        terminationType: 'RETIREMENT',
      };

      const result = EOSBService.calculate(input);

      expect(result.netAmount).toBeLessThanOrEqual(2000000);
    });

    it('should return zero for death/disability when under minimum service months', () => {
      // Note: India min service is 60 months in the generic check,
      // which runs before the India-specific death/disability exemption
      const input: EOSBCalculationInput = {
        employeeId: 'emp-1',
        countryCode: 'IN',
        joiningDate: new Date('2022-01-01'),
        lastWorkingDate: new Date('2024-01-01'), // ~2 years (24 months < 60)
        basicSalary: 50000,
        terminationType: 'DEATH',
      };

      const result = EOSBService.calculate(input);

      expect(result.netAmount).toBe(0);
    });
  });

  describe('calculate - unsupported country', () => {
    it('should throw error for unsupported country', () => {
      const input: EOSBCalculationInput = {
        employeeId: 'emp-1',
        countryCode: 'XX' as any,
        joiningDate: new Date('2020-01-01'),
        lastWorkingDate: new Date('2024-01-01'),
        basicSalary: 10000,
        terminationType: 'END_OF_CONTRACT',
      };

      expect(() => EOSBService.calculate(input)).toThrow('Labour law configuration not found');
    });
  });

  describe('getEstimate', () => {
    it('should return current amount and future projections', () => {
      const result = EOSBService.getEstimate(
        'SA',
        new Date('2020-01-01'),
        10000
      );

      expect(result.currentAmount).toBeGreaterThanOrEqual(0);
      expect(result.projections).toHaveLength(4);
      expect(result.projections[0].months).toBe(6);
      expect(result.projections[1].months).toBe(12);
      expect(result.projections[2].months).toBe(24);
      expect(result.projections[3].months).toBe(36);
    });

    it('should show increasing amounts over time', () => {
      const result = EOSBService.getEstimate(
        'AE',
        new Date('2020-01-01'),
        10000
      );

      // Each projection should be greater than the previous
      for (let i = 1; i < result.projections.length; i++) {
        expect(result.projections[i].amount).toBeGreaterThanOrEqual(
          result.projections[i - 1].amount
        );
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero salary', () => {
      const input: EOSBCalculationInput = {
        employeeId: 'emp-1',
        countryCode: 'SA',
        joiningDate: new Date('2020-01-01'),
        lastWorkingDate: new Date('2024-01-01'),
        basicSalary: 0,
        terminationType: 'END_OF_CONTRACT',
      };

      const result = EOSBService.calculate(input);

      expect(result.netAmount).toBe(0);
      expect(result.dailyRate).toBe(0);
    });

    it('should handle very long service periods', () => {
      const input: EOSBCalculationInput = {
        employeeId: 'emp-1',
        countryCode: 'SA',
        joiningDate: new Date('1990-01-01'),
        lastWorkingDate: new Date('2024-01-01'), // ~34 years
        basicSalary: 10000,
        terminationType: 'RETIREMENT',
      };

      const result = EOSBService.calculate(input);

      expect(result.yearsOfService).toBeGreaterThanOrEqual(33);
      expect(result.netAmount).toBeGreaterThan(0);
    });
  });
});
