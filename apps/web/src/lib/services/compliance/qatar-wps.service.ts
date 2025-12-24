/**
 * Qatar WPS (Wage Protection System) Service
 * Based on Ministry of Labour (ADLSA) requirements
 * Law No. 18 of 2020 regulating wages in the private sector
 *
 * Key Features:
 * - SIF (Salary Information File) generation per Qatar Central Bank format
 * - Minimum wage compliance (QAR 1,000)
 * - Real-time salary payment tracking
 * - Bilingual support (English/Arabic)
 */

import { SupportedCountryCode, COUNTRY_CURRENCIES } from './types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface QatarWPSConfiguration {
  // Payment deadlines
  paymentDeadlineDay: number;         // 7th of following month
  warningThresholdDays: number;       // Days before deadline to warn

  // Minimum wage (effective March 2021)
  minimumWage: number;                // QAR 1,000
  minimumAccommodation: number;       // QAR 500 (if not provided)
  minimumFood: number;                // QAR 300 (if not provided)

  // Bank transfer requirements
  minBankTransferPercent: number;     // 100% through WPS

  // File format
  sifVersion: string;

  effectiveDate: string;
}

export interface QatarEmployee {
  employeeId: string;
  qid: string;                        // Qatar ID number
  passportNumber?: string;
  fullName: string;
  fullNameAr?: string;
  nationality: string;                // ISO 3166-1 alpha-2 country code
  dateOfBirth: Date;
  joiningDate: Date;
  designation: string;
  designationAr?: string;

  // Salary components
  basicSalary: number;                // QAR
  housingAllowance: number;           // QAR
  foodAllowance: number;              // QAR
  transportAllowance: number;         // QAR
  otherAllowances: number;            // QAR
  overtime: number;                   // QAR
  deductions: number;                 // QAR (loans, advances, etc.)
  netSalary: number;                  // QAR

  // Bank details
  bankCode: string;                   // SWIFT/BIC code
  bankName: string;
  iban: string;                       // 29 characters for Qatar
  accountNumber?: string;

  // Employment details
  contractType: 'PERMANENT' | 'TEMPORARY' | 'PROJECT';
  workPermitNumber?: string;
  laborCardNumber?: string;

  // Accommodation & Food provision
  accommodationProvided: boolean;
  foodProvided: boolean;
}

export interface QatarWPSRecord {
  serialNumber: number;
  employeeId: string;
  qid: string;
  employeeName: string;
  nationality: string;
  bankCode: string;
  iban: string;
  basicSalary: number;
  allowances: number;
  overtime: number;
  deductions: number;
  netSalary: number;
  paymentStatus: 'PENDING' | 'PROCESSED' | 'FAILED';
}

export interface QatarWPSSubmissionFile {
  // Header information
  employerQid: string;                // Company CR/QID
  employerName: string;
  employerNameAr?: string;
  establishmentId: string;            // Labor Ministry registration

  period: string;                     // YYYY-MM
  paymentDate: Date;

  // Summary
  totalEmployees: number;
  totalBasicSalary: number;
  totalAllowances: number;
  totalOvertime: number;
  totalDeductions: number;
  totalNetSalary: number;

  // Records
  records: QatarWPSRecord[];

  // Metadata
  generatedAt: Date;
  generatedBy: string;
  fileFormat: 'SIF_QCB' | 'EXCEL';
  sifVersion: string;
}

export interface QatarWPSValidationResult {
  isValid: boolean;
  errors: QatarWPSValidationError[];
  warnings: QatarWPSValidationWarning[];
  summary: {
    totalRecords: number;
    validRecords: number;
    invalidRecords: number;
    warningCount: number;
  };
}

export interface QatarWPSValidationError {
  employeeId: string;
  field: string;
  message: string;
  messageAr: string;
  severity: 'ERROR' | 'CRITICAL';
}

export interface QatarWPSValidationWarning {
  employeeId: string;
  field: string;
  message: string;
  messageAr: string;
}

