/**
 * India ECR (Electronic Challan-cum-Return) Generator Service
 * Generates ECR files for EPFO (Employees' Provident Fund Organisation)
 *
 * Key Features:
 * - ECR file generation in EPFO format
 * - Challan generation for PF remittance
 * - Batch processing for multiple employees
 * - Validation of UAN and member details
 * - Support for all contribution types (PF, EPS, EDLI, Admin)
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ECREmployerDetails {
  establishmentId: string;           // PF establishment ID (e.g., DLCPM1234567000)
  establishmentName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  trrn?: string;                     // Temporary Return Reference Number
}

export interface ECRMemberDetails {
  uan: string;                       // 12-digit Universal Account Number
  memberId: string;                  // PF member ID
  employeeName: string;
  fatherOrHusbandName?: string;
  relationship?: 'FATHER' | 'HUSBAND';
  dateOfBirth: Date;
  dateOfJoining: Date;
  dateOfLeaving?: Date;
  reasonForLeaving?: 'RESIGNATION' | 'TERMINATION' | 'RETIREMENT' | 'DEATH' | 'SUPERANNUATION';
  gender: 'M' | 'F' | 'T';          // Male, Female, Transgender
  maritalStatus?: 'S' | 'M' | 'W' | 'D'; // Single, Married, Widow/Widower, Divorced
  aadhaarSeeded: boolean;            // Whether Aadhaar is linked
  bankAccountSeeded: boolean;        // Whether bank account is linked
}

export interface ECRWageDetails {
  grossWages: number;                // Total wages for the month
  epfWages: number;                  // Wages subject to EPF (basic + DA)
  epsWages: number;                  // Wages subject to EPS (max 15000)
  edliWages: number;                 // Wages subject to EDLI (max 15000)
  ncp: number;                       // Non-Contributory Period (days)
  refundOfAdvances?: number;         // Any refund of advances
}

export interface ECRContributionDetails {
  // Employee Contribution
  epfEmployee: number;               // 12% of EPF wages
  epsEmployee: number;               // 0% (employer pays this)

  // Employer Contribution
  epfEmployer: number;               // 3.67% to EPF
  epsEmployer: number;               // 8.33% to EPS (max 15000 base)
  edliEmployer: number;              // 0.50% of EDLI wages (max 15000 base)
  adminCharges: number;              // 0.50% admin charges

  // Totals
  totalEmployeeContribution: number;
  totalEmployerContribution: number;
  grandTotal: number;
}

export interface ECRRecord {
  member: ECRMemberDetails;
  wages: ECRWageDetails;
  contributions: ECRContributionDetails;
  remarks?: string;
}

export interface ECRFile {
  employer: ECREmployerDetails;
  period: string;                    // MMYYYY format
  contributionRate: number;          // 12% for EPF
  wageMonth: Date;
  totalMembers: number;
  records: ECRRecord[];

  // Summary
  summary: {
    totalEPFWages: number;
    totalEPSWages: number;
    totalEDLIWages: number;
    totalEPFEmployee: number;
    totalEPFEmployer: number;
    totalEPS: number;
    totalEDLI: number;
    totalAdminCharges: number;
    grandTotal: number;
  };

  // Metadata
  generatedAt: Date;
  generatedBy: string;
  fileType: 'ECR_TEXT' | 'ECR_EXCEL';
}

export interface ECRChallan {
  trrn: string;                      // Temporary Return Reference Number
  crn?: string;                      // Challan Reference Number (after payment)
  establishmentId: string;
  wageMonth: string;
  dueDate: Date;
  paymentDate?: Date;

  // Amounts
  epfAmount: number;
  epsAmount: number;
  edliAmount: number;
  adminCharges: number;
  totalAmount: number;

  // Interest/damages if late
  interestOnDelayedPayment?: number;
  damages?: number;

  // Status
  status: 'DRAFT' | 'GENERATED' | 'SUBMITTED' | 'PAID' | 'REJECTED';

  // Bank details
  paymentMode?: 'INTERNET_BANKING' | 'NEFT' | 'RTGS' | 'CHALLAN';
  bankName?: string;
  transactionId?: string;
}

export interface ECRValidationResult {
  isValid: boolean;
  errors: ECRValidationError[];
  warnings: ECRValidationWarning[];
}

export interface ECRValidationError {
  uan: string;
  field: string;
  message: string;
}

export interface ECRValidationWarning {
  uan: string;
  field: string;
  message: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const ECR_CONFIG = {
  // Contribution rates
  epfEmployeeRate: 0.12,             // 12%
  epfEmployerRate: 0.0367,           // 3.67% to EPF
  epsRate: 0.0833,                   // 8.33% to EPS
  edliRate: 0.005,                   // 0.50%
  adminRate: 0.005,                  // 0.50%

  // Wage ceilings
  epsWageCeiling: 15000,             // Max for EPS calculation
  edliWageCeiling: 15000,            // Max for EDLI calculation

  // Minimum contribution
  minContributionAmount: 1,          // Rs 1 minimum

  // Due dates
  contributionDueDay: 15,            // 15th of following month
  returnDueDay: 25,                  // 25th of following month

  // Interest rates for delayed payment
  interestRate: 0.12,                // 12% per annum simple interest
  damagesRates: {
    '0-2': 0.05,                     // 5% for 0-2 months delay
    '2-4': 0.10,                     // 10% for 2-4 months delay
    '4-6': 0.15,                     // 15% for 4-6 months delay
    '6+': 0.25,                      // 25% for 6+ months delay
  },
};

// ============================================================================
// ECR SERVICE
// ============================================================================

export class ECRService {
  /**
   * Generate ECR file for a payroll period
   */
  static generateECR(
    employer: ECREmployerDetails,
    employees: Array<{ member: ECRMemberDetails; wages: ECRWageDetails }>,
    wageMonth: Date,
    generatedBy: string
  ): ECRFile {
    const period = this.formatPeriod(wageMonth);

    const records: ECRRecord[] = employees.map(emp => {
      const contributions = this.calculateContributions(emp.wages);
      return {
        member: emp.member,
        wages: emp.wages,
        contributions,
      };
    });

    // Calculate summary
    const summary = this.calculateSummary(records);

    return {
      employer,
      period,
      contributionRate: ECR_CONFIG.epfEmployeeRate,
      wageMonth,
      totalMembers: records.length,
      records,
      summary,
      generatedAt: new Date(),
      generatedBy,
      fileType: 'ECR_TEXT',
    };
  }

  /**
   * Calculate contributions for an employee
   */
  static calculateContributions(wages: ECRWageDetails): ECRContributionDetails {
    // EPF wages (basic + DA)
    const epfWages = wages.epfWages;

    // EPS wages (capped at 15000)
    const epsWages = Math.min(wages.epsWages, ECR_CONFIG.epsWageCeiling);

    // EDLI wages (capped at 15000)
    const edliWages = Math.min(wages.edliWages, ECR_CONFIG.edliWageCeiling);

    // Employee contribution (12% of EPF wages)
    const epfEmployee = this.round(epfWages * ECR_CONFIG.epfEmployeeRate);

    // Employer EPF contribution (3.67% of EPF wages)
    const epfEmployer = this.round(epfWages * ECR_CONFIG.epfEmployerRate);

    // EPS contribution (8.33% of EPS wages, paid by employer)
    const epsEmployer = this.round(epsWages * ECR_CONFIG.epsRate);

    // EDLI contribution (0.50% of EDLI wages)
    const edliEmployer = this.round(edliWages * ECR_CONFIG.edliRate);

    // Admin charges (0.50% of EPF wages)
    const adminCharges = Math.max(this.round(epfWages * ECR_CONFIG.adminRate), 75); // Min Rs 75

    // Totals
    const totalEmployeeContribution = epfEmployee;
    const totalEmployerContribution = epfEmployer + epsEmployer + edliEmployer + adminCharges;
    const grandTotal = totalEmployeeContribution + totalEmployerContribution;

    return {
      epfEmployee,
      epsEmployee: 0,
      epfEmployer,
      epsEmployer,
      edliEmployer,
      adminCharges,
      totalEmployeeContribution,
      totalEmployerContribution,
      grandTotal,
    };
  }

  /**
   * Calculate summary from all records
   */
  private static calculateSummary(records: ECRRecord[]): ECRFile['summary'] {
    return records.reduce(
      (acc, record) => ({
        totalEPFWages: acc.totalEPFWages + record.wages.epfWages,
        totalEPSWages: acc.totalEPSWages + record.wages.epsWages,
        totalEDLIWages: acc.totalEDLIWages + record.wages.edliWages,
        totalEPFEmployee: acc.totalEPFEmployee + record.contributions.epfEmployee,
        totalEPFEmployer: acc.totalEPFEmployer + record.contributions.epfEmployer,
        totalEPS: acc.totalEPS + record.contributions.epsEmployer,
        totalEDLI: acc.totalEDLI + record.contributions.edliEmployer,
        totalAdminCharges: acc.totalAdminCharges + record.contributions.adminCharges,
        grandTotal: acc.grandTotal + record.contributions.grandTotal,
      }),
      {
        totalEPFWages: 0,
        totalEPSWages: 0,
        totalEDLIWages: 0,
        totalEPFEmployee: 0,
        totalEPFEmployer: 0,
        totalEPS: 0,
        totalEDLI: 0,
        totalAdminCharges: 0,
        grandTotal: 0,
      }
    );
  }

  /**
   * Generate ECR text file content (EPFO format)
   */
  static generateTextFile(ecr: ECRFile): string {
    const lines: string[] = [];

    // Header line (establishment details)
    lines.push([
      ecr.employer.establishmentId,
      ecr.employer.establishmentName.substring(0, 50),
      ecr.period,
      ecr.contributionRate.toString(),
      ecr.totalMembers.toString(),
    ].join('#~#'));

    // Detail lines (member records)
    ecr.records.forEach(record => {
      lines.push([
        record.member.uan,
        record.member.memberId,
        record.member.employeeName.substring(0, 50),
        record.wages.grossWages.toString(),
        record.wages.epfWages.toString(),
        record.wages.epsWages.toString(),
        record.wages.edliWages.toString(),
        record.contributions.epfEmployee.toString(),
        record.contributions.epsEmployer.toString(),
        record.contributions.epfEmployer.toString(),
        record.wages.ncp.toString(),
        record.wages.refundOfAdvances?.toString() || '0',
      ].join('#~#'));
    });

    // Footer line (summary)
    lines.push([
      'TOTAL',
      ecr.summary.totalEPFWages.toString(),
      ecr.summary.totalEPSWages.toString(),
      ecr.summary.totalEDLIWages.toString(),
      ecr.summary.totalEPFEmployee.toString(),
      ecr.summary.totalEPS.toString(),
      ecr.summary.totalEPFEmployer.toString(),
      ecr.summary.grandTotal.toString(),
    ].join('#~#'));

    return lines.join('\n');
  }

  /**
   * Generate ECR CSV file content
   */
  static generateCSV(ecr: ECRFile): string {
    const headers = [
      'UAN',
      'Member ID',
      'Member Name',
      'Gross Wages',
      'EPF Wages',
      'EPS Wages',
      'EDLI Wages',
      'NCP Days',
      'EPF Employee (12%)',
      'EPS Employer (8.33%)',
      'EPF Employer (3.67%)',
      'EDLI (0.5%)',
      'Admin Charges',
      'Total Contribution',
    ];

    const rows = ecr.records.map(record => [
      record.member.uan,
      record.member.memberId,
      record.member.employeeName,
      record.wages.grossWages,
      record.wages.epfWages,
      record.wages.epsWages,
      record.wages.edliWages,
      record.wages.ncp,
      record.contributions.epfEmployee,
      record.contributions.epsEmployer,
      record.contributions.epfEmployer,
      record.contributions.edliEmployer,
      record.contributions.adminCharges,
      record.contributions.grandTotal,
    ]);

    // Summary row
    rows.push([]);
    rows.push([
      'TOTAL',
      '',
      '',
      ecr.summary.totalEPFWages,
      ecr.summary.totalEPSWages,
      ecr.summary.totalEDLIWages,
      '',
      '',
      ecr.summary.totalEPFEmployee,
      ecr.summary.totalEPS,
      ecr.summary.totalEPFEmployer,
      ecr.summary.totalEDLI,
      ecr.summary.totalAdminCharges,
      ecr.summary.grandTotal,
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  }

  /**
   * Generate challan for payment
   */
  static generateChallan(ecr: ECRFile): ECRChallan {
    const dueDate = this.getDueDate(ecr.wageMonth);

    return {
      trrn: this.generateTRRN(ecr.employer.establishmentId),
      establishmentId: ecr.employer.establishmentId,
      wageMonth: ecr.period,
      dueDate,
      epfAmount: ecr.summary.totalEPFEmployee + ecr.summary.totalEPFEmployer,
      epsAmount: ecr.summary.totalEPS,
      edliAmount: ecr.summary.totalEDLI,
      adminCharges: ecr.summary.totalAdminCharges,
      totalAmount: ecr.summary.grandTotal,
      status: 'GENERATED',
    };
  }

  /**
   * Calculate interest and damages for late payment
   */
  static calculatePenalties(
    amount: number,
    dueDate: Date,
    paymentDate: Date
  ): { interest: number; damages: number; total: number } {
    if (paymentDate <= dueDate) {
      return { interest: 0, damages: 0, total: amount };
    }

    const delayDays = Math.ceil(
      (paymentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const delayMonths = Math.ceil(delayDays / 30);

    // Simple interest @ 12% p.a.
    const interest = this.round(amount * ECR_CONFIG.interestRate * (delayDays / 365));

    // Damages based on delay period
    let damagesRate = 0;
    if (delayMonths <= 2) {
      damagesRate = ECR_CONFIG.damagesRates['0-2'];
    } else if (delayMonths <= 4) {
      damagesRate = ECR_CONFIG.damagesRates['2-4'];
    } else if (delayMonths <= 6) {
      damagesRate = ECR_CONFIG.damagesRates['4-6'];
    } else {
      damagesRate = ECR_CONFIG.damagesRates['6+'];
    }
    const damages = this.round(amount * damagesRate);

    return {
      interest,
      damages,
      total: amount + interest + damages,
    };
  }

  /**
   * Validate ECR records
   */
  static validate(ecr: ECRFile): ECRValidationResult {
    const errors: ECRValidationError[] = [];
    const warnings: ECRValidationWarning[] = [];

    ecr.records.forEach(record => {
      // Validate UAN
      if (!this.validateUAN(record.member.uan)) {
        errors.push({
          uan: record.member.uan,
          field: 'uan',
          message: 'Invalid UAN format (must be 12 digits)',
        });
      }

      // Validate wages
      if (record.wages.epfWages <= 0) {
        errors.push({
          uan: record.member.uan,
          field: 'epfWages',
          message: 'EPF wages must be greater than 0',
        });
      }

      // Warning for wages exceeding ceiling
      if (record.wages.epfWages > ECR_CONFIG.epsWageCeiling) {
        warnings.push({
          uan: record.member.uan,
          field: 'epfWages',
          message: `EPF wages (${record.wages.epfWages}) exceed ceiling (${ECR_CONFIG.epsWageCeiling})`,
        });
      }

      // Validate NCP days
      if (record.wages.ncp < 0 || record.wages.ncp > 31) {
        errors.push({
          uan: record.member.uan,
          field: 'ncp',
          message: 'NCP days must be between 0 and 31',
        });
      }

      // Warning for Aadhaar not seeded
      if (!record.member.aadhaarSeeded) {
        warnings.push({
          uan: record.member.uan,
          field: 'aadhaarSeeded',
          message: 'Aadhaar not linked - may affect claims processing',
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate UAN format (12 digits)
   */
  static validateUAN(uan: string): boolean {
    if (!uan) return false;
    const cleaned = uan.replace(/[-\s]/g, '');
    return /^[0-9]{12}$/.test(cleaned);
  }

  /**
   * Validate Establishment ID
   * Format: State Code (2) + Office Code (3) + Establishment Code (7) + Extension (3)
   */
  static validateEstablishmentId(id: string): boolean {
    if (!id) return false;
    const cleaned = id.toUpperCase().replace(/[-\s]/g, '');
    return /^[A-Z]{2}[A-Z]{3}[0-9]{7}[0-9]{3}$/.test(cleaned);
  }

  /**
   * Get due date for PF payment
   */
  static getDueDate(wageMonth: Date): Date {
    const month = wageMonth.getMonth();
    const year = wageMonth.getFullYear();

    // Due by 15th of following month
    const dueDate = new Date(year, month + 1, ECR_CONFIG.contributionDueDay);
    return dueDate;
  }

  /**
   * Check if contribution is late
   */
  static isLate(wageMonth: Date, paymentDate: Date = new Date()): boolean {
    const dueDate = this.getDueDate(wageMonth);
    return paymentDate > dueDate;
  }

  /**
   * Format period in MMYYYY format
   */
  private static formatPeriod(date: Date): string {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${month}${year}`;
  }

  /**
   * Generate TRRN (Temporary Return Reference Number)
   */
  private static generateTRRN(establishmentId: string): string {
    const timestamp = Date.now().toString().slice(-8);
    return `TRRN${establishmentId.slice(0, 10)}${timestamp}`;
  }

  /**
   * Round to 2 decimal places (Indian accounting standard)
   */
  private static round(value: number): number {
    return Math.round(value);
  }

  /**
   * Get ECR configuration
   */
  static getConfig(): typeof ECR_CONFIG {
    return { ...ECR_CONFIG };
  }

  /**
   * Generate monthly ECR summary report
   */
  static generateSummaryReport(ecr: ECRFile): string {
    return `
================================================================================
                         ECR SUMMARY REPORT
================================================================================

Establishment: ${ecr.employer.establishmentName}
Establishment ID: ${ecr.employer.establishmentId}
Wage Month: ${ecr.period}
Generated On: ${ecr.generatedAt.toLocaleDateString('en-IN')}

--------------------------------------------------------------------------------
                         CONTRIBUTION SUMMARY
--------------------------------------------------------------------------------

Total Members: ${ecr.totalMembers}

| Component           | Amount (₹)        |
|---------------------|-------------------|
| EPF (Employee 12%)  | ${this.formatNumber(ecr.summary.totalEPFEmployee).padStart(17)} |
| EPF (Employer 3.67%)| ${this.formatNumber(ecr.summary.totalEPFEmployer).padStart(17)} |
| EPS (8.33%)         | ${this.formatNumber(ecr.summary.totalEPS).padStart(17)} |
| EDLI (0.50%)        | ${this.formatNumber(ecr.summary.totalEDLI).padStart(17)} |
| Admin Charges       | ${this.formatNumber(ecr.summary.totalAdminCharges).padStart(17)} |
|---------------------|-------------------|
| GRAND TOTAL         | ${this.formatNumber(ecr.summary.grandTotal).padStart(17)} |

--------------------------------------------------------------------------------
                         WAGE SUMMARY
--------------------------------------------------------------------------------

| Wage Type           | Amount (₹)        |
|---------------------|-------------------|
| Total EPF Wages     | ${this.formatNumber(ecr.summary.totalEPFWages).padStart(17)} |
| Total EPS Wages     | ${this.formatNumber(ecr.summary.totalEPSWages).padStart(17)} |
| Total EDLI Wages    | ${this.formatNumber(ecr.summary.totalEDLIWages).padStart(17)} |

================================================================================
                         PAYMENT INSTRUCTIONS
================================================================================

Due Date: ${this.getDueDate(ecr.wageMonth).toLocaleDateString('en-IN')}

Payment can be made through:
1. EPFO Unified Portal (https://unifiedportal-emp.epfindia.gov.in)
2. Internet Banking (SBI, PNB, and other authorized banks)
3. NEFT/RTGS transfer

Note: Late payment will attract interest @ 12% p.a. and damages.

================================================================================
    `;
  }

  private static formatNumber(num: number): string {
    return num.toLocaleString('en-IN', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    });
  }
}

export default ECRService;
