/**
 * Payroll Engine Types
 * Phase 2: Core Enhancement - Payroll Processing
 */

import type { SupportedCountryCode} from '../compliance/types';
import { COUNTRY_CURRENCIES } from '../compliance/types';

// ============================================================================
// PAYROLL RUN TYPES
// ============================================================================

export type PayrollStatus =
  | 'DRAFT'
  | 'PROCESSING'
  | 'CALCULATED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAID'
  | 'CANCELLED';

export type PayslipStatus =
  | 'DRAFT'
  | 'CALCULATED'
  | 'APPROVED'
  | 'PAID'
  | 'CANCELLED';

export type PayComponentType = 'EARNING' | 'DEDUCTION';

export type CalculationType = 'FIXED' | 'PERCENTAGE' | 'FORMULA' | 'DAYS_BASED';

export type PayComponentCategory =
  | 'BASIC'
  | 'ALLOWANCE'
  | 'BONUS'
  | 'OVERTIME'
  | 'REIMBURSEMENT'
  | 'STATUTORY_EARNING'
  | 'STATUTORY_DEDUCTION'
  | 'TAX'
  | 'LOAN_RECOVERY'
  | 'OTHER_DEDUCTION';

// ============================================================================
// PAY COMPONENT
// ============================================================================

export interface PayComponent {
  id: string;
  tenantId: string;
  code: string;
  nameEn: string;
  nameAr: string;
  type: PayComponentType;
  category: PayComponentCategory;
  isStatutory: boolean;
  isTaxable: boolean;
  isProRated: boolean;
  affectsGOSI: boolean;
  affectsWPS: boolean;
  affectsEOSB: boolean;
  calculationType: CalculationType;
  defaultValue?: number;
  formula?: string;
  applicableCountries: SupportedCountryCode[];
  isActive: boolean;
  displayOrder: number;
}

// ============================================================================
// SALARY STRUCTURE
// ============================================================================

export interface EmployeeSalaryStructure {
  employeeId: string;
  tenantId: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  countryCode: SupportedCountryCode;
  currency: string;
  basicSalary: number;
  components: SalaryComponent[];
  totalGross: number;
  isActive: boolean;
}

export interface SalaryComponent {
  componentId: string;
  componentCode: string;
  nameEn: string;
  nameAr: string;
  type: PayComponentType;
  category: PayComponentCategory;
  calculationType: CalculationType;
  value: number;
  percentage?: number;
  formula?: string;
  isTaxable: boolean;
}

// ============================================================================
// PAYROLL RUN
// ============================================================================

export interface PayrollRunInput {
  tenantId: string;
  companyId: string;
  month: string; // YYYY-MM format
  countryCode: SupportedCountryCode;
  employeeIds?: string[]; // If empty, process all employees
  includeVariables?: boolean;
  processAttendance?: boolean;
  processLeave?: boolean;
}

export interface PayrollRun {
  id: string;
  tenantId: string;
  companyId: string;
  month: string;
  countryCode: SupportedCountryCode;
  currency: string;
  exchangeRate: number;
  status: PayrollStatus;
  totalEmployees: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  totalStatutory: number;
  totalTax: number;
  createdAt: Date;
  createdBy: string;
  processedAt?: Date;
  approvedAt?: Date;
  approvedBy?: string;
  paidAt?: Date;
  payslips: Payslip[];
  summary: PayrollSummary;
}

export interface PayrollSummary {
  byDepartment: DepartmentSummary[];
  byPayComponent: ComponentSummary[];
  byCategory: CategorySummary[];
  statutoryBreakdown: StatutoryBreakdown;
}

export interface DepartmentSummary {
  departmentId: string;
  departmentName: string;
  employeeCount: number;
  totalGross: number;
  totalNet: number;
}

export interface ComponentSummary {
  componentCode: string;
  componentName: string;
  type: PayComponentType;
  totalAmount: number;
  employeeCount: number;
}

export interface CategorySummary {
  category: PayComponentCategory;
  totalAmount: number;
  percentage: number;
}

