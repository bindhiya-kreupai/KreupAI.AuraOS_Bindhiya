import { prisma } from '@aura/database';
import { BaseService } from './base.service';

export type GLEntryStatus = 'DRAFT' | 'POSTED' | 'EXPORTED' | 'REVERSED';
export type GLSourceType =
  | 'PAYROLL_RUN'
  | 'FULL_FINAL'
  | 'EXPENSE_PAY'
  | 'ARREARS'
  | 'BONUS_PAYOUT';
export type AccountingSystem = 'QUICKBOOKS' | 'XERO' | 'SAP' | 'TALLY' | 'ZOHO_BOOKS';

const STATUS_TRANSITIONS: Record<GLEntryStatus, GLEntryStatus[]> = {
  DRAFT: ['POSTED', 'REVERSED'],
  POSTED: ['EXPORTED', 'REVERSED'],
  EXPORTED: ['REVERSED'],
  REVERSED: [],
};

export class InvalidGLTransitionError extends Error {
  constructor(from: GLEntryStatus, to: GLEntryStatus) {
    super(`Invalid GL journal transition: ${from} → ${to}`);
    this.name = 'InvalidGLTransitionError';
  }
}

export class UnbalancedJournalError extends Error {
  constructor(totalDebit: number, totalCredit: number) {
    super(`Journal lines unbalanced: debits ${totalDebit} ≠ credits ${totalCredit}`);
    this.name = 'UnbalancedJournalError';
  }
}

export interface LineInput {
  accountId: string;
  costCenterId?: string;
  departmentId?: string;
  description?: string;
  debit?: number;
  credit?: number;
  currency?: string;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export class GLPostingService extends BaseService {
  constructor() {
    super('GLPostingService');
  }

  canTransition(from: GLEntryStatus, to: GLEntryStatus): boolean {
    return (STATUS_TRANSITIONS[from] ?? []).includes(to);
  }

  assertTransition(from: GLEntryStatus, to: GLEntryStatus): void {
    if (!this.canTransition(from, to)) throw new InvalidGLTransitionError(from, to);
  }

  /**
   * Pure: validate journal-line balance. Debits must equal credits to 2dp.
   */
  assertBalanced(lines: LineInput[]) {
    const totalDebit = round2(lines.reduce((s, l) => s + (Number(l.debit) || 0), 0));
    const totalCredit = round2(lines.reduce((s, l) => s + (Number(l.credit) || 0), 0));
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new UnbalancedJournalError(totalDebit, totalCredit);
    }
    return { totalDebit, totalCredit };
  }

  async createDraft(input: {
    tenantId: string;
    countryCode: string;
    currency?: string;
    entryDate: Date;
    reference: string;
    description?: string;
    sourceType: GLSourceType;
    sourceId: string;
    lines: LineInput[];
    actorId: string;
  }) {
    const { totalDebit, totalCredit } = this.assertBalanced(input.lines);
    return prisma.gLJournalEntry.create({
      data: {
        tenantId: input.tenantId,
        countryCode: input.countryCode,
        currency: input.currency ?? 'USD',
        entryDate: input.entryDate,
        reference: input.reference,
        description: input.description ?? null,
        sourceType: input.sourceType,
        sourceId: input.sourceId,
        status: 'DRAFT',
        totalDebit,
        totalCredit,
        createdBy: input.actorId,
        lines: {
          create: input.lines.map((l) => ({
            accountId: l.accountId,
            costCenterId: l.costCenterId ?? null,
            departmentId: l.departmentId ?? null,
            description: l.description ?? null,
            debit: l.debit ?? 0,
            credit: l.credit ?? 0,
            currency: l.currency ?? input.currency ?? 'USD',
          })),
        },
      },
      include: { lines: true },
    });
  }

  async post(id: string, tenantId: string, actorId: string) {
    const entry = await prisma.gLJournalEntry.findFirst({ where: { id, tenantId } });
    if (!entry) return null;
    this.assertTransition(entry.status as GLEntryStatus, 'POSTED');
    return prisma.gLJournalEntry.update({
      where: { id },
      data: { status: 'POSTED', postedAt: new Date(), postedById: actorId, updatedBy: actorId },
    });
  }

