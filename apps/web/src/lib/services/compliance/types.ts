/**
 * MENA Compliance Types
 * Shared TypeScript definitions for compliance services
 */

// ============================================================================
// COUNTRY CODES
// ============================================================================

export type GCCCountryCode = 'AE' | 'SA' | 'BH' | 'QA' | 'OM' | 'KW';
export type SupportedCountryCode = GCCCountryCode | 'IN';

export const COUNTRY_NAMES: Record<SupportedCountryCode, { en: string; ar: string }> = {
  AE: { en: 'United Arab Emirates', ar: 'الإمارات العربية المتحدة' },
  SA: { en: 'Saudi Arabia', ar: 'المملكة العربية السعودية' },
  BH: { en: 'Bahrain', ar: 'البحرين' },
  QA: { en: 'Qatar', ar: 'قطر' },
  OM: { en: 'Oman', ar: 'سلطنة عمان' },
  KW: { en: 'Kuwait', ar: 'الكويت' },
  IN: { en: 'India', ar: 'الهند' },
};

export const COUNTRY_CURRENCIES: Record<SupportedCountryCode, string> = {
  AE: 'AED',
  SA: 'SAR',
  BH: 'BHD',
  QA: 'QAR',
  OM: 'OMR',
  KW: 'KWD',
  IN: 'INR',
};

// ============================================================================
// WPS (WAGE PROTECTION SYSTEM) - UAE
// ============================================================================

export interface WPSConfiguration {
  id: string;
  tenantId: string;
  companyId: string;
  wpsAgentCode: string;
  employerCode: string;
  bankCode: string;
  bankBranchCode?: string;
  molEstablishmentId?: string;
  isActive: boolean;
}

export interface WPSRecord {
  employeeId: string;
  labourCardNumber: string;
  personalNumber?: string;
  bankRoutingCode: string;
  accountNumber: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  leaveSalary: number;
}

export interface WPSSIFFile {
  header: {
    employerCode: string;
    agentCode: string;
    bankCode: string;
    salaryMonth: string;
    totalRecords: number;
    totalAmount: number;
    creationDate: string;
  };
  records: WPSSIFRecord[];
  trailer: {
    totalRecords: number;
    totalAmount: number;
  };
}

export interface WPSSIFRecord {
  recordType: 'EDR'; // Employee Data Record
  labourCardNumber: string;
  routingCode: string;
  accountNumber: string;
  salaryAmount: number;
  leaveSalary: number;
}

export interface WPSValidationResult {
  isValid: boolean;
  errors: WPSValidationError[];
  warnings: WPSValidationWarning[];
}

export interface WPSValidationError {
  employeeId: string;
  field: string;
  code: string;
  message: string;
  messageAr: string;
}

export interface WPSValidationWarning {
  employeeId: string;
  field: string;
  code: string;
  message: string;
  messageAr: string;
}

// ============================================================================
// GOSI (GENERAL ORGANIZATION FOR SOCIAL INSURANCE) - KSA
// ============================================================================

export interface GOSIConfiguration {
  id: string;
  tenantId: string;
  companyId: string;
  gosiSubscriptionNumber: string;
  establishmentNumber: string;
  laborOfficeCode: string;
  bankAccountIBAN?: string;
  isActive: boolean;
}

export interface GOSIContribution {
  employeeId: string;
  nationalId?: string;
  iqamaNumber?: string;
  nationality: string;
  isSaudi: boolean;
  contributableSalary: number;
  basicSalary: number;
  housingAllowance: number;
  contributions: {
    employeePension: number;
    employerPension: number;
    sanedEmployee: number;
    sanedEmployer: number;
    occupationalHazards: number;
    totalEmployee: number;
    totalEmployer: number;
    grandTotal: number;
  };
}

export interface GOSIRates {
  pensionEmployee: number; // 9.75% for Saudis
  pensionEmployer: number; // 9.75% for Saudis
  sanedEmployee: number; // 0.75% for Saudis
  sanedEmployer: number; // 0.75% for Saudis
  occupationalHazards: number; // 2% employer only
  maxContributableSalary: number; // 45,000 SAR
}

export const GOSI_RATES: GOSIRates = {
  pensionEmployee: 0.0975,
  pensionEmployer: 0.0975,
  sanedEmployee: 0.0075,
  sanedEmployer: 0.0075,
  occupationalHazards: 0.02,
  maxContributableSalary: 45000,
};

