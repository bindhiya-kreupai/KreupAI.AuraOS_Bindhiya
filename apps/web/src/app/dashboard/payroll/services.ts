/**
 * Payroll Service Layer
 * Production-ready service layer with API integration
 */

import { APIClient } from '@/lib/api-client';
import type {
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
// PAYROLL RUNS SERVICE
// ============================================================================

export class PayrollRunService {
  private static endpoint = '/payroll';

  /**
   * Get all payroll runs
   */
  static async getPayrollRuns(): Promise<PayrollRun[]> {
    try {
      const response = await APIClient.get<unknown>(this.endpoint);
      return APIClient.unwrapList<PayrollRun>(response, 'runs');
    } catch (error: any) {
      return [];
    }
  }

  /**
   * Get single payroll run
   */
  static async getPayrollRun(id: string): Promise<PayrollRun | null> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/${id}`);
      return APIClient.unwrapItem<PayrollRun>(response, 'run');
    } catch (error: any) {
      return null;
    }
  }

  /**
   * Create new payroll run
   */
  static async createPayrollRun(run: Partial<PayrollRun>): Promise<PayrollRun> {
    const response = await APIClient.post<{ run: PayrollRun }>(this.endpoint, run);
    return response.run;
  }

  /**
   * Update payroll run
   */
  static async updatePayrollRun(id: string, updates: Partial<PayrollRun>): Promise<PayrollRun> {
    const response = await APIClient.put<{ run: PayrollRun }>(`${this.endpoint}/${id}`, updates);
    return response.run;
  }

  /**
   * Delete payroll run
   */
  static async deletePayrollRun(id: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${id}`);
  }

  /**
   * Process payroll run (move to next step)
   */
  static async processStep(id: string, step: PayrollRun['currentStep']): Promise<PayrollRun> {
    const response = await APIClient.post<{ run: PayrollRun }>(`${this.endpoint}/${id}/process`, {
      step,
    });
    return response.run;
  }

  /**
   * Approve and disburse payroll
   */
  static async approvePayroll(id: string, approvedBy: string): Promise<PayrollRun> {
    const response = await APIClient.post<{ run: PayrollRun }>(`${this.endpoint}/${id}/approve`, {
      approvedBy,
    });
    return response.run;
  }
}

// ============================================================================
// PAYROLL RUN LIFECYCLE SERVICE (v1 API — real DB-backed pipeline)
// ============================================================================

export interface PayrollRunV1 {
  id: string;
  companyId: string;
  payrollMonth: string;
  payrollYear: number;
  status: string;
  runType?: string;
  currency: string;
  totalEmployees?: number;
  totalGrossSalary?: number | string;
  totalDeductions?: number | string;
  totalNetSalary?: number | string;
  totalEmployerCost?: number | string;
  processedAt?: string | null;
  approvedAt?: string | null;
  paidAt?: string | null;
  createdAt?: string;
  notes?: string | null;
  _count?: { payslips: number };
}

/**
 * Lifecycle service for the real DB-backed payroll run pipeline exposed under
 * `/api/v1/payroll`. Distinct from the legacy `PayrollRunService` which targets
 * the older `/payroll` aggregate route.
 */
export class PayrollRunLifecycleService {
  private static endpoint = '/v1/payroll/runs';

  /** List runs (optionally filtered) — DRAFT → CALCULATED → APPROVED → PAID. */
  static async list(params?: {
    status?: string;
    payrollMonth?: string;
    companyId?: string;
    page?: number;
    limit?: number;
  }): Promise<PayrollRunV1[]> {
    const response = await APIClient.get<unknown>(this.endpoint, params as Record<string, unknown>);
    return APIClient.unwrapList<PayrollRunV1>(response);
  }

  /** Fetch a single run. */
  static async get(id: string): Promise<PayrollRunV1 | null> {
    const response = await APIClient.get<unknown>(`${this.endpoint}/${id}`);
    return APIClient.unwrapItem<PayrollRunV1>(response);
  }

