/**
 * Payroll Module - TypeScript Type Definitions
 * Production-ready type system for comprehensive payroll management
 */

// ============================================================================
// CORE PAYROLL TYPES
// ============================================================================

/**
 * Payroll Run - Monthly payroll processing cycle
 */
export interface PayrollRun {
    id: string;
    month: string; // YYYY-MM format
    year: number;
    monthName: string; // e.g., "December 2025"
    status: PayrollStatus;
    totalEmployees: number;
    processedEmployees: number;
    totalGrossPay: number;
    totalDeductions: number;
    totalNetPay: number;
    startDate: string; // ISO date
    endDate: string; // ISO date
    processedBy?: string;
    processedAt?: string;
    approvedBy?: string;
    approvedAt?: string;
    disbursedAt?: string;
    currentStep: PayrollStep;
    exceptions: PayrollException[];
    createdAt: string;
    updatedAt: string;
}

export type PayrollStatus =
    | 'draft'
    | 'processing'
    | 'review'
    | 'approved'
    | 'disbursed'
    | 'cancelled';

export type PayrollStep =
    | 'attendance_review'
    | 'variable_pay'
    | 'tax_calculation'
    | 'final_preview';

export interface PayrollException {
    id: string;
    employeeId: string;
    employeeName: string;
    type: ExceptionType;
    severity: 'low' | 'medium' | 'high';
    message: string;
    resolved: boolean;
    resolvedAt?: string;
    resolvedBy?: string;
}

export type ExceptionType =
    | 'missing_attendance'
    | 'high_lop'
    | 'missing_bank_details'
    | 'tax_regime_not_set'
    | 'pending_loan_recovery';

// ============================================================================
// EMPLOYEE SALARY STRUCTURE
// ============================================================================

/**
 * Employee Salary Structure - Complete CTC breakdown
 */
export interface EmployeeSalary {
    employeeId: string;
    employeeName: string;
    employeeEmail: string;
    department: string;
    designation: string;
    ctc: number; // Annual Cost to Company
    monthlyCTC: number;
    effectiveDate: string;
    components: SalaryComponent[];
    deductions: DeductionComponent[];
    bankDetails: BankDetails;
    taxRegime: TaxRegime;
    createdAt: string;
    updatedAt: string;
}

export interface SalaryComponent {
    id: string;
    code: string; // e.g., 'BASIC', 'HRA', 'SPECIAL_ALLOWANCE'
    name: string;
    type: ComponentType;
    amount: number;
    percentage?: number; // Percentage of basic/CTC if applicable
    isTaxable: boolean;
    frequency: ComponentFrequency;
    calculationMethod: 'fixed' | 'percentage' | 'formula';
}

export type ComponentType =
    | 'basic'
    | 'hra'
    | 'allowance'
    | 'bonus'
    | 'reimbursement'
    | 'other';

export type ComponentFrequency =
    | 'monthly'
    | 'quarterly'
    | 'annual'
    | 'one_time';

export interface DeductionComponent {
    id: string;
    code: string; // e.g., 'PF', 'ESI', 'PT', 'TDS'
    name: string;
    type: DeductionType;
    amount: number;
    percentage?: number;
    isStatutory: boolean;
    frequency: ComponentFrequency;
}

export type DeductionType =
    | 'pf'
    | 'esi'
    | 'professional_tax'
    | 'income_tax'
    | 'loan_recovery'
    | 'advance_recovery'
    | 'other';

// ============================================================================
// PAYSLIP
// ============================================================================

/**
 * Payslip - Monthly salary statement
 */
export interface Payslip {
    id: string;
    payrollRunId: string;
    employeeId: string;
    employeeName: string;
    employeeCode: string;
    designation: string;
    department: string;
    month: string; // YYYY-MM
    monthName: string; // "December 2025"
    payPeriodStart: string;
    payPeriodEnd: string;

    // Attendance
    totalDays: number;
    workedDays: number;
    lopDays: number;
    paidDays: number;

    // Earnings
    earnings: PayslipEarning[];
    totalEarnings: number;

    // Deductions
    deductions: PayslipDeduction[];
    totalDeductions: number;

    // Net Pay
    netPay: number;
    netPayInWords: string;

    // Payment Details
    paymentMode: PaymentMode;
    paymentDate?: string;
    paymentStatus: PaymentStatus;

    // Bank Details
    bankName: string;
    accountNumber: string; // Masked

    // Tax Details
    panNumber: string; // Masked
    taxRegime: TaxRegime;

    // YTD Summary
    ytdGrossEarnings: number;
    ytdDeductions: number;
    ytdNetPay: number;
    ytdTaxPaid: number;

