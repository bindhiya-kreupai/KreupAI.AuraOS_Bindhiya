import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PayrollService } from '../payroll.service';
import type { Employee, TaxRegime } from '@/types/employee';

describe('Tax Service (India TDS Calculations)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseEmployee: Employee = {
    id: 'emp-1',
    employeeId: 'E001',
    tenantId: 'tenant-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    countryCode: 'IN' as const,
    nationality: 'Indian',
    dateOfBirth: new Date('1990-01-01'),
    gender: 'MALE' as const,
    maritalStatus: 'MARRIED' as const,
    hireDate: new Date('2020-01-01'),
    status: 'ACTIVE' as const,
    workEmail: 'john.doe@company.com',
    taxRegime: 'NEW' as const,
    basicSalary: 100000,
    lopDays: 0,
    paidLeaveDays: 0,
    unpaidLeaveDays: 0,
    salaryStructure: {
      basicSalary: 100000,
      components: [
        {
          componentCode: 'HRA',
          nameEn: 'House Rent Allowance',
          nameAr: 'بدل السكن',
          type: 'EARNING' as const,
          calculationType: 'PERCENTAGE' as const,
          percentage: 40,
          amount: 0,
          isTaxable: true,
          isStatutory: false,
          category: 'ALLOWANCE' as const,
        },
        {
          componentCode: 'DA',
          nameEn: 'Dearness Allowance',
          nameAr: 'بدل غلاء المعيشة',
          type: 'EARNING' as const,
          calculationType: 'PERCENTAGE' as const,
          percentage: 20,
          amount: 0,
          isTaxable: true,
          isStatutory: false,
          category: 'ALLOWANCE' as const,
        },
      ],
    },
    bankAccount: {
      bankName: 'HDFC Bank',
      accountNumber: '1234567890',
      ifscCode: 'HDFC0001234',
    },
  };

  describe('Tax Regime Selection and Validation', () => {
    it('should use NEW regime when specified', async () => {
      const employee = { ...baseEmployee, taxRegime: 'NEW' as TaxRegime };

      const payslip = await PayrollService.calculatePayslip(employee, 'IN', '2024-01', 'INR');

      expect(payslip.taxDetails?.regime).toBe('NEW');
      expect(payslip.taxDetails?.totalExemptions).toBe(0); // No exemptions in new regime
    });

    it('should use OLD regime when specified', async () => {
      const employee = {
        ...baseEmployee,
        taxRegime: 'OLD' as TaxRegime,
        section80C: 150000,
        section80D: 25000,
      };

      const payslip = await PayrollService.calculatePayslip(employee, 'IN', '2024-01', 'INR');

      expect(payslip.taxDetails?.regime).toBe('OLD');
      expect(payslip.taxDetails?.totalExemptions).toBeGreaterThan(0);
    });

    it('should default to NEW regime if not specified', async () => {
      const employee = { ...baseEmployee, taxRegime: undefined };

      const payslip = await PayrollService.calculatePayslip(employee, 'IN', '2024-01', 'INR');

      expect(payslip.taxDetails?.regime).toBe('NEW');
    });
  });

  describe('Tax Slab Calculations - NEW Regime', () => {
    it('should calculate zero tax for income up to 3L', async () => {
      const employee = {
        ...baseEmployee,
        taxRegime: 'NEW' as TaxRegime,
        salaryStructure: {
          basicSalary: 20000, // Annual: 240,000
          components: [],
        },
      };

      const payslip = await PayrollService.calculatePayslip(employee, 'IN', '2024-01', 'INR');

      expect(payslip.taxDetails?.taxBeforeRebate).toBe(0);
      expect(payslip.taxDetails?.finalTax).toBe(0);
    });

    it('should calculate 5% tax for income between 3L-6L', async () => {
      const employee = {
        ...baseEmployee,
        taxRegime: 'NEW' as TaxRegime,
        salaryStructure: {
          basicSalary: 40000, // Annual: 480,000 (4.8L)
          components: [],
        },
      };

      const payslip = await PayrollService.calculatePayslip(employee, 'IN', '2024-01', 'INR');

      // Tax on 180,000 (480,000 - 300,000) @ 5% = 9,000
      // Plus cess 4% = 9,360
      expect(payslip.taxDetails?.taxBeforeRebate).toBeGreaterThan(0);
      expect(payslip.taxDetails?.taxBeforeRebate).toBeLessThan(15000);
    });

    it('should calculate correct tax for income above 15L', async () => {
      const employee = {
        ...baseEmployee,
        taxRegime: 'NEW' as TaxRegime,
        salaryStructure: {
          basicSalary: 150000, // Annual: 1,800,000 (18L)
          components: [],
        },
      };

      const payslip = await PayrollService.calculatePayslip(employee, 'IN', '2024-01', 'INR');

      // Should have tax in highest slabs (20% and 30%)
      expect(payslip.taxDetails?.taxBeforeRebate).toBeGreaterThan(100000);
    });
  });

  describe('Exemption Calculations - OLD Regime', () => {
    it('should apply 80C deduction up to 150,000 limit', async () => {
      const employee = {
        ...baseEmployee,
        taxRegime: 'OLD' as TaxRegime,
        section80C: 200000, // Exceeds limit
      };

      const payslip = await PayrollService.calculatePayslip(employee, 'IN', '2024-01', 'INR');

      expect(payslip.taxDetails?.exemptions?.section80C).toBe(150000); // Capped at limit
    });

    it('should apply 80D medical insurance deduction', async () => {
      const employee = {
        ...baseEmployee,
        taxRegime: 'OLD' as TaxRegime,
        section80D: 30000,
      };

      const payslip = await PayrollService.calculatePayslip(employee, 'IN', '2024-01', 'INR');

      expect(payslip.taxDetails?.exemptions?.section80D).toBe(25000); // Capped at limit
    });

    it('should calculate HRA exemption correctly', async () => {
      const employee = {
        ...baseEmployee,
        taxRegime: 'OLD' as TaxRegime,
        hraDetails: {
          rentPaid: 30000,
          cityType: 'METRO' as const,
        },
        salaryStructure: {
          basicSalary: 100000,
          components: [
            {
              componentCode: 'HRA',
              nameEn: 'House Rent Allowance',
              nameAr: 'بدل السكن',
              type: 'EARNING' as const,
              calculationType: 'PERCENTAGE' as const,
              percentage: 40,
              amount: 0,
              isTaxable: true,
              isStatutory: false,
              category: 'ALLOWANCE' as const,
            },
          ],
        },
      };

      const payslip = await PayrollService.calculatePayslip(employee, 'IN', '2024-01', 'INR');

      expect(payslip.taxDetails?.exemptions?.hra).toBeGreaterThan(0);
      expect(payslip.taxDetails?.exemptions?.hra).toBeLessThanOrEqual(40000); // HRA amount
    });

    it('should combine multiple exemptions correctly', async () => {
      const employee = {
        ...baseEmployee,
        taxRegime: 'OLD' as TaxRegime,
        section80C: 150000,
        section80D: 25000,
        hraDetails: {
          rentPaid: 20000,
          cityType: 'NON_METRO' as const,
        },
      };

      const payslip = await PayrollService.calculatePayslip(employee, 'IN', '2024-01', 'INR');

      const totalExemptions = payslip.taxDetails?.totalExemptions || 0;
      expect(totalExemptions).toBeGreaterThan(150000); // At least 80C
      expect(totalExemptions).toBeLessThanOrEqual(200000); // Combined limit check
    });
  });

  describe('Rebate 87A Application', () => {
    it('should apply 87A rebate for eligible income (under 5L in OLD regime)', async () => {
      const employee = {
        ...baseEmployee,
        taxRegime: 'OLD' as TaxRegime,
        salaryStructure: {
          basicSalary: 40000, // Annual: 480,000
          components: [],
        },
      };

      const payslip = await PayrollService.calculatePayslip(employee, 'IN', '2024-01', 'INR');

      expect(payslip.taxDetails?.rebate87A).toBeGreaterThan(0);
      expect(payslip.taxDetails?.rebate87A).toBeLessThanOrEqual(12500);
    });

    it('should apply 87A rebate for eligible income (under 7L in NEW regime)', async () => {
      const employee = {
        ...baseEmployee,
        taxRegime: 'NEW' as TaxRegime,
        salaryStructure: {
          basicSalary: 50000, // Annual: 600,000 (6L)
          components: [],
        },
      };

      const payslip = await PayrollService.calculatePayslip(employee, 'IN', '2024-01', 'INR');

      expect(payslip.taxDetails?.rebate87A).toBeGreaterThan(0);
      expect(payslip.taxDetails?.rebate87A).toBeLessThanOrEqual(25000);
    });

    it('should not apply 87A rebate for high income', async () => {
      const employee = {
        ...baseEmployee,
        taxRegime: 'NEW' as TaxRegime,
        salaryStructure: {
          basicSalary: 100000, // Annual: 1,200,000 (12L)
          components: [],
        },
      };

      const payslip = await PayrollService.calculatePayslip(employee, 'IN', '2024-01', 'INR');

      expect(payslip.taxDetails?.rebate87A).toBe(0);
    });
  });

  describe('Surcharge Calculations', () => {
    it('should apply 10% surcharge for income between 50L-1Cr', async () => {
      const employee = {
        ...baseEmployee,
        taxRegime: 'NEW' as TaxRegime,
        salaryStructure: {
          basicSalary: 500000, // Annual: 6,000,000 (60L)
          components: [],
        },
      };

      const payslip = await PayrollService.calculatePayslip(employee, 'IN', '2024-01', 'INR');

      expect(payslip.taxDetails?.surcharge).toBeGreaterThan(0);
      expect(payslip.taxDetails?.surchargeRate).toBe(10);
    });

    it('should not apply surcharge for income below 50L', async () => {
      const employee = {
        ...baseEmployee,
        taxRegime: 'NEW' as TaxRegime,
        salaryStructure: {
          basicSalary: 100000, // Annual: 1,200,000 (12L)
          components: [],
        },
      };

      const payslip = await PayrollService.calculatePayslip(employee, 'IN', '2024-01', 'INR');

      expect(payslip.taxDetails?.surcharge).toBe(0);
      expect(payslip.taxDetails?.surchargeRate).toBe(0);
    });
  });

  describe('Health & Education Cess', () => {
    it('should apply 4% cess on tax + surcharge', async () => {
      const employee = {
        ...baseEmployee,
        taxRegime: 'NEW' as TaxRegime,
        salaryStructure: {
          basicSalary: 100000, // Annual: 1,200,000
          components: [],
        },
      };

      const payslip = await PayrollService.calculatePayslip(employee, 'IN', '2024-01', 'INR');

      const taxBeforeCess = (payslip.taxDetails?.taxBeforeRebate || 0) - (payslip.taxDetails?.rebate87A || 0);
      const expectedCess = taxBeforeCess * 0.04;

      expect(payslip.taxDetails?.cess).toBeCloseTo(expectedCess, 0);
    });
  });

  describe('Monthly TDS Calculations', () => {
    it('should calculate monthly TDS from annual tax', async () => {
      const employee = {
        ...baseEmployee,
        taxRegime: 'NEW' as TaxRegime,
        salaryStructure: {
          basicSalary: 100000, // Annual: 1,200,000
          components: [],
        },
      };

      const payslip = await PayrollService.calculatePayslip(employee, 'IN', '2024-01', 'INR');

      const monthlyTax = payslip.deductions.find((d) => d.componentCode === 'TDS')?.calculatedAmount || 0;
      const annualTax = payslip.taxDetails?.finalTax || 0;

      expect(monthlyTax).toBeCloseTo(annualTax / 12, 0);
    });

    it('should calculate zero monthly TDS when annual tax is zero', async () => {
      const employee = {
        ...baseEmployee,
        taxRegime: 'NEW' as TaxRegime,
        salaryStructure: {
          basicSalary: 20000, // Annual: 240,000 (below exemption)
          components: [],
        },
      };

      const payslip = await PayrollService.calculatePayslip(employee, 'IN', '2024-01', 'INR');

      const monthlyTax = payslip.deductions.find((d) => d.componentCode === 'TDS')?.calculatedAmount || 0;
      expect(monthlyTax).toBe(0);
    });
  });

  describe('YTD Tax Tracking', () => {
    it('should include YTD tax paid in tax details', async () => {
      const employee = {
        ...baseEmployee,
        taxRegime: 'NEW' as TaxRegime,
        ytdTaxPaid: 50000, // Already paid 50k this year
      };

      const payslip = await PayrollService.calculatePayslip(employee, 'IN', '2024-06', 'INR');

      expect(payslip.taxDetails?.ytdTaxPaid).toBe(50000);
    });

    it('should calculate remaining tax for the year', async () => {
      const employee = {
        ...baseEmployee,
        taxRegime: 'NEW' as TaxRegime,
        salaryStructure: {
          basicSalary: 100000, // Annual: 1,200,000
          components: [],
        },
        ytdTaxPaid: 60000, // Already paid 60k
      };

      const payslip = await PayrollService.calculatePayslip(employee, 'IN', '2024-06', 'INR');

      const annualTax = payslip.taxDetails?.finalTax || 0;
      const remainingTax = annualTax - 60000;

      expect(payslip.taxDetails?.remainingTax).toBeCloseTo(remainingTax, 0);
      expect(payslip.taxDetails?.remainingTax).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases and Validation', () => {
    it('should handle zero income correctly', async () => {
      const employee = {
        ...baseEmployee,
        taxRegime: 'NEW' as TaxRegime,
        salaryStructure: {
          basicSalary: 0,
          components: [],
        },
      };

      const payslip = await PayrollService.calculatePayslip(employee, 'IN', '2024-01', 'INR');

      expect(payslip.taxDetails?.taxableIncome).toBe(0);
      expect(payslip.taxDetails?.finalTax).toBe(0);
    });

    it('should round tax amounts correctly', async () => {
      const employee = {
        ...baseEmployee,
        taxRegime: 'NEW' as TaxRegime,
        salaryStructure: {
          basicSalary: 100000,
          components: [],
        },
      };

      const payslip = await PayrollService.calculatePayslip(employee, 'IN', '2024-01', 'INR');

      // Tax should be rounded to nearest rupee
      expect(payslip.taxDetails?.finalTax).toBe(Math.round(payslip.taxDetails?.finalTax || 0));
    });

    it('should handle negative exemptions gracefully', async () => {
      const employee = {
        ...baseEmployee,
        taxRegime: 'OLD' as TaxRegime,
        section80C: -10000, // Invalid negative value
      };

      const payslip = await PayrollService.calculatePayslip(employee, 'IN', '2024-01', 'INR');

      // Should treat as zero or handle gracefully
      expect(payslip.taxDetails?.exemptions?.section80C).toBeGreaterThanOrEqual(0);
    });
  });
});