export interface QatarMinimumWageCheck {
  employeeId: string;
  qid: string;
  employeeName: string;
  totalCompensation: number;
  minimumRequired: number;
  isCompliant: boolean;
  shortfall: number;
  details: {
    basicSalary: number;
    accommodationValue: number;
    foodValue: number;
    total: number;
  };
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export const QATAR_WPS_CONFIG: QatarWPSConfiguration = {
  paymentDeadlineDay: 7,
  warningThresholdDays: 3,
  minimumWage: 1000,                  // QAR 1,000
  minimumAccommodation: 500,          // QAR 500
  minimumFood: 300,                   // QAR 300
  minBankTransferPercent: 100,
  sifVersion: '2.0',
  effectiveDate: '2021-03-20',
};

// Qatar Bank Codes
export const QATAR_BANKS = {
  'QNBA': { name: 'Qatar National Bank', swift: 'QNBAQAQA' },
  'CBQA': { name: 'Commercial Bank of Qatar', swift: 'CBQAQAQA' },
  'DHBK': { name: 'Doha Bank', swift: 'DHBKQAQA' },
  'ABQA': { name: 'Ahli Bank', swift: 'ABQAQAQA' },
  'QIIB': { name: 'Qatar International Islamic Bank', swift: 'QIIBQAQA' },
  'BARQ': { name: 'Barwa Bank', swift: 'BRKBQAQA' },
  'MSQA': { name: 'Masraf Al Rayan', swift: 'MAFRQAQA' },
  'QFIB': { name: 'Qatar First Bank', swift: 'QFBAQAQA' },
  'DUIB': { name: 'Dukhan Bank', swift: 'DUKAQAQA' },
  'HSBC': { name: 'HSBC Qatar', swift: 'HABORQAX' },
  'SCBQ': { name: 'Standard Chartered Qatar', swift: 'SCBLQAQX' },
};

// ============================================================================
// QATAR WPS SERVICE
// ============================================================================

export class QatarWPSService {
  /**
   * Generate WPS SIF (Salary Information File) for submission
   */
  static generateSIF(
    employerQid: string,
    employerName: string,
    establishmentId: string,
    employees: QatarEmployee[],
    period: string,
    paymentDate: Date,
    generatedBy: string
  ): QatarWPSSubmissionFile {
    const records: QatarWPSRecord[] = employees.map((employee, index) => ({
      serialNumber: index + 1,
      employeeId: employee.employeeId,
      qid: employee.qid,
      employeeName: employee.fullName,
      nationality: employee.nationality,
      bankCode: employee.bankCode,
      iban: employee.iban,
      basicSalary: employee.basicSalary,
      allowances: employee.housingAllowance + employee.foodAllowance +
                  employee.transportAllowance + employee.otherAllowances,
      overtime: employee.overtime,
      deductions: employee.deductions,
      netSalary: employee.netSalary,
      paymentStatus: 'PENDING',
    }));

    const totals = records.reduce(
      (acc, record) => ({
        basicSalary: acc.basicSalary + record.basicSalary,
        allowances: acc.allowances + record.allowances,
        overtime: acc.overtime + record.overtime,
        deductions: acc.deductions + record.deductions,
        netSalary: acc.netSalary + record.netSalary,
      }),
      { basicSalary: 0, allowances: 0, overtime: 0, deductions: 0, netSalary: 0 }
    );

    return {
      employerQid,
      employerName,
      establishmentId,
      period,
      paymentDate,

      totalEmployees: employees.length,
      totalBasicSalary: this.round(totals.basicSalary),
      totalAllowances: this.round(totals.allowances),
      totalOvertime: this.round(totals.overtime),
      totalDeductions: this.round(totals.deductions),
      totalNetSalary: this.round(totals.netSalary),

      records,

      generatedAt: new Date(),
      generatedBy,
      fileFormat: 'SIF_QCB',
      sifVersion: QATAR_WPS_CONFIG.sifVersion,
    };
  }

