// @ts-nocheck — Dev/demo seed data, intentionally loose-typed.
/**
 * Sample Payroll Data
 * Comprehensive sample data for testing and development
 */

import type {
    PayrollRun,
    EmployeeSalary,
    TaxDeclaration,
    ReimbursementClaim,
    EmployeeLoan,
    Bonus,
    PayrollSettings} from './types';
import {
    Payslip
} from './types';

// ============================================================================
// EMPLOYEE SALARIES
// ============================================================================

export const generateSampleEmployeeSalaries = (): EmployeeSalary[] => [
    {
        employeeId: 'emp001',
        employeeName: 'Sarah Anderson',
        employeeEmail: 'sarah.anderson@company.com',
        department: 'Engineering',
        designation: 'Senior Software Engineer',
        ctc: 1800000,
        monthlyCTC: 150000,
        effectiveDate: '2024-01-01',
        components: [
            { id: 'c1', code: 'BASIC', name: 'Basic Salary', type: 'basic', amount: 75000, percentage: 50, isTaxable: true, frequency: 'monthly', calculationMethod: 'percentage' },
            { id: 'c2', code: 'HRA', name: 'House Rent Allowance', type: 'hra', amount: 37500, percentage: 50, isTaxable: true, frequency: 'monthly', calculationMethod: 'percentage' },
            { id: 'c3', code: 'SPECIAL', name: 'Special Allowance', type: 'allowance', amount: 27500, isTaxable: true, frequency: 'monthly', calculationMethod: 'fixed' },
            { id: 'c4', code: 'TRANSPORT', name: 'Transport Allowance', type: 'allowance', amount: 5000, isTaxable: true, frequency: 'monthly', calculationMethod: 'fixed' },
            { id: 'c5', code: 'MOBILE', name: 'Mobile Allowance', type: 'allowance', amount: 2000, isTaxable: true, frequency: 'monthly', calculationMethod: 'fixed' },
            { id: 'c6', code: 'INTERNET', name: 'Internet Allowance', type: 'allowance', amount: 1500, isTaxable: true, frequency: 'monthly', calculationMethod: 'fixed' },
            { id: 'c7', code: 'MEAL', name: 'Meal Vouchers', type: 'allowance', amount: 1500, isTaxable: false, frequency: 'monthly', calculationMethod: 'fixed' },
        ],
        deductions: [
            { id: 'd1', code: 'PF', name: 'Provident Fund', type: 'pf', amount: 9000, percentage: 12, isStatutory: true, frequency: 'monthly' },
            { id: 'd2', code: 'PT', name: 'Professional Tax', type: 'professional_tax', amount: 200, isStatutory: true, frequency: 'monthly' },
            { id: 'd3', code: 'TDS', name: 'Income Tax (TDS)', type: 'income_tax', amount: 15000, isStatutory: true, frequency: 'monthly' },
        ],
        bankDetails: {
            accountHolderName: 'Sarah Anderson',
            bankName: 'HDFC Bank',
            accountNumber: '****4567',
            ifscCode: 'HDFC0001234',
            branchName: 'MG Road Branch',
            accountType: 'savings',
            isPrimary: true,
            verified: true,
            verifiedAt: '2024-01-01T00:00:00Z',
        },
        taxRegime: 'old',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        employeeId: 'emp002',
        employeeName: 'Michael Chen',
        employeeEmail: 'michael.chen@company.com',
        department: 'Design',
        designation: 'UX Designer',
        ctc: 1440000,
        monthlyCTC: 120000,
        effectiveDate: '2024-01-01',
        components: [
            { id: 'c8', code: 'BASIC', name: 'Basic Salary', type: 'basic', amount: 60000, percentage: 50, isTaxable: true, frequency: 'monthly', calculationMethod: 'percentage' },
            { id: 'c9', code: 'HRA', name: 'House Rent Allowance', type: 'hra', amount: 30000, percentage: 50, isTaxable: true, frequency: 'monthly', calculationMethod: 'percentage' },
            { id: 'c10', code: 'SPECIAL', name: 'Special Allowance', type: 'allowance', amount: 22000, isTaxable: true, frequency: 'monthly', calculationMethod: 'fixed' },
            { id: 'c11', code: 'TRANSPORT', name: 'Transport Allowance', type: 'allowance', amount: 5000, isTaxable: true, frequency: 'monthly', calculationMethod: 'fixed' },
            { id: 'c12', code: 'MOBILE', name: 'Mobile Allowance', type: 'allowance', amount: 2000, isTaxable: true, frequency: 'monthly', calculationMethod: 'fixed' },
            { id: 'c13', code: 'MEAL', name: 'Meal Vouchers', type: 'allowance', amount: 1000, isTaxable: false, frequency: 'monthly', calculationMethod: 'fixed' },
        ],
        deductions: [
            { id: 'd4', code: 'PF', name: 'Provident Fund', type: 'pf', amount: 7200, percentage: 12, isStatutory: true, frequency: 'monthly' },
            { id: 'd5', code: 'PT', name: 'Professional Tax', type: 'professional_tax', amount: 200, isStatutory: true, frequency: 'monthly' },
            { id: 'd6', code: 'TDS', name: 'Income Tax (TDS)', type: 'income_tax', amount: 10000, isStatutory: true, frequency: 'monthly' },
        ],
        bankDetails: {
            accountHolderName: 'Michael Chen',
            bankName: 'ICICI Bank',
            accountNumber: '****7890',
            ifscCode: 'ICIC0001234',
            branchName: 'Whitefield Branch',
            accountType: 'savings',
            isPrimary: true,
            verified: true,
            verifiedAt: '2024-01-01T00:00:00Z',
        },
        taxRegime: 'new',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        employeeId: 'emp003',
        employeeName: 'Jessica Wu',
        employeeEmail: 'jessica.wu@company.com',
        department: 'Product',
        designation: 'Product Manager',
        ctc: 2100000,
        monthlyCTC: 175000,
        effectiveDate: '2024-01-01',
        components: [
            { id: 'c14', code: 'BASIC', name: 'Basic Salary', type: 'basic', amount: 87500, percentage: 50, isTaxable: true, frequency: 'monthly', calculationMethod: 'percentage' },
            { id: 'c15', code: 'HRA', name: 'House Rent Allowance', type: 'hra', amount: 43750, percentage: 50, isTaxable: true, frequency: 'monthly', calculationMethod: 'percentage' },
            { id: 'c16', code: 'SPECIAL', name: 'Special Allowance', type: 'allowance', amount: 33000, isTaxable: true, frequency: 'monthly', calculationMethod: 'fixed' },
            { id: 'c17', code: 'TRANSPORT', name: 'Transport Allowance', type: 'allowance', amount: 5000, isTaxable: true, frequency: 'monthly', calculationMethod: 'fixed' },
            { id: 'c18', code: 'MOBILE', name: 'Mobile Allowance', type: 'allowance', amount: 3000, isTaxable: true, frequency: 'monthly', calculationMethod: 'fixed' },
            { id: 'c19', code: 'MEAL', name: 'Meal Vouchers', type: 'allowance', amount: 2750, isTaxable: false, frequency: 'monthly', calculationMethod: 'fixed' },
        ],
        deductions: [
            { id: 'd7', code: 'PF', name: 'Provident Fund', type: 'pf', amount: 10500, percentage: 12, isStatutory: true, frequency: 'monthly' },
            { id: 'd8', code: 'PT', name: 'Professional Tax', type: 'professional_tax', amount: 200, isStatutory: true, frequency: 'monthly' },
            { id: 'd9', code: 'TDS', name: 'Income Tax (TDS)', type: 'income_tax', amount: 18000, isStatutory: true, frequency: 'monthly' },
        ],
        bankDetails: {
            accountHolderName: 'Jessica Wu',
            bankName: 'SBI Bank',
            accountNumber: '****2345',
            ifscCode: 'SBIN0001234',
            branchName: 'Koramangala Branch',
            accountType: 'savings',
            isPrimary: true,
            verified: true,
            verifiedAt: '2024-01-01T00:00:00Z',
        },
        taxRegime: 'old',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        employeeId: 'emp004',
        employeeName: 'David Kim',
        employeeEmail: 'david.kim@company.com',
        department: 'Engineering',
        designation: 'Backend Developer',
        ctc: 1560000,
        monthlyCTC: 130000,
        effectiveDate: '2024-01-01',
        components: [
            { id: 'c20', code: 'BASIC', name: 'Basic Salary', type: 'basic', amount: 65000, percentage: 50, isTaxable: true, frequency: 'monthly', calculationMethod: 'percentage' },
            { id: 'c21', code: 'HRA', name: 'House Rent Allowance', type: 'hra', amount: 32500, percentage: 50, isTaxable: true, frequency: 'monthly', calculationMethod: 'percentage' },
            { id: 'c22', code: 'SPECIAL', name: 'Special Allowance', type: 'allowance', amount: 24500, isTaxable: true, frequency: 'monthly', calculationMethod: 'fixed' },
            { id: 'c23', code: 'TRANSPORT', name: 'Transport Allowance', type: 'allowance', amount: 5000, isTaxable: true, frequency: 'monthly', calculationMethod: 'fixed' },
            { id: 'c24', code: 'MOBILE', name: 'Mobile Allowance', type: 'allowance', amount: 2000, isTaxable: true, frequency: 'monthly', calculationMethod: 'fixed' },
            { id: 'c25', code: 'MEAL', name: 'Meal Vouchers', type: 'allowance', amount: 1000, isTaxable: false, frequency: 'monthly', calculationMethod: 'fixed' },
        ],
        deductions: [
            { id: 'd10', code: 'PF', name: 'Provident Fund', type: 'pf', amount: 7800, percentage: 12, isStatutory: true, frequency: 'monthly' },
            { id: 'd11', code: 'PT', name: 'Professional Tax', type: 'professional_tax', amount: 200, isStatutory: true, frequency: 'monthly' },
            { id: 'd12', code: 'TDS', name: 'Income Tax (TDS)', type: 'income_tax', amount: 12000, isStatutory: true, frequency: 'monthly' },
        ],
        bankDetails: {
            accountHolderName: 'David Kim',
            bankName: 'Axis Bank',
            accountNumber: '****6789',
            ifscCode: 'UTIB0001234',
            branchName: 'Indiranagar Branch',
            accountType: 'savings',
            isPrimary: true,
            verified: true,
            verifiedAt: '2024-01-01T00:00:00Z',
        },
        taxRegime: 'old',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        employeeId: 'emp005',
        employeeName: 'Alex Thompson',
        employeeEmail: 'alex.thompson@company.com',
        department: 'QA',
        designation: 'QA Lead',
        ctc: 1320000,
        monthlyCTC: 110000,
        effectiveDate: '2024-01-01',
        components: [
            { id: 'c26', code: 'BASIC', name: 'Basic Salary', type: 'basic', amount: 55000, percentage: 50, isTaxable: true, frequency: 'monthly', calculationMethod: 'percentage' },
            { id: 'c27', code: 'HRA', name: 'House Rent Allowance', type: 'hra', amount: 27500, percentage: 50, isTaxable: true, frequency: 'monthly', calculationMethod: 'percentage' },
            { id: 'c28', code: 'SPECIAL', name: 'Special Allowance', type: 'allowance', amount: 20000, isTaxable: true, frequency: 'monthly', calculationMethod: 'fixed' },
            { id: 'c29', code: 'TRANSPORT', name: 'Transport Allowance', type: 'allowance', amount: 5000, isTaxable: true, frequency: 'monthly', calculationMethod: 'fixed' },
            { id: 'c30', code: 'MOBILE', name: 'Mobile Allowance', type: 'allowance', amount: 1500, isTaxable: true, frequency: 'monthly', calculationMethod: 'fixed' },
            { id: 'c31', code: 'MEAL', name: 'Meal Vouchers', type: 'allowance', amount: 1000, isTaxable: false, frequency: 'monthly', calculationMethod: 'fixed' },
        ],
        deductions: [
            { id: 'd13', code: 'PF', name: 'Provident Fund', type: 'pf', amount: 6600, percentage: 12, isStatutory: true, frequency: 'monthly' },
            { id: 'd14', code: 'PT', name: 'Professional Tax', type: 'professional_tax', amount: 200, isStatutory: true, frequency: 'monthly' },
            { id: 'd15', code: 'TDS', name: 'Income Tax (TDS)', type: 'income_tax', amount: 8000, isStatutory: true, frequency: 'monthly' },
        ],
        bankDetails: {
            accountHolderName: 'Alex Thompson',
            bankName: 'HDFC Bank',
            accountNumber: '****3456',
            ifscCode: 'HDFC0005678',
            branchName: 'HSR Layout Branch',
            accountType: 'savings',
            isPrimary: true,
            verified: true,
            verifiedAt: '2024-01-01T00:00:00Z',
        },
        taxRegime: 'new',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
];

// ============================================================================
// PAYROLL RUNS
// ============================================================================

export const generateSamplePayrollRuns = (): PayrollRun[] => [
    {
        id: 'pr_202412',
        month: '2024-12',
        year: 2024,
        monthName: 'December 2024',
        status: 'processing',
        totalEmployees: 5,
        processedEmployees: 3,
        totalGrossPay: 725000,
        totalDeductions: 72000,
        totalNetPay: 653000,
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        currentStep: 'variable_pay',
        exceptions: [
            {
                id: 'ex001',
                employeeId: 'emp002',
                employeeName: 'Michael Chen',
                type: 'high_lop',
                severity: 'medium',
                message: '2 days LOP detected',
                resolved: false,
            },
        ],
        createdAt: '2024-12-01T00:00:00Z',
        updatedAt: '2024-12-13T10:30:00Z',
    },
    {
        id: 'pr_202411',
        month: '2024-11',
        year: 2024,
        monthName: 'November 2024',
        status: 'disbursed',
        totalEmployees: 5,
        processedEmployees: 5,
        totalGrossPay: 725000,
        totalDeductions: 70000,
        totalNetPay: 655000,
        startDate: '2024-11-01',
        endDate: '2024-11-30',
        processedBy: 'admin@company.com',
        processedAt: '2024-11-25T14:00:00Z',
        approvedBy: 'cfo@company.com',
        approvedAt: '2024-11-27T10:00:00Z',
        disbursedAt: '2024-11-30T16:00:00Z',
        currentStep: 'final_preview',
        exceptions: [],
        createdAt: '2024-11-01T00:00:00Z',
        updatedAt: '2024-11-30T16:00:00Z',
    },
];

// ============================================================================
// TAX DECLARATIONS
// ============================================================================

export const generateSampleTaxDeclarations = (): TaxDeclaration[] => [
    {
        id: 'td_emp001_2024',
        employeeId: 'emp001',
        financialYear: '2024-25',
        regime: 'old',
        categories: [
            {
                id: 'cat_80c',
                section: '80C',
                name: 'Section 80C Deductions',
                limit: 150000,
                declared: 150000,
                verified: 120000,
                proofs: [
                    { id: 'p1', name: 'EPF Contribution', type: 'EPF', amount: 45000, uploadedAt: '2024-04-01T00:00:00Z', status: 'verified', verifiedBy: 'hr@company.com', verifiedAt: '2024-04-05T00:00:00Z' },
                    { id: 'p2', name: 'PPF Investment', type: 'PPF', amount: 75000, uploadedAt: '2024-04-01T00:00:00Z', status: 'verified', verifiedBy: 'hr@company.com', verifiedAt: '2024-04-05T00:00:00Z' },
                    { id: 'p3', name: 'ELSS Mutual Fund', type: 'ELSS', amount: 30000, uploadedAt: '2024-04-10T00:00:00Z', status: 'pending' },
                ],
            },
            {
                id: 'cat_hra',
                section: 'HRA',
                name: 'HRA Exemption',
                limit: 240000,
                declared: 180000,
                verified: 150000,
                proofs: [
                    { id: 'p4', name: 'Rent Receipts (Apr-Sep)', type: 'Rent Receipt', amount: 150000, uploadedAt: '2024-04-01T00:00:00Z', status: 'verified', verifiedBy: 'hr@company.com', verifiedAt: '2024-04-05T00:00:00Z' },
                    { id: 'p5', name: 'Rent Receipts (Oct-Dec)', type: 'Rent Receipt', amount: 30000, uploadedAt: '2024-12-01T00:00:00Z', status: 'pending' },
                ],
            },
            {
                id: 'cat_80d',
                section: '80D',
                name: 'Medical Insurance (80D)',
                limit: 25000,
                declared: 15000,
                verified: 15000,
                proofs: [
                    { id: 'p6', name: 'Health Insurance Premium', type: 'Insurance', amount: 15000, uploadedAt: '2024-04-01T00:00:00Z', status: 'verified', verifiedBy: 'hr@company.com', verifiedAt: '2024-04-05T00:00:00Z' },
                ],
            },
        ],
        totalDeclared: 345000,
        totalVerified: 285000,
        totalRejected: 0,
        status: 'approved',
        submittedAt: '2024-04-15T00:00:00Z',
        approvedAt: '2024-04-20T00:00:00Z',
        approvedBy: 'hr@company.com',
        createdAt: '2024-04-01T00:00:00Z',
        updatedAt: '2024-04-20T00:00:00Z',
    },
];

// ============================================================================
// REIMBURSEMENT CLAIMS
// ============================================================================

export const generateSampleReimbursements = (): ReimbursementClaim[] => [
    {
        id: 'reimb_001',
        claimNumber: 'RC-2024-001',
        employeeId: 'emp001',
        employeeName: 'Sarah Anderson',
        category: 'medical',
        amount: 5000,
        claimDate: '2024-12-01',
        description: 'Dental checkup and treatment',
        receipts: [
            { id: 'r1', fileName: 'dental_receipt.pdf', fileUrl: 'https://storage.example.com/receipts/dental_receipt.pdf', fileSize: 245000, uploadedAt: '2024-12-01T10:00:00Z' },
        ],
        status: 'approved',
        approver: 'hr@company.com',
        approvedAt: '2024-12-05T14:00:00Z',
        createdAt: '2024-12-01T10:00:00Z',
        updatedAt: '2024-12-05T14:00:00Z',
    },
    {
        id: 'reimb_002',
        claimNumber: 'RC-2024-002',
        employeeId: 'emp003',
        employeeName: 'Jessica Wu',
        category: 'travel',
        amount: 12000,
        claimDate: '2024-12-10',
        description: 'Client visit to Mumbai - airfare and hotel',
        receipts: [
            { id: 'r2', fileName: 'flight_ticket.pdf', fileUrl: 'https://storage.example.com/receipts/flight_ticket.pdf', fileSize: 180000, uploadedAt: '2024-12-10T09:00:00Z' },
            { id: 'r3', fileName: 'hotel_bill.pdf', fileUrl: 'https://storage.example.com/receipts/hotel_bill.pdf', fileSize: 210000, uploadedAt: '2024-12-10T09:00:00Z' },
        ],
        status: 'under_review',
        createdAt: '2024-12-10T09:00:00Z',
        updatedAt: '2024-12-10T09:00:00Z',
    },
];

// ============================================================================
// EMPLOYEE LOANS
// ============================================================================

export const generateSampleLoans = (): EmployeeLoan[] => [
    {
        id: 'loan_001',
        loanNumber: 'LN-2024-001',
        employeeId: 'emp004',
        employeeName: 'David Kim',
        loanType: 'personal',
        principalAmount: 100000,
        interestRate: 8.5,
        tenure: 12,
        emiAmount: 8750,
        disbursedDate: '2024-06-01',
        totalRecovered: 52500,
        remainingBalance: 47500,
        nextEMIDate: '2025-01-01',
        status: 'active',
        approvedBy: 'cfo@company.com',
        approvedAt: '2024-05-25T00:00:00Z',
        recoveries: [
            { id: 'rec1', loanId: 'loan_001', payrollRunId: 'pr_202411', month: '2024-11', emiAmount: 8750, principalRecovered: 8050, interestRecovered: 700, recoveryDate: '2024-11-30' },
            { id: 'rec2', loanId: 'loan_001', payrollRunId: 'pr_202410', month: '2024-10', emiAmount: 8750, principalRecovered: 8000, interestRecovered: 750, recoveryDate: '2024-10-31' },
        ],
        createdAt: '2024-05-20T00:00:00Z',
        updatedAt: '2024-11-30T00:00:00Z',
    },
];

// ============================================================================
// BONUSES
// ============================================================================

export const generateSampleBonuses = (): Bonus[] => [
    {
        id: 'bonus_001',
        employeeId: 'emp003',
        employeeName: 'Jessica Wu',
        bonusType: 'performance',
        amount: 50000,
        reason: 'Q4 2024 performance bonus - exceeded targets',
        eligibilityCriteria: 'Performance rating 4.5+',
        payrollRunId: 'pr_202412',
        paymentMonth: '2024-12',
        status: 'approved',
        approvedBy: 'ceo@company.com',
        approvedAt: '2024-12-10T00:00:00Z',
        createdAt: '2024-12-05T00:00:00Z',
        updatedAt: '2024-12-10T00:00:00Z',
    },
    {
        id: 'bonus_002',
        employeeId: 'emp001',
        employeeName: 'Sarah Anderson',
        bonusType: 'annual',
        amount: 75000,
        reason: 'Annual performance bonus 2024',
        paymentMonth: '2024-12',
        status: 'pending_approval',
        createdAt: '2024-12-01T00:00:00Z',
        updatedAt: '2024-12-01T00:00:00Z',
    },
];

// ============================================================================
// PAYROLL SETTINGS
// ============================================================================

export const generateSampleSettings = (): PayrollSettings => ({
    organizationId: 'org_001',
    currency: 'USD',
    payFrequency: 'monthly',
    payDayOfMonth: 30,
    financialYearStart: '04-01', // April 1st

    // PF Settings
    pfEnabled: true,
    pfEmployeeContribution: 12,
    pfEmployerContribution: 12,
    pfWageLimit: 15000,

    // ESI Settings
    esiEnabled: false,
    esiEmployeeContribution: 0.75,
    esiEmployerContribution: 3.25,
    esiWageLimit: 21000,

    // Professional Tax
    ptEnabled: true,
    ptState: 'Karnataka',
    ptSlabs: [
        { from: 0, to: 15000, amount: 0 },
        { from: 15001, to: 20000, amount: 150 },
        { from: 20001, to: 99999999, amount: 200 },
    ],

    // Rounding
    roundingMethod: 'nearest_rupee',

    updatedAt: '2024-01-01T00:00:00Z',
    updatedBy: 'admin@company.com',
});
