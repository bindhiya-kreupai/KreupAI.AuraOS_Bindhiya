import { describe, it, expect, beforeEach } from 'vitest';
import { PayslipPDFGenerator, type PayslipPDFOptions } from '../payslip-pdf.service';
import type { Payslip } from '../types';

describe('PayslipPDFGenerator', () => {
  // Mock payslip data
  const mockPayslip: Payslip = {
    id: 'payslip-1',
    payrollRunId: 'run-1',
    employeeId: 'emp-1',
    employeeName: 'John Doe',
    employeeNameAr: 'جون دو',
    employeeCode: 'EMP001',
    department: 'Engineering',
    designation: 'Software Engineer',
    month: '2024-01',
    countryCode: 'SA',
    currency: 'SAR',

    totalWorkingDays: 22,
    daysWorked: 20,
    paidLeaveDays: 2,
    unpaidLeaveDays: 0,
    lopDays: 0,

    basicSalary: 10000,
    earnings: [
      {
        componentCode: 'BASIC',
        componentName: 'Basic Salary',
        componentNameAr: 'الراتب الأساسي',
        type: 'EARNING',
        category: 'BASIC',
        calculatedAmount: 10000,
        isTaxable: true,
      },
      {
        componentCode: 'HRA',
        componentName: 'House Rent Allowance',
        componentNameAr: 'بدل السكن',
        type: 'EARNING',
        category: 'ALLOWANCE',
        calculatedAmount: 4000,
        isTaxable: true,
      },
    ],
    totalEarnings: 14000,

    deductions: [
      {
        componentCode: 'LOAN',
        componentName: 'Loan Recovery',
        componentNameAr: 'استرداد القرض',
        type: 'DEDUCTION',
        category: 'LOAN_RECOVERY',
        calculatedAmount: 500,
        isTaxable: false,
      },
    ],
    totalDeductions: 500,

    statutoryDeductions: [
      {
        code: 'GOSI_PENSION',
        name: 'GOSI - Pension',
        nameAr: 'التأمينات - المعاش',
        employeeAmount: 0,
        employerAmount: 1000,
        totalAmount: 1000,
        basis: 10000,
        rate: 9,
      },
      {
        code: 'GOSI_OCC_HAZARDS',
        name: 'GOSI - Occupational Hazards',
        nameAr: 'التأمينات - الأخطار المهنية',
        employeeAmount: 0,
        employerAmount: 200,
        totalAmount: 200,
        basis: 10000,
        rate: 2,
      },
    ],
    totalStatutory: 0,

    grossSalary: 14000,
    netSalary: 13500,

    ytdGross: 42000,
    ytdDeductions: 1500,
    ytdTax: 0,
    ytdNet: 40500,

    bankName: 'Riyad Bank',
    bankAccountNumber: '1234567890',
    bankIBAN: 'SA0380000000608010167519',

    status: 'APPROVED',
    createdAt: new Date('2024-01-31'),
    updatedAt: new Date('2024-01-31'),
  };

  const defaultOptions: PayslipPDFOptions = {
    language: 'en',
    showYTD: true,
    showBankDetails: true,
    showStatutoryBreakdown: true,
    showTaxDetails: false,
    companyName: 'Acme Corporation',
    companyNameAr: 'شركة أكمي',
    companyAddress: '123 Business St, Riyadh, Saudi Arabia',
  };

  describe('generate', () => {
    it('should generate PDF content with all required fields', () => {
      const result = PayslipPDFGenerator.generate(mockPayslip, defaultOptions);

      expect(result).toBeDefined();
      expect(result.html).toBeDefined();
      expect(result.css).toBeDefined();
      expect(result.isRTL).toBeDefined();
    });

    it('should set isRTL to false for English language', () => {
      const result = PayslipPDFGenerator.generate(mockPayslip, { ...defaultOptions, language: 'en' });

      expect(result.isRTL).toBe(false);
    });

    it('should set isRTL to true for Arabic language', () => {
      const result = PayslipPDFGenerator.generate(mockPayslip, { ...defaultOptions, language: 'ar' });

      expect(result.isRTL).toBe(true);
    });

    it('should set isRTL to false for bilingual', () => {
      const result = PayslipPDFGenerator.generate(mockPayslip, { ...defaultOptions, language: 'bilingual' });

      expect(result.isRTL).toBe(false);
    });

    it('should include company name in HTML', () => {
      const result = PayslipPDFGenerator.generate(mockPayslip, defaultOptions);

      expect(result.html).toContain('Acme Corporation');
    });

    it('should include employee information', () => {
      const result = PayslipPDFGenerator.generate(mockPayslip, defaultOptions);

      expect(result.html).toContain('John Doe');
      expect(result.html).toContain('EMP001');
      expect(result.html).toContain('Engineering');
      expect(result.html).toContain('Software Engineer');
    });

    it('should include bilingual employee name when language is bilingual', () => {
      const result = PayslipPDFGenerator.generate(mockPayslip, { ...defaultOptions, language: 'bilingual' });

      expect(result.html).toContain('John Doe');
      expect(result.html).toContain('جون دو');
    });

    it('should include working days information', () => {
      const result = PayslipPDFGenerator.generate(mockPayslip, defaultOptions);

      expect(result.html).toContain('20');
      expect(result.html).toContain('22');
    });

    it('should include all earnings components', () => {
      const result = PayslipPDFGenerator.generate(mockPayslip, defaultOptions);

      expect(result.html).toContain('Basic Salary');
      expect(result.html).toContain('House Rent Allowance');
      expect(result.html).toContain('10,000.00');
      expect(result.html).toContain('4,000.00');
    });

    it('should include all deductions components', () => {
      const result = PayslipPDFGenerator.generate(mockPayslip, defaultOptions);

      expect(result.html).toContain('Loan Recovery');
      expect(result.html).toContain('500.00');
    });

    it('should display total earnings and total deductions', () => {
      const result = PayslipPDFGenerator.generate(mockPayslip, defaultOptions);

      expect(result.html).toContain('14,000.00');
      expect(result.html).toContain('13,500.00');
    });
  });

  describe('bilingual support', () => {
    it('should show bilingual component names when language is bilingual', () => {
      const result = PayslipPDFGenerator.generate(mockPayslip, { ...defaultOptions, language: 'bilingual' });

      expect(result.html).toContain('Basic Salary');
      expect(result.html).toContain('الراتب الأساسي');
      expect(result.html).toContain('bilingual-text');
    });

    it('should show only English names when language is English', () => {
      const result = PayslipPDFGenerator.generate(mockPayslip, { ...defaultOptions, language: 'en' });

      expect(result.html).toContain('Basic Salary');
      expect(result.html).not.toContain('bilingual-text');
    });

    it('should show only Arabic names when language is Arabic', () => {
      const result = PayslipPDFGenerator.generate(mockPayslip, { ...defaultOptions, language: 'ar' });

      expect(result.html).toContain('الراتب الأساسي');
    });

    it('should include Arabic company name when provided', () => {
      const result = PayslipPDFGenerator.generate(mockPayslip, defaultOptions);

      expect(result.html).toContain('شركة أكمي');
    });
  });

  describe('statutory breakdown', () => {
    it('should show statutory breakdown when enabled', () => {
      const result = PayslipPDFGenerator.generate(mockPayslip, {
        ...defaultOptions,
        showStatutoryBreakdown: true,
      });

      expect(result.html).toContain('GOSI - Pension');
      expect(result.html).toContain('1,000.00');
    });

    it('should hide statutory breakdown when disabled', () => {
      const result = PayslipPDFGenerator.generate(mockPayslip, {
        ...defaultOptions,
        showStatutoryBreakdown: false,
      });

      expect(result.html).not.toContain('Statutory Contributions');
    });

    it('should display employee and employer amounts', () => {
      const result = PayslipPDFGenerator.generate(mockPayslip, {
        ...defaultOptions,
        showStatutoryBreakdown: true,
      });

      expect(result.html).toContain('Employee');
      expect(result.html).toContain('Employer');
    });
  });

  describe('YTD summary', () => {
    it('should show YTD summary when enabled', () => {
      const result = PayslipPDFGenerator.generate(mockPayslip, {
        ...defaultOptions,
        showYTD: true,
      });

      expect(result.html).toContain('42,000.00');
      expect(result.html).toContain('1,500.00');
      expect(result.html).toContain('40,500.00');
    });

    it('should hide YTD summary when disabled', () => {
      const result = PayslipPDFGenerator.generate(mockPayslip, {
        ...defaultOptions,
        showYTD: false,
      });

      expect(result.html).not.toContain('Year-to-Date');
    });
  });

  describe('bank details', () => {
    it('should show bank details when enabled', () => {
      const result = PayslipPDFGenerator.generate(mockPayslip, {
        ...defaultOptions,
        showBankDetails: true,
      });

      expect(result.html).toContain('Riyad Bank');
      expect(result.html).toContain('******7890'); // Masked account
    });

    it('should hide bank details when disabled', () => {
      const result = PayslipPDFGenerator.generate(mockPayslip, {
        ...defaultOptions,
        showBankDetails: false,
      });

      expect(result.html).not.toContain('Bank Details');
    });

    it('should mask account number correctly', () => {
      const result = PayslipPDFGenerator.generate(mockPayslip, {
        ...defaultOptions,
        showBankDetails: true,
      });

      expect(result.html).toContain('******7890');
      expect(result.html).not.toContain('1234567890');
    });

    it('should mask IBAN correctly', () => {
      const result = PayslipPDFGenerator.generate(mockPayslip, {
        ...defaultOptions,
        showBankDetails: true,
      });

      expect(result.html).toContain('SA03****************7519');
      expect(result.html).not.toContain('SA0380000000608010167519');
    });
  });

  describe('tax details', () => {
    it('should show tax details when enabled and tax data exists', () => {
      const payslipWithTax: Payslip = {
        ...mockPayslip,
        taxDetails: {
          regime: 'NEW',
          annualGross: 168000,
          exemptions: [],
          totalExemptions: 0,
          taxableIncome: 118000,
          taxSlabs: [],
          grossTax: 12500,
          rebate87A: 0,
          surcharge: 0,
          healthEducationCess: 500,
          totalTax: 13000,
          monthlyTds: 1083,
          ytdTds: 3250,
          remainingTds: 9750,
        },
      };

      const result = PayslipPDFGenerator.generate(payslipWithTax, {
        ...defaultOptions,
        showTaxDetails: true,
      });

      expect(result.html).toContain('Tax Details');
      expect(result.html).toContain('New Regime');
      expect(result.html).toContain('168,000.00');
      expect(result.html).toContain('13,000.00');
    });

    it('should not show tax details when disabled', () => {
      const payslipWithTax: Payslip = {
        ...mockPayslip,
        taxDetails: {
          regime: 'OLD',
          annualGross: 168000,
          exemptions: [],
          totalExemptions: 0,
          taxableIncome: 118000,
          taxSlabs: [],
          grossTax: 12500,
          rebate87A: 2500,
          surcharge: 0,
          healthEducationCess: 400,
          totalTax: 10400,
          monthlyTds: 867,
          ytdTds: 2600,
          remainingTds: 7800,
        },
      };

      const result = PayslipPDFGenerator.generate(payslipWithTax, {
        ...defaultOptions,
        showTaxDetails: false,
      });

      expect(result.html).not.toContain('Tax Details');
    });
  });

  describe('currency formatting', () => {
    it('should format SAR currency correctly', () => {
      const result = PayslipPDFGenerator.generate(mockPayslip, defaultOptions);

      expect(result.html).toContain('SAR');
    });

    it('should format INR currency correctly', () => {
      const indiaPayslip = { ...mockPayslip, currency: 'INR', countryCode: 'IN' as const };
      const result = PayslipPDFGenerator.generate(indiaPayslip, defaultOptions);

      expect(result.html).toContain('₹');
    });

    it('should format amounts with thousand separators', () => {
      const result = PayslipPDFGenerator.generate(mockPayslip, defaultOptions);

      expect(result.html).toContain('10,000.00');
      expect(result.html).toContain('14,000.00');
      expect(result.html).toContain('13,500.00');
    });

    it('should format amounts with two decimal places', () => {
      const result = PayslipPDFGenerator.generate(mockPayslip, defaultOptions);

      // Check that all amounts have .00 decimal
      const amounts = result.html.match(/\d{1,3}(,\d{3})*\.\d{2}/g);
      expect(amounts).toBeDefined();
      expect(amounts!.length).toBeGreaterThan(0);
    });
  });

  describe('CSS generation', () => {
    it('should generate CSS with RTL direction for Arabic', () => {
      const result = PayslipPDFGenerator.generate(mockPayslip, { ...defaultOptions, language: 'ar' });

      expect(result.css).toContain('direction: rtl');
      expect(result.css).toContain('Noto Sans Arabic');
    });

    it('should generate CSS with LTR direction for English', () => {
      const result = PayslipPDFGenerator.generate(mockPayslip, { ...defaultOptions, language: 'en' });

      expect(result.css).toContain('direction: ltr');
    });

    it('should include print styles', () => {
      const result = PayslipPDFGenerator.generate(mockPayslip, defaultOptions);

      expect(result.css).toContain('@media print');
      expect(result.css).toContain('print-color-adjust');
    });

    it('should include grid layouts for responsive design', () => {
      const result = PayslipPDFGenerator.generate(mockPayslip, defaultOptions);

      expect(result.css).toContain('display: grid');
      expect(result.css).toContain('grid-template-columns');
    });
  });

  describe('company branding', () => {
    it('should include company logo when provided', () => {
      const optionsWithLogo = {
        ...defaultOptions,
        companyLogo: 'https://example.com/logo.png',
      };

      const result = PayslipPDFGenerator.generate(mockPayslip, optionsWithLogo);

      expect(result.html).toContain('https://example.com/logo.png');
      expect(result.html).toContain('<img src=');
    });

    it('should not include logo tag when not provided', () => {
      const result = PayslipPDFGenerator.generate(mockPayslip, defaultOptions);

      expect(result.html).not.toContain('<img src=');
    });

    it('should include custom footer text when provided', () => {
      const optionsWithFooter = {
        ...defaultOptions,
        footerText: 'Custom confidential notice',
      };

      const result = PayslipPDFGenerator.generate(mockPayslip, optionsWithFooter);

      expect(result.html).toContain('Custom confidential notice');
    });

    it('should include default footer text when not provided', () => {
      const result = PayslipPDFGenerator.generate(mockPayslip, defaultOptions);

      expect(result.html).toContain('computer-generated payslip');
    });
  });

  describe('month formatting', () => {
    it('should format month as full month name and year', () => {
      const result = PayslipPDFGenerator.generate(mockPayslip, defaultOptions);

      expect(result.html).toContain('January 2024');
    });

    it('should handle different months correctly', () => {
      const decemberPayslip = { ...mockPayslip, month: '2024-12' };
      const result = PayslipPDFGenerator.generate(decemberPayslip, defaultOptions);

      expect(result.html).toContain('December 2024');
    });
  });

  describe('edge cases', () => {
    it('should handle payslip with no deductions', () => {
      const payslipNoDeductions = {
        ...mockPayslip,
        deductions: [],
        totalDeductions: 0,
      };

      const result = PayslipPDFGenerator.generate(payslipNoDeductions, defaultOptions);

      expect(result).toBeDefined();
      expect(result.html).toBeDefined();
    });

    it('should handle payslip with no bank details', () => {
      const payslipNoBank = {
        ...mockPayslip,
        bankName: undefined,
        bankAccountNumber: undefined,
        bankIBAN: undefined,
      };

      const result = PayslipPDFGenerator.generate(payslipNoBank, {
        ...defaultOptions,
        showBankDetails: true,
      });

      expect(result).toBeDefined();
      // Should gracefully handle missing bank details
    });

    it('should handle short account numbers correctly', () => {
      const payslipShortAccount = {
        ...mockPayslip,
        bankAccountNumber: '123',
      };

      const result = PayslipPDFGenerator.generate(payslipShortAccount, {
        ...defaultOptions,
        showBankDetails: true,
      });

      expect(result.html).toContain('123');
      // Should not crash with short account numbers
    });

    it('should include generated timestamp', () => {
      const result = PayslipPDFGenerator.generate(mockPayslip, defaultOptions);

      expect(result.html).toContain('Generated on');
      expect(result.html).toContain('AuraOS HR');
    });
  });
});