export interface StatutoryBreakdown {
  // UAE
  wpsTotal?: number;
  // KSA
  gosiEmployeeTotal?: number;
  gosiEmployerTotal?: number;
  mudadTotal?: number;
  // India
  pfEmployeeTotal?: number;
  pfEmployerTotal?: number;
  esiEmployeeTotal?: number;
  esiEmployerTotal?: number;
  professionalTaxTotal?: number;
  tdsTotal?: number;
  // Bahrain
  sioEmployeeTotal?: number;
  sioEmployerTotal?: number;
}

// ============================================================================
// PAYSLIP
// ============================================================================

export interface Payslip {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employeeName: string;
  employeeNameAr?: string;
  employeeCode: string;
  department: string;
  designation: string;
  month: string;
  countryCode: SupportedCountryCode;
  currency: string;

  // Working Days
  totalWorkingDays: number;
  daysWorked: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  lopDays: number; // Loss of Pay

  // Earnings
  basicSalary: number;
  earnings: PayslipLine[];
  totalEarnings: number;

  // Deductions
  deductions: PayslipLine[];
  totalDeductions: number;

  // Statutory
  statutoryDeductions: StatutoryLine[];
  totalStatutory: number;

  // Tax (India)
  taxDetails?: TaxDetails;

  // Net
  grossSalary: number;
  netSalary: number;

  // YTD
  ytdGross: number;
  ytdDeductions: number;
  ytdTax: number;
  ytdNet: number;

  // Bank Details
  bankName?: string;
  bankAccountNumber?: string;
  bankIBAN?: string;

