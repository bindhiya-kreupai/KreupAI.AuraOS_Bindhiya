import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GOSIService } from '../gosi.service';
import type { Employee } from '@/types/employee';

describe('GOSIService - Saudi Arabia Social Insurance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const saudiEmployee: Employee = {
    id: 'emp-1',
    employeeId: 'E001',
    tenantId: 'tenant-1',
    firstName: 'Ahmed',
    lastName: 'Al-Rashid',
    nationality: 'Saudi',
    countryCode: 'SA',
    basicSalary: 10000,
    isSaudi: true,
    nationalId: '1234567890',
  };

  const nonSaudiEmployee: Employee = {
    id: 'emp-2',
    employeeId: 'E002',
    tenantId: 'tenant-1',
    firstName: 'John',
    lastName: 'Smith',
    nationality: 'American',
    countryCode: 'SA',
    basicSalary: 10000,
    isSaudi: false,
    iqamaNumber: '2234567890',
  };

  describe('calculateContributions', () => {
    it('should calculate GOSI for Saudi employee correctly', () => {
      const result = GOSIService.calculateContributions(saudiEmployee, 10000);

      // Saudi: 9% employee + 12% employer (21% total on contributable salary)
      expect(result.employeeContribution).toBe(900); // 9% of 10,000
      expect(result.employerContribution).toBe(1200); // 12% of 10,000
      expect(result.totalContribution).toBe(2100);
      expect(result.contributableSalary).toBe(10000);
    });

    it('should calculate GOSI for non-Saudi employee correctly', () => {
      const result = GOSIService.calculateContributions(nonSaudiEmployee, 10000);

      // Non-Saudi: 0% employee + 2% employer (occupational hazards only)
      expect(result.employeeContribution).toBe(0);
      expect(result.employerContribution).toBe(200); // 2% of 10,000
      expect(result.totalContribution).toBe(200);
      expect(result.contributableSalary).toBe(10000);
    });

    it('should cap contributable salary at maximum limit', () => {
      const highSalaryEmployee = { ...saudiEmployee, basicSalary: 50000 };
      const result = GOSIService.calculateContributions(highSalaryEmployee, 50000);

      // GOSI max salary cap is 45,000 SAR
      expect(result.contributableSalary).toBe(45000);
      expect(result.employeeContribution).toBe(4050); // 9% of 45,000
      expect(result.employerContribution).toBe(5400); // 12% of 45,000
    });

    it('should handle minimum salary threshold', () => {
      const lowSalaryEmployee = { ...saudiEmployee, basicSalary: 500 };
      const result = GOSIService.calculateContributions(lowSalaryEmployee, 500);

      // Minimum wage for GOSI is 1,500 SAR
      expect(result.contributableSalary).toBe(1500);
      expect(result.employeeContribution).toBe(135); // 9% of 1,500
      expect(result.employerContribution).toBe(180); // 12% of 1,500
    });

    it('should include occupational hazards for all employees', () => {
      const result = GOSIService.calculateContributions(saudiEmployee, 10000);

      expect(result.breakdown.occupationalHazards).toBeDefined();
      expect(result.breakdown.occupationalHazards.rate).toBe(2); // 2%
      expect(result.breakdown.occupationalHazards.amount).toBe(200);
    });

    it('should calculate annuities for Saudi employees only', () => {
      const saudiResult = GOSIService.calculateContributions(saudiEmployee, 10000);
      const nonSaudiResult = GOSIService.calculateContributions(nonSaudiEmployee, 10000);

      expect(saudiResult.breakdown.annuities).toBeDefined();
      expect(saudiResult.breakdown.annuities.employeeRate).toBe(9);
      expect(saudiResult.breakdown.annuities.employerRate).toBe(9);

      expect(nonSaudiResult.breakdown.annuities).toBeUndefined();
    });

    it('should calculate unemployment insurance for Saudis (SANED)', () => {
      const result = GOSIService.calculateContributions(saudiEmployee, 10000);

      expect(result.breakdown.unemployment).toBeDefined();
      expect(result.breakdown.unemployment.employeeRate).toBe(1); // 1%
      expect(result.breakdown.unemployment.employerRate).toBe(1); // 1%
      expect(result.breakdown.unemployment.totalAmount).toBe(200); // 2% of 10,000
    });

    it('should exclude allowances from GOSI calculation if configured', () => {
      const employeeWithAllowances = {
        ...saudiEmployee,
        basicSalary: 10000,
        housingAllowance: 2000,
        transportAllowance: 1000,
      };

      // GOSI typically calculated on basic + HRA only
      const result = GOSIService.calculateContributions(
        employeeWithAllowances,
        12000, // Basic + Housing
        { includeAllowances: false }
      );

      expect(result.contributableSalary).toBe(12000);
    });
  });

  describe('getContributionBreakdown', () => {
    it('should provide detailed breakdown for Saudi employee', () => {
      const result = GOSIService.getContributionBreakdown(saudiEmployee, 10000);

      expect(result).toHaveProperty('annuities');
      expect(result).toHaveProperty('occupationalHazards');
      expect(result).toHaveProperty('unemployment');
      expect(result.annuities.employeeAmount).toBe(900); // 9%
      expect(result.annuities.employerAmount).toBe(900); // 9%
      expect(result.occupationalHazards.amount).toBe(200); // 2%
      expect(result.unemployment.totalAmount).toBe(200); // 2%
    });

    it('should show zero employee contribution for non-Saudi', () => {
      const result = GOSIService.getContributionBreakdown(nonSaudiEmployee, 10000);

      expect(result.annuities).toBeUndefined();
      expect(result.unemployment).toBeUndefined();
      expect(result.occupationalHazards.amount).toBe(200);
    });
  });

  describe('validateGOSIEligibility', () => {
    it('should validate Saudi employee is eligible', () => {
      const result = GOSIService.validateGOSIEligibility(saudiEmployee);

      expect(result.isEligible).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate non-Saudi employee is eligible', () => {
      const result = GOSIService.validateGOSIEligibility(nonSaudiEmployee);

      expect(result.isEligible).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require national ID for Saudi employees', () => {
      const employeeWithoutID = { ...saudiEmployee, nationalId: undefined };
      const result = GOSIService.validateGOSIEligibility(employeeWithoutID);

      expect(result.isEligible).toBe(false);
      expect(result.errors).toContain('National ID is required for Saudi employees');
    });

    it('should require Iqama for non-Saudi employees', () => {
      const employeeWithoutIqama = { ...nonSaudiEmployee, iqamaNumber: undefined };
      const result = GOSIService.validateGOSIEligibility(employeeWithoutIqama);

      expect(result.isEligible).toBe(false);
      expect(result.errors).toContain('Iqama number is required for non-Saudi employees');
    });

    it('should require valid salary', () => {
      const employeeWithoutSalary = { ...saudiEmployee, basicSalary: 0 };
      const result = GOSIService.validateGOSIEligibility(employeeWithoutSalary);

      expect(result.isEligible).toBe(false);
      expect(result.errors).toContain('Valid salary is required');
    });
  });

  describe('generateGOSIReport', () => {
    it('should generate monthly GOSI report for all employees', () => {
      const employees = [saudiEmployee, nonSaudiEmployee];
      const result = GOSIService.generateGOSIReport(employees, '2024-06');

      expect(result.month).toBe('2024-06');
      expect(result.totalEmployees).toBe(2);
      expect(result.saudiEmployees).toBe(1);
      expect(result.nonSaudiEmployees).toBe(1);
      expect(result.totalEmployeeContribution).toBe(900); // Only Saudi employee
      expect(result.totalEmployerContribution).toBe(1400); // 1200 (Saudi) + 200 (Non-Saudi)
    });

    it('should group contributions by nationality', () => {
      const employees = [
        saudiEmployee,
        { ...saudiEmployee, id: 'emp-3' },
        nonSaudiEmployee,
      ];
      const result = GOSIService.generateGOSIReport(employees, '2024-06');

      expect(result.bySaudiNationality.count).toBe(2);
      expect(result.bySaudiNationality.totalContribution).toBe(4200); // 2100 * 2
      expect(result.byNonSaudi.count).toBe(1);
      expect(result.byNonSaudi.totalContribution).toBe(200);
    });

    it('should calculate total contributable wages', () => {
      const employees = [saudiEmployee, nonSaudiEmployee];
      const result = GOSIService.generateGOSIReport(employees, '2024-06');

      expect(result.totalContributableWages).toBe(20000); // 10,000 + 10,000
    });
  });

  describe('calculateProration', () => {
    it('should prorate GOSI for partial month (new joiner)', () => {
      const joinDate = new Date('2024-06-15'); // Joined mid-month
      const monthDays = 30;
      const workedDays = 15;

      const result = GOSIService.calculateProratedContribution(
        saudiEmployee,
        10000,
        joinDate,
        workedDays,
        monthDays
      );

      // Pro-rate: (10000 * 15/30) = 5000 contributable
      expect(result.contributableSalary).toBe(5000);
      expect(result.employeeContribution).toBe(450); // 9% of 5,000
      expect(result.employerContribution).toBe(600); // 12% of 5,000
    });

    it('should not prorate for full month', () => {
      const joinDate = new Date('2024-06-01');
      const result = GOSIService.calculateProratedContribution(
        saudiEmployee,
        10000,
        joinDate,
        30,
        30
      );

      expect(result.contributableSalary).toBe(10000);
      expect(result.employeeContribution).toBe(900);
    });
  });

  describe('calculateAnnualGOSI', () => {
    it('should calculate annual GOSI contributions', () => {
      const result = GOSIService.calculateAnnualGOSI(saudiEmployee, 10000);

      expect(result.annualEmployeeContribution).toBe(10800); // 900 * 12
      expect(result.annualEmployerContribution).toBe(14400); // 1200 * 12
      expect(result.annualTotalContribution).toBe(25200);
    });

    it('should provide monthly breakdown', () => {
      const result = GOSIService.calculateAnnualGOSI(saudiEmployee, 10000);

      expect(result.monthlyBreakdown).toHaveLength(12);
      expect(result.monthlyBreakdown[0].month).toBe('January');
      expect(result.monthlyBreakdown[0].employeeContribution).toBe(900);
    });
  });

  describe('generateGOSIFile', () => {
    it('should generate GOSI file in required format', () => {
      const employees = [saudiEmployee, nonSaudiEmployee];
      const result = GOSIService.generateGOSIFile(employees, '2024-06');

      expect(result.format).toBe('CSV');
      expect(result.records).toHaveLength(2);
      expect(result.records[0]).toHaveProperty('employeeId');
      expect(result.records[0]).toHaveProperty('nationalId');
      expect(result.records[0]).toHaveProperty('contributableSalary');
      expect(result.records[0]).toHaveProperty('employeeContribution');
      expect(result.records[0]).toHaveProperty('employerContribution');
    });

    it('should validate file data before generation', () => {
      const invalidEmployee = { ...saudiEmployee, nationalId: undefined };

      expect(() => {
        GOSIService.generateGOSIFile([invalidEmployee], '2024-06');
      }).toThrow('Invalid employee data for GOSI file');
    });
  });

  describe('getRatesByYear', () => {
    it('should return current GOSI rates for 2024', () => {
      const rates = GOSIService.getRatesByYear(2024);

      expect(rates.saudi.employee.annuities).toBe(9);
      expect(rates.saudi.employer.annuities).toBe(9);
      expect(rates.saudi.employer.occupationalHazards).toBe(2);
      expect(rates.saudi.employee.unemployment).toBe(1);
      expect(rates.saudi.employer.unemployment).toBe(1);
      expect(rates.nonSaudi.employer.occupationalHazards).toBe(2);
    });

    it('should return historical rates for previous years', () => {
      const rates2020 = GOSIService.getRatesByYear(2020);
      const rates2024 = GOSIService.getRatesByYear(2024);

      // Rates may have changed over years
      expect(rates2020).toBeDefined();
      expect(rates2024).toBeDefined();
    });
  });

  describe('calculateSalaryIncreaseImpact', () => {
    it('should calculate GOSI impact of salary increase', () => {
      const oldSalary = 10000;
      const newSalary = 12000;

      const result = GOSIService.calculateSalaryIncreaseImpact(
        saudiEmployee,
        oldSalary,
        newSalary
      );

      expect(result.oldEmployeeContribution).toBe(900); // 9% of 10,000
      expect(result.newEmployeeContribution).toBe(1080); // 9% of 12,000
      expect(result.employeeIncrease).toBe(180);
      expect(result.oldEmployerContribution).toBe(1200); // 12% of 10,000
      expect(result.newEmployerContribution).toBe(1440); // 12% of 12,000
      expect(result.employerIncrease).toBe(240);
    });

    it('should show percentage increase', () => {
      const result = GOSIService.calculateSalaryIncreaseImpact(
        saudiEmployee,
        10000,
        12000
      );

      expect(result.salaryIncreasePercentage).toBe(20); // 20% increase
      expect(result.employeeContributionIncreasePercentage).toBe(20);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero salary gracefully', () => {
      const result = GOSIService.calculateContributions({ ...saudiEmployee, basicSalary: 0 }, 0);

      // Should apply minimum wage
      expect(result.contributableSalary).toBe(1500);
    });

    it('should handle very high salary with cap', () => {
      const result = GOSIService.calculateContributions(saudiEmployee, 100000);

      expect(result.contributableSalary).toBe(45000); // Capped
      expect(result.employeeContribution).toBe(4050);
      expect(result.employerContribution).toBe(5400);
    });

    it('should round contributions to 2 decimal places', () => {
      const result = GOSIService.calculateContributions(saudiEmployee, 10333.33);

      expect(result.employeeContribution).toBe(Math.round(10333.33 * 0.09 * 100) / 100);
    });
  });
});