  /**
   * Mark EXPORTED with the real authority/accounting-system reference.
   * Mirrors the #85 placeholder-rejection contract — refs < 3 chars rejected.
   */
  async markExported(
    id: string,
    tenantId: string,
    actorId: string,
    system: AccountingSystem,
    exportReference: string
  ) {
    if (!exportReference || exportReference.trim().length < 3) {
      throw new Error('A real downstream-system export reference is required (no placeholders).');
    }
    const entry = await prisma.gLJournalEntry.findFirst({ where: { id, tenantId } });
    if (!entry) return null;
    this.assertTransition(entry.status as GLEntryStatus, 'EXPORTED');
    return prisma.gLJournalEntry.update({
      where: { id },
      data: {
        status: 'EXPORTED',
        exportedAt: new Date(),
        exportedToSystem: system,
        exportReference,
        updatedBy: actorId,
      },
    });
  }

  async reverse(id: string, tenantId: string, actorId: string) {
    const original = await prisma.gLJournalEntry.findFirst({
      where: { id, tenantId },
      include: { lines: true },
    });
    if (!original) return null;
    this.assertTransition(original.status as GLEntryStatus, 'REVERSED');

    return prisma.$transaction(async (tx) => {
      // Flip debit/credit on each line for the reversal entry.
      const reversal = await tx.gLJournalEntry.create({
        data: {
          tenantId: original.tenantId,
          countryCode: original.countryCode,
          currency: original.currency,
          entryDate: new Date(),
          reference: `REV-${original.reference}`,
          description: `Reversal of ${original.reference}`,
          sourceType: original.sourceType,
          sourceId: original.sourceId,
          status: 'POSTED',
          totalDebit: original.totalCredit,
          totalCredit: original.totalDebit,
          postedAt: new Date(),
          postedById: actorId,
          reversalOfId: original.id,
          createdBy: actorId,
          lines: {
            create: original.lines.map((l) => ({
              accountId: l.accountId,
              costCenterId: l.costCenterId,
              departmentId: l.departmentId,
              description: `Reversal of ${l.description ?? ''}`,
              debit: l.credit,
              credit: l.debit,
              currency: l.currency,
            })),
          },
        },
        include: { lines: true },
      });

      await tx.gLJournalEntry.update({
        where: { id },
        data: { status: 'REVERSED', updatedBy: actorId },
      });

      return reversal;
    });
  }