  // Status
  status: PayslipStatus;
  pdfUrl?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface PayslipLine {
  componentCode: string;
  componentName: string;
  componentNameAr: string;
  type: PayComponentType;
  category: PayComponentCategory;
  calculatedAmount: number;
  daysOrUnits?: number;
  rate?: number;
  isTaxable: boolean;
}

export interface StatutoryLine {
  code: string;
  name: string;
  nameAr: string;
  employeeAmount: number;
  employerAmount: number;
  totalAmount: number;
  basis: number;
  rate: number;
}

// ============================================================================
// TAX CALCULATION (INDIA)
// ============================================================================

export type TaxRegime = 'OLD' | 'NEW';

export interface TaxDetails {
  regime: TaxRegime;
  annualGross: number;
  exemptions: TaxExemption[];
  totalExemptions: number;
  taxableIncome: number;
  taxSlabs: TaxSlab[];
  grossTax: number;
  rebate87A: number;
  surcharge: number;
  healthEducationCess: number;
  totalTax: number;
  monthlyTds: number;
  ytdTds: number;
  remainingTds: number;
}

export interface TaxExemption {
  section: string;
  description: string;
  declaredAmount: number;
  approvedAmount: number;
  maxLimit: number;
}

export interface TaxSlab {
  fromAmount: number;
  toAmount: number;
  rate: number;
  taxAmount: number;
}

// ============================================================================
// INDIA TAX SLABS (FY 2024-25)
// ============================================================================

export const INDIA_TAX_SLABS_OLD: TaxSlab[] = [
  { fromAmount: 0, toAmount: 250000, rate: 0, taxAmount: 0 },
  { fromAmount: 250001, toAmount: 500000, rate: 5, taxAmount: 0 },
  { fromAmount: 500001, toAmount: 1000000, rate: 20, taxAmount: 0 },
  { fromAmount: 1000001, toAmount: Infinity, rate: 30, taxAmount: 0 },
];

export const INDIA_TAX_SLABS_NEW: TaxSlab[] = [
  { fromAmount: 0, toAmount: 300000, rate: 0, taxAmount: 0 },
  { fromAmount: 300001, toAmount: 700000, rate: 5, taxAmount: 0 },
  { fromAmount: 700001, toAmount: 1000000, rate: 10, taxAmount: 0 },
  { fromAmount: 1000001, toAmount: 1200000, rate: 15, taxAmount: 0 },
  { fromAmount: 1200001, toAmount: 1500000, rate: 20, taxAmount: 0 },
  { fromAmount: 1500001, toAmount: Infinity, rate: 30, taxAmount: 0 },
];

// Standard Deduction for New Regime FY 2024-25
export const INDIA_STANDARD_DEDUCTION_NEW = 75000;
export const INDIA_STANDARD_DEDUCTION_OLD = 50000;

// Section 87A Rebate Limit
export const INDIA_REBATE_87A_LIMIT_OLD = 500000;
export const INDIA_REBATE_87A_LIMIT_NEW = 700000;
export const INDIA_REBATE_87A_AMOUNT = 25000;

// Surcharge Rates
export const INDIA_SURCHARGE_SLABS = [
  { fromAmount: 5000000, toAmount: 10000000, rate: 10 },
  { fromAmount: 10000001, toAmount: 20000000, rate: 15 },
  { fromAmount: 20000001, toAmount: 50000000, rate: 25 },
  { fromAmount: 50000001, toAmount: Infinity, rate: 37 },
];

// Health & Education Cess
export const INDIA_CESS_RATE = 4;

// ============================================================================
// INDIA STATUTORY RATES
// ============================================================================

export const INDIA_PF_RATES = {
  employeeRate: 12, // 12% of basic + DA
  employerPfRate: 3.67, // 3.67% to PF
  employerPensionRate: 8.33, // 8.33% to EPS (capped at 15000 basic)
  adminCharges: 0.5,
  edliCharges: 0.5,
  wageLimit: 15000, // EPF wage ceiling
  pensionCeiling: 15000,
};

export const INDIA_ESI_RATES = {
  employeeRate: 0.75, // 0.75% of gross
  employerRate: 3.25, // 3.25% of gross
  wageLimit: 21000, // ESI applicability limit
};

// Professional Tax (varies by state - sample for Maharashtra)
export const INDIA_PT_SLABS_MAHARASHTRA = [
  { fromAmount: 0, toAmount: 7500, amount: 0 },
  { fromAmount: 7501, toAmount: 10000, amount: 175 },
  { fromAmount: 10001, toAmount: Infinity, amount: 200 },
  // February special: 300 for > 10000
];

// ============================================================================
// APPROVAL WORKFLOW
// ============================================================================

export type ApprovalAction = 'SUBMIT' | 'APPROVE' | 'REJECT' | 'RETURN';

export interface PayrollApproval {
  id: string;
  payrollRunId: string;
  level: number;
  approverId: string;
  approverName: string;
  action: ApprovalAction;
  comments?: string;
  actionAt: Date;
}

export interface ApprovalWorkflow {
  tenantId: string;
  levels: ApprovalLevel[];
}

export interface ApprovalLevel {
  level: number;
  name: string;
  approverRoles: string[];
  minApprovers: number;
  isSequential: boolean;
}

// ============================================================================
// PAYROLL VALIDATION
// ============================================================================

export interface PayrollValidationResult {
  isValid: boolean;
  errors: PayrollValidationError[];
  warnings: PayrollValidationWarning[];
}

export interface PayrollValidationError {
  employeeId: string;
  employeeName: string;
  field: string;
  code: string;
  message: string;
  messageAr: string;
}

export interface PayrollValidationWarning {
  employeeId: string;
  employeeName: string;
  field: string;
  code: string;
  message: string;
  messageAr: string;
}

// ============================================================================
// BANK FILE GENERATION
// ============================================================================

export type BankFileFormat = 'WPS_SIF' | 'GOSI_XML' | 'MUDAD' | 'NEFT' | 'RTGS' | 'ACH' | 'SWIFT';

export interface BankFileRequest {
  payrollRunId: string;
  format: BankFileFormat;
  bankId?: string;
}

export interface BankFile {
  id: string;
  payrollRunId: string;
  format: BankFileFormat;
  fileName: string;
  fileContent: string;
  totalRecords: number;
  totalAmount: number;
  currency: string;
  generatedAt: Date;
  downloadUrl?: string;
}

// ============================================================================
// PAYROLL ANALYTICS
// ============================================================================

export interface PayrollAnalytics {
  tenantId: string;
  period: string; // YYYY-MM or YYYY

  // Cost Analysis
  totalPayrollCost: number;
  costByDepartment: { department: string; amount: number }[];
  costByCategory: { category: string; amount: number }[];

  // Trends
  monthlyTrend: { month: string; gross: number; net: number }[];
  yearOverYear: { metric: string; current: number; previous: number; change: number }[];

  // Headcount
  totalEmployees: number;
  newJoiners: number;
  exits: number;

  // Averages
  averageSalary: number;
  medianSalary: number;
  salaryRange: { min: number; max: number };

  // Statutory
  statutorySummary: { type: string; amount: number; percentage: number }[];
}

export { COUNTRY_CURRENCIES };