    generatedAt: string;
    generatedBy: string;
}

export interface PayslipEarning {
    componentCode: string;
    componentName: string;
    amount: number;
    isTaxable: boolean;
}

export interface PayslipDeduction {
    componentCode: string;
    componentName: string;
    amount: number;
    isStatutory: boolean;
}

export type PaymentMode =
    | 'bank_transfer'
    | 'cheque'
    | 'cash'
    | 'upi';

export type PaymentStatus =
    | 'pending'
    | 'processing'
    | 'paid'
    | 'failed'
    | 'on_hold';

// ============================================================================
// TAX MANAGEMENT
// ============================================================================

/**
 * Tax Regime - Old vs New tax calculation method
 */
export type TaxRegime = 'old' | 'new';

/**
 * Tax Declaration - Employee's annual tax-saving investments
 */
export interface TaxDeclaration {
    id: string;
    employeeId: string;
    financialYear: string; // e.g., "2024-25"
    regime: TaxRegime;
    categories: TaxCategory[];
    totalDeclared: number;
    totalVerified: number;
    totalRejected: number;
    status: DeclarationStatus;
    submittedAt?: string;
    approvedAt?: string;
    approvedBy?: string;
    createdAt: string;
    updatedAt: string;
}

export interface TaxCategory {
    id: string;
    section: string; // e.g., '80C', '80D', 'HRA', 'LTA'
    name: string;
    limit: number;
    declared: number;
    verified: number;
    proofs: TaxProof[];
}

export interface TaxProof {
    id: string;
    name: string;
    type: string; // e.g., 'PPF', 'ELSS', 'Rent Receipt'
    amount: number;
    documentUrl?: string;
    uploadedAt: string;
    status: ProofStatus;
    verifiedBy?: string;
    verifiedAt?: string;
    rejectionReason?: string;
}

export type ProofStatus =
    | 'pending'
    | 'verified'
    | 'rejected';

export type DeclarationStatus =
    | 'draft'
    | 'submitted'
    | 'under_review'
    | 'approved'
    | 'needs_revision';

/**
 * Tax Calculation - Monthly/annual tax computation
 */
export interface TaxCalculation {
    employeeId: string;
    financialYear: string;
    regime: TaxRegime;

    // Income
    grossAnnualIncome: number;
    exemptions: number;
    deductions: number;
    taxableIncome: number;

    // Tax Computation
    taxSlabs: TaxSlab[];
    totalTax: number;
    cess: number; // Education cess
    totalTaxPayable: number;

    // Monthly
    monthlyTDS: number;

    // YTD
    ytdTaxDeducted: number;
    remainingTax: number;
}

export interface TaxSlab {
    from: number;
    to: number | null; // null for last slab
    rate: number; // Percentage
    taxOnSlab: number;
}

// ============================================================================
// REIMBURSEMENTS
// ============================================================================

/**
 * Reimbursement Claim - Employee expense claims
 */
export interface ReimbursementClaim {
    id: string;
    claimNumber: string;
    employeeId: string;
    employeeName: string;
    category: ReimbursementCategory;
    amount: number;
    claimDate: string;
    description: string;
    receipts: Receipt[];
    status: ClaimStatus;
    approver?: string;
    approvedAt?: string;
    rejectionReason?: string;
    paymentDate?: string;
    payrollRunId?: string; // If paid through payroll
    createdAt: string;
    updatedAt: string;
}

export type ReimbursementCategory =
    | 'medical'
    | 'travel'
    | 'fuel'
    | 'mobile'
    | 'internet'
    | 'education'
    | 'relocation'
    | 'other';

export interface Receipt {
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadedAt: string;
}

export type ClaimStatus =
    | 'draft'
    | 'submitted'
    | 'under_review'
    | 'approved'
    | 'rejected'
    | 'paid';

// ============================================================================
// LOANS
// ============================================================================

/**
 * Employee Loan - Advance/loan given to employee
 */
export interface EmployeeLoan {
    id: string;
    loanNumber: string;
    employeeId: string;
    employeeName: string;
    loanType: LoanType;
    principalAmount: number;
    interestRate: number;
    tenure: number; // in months
    emiAmount: number;
    disbursedDate: string;

    // Recovery Status
    totalRecovered: number;
    remainingBalance: number;
    nextEMIDate: string;

    status: LoanStatus;
    approvedBy?: string;
    approvedAt?: string;

    recoveries: LoanRecovery[];
    createdAt: string;
    updatedAt: string;
}

export type LoanType =
    | 'personal'
    | 'education'
    | 'housing'
    | 'vehicle'
    | 'emergency'
    | 'advance';

