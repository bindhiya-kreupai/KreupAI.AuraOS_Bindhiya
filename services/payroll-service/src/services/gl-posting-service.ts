/**
 * GL Posting Service — Payroll to General Ledger Integration
 *
 * Generates double-entry journal entries from finalized payroll runs.
 * Supports multi-entity, multi-currency, and multi-jurisdiction GL structures.
 *
 * Standard Payroll Journal Entries (India example):
 *  DR  Salary Expense (per department/cost center)
 *  DR  PF Expense (employer contribution)
 *  DR  ESI Expense (employer contribution)
 *  DR  Gratuity Expense (provision)
 *  CR  Employee PF Payable
 *  CR  Employee ESI Payable
 *  CR  TDS Payable
 *  CR  Professional Tax Payable
 *  CR  Net Pay Payable (Bank)
 *  CR  Employer PF Payable
 *  CR  Employer ESI Payable
 *
 * References:
 *  India: Companies Act 2013, Schedule III — P&L and Balance Sheet format
 *  UAE: IFRS as adopted by IASB (no local GAAP requirement for foreign companies)
 */

import { z } from 'zod';
import Decimal from 'decimal.js';
import { prisma } from '@aura/database';

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

export const JournalEntryStatusSchema = z.enum([
  'DRAFT', 'POSTED', 'REVERSED', 'CANCELLED',
]);

