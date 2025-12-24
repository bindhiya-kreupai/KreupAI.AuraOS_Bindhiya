/**
 * Bahrain SIO (Social Insurance Organization) Service
 * Calculates social insurance contributions for Bahraini and non-Bahraini employees
 * Based on Social Insurance Law No. 24 of 1976 and amendments
 *
 * Key Features:
 * - Monthly contribution calculations
 * - Separate rates for Bahraini and Non-Bahraini employees
 * - Unemployment insurance for Bahraini employees
 * - Workplace injury insurance for all employees
 * - SIO file generation for submissions
 */

import { SupportedCountryCode, COUNTRY_CURRENCIES } from './types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SIOConfiguration {
  // Bahraini Employee Rates
  bahraini: {
    employee: {
      pensionInsurance: number;      // 8% of insurable salary
      unemploymentInsurance: number; // 1% of insurable salary
      total: number;                 // 9%
    };
    employer: {
      pensionInsurance: number;      // 12% of insurable salary
      unemploymentInsurance: number; // 2% of insurable salary
      workplaceInjury: number;       // 3% of insurable salary
      total: number;                 // 17%
    };
  };
  // Non-Bahraini Employee Rates
  nonBahraini: {
    employee: {
      total: number;                 // 0% - no employee contribution
    };
    employer: {
      workplaceInjury: number;       // 3% of insurable salary
      total: number;                 // 3%
    };
  };
  // Salary ceiling for SIO contributions
  salaryCeiling: number;             // BHD 4,000 (max insurable salary)
  minimumWage: number;               // BHD 300 for private sector
  effectiveDate: string;
}

export interface SIOEmployeeData {
  employeeId: string;
  cpr: string;                       // Central Population Register number
  fullName: string;
  fullNameAr?: string;
  nationality: 'BH' | 'NON_BH';      // Bahraini or Non-Bahraini
  dateOfBirth: Date;
  joiningDate: Date;
  basicSalary: number;               // BHD
  housingAllowance?: number;         // BHD
  transportAllowance?: number;       // BHD
  otherAllowances?: number;          // BHD - included in insurable salary
  grossSalary: number;               // BHD - total monthly salary
}

export interface SIOCalculationResult {
  employeeId: string;
  cpr: string;
  period: string;                    // YYYY-MM format
  nationality: 'BH' | 'NON_BH';
  insurableSalary: number;           // Subject to BHD 4,000 ceiling
  actualGrossSalary: number;

  // Employee Contribution
  employeeContribution: {
    pensionInsurance: number;
    unemploymentInsurance: number;
    total: number;
  };

  // Employer Contribution
  employerContribution: {
    pensionInsurance: number;
    unemploymentInsurance: number;
    workplaceInjury: number;
    total: number;
  };

  // Total Contribution
  totalContribution: number;

  // Metadata
  currency: string;
  calculatedAt: Date;
  notes: string[];
  notesAr: string[];
}

export interface SIOSubmissionRecord {
  employeeId: string;
  cpr: string;
  employeeName: string;
  employeeNameAr?: string;
  nationality: string;
  basicSalary: number;
  insurableSalary: number;
  employeeContribution: number;
  employerContribution: number;
  totalContribution: number;
}

export interface SIOSubmissionFile {
  organizationId: string;
  commercialRegistration: string;    // CR number
  sioEmployerNumber: string;         // SIO registration number
  period: string;                    // YYYY-MM

  totalEmployees: number;
  totalBahrainis: number;
  totalNonBahrainis: number;

  totalInsurableSalary: number;
  totalEmployeeContribution: number;
  totalEmployerContribution: number;
  grandTotal: number;

  records: SIOSubmissionRecord[];

  generatedAt: Date;
  generatedBy: string;
  fileFormat: 'SIO_STANDARD' | 'EXCEL';
}

export interface SIOValidationResult {
  isValid: boolean;
  errors: SIOValidationError[];
  warnings: SIOValidationWarning[];
}

export interface SIOValidationError {
  employeeId: string;
  field: string;
  message: string;
  messageAr: string;
}

export interface SIOValidationWarning {
  employeeId: string;
  field: string;
  message: string;
  messageAr: string;
}

// ============================================================================
// CONFIGURATION - 2024 Rates
// ============================================================================