export type LoanStatus =
    | 'pending_approval'
    | 'approved'
    | 'disbursed'
    | 'active'
    | 'closed'
    | 'defaulted';

export interface LoanRecovery {
    id: string;
    loanId: string;
    payrollRunId: string;
    month: string;
    emiAmount: number;
    principalRecovered: number;
    interestRecovered: number;
    recoveryDate: string;
}

// ============================================================================
// BONUSES
// ============================================================================

/**
 * Bonus - Performance/festival bonuses
 */
export interface Bonus {
    id: string;
    employeeId: string;
    employeeName: string;
    bonusType: BonusType;
    amount: number;
    reason: string;
    eligibilityCriteria?: string;
    payrollRunId?: string;
    paymentMonth: string;
    status: BonusStatus;
    approvedBy?: string;
    approvedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export type BonusType =
    | 'performance'
    | 'annual'
    | 'festival'
    | 'retention'
    | 'joining'
    | 'referral'
    | 'project_completion';

export type BonusStatus =
    | 'pending_approval'
    | 'approved'
    | 'processed'
    | 'paid'
    | 'rejected';

// ============================================================================
// BANK & PAYMENT
// ============================================================================

/**
 * Bank Details - Employee bank account information
 */
export interface BankDetails {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    ifscCode?: string; // For India
    swiftCode?: string; // For international
    branchName?: string;
    accountType: 'savings' | 'current';
    isPrimary: boolean;
    verified: boolean;
    verifiedAt?: string;
}

/**
 * Bank File - NEFT/RTGS file for salary disbursement
 */
export interface BankFile {
    id: string;
    payrollRunId: string;
    fileName: string;
    fileType: BankFileType;
    totalAmount: number;
    totalTransactions: number;
    generatedAt: string;
    generatedBy: string;
    uploadedToBank: boolean;
    uploadedAt?: string;
}

export type BankFileType =
    | 'neft'
    | 'rtgs'
    | 'imps'
    | 'upi'
    | 'csv'
    | 'excel';

// ============================================================================
// STATUTORY COMPLIANCE
// ============================================================================

/**
 * Statutory Report - PF, ESI, PT reports
 */
export interface StatutoryReport {
    id: string;
    reportType: StatutoryReportType;
    month: string;
    year: number;
    totalEmployees: number;
    totalAmount: number;
    dueDate: string;
    filedDate?: string;
    filedBy?: string;
    status: 'pending' | 'filed' | 'overdue';
    fileUrl?: string;
}

export type StatutoryReportType =
    | 'pf_ecr'
    | 'esi_return'
    | 'professional_tax'
    | 'tds_return'
    | 'form_16';

// ============================================================================
// PAYROLL SETTINGS
// ============================================================================

/**
 * Payroll Settings - Organization-wide payroll configuration
 */
export interface PayrollSettings {
    organizationId: string;
    currency: string;
    payFrequency: 'monthly' | 'bi_weekly' | 'weekly';
    payDayOfMonth: number;
    financialYearStart: string; // MM-DD format

    // PF Settings
    pfEnabled: boolean;
    pfEmployeeContribution: number; // Percentage
    pfEmployerContribution: number;
    pfWageLimit: number;

    // ESI Settings
    esiEnabled: boolean;
    esiEmployeeContribution: number;
    esiEmployerContribution: number;
    esiWageLimit: number;

    // Professional Tax
    ptEnabled: boolean;
    ptState?: string;
    ptSlabs: Array<{from: number; to: number; amount: number}>;

    // Rounding
    roundingMethod: 'none' | 'nearest_rupee' | 'nearest_10' | 'nearest_100';

    updatedAt: string;
    updatedBy: string;
}

// ============================================================================
// ANALYTICS & REPORTS
// ============================================================================

/**
 * Payroll Statistics - Summary metrics
 */
export interface PayrollStats {
    totalEmployees: number;
    activePayrolls: number;
    monthlyPayrollCost: number;
    averageSalary: number;
    highestSalary: number;
    lowestSalary: number;
    totalReimbursements: number;
    totalLoans: number;
    totalBonuses: number;

    // Trends
    payrollTrend: PayrollTrendData[];
    departmentCosts: DepartmentCost[];

    // Compliance
    pendingStatutoryReturns: number;
    overdueReturns: number;
}

export interface PayrollTrendData {
    month: string;
    totalCost: number;
    employeeCount: number;
    averageCost: number;
}

export interface DepartmentCost {
    department: string;
    employeeCount: number;
    totalCost: number;
    percentage: number;
}

// ============================================================================
// UI STATE & TOAST
// ============================================================================

/**
 * Toast Notification
 */
export interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}
