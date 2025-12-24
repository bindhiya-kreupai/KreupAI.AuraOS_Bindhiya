/**
 * Kuwait PIFSS (Public Institution for Social Security) Service
 * Calculates social security contributions for Kuwaiti nationals
 * Based on Social Security Law No. 61 of 1976 and amendments
 *
 * Key Features:
 * - Old age pension contributions
 * - Disability insurance
 * - Death benefits
 * - Supplementary contribution
 * - Support for Kuwaiti nationals (mandatory) and GCC nationals (optional)
 */

import { SupportedCountryCode, COUNTRY_CURRENCIES } from './types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PIFSSConfiguration {
  // Kuwaiti Employee Rates (2024)
  kuwaiti: {
    employee: {
      basicPension: number;            // 10.5% of salary
      supplementary: number;           // 2.5% of excess salary
      total: number;
    };
    employer: {
      basicPension: number;            // 11.5% of salary
      supplementary: number;           // 2.5% of excess salary
      total: number;
    };
    government: {
      contribution: number;            // 1% subsidy
      total: number;
    };
  };
  // GCC National Employee Rates (voluntary registration)
  gccNational: {
    employee: {
      basicPension: number;            // 10.5%
      total: number;
    };
    employer: {
      basicPension: number;            // 11.5%
      total: number;
    };
  };
  // Expatriate Employee Rates
  expatriate: {
    employee: {
      total: number;                   // 0% - no coverage
    };
    employer: {
      total: number;                   // 0% - no coverage
    };
  };
  // Salary components
  basicSalaryCeiling: number;          // KWD 2,750 for basic pension
  supplementarySalaryMin: number;      // KWD 1,500 - threshold for supplementary
  supplementarySalaryMax: number;      // KWD 2,750 - max for supplementary
  minimumWage: number;                 // KWD 75 for private sector
  effectiveDate: string;
}

export interface PIFSSEmployeeData {
  employeeId: string;
  civilId: string;                     // 12-digit Civil ID
  fullName: string;
  fullNameAr?: string;
  nationality: 'KW' | 'GCC' | 'NON_GCC'; // Kuwaiti, GCC National, or Other
  gccCountry?: 'AE' | 'SA' | 'BH' | 'QA' | 'OM'; // If GCC national
  dateOfBirth: Date;
  joiningDate: Date;
  basicSalary: number;                 // KWD
  socialAllowance?: number;            // KWD
  housingAllowance?: number;           // KWD
  transportAllowance?: number;         // KWD
  otherAllowances?: number;            // KWD
  grossSalary: number;                 // KWD - total monthly salary
  gender: 'M' | 'F';
  sector: 'PRIVATE' | 'GOVERNMENT' | 'OIL';
  registeredWithPIFSS: boolean;        // For GCC nationals (voluntary)
}

export interface PIFSSCalculationResult {
  employeeId: string;
  civilId: string;
  period: string;                      // YYYY-MM format
  nationality: 'KW' | 'GCC' | 'NON_GCC';

  // Salary breakdown
  basicInsurableSalary: number;        // Subject to KWD 2,750 ceiling
  supplementaryInsurableSalary: number; // Salary between 1,500 and 2,750
  actualGrossSalary: number;

  // Employee Contribution
  employeeContribution: {
    basicPension: number;
    supplementary: number;
    total: number;
  };

  // Employer Contribution
  employerContribution: {
    basicPension: number;
    supplementary: number;
    total: number;
  };