export const SIO_CONFIG: SIOConfiguration = {
  bahraini: {
    employee: {
      pensionInsurance: 0.08,        // 8%
      unemploymentInsurance: 0.01,   // 1%
      total: 0.09,                   // 9%
    },
    employer: {
      pensionInsurance: 0.12,        // 12%
      unemploymentInsurance: 0.02,   // 2%
      workplaceInjury: 0.03,         // 3%
      total: 0.17,                   // 17%
    },
  },
  nonBahraini: {
    employee: {
      total: 0,                      // 0%
    },
    employer: {
      workplaceInjury: 0.03,         // 3%
      total: 0.03,                   // 3%
    },
  },
  salaryCeiling: 4000,               // BHD 4,000
  minimumWage: 300,                  // BHD 300
  effectiveDate: '2024-01-01',
};

// ============================================================================
// SIO SERVICE
// ============================================================================

export class BahrainSIOService {
  /**
   * Calculate SIO contributions for a single employee
   */
  static calculateContributions(
    employee: SIOEmployeeData,
    period: string = new Date().toISOString().slice(0, 7)
  ): SIOCalculationResult {
    const notes: string[] = [];
    const notesAr: string[] = [];

    // Calculate insurable salary (subject to ceiling)
    const insurableSalary = Math.min(employee.grossSalary, SIO_CONFIG.salaryCeiling);

    if (employee.grossSalary > SIO_CONFIG.salaryCeiling) {
      notes.push(`Salary capped at BHD ${SIO_CONFIG.salaryCeiling} ceiling`);
      notesAr.push(`تم تحديد سقف الراتب بمبلغ ${SIO_CONFIG.salaryCeiling} دينار بحريني`);
    }

    // Calculate based on nationality
    if (employee.nationality === 'BH') {
      return this.calculateBahrainiContributions(employee, insurableSalary, period, notes, notesAr);
    } else {
      return this.calculateNonBahrainiContributions(employee, insurableSalary, period, notes, notesAr);
    }
  }

  /**
   * Calculate contributions for Bahraini employees
   */
  private static calculateBahrainiContributions(
    employee: SIOEmployeeData,
    insurableSalary: number,
    period: string,
    notes: string[],
    notesAr: string[]
  ): SIOCalculationResult {
    const config = SIO_CONFIG.bahraini;

    // Employee contributions
    const employeePension = this.round(insurableSalary * config.employee.pensionInsurance);
    const employeeUnemployment = this.round(insurableSalary * config.employee.unemploymentInsurance);
    const employeeTotal = employeePension + employeeUnemployment;

    // Employer contributions
    const employerPension = this.round(insurableSalary * config.employer.pensionInsurance);
    const employerUnemployment = this.round(insurableSalary * config.employer.unemploymentInsurance);
    const employerWorkplaceInjury = this.round(insurableSalary * config.employer.workplaceInjury);
    const employerTotal = employerPension + employerUnemployment + employerWorkplaceInjury;

    notes.push('Bahraini employee - Full social insurance coverage');
    notesAr.push('موظف بحريني - تغطية تأمين اجتماعي كاملة');

    return {
      employeeId: employee.employeeId,
      cpr: employee.cpr,
      period,
      nationality: 'BH',
      insurableSalary,
      actualGrossSalary: employee.grossSalary,

      employeeContribution: {
        pensionInsurance: employeePension,
        unemploymentInsurance: employeeUnemployment,
        total: employeeTotal,
      },

      employerContribution: {
        pensionInsurance: employerPension,
        unemploymentInsurance: employerUnemployment,
        workplaceInjury: employerWorkplaceInjury,
        total: employerTotal,
      },

      totalContribution: employeeTotal + employerTotal,
      currency: COUNTRY_CURRENCIES.BH,
      calculatedAt: new Date(),
      notes,
      notesAr,
    };
  }