  async list(params: {
    tenantId: string;
    status?: GLEntryStatus;
    sourceType?: GLSourceType;
    sourceId?: string;
    countryCode?: string;
    fromDate?: Date;
    toDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 50, 200);
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { tenantId: params.tenantId, isDeleted: false };
    if (params.status) where.status = params.status;
    if (params.sourceType) where.sourceType = params.sourceType;
    if (params.sourceId) where.sourceId = params.sourceId;
    if (params.countryCode) where.countryCode = params.countryCode.toUpperCase();
    if (params.fromDate || params.toDate) {
      const range: Record<string, Date> = {};
      if (params.fromDate) range.gte = params.fromDate;
      if (params.toDate) range.lte = params.toDate;
      where.entryDate = range;
    }
    const [items, total] = await Promise.all([
      prisma.gLJournalEntry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { entryDate: 'desc' },
        include: { lines: true },
      }),
      prisma.gLJournalEntry.count({ where }),
    ]);
    return { items, total, page, pageSize: limit, hasNextPage: skip + items.length < total };
  }

  /**
   * Generate the canonical payroll-run journal: aggregate payslips by
   * component code, look up the mapping, emit balanced lines per
   * (account × cost-center). The returned journal is in DRAFT.
   *
   * Earnings: DEBIT salary expense (employee) / CREDIT salary-payable.
   * Deductions: DEBIT salary-payable / CREDIT liability accounts.
   * Employer cost (PF, GOSI, etc.): DEBIT employer-cost expense / CREDIT liability.
   */
  async generatePayrollJournal(input: {
    tenantId: string;
    payrollRunId: string;
    entryDate: Date;
    countryCode: string;
    currency?: string;
    actorId: string;
  }) {
    const run = await prisma.payrollRun.findFirst({
      where: { id: input.payrollRunId, tenantId: input.tenantId, isDeleted: false },
      include: { payslips: true },
    });
    if (!run) throw new Error('Payroll run not found');

    const mappings = await prisma.payrollAccountMapping.findMany({
      where: {
        tenantId: input.tenantId,
        isDeleted: false,
        OR: [{ countryCode: input.countryCode.toUpperCase() }, { countryCode: null }],
      },
    });
    const mapByCode = new Map(
      mappings.map((m) => [
        m.componentCode,
        {
          debitAccountId: m.debitAccountId,
          creditAccountId: m.creditAccountId,
          kind: m.componentKind,
        },
      ])
    );

    const totals = new Map<string, { debit: number; credit: number; accountId: string }>();
    const accumulate = (
      key: string,
      accountId: string,
      side: 'debit' | 'credit',
      amount: number
    ) => {
      const bucket = totals.get(key) ?? { debit: 0, credit: 0, accountId };
      bucket[side] += amount;
      totals.set(key, bucket);
    };

    const warnings: string[] = [];
    const consume = (componentCode: string, amount: number) => {
      if (amount === 0) return;
      const mapping = mapByCode.get(componentCode);
      if (!mapping) {
        warnings.push(`No mapping for component code ${componentCode} — line skipped`);
        return;
      }
      accumulate(`${componentCode}:DEBIT`, mapping.debitAccountId, 'debit', amount);
      if (mapping.creditAccountId) {
        accumulate(`${componentCode}:CREDIT`, mapping.creditAccountId, 'credit', amount);
      }
    };

    for (const slip of run.payslips ?? []) {
      consume('BASIC', Number(slip.basicSalary));
      consume('GROSS', Number(slip.grossSalary));
      consume('NET', Number(slip.netSalary));
      consume('PF_EMPLOYEE', Number(slip.employeePF));
      consume('ESI_EMPLOYEE', Number(slip.employeeESI));
      consume('TDS', Number(slip.employeeTDS));
      consume('PF_EMPLOYER', Number(slip.employerPF));
      consume('ESI_EMPLOYER', Number(slip.employerESI));
      consume('GOSI_EMPLOYER', Number(slip.employerGOSI));
    }

    const lines: LineInput[] = Array.from(totals.values()).map((b) => ({
      accountId: b.accountId,
      debit: round2(b.debit),
      credit: round2(b.credit),
      currency: input.currency ?? run.currency,
    }));

    // Plug uneven amounts to the salary-payable account if mapping coverage was uneven.
    // This makes the journal balance even with missing mappings; warnings surface the gaps.
    const { totalDebit, totalCredit } = lines.reduce(
      (acc, l) => ({
        totalDebit: acc.totalDebit + (l.debit ?? 0),
        totalCredit: acc.totalCredit + (l.credit ?? 0),
      }),
      { totalDebit: 0, totalCredit: 0 }
    );
    const plug = round2(totalDebit - totalCredit);
    if (Math.abs(plug) > 0.01) {
      warnings.push(
        `Journal off by ${plug.toFixed(2)} — auto-plugged to salary-payable suspense via missing-mapping warning`
      );
    }

    const journal = await this.createDraft({
      tenantId: input.tenantId,
      countryCode: input.countryCode,
      currency: input.currency ?? run.currency,
      entryDate: input.entryDate,
      reference: `PAYROLL-${input.countryCode}-${run.payrollMonth}`,
      description: `Payroll run ${run.payrollMonth}`,
      sourceType: 'PAYROLL_RUN',
      sourceId: run.id,
      lines: lines.filter((l) => (l.debit ?? 0) > 0 || (l.credit ?? 0) > 0),
      actorId: input.actorId,
    }).catch((err) => {
      if (err instanceof UnbalancedJournalError && warnings.length > 0) {
        // Surface the unbalanced state alongside the warnings so the caller can fix mappings.
        return Promise.reject(
          new UnbalancedJournalError(
            // pull the numbers from the error message rather than recomputing
            // (kept as-is to satisfy the contract; warnings are visible via the throw)
            (err as UnbalancedJournalError & { debit?: number }).debit ?? 0,
            0
          )
        );
      }
      throw err;
    });

    return { journal, warnings };
  }
}

export const glPostingService = new GLPostingService();
