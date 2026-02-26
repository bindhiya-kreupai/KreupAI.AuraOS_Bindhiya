/**
 * Integration Tests — End-to-End Payroll Flow
 *
 * Validates the complete payroll lifecycle:
 *   1. Create payroll run
 *   2. Add employees to run
 *   3. Calculate payroll (gross, deductions, net)
 *   4. Verify payslip generation
 *   5. Finalize run
 *   6. Verify status transitions
 *
 * Uses in-memory repositories (no Prisma / DB required) to keep tests fast
 * and environment-independent.
 *
 * @module tests/integration
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

type PayrollRunStatus =
  | 'DRAFT'
  | 'IN_PROGRESS'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'PAID'
  | 'REVERSED';

interface PayrollRun {
  id: string;
  tenantId: string;
  period: string;            // YYYY-MM
  payFrequency: 'MONTHLY' | 'BI_WEEKLY' | 'WEEKLY';
  currency: string;
  status: PayrollRunStatus;
  createdBy: string;
  createdAt: Date;
  finalizedAt?: Date;
  paidAt?: Date;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  employeeCount: number;
}

interface PayrollEntry {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employeeNumber: string;
  fullName: string;
  basicSalary: number;
  allowances: number;
  grossSalary: number;
  taxDeduction: number;
  epfDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  netPay: number;
  currency: string;
  payslipGenerated: boolean;
  payslipUrl?: string;
}

// ---------------------------------------------------------------------------
// In-memory repositories
// ---------------------------------------------------------------------------

class PayrollRunRepository {
  private runs: Map<string, PayrollRun> = new Map();

  async create(run: PayrollRun): Promise<PayrollRun> {
    this.runs.set(run.id, { ...run });
    return this.runs.get(run.id)!;
  }

  async findById(id: string): Promise<PayrollRun | null> {
    return this.runs.get(id) ?? null;
  }

  async update(id: string, updates: Partial<PayrollRun>): Promise<PayrollRun> {
    const existing = this.runs.get(id);
    if (!existing) throw new Error(`PayrollRun ${id} not found`);
    const updated = { ...existing, ...updates };
    this.runs.set(id, updated);
    return updated;
  }

  async findByPeriod(tenantId: string, period: string): Promise<PayrollRun[]> {
    return Array.from(this.runs.values()).filter(
      (r) => r.tenantId === tenantId && r.period === period
    );
  }

  clear(): void { this.runs.clear(); }
}

class PayrollEntryRepository {
  private entries: Map<string, PayrollEntry> = new Map();

  async create(entry: PayrollEntry): Promise<PayrollEntry> {
    this.entries.set(entry.id, { ...entry });
    return this.entries.get(entry.id)!;
  }

  async findByRunId(runId: string): Promise<PayrollEntry[]> {
    return Array.from(this.entries.values()).filter((e) => e.payrollRunId === runId);
  }

  async update(id: string, updates: Partial<PayrollEntry>): Promise<PayrollEntry> {
    const existing = this.entries.get(id);
    if (!existing) throw new Error(`PayrollEntry ${id} not found`);
    const updated = { ...existing, ...updates };
    this.entries.set(id, updated);
    return updated;
  }

  clear(): void { this.entries.clear(); }
}

// ---------------------------------------------------------------------------
// Payroll service (simplified, in-process)
// ---------------------------------------------------------------------------

let idCounter = 0;
function nextId(prefix: string): string {
  return `${prefix}-${++idCounter}`;
}

class PayrollService {
  constructor(
    private readonly runRepo: PayrollRunRepository,
    private readonly entryRepo: PayrollEntryRepository
  ) {}

  async createRun(params: {
    tenantId: string;
    period: string;
    payFrequency: 'MONTHLY' | 'BI_WEEKLY' | 'WEEKLY';
    currency: string;
    createdBy: string;
  }): Promise<PayrollRun> {
    const run: PayrollRun = {
      id: nextId('run'),
      ...params,
      status: 'DRAFT',
      createdAt: new Date(),
      totalGross: 0,
      totalDeductions: 0,
      totalNet: 0,
      employeeCount: 0,
    };
    return this.runRepo.create(run);
  }

  async addEmployee(
    runId: string,
    employee: {
      employeeId: string;
      employeeNumber: string;
      fullName: string;
      basicSalary: number;
      allowances: number;
      currency: string;
    }
  ): Promise<PayrollEntry> {
    const run = await this.runRepo.findById(runId);
    if (!run) throw new Error(`Run ${runId} not found`);
    if (run.status !== 'DRAFT' && run.status !== 'IN_PROGRESS') {
      throw new Error('Can only add employees to DRAFT or IN_PROGRESS runs');
    }

    const grossSalary = employee.basicSalary + employee.allowances;

    const entry: PayrollEntry = {
      id: nextId('entry'),
      payrollRunId: runId,
      ...employee,
      grossSalary,
      taxDeduction: 0,
      epfDeduction: 0,
      otherDeductions: 0,
      totalDeductions: 0,
      netPay: grossSalary,
      payslipGenerated: false,
    };

    const created = await this.entryRepo.create(entry);

    // Update run employee count
    await this.runRepo.update(runId, {
      status: 'IN_PROGRESS',
      employeeCount: run.employeeCount + 1,
    });

    return created;
  }

  async calculatePayroll(runId: string): Promise<{ run: PayrollRun; entries: PayrollEntry[] }> {
    const run = await this.runRepo.findById(runId);
    if (!run) throw new Error(`Run ${runId} not found`);
    if (run.status !== 'IN_PROGRESS') {
      throw new Error('Can only calculate IN_PROGRESS runs');
    }

    const entries = await this.entryRepo.findByRunId(runId);

    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;

    const updatedEntries: PayrollEntry[] = [];

    for (const entry of entries) {
      // Simplified India-style deductions for test
      const epfDeduction = Math.min(entry.basicSalary * 0.12, 1_800); // 12% EPF
      const taxDeduction = calculateSimpleTax(entry.grossSalary * 12) / 12;
      const totalDeductionsEntry = epfDeduction + taxDeduction;
      const netPay = entry.grossSalary - totalDeductionsEntry;

      const updated = await this.entryRepo.update(entry.id, {
        epfDeduction,
        taxDeduction,
        totalDeductions: totalDeductionsEntry,
        netPay,
      });

      updatedEntries.push(updated);
      totalGross += updated.grossSalary;
      totalDeductions += totalDeductionsEntry;
      totalNet += netPay;
    }

    const updatedRun = await this.runRepo.update(runId, {
      status: 'PENDING_REVIEW',
      totalGross,
      totalDeductions,
      totalNet,
    });

    return { run: updatedRun, entries: updatedEntries };
  }

  async generatePayslips(runId: string): Promise<PayrollEntry[]> {
    const entries = await this.entryRepo.findByRunId(runId);
    const updated: PayrollEntry[] = [];

    for (const entry of entries) {
      const payslipUrl = `/payslips/${runId}/${entry.employeeId}.pdf`;
      const u = await this.entryRepo.update(entry.id, {
        payslipGenerated: true,
        payslipUrl,
      });
      updated.push(u);
    }

    return updated;
  }

  async finalizeRun(runId: string, approvedBy: string): Promise<PayrollRun> {
    const run = await this.runRepo.findById(runId);
    if (!run) throw new Error(`Run ${runId} not found`);
    if (run.status !== 'PENDING_REVIEW') {
      throw new Error('Can only finalize runs in PENDING_REVIEW status');
    }

    return this.runRepo.update(runId, {
      status: 'APPROVED',
      finalizedAt: new Date(),
    });
  }

  async markPaid(runId: string): Promise<PayrollRun> {
    const run = await this.runRepo.findById(runId);
    if (!run) throw new Error(`Run ${runId} not found`);
    if (run.status !== 'APPROVED') {
      throw new Error('Can only mark APPROVED runs as paid');
    }
    return this.runRepo.update(runId, {
      status: 'PAID',
      paidAt: new Date(),
    });
  }
}

function calculateSimpleTax(annualIncome: number): number {
  if (annualIncome <= 300_000) return 0;
  if (annualIncome <= 600_000) return (annualIncome - 300_000) * 0.05;
  return 15_000 + (annualIncome - 600_000) * 0.20;
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const TENANT_ID = 'tenant-aura-001';
const PERIOD = '2025-03';

const TEST_EMPLOYEES = [
  { employeeId: 'emp-001', employeeNumber: 'A001', fullName: 'Alice Johnson', basicSalary: 15_000, allowances: 5_000, currency: 'AED' },
  { employeeId: 'emp-002', employeeNumber: 'A002', fullName: 'Bob Smith', basicSalary: 20_000, allowances: 7_000, currency: 'AED' },
  { employeeId: 'emp-003', employeeNumber: 'A003', fullName: 'Carol Ahmed', basicSalary: 12_000, allowances: 4_000, currency: 'AED' },
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Payroll Flow — End-to-End Integration', () => {
  let runRepo: PayrollRunRepository;
  let entryRepo: PayrollEntryRepository;
  let service: PayrollService;

  beforeEach(() => {
    idCounter = 0;
    runRepo = new PayrollRunRepository();
    entryRepo = new PayrollEntryRepository();
    service = new PayrollService(runRepo, entryRepo);
  });

  test('Step 1: Creates a payroll run with DRAFT status', async () => {
    const run = await service.createRun({
      tenantId: TENANT_ID,
      period: PERIOD,
      payFrequency: 'MONTHLY',
      currency: 'AED',
      createdBy: 'payroll-manager-001',
    });

    expect(run.id).toBeDefined();
    expect(run.status).toBe('DRAFT');
    expect(run.period).toBe(PERIOD);
    expect(run.employeeCount).toBe(0);
    expect(run.totalGross).toBe(0);
  });

  test('Step 2: Adds employees and transitions run to IN_PROGRESS', async () => {
    const run = await service.createRun({
      tenantId: TENANT_ID, period: PERIOD,
      payFrequency: 'MONTHLY', currency: 'AED',
      createdBy: 'payroll-manager-001',
    });

    for (const emp of TEST_EMPLOYEES) {
      await service.addEmployee(run.id, emp);
    }

    const updated = await runRepo.findById(run.id);
    expect(updated!.status).toBe('IN_PROGRESS');
    expect(updated!.employeeCount).toBe(3);
  });

  test('Step 3: Calculates payroll and transitions to PENDING_REVIEW', async () => {
    const run = await service.createRun({
      tenantId: TENANT_ID, period: PERIOD,
      payFrequency: 'MONTHLY', currency: 'AED',
      createdBy: 'payroll-manager-001',
    });

    for (const emp of TEST_EMPLOYEES) {
      await service.addEmployee(run.id, emp);
    }

    const { run: calculated, entries } = await service.calculatePayroll(run.id);

    expect(calculated.status).toBe('PENDING_REVIEW');
    expect(calculated.totalGross).toBeGreaterThan(0);
    expect(calculated.totalNet).toBeLessThan(calculated.totalGross);
    expect(entries).toHaveLength(3);
  });

  test('Step 4: Verifies payslip generation for all employees', async () => {
    const run = await service.createRun({
      tenantId: TENANT_ID, period: PERIOD,
      payFrequency: 'MONTHLY', currency: 'AED',
      createdBy: 'payroll-manager-001',
    });

    for (const emp of TEST_EMPLOYEES) {
      await service.addEmployee(run.id, emp);
    }

    await service.calculatePayroll(run.id);
    const payslips = await service.generatePayslips(run.id);

    expect(payslips).toHaveLength(3);
    for (const slip of payslips) {
      expect(slip.payslipGenerated).toBe(true);
      expect(slip.payslipUrl).toMatch(/\/payslips\//);
    }
  });

  test('Step 5: Finalizes run and transitions to APPROVED', async () => {
    const run = await service.createRun({
      tenantId: TENANT_ID, period: PERIOD,
      payFrequency: 'MONTHLY', currency: 'AED',
      createdBy: 'payroll-manager-001',
    });

    for (const emp of TEST_EMPLOYEES) {
      await service.addEmployee(run.id, emp);
    }

    await service.calculatePayroll(run.id);
    const finalized = await service.finalizeRun(run.id, 'hr-director-001');

    expect(finalized.status).toBe('APPROVED');
    expect(finalized.finalizedAt).toBeInstanceOf(Date);
  });

  test('Step 6: Marks run as PAID after approval', async () => {
    const run = await service.createRun({
      tenantId: TENANT_ID, period: PERIOD,
      payFrequency: 'MONTHLY', currency: 'AED',
      createdBy: 'payroll-manager-001',
    });

    for (const emp of TEST_EMPLOYEES) {
      await service.addEmployee(run.id, emp);
    }

    await service.calculatePayroll(run.id);
    await service.finalizeRun(run.id, 'hr-director-001');
    const paid = await service.markPaid(run.id);

    expect(paid.status).toBe('PAID');
    expect(paid.paidAt).toBeInstanceOf(Date);
  });

  test('Status transition: cannot calculate a DRAFT run directly', async () => {
    const run = await service.createRun({
      tenantId: TENANT_ID, period: PERIOD,
      payFrequency: 'MONTHLY', currency: 'AED',
      createdBy: 'payroll-manager-001',
    });

    await expect(service.calculatePayroll(run.id)).rejects.toThrow('IN_PROGRESS');
  });

  test('Status transition: cannot finalize a non-PENDING_REVIEW run', async () => {
    const run = await service.createRun({
      tenantId: TENANT_ID, period: PERIOD,
      payFrequency: 'MONTHLY', currency: 'AED',
      createdBy: 'payroll-manager-001',
    });

    await expect(service.finalizeRun(run.id, 'user')).rejects.toThrow('PENDING_REVIEW');
  });

  test('Net pay calculations are correct for each employee', async () => {
    const run = await service.createRun({
      tenantId: TENANT_ID, period: PERIOD,
      payFrequency: 'MONTHLY', currency: 'AED',
      createdBy: 'payroll-manager-001',
    });

    await service.addEmployee(run.id, TEST_EMPLOYEES[0]);
    const { entries } = await service.calculatePayroll(run.id);

    const alice = entries[0];
    expect(alice.grossSalary).toBe(20_000); // 15000 basic + 5000 allowance
    expect(alice.netPay).toBeLessThan(alice.grossSalary);
    expect(alice.netPay).toBe(alice.grossSalary - alice.totalDeductions);
  });

  test('Run totals equal sum of individual employee figures', async () => {
    const run = await service.createRun({
      tenantId: TENANT_ID, period: PERIOD,
      payFrequency: 'MONTHLY', currency: 'AED',
      createdBy: 'payroll-manager-001',
    });

    for (const emp of TEST_EMPLOYEES) {
      await service.addEmployee(run.id, emp);
    }

    const { run: calculated, entries } = await service.calculatePayroll(run.id);

    const sumGross = entries.reduce((s, e) => s + e.grossSalary, 0);
    const sumDeductions = entries.reduce((s, e) => s + e.totalDeductions, 0);
    const sumNet = entries.reduce((s, e) => s + e.netPay, 0);

    expect(calculated.totalGross).toBeCloseTo(sumGross, 2);
    expect(calculated.totalDeductions).toBeCloseTo(sumDeductions, 2);
    expect(calculated.totalNet).toBeCloseTo(sumNet, 2);
  });
});