export interface GOSIContributionRates {
  saudi: {
    annuity: { employee: number; employer: number; total: number };
    saned: { employee: number; employer: number; total: number };
    occupationalHazards: { employee: number; employer: number; total: number };
  };
  nonSaudi: {
    annuity: { employee: number; employer: number; total: number };
    saned: { employee: number; employer: number; total: number };
    occupationalHazards: { employee: number; employer: number; total: number };
  };
}

export interface GOSIRecord {
  employeeId: string;
  subscriberNumber: string;
  nationalId: string;
  iqamaNumber?: string;
  isSaudi: boolean;
  basicSalary: number;
  housingAllowance: number;
  contributableSalary: number;
  employeeContribution: number;
  employerContribution: number;
  annuityContribution: number;
  sanedContribution: number;
  occupationalHazardsContribution: number;
}

export interface GOSISubmissionFile {
  header: {
    establishmentNumber: string;
    laborOfficeCode: string;
    contributionMonth: string;
    creationDate: string;
    totalRecords: number;
    saudiCount: number;
    nonSaudiCount: number;
  };
  records: Array<GOSIRecord & { recordType: 'EMP' }>;
  summary: {
    totalContributableWages: number;
    totalEmployeeContributions: number;
    totalEmployerContributions: number;
    totalAnnuity: number;
    totalSaned: number;
    totalOccupationalHazards: number;
    totalContribution: number;
  };
}

export interface GOSIValidationResult {
  isValid: boolean;
  errors: GOSIValidationError[];
  warnings: GOSIValidationWarning[];
}

export interface GOSIValidationError {
  employeeId: string;
  field: string;
  code: string;
  message: string;
  messageAr: string;
}

export interface GOSIValidationWarning {
  employeeId: string;
  field: string;
  code: string;
  message: string;
  messageAr: string;
}

// ============================================================================
// NITAQAT (SAUDIZATION)
// ============================================================================

export type NitaqatBand =
  | 'PLATINUM'
  | 'GREEN_HIGH'
  | 'GREEN_MEDIUM'
  | 'GREEN_LOW'
  | 'YELLOW'
  | 'RED';

export interface NitaqatStatus {
  companyId: string;
  industryCode: string;
  industryName: string;
  companySizeBand: 'Small' | 'Medium' | 'Large' | 'Giant';
  totalEmployees: number;
  saudiEmployees: number;
  nonSaudiEmployees: number;
  currentRatio: number;
  requiredRatio: number;
  band: NitaqatBand;
  deficit: number;
  surplus: number;
  recommendations: NitaqatRecommendation[];
}

export interface NitaqatRecommendation {
  type: 'HIRE_SAUDI' | 'REDUCE_EXPAT' | 'MAINTAIN' | 'IMPROVE';
  message: string;
  messageAr: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

// ============================================================================
// EOSB (END OF SERVICE BENEFITS) / GRATUITY
// ============================================================================

export type TerminationType =
  | 'RESIGNATION'
  | 'TERMINATION'
  | 'TERMINATION_WITHOUT_CAUSE'
  | 'END_OF_CONTRACT'
  | 'RETIREMENT'
  | 'DEATH'
  | 'DISABILITY'
  | 'MUTUAL_AGREEMENT';

export interface EOSBCalculationInput {
  employeeId: string;
  countryCode: SupportedCountryCode;
  joiningDate: Date;
  lastWorkingDate: Date;
  basicSalary: number;
  totalSalary?: number;
  terminationType: TerminationType;
  contractType?: 'FIXED' | 'INDEFINITE';
  /**
   * Total unpaid-leave days taken during the employment period.
   * Subtracted from total service before gratuity is computed.
   * (EPIC-28-S09 closure — audit 2026-06-17.)
   */
  unpaidLeaveDays?: number;
}

export interface EOSBCalculationResult {
  employeeId: string;
  countryCode: SupportedCountryCode;
  currency: string;

  // Service Duration
  yearsOfService: number;
  monthsOfService: number;
  daysOfService: number;

  // Salary Details
  basicSalary: number;
  dailyRate: number;

  // Calculation Breakdown
  firstPeriodYears: number;
  firstPeriodDays: number;
  firstPeriodAmount: number;
  secondPeriodYears: number;
  secondPeriodDays: number;
  secondPeriodAmount: number;
  grossAmount: number;

  // Adjustments
  terminationType: TerminationType;
  resignationFactor: number;
  adjustedAmount: number;
  deductions: number;

  // Final Amount
  netAmount: number;