  /**
   * Calculate contributions for Non-Bahraini employees
   */
  private static calculateNonBahrainiContributions(
    employee: SIOEmployeeData,
    insurableSalary: number,
    period: string,
    notes: string[],
    notesAr: string[]
  ): SIOCalculationResult {
    const config = SIO_CONFIG.nonBahraini;

    // No employee contributions for non-Bahrainis
    const employeeTotal = 0;

    // Employer contributions (only workplace injury)
    const employerWorkplaceInjury = this.round(insurableSalary * config.employer.workplaceInjury);
    const employerTotal = employerWorkplaceInjury;

    notes.push('Non-Bahraini employee - Workplace injury insurance only');
    notesAr.push('موظف غير بحريني - تأمين إصابات العمل فقط');

    return {
      employeeId: employee.employeeId,
      cpr: employee.cpr,
      period,
      nationality: 'NON_BH',
      insurableSalary,
      actualGrossSalary: employee.grossSalary,

      employeeContribution: {
        pensionInsurance: 0,
        unemploymentInsurance: 0,
        total: employeeTotal,
      },

      employerContribution: {
        pensionInsurance: 0,
        unemploymentInsurance: 0,
        workplaceInjury: employerWorkplaceInjury,
        total: employerTotal,
      },

      totalContribution: employeeTotal + employerTotal,
      currency: COUNTRY_CURRENCIES.BH,
      calculatedAt: new Date(),
      notes,
      notesAr,
    };
  }

  /**
   * Calculate SIO contributions for multiple employees
   */
  static calculateBulk(
    employees: SIOEmployeeData[],
    period: string = new Date().toISOString().slice(0, 7)
  ): SIOCalculationResult[] {
    return employees.map(employee => this.calculateContributions(employee, period));
  }

  /**
   * Generate SIO submission file
   */
  static generateSubmissionFile(
    organizationId: string,
    commercialRegistration: string,
    sioEmployerNumber: string,
    employees: SIOEmployeeData[],
    period: string,
    generatedBy: string
  ): SIOSubmissionFile {
    const calculations = this.calculateBulk(employees, period);

    const records: SIOSubmissionRecord[] = calculations.map((calc, index) => ({
      employeeId: calc.employeeId,
      cpr: calc.cpr,
      employeeName: employees[index].fullName,
      employeeNameAr: employees[index].fullNameAr,
      nationality: calc.nationality === 'BH' ? 'Bahraini' : 'Non-Bahraini',
      basicSalary: employees[index].basicSalary,
      insurableSalary: calc.insurableSalary,
      employeeContribution: calc.employeeContribution.total,
      employerContribution: calc.employerContribution.total,
      totalContribution: calc.totalContribution,
    }));

    const totalBahrainis = calculations.filter(c => c.nationality === 'BH').length;
    const totalNonBahrainis = calculations.filter(c => c.nationality === 'NON_BH').length;

    return {
      organizationId,
      commercialRegistration,
      sioEmployerNumber,
      period,

      totalEmployees: employees.length,
      totalBahrainis,
      totalNonBahrainis,

      totalInsurableSalary: this.round(calculations.reduce((sum, c) => sum + c.insurableSalary, 0)),
      totalEmployeeContribution: this.round(calculations.reduce((sum, c) => sum + c.employeeContribution.total, 0)),
      totalEmployerContribution: this.round(calculations.reduce((sum, c) => sum + c.employerContribution.total, 0)),
      grandTotal: this.round(calculations.reduce((sum, c) => sum + c.totalContribution, 0)),

      records,

      generatedAt: new Date(),
      generatedBy,
      fileFormat: 'SIO_STANDARD',
    };
  }

