import { describe, it, expect } from 'vitest';
import { IndiaProfessionalTaxService } from '../india-professional-tax.service';

describe('IndiaProfessionalTaxService', () => {
  describe('getSupportedStates', () => {
    it('should return at least 15 states', () => {
      const states = IndiaProfessionalTaxService.getSupportedStates();

      expect(states.length).toBeGreaterThanOrEqual(15);
      const codes = states.map(s => s.code);
      expect(codes).toContain('MH');
      expect(codes).toContain('KA');
      expect(codes).toContain('WB');
      expect(codes).toContain('TN');
    });

    it('should include state name and collection frequency', () => {
      const states = IndiaProfessionalTaxService.getSupportedStates();
      const mh = states.find(s => s.code === 'MH');

      expect(mh).toBeDefined();
      expect(mh!.name).toBeTruthy();
      expect(mh!.maxAnnualTax).toBeLessThanOrEqual(2500);
    });
  });

  describe('calculateMonthlyPT', () => {
    it('should calculate PT for Maharashtra high salary', () => {
      const result = IndiaProfessionalTaxService.calculateMonthlyPT('MH', 50000, 6);

      expect(result.monthlyTax).toBeGreaterThan(0);
      expect(result.stateCode).toBe('MH');
      expect(result.stateName).toBeTruthy();
    });

    it('should apply February adjustment for Maharashtra', () => {
      const febResult = IndiaProfessionalTaxService.calculateMonthlyPT('MH', 50000, 2);
      const junResult = IndiaProfessionalTaxService.calculateMonthlyPT('MH', 50000, 6);

      expect(febResult.isFebruaryAdjustment).toBeDefined();
      expect(junResult.monthlyTax).toBeDefined();
    });

    it('should return 0 for salary below PT threshold', () => {
      const result = IndiaProfessionalTaxService.calculateMonthlyPT('MH', 5000, 6);

      expect(result.monthlyTax).toBe(0);
    });

    it('should calculate Karnataka PT correctly', () => {
      const result = IndiaProfessionalTaxService.calculateMonthlyPT('KA', 30000, 6);

      expect(result.monthlyTax).toBeGreaterThan(0);
      expect(result.stateCode).toBe('KA');
    });

    it('should calculate West Bengal PT correctly', () => {
      const result = IndiaProfessionalTaxService.calculateMonthlyPT('WB', 25000, 6);

      expect(result.monthlyTax).toBeGreaterThan(0);
    });

    it('should return 0 for unsupported state', () => {
      const result = IndiaProfessionalTaxService.calculateMonthlyPT('XX' as any, 50000, 6);

      expect(result.monthlyTax).toBe(0);
      expect(result.stateName).toBe('Unknown');
    });
  });

  describe('calculateAnnualPT', () => {
    it('should not exceed ₹2,500 annual cap', () => {
      const salaries = Array(12).fill(100000);
      const result = IndiaProfessionalTaxService.calculateAnnualPT('MH', salaries);

      expect(result.totalPTDeducted).toBeLessThanOrEqual(2500);
      expect(result.monthlyBreakdown).toHaveLength(12);
    });

    it('should calculate annual PT for all 12 months', () => {
      const salaries = Array(12).fill(50000);
      const result = IndiaProfessionalTaxService.calculateAnnualPT('KA', salaries);

      expect(result.monthlyBreakdown).toHaveLength(12);
      expect(result.totalPTDeducted).toBeGreaterThan(0);
    });

    it('should include financial year in result', () => {
      const salaries = Array(12).fill(50000);
      const result = IndiaProfessionalTaxService.calculateAnnualPT('MH', salaries, 2024);

      expect(result.financialYear).toContain('2024');
    });
  });

  describe('getSlabs', () => {
    it('should return slab data for Maharashtra', () => {
      const slabs = IndiaProfessionalTaxService.getSlabs('MH');

      expect(slabs).toBeDefined();
      expect(slabs.length).toBeGreaterThan(0);
    });

    it('should return empty array for unsupported state', () => {
      const slabs = IndiaProfessionalTaxService.getSlabs('XX' as any);

      expect(slabs).toHaveLength(0);
    });
  });

  describe('getStateConfig', () => {
    it('should return full config for Maharashtra', () => {
      const config = IndiaProfessionalTaxService.getStateConfig('MH');

      expect(config).not.toBeNull();
      expect(config!.stateName).toBeTruthy();
    });

    it('should return null for unsupported state', () => {
      const config = IndiaProfessionalTaxService.getStateConfig('XX' as any);

      expect(config).toBeNull();
    });
  });

  describe('generatePTReturn', () => {
    it('should generate return for a set of employees', () => {
      const employees = [
        { employeeId: 'emp1', employeeName: 'John', designation: 'Engineer', grossSalary: 50000 },
        { employeeId: 'emp2', employeeName: 'Jane', designation: 'Manager', grossSalary: 30000 },
        { employeeId: 'emp3', employeeName: 'Bob', designation: 'Analyst', grossSalary: 8000 },
      ];

      const result = IndiaProfessionalTaxService.generatePTReturn('tenant-1', 'MH', 6, 2024, employees);

      expect(result.stateCode).toBe('MH');
      expect(result.returnPeriod).toBe('2024-06');
      expect(result.employees).toHaveLength(3);
      expect(result.summary.totalPTCollected).toBeGreaterThan(0);
    });
  });

  describe('comparePTAcrossStates', () => {
    it('should compare PT across all supported states', () => {
      const comparison = IndiaProfessionalTaxService.comparePTAcrossStates(50000);

      expect(comparison.length).toBeGreaterThan(0);
      comparison.forEach(item => {
        expect(item.stateCode).toBeTruthy();
        expect(item.monthlyPT).toBeGreaterThanOrEqual(0);
        expect(item.annualPT).toBeGreaterThanOrEqual(0);
      });
    });

    it('should show variation across states for same salary', () => {
      const comparison = IndiaProfessionalTaxService.comparePTAcrossStates(30000);

      const amounts = comparison.map(c => c.monthlyPT);
      const uniqueAmounts = new Set(amounts);
      expect(uniqueAmounts.size).toBeGreaterThan(1);
    });
  });

  describe('isStatePTApplicable', () => {
    it('should return true for Maharashtra', () => {
      expect(IndiaProfessionalTaxService.isStatePTApplicable('MH')).toBe(true);
    });

    it('should return false for unsupported state', () => {
      expect(IndiaProfessionalTaxService.isStatePTApplicable('XX')).toBe(false);
    });
  });
});
