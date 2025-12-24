/**
 * Oman SPF (Social Protection Fund) Service
 * Calculates social security contributions for Omani nationals
 * Based on the Social Protection Law (Royal Decree 52/2023)
 *
 * Key Features:
 * - Pension contributions (Old age, disability, death)
 * - Occupational hazard insurance
 * - Maternity/paternity benefits
 * - Unemployment insurance
 * - Support for both Omani nationals and expatriates
 */

import { SupportedCountryCode, COUNTRY_CURRENCIES } from './types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SPFConfiguration {
  // Omani Employee Rates (2024)
  omani: {
    employee: {
      oldAgePension: number;           // 7% of insurable salary
      unemployment: number;            // 1% of insurable salary
      total: number;                   // 8%
    };
    employer: {
      oldAgePension: number;           // 11.5% of insurable salary
      occupationalHazard: number;      // 1% of insurable salary
      unemployment: number;            // 1% of insurable salary
      maternityPaternity: number;      // 0.5% of insurable salary
      total: number;                   // 14%
    };
    government: {
      oldAgePension: number;           // 2.5% subsidy
      total: number;                   // 2.5%
    };
  };
  // Expatriate Employee Rates
  expatriate: {
    employee: {
      total: number;                   // 0% - no employee contribution
    };
    employer: {
      occupationalHazard: number;      // 1% of insurable salary
      total: number;                   // 1%
    };
  };
  // Salary ceiling for contributions
  salaryCeiling: number;               // OMR 3,000
  minimumWage: number;                 // OMR 325 for private sector
  effectiveDate: string;
}

export interface SPFEmployeeData {
  employeeId: string;
  civilId: string;                     // 8-digit Civil ID
  fullName: string;
  fullNameAr?: string;
  nationality: 'OM' | 'NON_OM';        // Omani or Non-Omani
  dateOfBirth: Date;
  joiningDate: Date;
  basicSalary: number;                 // OMR
  socialAllowance?: number;            // OMR
  housingAllowance?: number;           // OMR
  transportAllowance?: number;         // OMR
  otherAllowances?: number;            // OMR
  grossSalary: number;                 // OMR - total monthly salary
  gender: 'M' | 'F';                   // For maternity calculations
  sector: 'PRIVATE' | 'GOVERNMENT';    // Employment sector
}

export interface SPFCalculationResult {
  employeeId: string;
  civilId: string;
  period: string;                      // YYYY-MM format
  nationality: 'OM' | 'NON_OM';
  insurableSalary: number;             // Subject to OMR 3,000 ceiling
  actualGrossSalary: number;

  // Employee Contribution
  employeeContribution: {
    oldAgePension: number;
    unemployment: number;
    total: number;
  };

  // Employer Contribution
  employerContribution: {
    oldAgePension: number;
    occupationalHazard: number;
    unemployment: number;
    maternityPaternity: number;
    total: number;
  };