  /**
   * Validate employee data for SIO submission
   */
  static validateEmployee(employee: SIOEmployeeData): SIOValidationResult {
    const errors: SIOValidationError[] = [];
    const warnings: SIOValidationWarning[] = [];

    // Validate CPR
    if (!this.validateCPR(employee.cpr)) {
      errors.push({
        employeeId: employee.employeeId,
        field: 'cpr',
        message: 'Invalid CPR number format',
        messageAr: 'صيغة رقم السجل السكاني غير صالحة',
      });
    }

    // Validate salary
    if (employee.grossSalary < SIO_CONFIG.minimumWage) {
      warnings.push({
        employeeId: employee.employeeId,
        field: 'grossSalary',
        message: `Salary below minimum wage of BHD ${SIO_CONFIG.minimumWage}`,
        messageAr: `الراتب أقل من الحد الأدنى للأجور ${SIO_CONFIG.minimumWage} دينار بحريني`,
      });
    }

    // Validate joining date
    if (employee.joiningDate > new Date()) {
      errors.push({
        employeeId: employee.employeeId,
        field: 'joiningDate',
        message: 'Joining date cannot be in the future',
        messageAr: 'تاريخ الالتحاق لا يمكن أن يكون في المستقبل',
      });
    }

    // Validate age (must be 15-60 for coverage)
    const age = this.calculateAge(employee.dateOfBirth);
    if (age < 15) {
      errors.push({
        employeeId: employee.employeeId,
        field: 'dateOfBirth',
        message: 'Employee must be at least 15 years old',
        messageAr: 'يجب أن يكون عمر الموظف 15 سنة على الأقل',
      });
    }
    if (age > 60 && employee.nationality === 'BH') {
      warnings.push({
        employeeId: employee.employeeId,
        field: 'dateOfBirth',
        message: 'Bahraini employee above 60 - verify pension eligibility',
        messageAr: 'موظف بحريني فوق 60 سنة - تحقق من أهلية التقاعد',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate multiple employees
   */
  static validateBulk(employees: SIOEmployeeData[]): SIOValidationResult {
    const allErrors: SIOValidationError[] = [];
    const allWarnings: SIOValidationWarning[] = [];

    employees.forEach(employee => {
      const result = this.validateEmployee(employee);
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
    });

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
    };
  }

  /**
   * Validate Bahrain CPR (Central Population Register) number
   * Format: 9 digits, often starts with 6 or 7 or 8 or 9
   */
  static validateCPR(cpr: string): boolean {
    if (!cpr) return false;
    const cleaned = cpr.replace(/[-\s]/g, '');
    const cprPattern = /^[0-9]{9}$/;
    return cprPattern.test(cleaned);
  }

  /**
   * Get SIO configuration
   */
  static getConfig(): SIOConfiguration {
    return { ...SIO_CONFIG };
  }

  /**
   * Get contribution rates summary
   */
  static getRatesSummary(): {
    bahraini: { employee: string; employer: string; total: string };
    nonBahraini: { employee: string; employer: string; total: string };
  } {
    const bahrainiEmployee = SIO_CONFIG.bahraini.employee.total * 100;
    const bahrainiEmployer = SIO_CONFIG.bahraini.employer.total * 100;
    const nonBahrainiEmployee = SIO_CONFIG.nonBahraini.employee.total * 100;
    const nonBahrainiEmployer = SIO_CONFIG.nonBahraini.employer.total * 100;

    return {
      bahraini: {
        employee: `${bahrainiEmployee}%`,
        employer: `${bahrainiEmployer}%`,
        total: `${bahrainiEmployee + bahrainiEmployer}%`,
      },
      nonBahraini: {
        employee: `${nonBahrainiEmployee}%`,
        employer: `${nonBahrainiEmployer}%`,
        total: `${nonBahrainiEmployee + nonBahrainiEmployer}%`,
      },
    };
  }

  /**
   * Calculate employer annual SIO cost for an employee
   */
  static calculateAnnualEmployerCost(employee: SIOEmployeeData): number {
    const monthlyContribution = this.calculateContributions(employee);
    return this.round(monthlyContribution.employerContribution.total * 12);
  }

  /**
   * Export submission file to CSV format
   */
  static exportToCSV(submissionFile: SIOSubmissionFile): string {
    const headers = [
      'CPR',
      'Employee Name',
      'Employee Name (Arabic)',
      'Nationality',
      'Basic Salary (BHD)',
      'Insurable Salary (BHD)',
      'Employee Contribution (BHD)',
      'Employer Contribution (BHD)',
      'Total Contribution (BHD)',
    ];

    const rows = submissionFile.records.map(record => [
      record.cpr,
      record.employeeName,
      record.employeeNameAr || '',
      record.nationality,
      record.basicSalary.toFixed(3),
      record.insurableSalary.toFixed(3),
      record.employeeContribution.toFixed(3),
      record.employerContribution.toFixed(3),
      record.totalContribution.toFixed(3),
    ]);

    // Add summary rows
    rows.push([]);
    rows.push(['', '', '', 'TOTAL', '',
      submissionFile.totalInsurableSalary.toFixed(3),
      submissionFile.totalEmployeeContribution.toFixed(3),
      submissionFile.totalEmployerContribution.toFixed(3),
      submissionFile.grandTotal.toFixed(3),
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private static round(value: number): number {
    return Math.round(value * 1000) / 1000; // BHD has 3 decimal places
  }

  private static calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }
}

export default BahrainSIOService;