  /**
   * Validate employees for WPS compliance
   */
  static validateEmployees(employees: QatarEmployee[]): QatarWPSValidationResult {
    const errors: QatarWPSValidationError[] = [];
    const warnings: QatarWPSValidationWarning[] = [];

    employees.forEach(employee => {
      // Validate QID
      if (!this.validateQID(employee.qid)) {
        errors.push({
          employeeId: employee.employeeId,
          field: 'qid',
          message: 'Invalid Qatar ID format',
          messageAr: 'صيغة الهوية القطرية غير صالحة',
          severity: 'CRITICAL',
        });
      }

      // Validate IBAN
      if (!this.validateIBAN(employee.iban)) {
        errors.push({
          employeeId: employee.employeeId,
          field: 'iban',
          message: 'Invalid IBAN format for Qatar',
          messageAr: 'صيغة رقم الحساب الدولي غير صالحة لقطر',
          severity: 'CRITICAL',
        });
      }

      // Validate minimum wage compliance
      const minWageCheck = this.checkMinimumWage(employee);
      if (!minWageCheck.isCompliant) {
        errors.push({
          employeeId: employee.employeeId,
          field: 'totalCompensation',
          message: `Below minimum wage by QAR ${minWageCheck.shortfall}`,
          messageAr: `أقل من الحد الأدنى للأجور بمقدار ${minWageCheck.shortfall} ريال قطري`,
          severity: 'CRITICAL',
        });
      }

      // Validate net salary calculation
      const calculatedNet = employee.basicSalary + employee.housingAllowance +
                           employee.foodAllowance + employee.transportAllowance +
                           employee.otherAllowances + employee.overtime - employee.deductions;
      if (Math.abs(calculatedNet - employee.netSalary) > 0.01) {
        warnings.push({
          employeeId: employee.employeeId,
          field: 'netSalary',
          message: 'Net salary does not match calculated value',
          messageAr: 'الراتب الصافي لا يتطابق مع القيمة المحسوبة',
        });
      }

      // Validate bank code
      if (!QATAR_BANKS[employee.bankCode as keyof typeof QATAR_BANKS]) {
        warnings.push({
          employeeId: employee.employeeId,
          field: 'bankCode',
          message: 'Unknown bank code - verify bank details',
          messageAr: 'رمز البنك غير معروف - تحقق من تفاصيل البنك',
        });
      }

      // Check if joining date is valid
      if (employee.joiningDate > new Date()) {
        errors.push({
          employeeId: employee.employeeId,
          field: 'joiningDate',
          message: 'Joining date cannot be in the future',
          messageAr: 'تاريخ الالتحاق لا يمكن أن يكون في المستقبل',
          severity: 'ERROR',
        });
      }
    });

    const validRecords = employees.length - errors.filter(e => e.severity === 'CRITICAL').length;

    return {
      isValid: errors.filter(e => e.severity === 'CRITICAL').length === 0,
      errors,
      warnings,
      summary: {
        totalRecords: employees.length,
        validRecords,
        invalidRecords: employees.length - validRecords,
        warningCount: warnings.length,
      },
    };
  }

  /**
   * Check minimum wage compliance
   * Minimum wage = QAR 1,000 basic + QAR 500 accommodation + QAR 300 food
   */
  static checkMinimumWage(employee: QatarEmployee): QatarMinimumWageCheck {
    const config = QATAR_WPS_CONFIG;

    const accommodationValue = employee.accommodationProvided ?
      config.minimumAccommodation : employee.housingAllowance;
    const foodValue = employee.foodProvided ?
      config.minimumFood : employee.foodAllowance;

    const totalCompensation = employee.basicSalary + accommodationValue + foodValue;
    const minimumRequired = config.minimumWage +
      (employee.accommodationProvided ? 0 : config.minimumAccommodation) +
      (employee.foodProvided ? 0 : config.minimumFood);

    const isCompliant = totalCompensation >= minimumRequired;
    const shortfall = isCompliant ? 0 : minimumRequired - totalCompensation;

    return {
      employeeId: employee.employeeId,
      qid: employee.qid,
      employeeName: employee.fullName,
      totalCompensation,
      minimumRequired,
      isCompliant,
      shortfall,
      details: {
        basicSalary: employee.basicSalary,
        accommodationValue,
        foodValue,
        total: totalCompensation,
      },
    };
  }

  /**
   * Validate Qatar ID (QID)
   * Format: 11 digits
   */
  static validateQID(qid: string): boolean {
    if (!qid) return false;
    const cleaned = qid.replace(/[-\s]/g, '');
    return /^[0-9]{11}$/.test(cleaned);
  }

  /**
   * Validate Qatar IBAN
   * Format: QAnn + 25 alphanumeric = 29 characters total
   */
  static validateIBAN(iban: string): boolean {
    if (!iban) return false;
    const cleaned = iban.replace(/[\s-]/g, '').toUpperCase();
    return /^QA[0-9]{2}[A-Z0-9]{25}$/.test(cleaned);
  }