  // Government Contribution (Omanis only)
  governmentContribution: {
    oldAgePension: number;
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

export interface SPFSubmissionRecord {
  employeeId: string;
  civilId: string;
  employeeName: string;
  employeeNameAr?: string;
  nationality: string;
  basicSalary: number;
  insurableSalary: number;
  employeeContribution: number;
  employerContribution: number;
  governmentContribution: number;
  totalContribution: number;
}

export interface SPFSubmissionFile {
  organizationId: string;
  commercialRegistration: string;      // CR number
  spfEmployerNumber: string;           // SPF registration number
  period: string;                      // YYYY-MM

  totalEmployees: number;
  totalOmanis: number;
  totalExpatriates: number;

  totalInsurableSalary: number;
  totalEmployeeContribution: number;
  totalEmployerContribution: number;
  totalGovernmentContribution: number;
  grandTotal: number;

  records: SPFSubmissionRecord[];

  generatedAt: Date;
  generatedBy: string;
  fileFormat: 'SPF_STANDARD' | 'EXCEL';
}

export interface SPFValidationResult {
  isValid: boolean;
  errors: SPFValidationError[];
  warnings: SPFValidationWarning[];
}

export interface SPFValidationError {
  employeeId: string;
  field: string;
  message: string;
  messageAr: string;
}

export interface SPFValidationWarning {
  employeeId: string;
  field: string;
  message: string;
  messageAr: string;
}

// ============================================================================
// CONFIGURATION - 2024 Rates (Royal Decree 52/2023)
// ============================================================================

export const SPF_CONFIG: SPFConfiguration = {
  omani: {
    employee: {
      oldAgePension: 0.07,             // 7%
      unemployment: 0.01,              // 1%
      total: 0.08,                     // 8%
    },
    employer: {
      oldAgePension: 0.115,            // 11.5%
      occupationalHazard: 0.01,        // 1%
      unemployment: 0.01,              // 1%
      maternityPaternity: 0.005,       // 0.5%
      total: 0.14,                     // 14%
    },
    government: {
      oldAgePension: 0.025,            // 2.5%
      total: 0.025,                    // 2.5%
    },
  },
  expatriate: {
    employee: {
      total: 0,                        // 0%
    },
    employer: {
      occupationalHazard: 0.01,        // 1%
      total: 0.01,                     // 1%
    },
  },
  salaryCeiling: 3000,                 // OMR 3,000
  minimumWage: 325,                    // OMR 325
  effectiveDate: '2024-01-01',
};

// ============================================================================
// SPF SERVICE
// ============================================================================

export class OmanSPFService {
  /**
   * Calculate SPF contributions for a single employee
   */
  static calculateContributions(
    employee: SPFEmployeeData,
    period: string = new Date().toISOString().slice(0, 7)
  ): SPFCalculationResult {
    const notes: string[] = [];
    const notesAr: string[] = [];

    // Calculate insurable salary (subject to ceiling)
    const insurableSalary = Math.min(employee.grossSalary, SPF_CONFIG.salaryCeiling);

    if (employee.grossSalary > SPF_CONFIG.salaryCeiling) {
      notes.push(`Salary capped at OMR ${SPF_CONFIG.salaryCeiling} ceiling`);
      notesAr.push(`تم تحديد سقف الراتب بمبلغ ${SPF_CONFIG.salaryCeiling} ريال عماني`);
    }

    // Calculate based on nationality
    if (employee.nationality === 'OM') {
      return this.calculateOmaniContributions(employee, insurableSalary, period, notes, notesAr);
    } else {
      return this.calculateExpatriateContributions(employee, insurableSalary, period, notes, notesAr);
    }
  }

  /**
   * Calculate contributions for Omani employees
   */
  private static calculateOmaniContributions(
    employee: SPFEmployeeData,
    insurableSalary: number,
    period: string,
    notes: string[],
    notesAr: string[]
  ): SPFCalculationResult {
    const config = SPF_CONFIG.omani;

    // Employee contributions
    const employeeOldAge = this.round(insurableSalary * config.employee.oldAgePension);
    const employeeUnemployment = this.round(insurableSalary * config.employee.unemployment);
    const employeeTotal = employeeOldAge + employeeUnemployment;

    // Employer contributions
    const employerOldAge = this.round(insurableSalary * config.employer.oldAgePension);
    const employerOccupational = this.round(insurableSalary * config.employer.occupationalHazard);
    const employerUnemployment = this.round(insurableSalary * config.employer.unemployment);
    const employerMaternity = this.round(insurableSalary * config.employer.maternityPaternity);
    const employerTotal = employerOldAge + employerOccupational + employerUnemployment + employerMaternity;

    // Government contribution
    const govtOldAge = this.round(insurableSalary * config.government.oldAgePension);
    const govtTotal = govtOldAge;

    notes.push('Omani employee - Full social protection coverage');
    notes.push('Government contributes 2.5% towards old age pension');
    notesAr.push('موظف عماني - تغطية حماية اجتماعية كاملة');
    notesAr.push('تساهم الحكومة بنسبة 2.5% في معاش الشيخوخة');

    return {
      employeeId: employee.employeeId,
      civilId: employee.civilId,
      period,
      nationality: 'OM',
      insurableSalary,
      actualGrossSalary: employee.grossSalary,

      employeeContribution: {
        oldAgePension: employeeOldAge,
        unemployment: employeeUnemployment,
        total: employeeTotal,
      },

      employerContribution: {
        oldAgePension: employerOldAge,
        occupationalHazard: employerOccupational,
        unemployment: employerUnemployment,
        maternityPaternity: employerMaternity,
        total: employerTotal,
      },

      governmentContribution: {
        oldAgePension: govtOldAge,
        total: govtTotal,
      },

      totalContribution: employeeTotal + employerTotal + govtTotal,
      currency: COUNTRY_CURRENCIES.OM,
      calculatedAt: new Date(),
      notes,
      notesAr,
    };
  }

  /**
   * Calculate contributions for expatriate employees
   */
  private static calculateExpatriateContributions(
    employee: SPFEmployeeData,
    insurableSalary: number,
    period: string,
    notes: string[],
    notesAr: string[]
  ): SPFCalculationResult {
    const config = SPF_CONFIG.expatriate;

    // No employee contributions for expatriates
    const employeeTotal = 0;

    // Employer contributions (only occupational hazard)
    const employerOccupational = this.round(insurableSalary * config.employer.occupationalHazard);
    const employerTotal = employerOccupational;

    notes.push('Expatriate employee - Occupational hazard insurance only');
    notesAr.push('موظف وافد - تأمين إصابات العمل فقط');

    return {
      employeeId: employee.employeeId,
      civilId: employee.civilId,
      period,
      nationality: 'NON_OM',
      insurableSalary,
      actualGrossSalary: employee.grossSalary,

      employeeContribution: {
        oldAgePension: 0,
        unemployment: 0,
        total: employeeTotal,
      },

      employerContribution: {
        oldAgePension: 0,
        occupationalHazard: employerOccupational,
        unemployment: 0,
        maternityPaternity: 0,
        total: employerTotal,
      },

      governmentContribution: {
        oldAgePension: 0,
        total: 0,
      },

      totalContribution: employeeTotal + employerTotal,
      currency: COUNTRY_CURRENCIES.OM,
      calculatedAt: new Date(),
      notes,
      notesAr,
    };
  }

  /**
   * Calculate SPF contributions for multiple employees
   */
  static calculateBulk(
    employees: SPFEmployeeData[],
    period: string = new Date().toISOString().slice(0, 7)
  ): SPFCalculationResult[] {
    return employees.map(employee => this.calculateContributions(employee, period));
  }

  /**
   * Generate SPF submission file
   */
  static generateSubmissionFile(
    organizationId: string,
    commercialRegistration: string,
    spfEmployerNumber: string,
    employees: SPFEmployeeData[],
    period: string,
    generatedBy: string
  ): SPFSubmissionFile {
    const calculations = this.calculateBulk(employees, period);

    const records: SPFSubmissionRecord[] = calculations.map((calc, index) => ({
      employeeId: calc.employeeId,
      civilId: calc.civilId,
      employeeName: employees[index].fullName,
      employeeNameAr: employees[index].fullNameAr,
      nationality: calc.nationality === 'OM' ? 'Omani' : 'Expatriate',
      basicSalary: employees[index].basicSalary,
      insurableSalary: calc.insurableSalary,
      employeeContribution: calc.employeeContribution.total,
      employerContribution: calc.employerContribution.total,
      governmentContribution: calc.governmentContribution.total,
      totalContribution: calc.totalContribution,
    }));

    const totalOmanis = calculations.filter(c => c.nationality === 'OM').length;
    const totalExpatriates = calculations.filter(c => c.nationality === 'NON_OM').length;

    return {
      organizationId,
      commercialRegistration,
      spfEmployerNumber,
      period,

      totalEmployees: employees.length,
      totalOmanis,
      totalExpatriates,

      totalInsurableSalary: this.round(calculations.reduce((sum, c) => sum + c.insurableSalary, 0)),
      totalEmployeeContribution: this.round(calculations.reduce((sum, c) => sum + c.employeeContribution.total, 0)),
      totalEmployerContribution: this.round(calculations.reduce((sum, c) => sum + c.employerContribution.total, 0)),
      totalGovernmentContribution: this.round(calculations.reduce((sum, c) => sum + c.governmentContribution.total, 0)),
      grandTotal: this.round(calculations.reduce((sum, c) => sum + c.totalContribution, 0)),

      records,

      generatedAt: new Date(),
      generatedBy,
      fileFormat: 'SPF_STANDARD',
    };
  }

  /**
   * Validate employee data for SPF submission
   */
  static validateEmployee(employee: SPFEmployeeData): SPFValidationResult {
    const errors: SPFValidationError[] = [];
    const warnings: SPFValidationWarning[] = [];

    // Validate Civil ID
    if (!this.validateCivilId(employee.civilId)) {
      errors.push({
        employeeId: employee.employeeId,
        field: 'civilId',
        message: 'Invalid Civil ID format',
        messageAr: 'صيغة الرقم المدني غير صالحة',
      });
    }

    // Validate salary
    if (employee.grossSalary < SPF_CONFIG.minimumWage) {
      warnings.push({
        employeeId: employee.employeeId,
        field: 'grossSalary',
        message: `Salary below minimum wage of OMR ${SPF_CONFIG.minimumWage}`,
        messageAr: `الراتب أقل من الحد الأدنى للأجور ${SPF_CONFIG.minimumWage} ريال عماني`,
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
    if (age > 60 && employee.nationality === 'OM') {
      warnings.push({
        employeeId: employee.employeeId,
        field: 'dateOfBirth',
        message: 'Omani employee above 60 - verify pension eligibility',
        messageAr: 'موظف عماني فوق 60 سنة - تحقق من أهلية التقاعد',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate Oman Civil ID
   * Format: 8 digits
   */
  static validateCivilId(civilId: string): boolean {
    if (!civilId) return false;
    const cleaned = civilId.replace(/[-\s]/g, '');
    return /^[0-9]{8}$/.test(cleaned);
  }

  /**
   * Get SPF configuration
   */
  static getConfig(): SPFConfiguration {
    return { ...SPF_CONFIG };
  }

  /**
   * Get contribution rates summary
   */
  static getRatesSummary(): {
    omani: { employee: string; employer: string; government: string; total: string };
    expatriate: { employee: string; employer: string; total: string };
  } {
    const config = SPF_CONFIG;
    const omaniEmployee = config.omani.employee.total * 100;
    const omaniEmployer = config.omani.employer.total * 100;
    const omaniGovt = config.omani.government.total * 100;
    const expatEmployee = config.expatriate.employee.total * 100;
    const expatEmployer = config.expatriate.employer.total * 100;

    return {
      omani: {
        employee: `${omaniEmployee}%`,
        employer: `${omaniEmployer}%`,
        government: `${omaniGovt}%`,
        total: `${omaniEmployee + omaniEmployer + omaniGovt}%`,
      },
      expatriate: {
        employee: `${expatEmployee}%`,
        employer: `${expatEmployer}%`,
        total: `${expatEmployee + expatEmployer}%`,
      },
    };
  }

  /**
   * Calculate annual employer cost
   */
  static calculateAnnualEmployerCost(employee: SPFEmployeeData): number {
    const monthlyContribution = this.calculateContributions(employee);
    return this.round(monthlyContribution.employerContribution.total * 12);
  }

  /**
   * Export submission file to CSV format
   */
  static exportToCSV(submissionFile: SPFSubmissionFile): string {
    const headers = [
      'Civil ID',
      'Employee Name',
      'Employee Name (Arabic)',
      'Nationality',
      'Basic Salary (OMR)',
      'Insurable Salary (OMR)',
      'Employee Contribution (OMR)',
      'Employer Contribution (OMR)',
      'Government Contribution (OMR)',
      'Total Contribution (OMR)',
    ];

    const rows = submissionFile.records.map(record => [
      record.civilId,
      record.employeeName,
      record.employeeNameAr || '',
      record.nationality,
      record.basicSalary.toFixed(3),
      record.insurableSalary.toFixed(3),
      record.employeeContribution.toFixed(3),
      record.employerContribution.toFixed(3),
      record.governmentContribution.toFixed(3),
      record.totalContribution.toFixed(3),
    ]);

    // Summary rows
    rows.push([]);
    rows.push(['', '', '', 'TOTAL', '',
      submissionFile.totalInsurableSalary.toFixed(3),
      submissionFile.totalEmployeeContribution.toFixed(3),
      submissionFile.totalEmployerContribution.toFixed(3),
      submissionFile.totalGovernmentContribution.toFixed(3),
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
    return Math.round(value * 1000) / 1000; // OMR has 3 decimal places
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

export default OmanSPFService;
