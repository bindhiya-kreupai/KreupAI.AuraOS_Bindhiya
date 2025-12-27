/**
 * usePayroll Hook Tests - Production Ready
 * Comprehensive test coverage for all payroll operations
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePayroll } from './usePayroll';
import type {
    PayrollRun,
    Payslip,
    EmployeeSalary,
    TaxDeclaration,
    ReimbursementClaim,
    EmployeeLoan,
    Bonus,
    PayrollSettings,
    PayrollStats,
} from '../types';

// ============================================================================
// MOCKS
// ============================================================================

// Mock all payroll services
vi.mock('../services', () => ({
    PayrollRunService: {
        getPayrollRuns: vi.fn(() => Promise.resolve([])),
        getPayrollRun: vi.fn((id: string) => Promise.resolve(null)),
        createPayrollRun: vi.fn((data) => Promise.resolve(data)),
        updatePayrollRun: vi.fn((id, data) => Promise.resolve({ id, ...data })),
        deletePayrollRun: vi.fn(() => Promise.resolve()),
        processStep: vi.fn((id, step) => Promise.resolve({ id, currentStep: step })),
        approvePayroll: vi.fn((id, approvedBy) => Promise.resolve({ id, status: 'approved', approvedBy })),
    },
    PayslipService: {
        getPayslips: vi.fn(() => Promise.resolve([])),
        downloadPayslip: vi.fn(() => Promise.resolve(new Blob(['test'], { type: 'application/pdf' }))),
    },
    EmployeeSalaryService: {
        getEmployeeSalaries: vi.fn(() => Promise.resolve([])),
        updateEmployeeSalary: vi.fn((id, data) => Promise.resolve({ employeeId: id, ...data })),
    },
    TaxDeclarationService: {
        getTaxDeclarations: vi.fn(() => Promise.resolve([])),
        saveDeclaration: vi.fn((data) => Promise.resolve(data)),
        uploadProof: vi.fn(() => Promise.resolve('https://example.com/proof.pdf')),
    },
    ReimbursementService: {
        getClaims: vi.fn(() => Promise.resolve([])),
        createClaim: vi.fn((data) => Promise.resolve(data)),
        updateClaimStatus: vi.fn((id, status, approver, reason) => Promise.resolve({ id, status, approvedBy: approver, rejectionReason: reason })),
    },
    LoanService: {
        getLoans: vi.fn(() => Promise.resolve([])),
        createLoan: vi.fn((data) => Promise.resolve(data)),
        updateLoan: vi.fn((id, data) => Promise.resolve({ id, ...data })),
    },
    BonusService: {
        getBonuses: vi.fn(() => Promise.resolve([])),
        createBonus: vi.fn((data) => Promise.resolve(data)),
        updateBonusStatus: vi.fn((id, status, approvedBy) => Promise.resolve({ id, status, approvedBy })),
    },
    PayrollSettingsService: {
        getSettings: vi.fn(() => Promise.resolve(null)),
        updateSettings: vi.fn((data) => Promise.resolve(data)),
    },
    PayrollAnalyticsService: {
        getStats: vi.fn(() => Promise.resolve({
            totalEmployees: 150,
            totalPayrollCost: 12500000,
            avgSalary: 83333,
            pendingReimbursements: 25,
            activeLoans: 12,
            upcomingBonuses: 8,
        })),
    },
}));

// Mock sample data generators
vi.mock('../data', () => ({
    generateSampleEmployeeSalaries: vi.fn(() => []),
    generateSamplePayrollRuns: vi.fn(() => []),
    generateSampleTaxDeclarations: vi.fn(() => []),
    generateSampleReimbursements: vi.fn(() => []),
    generateSampleLoans: vi.fn(() => []),
    generateSampleBonuses: vi.fn(() => []),
    generateSampleSettings: vi.fn(() => ({
        id: 'settings-001',
        payFrequency: 'monthly' as const,
        payDay: 28,
        taxRegime: 'new' as const,
        pfEnabled: true,
        esiEnabled: true,
        ptEnabled: true,
    })),
}));

// Mock useToast hook
const mockToast = {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
};

vi.mock('./useToast', () => ({
    useToast: () => mockToast,
}));

// Import services for assertions
import {
    PayrollRunService,
    PayslipService,
    EmployeeSalaryService,
    TaxDeclarationService,
    ReimbursementService,
    LoanService,
    BonusService,
    PayrollSettingsService,
    PayrollAnalyticsService,
} from '../services';

import {
    generateSampleEmployeeSalaries,
    generateSamplePayrollRuns,
    generateSampleTaxDeclarations,
    generateSampleReimbursements,
    generateSampleLoans,
    generateSampleBonuses,
    generateSampleSettings,
} from '../data';

// ============================================================================
// TEST DATA
// ============================================================================

const mockPayrollRun: PayrollRun = {
    id: 'run-001',
    period: '2024-01',
    month: 1,
    year: 2024,
    status: 'draft',
    currentStep: 'calculation',
    totalEmployees: 150,
    totalGross: 12500000,
    totalDeductions: 1250000,
    totalNet: 11250000,
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    createdBy: 'admin-001',
    createdAt: '2024-01-25T10:00:00Z',
};

const mockEmployeeSalary: EmployeeSalary = {
    employeeId: 'emp-001',
    employeeName: 'John Doe',
    basicSalary: 50000,
    hra: 20000,
    transport: 1600,
    medical: 1250,
    specialAllowance: 10000,
    gross: 82850,
    pfEmployer: 6000,
    pfEmployee: 6000,
    esi: 622,
    professionalTax: 200,
    incomeTax: 5000,
    totalDeductions: 11822,
    netSalary: 71028,
    effectiveFrom: '2024-01-01',
};

const mockTaxDeclaration: TaxDeclaration = {
    id: 'tax-001',
    employeeId: 'emp-001',
    financialYear: '2023-24',
    regime: 'new',
    status: 'draft',
    declarations: [
        {
            categoryId: 'sec-80c',
            categoryName: 'Section 80C',
            limit: 150000,
            declared: 100000,
            proofs: [],
        },
    ],
    totalDeclared: 100000,
    totalApproved: 0,
    estimatedTax: 50000,
    submittedAt: null,
    approvedAt: null,
};

const mockReimbursement: ReimbursementClaim = {
    id: 'reimb-001',
    employeeId: 'emp-001',
    employeeName: 'John Doe',
    category: 'Medical',
    amount: 5000,
    description: 'Medical checkup',
    billDate: '2024-01-15',
    status: 'pending',
    attachments: [],
    submittedAt: '2024-01-20T10:00:00Z',
};

const mockLoan: EmployeeLoan = {
    id: 'loan-001',
    employeeId: 'emp-001',
    employeeName: 'John Doe',
    loanType: 'Personal',
    amount: 100000,
    interestRate: 8.5,
    tenure: 12,
    emi: 8698,
    startDate: '2024-01-01',
    status: 'active',
    totalPaid: 8698,
    balance: 91302,
    createdAt: '2024-01-01T10:00:00Z',
};

const mockBonus: Bonus = {
    id: 'bonus-001',
    employeeId: 'emp-001',
    employeeName: 'John Doe',
    bonusType: 'Performance',
    amount: 50000,
    reason: 'Exceptional performance in Q1',
    status: 'pending',
    paymentDate: '2024-02-28',
    createdAt: '2024-01-25T10:00:00Z',
};

// ============================================================================
// TESTS
// ============================================================================

describe('usePayroll', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    // ========================================================================
    // INITIALIZATION
    // ========================================================================

    describe('Initialization', () => {
        it('initializes with loading state', () => {
            vi.mocked(PayrollRunService.getPayrollRuns).mockImplementation(
                () => new Promise(() => {}) // Never resolves
            );

            const { result } = renderHook(() => usePayroll());

            expect(result.current.isLoading).toBe(true);
            expect(result.current.payrollRuns).toEqual([]);
            expect(result.current.employeeSalaries).toEqual([]);
        });

        it('loads all payroll data on mount', async () => {
            const mockRuns = [mockPayrollRun];
            const mockSalaries = [mockEmployeeSalary];

            vi.mocked(PayrollRunService.getPayrollRuns).mockResolvedValue(mockRuns);
            vi.mocked(EmployeeSalaryService.getEmployeeSalaries).mockResolvedValue(mockSalaries);

            const { result } = renderHook(() => usePayroll());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.payrollRuns).toEqual(mockRuns);
            expect(result.current.employeeSalaries).toEqual(mockSalaries);
            expect(result.current.stats).toBeDefined();
        });

        it('initializes with sample data when no data exists', async () => {
            const sampleSalaries = [mockEmployeeSalary];
            const sampleRuns = [mockPayrollRun];

            vi.mocked(EmployeeSalaryService.getEmployeeSalaries).mockResolvedValue([]);
            vi.mocked(generateSampleEmployeeSalaries).mockReturnValue(sampleSalaries);
            vi.mocked(PayrollRunService.getPayrollRuns).mockResolvedValue([]);
            vi.mocked(generateSamplePayrollRuns).mockReturnValue(sampleRuns);

            const { result } = renderHook(() => usePayroll());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.employeeSalaries).toEqual(sampleSalaries);
            expect(result.current.payrollRuns).toEqual(sampleRuns);
        });

        it('handles initialization errors gracefully', async () => {
            const error = new Error('Network error');
            vi.mocked(PayrollRunService.getPayrollRuns).mockRejectedValue(error);

            const { result } = renderHook(() => usePayroll());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(mockToast.error).toHaveBeenCalledWith('Network error');
        });
    });

    // ========================================================================
    // PAYROLL RUNS
    // ========================================================================

    describe('Payroll Run Operations', () => {
        it('gets payroll run by ID', async () => {
            vi.mocked(PayrollRunService.getPayrollRun).mockResolvedValue(mockPayrollRun);

            const { result } = renderHook(() => usePayroll());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            let run;
            await act(async () => {
                run = await result.current.getPayrollRun('run-001');
            });

            expect(PayrollRunService.getPayrollRun).toHaveBeenCalledWith('run-001');
            expect(run).toEqual(mockPayrollRun);
        });

        it('creates new payroll run successfully', async () => {
            vi.mocked(PayrollRunService.getPayrollRuns).mockResolvedValue([]);
            vi.mocked(PayrollRunService.createPayrollRun).mockResolvedValue(undefined);

            const { result } = renderHook(() => usePayroll());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await act(async () => {
                await result.current.createPayrollRun(mockPayrollRun);
            });

            expect(result.current.payrollRuns).toContainEqual(mockPayrollRun);
            expect(PayrollRunService.createPayrollRun).toHaveBeenCalledWith(mockPayrollRun);
            expect(mockToast.success).toHaveBeenCalledWith('Payroll run created successfully!');
        });

        it('updates payroll run successfully', async () => {
            vi.mocked(PayrollRunService.getPayrollRuns).mockResolvedValue([mockPayrollRun]);

            const { result } = renderHook(() => usePayroll());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            const updates = { status: 'approved' as const };

            await act(async () => {
                await result.current.updatePayrollRun('run-001', updates);
            });

            expect(PayrollRunService.updatePayrollRun).toHaveBeenCalledWith('run-001', updates);
            expect(mockToast.success).toHaveBeenCalledWith('Payroll run updated successfully!');
        });

        it('deletes payroll run successfully', async () => {
            vi.mocked(PayrollRunService.getPayrollRuns).mockResolvedValue([mockPayrollRun]);

            const { result } = renderHook(() => usePayroll());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await act(async () => {
                await result.current.deletePayrollRun('run-001');
            });

            expect(PayrollRunService.deletePayrollRun).toHaveBeenCalledWith('run-001');
            expect(result.current.payrollRuns).not.toContainEqual(mockPayrollRun);
            expect(mockToast.success).toHaveBeenCalledWith('Payroll run deleted successfully!');
        });

        it('processes payroll step successfully', async () => {
            vi.mocked(PayrollRunService.getPayrollRuns).mockResolvedValue([mockPayrollRun]);
            const updatedRun = { ...mockPayrollRun, currentStep: 'verification' as const };
            vi.mocked(PayrollRunService.processStep).mockResolvedValue(updatedRun);

            const { result } = renderHook(() => usePayroll());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await act(async () => {
                await result.current.processPayrollStep('run-001', 'verification');
            });

            expect(PayrollRunService.processStep).toHaveBeenCalledWith('run-001', 'verification');
            expect(mockToast.success).toHaveBeenCalledWith('Moved to verification step');
        });

        it('approves payroll successfully', async () => {
            vi.mocked(PayrollRunService.getPayrollRuns).mockResolvedValue([mockPayrollRun]);
            const approvedRun = { ...mockPayrollRun, status: 'approved' as const, approvedBy: 'admin-001' };
            vi.mocked(PayrollRunService.approvePayroll).mockResolvedValue(approvedRun);

            const { result } = renderHook(() => usePayroll());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await act(async () => {
                await result.current.approvePayroll('run-001', 'admin-001');
            });

            expect(PayrollRunService.approvePayroll).toHaveBeenCalledWith('run-001', 'admin-001');
            expect(mockToast.success).toHaveBeenCalledWith('Payroll approved and ready for disbursement!');
        });

        it('handles payroll run errors', async () => {
            const error = new Error('Failed to create payroll run');
            vi.mocked(PayrollRunService.getPayrollRuns).mockResolvedValue([]);
            vi.mocked(PayrollRunService.createPayrollRun).mockRejectedValue(error);

            const { result } = renderHook(() => usePayroll());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await expect(async () => {
                await act(async () => {
                    await result.current.createPayrollRun(mockPayrollRun);
                });
            }).rejects.toThrow('Failed to create payroll run');

            expect(mockToast.error).toHaveBeenCalledWith('Failed to create payroll run');
        });
    });

    // ========================================================================
    // PAYSLIPS
    // ========================================================================

    describe('Payslip Operations', () => {
        it('gets payslips for an employee', async () => {
            const mockPayslips: Payslip[] = [
                {
                    id: 'slip-001',
                    employeeId: 'emp-001',
                    employeeName: 'John Doe',
                    period: '2024-01',
                    gross: 82850,
                    deductions: 11822,
                    net: 71028,
                    generatedAt: '2024-01-31T10:00:00Z',
                },
            ];

            vi.mocked(PayslipService.getPayslips).mockResolvedValue(mockPayslips);

            const { result } = renderHook(() => usePayroll());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            let slips;
            await act(async () => {
                slips = await result.current.getPayslips('emp-001');
            });

            expect(PayslipService.getPayslips).toHaveBeenCalledWith('emp-001');
            expect(slips).toEqual(mockPayslips);
        });

        it('downloads payslip successfully', async () => {
            // Mock URL.createObjectURL and URL.revokeObjectURL
            const mockUrl = 'blob:mock-url';
            global.URL.createObjectURL = vi.fn(() => mockUrl);
            global.URL.revokeObjectURL = vi.fn();

            // Mock createElement and click
            const mockAnchor = {
                href: '',
                download: '',
                click: vi.fn(),
            };
            vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);

            const { result } = renderHook(() => usePayroll());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await act(async () => {
                await result.current.downloadPayslip('slip-001');
            });

            expect(PayslipService.downloadPayslip).toHaveBeenCalledWith('slip-001');
            expect(mockAnchor.click).toHaveBeenCalled();
            expect(mockAnchor.download).toBe('payslip_slip-001.pdf');
            expect(mockToast.success).toHaveBeenCalledWith('Payslip downloaded successfully!');
        });

        it('handles payslip download error', async () => {
            const error = new Error('Download failed');
            vi.mocked(PayslipService.downloadPayslip).mockRejectedValue(error);

            const { result } = renderHook(() => usePayroll());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await expect(async () => {
                await act(async () => {
                    await result.current.downloadPayslip('slip-001');
                });
            }).rejects.toThrow('Download failed');

            expect(mockToast.error).toHaveBeenCalledWith('Download failed');
        });
    });

    // ========================================================================
    // EMPLOYEE SALARIES
    // ========================================================================

    describe('Employee Salary Operations', () => {
        it('updates employee salary successfully', async () => {
            vi.mocked(EmployeeSalaryService.getEmployeeSalaries).mockResolvedValue([mockEmployeeSalary]);

            const { result } = renderHook(() => usePayroll());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            const updates = { basicSalary: 55000, gross: 90000 };

            await act(async () => {
                await result.current.updateEmployeeSalary('emp-001', updates);
            });

            expect(EmployeeSalaryService.updateEmployeeSalary).toHaveBeenCalledWith('emp-001', updates);
            expect(mockToast.success).toHaveBeenCalledWith('Salary updated successfully!');
        });

        it('handles salary update error', async () => {
            const error = new Error('Update failed');
            vi.mocked(EmployeeSalaryService.getEmployeeSalaries).mockResolvedValue([]);
            vi.mocked(EmployeeSalaryService.updateEmployeeSalary).mockRejectedValue(error);

            const { result } = renderHook(() => usePayroll());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await expect(async () => {
                await act(async () => {
                    await result.current.updateEmployeeSalary('emp-001', { basicSalary: 55000 });
                });
            }).rejects.toThrow('Update failed');

            expect(mockToast.error).toHaveBeenCalledWith('Update failed');
        });
    });

    // ========================================================================
    // TAX DECLARATIONS
    // ========================================================================

    describe('Tax Declaration Operations', () => {
        it('saves tax declaration successfully', async () => {
            vi.mocked(TaxDeclarationService.getTaxDeclarations).mockResolvedValue([]);
            vi.mocked(TaxDeclarationService.saveDeclaration).mockResolvedValue(mockTaxDeclaration);

            const { result } = renderHook(() => usePayroll());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await act(async () => {
                await result.current.saveTaxDeclaration(mockTaxDeclaration);
            });

            expect(TaxDeclarationService.saveDeclaration).toHaveBeenCalledWith(mockTaxDeclaration);
            expect(result.current.taxDeclarations).toContainEqual(mockTaxDeclaration);
            expect(mockToast.success).toHaveBeenCalledWith('Tax declaration saved successfully!');
        });

        it('updates existing tax declaration', async () => {
            vi.mocked(TaxDeclarationService.getTaxDeclarations).mockResolvedValue([mockTaxDeclaration]);
            const updated = { ...mockTaxDeclaration, totalDeclared: 120000 };
            vi.mocked(TaxDeclarationService.saveDeclaration).mockResolvedValue(updated);

            const { result } = renderHook(() => usePayroll());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await act(async () => {
                await result.current.saveTaxDeclaration(updated);
            });

            expect(result.current.taxDeclarations).toHaveLength(1);
            expect(result.current.taxDeclarations[0].totalDeclared).toBe(120000);
        });

        it('uploads tax proof successfully', async () => {
            const mockFile = new File(['test'], 'proof.pdf', { type: 'application/pdf' });

            const { result } = renderHook(() => usePayroll());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            let url;
            await act(async () => {
                url = await result.current.uploadTaxProof('tax-001', 'sec-80c', mockFile);
            });

            expect(TaxDeclarationService.uploadProof).toHaveBeenCalledWith('tax-001', 'sec-80c', mockFile);
            expect(url).toBe('https://example.com/proof.pdf');
            expect(mockToast.success).toHaveBeenCalledWith('Tax proof uploaded successfully!');
        });
    });

    // ========================================================================
    // REIMBURSEMENTS
    // ========================================================================

    describe('Reimbursement Operations', () => {
        it('creates reimbursement claim successfully', async () => {
            vi.mocked(ReimbursementService.getClaims).mockResolvedValue([]);

            const { result } = renderHook(() => usePayroll());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await act(async () => {
                await result.current.createReimbursement(mockReimbursement);
            });

            expect(ReimbursementService.createClaim).toHaveBeenCalledWith(mockReimbursement);
            expect(result.current.reimbursements).toContainEqual(mockReimbursement);
            expect(mockToast.success).toHaveBeenCalledWith('Reimbursement claim submitted successfully!');
        });

        it('updates reimbursement status to approved', async () => {
            vi.mocked(ReimbursementService.getClaims).mockResolvedValue([mockReimbursement]);
            const approved = { ...mockReimbursement, status: 'approved' as const, approvedBy: 'manager-001' };
            vi.mocked(ReimbursementService.updateClaimStatus).mockResolvedValue(approved);

            const { result } = renderHook(() => usePayroll());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await act(async () => {
                await result.current.updateReimbursementStatus('reimb-001', 'approved', 'manager-001');
            });

            expect(ReimbursementService.updateClaimStatus).toHaveBeenCalledWith('reimb-001', 'approved', 'manager-001', undefined);
            expect(mockToast.success).toHaveBeenCalledWith('Claim approved successfully!');
        });

        it('updates reimbursement status to rejected with reason', async () => {
            vi.mocked(ReimbursementService.getClaims).mockResolvedValue([mockReimbursement]);
            const rejected = {
                ...mockReimbursement,
                status: 'rejected' as const,
                approvedBy: 'manager-001',
                rejectionReason: 'Invalid bill',
            };
            vi.mocked(ReimbursementService.updateClaimStatus).mockResolvedValue(rejected);

            const { result } = renderHook(() => usePayroll());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await act(async () => {
                await result.current.updateReimbursementStatus('reimb-001', 'rejected', 'manager-001', 'Invalid bill');
            });

            expect(ReimbursementService.updateClaimStatus).toHaveBeenCalledWith(
                'reimb-001',
                'rejected',
                'manager-001',
                'Invalid bill'
            );
        });
    });

    // ========================================================================
    // LOANS
    // ========================================================================

    describe('Loan Operations', () => {
        it('creates loan successfully', async () => {
            vi.mocked(LoanService.getLoans).mockResolvedValue([]);

            const { result } = renderHook(() => usePayroll());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await act(async () => {
                await result.current.createLoan(mockLoan);
            });

            expect(LoanService.createLoan).toHaveBeenCalledWith(mockLoan);
            expect(result.current.loans).toContainEqual(mockLoan);
            expect(mockToast.success).toHaveBeenCalledWith('Loan created successfully!');
        });

        it('updates loan successfully', async () => {
            vi.mocked(LoanService.getLoans).mockResolvedValue([mockLoan]);

            const { result } = renderHook(() => usePayroll());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            const updates = { totalPaid: 17396, balance: 82604 };

            await act(async () => {
                await result.current.updateLoan('loan-001', updates);
            });

            expect(LoanService.updateLoan).toHaveBeenCalledWith('loan-001', updates);
            expect(mockToast.success).toHaveBeenCalledWith('Loan updated successfully!');
        });

        it('handles loan creation error', async () => {
            const error = new Error('Loan creation failed');
            vi.mocked(LoanService.getLoans).mockResolvedValue([]);
            vi.mocked(LoanService.createLoan).mockRejectedValue(error);

            const { result } = renderHook(() => usePayroll());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await expect(async () => {
                await act(async () => {
                    await result.current.createLoan(mockLoan);
                });
            }).rejects.toThrow('Loan creation failed');

            expect(mockToast.error).toHaveBeenCalledWith('Loan creation failed');
        });
    });

    // ========================================================================
    // BONUSES
    // ========================================================================

    describe('Bonus Operations', () => {
        it('creates bonus successfully', async () => {
            vi.mocked(BonusService.getBonuses).mockResolvedValue([]);

            const { result } = renderHook(() => usePayroll());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await act(async () => {
                await result.current.createBonus(mockBonus);
            });

            expect(BonusService.createBonus).toHaveBeenCalledWith(mockBonus);
            expect(result.current.bonuses).toContainEqual(mockBonus);
            expect(mockToast.success).toHaveBeenCalledWith('Bonus created successfully!');
        });

        it('approves bonus successfully', async () => {
            vi.mocked(BonusService.getBonuses).mockResolvedValue([mockBonus]);
            const approved = { ...mockBonus, status: 'approved' as const, approvedBy: 'admin-001' };
            vi.mocked(BonusService.updateBonusStatus).mockResolvedValue(approved);

            const { result } = renderHook(() => usePayroll());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await act(async () => {
                await result.current.updateBonusStatus('bonus-001', 'approved', 'admin-001');
            });

            expect(BonusService.updateBonusStatus).toHaveBeenCalledWith('bonus-001', 'approved', 'admin-001');
            expect(mockToast.success).toHaveBeenCalledWith('Bonus approved successfully!');
        });

        it('rejects bonus successfully', async () => {
            vi.mocked(BonusService.getBonuses).mockResolvedValue([mockBonus]);
            const rejected = { ...mockBonus, status: 'rejected' as const };
            vi.mocked(BonusService.updateBonusStatus).mockResolvedValue(rejected);

            const { result } = renderHook(() => usePayroll());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await act(async () => {
                await result.current.updateBonusStatus('bonus-001', 'rejected');
            });

            expect(mockToast.success).toHaveBeenCalledWith('Bonus rejected successfully!');
        });
    });

    // ========================================================================
    // SETTINGS
    // ========================================================================

    describe('Settings Operations', () => {
        it('updates payroll settings successfully', async () => {
            const newSettings: PayrollSettings = {
                id: 'settings-001',
                payFrequency: 'monthly',
                payDay: 30,
                taxRegime: 'old',
                pfEnabled: true,
                esiEnabled: false,
                ptEnabled: true,
            };

            vi.mocked(PayrollSettingsService.updateSettings).mockResolvedValue(newSettings);

            const { result } = renderHook(() => usePayroll());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await act(async () => {
                await result.current.updateSettings(newSettings);
            });

            expect(PayrollSettingsService.updateSettings).toHaveBeenCalledWith(newSettings);
            expect(result.current.settings).toEqual(newSettings);
            expect(mockToast.success).toHaveBeenCalledWith('Payroll settings updated successfully!');
        });

        it('handles settings update error', async () => {
            const error = new Error('Settings update failed');
            vi.mocked(PayrollSettingsService.updateSettings).mockRejectedValue(error);

            const { result } = renderHook(() => usePayroll());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            const newSettings: PayrollSettings = {
                id: 'settings-001',
                payFrequency: 'monthly',
                payDay: 30,
                taxRegime: 'old',
                pfEnabled: true,
                esiEnabled: false,
                ptEnabled: true,
            };

            await expect(async () => {
                await act(async () => {
                    await result.current.updateSettings(newSettings);
                });
            }).rejects.toThrow('Settings update failed');

            expect(mockToast.error).toHaveBeenCalledWith('Settings update failed');
        });
    });

    // ========================================================================
    // ANALYTICS
    // ========================================================================

    describe('Analytics Operations', () => {
        it('refreshes statistics successfully', async () => {
            const mockStats: PayrollStats = {
                totalEmployees: 150,
                totalPayrollCost: 12500000,
                avgSalary: 83333,
                pendingReimbursements: 25,
                activeLoans: 12,
                upcomingBonuses: 8,
            };

            vi.mocked(PayrollAnalyticsService.getStats).mockResolvedValue(mockStats);

            const { result } = renderHook(() => usePayroll());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            let stats;
            await act(async () => {
                stats = await result.current.refreshStats();
            });

            expect(PayrollAnalyticsService.getStats).toHaveBeenCalled();
            expect(stats).toEqual(mockStats);
            expect(result.current.stats).toEqual(mockStats);
        });

        it('handles stats refresh error gracefully', async () => {
            const error = new Error('Stats fetch failed');
            vi.mocked(PayrollAnalyticsService.getStats).mockRejectedValueOnce(error);

            const { result } = renderHook(() => usePayroll());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            let stats;
            await act(async () => {
                stats = await result.current.refreshStats();
            });

            expect(stats).toBeNull();
            expect(mockToast.error).toHaveBeenCalledWith('Stats fetch failed');
        });
    });

    // ========================================================================
    // LOADING STATES
    // ========================================================================

    describe('Loading States', () => {
        it('sets isSaving to true during save operations', async () => {
            let resolveSave: (value: any) => void;
            const savePromise = new Promise((resolve) => {
                resolveSave = resolve;
            });

            vi.mocked(PayrollRunService.getPayrollRuns).mockResolvedValue([]);
            vi.mocked(PayrollRunService.createPayrollRun).mockReturnValue(savePromise as any);

            const { result } = renderHook(() => usePayroll());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            act(() => {
                result.current.createPayrollRun(mockPayrollRun);
            });

            // Should be saving
            expect(result.current.isSaving).toBe(true);

            // Resolve the promise
            await act(async () => {
                resolveSave!(undefined);
                await savePromise;
            });

            // Should no longer be saving
            expect(result.current.isSaving).toBe(false);
        });

        it('resets isSaving after error', async () => {
            const error = new Error('Save failed');
            vi.mocked(PayrollRunService.getPayrollRuns).mockResolvedValue([]);
            vi.mocked(PayrollRunService.createPayrollRun).mockRejectedValue(error);

            const { result } = renderHook(() => usePayroll());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await expect(async () => {
                await act(async () => {
                    await result.current.createPayrollRun(mockPayrollRun);
                });
            }).rejects.toThrow();

            expect(result.current.isSaving).toBe(false);
        });
    });

    // ========================================================================
    // EDGE CASES
    // ========================================================================

    describe('Edge Cases', () => {
        it('handles null return from getPayrollRun', async () => {
            vi.mocked(PayrollRunService.getPayrollRun).mockResolvedValue(null);

            const { result } = renderHook(() => usePayroll());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            let run;
            await act(async () => {
                run = await result.current.getPayrollRun('non-existent');
            });

            expect(run).toBeNull();
        });

        it('handles empty payslips array', async () => {
            vi.mocked(PayslipService.getPayslips).mockResolvedValue([]);

            const { result } = renderHook(() => usePayroll());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            let slips;
            await act(async () => {
                slips = await result.current.getPayslips('emp-001');
            });

            expect(slips).toEqual([]);
        });

        it('handles concurrent operations', async () => {
            vi.mocked(LoanService.getLoans).mockResolvedValue([]);
            vi.mocked(BonusService.getBonuses).mockResolvedValue([]);

            const { result } = renderHook(() => usePayroll());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            // Create loan and bonus concurrently
            await act(async () => {
                await Promise.all([
                    result.current.createLoan(mockLoan),
                    result.current.createBonus(mockBonus),
                ]);
            });

            expect(result.current.loans).toContainEqual(mockLoan);
            expect(result.current.bonuses).toContainEqual(mockBonus);
        });
    });
});