  /**
   * Generate SIF content in text format for bank submission
   */
  static generateSIFContent(submissionFile: QatarWPSSubmissionFile): string {
    const lines: string[] = [];

    // Header record
    lines.push([
      'H',                                         // Record type
      submissionFile.employerQid,                  // Employer QID
      submissionFile.establishmentId,              // Establishment ID
      submissionFile.period.replace('-', ''),      // Period (YYYYMM)
      this.formatDate(submissionFile.paymentDate), // Payment date (YYYYMMDD)
      submissionFile.totalEmployees.toString().padStart(6, '0'),
      this.formatAmount(submissionFile.totalNetSalary),
      submissionFile.sifVersion,
    ].join('|'));

    // Detail records
    submissionFile.records.forEach(record => {
      lines.push([
        'D',                                       // Record type
        record.serialNumber.toString().padStart(6, '0'),
        record.qid,
        record.employeeName.substring(0, 50).padEnd(50),
        record.bankCode,
        record.iban,
        this.formatAmount(record.basicSalary),
        this.formatAmount(record.allowances),
        this.formatAmount(record.overtime),
        this.formatAmount(record.deductions),
        this.formatAmount(record.netSalary),
      ].join('|'));
    });

    // Trailer record
    lines.push([
      'T',                                         // Record type
      submissionFile.totalEmployees.toString().padStart(6, '0'),
      this.formatAmount(submissionFile.totalBasicSalary),
      this.formatAmount(submissionFile.totalAllowances),
      this.formatAmount(submissionFile.totalOvertime),
      this.formatAmount(submissionFile.totalDeductions),
      this.formatAmount(submissionFile.totalNetSalary),
    ].join('|'));

    return lines.join('\n');
  }

  /**
   * Export to CSV format
   */
  static exportToCSV(submissionFile: QatarWPSSubmissionFile): string {
    const headers = [
      'Serial No',
      'QID',
      'Employee Name',
      'Nationality',
      'Bank Code',
      'IBAN',
      'Basic Salary (QAR)',
      'Allowances (QAR)',
      'Overtime (QAR)',
      'Deductions (QAR)',
      'Net Salary (QAR)',
    ];

    const rows = submissionFile.records.map(record => [
      record.serialNumber,
      record.qid,
      record.employeeName,
      record.nationality,
      record.bankCode,
      record.iban,
      record.basicSalary.toFixed(2),
      record.allowances.toFixed(2),
      record.overtime.toFixed(2),
      record.deductions.toFixed(2),
      record.netSalary.toFixed(2),
    ]);

    // Summary row
    rows.push([]);
    rows.push([
      '', '', '', '', '', 'TOTAL',
      submissionFile.totalBasicSalary.toFixed(2),
      submissionFile.totalAllowances.toFixed(2),
      submissionFile.totalOvertime.toFixed(2),
      submissionFile.totalDeductions.toFixed(2),
      submissionFile.totalNetSalary.toFixed(2),
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  }

  /**
   * Get payment deadline for a period
   */
  static getPaymentDeadline(period: string): Date {
    const [year, month] = period.split('-').map(Number);
    // Payment due by 7th of the following month
    const deadline = new Date(year, month, QATAR_WPS_CONFIG.paymentDeadlineDay);
    return deadline;
  }

  /**
   * Check if payment is overdue
   */
  static isPaymentOverdue(period: string): boolean {
    const deadline = this.getPaymentDeadline(period);
    return new Date() > deadline;
  }

  /**
   * Get days until payment deadline
   */
  static getDaysUntilDeadline(period: string): number {
    const deadline = this.getPaymentDeadline(period);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get WPS configuration
   */
  static getConfig(): QatarWPSConfiguration {
    return { ...QATAR_WPS_CONFIG };
  }

  /**
   * Get list of Qatar banks
   */
  static getBankList(): typeof QATAR_BANKS {
    return { ...QATAR_BANKS };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private static round(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private static formatDate(date: Date): string {
    return date.toISOString().slice(0, 10).replace(/-/g, '');
  }

  private static formatAmount(amount: number): string {
    return (amount * 100).toFixed(0).padStart(12, '0');
  }
}

export default QatarWPSService;
