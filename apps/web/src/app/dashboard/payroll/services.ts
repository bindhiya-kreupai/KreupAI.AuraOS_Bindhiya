/**
 * Payroll Service Layer
 * Production-ready service layer with localStorage persistence and API-ready structure
 */

import {
    PayrollRun,
    Payslip,
    EmployeeSalary,
    TaxDeclaration,
    ReimbursementClaim,
    EmployeeLoan,
    Bonus,
    BankFile,
    StatutoryReport,
    PayrollSettings,
    PayrollStats,
} from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

const API_BASE = '/api/payroll'; // TODO: Replace with actual API endpoint
const STORAGE_KEYS = {
    PAYROLL_RUNS: 'payroll_runs',
    PAYSLIPS: 'payslips',
    EMPLOYEE_SALARIES: 'employee_salaries',
    TAX_DECLARATIONS: 'tax_declarations',
    REIMBURSEMENTS: 'reimbursement_claims',
    LOANS: 'employee_loans',
    BONUSES: 'bonuses',
    BANK_FILES: 'bank_files',
    STATUTORY_REPORTS: 'statutory_reports',
    SETTINGS: 'payroll_settings',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// STORAGE SERVICE
// ============================================================================

class StorageService {
    static save<T>(key: string, data: T): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(key, JSON.stringify(data));
    }

    static load<T>(key: string): T | null {
        if (typeof window === 'undefined') return null;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    static remove(key: string): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(key);
    }
}

// ============================================================================
// PAYROLL RUNS SERVICE
// ============================================================================

export class PayrollRunService {
    /**
     * Get all payroll runs
     */
    static async getPayrollRuns(): Promise<PayrollRun[]> {
        await delay(300);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/runs`);
        // return response.json();

        const stored = StorageService.load<PayrollRun[]>(STORAGE_KEYS.PAYROLL_RUNS);
        return stored || [];
    }

    /**
     * Get single payroll run
     */
    static async getPayrollRun(id: string): Promise<PayrollRun | null> {
        await delay(200);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/runs/${id}`);
        // return response.json();

