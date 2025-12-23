/**
 * Payroll Service
 * Handles payslips and salary information
 */

import { apiService } from './api.service';
import { Payslip } from '@/types';

interface PayrollSummary {
  currentMonth: {
    grossPay: number;
    netPay: number;
    deductions: number;
    status: 'pending' | 'processed' | 'paid';
  };
  ytd: {
    grossPay: number;
    netPay: number;
    deductions: number;
    tax: number;
  };
  currency: string;
}

class PayrollService {
  /**
   * Get payroll summary
   */
  async getSummary(): Promise<PayrollSummary> {
    return apiService.get('/payroll/summary');
  }

  /**
   * Get payslips list
   */
  async getPayslips(params?: {
    year?: number;
    page?: number;
    limit?: number;
  }): Promise<{
    data: Payslip[];
    total: number;
    page: number;
    pages: number;
  }> {
    return apiService.get('/payroll/payslips', params);
  }

  /**
   * Get payslip by ID
   */
  async getPayslip(payslipId: string): Promise<Payslip> {
    return apiService.get(`/payroll/payslips/${payslipId}`);
  }

  /**
   * Download payslip PDF
   */
  async downloadPayslip(payslipId: string): Promise<{ url: string }> {
    return apiService.get(`/payroll/payslips/${payslipId}/download`);
  }

  /**
   * Get tax summary (for tax filing)
   */
  async getTaxSummary(year: number): Promise<{
    year: number;
    grossIncome: number;
    taxableIncome: number;
    taxPaid: number;
    exemptions: number;
    deductions: {
      code: string;
      name: string;
      amount: number;
    }[];
    form16Available: boolean;
  }> {
    return apiService.get('/payroll/tax-summary', { year });
  }

  /**
   * Download Form 16 (India)
   */
  async downloadForm16(year: number): Promise<{ url: string }> {
    return apiService.get('/payroll/form16/download', { year });
  }

  /**
   * Get salary structure
   */
  async getSalaryStructure(): Promise<{
    effective_date: string;
    components: {
      code: string;
      name: string;
      type: 'earning' | 'deduction';
      amount: number;
      percentage?: number;
      frequency: 'monthly' | 'annual';
    }[];
    ctc: number;
    grossMonthly: number;
    netMonthly: number;
  }> {
    return apiService.get('/payroll/salary-structure');
  }

  /**
   * Get loan/advance details
   */
  async getLoans(): Promise<{
    loans: {
      id: string;
      type: 'salary_advance' | 'personal_loan' | 'emergency_loan';
      amount: number;
      outstanding: number;
      emi: number;
      startDate: string;
      endDate: string;
      status: 'active' | 'completed' | 'defaulted';
    }[];
  }> {
    return apiService.get('/payroll/loans');
  }

  /**
   * Request salary advance
   */
  async requestAdvance(data: {
    amount: number;
    reason: string;
    repaymentMonths: number;
  }): Promise<{
    success: boolean;
    message: string;
    requestId: string;
  }> {
    return apiService.post('/payroll/advance-request', data);
  }

  /**
   * Get reimbursements
   */
  async getReimbursements(params?: {
    status?: 'pending' | 'approved' | 'rejected' | 'paid';
    year?: number;
  }): Promise<{
    data: {
      id: string;
      type: string;
      amount: number;
      date: string;
      status: string;
      description: string;
    }[];
    total: number;
  }> {
    return apiService.get('/payroll/reimbursements', params);
  }

  /**
   * Submit reimbursement claim
   */
  async submitReimbursement(data: {
    type: string;
    amount: number;
    description: string;
    date: string;
    attachments: string[];
  }): Promise<{
    success: boolean;
    message: string;
    claimId: string;
  }> {
    return apiService.post('/payroll/reimbursements', data);
  }
}

export const payrollService = new PayrollService();
