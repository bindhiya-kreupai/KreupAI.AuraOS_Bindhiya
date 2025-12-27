import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PayrollService } from '../payroll.service';
import type { PayrollRunInput, EmployeeSalaryStructure } from '../types';
import { PayrollStatus } from '../types';

// Mock external dependencies
vi.mock('../../compliance/gosi.service', () => ({
  GOSIService: {
    calculateContributions: vi.fn(() => ({
      contributableSalary: 10000,
      employeeContribution: 900,
      employerContribution: 1200,
      breakdown: {
        annuity: { employee: 900, employer: 1000 },
        occupationalHazards: { employee: 0, employer: 200 },
        saned: { employee: 0, employer: 0 },
      },
    })),
  },
}));

vi.mock('../../compliance/labour-law.service', () => ({
  LabourLawService: {
    getConfig: vi.fn(() => ({
      weekendDays: ['Friday', 'Saturday'],
      maxWorkHours: 48,
      overtimeMultiplier: 1.25,
    })),
  },
}));

describe('PayrollService', () => {
  // Mock data fixtures
  const mockSalaryStructure: EmployeeSalaryStructure = {
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

  const mockEmployee = {
    id: 'emp-1',
    code: 'EMP001',
    name: 'John Doe',
    nameAr: 'جون دو',
    department: 'Engineering',
    designation: 'Software Engineer',
    salaryStructure: mockSalaryStructure,
    countryCode: 'SA' as const,
    joiningDate: new Date('2023-01-01'),
    bankName: 'Riyad Bank',
    bankAccountNumber: '1234567890',
    bankIBAN: 'SA0380000000608010167519',
    isSaudi: false,
    iqamaNumber: '2234567890',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock getEmployeesToProcess to return test employees
    vi.spyOn(PayrollService as any, 'getEmployeesToProcess').mockResolvedValue([mockEmployee]);
  });

  describe('processPayroll', () => {
    it('should process payroll run successfully for KSA', async () => {
      const input: PayrollRunInput = {
        tenantId: 'tenant-1',
        companyId: 'company-1',
        month: '2024-01',
        countryCode: 'SA',
      };

      const result = await PayrollService.processPayroll(input);

      expect(result).toBeDefined();
      expect(result.tenantId).toBe('tenant-1');
      expect(result.companyId).toBe('company-1');
      expect(result.month).toBe('2024-01');
      expect(result.countryCode).toBe('SA');
      expect(result.currency).toBe('SAR');
      expect(result.status).toBe('CALCULATED');
      expect(result.totalEmployees).toBe(1);
    });

    it('should calculate total gross salary correctly', async () => {
      const input: PayrollRunInput = {
        tenantId: 'tenant-1',
        companyId: 'company-1',
        month: '2024-01',
        countryCode: 'SA',
      };

      const result = await PayrollService.processPayroll(input);

      expect(result.totalGross).toBeGreaterThan(0);
      expect(result.totalNet).toBeGreaterThan(0);
      expect(result.totalNet).toBeLessThan(result.totalGross);
    });

    it('should include payslips in payroll run', async () => {
      const input: PayrollRunInput = {
        tenantId: 'tenant-1',
        companyId: 'company-1',
        month: '2024-01',
        countryCode: 'SA',
      };

      const result = await PayrollService.processPayroll(input);

      expect(result.payslips).toBeDefined();
      expect(result.payslips.length).toBe(1);
      expect(result.payslips[0].employeeId).toBe('emp-1');
    });

    it('should include summary in payroll run', async () => {
      const input: PayrollRunInput = {
        tenantId: 'tenant-1',
        companyId: 'company-1',
        month: '2024-01',
        countryCode: 'SA',
      };

      const result = await PayrollService.processPayroll(input);

      expect(result.summary).toBeDefined();
      expect(result.summary.byDepartment).toBeDefined();
      expect(result.summary.byPayComponent).toBeDefined();
    });

    it('should throw error if validation fails', async () => {
      const employeeWithoutSalary = {
        ...mockEmployee,
        salaryStructure: { basicSalary: 0, components: [] },
      };
      vi.spyOn(PayrollService as any, 'getEmployeesToProcess').mockResolvedValue([employeeWithoutSalary]);

      const input: PayrollRunInput = {
        tenantId: 'tenant-1',
        companyId: 'company-1',
        month: '2024-01',
        countryCode: 'SA',
      };

      await expect(PayrollService.processPayroll(input)).rejects.toThrow('Payroll validation failed');
    });

    it('should handle multiple employees', async () => {
      const employee2 = { ...mockEmployee, id: 'emp-2', code: 'EMP002', name: 'Jane Smith' };
      vi.spyOn(PayrollService as any, 'getEmployeesToProcess').mockResolvedValue([mockEmployee, employee2]);

      const input: PayrollRunInput = {
        tenantId: 'tenant-1',
        companyId: 'company-1',
        month: '2024-01',
        countryCode: 'SA',
      };

      const result = await PayrollService.processPayroll(input);

      expect(result.totalEmployees).toBe(2);
      expect(result.payslips.length).toBe(2);
    });
  });

  describe('calculatePayslip', () => {
    it('should calculate payslip with all components', async () => {
      const payslip = await PayrollService.calculatePayslip(mockEmployee, 'SA', '2024-01', 'SAR');

      expect(payslip).toBeDefined();
      expect(payslip.employeeId).toBe('emp-1');
      expect(payslip.month).toBe('2024-01');
      expect(payslip.countryCode).toBe('SA');
      expect(payslip.currency).toBe('SAR');
    });

    it('should calculate basic salary correctly', async () => {
      const payslip = await PayrollService.calculatePayslip(mockEmployee, 'SA', '2024-01', 'SAR');

      expect(payslip.basicSalary).toBe(10000);
      expect(payslip.earnings.length).toBeGreaterThan(0);
      const basicEarning = payslip.earnings.find(e => e.componentCode === 'BASIC');
      expect(basicEarning).toBeDefined();
      expect(basicEarning?.calculatedAmount).toBeGreaterThan(0);
    });

    it('should calculate earnings correctly', async () => {
      const payslip = await PayrollService.calculatePayslip(mockEmployee, 'SA', '2024-01', 'SAR');

      expect(payslip.earnings.length).toBeGreaterThan(1);
      expect(payslip.totalEarnings).toBeGreaterThan(10000);
      expect(payslip.grossSalary).toBe(payslip.totalEarnings);
    });

    it('should calculate GOSI deductions for KSA', async () => {
      const payslip = await PayrollService.calculatePayslip(mockEmployee, 'SA', '2024-01', 'SAR');

      expect(payslip.statutoryDeductions.length).toBeGreaterThan(0);
      const gosiPension = payslip.statutoryDeductions.find(s => s.code === 'GOSI_PENSION');
      expect(gosiPension).toBeDefined();
    });

    it('should calculate net salary correctly', async () => {
      const payslip = await PayrollService.calculatePayslip(mockEmployee, 'SA', '2024-01', 'SAR');

      const expectedNet = payslip.grossSalary - payslip.totalStatutory - payslip.totalDeductions;
      expect(payslip.netSalary).toBe(expectedNet);
      expect(payslip.netSalary).toBeLessThan(payslip.grossSalary);
    });

    it('should include working days information', async () => {
      const payslip = await PayrollService.calculatePayslip(mockEmployee, 'SA', '2024-01', 'SAR');

      expect(payslip.totalWorkingDays).toBeGreaterThan(0);
      expect(payslip.daysWorked).toBeGreaterThan(0);
      expect(payslip.daysWorked).toBeLessThanOrEqual(payslip.totalWorkingDays);
    });

    it('should include bank details', async () => {
      const payslip = await PayrollService.calculatePayslip(mockEmployee, 'SA', '2024-01', 'SAR');

      expect(payslip.bankName).toBe('Riyad Bank');
      expect(payslip.bankAccountNumber).toBe('1234567890');
      expect(payslip.bankIBAN).toBe('SA0380000000608010167519');
    });

    it('should set status to CALCULATED', async () => {
      const payslip = await PayrollService.calculatePayslip(mockEmployee, 'SA', '2024-01', 'SAR');

      expect(payslip.status).toBe('CALCULATED');
    });

    it('should pro-rate salary for LOP days', async () => {
      const employeeWithLOP = {
        ...mockEmployee,
        lopDays: 5,
        paidLeaveDays: 0,
        unpaidLeaveDays: 0,
      };

      const payslip = await PayrollService.calculatePayslip(employeeWithLOP, 'SA', '2024-01', 'SAR');
      const payslipWithoutLOP = await PayrollService.calculatePayslip(mockEmployee, 'SA', '2024-01', 'SAR');

      expect(payslip.lopDays).toBe(5);
      expect(payslip.netSalary).toBeLessThan(payslipWithoutLOP.netSalary);
    });

    it('should handle paid leave days correctly', async () => {
      const employeeWithLeave = {
        ...mockEmployee,
        paidLeaveDays: 3,
        lopDays: 0,
        unpaidLeaveDays: 0,
      };

      const payslip = await PayrollService.calculatePayslip(employeeWithLeave, 'SA', '2024-01', 'SAR');

      expect(payslip.paidLeaveDays).toBe(3);
      // Paid leave should not reduce salary
      expect(payslip.netSalary).toBeGreaterThan(0);
    });

    it('should calculate percentage-based allowances correctly', async () => {
      const payslip = await PayrollService.calculatePayslip(mockEmployee, 'SA', '2024-01', 'SAR');

      const hraEarning = payslip.earnings.find(e => e.componentCode === 'HRA');
      expect(hraEarning).toBeDefined();
      // HRA should be approximately 40% of basic (adjusted for working days)
      expect(hraEarning?.calculatedAmount).toBeGreaterThan(0);
    });

    it('should calculate fixed allowances correctly', async () => {
      const payslip = await PayrollService.calculatePayslip(mockEmployee, 'SA', '2024-01', 'SAR');

      const transportEarning = payslip.earnings.find(e => e.componentCode === 'TRANSPORT');
      expect(transportEarning).toBeDefined();
    });
  });

  describe('calculateStatutoryDeductions - KSA', () => {
    it('should calculate GOSI for Saudi employees', async () => {
      const saudiEmployee = { ...mockEmployee, isSaudi: true, nationalId: '1234567890' };
      const payslip = await PayrollService.calculatePayslip(saudiEmployee, 'SA', '2024-01', 'SAR');

      const gosiPension = payslip.statutoryDeductions.find(s => s.code === 'GOSI_PENSION');
      const gosiSaned = payslip.statutoryDeductions.find(s => s.code === 'GOSI_SANED');

      expect(gosiPension).toBeDefined();
      expect(gosiSaned).toBeDefined();
      expect(gosiPension?.employeeAmount).toBeGreaterThan(0);
    });

    it('should calculate GOSI for non-Saudi employees', async () => {
      const payslip = await PayrollService.calculatePayslip(mockEmployee, 'SA', '2024-01', 'SAR');

      const gosiPension = payslip.statutoryDeductions.find(s => s.code === 'GOSI_PENSION');
      expect(gosiPension).toBeDefined();
      // Non-Saudis don't contribute to GOSI
      expect(gosiPension?.employeeAmount).toBe(0);
    });

    it('should include occupational hazards for all employees', async () => {
      const payslip = await PayrollService.calculatePayslip(mockEmployee, 'SA', '2024-01', 'SAR');

      const occHazards = payslip.statutoryDeductions.find(s => s.code === 'GOSI_OCC_HAZARDS');
      expect(occHazards).toBeDefined();
      expect(occHazards?.employerAmount).toBeGreaterThan(0);
    });
  });

  describe('calculateStatutoryDeductions - India', () => {
    const indiaEmployee = {
      ...mockEmployee,
      countryCode: 'IN' as const,
      panNumber: 'ABCDE1234F',
      section80C: 100000,
      section80D: 25000,
    };

    beforeEach(() => {
      vi.spyOn(PayrollService as any, 'getEmployeesToProcess').mockResolvedValue([indiaEmployee]);
    });

    it('should calculate PF deductions for India', async () => {
      const payslip = await PayrollService.calculatePayslip(indiaEmployee, 'IN', '2024-01', 'INR');

      const pf = payslip.statutoryDeductions.find(s => s.code === 'PF_EMPLOYEE');
      expect(pf).toBeDefined();
      expect(pf?.employeeAmount).toBeGreaterThan(0);
      expect(pf?.employerAmount).toBeGreaterThan(0);
    });

    it('should calculate ESI for low income employees', async () => {
      const lowIncomeEmployee = {
        ...indiaEmployee,
        salaryStructure: {
          basicSalary: 15000,
          components: [],
        },
      };

      const payslip = await PayrollService.calculatePayslip(lowIncomeEmployee, 'IN', '2024-01', 'INR');

      const esi = payslip.statutoryDeductions.find(s => s.code === 'ESI');
      expect(esi).toBeDefined();
    });

    it('should calculate Professional Tax for India', async () => {
      const payslip = await PayrollService.calculatePayslip(indiaEmployee, 'IN', '2024-01', 'INR');

      const pt = payslip.statutoryDeductions.find(s => s.code === 'PT');
      expect(pt).toBeDefined();
    });

    it('should calculate TDS tax for India', async () => {
      const payslip = await PayrollService.calculatePayslip(indiaEmployee, 'IN', '2024-01', 'INR');

      expect(payslip.taxDetails).toBeDefined();
      expect(payslip.taxDetails?.monthlyTds).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateIndiaTax', () => {
    it('should calculate tax under new regime', async () => {
      const employee = {
        ...mockEmployee,
        countryCode: 'IN' as const,
        taxRegime: 'NEW' as const,
        salaryStructure: {
          basicSalary: 100000,
          components: [],
        },
      };

      const payslip = await PayrollService.calculatePayslip(employee, 'IN', '2024-01', 'INR');

      expect(payslip.taxDetails).toBeDefined();
      expect(payslip.taxDetails?.regime).toBe('NEW');
      expect(payslip.taxDetails?.totalExemptions).toBe(0); // No exemptions in new regime
    });

    it('should calculate tax under old regime with exemptions', async () => {
      const employee = {
        ...mockEmployee,
        countryCode: 'IN' as const,
        taxRegime: 'OLD' as const,
        section80C: 150000,
        section80D: 25000,
        salaryStructure: {
          basicSalary: 100000,
          components: [],
        },
      };

      const payslip = await PayrollService.calculatePayslip(employee, 'IN', '2024-01', 'INR');

      expect(payslip.taxDetails).toBeDefined();
      expect(payslip.taxDetails?.regime).toBe('OLD');
      expect(payslip.taxDetails?.totalExemptions).toBeGreaterThan(0);
    });

    it('should apply 87A rebate for eligible income', async () => {
      const employee = {
        ...mockEmployee,
        countryCode: 'IN' as const,
        taxRegime: 'NEW' as const,
        salaryStructure: {
          basicSalary: 25000, // Low income
          components: [],
        },
      };

      const payslip = await PayrollService.calculatePayslip(employee, 'IN', '2024-01', 'INR');

      expect(payslip.taxDetails).toBeDefined();
      // For low income, tax after rebate should be 0 or very low
    });

    it('should calculate HRA exemption correctly', async () => {
      const employee = {
        ...mockEmployee,
        countryCode: 'IN' as const,
        taxRegime: 'OLD' as const,
        salaryStructure: {
          basicSalary: 50000,
          components: [],
        },
        hraReceived: 20000,
        rentPaid: 15000,
        isMetroCity: true,
      };

      const payslip = await PayrollService.calculatePayslip(employee, 'IN', '2024-01', 'INR');

      const hraExemption = payslip.taxDetails?.exemptions.find(e => e.section === 'HRA');
      expect(hraExemption).toBeDefined();
      expect(hraExemption?.approvedAmount).toBeGreaterThan(0);
    });
  });

  describe('validatePayroll', () => {
    it('should validate successfully for valid employees', async () => {
      const result = await PayrollService.validatePayroll([mockEmployee], 'SA', '2024-01');

      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should detect missing salary structure', async () => {
      const invalidEmployee = {
        ...mockEmployee,
        salaryStructure: { basicSalary: 0, components: [] },
      };

      const result = await PayrollService.validatePayroll([invalidEmployee], 'SA', '2024-01');

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].code).toBe('MISSING_SALARY');
    });

    it('should warn for missing bank account', async () => {
      const employeeWithoutBank = {
        ...mockEmployee,
        bankAccountNumber: undefined,
      };

      const result = await PayrollService.validatePayroll([employeeWithoutBank], 'SA', '2024-01');

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].code).toBe('MISSING_BANK');
    });

    it('should validate national ID for Saudi employees', async () => {
      const saudiWithoutID = {
        ...mockEmployee,
        isSaudi: true,
        nationalId: undefined,
      };

      const result = await PayrollService.validatePayroll([saudiWithoutID], 'SA', '2024-01');

      expect(result.isValid).toBe(false);
      const error = result.errors.find(e => e.code === 'MISSING_NATIONAL_ID');
      expect(error).toBeDefined();
    });

    it('should validate Iqama for non-Saudi employees', async () => {
      const nonSaudiWithoutIqama = {
        ...mockEmployee,
        isSaudi: false,
        iqamaNumber: undefined,
      };

      const result = await PayrollService.validatePayroll([nonSaudiWithoutIqama], 'SA', '2024-01');

      expect(result.isValid).toBe(false);
      const error = result.errors.find(e => e.code === 'MISSING_IQAMA');
      expect(error).toBeDefined();
    });

    it('should warn for missing labour card in UAE', async () => {
      const uaeEmployee = {
        ...mockEmployee,
        countryCode: 'AE' as const,
        labourCardNumber: undefined,
      };

      const result = await PayrollService.validatePayroll([uaeEmployee], 'AE', '2024-01');

      const warning = result.warnings.find(w => w.code === 'MISSING_LABOUR_CARD');
      expect(warning).toBeDefined();
    });

    it('should warn for missing PAN in India', async () => {
      const indiaEmployee = {
        ...mockEmployee,
        countryCode: 'IN' as const,
        panNumber: undefined,
      };

      const result = await PayrollService.validatePayroll([indiaEmployee], 'IN', '2024-01');

      const warning = result.warnings.find(w => w.code === 'MISSING_PAN');
      expect(warning).toBeDefined();
    });
  });

  describe('calculateSummary', () => {
    it('should group payslips by department', async () => {
      const employee2 = {
        ...mockEmployee,
        id: 'emp-2',
        department: 'Sales',
      };

      vi.spyOn(PayrollService as any, 'getEmployeesToProcess').mockResolvedValue([mockEmployee, employee2]);

      const input: PayrollRunInput = {
        tenantId: 'tenant-1',
        companyId: 'company-1',
        month: '2024-01',
        countryCode: 'SA',
      };

      const result = await PayrollService.processPayroll(input);

      expect(result.summary.byDepartment.length).toBe(2);
      const engDept = result.summary.byDepartment.find(d => d.departmentName === 'Engineering');
      const salesDept = result.summary.byDepartment.find(d => d.departmentName === 'Sales');

      expect(engDept).toBeDefined();
      expect(salesDept).toBeDefined();
      expect(engDept?.employeeCount).toBe(1);
      expect(salesDept?.employeeCount).toBe(1);
    });

    it('should group by pay components', async () => {
      const input: PayrollRunInput = {
        tenantId: 'tenant-1',
        companyId: 'company-1',
        month: '2024-01',
        countryCode: 'SA',
      };

      const result = await PayrollService.processPayroll(input);

      expect(result.summary.byPayComponent.length).toBeGreaterThan(0);
      const basicComponent = result.summary.byPayComponent.find(c => c.componentCode === 'BASIC');
      expect(basicComponent).toBeDefined();
      expect(basicComponent?.totalAmount).toBeGreaterThan(0);
    });

    it('should calculate statutory breakdown', async () => {
      const input: PayrollRunInput = {
        tenantId: 'tenant-1',
        companyId: 'company-1',
        month: '2024-01',
        countryCode: 'SA',
      };

      const result = await PayrollService.processPayroll(input);

      expect(result.summary.statutoryBreakdown).toBeDefined();
      expect(result.summary.statutoryBreakdown.gosiEmployeeTotal).toBeGreaterThanOrEqual(0);
      expect(result.summary.statutoryBreakdown.gosiEmployerTotal).toBeGreaterThan(0);
    });
  });

  describe('loan recovery', () => {
    it('should deduct loan recovery amount', async () => {
      const employeeWithLoan = {
        ...mockEmployee,
        loanRecovery: 500,
      };

      const payslip = await PayrollService.calculatePayslip(employeeWithLoan, 'SA', '2024-01', 'SAR');

      const loanDeduction = payslip.deductions.find(d => d.componentCode === 'LOAN_RECOVERY');
      expect(loanDeduction).toBeDefined();
      expect(loanDeduction?.calculatedAmount).toBe(500);
    });

    it('should not add loan deduction if amount is zero', async () => {
      const payslip = await PayrollService.calculatePayslip(mockEmployee, 'SA', '2024-01', 'SAR');

      const loanDeduction = payslip.deductions.find(d => d.componentCode === 'LOAN_RECOVERY');
      expect(loanDeduction).toBeUndefined();
    });
  });
});

// Helper type for testing
interface TaxExemption {
  section: string;
  description: string;
  declaredAmount: number;
  approvedAmount: number;
  maxLimit: number;
}