  /** Create a new DRAFT run for a company + month. */
  static async create(input: {
    companyId: string;
    payrollMonth: string;
    payrollYear?: number;
    runType?: string;
    currency?: string;
    notes?: string;
  }): Promise<PayrollRunV1> {
    const response = await APIClient.post<unknown>(this.endpoint, input);
    const run = APIClient.unwrapItem<PayrollRunV1>(response);
    if (!run) throw new Error('Failed to create payroll run');
    return run;
  }

  /** Trigger calculation: DRAFT → CALCULATED. */
  static async calculate(id: string, opts?: { countryCode?: string }): Promise<unknown> {
    return APIClient.post<unknown>(`${this.endpoint}/${id}/calculate`, opts ?? {});
  }

  /** Approve a calculated run: CALCULATED → APPROVED. */
  static async approve(id: string, approverComments?: string): Promise<unknown> {
    return APIClient.post<unknown>(`/v1/payroll/approve/${id}`, { approverComments });
  }

  /** Finalize an approved run: APPROVED → PAID (locks the run). */
  static async finalize(id: string, notes?: string): Promise<unknown> {
    return APIClient.post<unknown>(`${this.endpoint}/${id}/finalize`, { notes });
  }
}

// ============================================================================
// PAYSLIPS SERVICE
// ============================================================================

export class PayslipService {
  private static endpoint = '/payroll/payslips';

  /**
   * Get all payslips (optionally filtered by employee)
   */
  static async getPayslips(employeeId?: string): Promise<Payslip[]> {
    try {
      const url = employeeId ? `${this.endpoint}?employeeId=${employeeId}` : this.endpoint;
      const response = await APIClient.get<unknown>(url);
      return APIClient.unwrapList<Payslip>(response, 'payslips');
    } catch (error: any) {
      return [];
    }
  }

  /**
   * Get single payslip
   */
  static async getPayslip(id: string): Promise<Payslip | null> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/${id}`);
      return APIClient.unwrapItem<Payslip>(response, 'payslip');
    } catch (error: any) {
      return null;
    }
  }

  /**
   * Generate payslips for a payroll run
   */
  static async generatePayslips(payrollRunId: string): Promise<Payslip[]> {
    const response = await APIClient.post<{ payslips: Payslip[] }>(`${this.endpoint}/generate`, {
      payrollRunId,
    });
    return response.payslips;
  }

  /**
   * Download payslip as PDF
   */
  static async downloadPayslip(id: string): Promise<Blob> {
    const response = await APIClient.get<Blob>(`${this.endpoint}/${id}/pdf`);
    return response;
  }
}

// ============================================================================
// EMPLOYEE SALARY SERVICE
// ============================================================================

export class EmployeeSalaryService {
  private static endpoint = '/payroll/employee-salaries';

  /**
   * Get all employee salaries
   */
  static async getEmployeeSalaries(): Promise<EmployeeSalary[]> {
    try {
      const response = await APIClient.get<unknown>(this.endpoint);
      return APIClient.unwrapList<EmployeeSalary>(response, 'salaries');
    } catch (error: any) {
      return [];
    }
  }

  /**
   * Get employee salary
   */
  static async getEmployeeSalary(employeeId: string): Promise<EmployeeSalary | null> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/${employeeId}`);
      return APIClient.unwrapItem<EmployeeSalary>(response, 'salary');
    } catch (error: any) {
      return null;
    }
  }

  /**
   * Update employee salary
   */
  static async updateEmployeeSalary(
    employeeId: string,
    updates: Partial<EmployeeSalary>
  ): Promise<EmployeeSalary> {
    const response = await APIClient.put<{ salary: EmployeeSalary }>(
      `${this.endpoint}/${employeeId}`,
      updates
    );
    return response.salary;
  }
}

// ============================================================================
// TAX DECLARATION SERVICE
// ============================================================================

export class TaxDeclarationService {
  private static endpoint = '/payroll/tax-calculation';

  /**
   * Get tax declarations (optionally filtered by employee)
   */
  static async getTaxDeclarations(employeeId?: string): Promise<TaxDeclaration[]> {
    try {
      const url = employeeId ? `${this.endpoint}?employeeId=${employeeId}` : this.endpoint;
      const response = await APIClient.get<unknown>(url);
      return APIClient.unwrapList<TaxDeclaration>(response, 'declarations');
    } catch (error: any) {
      return [];
    }
  }