  // Details
  calculationDetails: EOSBCalculationDetails;
}

export interface EOSBCalculationDetails {
  law: string;
  formula: string;
  notes: string[];
  notesAr: string[];
}

// ============================================================================
// LABOUR LAW CONFIGURATION
// ============================================================================

export interface LabourLawConfig {
  countryCode: SupportedCountryCode;
  countryName: string;
  countryNameAr: string;
  currency: string;

  // Working Hours
  workingHours: {
    standardPerDay: number;
    standardPerWeek: number;
    ramadanPerDay?: number;
    ramadanPerWeek?: number;
    maxOvertimePerDay?: number;
    maxOvertimePerYear?: number;
  };

  // Overtime Rates
  overtimeRates: {
    normal: number; // e.g., 1.25 for 125%
    night: number; // e.g., 1.50 for 150%
    holiday: number; // e.g., 1.50 for 150%
    friday?: number;
    nightShiftStart?: string;
    nightShiftEnd?: string;
  };

  // Probation
  probation: {
    maxDays: number;
    extensionDays?: number;
    noticeDays: number;
  };

  // Leave Entitlements
  leave: {
    annualFirstYear: number;
    annualAfterYears: number;
    annualThresholdYears: number;
    sickFullPay: number;
    sickHalfPay: number;
    sickUnpaid: number;
    maternity: number;
    maternityFullPay: number;
    maternityHalfPay: number;
    paternity: number;
    bereavementSpouse: number;
    bereavementFamily: number;
    hajj?: number;
    hajjMinServiceYears?: number;
    study?: number;
    marriage?: number;
    iddah?: number;
  };

  // EOSB/Gratuity
  eosb: {
    firstPeriodYears: number;
    firstPeriodDaysPerYear: number;
    afterPeriodDaysPerYear: number;
    maxMonths?: number;
    resignationFactor1?: number;
    resignationFactor2?: number;
    minServiceMonths: number;
    calculationBase: 'BASIC' | 'TOTAL';
  };

  // Social Insurance
  socialInsurance?: {
    employeeRate: number;
    employerRate: number;
    maxWage?: number;
    pensionEmployeeRate?: number;
    pensionEmployerRate?: number;
    unemploymentEmployeeRate?: number;
    unemploymentEmployerRate?: number;
    occupationalHazardsRate?: number;
  };

  // Weekend & Calendar
  weekendDays: string[];
  workWeekStartDay: string;
}

// ============================================================================
// COMPLIANCE VALIDATION
// ============================================================================

export interface ComplianceValidation {
  isCompliant: boolean;
  country: SupportedCountryCode;
  category: 'WPS' | 'GOSI' | 'LEAVE' | 'CONTRACT' | 'WORKING_HOURS' | 'EOSB';
  issues: ComplianceIssue[];
}

export interface ComplianceIssue {
  severity: 'ERROR' | 'WARNING' | 'INFO';
  code: string;
  message: string;
  messageAr: string;
  field?: string;
  currentValue?: string | number;
  expectedValue?: string | number;
  recommendation?: string;
  recommendationAr?: string;
}

// ============================================================================
// EMPLOYEE COMPLIANCE DETAILS
// ============================================================================

export interface EmployeeComplianceData {
  employeeId: string;
  countryCode: SupportedCountryCode;

  // UAE
  labourCardNumber?: string;
  labourCardExpiry?: Date;
  emiratesId?: string;
  emiratesIdExpiry?: Date;
  visaNumber?: string;
  visaType?: string;
  visaExpiry?: Date;
  wpsPersonalNumber?: string;

  // KSA
  iqamaNumber?: string;
  iqamaExpiry?: Date;
  nationalId?: string;
  borderNumber?: string;
  gosiSubscriptionNumber?: string;
  gosiSubscriberNumber?: string;

  // India
  panNumber?: string;
  aadhaarNumber?: string;
  uanNumber?: string;
  esiNumber?: string;
  pfAccountNumber?: string;

  // Banking
  bankName?: string;
  bankAccountNumber?: string;
  bankIBAN?: string;
  bankSwiftCode?: string;
  bankBranchCode?: string;
  bankRoutingCode?: string;

  // Contract
  contractType?: 'FIXED' | 'INDEFINITE';
  contractStartDate?: Date;
  contractEndDate?: Date;
  probationEndDate?: Date;

  // Demographics
  nationality?: string;
  religion?: string;
  isLocalNational: boolean;
}
