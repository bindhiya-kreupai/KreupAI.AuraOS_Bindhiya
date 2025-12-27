import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PayrollService } from '../payroll.service';
import type { EmployeeSalaryStructure } from '../types';

// Mock external dependencies
vi.mock('../../compliance/gosi.service');
vi.mock('../../compliance/labour-law.service', () => ({
  LabourLawService: {
    getConfig: vi.fn(() => ({
      weekendDays: ['Friday', 'Saturday'],
      maxWorkHours: 48,
      overtimeMultiplier: 1.25,
    })),
  },
}));

describe('Salary Components - Earnings & Deductions', () => {
  const baseEmployee = {
    id: 'emp-1',
    code: 'EMP001',
    name: 'Test Employee',
    department: 'Engineering',
    designation: 'Engineer',
    countryCode: 'SA' as const,
    joiningDate: new Date('2023-01-01'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Salary Calculation', () => {
    it('should calculate basic salary for full month', async () => {
      const salaryStructure: EmployeeSalaryStructure = {
        basicSalary: 10000,
        components: [],
      };

      const employee = { ...baseEmployee, salaryStructure };
      const payslip = await PayrollService.calculatePayslip(employee, 'SA', '2024-01', 'SAR');

      const basic = payslip.earnings.find(e => e.componentCode === 'BASIC');
      expect(basic).toBeDefined();
      expect(basic?.calculatedAmount).toBeGreaterThan(9500); // Allow for some pro-ration
    });

    it('should pro-rate basic salary for LOP days', async () => {
      const salaryStructure: EmployeeSalaryStructure = {
        basicSalary: 10000,
        components: [],
      };

      const employeeWithLOP = {
        ...baseEmployee,
        salaryStructure,
        lopDays: 10,
        paidLeaveDays: 0,
        unpaidLeaveDays: 0,
      };

      const employeeNoLOP = {
        ...baseEmployee,
        salaryStructure,
        lopDays: 0,
      };

      const payslipWithLOP = await PayrollService.calculatePayslip(employeeWithLOP, 'SA', '2024-01', 'SAR');
      const payslipNoLOP = await PayrollService.calculatePayslip(employeeNoLOP, 'SA', '2024-01', 'SAR');

      const basicWithLOP = payslipWithLOP.earnings.find(e => e.componentCode === 'BASIC')?.calculatedAmount || 0;
      const basicNoLOP = payslipNoLOP.earnings.find(e => e.componentCode === 'BASIC')?.calculatedAmount || 0;

      expect(basicWithLOP).toBeLessThan(basicNoLOP);
    });

    it('should not reduce basic for paid leave days', async () => {
      const salaryStructure: EmployeeSalaryStructure = {
        basicSalary: 10000,
        components: [],
      };

      const employeeWithPaidLeave = {
        ...baseEmployee,
        salaryStructure,
        paidLeaveDays: 5,
        lopDays: 0,
        unpaidLeaveDays: 0,
      };

      const employeeNoLeave = {
        ...baseEmployee,
        salaryStructure,
        lopDays: 0,
        paidLeaveDays: 0,
      };

      const payslipWithLeave = await PayrollService.calculatePayslip(employeeWithPaidLeave, 'SA', '2024-01', 'SAR');
      const payslipNoLeave = await PayrollService.calculatePayslip(employeeNoLeave, 'SA', '2024-01', 'SAR');

      const basicWithLeave = payslipWithLeave.earnings.find(e => e.componentCode === 'BASIC')?.calculatedAmount || 0;
      const basicNoLeave = payslipNoLeave.earnings.find(e => e.componentCode === 'BASIC')?.calculatedAmount || 0;

      // Paid leave should not reduce salary
      expect(Math.abs(basicWithLeave - basicNoLeave)).toBeLessThan(10);
    });

    it('should include basic salary rate and days', async () => {
      const salaryStructure: EmployeeSalaryStructure = {
        basicSalary: 10000,
        components: [],
      };

      const employee = { ...baseEmployee, salaryStructure };
      const payslip = await PayrollService.calculatePayslip(employee, 'SA', '2024-01', 'SAR');

      const basic = payslip.earnings.find(e => e.componentCode === 'BASIC');
      expect(basic?.daysOrUnits).toBeDefined();
      expect(basic?.rate).toBeDefined();
      expect(basic?.rate).toBeGreaterThan(0);
    });
  });

  describe('Percentage-Based Components', () => {
    it('should calculate percentage-based allowance correctly', async () => {
      const salaryStructure: EmployeeSalaryStructure = {
        basicSalary: 10000,
        components: [
          {
            componentCode: 'HRA',
            nameEn: 'House Rent Allowance',
            nameAr: 'بدل السكن',
            type: 'EARNING',
            category: 'ALLOWANCE',
            calculationType: 'PERCENTAGE',
            percentage: 40,
            value: 4000,
            isTaxable: true,
          },
        ],
      };

      const employee = { ...baseEmployee, salaryStructure };
      const payslip = await PayrollService.calculatePayslip(employee, 'SA', '2024-01', 'SAR');

      const hra = payslip.earnings.find(e => e.componentCode === 'HRA');
      expect(hra).toBeDefined();
      expect(hra?.calculatedAmount).toBeGreaterThan(0);
      // Should be approximately 40% of prorated basic
    });

    it('should pro-rate percentage-based allowances for LOP', async () => {
      const salaryStructure: EmployeeSalaryStructure = {
        basicSalary: 10000,
        components: [
          {
            componentCode: 'HRA',
            nameEn: 'House Rent Allowance',
            nameAr: 'بدل السكن',
            type: 'EARNING',
            category: 'ALLOWANCE',
            calculationType: 'PERCENTAGE',
            percentage: 40,
            value: 4000,
            isTaxable: true,
          },
        ],
      };

      const employeeWithLOP = {
        ...baseEmployee,
        salaryStructure,
        lopDays: 5,
      };

      const employeeNoLOP = {
        ...baseEmployee,
        salaryStructure,
        lopDays: 0,
      };

      const payslipWithLOP = await PayrollService.calculatePayslip(employeeWithLOP, 'SA', '2024-01', 'SAR');
      const payslipNoLOP = await PayrollService.calculatePayslip(employeeNoLOP, 'SA', '2024-01', 'SAR');

      const hraWithLOP = payslipWithLOP.earnings.find(e => e.componentCode === 'HRA')?.calculatedAmount || 0;
      const hraNoLOP = payslipNoLOP.earnings.find(e => e.componentCode === 'HRA')?.calculatedAmount || 0;

      expect(hraWithLOP).toBeLessThan(hraNoLOP);
    });

    it('should handle multiple percentage-based components', async () => {
      const salaryStructure: EmployeeSalaryStructure = {
        basicSalary: 10000,
        components: [
          {
            componentCode: 'HRA',
            nameEn: 'House Rent Allowance',
            nameAr: 'بدل السكن',
            type: 'EARNING',
            category: 'ALLOWANCE',
            calculationType: 'PERCENTAGE',
            percentage: 40,
            value: 4000,
            isTaxable: true,
          },
          {
            componentCode: 'SPECIAL',
            nameEn: 'Special Allowance',
            nameAr: 'بدل خاص',
            type: 'EARNING',
            category: 'ALLOWANCE',
            calculationType: 'PERCENTAGE',
            percentage: 20,
            value: 2000,
            isTaxable: true,
          },
        ],
      };

      const employee = { ...baseEmployee, salaryStructure };
      const payslip = await PayrollService.calculatePayslip(employee, 'SA', '2024-01', 'SAR');

      const hra = payslip.earnings.find(e => e.componentCode === 'HRA');
      const special = payslip.earnings.find(e => e.componentCode === 'SPECIAL');

      expect(hra).toBeDefined();
      expect(special).toBeDefined();
      expect(hra?.calculatedAmount).toBeGreaterThan(0);
      expect(special?.calculatedAmount).toBeGreaterThan(0);
    });
  });

  describe('Fixed-Value Components', () => {
    it('should calculate fixed-value allowance correctly', async () => {
      const salaryStructure: EmployeeSalaryStructure = {
        basicSalary: 10000,
        components: [
          {
            componentCode: 'TRANSPORT',
            nameEn: 'Transport Allowance',
            nameAr: 'بدل النقل',
            type: 'EARNING',
            category: 'ALLOWANCE',
            calculationType: 'FIXED',
            value: 1000,
            isTaxable: false,
          },
        ],
      };

      const employee = { ...baseEmployee, salaryStructure };
      const payslip = await PayrollService.calculatePayslip(employee, 'SA', '2024-01', 'SAR');

      const transport = payslip.earnings.find(e => e.componentCode === 'TRANSPORT');
      expect(transport).toBeDefined();
      expect(transport?.calculatedAmount).toBeGreaterThan(0);
    });

    it('should pro-rate fixed-value allowances for LOP', async () => {
      const salaryStructure: EmployeeSalaryStructure = {
        basicSalary: 10000,
        components: [
          {
            componentCode: 'TRANSPORT',
            nameEn: 'Transport Allowance',
            nameAr: 'بدل النقل',
            type: 'EARNING',
            category: 'ALLOWANCE',
            calculationType: 'FIXED',
            value: 1000,
            isTaxable: false,
          },
        ],
      };

      const employeeWithLOP = {
        ...baseEmployee,
        salaryStructure,
        lopDays: 10,
      };

      const employeeNoLOP = {
        ...baseEmployee,
        salaryStructure,
        lopDays: 0,
      };

      const payslipWithLOP = await PayrollService.calculatePayslip(employeeWithLOP, 'SA', '2024-01', 'SAR');
      const payslipNoLOP = await PayrollService.calculatePayslip(employeeNoLOP, 'SA', '2024-01', 'SAR');

      const transportWithLOP = payslipWithLOP.earnings.find(e => e.componentCode === 'TRANSPORT')?.calculatedAmount || 0;
      const transportNoLOP = payslipNoLOP.earnings.find(e => e.componentCode === 'TRANSPORT')?.calculatedAmount || 0;

      expect(transportWithLOP).toBeLessThan(transportNoLOP);
    });

    it('should handle multiple fixed-value components', async () => {
      const salaryStructure: EmployeeSalaryStructure = {
        basicSalary: 10000,
        components: [
          {
            componentCode: 'TRANSPORT',
            nameEn: 'Transport Allowance',
            nameAr: 'بدل النقل',
            type: 'EARNING',
            category: 'ALLOWANCE',
            calculationType: 'FIXED',
            value: 1000,
            isTaxable: false,
          },
          {
            componentCode: 'MOBILE',
            nameEn: 'Mobile Allowance',
            nameAr: 'بدل الهاتف',
            type: 'EARNING',
            category: 'ALLOWANCE',
            calculationType: 'FIXED',
            value: 500,
            isTaxable: false,
          },
        ],
      };

      const employee = { ...baseEmployee, salaryStructure };
      const payslip = await PayrollService.calculatePayslip(employee, 'SA', '2024-01', 'SAR');

      const transport = payslip.earnings.find(e => e.componentCode === 'TRANSPORT');
      const mobile = payslip.earnings.find(e => e.componentCode === 'MOBILE');

      expect(transport).toBeDefined();
      expect(mobile).toBeDefined();
      expect(transport?.calculatedAmount).toBeGreaterThan(0);
      expect(mobile?.calculatedAmount).toBeGreaterThan(0);
    });
  });

  describe('Deduction Components', () => {
    it('should calculate percentage-based deduction', async () => {
      const salaryStructure: EmployeeSalaryStructure = {
        basicSalary: 10000,
        components: [
          {
            componentCode: 'INSURANCE',
            nameEn: 'Health Insurance',
            nameAr: 'التأمين الصحي',
            type: 'DEDUCTION',
            category: 'INSURANCE',
            calculationType: 'PERCENTAGE',
            percentage: 5,
            value: 500,
            isTaxable: false,
          },
        ],
      };

      const employee = { ...baseEmployee, salaryStructure };
      const payslip = await PayrollService.calculatePayslip(employee, 'SA', '2024-01', 'SAR');

      const insurance = payslip.deductions.find(d => d.componentCode === 'INSURANCE');
      expect(insurance).toBeDefined();
      expect(insurance?.calculatedAmount).toBeGreaterThan(0);
    });

    it('should calculate fixed-value deduction', async () => {
      const salaryStructure: EmployeeSalaryStructure = {
        basicSalary: 10000,
        components: [
          {
            componentCode: 'UNION_FEE',
            nameEn: 'Union Fee',
            nameAr: 'رسوم النقابة',
            type: 'DEDUCTION',
            category: 'OTHER',
            calculationType: 'FIXED',
            value: 100,
            isTaxable: false,
          },
        ],
      };

      const employee = { ...baseEmployee, salaryStructure };
      const payslip = await PayrollService.calculatePayslip(employee, 'SA', '2024-01', 'SAR');

      const unionFee = payslip.deductions.find(d => d.componentCode === 'UNION_FEE');
      expect(unionFee).toBeDefined();
      expect(unionFee?.calculatedAmount).toBe(100);
    });

    it('should exclude statutory components from regular deductions', async () => {
      const salaryStructure: EmployeeSalaryStructure = {
        basicSalary: 10000,
        components: [
          {
            componentCode: 'PF', // Statutory component
            nameEn: 'Provident Fund',
            nameAr: 'صندوق الادخار',
            type: 'DEDUCTION',
            category: 'STATUTORY',
            calculationType: 'FIXED',
            value: 1200,
            isTaxable: false,
          },
          {
            componentCode: 'LOAN',
            nameEn: 'Loan Recovery',
            nameAr: 'استرداد القرض',
            type: 'DEDUCTION',
            category: 'LOAN_RECOVERY',
            calculationType: 'FIXED',
            value: 500,
            isTaxable: false,
          },
        ],
      };

      const employee = { ...baseEmployee, salaryStructure };
      const payslip = await PayrollService.calculatePayslip(employee, 'SA', '2024-01', 'SAR');

      // PF should not appear in regular deductions (it's statutory)
      const pf = payslip.deductions.find(d => d.componentCode === 'PF');
      expect(pf).toBeUndefined();

      // LOAN should appear in deductions
      const loan = payslip.deductions.find(d => d.componentCode === 'LOAN');
      expect(loan).toBeDefined();
    });

    it('should handle multiple deductions', async () => {
      const salaryStructure: EmployeeSalaryStructure = {
        basicSalary: 10000,
        components: [
          {
            componentCode: 'INSURANCE',
            nameEn: 'Health Insurance',
            nameAr: 'التأمين الصحي',
            type: 'DEDUCTION',
            category: 'INSURANCE',
            calculationType: 'PERCENTAGE',
            percentage: 5,
            value: 500,
            isTaxable: false,
          },
          {
            componentCode: 'LOAN',
            nameEn: 'Loan Recovery',
            nameAr: 'استرداد القرض',
            type: 'DEDUCTION',
            category: 'LOAN_RECOVERY',
            calculationType: 'FIXED',
            value: 300,
            isTaxable: false,
          },
        ],
      };

      const employee = { ...baseEmployee, salaryStructure };
      const payslip = await PayrollService.calculatePayslip(employee, 'SA', '2024-01', 'SAR');

      expect(payslip.deductions.length).toBeGreaterThanOrEqual(2);
      expect(payslip.totalDeductions).toBeGreaterThan(0);
    });
  });

  describe('Component Properties', () => {
    it('should mark taxable components correctly', async () => {
      const salaryStructure: EmployeeSalaryStructure = {
        basicSalary: 10000,
        components: [
          {
            componentCode: 'HRA',
            nameEn: 'House Rent Allowance',
            nameAr: 'بدل السكن',
            type: 'EARNING',
            category: 'ALLOWANCE',
            calculationType: 'FIXED',
            value: 4000,
            isTaxable: true,
          },
          {
            componentCode: 'TRANSPORT',
            nameEn: 'Transport Allowance',
            nameAr: 'بدل النقل',
            type: 'EARNING',
            category: 'ALLOWANCE',
            calculationType: 'FIXED',
            value: 1000,
            isTaxable: false,
          },
        ],
      };

      const employee = { ...baseEmployee, salaryStructure };
      const payslip = await PayrollService.calculatePayslip(employee, 'SA', '2024-01', 'SAR');

      const hra = payslip.earnings.find(e => e.componentCode === 'HRA');
      const transport = payslip.earnings.find(e => e.componentCode === 'TRANSPORT');

      expect(hra?.isTaxable).toBe(true);
      expect(transport?.isTaxable).toBe(false);
    });

    it('should include component type and category', async () => {
      const salaryStructure: EmployeeSalaryStructure = {
        basicSalary: 10000,
        components: [
          {
            componentCode: 'HRA',
            nameEn: 'House Rent Allowance',
            nameAr: 'بدل السكن',
            type: 'EARNING',
            category: 'ALLOWANCE',
            calculationType: 'FIXED',
            value: 4000,
            isTaxable: true,
          },
        ],
      };

      const employee = { ...baseEmployee, salaryStructure };
      const payslip = await PayrollService.calculatePayslip(employee, 'SA', '2024-01', 'SAR');

      const hra = payslip.earnings.find(e => e.componentCode === 'HRA');
      expect(hra?.type).toBe('EARNING');
      expect(hra?.category).toBe('ALLOWANCE');
    });

    it('should include bilingual component names', async () => {
      const salaryStructure: EmployeeSalaryStructure = {
        basicSalary: 10000,
        components: [
          {
            componentCode: 'HRA',
            nameEn: 'House Rent Allowance',
            nameAr: 'بدل السكن',
            type: 'EARNING',
            category: 'ALLOWANCE',
            calculationType: 'FIXED',
            value: 4000,
            isTaxable: true,
          },
        ],
      };

      const employee = { ...baseEmployee, salaryStructure };
      const payslip = await PayrollService.calculatePayslip(employee, 'SA', '2024-01', 'SAR');

      const hra = payslip.earnings.find(e => e.componentCode === 'HRA');
      expect(hra?.componentName).toBe('House Rent Allowance');
      expect(hra?.componentNameAr).toBe('بدل السكن');
    });
  });

  describe('Total Calculations', () => {
    it('should calculate total earnings correctly', async () => {
      const salaryStructure: EmployeeSalaryStructure = {
        basicSalary: 10000,
        components: [
          {
            componentCode: 'HRA',
            nameEn: 'HRA',
            nameAr: 'بدل السكن',
            type: 'EARNING',
            category: 'ALLOWANCE',
            calculationType: 'FIXED',
            value: 4000,
            isTaxable: true,
          },
          {
            componentCode: 'TRANSPORT',
            nameEn: 'Transport',
            nameAr: 'بدل النقل',
            type: 'EARNING',
            category: 'ALLOWANCE',
            calculationType: 'FIXED',
            value: 1000,
            isTaxable: false,
          },
        ],
      };

      const employee = { ...baseEmployee, salaryStructure };
      const payslip = await PayrollService.calculatePayslip(employee, 'SA', '2024-01', 'SAR');

      const sumOfEarnings = payslip.earnings.reduce((sum, e) => sum + e.calculatedAmount, 0);
      expect(payslip.totalEarnings).toBe(sumOfEarnings);
    });

    it('should calculate total deductions correctly', async () => {
      const salaryStructure: EmployeeSalaryStructure = {
        basicSalary: 10000,
        components: [
          {
            componentCode: 'INSURANCE',
            nameEn: 'Insurance',
            nameAr: 'التأمين',
            type: 'DEDUCTION',
            category: 'INSURANCE',
            calculationType: 'FIXED',
            value: 500,
            isTaxable: false,
          },
          {
            componentCode: 'LOAN',
            nameEn: 'Loan',
            nameAr: 'القرض',
            type: 'DEDUCTION',
            category: 'LOAN_RECOVERY',
            calculationType: 'FIXED',
            value: 300,
            isTaxable: false,
          },
        ],
      };

      const employee = { ...baseEmployee, salaryStructure };
      const payslip = await PayrollService.calculatePayslip(employee, 'SA', '2024-01', 'SAR');

      const sumOfDeductions = payslip.deductions.reduce((sum, d) => sum + d.calculatedAmount, 0);
      expect(payslip.totalDeductions).toBe(sumOfDeductions);
    });

    it('should set gross salary equal to total earnings', async () => {
      const salaryStructure: EmployeeSalaryStructure = {
        basicSalary: 10000,
        components: [
          {
            componentCode: 'HRA',
            nameEn: 'HRA',
            nameAr: 'بدل السكن',
            type: 'EARNING',
            category: 'ALLOWANCE',
            calculationType: 'FIXED',
            value: 4000,
            isTaxable: true,
          },
        ],
      };

      const employee = { ...baseEmployee, salaryStructure };
      const payslip = await PayrollService.calculatePayslip(employee, 'SA', '2024-01', 'SAR');

      expect(payslip.grossSalary).toBe(payslip.totalEarnings);
    });

    it('should calculate net salary correctly', async () => {
      const salaryStructure: EmployeeSalaryStructure = {
        basicSalary: 10000,
        components: [
          {
            componentCode: 'HRA',
            nameEn: 'HRA',
            nameAr: 'بدل السكن',
            type: 'EARNING',
            category: 'ALLOWANCE',
            calculationType: 'FIXED',
            value: 4000,
            isTaxable: true,
          },
          {
            componentCode: 'LOAN',
            nameEn: 'Loan',
            nameAr: 'القرض',
            type: 'DEDUCTION',
            category: 'LOAN_RECOVERY',
            calculationType: 'FIXED',
            value: 500,
            isTaxable: false,
          },
        ],
      };

      const employee = { ...baseEmployee, salaryStructure };
      const payslip = await PayrollService.calculatePayslip(employee, 'SA', '2024-01', 'SAR');

      const expectedNet = payslip.grossSalary - payslip.totalStatutory - payslip.totalDeductions;
      expect(payslip.netSalary).toBe(expectedNet);
    });
  });

  describe('Component Rounding', () => {
    it('should round calculated amounts to 2 decimal places', async () => {
      const salaryStructure: EmployeeSalaryStructure = {
        basicSalary: 10000,
        components: [
          {
            componentCode: 'HRA',
            nameEn: 'HRA',
            nameAr: 'بدل السكن',
            type: 'EARNING',
            category: 'ALLOWANCE',
            calculationType: 'PERCENTAGE',
            percentage: 33.33, // Will result in decimals
            value: 3333,
            isTaxable: true,
          },
        ],
      };

      const employee = { ...baseEmployee, salaryStructure };
      const payslip = await PayrollService.calculatePayslip(employee, 'SA', '2024-01', 'SAR');

      payslip.earnings.forEach(earning => {
        const decimalPlaces = (earning.calculatedAmount.toString().split('.')[1] || '').length;
        expect(decimalPlaces).toBeLessThanOrEqual(2);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero basic salary', async () => {
      const salaryStructure: EmployeeSalaryStructure = {
        basicSalary: 0,
        components: [
          {
            componentCode: 'STIPEND',
            nameEn: 'Stipend',
            nameAr: 'البدل',
            type: 'EARNING',
            category: 'ALLOWANCE',
            calculationType: 'FIXED',
            value: 5000,
            isTaxable: true,
          },
        ],
      };

      const employee = { ...baseEmployee, salaryStructure };
      const payslip = await PayrollService.calculatePayslip(employee, 'SA', '2024-01', 'SAR');

      expect(payslip.basicSalary).toBe(0);
      expect(payslip.totalEarnings).toBeGreaterThan(0);
    });

    it('should handle empty components array', async () => {
      const salaryStructure: EmployeeSalaryStructure = {
        basicSalary: 10000,
        components: [],
      };

      const employee = { ...baseEmployee, salaryStructure };
      const payslip = await PayrollService.calculatePayslip(employee, 'SA', '2024-01', 'SAR');

      // Should only have BASIC earning
      expect(payslip.earnings.length).toBe(1);
      expect(payslip.earnings[0].componentCode).toBe('BASIC');
    });

    it('should handle component with zero value', async () => {
      const salaryStructure: EmployeeSalaryStructure = {
        basicSalary: 10000,
        components: [
          {
            componentCode: 'BONUS',
            nameEn: 'Bonus',
            nameAr: 'المكافأة',
            type: 'EARNING',
            category: 'BONUS',
            calculationType: 'FIXED',
            value: 0,
            isTaxable: true,
          },
        ],
      };

      const employee = { ...baseEmployee, salaryStructure };
      const payslip = await PayrollService.calculatePayslip(employee, 'SA', '2024-01', 'SAR');

      const bonus = payslip.earnings.find(e => e.componentCode === 'BONUS');
      expect(bonus?.calculatedAmount).toBe(0);
    });
  });
});