        const runs = await this.getPayrollRuns();
        return runs.find(run => run.id === id) || null;
    }

    /**
     * Create new payroll run
     */
    static async createPayrollRun(run: PayrollRun): Promise<PayrollRun> {
        await delay(300);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/runs`, {
        //     method: 'POST',
        //     body: JSON.stringify(run),
        // });
        // return response.json();

        const runs = await this.getPayrollRuns();
        runs.unshift(run);
        StorageService.save(STORAGE_KEYS.PAYROLL_RUNS, runs);
        return run;
    }

    /**
     * Update payroll run
     */
    static async updatePayrollRun(id: string, updates: Partial<PayrollRun>): Promise<PayrollRun> {
        await delay(300);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/runs/${id}`, {
        //     method: 'PUT',
        //     body: JSON.stringify(updates),
        // });
        // return response.json();

        const runs = await this.getPayrollRuns();
        const index = runs.findIndex(run => run.id === id);
        if (index === -1) throw new Error('Payroll run not found');

        runs[index] = { ...runs[index], ...updates, updatedAt: new Date().toISOString() };
        StorageService.save(STORAGE_KEYS.PAYROLL_RUNS, runs);
        return runs[index];
    }

    /**
     * Delete payroll run
     */
    static async deletePayrollRun(id: string): Promise<void> {
        await delay(200);
        // TODO: Replace with real API call
        // await fetch(`${API_BASE}/runs/${id}`, { method: 'DELETE' });

        const runs = await this.getPayrollRuns();
        const filtered = runs.filter(run => run.id !== id);
        StorageService.save(STORAGE_KEYS.PAYROLL_RUNS, filtered);
    }

    /**
     * Process payroll run (move to next step)
     */
    static async processStep(id: string, step: PayrollRun['currentStep']): Promise<PayrollRun> {
        await delay(500);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/runs/${id}/process`, {
        //     method: 'POST',
        //     body: JSON.stringify({ step }),
        // });
        // return response.json();

        return this.updatePayrollRun(id, { currentStep: step });
    }

    /**
     * Approve and disburse payroll
     */
    static async approvePayroll(id: string, approvedBy: string): Promise<PayrollRun> {
        await delay(500);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/runs/${id}/approve`, {
        //     method: 'POST',
        //     body: JSON.stringify({ approvedBy }),
        // });
        // return response.json();

        return this.updatePayrollRun(id, {
            status: 'approved',
            approvedBy,
            approvedAt: new Date().toISOString(),
        });
    }
}

// ============================================================================
// PAYSLIPS SERVICE
// ============================================================================

export class PayslipService {
    /**
     * Get all payslips (optionally filtered by employee)
     */
    static async getPayslips(employeeId?: string): Promise<Payslip[]> {
        await delay(300);
        // TODO: Replace with real API call
        // const url = employeeId ? `${API_BASE}/payslips?employeeId=${employeeId}` : `${API_BASE}/payslips`;
        // const response = await fetch(url);
        // return response.json();

        const stored = StorageService.load<Payslip[]>(STORAGE_KEYS.PAYSLIPS) || [];
        return employeeId ? stored.filter(p => p.employeeId === employeeId) : stored;
    }

    /**
     * Get single payslip
     */
    static async getPayslip(id: string): Promise<Payslip | null> {
        await delay(200);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/payslips/${id}`);
        // return response.json();

        const payslips = await this.getPayslips();
        return payslips.find(p => p.id === id) || null;
    }

    /**
     * Generate payslips for a payroll run
     */
    static async generatePayslips(payrollRunId: string): Promise<Payslip[]> {
        await delay(1000);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/payslips/generate`, {
        //     method: 'POST',
        //     body: JSON.stringify({ payrollRunId }),
        // });
        // return response.json();

        // For now, return empty array (would be generated based on employee salaries)
        return [];
    }

    /**
     * Download payslip as PDF
     */
    static async downloadPayslip(id: string): Promise<Blob> {
        await delay(500);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/payslips/${id}/pdf`);
        // return response.blob();

        // Mock PDF blob
        return new Blob(['Mock PDF content'], { type: 'application/pdf' });
    }
}

// ============================================================================
// EMPLOYEE SALARY SERVICE
// ============================================================================

export class EmployeeSalaryService {
    /**
     * Get all employee salaries
     */
    static async getEmployeeSalaries(): Promise<EmployeeSalary[]> {
        await delay(300);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/salaries`);
        // return response.json();

        const stored = StorageService.load<EmployeeSalary[]>(STORAGE_KEYS.EMPLOYEE_SALARIES);
        return stored || [];
    }

    /**
     * Get employee salary
     */
    static async getEmployeeSalary(employeeId: string): Promise<EmployeeSalary | null> {
        await delay(200);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/salaries/${employeeId}`);
        // return response.json();

        const salaries = await this.getEmployeeSalaries();
        return salaries.find(s => s.employeeId === employeeId) || null;
    }

    /**
     * Update employee salary
     */
    static async updateEmployeeSalary(employeeId: string, updates: Partial<EmployeeSalary>): Promise<EmployeeSalary> {
        await delay(300);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/salaries/${employeeId}`, {
        //     method: 'PUT',
        //     body: JSON.stringify(updates),
        // });
        // return response.json();

        const salaries = await this.getEmployeeSalaries();
        const index = salaries.findIndex(s => s.employeeId === employeeId);
        if (index === -1) throw new Error('Employee salary not found');

        salaries[index] = { ...salaries[index], ...updates, updatedAt: new Date().toISOString() };
        StorageService.save(STORAGE_KEYS.EMPLOYEE_SALARIES, salaries);
        return salaries[index];
    }
}

// ============================================================================
// TAX DECLARATION SERVICE
// ============================================================================

export class TaxDeclarationService {
    /**
     * Get tax declarations (optionally filtered by employee)
     */
    static async getTaxDeclarations(employeeId?: string): Promise<TaxDeclaration[]> {
        await delay(300);
        // TODO: Replace with real API call
        // const url = employeeId ? `${API_BASE}/tax-declarations?employeeId=${employeeId}` : `${API_BASE}/tax-declarations`;
        // const response = await fetch(url);
        // return response.json();

        const stored = StorageService.load<TaxDeclaration[]>(STORAGE_KEYS.TAX_DECLARATIONS) || [];
        return employeeId ? stored.filter(d => d.employeeId === employeeId) : stored;
    }

    /**
     * Get single tax declaration
     */
    static async getTaxDeclaration(id: string): Promise<TaxDeclaration | null> {
        await delay(200);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/tax-declarations/${id}`);
        // return response.json();

        const declarations = await this.getTaxDeclarations();
        return declarations.find(d => d.id === id) || null;
    }

    /**
     * Create/Update tax declaration
     */
    static async saveDeclaration(declaration: TaxDeclaration): Promise<TaxDeclaration> {
        await delay(300);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/tax-declarations`, {
        //     method: 'POST',
        //     body: JSON.stringify(declaration),
        // });
        // return response.json();

        const declarations = await this.getTaxDeclarations();
        const index = declarations.findIndex(d => d.id === declaration.id);

        if (index >= 0) {
            declarations[index] = { ...declaration, updatedAt: new Date().toISOString() };
        } else {
            declarations.unshift(declaration);
        }

        StorageService.save(STORAGE_KEYS.TAX_DECLARATIONS, declarations);
        return declaration;
    }

    /**
     * Upload tax proof document
     */
    static async uploadProof(declarationId: string, categoryId: string, file: File): Promise<string> {
        await delay(500);
        // TODO: Replace with real API call
        // const formData = new FormData();
        // formData.append('file', file);
        // const response = await fetch(`${API_BASE}/tax-declarations/${declarationId}/proofs`, {
        //     method: 'POST',
        //     body: formData,
        // });
        // const data = await response.json();
        // return data.url;

        // Mock file URL
        return `https://storage.example.com/tax-proofs/${declarationId}/${file.name}`;
    }
}

// ============================================================================
// REIMBURSEMENT SERVICE
// ============================================================================

export class ReimbursementService {
    /**
     * Get reimbursement claims (optionally filtered by employee)
     */
    static async getClaims(employeeId?: string): Promise<ReimbursementClaim[]> {
        await delay(300);
        // TODO: Replace with real API call
        // const url = employeeId ? `${API_BASE}/reimbursements?employeeId=${employeeId}` : `${API_BASE}/reimbursements`;
        // const response = await fetch(url);
        // return response.json();

        const stored = StorageService.load<ReimbursementClaim[]>(STORAGE_KEYS.REIMBURSEMENTS) || [];
        return employeeId ? stored.filter(c => c.employeeId === employeeId) : stored;
    }

    /**
     * Create reimbursement claim
     */
    static async createClaim(claim: ReimbursementClaim): Promise<ReimbursementClaim> {
        await delay(300);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/reimbursements`, {
        //     method: 'POST',
        //     body: JSON.stringify(claim),
        // });
        // return response.json();

        const claims = await this.getClaims();
        claims.unshift(claim);
        StorageService.save(STORAGE_KEYS.REIMBURSEMENTS, claims);
        return claim;
    }

    /**
     * Update claim status (approve/reject)
     */
    static async updateClaimStatus(id: string, status: ReimbursementClaim['status'], approver?: string, rejectionReason?: string): Promise<ReimbursementClaim> {
        await delay(300);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/reimbursements/${id}/status`, {
        //     method: 'PUT',
        //     body: JSON.stringify({ status, approver, rejectionReason }),
        // });
        // return response.json();

        const claims = await this.getClaims();
        const index = claims.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Claim not found');

        claims[index] = {
            ...claims[index],
            status,
            approver,
            rejectionReason,
            approvedAt: status === 'approved' ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString(),
        };

        StorageService.save(STORAGE_KEYS.REIMBURSEMENTS, claims);
        return claims[index];
    }
}

// ============================================================================
// LOAN SERVICE
// ============================================================================

export class LoanService {
    /**
     * Get employee loans (optionally filtered by employee)
     */
    static async getLoans(employeeId?: string): Promise<EmployeeLoan[]> {
        await delay(300);
        // TODO: Replace with real API call
        // const url = employeeId ? `${API_BASE}/loans?employeeId=${employeeId}` : `${API_BASE}/loans`;
        // const response = await fetch(url);
        // return response.json();

        const stored = StorageService.load<EmployeeLoan[]>(STORAGE_KEYS.LOANS) || [];
        return employeeId ? stored.filter(l => l.employeeId === employeeId) : stored;
    }

    /**
     * Create employee loan
     */
    static async createLoan(loan: EmployeeLoan): Promise<EmployeeLoan> {
        await delay(300);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/loans`, {
        //     method: 'POST',
        //     body: JSON.stringify(loan),
        // });
        // return response.json();

        const loans = await this.getLoans();
        loans.unshift(loan);
        StorageService.save(STORAGE_KEYS.LOANS, loans);
        return loan;
    }

    /**
     * Update loan (approve/reject/disburse)
     */
    static async updateLoan(id: string, updates: Partial<EmployeeLoan>): Promise<EmployeeLoan> {
        await delay(300);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/loans/${id}`, {
        //     method: 'PUT',
        //     body: JSON.stringify(updates),
        // });
        // return response.json();

        const loans = await this.getLoans();
        const index = loans.findIndex(l => l.id === id);
        if (index === -1) throw new Error('Loan not found');

        loans[index] = { ...loans[index], ...updates, updatedAt: new Date().toISOString() };
        StorageService.save(STORAGE_KEYS.LOANS, loans);
        return loans[index];
    }
}

// ============================================================================
// BONUS SERVICE
// ============================================================================

export class BonusService {
    /**
     * Get bonuses (optionally filtered by employee)
     */
    static async getBonuses(employeeId?: string): Promise<Bonus[]> {
        await delay(300);
        // TODO: Replace with real API call
        // const url = employeeId ? `${API_BASE}/bonuses?employeeId=${employeeId}` : `${API_BASE}/bonuses`;
        // const response = await fetch(url);
        // return response.json();

        const stored = StorageService.load<Bonus[]>(STORAGE_KEYS.BONUSES) || [];
        return employeeId ? stored.filter(b => b.employeeId === employeeId) : stored;
    }

    /**
     * Create bonus
     */
    static async createBonus(bonus: Bonus): Promise<Bonus> {
        await delay(300);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/bonuses`, {
        //     method: 'POST',
        //     body: JSON.stringify(bonus),
        // });
        // return response.json();

        const bonuses = await this.getBonuses();
        bonuses.unshift(bonus);
        StorageService.save(STORAGE_KEYS.BONUSES, bonuses);
        return bonus;
    }

    /**
     * Update bonus status
     */
    static async updateBonusStatus(id: string, status: Bonus['status'], approvedBy?: string): Promise<Bonus> {
        await delay(300);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/bonuses/${id}/status`, {
        //     method: 'PUT',
        //     body: JSON.stringify({ status, approvedBy }),
        // });
        // return response.json();

        const bonuses = await this.getBonuses();
        const index = bonuses.findIndex(b => b.id === id);
        if (index === -1) throw new Error('Bonus not found');

        bonuses[index] = {
            ...bonuses[index],
            status,
            approvedBy,
            approvedAt: status === 'approved' ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString(),
        };

        StorageService.save(STORAGE_KEYS.BONUSES, bonuses);
        return bonuses[index];
    }
}

// ============================================================================
// BANK FILE SERVICE
// ============================================================================

export class BankFileService {
    /**
     * Generate bank file for payroll disbursement
     */
    static async generateBankFile(payrollRunId: string, fileType: BankFile['fileType']): Promise<BankFile> {
        await delay(1000);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/bank-files/generate`, {
        //     method: 'POST',
        //     body: JSON.stringify({ payrollRunId, fileType }),
        // });
        // return response.json();

        const bankFile: BankFile = {
            id: `bf_${Date.now()}`,
            payrollRunId,
            fileName: `payroll_${payrollRunId}_${fileType}.txt`,
            fileType,
            totalAmount: 0, // Would be calculated
            totalTransactions: 0,
            generatedAt: new Date().toISOString(),
            generatedBy: 'System',
            uploadedToBank: false,
        };

        return bankFile;
    }

    /**
     * Download bank file
     */
    static async downloadBankFile(id: string): Promise<Blob> {
        await delay(500);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/bank-files/${id}/download`);
        // return response.blob();

        // Mock file blob
        return new Blob(['Mock bank file content'], { type: 'text/plain' });
    }
}

// ============================================================================
// STATUTORY REPORTS SERVICE
// ============================================================================

export class StatutoryReportService {
    /**
     * Get statutory reports
     */
    static async getReports(): Promise<StatutoryReport[]> {
        await delay(300);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/statutory-reports`);
        // return response.json();

        const stored = StorageService.load<StatutoryReport[]>(STORAGE_KEYS.STATUTORY_REPORTS);
        return stored || [];
    }

    /**
     * Generate statutory report
     */
    static async generateReport(reportType: StatutoryReport['reportType'], month: string, year: number): Promise<StatutoryReport> {
        await delay(1000);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/statutory-reports/generate`, {
        //     method: 'POST',
        //     body: JSON.stringify({ reportType, month, year }),
        // });
        // return response.json();

        const report: StatutoryReport = {
            id: `sr_${Date.now()}`,
            reportType,
            month,
            year,
            totalEmployees: 0,
            totalAmount: 0,
            dueDate: new Date().toISOString(),
            status: 'pending',
        };

        return report;
    }
}

// ============================================================================
// SETTINGS SERVICE
// ============================================================================

export class PayrollSettingsService {
    /**
     * Get payroll settings
     */
    static async getSettings(): Promise<PayrollSettings | null> {
        await delay(200);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/settings`);
        // return response.json();

        return StorageService.load<PayrollSettings>(STORAGE_KEYS.SETTINGS);
    }

    /**
     * Update payroll settings
     */
    static async updateSettings(settings: PayrollSettings): Promise<PayrollSettings> {
        await delay(300);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/settings`, {
        //     method: 'PUT',
        //     body: JSON.stringify(settings),
        // });
        // return response.json();

        StorageService.save(STORAGE_KEYS.SETTINGS, settings);
        return settings;
    }
}

// ============================================================================
// ANALYTICS SERVICE
// ============================================================================

export class PayrollAnalyticsService {
    /**
     * Get payroll statistics
     */
    static async getStats(): Promise<PayrollStats> {
        await delay(500);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/analytics/stats`);
        // return response.json();

        // Mock stats calculation
        const salaries = await EmployeeSalaryService.getEmployeeSalaries();
        const reimbursements = await ReimbursementService.getClaims();
        const loans = await LoanService.getLoans();
        const bonuses = await BonusService.getBonuses();

        const stats: PayrollStats = {
            totalEmployees: salaries.length,
            activePayrolls: 1,
            monthlyPayrollCost: salaries.reduce((sum, s) => sum + s.monthlyCTC, 0),
            averageSalary: salaries.length > 0 ? salaries.reduce((sum, s) => sum + s.monthlyCTC, 0) / salaries.length : 0,
            highestSalary: Math.max(...salaries.map(s => s.monthlyCTC), 0),
            lowestSalary: Math.min(...salaries.map(s => s.monthlyCTC), 0),
            totalReimbursements: reimbursements.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.amount, 0),
            totalLoans: loans.filter(l => l.status === 'active').reduce((sum, l) => sum + l.remainingBalance, 0),
            totalBonuses: bonuses.filter(b => b.status === 'approved').reduce((sum, b) => sum + b.amount, 0),
            payrollTrend: [],
            departmentCosts: [],
            pendingStatutoryReturns: 0,
            overdueReturns: 0,
        };

        return stats;
    }
}