  // Government Contribution (Kuwaitis only)
  governmentContribution: {
    contribution: number;
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

export interface PIFSSSubmissionRecord {
  employeeId: string;
  civilId: string;
  employeeName: string;
  employeeNameAr?: string;
  nationality: string;
  basicSalary: number;
  basicInsurableSalary: number;
  supplementaryInsurableSalary: number;
  employeeContribution: number;
  employerContribution: number;
  governmentContribution: number;
  totalContribution: number;
}

export interface PIFSSSubmissionFile {
  organizationId: string;
  commercialLicense: string;           // MOC license number
  pifssEmployerNumber: string;         // PIFSS registration number
  period: string;                      // YYYY-MM

  totalEmployees: number;
  totalKuwaitis: number;
  totalGCCNationals: number;
  totalExpatriates: number;

  totalBasicInsurableSalary: number;
  totalSupplementarySalary: number;
  totalEmployeeContribution: number;
  totalEmployerContribution: number;
  totalGovernmentContribution: number;
  grandTotal: number;

  records: PIFSSSubmissionRecord[];

  generatedAt: Date;
  generatedBy: string;
  fileFormat: 'PIFSS_STANDARD' | 'EXCEL';
}

export interface PIFSSValidationResult {
  isValid: boolean;
  errors: PIFSSValidationError[];
  warnings: PIFSSValidationWarning[];
}

export interface PIFSSValidationError {
  employeeId: string;
  field: string;
  message: string;
  messageAr: string;
}

export interface PIFSSValidationWarning {
  employeeId: string;
  field: string;
  message: string;
  messageAr: string;
}

// ============================================================================
// CONFIGURATION - 2024 Rates
// ============================================================================

export const PIFSS_CONFIG: PIFSSConfiguration = {
  kuwaiti: {
    employee: {
      basicPension: 0.105,             // 10.5%
      supplementary: 0.025,            // 2.5%
      total: 0.13,                     // 13% max
    },
    employer: {
      basicPension: 0.115,             // 11.5%
      supplementary: 0.025,            // 2.5%
      total: 0.14,                     // 14% max
    },
    government: {
      contribution: 0.01,              // 1%
      total: 0.01,
    },
  },
  gccNational: {
    employee: {
      basicPension: 0.105,             // 10.5%
      total: 0.105,
    },
    employer: {
      basicPension: 0.115,             // 11.5%
      total: 0.115,
    },
  },
  expatriate: {
    employee: {
      total: 0,
    },
    employer: {
      total: 0,
    },
  },
  basicSalaryCeiling: 2750,            // KWD 2,750
  supplementarySalaryMin: 1500,        // KWD 1,500
  supplementarySalaryMax: 2750,        // KWD 2,750
  minimumWage: 75,                     // KWD 75
  effectiveDate: '2024-01-01',
};

// ============================================================================
// PIFSS SERVICE
// ============================================================================

export class KuwaitPIFSSService {
  /**
   * Calculate PIFSS contributions for a single employee
   */
  static calculateContributions(
    employee: PIFSSEmployeeData,
    period: string = new Date().toISOString().slice(0, 7)
  ): PIFSSCalculationResult {
    const notes: string[] = [];
    const notesAr: string[] = [];

    // Calculate based on nationality
    switch (employee.nationality) {
      case 'KW':
        return this.calculateKuwaitiContributions(employee, period, notes, notesAr);
      case 'GCC':
        return this.calculateGCCContributions(employee, period, notes, notesAr);
      default:
        return this.calculateExpatriateContributions(employee, period, notes, notesAr);
    }
  }

  /**
   * Calculate contributions for Kuwaiti employees
   */
  private static calculateKuwaitiContributions(
    employee: PIFSSEmployeeData,
    period: string,
    notes: string[],
    notesAr: string[]
  ): PIFSSCalculationResult {
    const config = PIFSS_CONFIG.kuwaiti;

    // Calculate basic insurable salary (capped at KWD 2,750)
    const basicInsurableSalary = Math.min(employee.grossSalary, PIFSS_CONFIG.basicSalaryCeiling);

    // Calculate supplementary insurable salary (between 1,500 and 2,750)
    let supplementaryInsurableSalary = 0;
    if (employee.grossSalary > PIFSS_CONFIG.supplementarySalaryMin) {
      const excessSalary = employee.grossSalary - PIFSS_CONFIG.supplementarySalaryMin;
      const maxSupplementary = PIFSS_CONFIG.supplementarySalaryMax - PIFSS_CONFIG.supplementarySalaryMin;
      supplementaryInsurableSalary = Math.min(excessSalary, maxSupplementary);
    }

    // Employee contributions
    const employeeBasicPension = this.round(basicInsurableSalary * config.employee.basicPension);
    const employeeSupplementary = this.round(supplementaryInsurableSalary * config.employee.supplementary);
    const employeeTotal = employeeBasicPension + employeeSupplementary;

    // Employer contributions
    const employerBasicPension = this.round(basicInsurableSalary * config.employer.basicPension);
    const employerSupplementary = this.round(supplementaryInsurableSalary * config.employer.supplementary);
    const employerTotal = employerBasicPension + employerSupplementary;

    // Government contribution
    const govtContribution = this.round(basicInsurableSalary * config.government.contribution);
    const govtTotal = govtContribution;

    if (employee.grossSalary > PIFSS_CONFIG.basicSalaryCeiling) {
      notes.push(`Salary capped at KWD ${PIFSS_CONFIG.basicSalaryCeiling} ceiling`);
      notesAr.push(`تم تحديد سقف الراتب بمبلغ ${PIFSS_CONFIG.basicSalaryCeiling} دينار كويتي`);
    }

    if (supplementaryInsurableSalary > 0) {
      notes.push('Supplementary contribution applies for salary above KWD 1,500');
      notesAr.push('تنطبق المساهمة التكميلية على الراتب فوق 1500 دينار كويتي');
    }

    notes.push('Kuwaiti employee - Full PIFSS coverage');
    notes.push('Government contributes 1% towards pension');
    notesAr.push('موظف كويتي - تغطية تأمينات كاملة');
    notesAr.push('تساهم الحكومة بنسبة 1% في المعاش');

    return {
      employeeId: employee.employeeId,
      civilId: employee.civilId,
      period,
      nationality: 'KW',
      basicInsurableSalary,
      supplementaryInsurableSalary,
      actualGrossSalary: employee.grossSalary,

      employeeContribution: {
        basicPension: employeeBasicPension,
        supplementary: employeeSupplementary,
        total: employeeTotal,
      },

      employerContribution: {
        basicPension: employerBasicPension,
        supplementary: employerSupplementary,
        total: employerTotal,
      },

      governmentContribution: {
        contribution: govtContribution,
        total: govtTotal,
      },

      totalContribution: employeeTotal + employerTotal + govtTotal,
      currency: COUNTRY_CURRENCIES.KW,
      calculatedAt: new Date(),
      notes,
      notesAr,
    };
  }

  /**
   * Calculate contributions for GCC nationals (voluntary)
   */
  private static calculateGCCContributions(
    employee: PIFSSEmployeeData,
    period: string,
    notes: string[],
    notesAr: string[]
  ): PIFSSCalculationResult {
    // If not registered, return zero contributions
    if (!employee.registeredWithPIFSS) {
      notes.push('GCC national not registered with PIFSS - no contributions');
      notesAr.push('مواطن خليجي غير مسجل في التأمينات - لا توجد اشتراكات');

      return {
        employeeId: employee.employeeId,
        civilId: employee.civilId,
        period,
        nationality: 'GCC',
        basicInsurableSalary: 0,
        supplementaryInsurableSalary: 0,
        actualGrossSalary: employee.grossSalary,

        employeeContribution: { basicPension: 0, supplementary: 0, total: 0 },
        employerContribution: { basicPension: 0, supplementary: 0, total: 0 },
        governmentContribution: { contribution: 0, total: 0 },

        totalContribution: 0,
        currency: COUNTRY_CURRENCIES.KW,
        calculatedAt: new Date(),
        notes,
        notesAr,
      };
    }

    const config = PIFSS_CONFIG.gccNational;

    // Calculate basic insurable salary (capped at KWD 2,750)
    const basicInsurableSalary = Math.min(employee.grossSalary, PIFSS_CONFIG.basicSalaryCeiling);

    // Employee contributions
    const employeeBasicPension = this.round(basicInsurableSalary * config.employee.basicPension);
    const employeeTotal = employeeBasicPension;

    // Employer contributions
    const employerBasicPension = this.round(basicInsurableSalary * config.employer.basicPension);
    const employerTotal = employerBasicPension;

    notes.push(`GCC national (${employee.gccCountry || 'GCC'}) - Registered with PIFSS`);
    notes.push('Voluntary participation - basic pension coverage only');
    notesAr.push(`مواطن خليجي (${employee.gccCountry || 'GCC'}) - مسجل في التأمينات`);
    notesAr.push('مشاركة تطوعية - تغطية المعاش الأساسي فقط');

    return {
      employeeId: employee.employeeId,
      civilId: employee.civilId,
      period,
      nationality: 'GCC',
      basicInsurableSalary,
      supplementaryInsurableSalary: 0,
      actualGrossSalary: employee.grossSalary,

      employeeContribution: {
        basicPension: employeeBasicPension,
        supplementary: 0,
        total: employeeTotal,
      },

      employerContribution: {
        basicPension: employerBasicPension,
        supplementary: 0,
        total: employerTotal,
      },

      governmentContribution: {
        contribution: 0,
        total: 0,
      },

      totalContribution: employeeTotal + employerTotal,
      currency: COUNTRY_CURRENCIES.KW,
      calculatedAt: new Date(),
      notes,
      notesAr,
    };
  }

  /**
   * Calculate contributions for expatriate employees
   */
  private static calculateExpatriateContributions(
    employee: PIFSSEmployeeData,
    period: string,
    notes: string[],
    notesAr: string[]
  ): PIFSSCalculationResult {
    notes.push('Expatriate employee - Not covered by PIFSS');
    notes.push('Employer responsible for end-of-service benefits under Labour Law');
    notesAr.push('موظف وافد - غير مشمول بالتأمينات');
    notesAr.push('صاحب العمل مسؤول عن مكافأة نهاية الخدمة وفقاً لقانون العمل');

    return {
      employeeId: employee.employeeId,
      civilId: employee.civilId,
      period,
      nationality: 'NON_GCC',
      basicInsurableSalary: 0,
      supplementaryInsurableSalary: 0,
      actualGrossSalary: employee.grossSalary,

      employeeContribution: { basicPension: 0, supplementary: 0, total: 0 },
      employerContribution: { basicPension: 0, supplementary: 0, total: 0 },
      governmentContribution: { contribution: 0, total: 0 },

      totalContribution: 0,
      currency: COUNTRY_CURRENCIES.KW,
      calculatedAt: new Date(),
      notes,
      notesAr,
    };
  }

  /**
   * Calculate PIFSS contributions for multiple employees
   */
  static calculateBulk(
    employees: PIFSSEmployeeData[],
    period: string = new Date().toISOString().slice(0, 7)
  ): PIFSSCalculationResult[] {
    return employees.map(employee => this.calculateContributions(employee, period));
  }

  /**
   * Generate PIFSS submission file
   */
  static generateSubmissionFile(
    organizationId: string,
    commercialLicense: string,
    pifssEmployerNumber: string,
    employees: PIFSSEmployeeData[],
    period: string,
    generatedBy: string
  ): PIFSSSubmissionFile {
    const calculations = this.calculateBulk(employees, period);

    const records: PIFSSSubmissionRecord[] = calculations.map((calc, index) => ({
      employeeId: calc.employeeId,
      civilId: calc.civilId,
      employeeName: employees[index].fullName,
      employeeNameAr: employees[index].fullNameAr,
      nationality: calc.nationality === 'KW' ? 'Kuwaiti' :
                   calc.nationality === 'GCC' ? 'GCC National' : 'Expatriate',
      basicSalary: employees[index].basicSalary,
      basicInsurableSalary: calc.basicInsurableSalary,
      supplementaryInsurableSalary: calc.supplementaryInsurableSalary,
      employeeContribution: calc.employeeContribution.total,
      employerContribution: calc.employerContribution.total,
      governmentContribution: calc.governmentContribution.total,
      totalContribution: calc.totalContribution,
    }));

    const totalKuwaitis = calculations.filter(c => c.nationality === 'KW').length;
    const totalGCCNationals = calculations.filter(c => c.nationality === 'GCC').length;
    const totalExpatriates = calculations.filter(c => c.nationality === 'NON_GCC').length;

    return {
      organizationId,
      commercialLicense,
      pifssEmployerNumber,
      period,

      totalEmployees: employees.length,
      totalKuwaitis,
      totalGCCNationals,
      totalExpatriates,

      totalBasicInsurableSalary: this.round(calculations.reduce((sum, c) => sum + c.basicInsurableSalary, 0)),
      totalSupplementarySalary: this.round(calculations.reduce((sum, c) => sum + c.supplementaryInsurableSalary, 0)),
      totalEmployeeContribution: this.round(calculations.reduce((sum, c) => sum + c.employeeContribution.total, 0)),
      totalEmployerContribution: this.round(calculations.reduce((sum, c) => sum + c.employerContribution.total, 0)),
      totalGovernmentContribution: this.round(calculations.reduce((sum, c) => sum + c.governmentContribution.total, 0)),
      grandTotal: this.round(calculations.reduce((sum, c) => sum + c.totalContribution, 0)),

      records,

      generatedAt: new Date(),
      generatedBy,
      fileFormat: 'PIFSS_STANDARD',
    };
  }

  /**
   * Validate employee data for PIFSS submission
   */
  static validateEmployee(employee: PIFSSEmployeeData): PIFSSValidationResult {
    const errors: PIFSSValidationError[] = [];
    const warnings: PIFSSValidationWarning[] = [];

    // Validate Civil ID for Kuwaitis
    if (employee.nationality === 'KW') {
      if (!this.validateCivilId(employee.civilId)) {
        errors.push({
          employeeId: employee.employeeId,
          field: 'civilId',
          message: 'Invalid Kuwait Civil ID format',
          messageAr: 'صيغة الرقم المدني الكويتي غير صالحة',
        });
      }
    }

    // Validate salary
    if (employee.grossSalary < PIFSS_CONFIG.minimumWage) {
      warnings.push({
        employeeId: employee.employeeId,
        field: 'grossSalary',
        message: `Salary below minimum wage of KWD ${PIFSS_CONFIG.minimumWage}`,
        messageAr: `الراتب أقل من الحد الأدنى للأجور ${PIFSS_CONFIG.minimumWage} دينار كويتي`,
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

    // Validate age (18-65 for PIFSS)
    const age = this.calculateAge(employee.dateOfBirth);
    if (age < 18 && employee.nationality === 'KW') {
      errors.push({
        employeeId: employee.employeeId,
        field: 'dateOfBirth',
        message: 'Kuwaiti employee must be at least 18 years old for PIFSS',
        messageAr: 'يجب أن يكون عمر الموظف الكويتي 18 سنة على الأقل للتأمينات',
      });
    }
    if (age > 65 && employee.nationality === 'KW') {
      warnings.push({
        employeeId: employee.employeeId,
        field: 'dateOfBirth',
        message: 'Kuwaiti employee above 65 - verify pension eligibility',
        messageAr: 'موظف كويتي فوق 65 سنة - تحقق من أهلية التقاعد',
      });
    }

    // Validate GCC country for GCC nationals
    if (employee.nationality === 'GCC' && !employee.gccCountry) {
      warnings.push({
        employeeId: employee.employeeId,
        field: 'gccCountry',
        message: 'GCC country not specified',
        messageAr: 'لم يتم تحديد دولة الخليج',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate Kuwait Civil ID
   * Format: 12 digits
   */
  static validateCivilId(civilId: string): boolean {
    if (!civilId) return false;
    const cleaned = civilId.replace(/[-\s]/g, '');
    return /^[0-9]{12}$/.test(cleaned);
  }

  /**
   * Get PIFSS configuration
   */
  static getConfig(): PIFSSConfiguration {
    return { ...PIFSS_CONFIG };
  }

  /**
   * Get contribution rates summary
   */
  static getRatesSummary(): {
    kuwaiti: { employee: string; employer: string; government: string; total: string };
    gccNational: { employee: string; employer: string; total: string };
    expatriate: { employee: string; employer: string; total: string };
  } {
    const config = PIFSS_CONFIG;

    return {
      kuwaiti: {
        employee: `${config.kuwaiti.employee.total * 100}% (max)`,
        employer: `${config.kuwaiti.employer.total * 100}% (max)`,
        government: `${config.kuwaiti.government.total * 100}%`,
        total: `${(config.kuwaiti.employee.total + config.kuwaiti.employer.total + config.kuwaiti.government.total) * 100}% (max)`,
      },
      gccNational: {
        employee: `${config.gccNational.employee.total * 100}%`,
        employer: `${config.gccNational.employer.total * 100}%`,
        total: `${(config.gccNational.employee.total + config.gccNational.employer.total) * 100}%`,
      },
      expatriate: {
        employee: '0%',
        employer: '0%',
        total: '0% (EOSB under Labour Law)',
      },
    };
  }

  /**
   * Calculate annual employer cost
   */
  static calculateAnnualEmployerCost(employee: PIFSSEmployeeData): number {
    const monthlyContribution = this.calculateContributions(employee);
    return this.round(monthlyContribution.employerContribution.total * 12);
  }

  /**
   * Export submission file to CSV format
   */
  static exportToCSV(submissionFile: PIFSSSubmissionFile): string {
    const headers = [
      'Civil ID',
      'Employee Name',
      'Employee Name (Arabic)',
      'Nationality',
      'Basic Salary (KWD)',
      'Basic Insurable (KWD)',
      'Supplementary (KWD)',
      'Employee Contribution (KWD)',
      'Employer Contribution (KWD)',
      'Government Contribution (KWD)',
      'Total Contribution (KWD)',
    ];

    const rows = submissionFile.records.map(record => [
      record.civilId,
      record.employeeName,
      record.employeeNameAr || '',
      record.nationality,
      record.basicSalary.toFixed(3),
      record.basicInsurableSalary.toFixed(3),
      record.supplementaryInsurableSalary.toFixed(3),
      record.employeeContribution.toFixed(3),
      record.employerContribution.toFixed(3),
      record.governmentContribution.toFixed(3),
      record.totalContribution.toFixed(3),
    ]);

    // Summary rows
    rows.push([]);
    rows.push(['', '', '', 'TOTAL', '',
      submissionFile.totalBasicInsurableSalary.toFixed(3),
      submissionFile.totalSupplementarySalary.toFixed(3),
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
    return Math.round(value * 1000) / 1000; // KWD has 3 decimal places
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

export default KuwaitPIFSSService;