export const GenerateJournalSchema = z.object({
  payrollRunId: z.string().uuid(),
  entityId: z.string().uuid(),
  postingDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const PostToGLSchema = z.object({
  journalId: z.string(),
  postedByUserId: z.string().uuid(),
});

export const ReverseJournalSchema = z.object({
  journalId: z.string(),
  reason: z.string().min(5),
  reversedByUserId: z.string().uuid(),
  reversalDate: z.string().datetime().optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type JournalEntryStatus = z.infer<typeof JournalEntryStatusSchema>;

export interface GLAccount {
  code: string;
  name: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
  currency: string;
  entityId: string;
}

export interface JournalLine {
  lineNumber: number;
  accountCode: string;
  accountName: string;
  debit: Decimal;
  credit: Decimal;
  narration: string;
  costCenter: string | null;
  department: string | null;
  employeeId: string | null;
}

export interface JournalEntry {
  id: string;
  payrollRunId: string;
  entityId: string;
  period: string;
  postingDate: Date;
  referenceNumber: string;
  narration: string;
  currency: string;
  totalDebit: Decimal;
  totalCredit: Decimal;
  lines: JournalLine[];
  status: JournalEntryStatus;
  postedByUserId: string | null;
  postedAt: Date | null;
  reversedByJournalId: string | null;
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// Standard Chart of Accounts — GL Account Mapping
// ---------------------------------------------------------------------------

export const INDIA_GL_ACCOUNTS: GLAccount[] = [
  { code: '5001', name: 'Salary Expense', type: 'EXPENSE', currency: 'INR', entityId: 'entity-001' },
  { code: '5002', name: 'PF Expense (Employer)', type: 'EXPENSE', currency: 'INR', entityId: 'entity-001' },
  { code: '5003', name: 'ESI Expense (Employer)', type: 'EXPENSE', currency: 'INR', entityId: 'entity-001' },
  { code: '5004', name: 'Gratuity Expense', type: 'EXPENSE', currency: 'INR', entityId: 'entity-001' },
  { code: '5005', name: 'Professional Tax Expense', type: 'EXPENSE', currency: 'INR', entityId: 'entity-001' },
  { code: '2101', name: 'Employee PF Payable', type: 'LIABILITY', currency: 'INR', entityId: 'entity-001' },
  { code: '2102', name: 'Employer PF Payable', type: 'LIABILITY', currency: 'INR', entityId: 'entity-001' },
  { code: '2103', name: 'Employee ESI Payable', type: 'LIABILITY', currency: 'INR', entityId: 'entity-001' },
  { code: '2104', name: 'Employer ESI Payable', type: 'LIABILITY', currency: 'INR', entityId: 'entity-001' },
  { code: '2105', name: 'TDS Payable', type: 'LIABILITY', currency: 'INR', entityId: 'entity-001' },
  { code: '2106', name: 'Professional Tax Payable', type: 'LIABILITY', currency: 'INR', entityId: 'entity-001' },
  { code: '2107', name: 'Net Salary Payable', type: 'LIABILITY', currency: 'INR', entityId: 'entity-001' },
  { code: '2108', name: 'Gratuity Provision', type: 'LIABILITY', currency: 'INR', entityId: 'entity-001' },
];

export const UAE_GL_ACCOUNTS: GLAccount[] = [
  { code: '5001', name: 'Salary Expense', type: 'EXPENSE', currency: 'AED', entityId: 'entity-002' },
  { code: '5002', name: 'EOSB Provision', type: 'EXPENSE', currency: 'AED', entityId: 'entity-002' },
  { code: '2101', name: 'Net Salary Payable', type: 'LIABILITY', currency: 'AED', entityId: 'entity-002' },
  { code: '2102', name: 'EOSB Provision Liability', type: 'LIABILITY', currency: 'AED', entityId: 'entity-002' },
];

export const KSA_GL_ACCOUNTS: GLAccount[] = [
  { code: '5001', name: 'Salary Expense', type: 'EXPENSE', currency: 'SAR', entityId: 'entity-003' },
  { code: '5002', name: 'GOSI Expense (Employer)', type: 'EXPENSE', currency: 'SAR', entityId: 'entity-003' },
  { code: '5003', name: 'EOSB Provision', type: 'EXPENSE', currency: 'SAR', entityId: 'entity-003' },
  { code: '2101', name: 'Employee GOSI Payable', type: 'LIABILITY', currency: 'SAR', entityId: 'entity-003' },
  { code: '2102', name: 'Employer GOSI Payable', type: 'LIABILITY', currency: 'SAR', entityId: 'entity-003' },
  { code: '2103', name: 'Net Salary Payable', type: 'LIABILITY', currency: 'SAR', entityId: 'entity-003' },
  { code: '2104', name: 'EOSB Provision Liability', type: 'LIABILITY', currency: 'SAR', entityId: 'entity-003' },
];

// ---------------------------------------------------------------------------
// Mock Journal Data
// ---------------------------------------------------------------------------

const MOCK_JOURNALS: JournalEntry[] = [
  {
    id: 'je-2026-01',
    payrollRunId: 'run-2026-01',
    entityId: 'entity-001',
    period: '2026-01',
    postingDate: new Date('2026-01-31'),
    referenceNumber: 'PAY-JE-2026-01-001',
    narration: 'January 2026 Payroll — 243 employees',
    currency: 'INR',
    totalDebit: new Decimal(20895600),
    totalCredit: new Decimal(20895600),
    status: 'POSTED',
    postedByUserId: 'user-002',
    postedAt: new Date('2026-01-31T14:00:00Z'),
    reversedByJournalId: null,
    createdAt: new Date('2026-01-30T10:00:00Z'),
    lines: [
      { lineNumber: 1, accountCode: '5001', accountName: 'Salary Expense', debit: new Decimal(18225000), credit: new Decimal(0), narration: 'Jan 2026 Gross Salary — 243 employees', costCenter: 'CORP', department: null, employeeId: null },
      { lineNumber: 2, accountCode: '5002', accountName: 'PF Expense (Employer)', debit: new Decimal(1638000), credit: new Decimal(0), narration: 'Jan 2026 Employer PF Contribution', costCenter: 'CORP', department: null, employeeId: null },
      { lineNumber: 3, accountCode: '5003', accountName: 'ESI Expense (Employer)', debit: new Decimal(0), credit: new Decimal(0), narration: 'Jan 2026 Employer ESI (nil — salary above ceiling)', costCenter: 'CORP', department: null, employeeId: null },
      { lineNumber: 4, accountCode: '5004', accountName: 'Gratuity Expense', debit: new Decimal(549000), credit: new Decimal(0), narration: 'Jan 2026 Gratuity Provision', costCenter: 'CORP', department: null, employeeId: null },
      { lineNumber: 5, accountCode: '2101', accountName: 'Employee PF Payable', debit: new Decimal(0), credit: new Decimal(1638000), narration: 'Jan 2026 Employee PF Payable to EPFO', costCenter: null, department: null, employeeId: null },
      { lineNumber: 6, accountCode: '2102', accountName: 'Employer PF Payable', debit: new Decimal(0), credit: new Decimal(1638000), narration: 'Jan 2026 Employer PF Payable to EPFO', costCenter: null, department: null, employeeId: null },
      { lineNumber: 7, accountCode: '2105', accountName: 'TDS Payable', debit: new Decimal(0), credit: new Decimal(2187000), narration: 'Jan 2026 TDS u/s 192 — Payable to Income Tax Dept', costCenter: null, department: null, employeeId: null },
      { lineNumber: 8, accountCode: '2106', accountName: 'Professional Tax Payable', debit: new Decimal(0), credit: new Decimal(48600), narration: 'Jan 2026 Professional Tax Payable', costCenter: null, department: null, employeeId: null },
      { lineNumber: 9, accountCode: '2107', accountName: 'Net Salary Payable', debit: new Decimal(0), credit: new Decimal(14952000), narration: 'Jan 2026 Net Salaries — Bank Transfer Pending', costCenter: null, department: null, employeeId: null },
      { lineNumber: 10, accountCode: '2108', accountName: 'Gratuity Provision', debit: new Decimal(0), credit: new Decimal(549000), narration: 'Jan 2026 Gratuity Provision', costCenter: null, department: null, employeeId: null },
    ],
  },
];

// ---------------------------------------------------------------------------
// GL Posting Service
// ---------------------------------------------------------------------------

export class GLPostingService {

  /**
   * Generate journal entries for a finalized payroll run.
   */
  async generateJournalEntries(input: z.infer<typeof GenerateJournalSchema>): Promise<JournalEntry> {
    const parsed = GenerateJournalSchema.parse(input);

    // In production: fetch payroll run summary and employee results from DB
    // const run = await prisma.payrollRun.findUnique({ where: { id: parsed.payrollRunId } });

    // Mock: generate standard India journal
    const postingDate = parsed.postingDate ? new Date(parsed.postingDate) : new Date();
    const period = '2026-02';

    const grossSalary = new Decimal(18540000);
    const employerPF = new Decimal(1668600);
    const gratuityProvision = new Decimal(558000);
    const employeePF = new Decimal(1668600);
    const employerESI = new Decimal(0);
    const employeeESI = new Decimal(0);
    const tdsPayable = new Decimal(2224800);
    const ptPayable = new Decimal(49400);
    const netSalaryPayable = grossSalary
      .sub(employeePF)
      .sub(employeeESI)
      .sub(tdsPayable)
      .sub(ptPayable);

    const totalDebit = grossSalary.add(employerPF).add(gratuityProvision);

    const lines: JournalLine[] = [
      { lineNumber: 1, accountCode: '5001', accountName: 'Salary Expense', debit: grossSalary, credit: new Decimal(0), narration: `${period} Gross Salary`, costCenter: 'CORP', department: null, employeeId: null },
      { lineNumber: 2, accountCode: '5002', accountName: 'PF Expense (Employer)', debit: employerPF, credit: new Decimal(0), narration: `${period} Employer PF`, costCenter: 'CORP', department: null, employeeId: null },
      { lineNumber: 3, accountCode: '5004', accountName: 'Gratuity Expense', debit: gratuityProvision, credit: new Decimal(0), narration: `${period} Gratuity Provision`, costCenter: 'CORP', department: null, employeeId: null },
      { lineNumber: 4, accountCode: '2101', accountName: 'Employee PF Payable', debit: new Decimal(0), credit: employeePF, narration: `${period} Employee PF to EPFO`, costCenter: null, department: null, employeeId: null },
      { lineNumber: 5, accountCode: '2102', accountName: 'Employer PF Payable', debit: new Decimal(0), credit: employerPF, narration: `${period} Employer PF to EPFO`, costCenter: null, department: null, employeeId: null },
      { lineNumber: 6, accountCode: '2105', accountName: 'TDS Payable', debit: new Decimal(0), credit: tdsPayable, narration: `${period} TDS u/s 192`, costCenter: null, department: null, employeeId: null },
      { lineNumber: 7, accountCode: '2106', accountName: 'Professional Tax Payable', debit: new Decimal(0), credit: ptPayable, narration: `${period} Professional Tax`, costCenter: null, department: null, employeeId: null },
      { lineNumber: 8, accountCode: '2107', accountName: 'Net Salary Payable', debit: new Decimal(0), credit: netSalaryPayable, narration: `${period} Net Salaries — Bank Pending`, costCenter: null, department: null, employeeId: null },
      { lineNumber: 9, accountCode: '2108', accountName: 'Gratuity Provision', debit: new Decimal(0), credit: gratuityProvision, narration: `${period} Gratuity Provision Liability`, costCenter: null, department: null, employeeId: null },
    ];

    const journal: JournalEntry = {
      id: `je-${Date.now()}`,
      payrollRunId: parsed.payrollRunId,
      entityId: parsed.entityId,
      period,
      postingDate,
      referenceNumber: `PAY-JE-${period}-${Date.now()}`,
      narration: `Payroll Journal — ${period}${parsed.notes ? ` — ${parsed.notes}` : ''}`,
      currency: 'INR',
      totalDebit,
      totalCredit: totalDebit,
      lines,
      status: 'DRAFT',
      postedByUserId: null,
      postedAt: null,
      reversedByJournalId: null,
      createdAt: new Date(),
    };

    return journal;
  }

  /**
   * Get the standard Chart of Accounts for an entity/country.
   */
  getChartOfAccounts(countryCode: string): GLAccount[] {
    switch (countryCode) {
      case 'IN': return INDIA_GL_ACCOUNTS;
      case 'AE': return UAE_GL_ACCOUNTS;
      case 'SA': return KSA_GL_ACCOUNTS;
      default: return INDIA_GL_ACCOUNTS;
    }
  }

  /**
   * Post a draft journal entry to the GL.
   */
  async postToGL(input: z.infer<typeof PostToGLSchema>): Promise<JournalEntry> {
    const parsed = PostToGLSchema.parse(input);
    const journal = MOCK_JOURNALS.find(j => j.id === parsed.journalId)
      ?? { ...MOCK_JOURNALS[0], id: parsed.journalId, status: 'DRAFT' as JournalEntryStatus };

    if (journal.status === 'POSTED') {
      throw new Error('Journal entry is already posted');
    }

    journal.status = 'POSTED';
    journal.postedByUserId = parsed.postedByUserId;
    journal.postedAt = new Date();
    return journal as JournalEntry;
  }

  /**
   * Reverse a posted journal entry.
   * Creates an equal and opposite entry.
   */
  async reverseJournalEntry(input: z.infer<typeof ReverseJournalSchema>): Promise<JournalEntry> {
    const parsed = ReverseJournalSchema.parse(input);
    const original = MOCK_JOURNALS.find(j => j.id === parsed.journalId);
    if (!original) throw new Error(`Journal ${parsed.journalId} not found`);
    if (original.status !== 'POSTED') {
      throw new Error('Only POSTED journals can be reversed');
    }

    // Create reversal entry with swapped debits/credits
    const reversalLines = original.lines.map((line, idx) => ({
      ...line,
      lineNumber: idx + 1,
      debit: line.credit,
      credit: line.debit,
      narration: `REVERSAL: ${line.narration}`,
    }));

    const reversalJournal: JournalEntry = {
      id: `je-rev-${Date.now()}`,
      payrollRunId: original.payrollRunId,
      entityId: original.entityId,
      period: original.period,
      postingDate: parsed.reversalDate ? new Date(parsed.reversalDate) : new Date(),
      referenceNumber: `REV-${original.referenceNumber}`,
      narration: `REVERSAL of ${original.referenceNumber}: ${parsed.reason}`,
      currency: original.currency,
      totalDebit: original.totalCredit,
      totalCredit: original.totalDebit,
      lines: reversalLines,
      status: 'POSTED',
      postedByUserId: parsed.reversedByUserId,
      postedAt: new Date(),
      reversedByJournalId: original.id,
      createdAt: new Date(),
    };

    original.status = 'REVERSED';
    original.reversedByJournalId = reversalJournal.id;
    return reversalJournal;
  }

  /**
   * Get all journal entries for a payroll run.
   */
  async getJournalEntries(payrollRunId: string): Promise<JournalEntry[]> {
    return MOCK_JOURNALS.filter(j => j.payrollRunId === payrollRunId);
  }

  /**
   * Get all pending (draft) journals across all runs.
   */
  async getPendingJournals(entityId: string): Promise<JournalEntry[]> {
    return MOCK_JOURNALS.filter(j => j.entityId === entityId && j.status === 'DRAFT');
  }
}

// Singleton export
export const glPostingService = new GLPostingService();
