import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EOSBService } from '../eosb.service';
import type { Employee, TerminationReason } from '@/types/employee';

describe('EOSBService - End of Service Benefits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseEmployee: Employee = {
    id: 'emp-1',
    employeeId: 'E001',
    tenantId: 'tenant-1',
    firstName: 'Ahmed',
    lastName: 'Al-Rashid',
    countryCode: 'SA',
    basicSalary: 10000,
    hireDate: new Date('2020-01-01'),
    terminationDate: new Date('2024-01-01'), // 4 years service
  };

  describe('calculateEOSB - Saudi Arabia', () => {
    it('should calculate EOSB for less than 5 years service', () => {
      const employee = {
        ...baseEmployee,
        hireDate: new Date('2021-01-01'),
        terminationDate: new Date('2024-01-01'), // 3 years
      };

      const result = EOSBService.calculateEOSB(employee, 'SA', 'RESIGNATION');

      // First 5 years: half month per year = 1.5 months
      expect(result.yearsOfService).toBe(3);
      expect(result.eligibleMonths).toBe(1.5); // 3 years * 0.5
      expect(result.amount).toBe(15000); // 1.5 * 10,000
      expect(result.calculation).toContain('0.5 months per year');
    });

    it('should calculate EOSB for more than 5 years service', () => {
      const employee = {
        ...baseEmployee,
        hireDate: new Date('2015-01-01'),
        terminationDate: new Date('2024-01-01'), // 9 years
      };

      const result = EOSBService.calculateEOSB(employee, 'SA', 'RESIGNATION');

      // First 5 years: 2.5 months (5 * 0.5)
      // Next 4 years: 4 months (4 * 1)
      // Total: 6.5 months
      expect(result.yearsOfService).toBe(9);
      expect(result.eligibleMonths).toBe(6.5);
      expect(result.amount).toBe(65000); // 6.5 * 10,000
    });

    it('should apply full benefit for termination by employer', () => {
      const employee = {
        ...baseEmployee,
        hireDate: new Date('2021-01-01'),
        terminationDate: new Date('2024-01-01'), // 3 years
      };

      const result = EOSBService.calculateEOSB(employee, 'SA', 'TERMINATION');

      // Full benefit: 3 years * 0.5 = 1.5 months
      expect(result.eligibleMonths).toBe(1.5);
      expect(result.amount).toBe(15000);
      expect(result.deductionPercentage).toBe(0);
    });

    it('should apply 2/3 deduction for resignation before 2 years', () => {
      const employee = {
        ...baseEmployee,
        hireDate: new Date('2023-01-01'),
        terminationDate: new Date('2024-07-01'), // 1.5 years
      };

      const result = EOSBService.calculateEOSB(employee, 'SA', 'RESIGNATION');

      // 1.5 years * 0.5 = 0.75 months, but only 1/3 paid
      expect(result.yearsOfService).toBeCloseTo(1.5, 1);
      expect(result.deductionPercentage).toBe(66.67); // 2/3 deducted
      expect(result.grossAmount).toBe(7500); // 0.75 * 10,000
      expect(result.amount).toBeCloseTo(2500, 0); // 1/3 of 7,500
    });

    it('should apply 1/3 deduction for resignation between 2-5 years', () => {
      const employee = {
        ...baseEmployee,
        hireDate: new Date('2020-01-01'),
        terminationDate: new Date('2024-01-01'), // 4 years
      };

      const result = EOSBService.calculateEOSB(employee, 'SA', 'RESIGNATION');

      // 4 years * 0.5 = 2 months, but 1/3 deducted
      expect(result.yearsOfService).toBe(4);
      expect(result.deductionPercentage).toBe(33.33); // 1/3 deducted
      expect(result.grossAmount).toBe(20000); // 2 * 10,000
      expect(result.amount).toBeCloseTo(13333, 0); // 2/3 of 20,000
    });

    it('should pay full benefit for resignation after 5 years', () => {
      const employee = {
        ...baseEmployee,
        hireDate: new Date('2015-01-01'),
        terminationDate: new Date('2024-01-01'), // 9 years
      };

      const result = EOSBService.calculateEOSB(employee, 'SA', 'RESIGNATION');

      // Full benefit, no deduction after 5 years
      expect(result.deductionPercentage).toBe(0);
      expect(result.amount).toBe(result.grossAmount);
    });

    it('should pay zero for termination due to misconduct', () => {
      const employee = {
        ...baseEmployee,
        hireDate: new Date('2020-01-01'),
        terminationDate: new Date('2024-01-01'),
      };

      const result = EOSBService.calculateEOSB(employee, 'SA', 'MISCONDUCT');

      expect(result.amount).toBe(0);
      expect(result.reason).toContain('No EOSB due to misconduct');
    });

    it('should handle fractional years correctly', () => {
      const employee = {
        ...baseEmployee,
        hireDate: new Date('2020-01-01'),
        terminationDate: new Date('2024-07-01'), // 4.5 years
      };

      const result = EOSBService.calculateEOSB(employee, 'SA', 'TERMINATION');

      expect(result.yearsOfService).toBeCloseTo(4.5, 1);
      expect(result.eligibleMonths).toBeCloseTo(2.25, 2); // 4.5 * 0.5
      expect(result.amount).toBe(22500); // 2.25 * 10,000
    });
  });

  describe('calculateEOSB - UAE', () => {
    it('should calculate EOSB for less than 1 year (no benefit)', () => {
      const employee = {
        ...baseEmployee,
        countryCode: 'AE' as const,
        hireDate: new Date('2023-06-01'),
        terminationDate: new Date('2024-01-01'), // 7 months
      };

      const result = EOSBService.calculateEOSB(employee, 'AE', 'RESIGNATION');

      expect(result.amount).toBe(0);
      expect(result.reason).toContain('Less than 1 year');
    });

    it('should calculate EOSB for 1-5 years (21 days per year)', () => {
      const employee = {
        ...baseEmployee,
        countryCode: 'AE' as const,
        hireDate: new Date('2020-01-01'),
        terminationDate: new Date('2024-01-01'), // 4 years
      };

      const result = EOSBService.calculateEOSB(employee, 'AE', 'RESIGNATION');

      const dailySalary = 10000 / 30; // 333.33
      const expectedAmount = dailySalary * 21 * 4; // 21 days * 4 years

      expect(result.yearsOfService).toBe(4);
      expect(result.eligibleDays).toBe(84); // 21 * 4
      expect(result.amount).toBeCloseTo(expectedAmount, 0);
    });

    it('should calculate EOSB for more than 5 years (30 days per year after 5)', () => {
      const employee = {
        ...baseEmployee,
        countryCode: 'AE' as const,
        hireDate: new Date('2015-01-01'),
        terminationDate: new Date('2024-01-01'), // 9 years
      };

      const result = EOSBService.calculateEOSB(employee, 'AE', 'RESIGNATION');

      const dailySalary = 10000 / 30;
      // First 5 years: 21 days * 5 = 105 days
      // Next 4 years: 30 days * 4 = 120 days
      // Total: 225 days
      const expectedAmount = dailySalary * 225;

      expect(result.eligibleDays).toBe(225);
      expect(result.amount).toBeCloseTo(expectedAmount, 0);
    });

    it('should apply half benefit for resignation before 5 years', () => {
      const employee = {
        ...baseEmployee,
        countryCode: 'AE' as const,
        hireDate: new Date('2020-01-01'),
        terminationDate: new Date('2024-01-01'), // 4 years
      };

      const result = EOSBService.calculateEOSB(employee, 'AE', 'RESIGNATION');

      expect(result.deductionPercentage).toBe(50); // 50% for resignation
      expect(result.amount).toBe(result.grossAmount * 0.5);
    });

    it('should pay full benefit for termination by employer', () => {
      const employee = {
        ...baseEmployee,
        countryCode: 'AE' as const,
        hireDate: new Date('2020-01-01'),
        terminationDate: new Date('2024-01-01'),
      };

      const result = EOSBService.calculateEOSB(employee, 'AE', 'TERMINATION');

      expect(result.deductionPercentage).toBe(0);
      expect(result.amount).toBe(result.grossAmount);
    });
  });

  describe('calculateEOSB - Other GCC Countries', () => {
    it('should calculate EOSB for Kuwait', () => {
      const employee = {
        ...baseEmployee,
        countryCode: 'KW' as const,
        hireDate: new Date('2020-01-01'),
        terminationDate: new Date('2024-01-01'), // 4 years
      };

      const result = EOSBService.calculateEOSB(employee, 'KW', 'RESIGNATION');

      expect(result.yearsOfService).toBe(4);
      expect(result.amount).toBeGreaterThan(0);
    });

    it('should calculate EOSB for Qatar', () => {
      const employee = {
        ...baseEmployee,
        countryCode: 'QA' as const,
        hireDate: new Date('2020-01-01'),
        terminationDate: new Date('2024-01-01'),
      };

      const result = EOSBService.calculateEOSB(employee, 'QA', 'RESIGNATION');

      expect(result.amount).toBeGreaterThan(0);
    });

    it('should calculate EOSB for Bahrain', () => {
      const employee = {
        ...baseEmployee,
        countryCode: 'BH' as const,
        hireDate: new Date('2020-01-01'),
        terminationDate: new Date('2024-01-01'),
      };

      const result = EOSBService.calculateEOSB(employee, 'BH', 'RESIGNATION');

      expect(result.amount).toBeGreaterThan(0);
    });

    it('should calculate EOSB for Oman', () => {
      const employee = {
        ...baseEmployee,
        countryCode: 'OM' as const,
        hireDate: new Date('2020-01-01'),
        terminationDate: new Date('2024-01-01'),
      };

      const result = EOSBService.calculateEOSB(employee, 'OM', 'RESIGNATION');

      expect(result.amount).toBeGreaterThan(0);
    });
  });

  describe('calculateServiceYears', () => {
    it('should calculate exact years of service', () => {
      const hireDate = new Date('2020-01-01');
      const terminationDate = new Date('2024-01-01');

      const result = EOSBService.calculateServiceYears(hireDate, terminationDate);

      expect(result.years).toBe(4);
      expect(result.months).toBe(0);
      expect(result.days).toBe(0);
      expect(result.totalYears).toBe(4);
    });

    it('should calculate years with months and days', () => {
      const hireDate = new Date('2020-01-15');
      const terminationDate = new Date('2024-03-20');

      const result = EOSBService.calculateServiceYears(hireDate, terminationDate);

      expect(result.years).toBe(4);
      expect(result.months).toBeGreaterThan(0);
      expect(result.totalYears).toBeGreaterThan(4);
    });

    it('should handle leap years correctly', () => {
      const hireDate = new Date('2020-02-29'); // Leap year
      const terminationDate = new Date('2024-02-29'); // Next leap year

      const result = EOSBService.calculateServiceYears(hireDate, terminationDate);

      expect(result.years).toBe(4);
    });
  });

  describe('estimateEOSBProvision', () => {
    it('should estimate EOSB provision for active employee', () => {
      const employee = {
        ...baseEmployee,
        hireDate: new Date('2020-01-01'),
        terminationDate: undefined, // Active employee
      };

      const result = EOSBService.estimateEOSBProvision(employee, 'SA');

      expect(result.currentServiceYears).toBeGreaterThan(0);
      expect(result.estimatedAmount).toBeGreaterThan(0);
      expect(result.annualProvision).toBeGreaterThan(0);
    });

    it('should calculate provision growth per year', () => {
      const employee = {
        ...baseEmployee,
        hireDate: new Date('2020-01-01'),
      };

      const result = EOSBService.estimateEOSBProvision(employee, 'SA');

      expect(result.nextYearProvision).toBeGreaterThan(result.estimatedAmount);
    });
  });

  describe('getEOSBPolicy', () => {
    it('should return correct policy for Saudi Arabia', () => {
      const policy = EOSBService.getEOSBPolicy('SA');

      expect(policy.country).toBe('SA');
      expect(policy.minimumService).toBe(0);
      expect(policy.firstTierYears).toBe(5);
      expect(policy.firstTierMonths).toBe(0.5);
      expect(policy.secondTierMonths).toBe(1);
    });

    it('should return correct policy for UAE', () => {
      const policy = EOSBService.getEOSBPolicy('AE');

      expect(policy.country).toBe('AE');
      expect(policy.minimumService).toBe(1);
      expect(policy.firstTierDays).toBe(21);
      expect(policy.secondTierDays).toBe(30);
    });
  });

  describe('validateEOSBCalculation', () => {
    it('should validate correct EOSB calculation', () => {
      const calculation = {
        yearsOfService: 4,
        eligibleMonths: 2,
        grossAmount: 20000,
        deductionPercentage: 33.33,
        amount: 13333,
      };

      const result = EOSBService.validateEOSBCalculation(calculation, 'SA', 10000);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect incorrect calculations', () => {
      const calculation = {
        yearsOfService: 4,
        eligibleMonths: 10, // Too high for 4 years
        grossAmount: 100000,
        deductionPercentage: 0,
        amount: 100000,
      };

      const result = EOSBService.validateEOSBCalculation(calculation, 'SA', 10000);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle employee with no termination date', () => {
      const employee = {
        ...baseEmployee,
        terminationDate: undefined,
      };

      const result = EOSBService.calculateEOSB(employee, 'SA', 'RESIGNATION');

      // Should use current date as termination date
      expect(result.amount).toBeGreaterThan(0);
    });

    it('should handle zero salary', () => {
      const employee = {
        ...baseEmployee,
        basicSalary: 0,
      };

      const result = EOSBService.calculateEOSB(employee, 'SA', 'RESIGNATION');

      expect(result.amount).toBe(0);
    });

    it('should round to 2 decimal places', () => {
      const employee = {
        ...baseEmployee,
        basicSalary: 10333.33,
        hireDate: new Date('2020-01-01'),
        terminationDate: new Date('2024-01-01'),
      };

      const result = EOSBService.calculateEOSB(employee, 'SA', 'TERMINATION');

      expect(result.amount).toBe(Math.round(result.amount * 100) / 100);
    });

    it('should handle very long service periods', () => {
      const employee = {
        ...baseEmployee,
        hireDate: new Date('1990-01-01'),
        terminationDate: new Date('2024-01-01'), // 34 years
      };

      const result = EOSBService.calculateEOSB(employee, 'SA', 'RETIREMENT');

      expect(result.yearsOfService).toBe(34);
      expect(result.amount).toBeGreaterThan(0);
    });
  });
});
