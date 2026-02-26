/**
 * Payroll Run Test Data Factory
 *
 * @module @aura/testing
 */

import { randomUUID } from 'crypto';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TestPayrollRun {
  id: string;
  month: number;
  year: number;
  status: 'draft' | 'calculating' | 'review' | 'approved' | 'processed' | 'completed' | 'cancelled';
  employeeCount: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  currency: string;
  initiatedBy: string;
  approvedBy: string | null;
  approvedAt: Date | null;
  processedAt: Date | null;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestPayslip {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  month: number;
  year: number;
  basicSalary: number;
  allowances: number;
  overtime: number;
  grossSalary: number;
  incomeTax: number;
  socialInsurance: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
  currency: string;
  pdfUrl: string | null;
  tenantId: string;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Create a test payroll run.
 */
export function createPayrollRun(overrides: Partial<TestPayrollRun> = {}): TestPayrollRun {
  const employeeCount = overrides.employeeCount ?? 50;
  const totalGross = overrides.totalGross ?? employeeCount * 10000;
  const totalDeductions = overrides.totalDeductions ?? Math.round(totalGross * 0.12);
  const totalNet = overrides.totalNet ?? totalGross - totalDeductions;

  return {
    id: overrides.id ?? randomUUID(),
    month: overrides.month ?? 1,
    year: overrides.year ?? 2025,
    status: overrides.status ?? 'draft',
    employeeCount,
    totalGross,
    totalDeductions,
    totalNet,
    currency: overrides.currency ?? 'AED',
    initiatedBy: overrides.initiatedBy ?? 'hr-user-001',
    approvedBy: overrides.approvedBy ?? null,
    approvedAt: overrides.approvedAt ?? null,
    processedAt: overrides.processedAt ?? null,
    tenantId: overrides.tenantId ?? 'tenant-test-001',
    createdAt: overrides.createdAt ?? new Date('2025-01-25'),
    updatedAt: overrides.updatedAt ?? new Date('2025-01-25'),
  };
}

/**
 * Create a completed payroll run.
 */
export function createCompletedPayrollRun(
  overrides: Partial<TestPayrollRun> = {}
): TestPayrollRun {
  return createPayrollRun({
    status: 'completed',
    approvedBy: 'cfo-user-001',
    approvedAt: new Date('2025-01-28'),
    processedAt: new Date('2025-01-30'),
    ...overrides,
  });
}

/**
 * Create a test payslip.
 */
export function createPayslip(overrides: Partial<TestPayslip> = {}): TestPayslip {
  const basicSalary = overrides.basicSalary ?? 8000;
  const allowances  = overrides.allowances  ?? 2000;
  const overtime    = overrides.overtime    ?? 500;
  const grossSalary = overrides.grossSalary ?? basicSalary + allowances + overtime;
  const incomeTax   = overrides.incomeTax   ?? 0; // UAE — no income tax
  const socialInsurance = overrides.socialInsurance ?? Math.round(basicSalary * 0.05);
  const otherDeductions = overrides.otherDeductions ?? 200;
  const totalDeductions = overrides.totalDeductions ?? incomeTax + socialInsurance + otherDeductions;
  const netSalary = overrides.netSalary ?? grossSalary - totalDeductions;

  return {
    id: overrides.id ?? randomUUID(),
    payrollRunId: overrides.payrollRunId ?? randomUUID(),
    employeeId: overrides.employeeId ?? 'emp-test-001',
    employeeNumber: overrides.employeeNumber ?? 'EMP000001',
    employeeName: overrides.employeeName ?? 'Alice Smith',
    month: overrides.month ?? 1,
    year: overrides.year ?? 2025,
    basicSalary,
    allowances,
    overtime,
    grossSalary,
    incomeTax,
    socialInsurance,
    otherDeductions,
    totalDeductions,
    netSalary,
    currency: overrides.currency ?? 'AED',
    pdfUrl: overrides.pdfUrl ?? null,
    tenantId: overrides.tenantId ?? 'tenant-test-001',
  };
}

/**
 * Create multiple payslips for a payroll run.
 */
export function createPayslips(
  payrollRun: TestPayrollRun,
  count: number
): TestPayslip[] {
  return Array.from({ length: count }, (_, i) =>
    createPayslip({
      payrollRunId: payrollRun.id,
      employeeId: `emp-test-${String(i + 1).padStart(3, '0')}`,
      employeeNumber: `EMP${String(i + 1).padStart(6, '0')}`,
      month: payrollRun.month,
      year: payrollRun.year,
      tenantId: payrollRun.tenantId,
    })
  );
}