  /**
   * Get single tax declaration
   */
  static async getTaxDeclaration(id: string): Promise<TaxDeclaration | null> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/${id}`);
      return APIClient.unwrapItem<TaxDeclaration>(response, 'declaration');
    } catch (error: any) {
      return null;
    }
  }

  /**
   * Create/Update tax declaration
   */
  static async saveDeclaration(declaration: Partial<TaxDeclaration>): Promise<TaxDeclaration> {
    const response = await APIClient.post<{ declaration: TaxDeclaration }>(
      this.endpoint,
      declaration
    );
    return response.declaration;
  }

  /**
   * Upload tax proof document
   */
  static async uploadProof(declarationId: string, categoryId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('categoryId', categoryId);
    const response = await APIClient.post<{ url: string }>(
      `${this.endpoint}/${declarationId}/proofs`,
      formData
    );
    return response.url;
  }
}

// ============================================================================
// REIMBURSEMENT SERVICE
// ============================================================================

export class ReimbursementService {
  private static endpoint = '/payroll/reimbursements';

  /**
   * Get reimbursement claims (optionally filtered by employee)
   */
  static async getClaims(employeeId?: string): Promise<ReimbursementClaim[]> {
    try {
      const url = employeeId ? `${this.endpoint}?employeeId=${employeeId}` : this.endpoint;
      const response = await APIClient.get<unknown>(url);
      return APIClient.unwrapList<ReimbursementClaim>(response, 'claims');
    } catch (error: any) {
      return [];
    }
  }

  /**
   * Create reimbursement claim
   */
  static async createClaim(claim: Partial<ReimbursementClaim>): Promise<ReimbursementClaim> {
    const response = await APIClient.post<{ claim: ReimbursementClaim }>(this.endpoint, claim);
    return response.claim;
  }

  /**
   * Update claim status (approve/reject)
   */
  static async updateClaimStatus(
    id: string,
    status: ReimbursementClaim['status'],
    approver?: string,
    rejectionReason?: string
  ): Promise<ReimbursementClaim> {
    const response = await APIClient.put<{ claim: ReimbursementClaim }>(
      `${this.endpoint}/${id}/status`,
      {
        status,
        approver,
        rejectionReason,
      }
    );
    return response.claim;
  }
}

// ============================================================================
// LOAN SERVICE
// ============================================================================

export class LoanService {
  private static endpoint = '/payroll/loan-recovery';

  /**
   * Get employee loans (optionally filtered by employee)
   */
  static async getLoans(employeeId?: string): Promise<EmployeeLoan[]> {
    try {
      const url = employeeId ? `${this.endpoint}?employeeId=${employeeId}` : this.endpoint;
      const response = await APIClient.get<unknown>(url);
      return APIClient.unwrapList<EmployeeLoan>(response, 'loans');
    } catch (error: any) {
      return [];
    }
  }

  /**
   * Create employee loan
   */
  static async createLoan(loan: Partial<EmployeeLoan>): Promise<EmployeeLoan> {
    const response = await APIClient.post<{ loan: EmployeeLoan }>(this.endpoint, loan);
    return response.loan;
  }

  /**
   * Update loan (approve/reject/disburse)
   */
  static async updateLoan(id: string, updates: Partial<EmployeeLoan>): Promise<EmployeeLoan> {
    const response = await APIClient.put<{ loan: EmployeeLoan }>(`${this.endpoint}/${id}`, updates);
    return response.loan;
  }
}

// ============================================================================
// BONUS SERVICE
// ============================================================================

export class BonusService {
  private static endpoint = '/payroll/bonus';

  /**
   * Get bonuses (optionally filtered by employee)
   */
  static async getBonuses(employeeId?: string): Promise<Bonus[]> {
    try {
      const url = employeeId ? `${this.endpoint}?employeeId=${employeeId}` : this.endpoint;
      const response = await APIClient.get<unknown>(url);
      return APIClient.unwrapList<Bonus>(response, 'bonuses');
    } catch (error: any) {
      return [];
    }
  }

  /**
   * Create bonus
   */
  static async createBonus(bonus: Partial<Bonus>): Promise<Bonus> {
    const response = await APIClient.post<{ bonus: Bonus }>(this.endpoint, bonus);
    return response.bonus;
  }

  /**
   * Update bonus status
   */
  static async updateBonusStatus(
    id: string,
    status: Bonus['status'],
    approvedBy?: string
  ): Promise<Bonus> {
    const response = await APIClient.put<{ bonus: Bonus }>(`${this.endpoint}/${id}/status`, {
      status,
      approvedBy,
    });
    return response.bonus;
  }
}

// ============================================================================
// BANK FILE SERVICE
// ============================================================================

export class BankFileService {
  private static endpoint = '/payroll/bank-file';

  /**
   * Generate bank file for payroll disbursement
   */
  static async generateBankFile(
    payrollRunId: string,
    fileType: BankFile['fileType']
  ): Promise<BankFile> {
    const response = await APIClient.post<{ bankFile: BankFile }>(`${this.endpoint}/generate`, {
      payrollRunId,
      fileType,
    });
    return response.bankFile;
  }

  /**
   * Download bank file
   */
  static async downloadBankFile(id: string): Promise<Blob> {
    const response = await APIClient.get<Blob>(`${this.endpoint}/${id}/download`);
    return response;
  }
}

// ============================================================================
// STATUTORY REPORTS SERVICE
// ============================================================================

export class StatutoryReportService {
  private static endpoint = '/payroll/statutory-deductions';

  /**
   * Get statutory reports
   */
  static async getReports(): Promise<StatutoryReport[]> {
    try {
      const response = await APIClient.get<unknown>(this.endpoint);
      return APIClient.unwrapList<StatutoryReport>(response, 'reports');
    } catch (error: any) {
      return [];
    }
  }

  /**
   * Generate statutory report
   */
  static async generateReport(
    reportType: StatutoryReport['reportType'],
    month: string,
    year: number
  ): Promise<StatutoryReport> {
    const response = await APIClient.post<{ report: StatutoryReport }>(
      `${this.endpoint}/generate`,
      {
        reportType,
        month,
        year,
      }
    );
    return response.report;
  }
}

// ============================================================================
// SETTINGS SERVICE
// ============================================================================

export class PayrollSettingsService {
  private static endpoint = '/payroll/settings';

  /**
   * Get payroll settings
   */
  static async getSettings(): Promise<PayrollSettings | null> {
    try {
      const response = await APIClient.get<unknown>(this.endpoint);
      return APIClient.unwrapItem<PayrollSettings>(response, 'settings');
    } catch (error: any) {
      return null;
    }
  }

  /**
   * Update payroll settings
   */
  static async updateSettings(settings: Partial<PayrollSettings>): Promise<PayrollSettings> {
    const response = await APIClient.put<{ settings: PayrollSettings }>(this.endpoint, settings);
    return response.settings;
  }
}

// ============================================================================
// ANALYTICS SERVICE
// ============================================================================

export class PayrollAnalyticsService {
  private static endpoint = '/payroll/reports';

  /**
   * Get payroll statistics
   */
  static async getStats(): Promise<PayrollStats> {
    try {
      const response = await APIClient.get<{ stats?: PayrollStats }>(`${this.endpoint}/stats`);
      if (response.stats) {
        return response.stats;
      }
      // Return default stats if none available
      return {
        totalEmployees: 0,
        activePayrolls: 0,
        monthlyPayrollCost: 0,
        averageSalary: 0,
        highestSalary: 0,
        lowestSalary: 0,
        totalReimbursements: 0,
        totalLoans: 0,
        totalBonuses: 0,
        payrollTrend: [],
        departmentCosts: [],
        pendingStatutoryReturns: 0,
        overdueReturns: 0,
      };
    } catch (error: any) {
      return {
        totalEmployees: 0,
        activePayrolls: 0,
        monthlyPayrollCost: 0,
        averageSalary: 0,
        highestSalary: 0,
        lowestSalary: 0,
        totalReimbursements: 0,
        totalLoans: 0,
        totalBonuses: 0,
        payrollTrend: [],
        departmentCosts: [],
        pendingStatutoryReturns: 0,
        overdueReturns: 0,
      };
    }
  }
}
