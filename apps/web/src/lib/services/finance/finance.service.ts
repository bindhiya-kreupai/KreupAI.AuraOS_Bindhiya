/**
 * FinanceService
 *
 * Server-side, tenant-scoped persistence for the Finance dashboard module
 * (AURA-149..160). Backs /api/finance/* routes. Uses the new finance tables
 * created by migration 20260702140000_add_finance_module. Those models are
 * accessed via `(prisma as any).<model>` because the Prisma client is generated
 * from schema.prisma which is not edited by this workstream — the tables exist
 * (db-push / migration) and the delegate names match the @@map-free model names.
 *
 * Every method requires a tenantId and scopes all reads/writes by it.
 */

import { prisma } from '@aura/database';

const db = prisma as any;

export interface ListResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}

function toList<T>(items: T[], total: number, page: number, pageSize: number): ListResult<T> {
  return {
    items,
    total,
    page,
    pageSize,
    hasNextPage: (page - 1) * pageSize + items.length < total,
  };
}

function genCode(prefix: string): string {
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${rand}`;
}

// ---------------------------------------------------------------------------
// Vendors
// ---------------------------------------------------------------------------

export const VendorRepo = {
  async list(
    tenantId: string,
    opts: { status?: string; search?: string; page?: number; pageSize?: number } = {}
  ) {
    const page = opts.page ?? 1;
    const pageSize = opts.pageSize ?? 100;
    const where: any = { tenantId };
    if (opts.status) where.status = opts.status;
    if (opts.search) {
      where.OR = [
        { vendorName: { contains: opts.search, mode: 'insensitive' } },
        { vendorCode: { contains: opts.search, mode: 'insensitive' } },
        { email: { contains: opts.search, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      db.financeVendor.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.financeVendor.count({ where }),
    ]);
    return toList(items, total, page, pageSize);
  },

  async get(tenantId: string, id: string) {
    return db.financeVendor.findFirst({ where: { id, tenantId } });
  },

  async create(tenantId: string, userId: string, data: any) {
    return db.financeVendor.create({
      data: {
        tenantId,
        vendorCode: data.vendorCode || genCode('VEN'),
        vendorName: data.vendorName,
        vendorType: data.vendorType || 'company',
        status: data.status || 'pending_approval',
        email: data.email ?? null,
        phone: data.phone ?? null,
        website: data.website ?? null,
        taxId: data.taxId ?? null,
        categories: data.categories ?? null,
        servicesProvided: data.servicesProvided ?? null,
        paymentTerms: data.paymentTerms || 'net_30',
        preferredPaymentMethod: data.preferredPaymentMethod || 'bank_transfer',
        primaryContact: data.primaryContact ?? null,
        billingAddress: data.billingAddress ?? null,
        bankDetails: data.bankDetails ?? null,
        documents: data.documents ?? null,
        approvalStatus: data.approvalStatus || 'pending',
        notes: data.notes ?? null,
        createdBy: userId,
        updatedBy: userId,
      },
    });
  },

  async update(tenantId: string, userId: string, id: string, data: any) {
    const existing = await db.financeVendor.findFirst({ where: { id, tenantId } });
    if (!existing) return null;
    const allowed = [
      'vendorName',
      'vendorType',
      'status',
      'email',
      'phone',
      'website',
      'taxId',
      'categories',
      'servicesProvided',
      'paymentTerms',
      'preferredPaymentMethod',
      'primaryContact',
      'billingAddress',
      'bankDetails',
      'documents',
      'approvalStatus',
      'approvedBy',
      'approvedDate',
      'rejectionReason',
      'notes',
      'contractOnFile',
    ];
    const patch: any = { updatedBy: userId };
    for (const key of allowed) {
      if (data[key] !== undefined) patch[key] = data[key];
    }
    if (patch.approvedDate && typeof patch.approvedDate === 'string') {
      patch.approvedDate = new Date(patch.approvedDate);
    }
    return db.financeVendor.update({ where: { id }, data: patch });
  },

  async remove(tenantId: string, id: string) {
    const existing = await db.financeVendor.findFirst({ where: { id, tenantId } });
    if (!existing) return false;
    await db.financeVendor.delete({ where: { id } });
    return true;
  },
};

// ---------------------------------------------------------------------------
// Budgets
// ---------------------------------------------------------------------------

export const BudgetRepo = {
  async list(
    tenantId: string,
    opts: { status?: string; approvalStatus?: string; page?: number; pageSize?: number } = {}
  ) {
    const page = opts.page ?? 1;
    const pageSize = opts.pageSize ?? 100;
    const where: any = { tenantId };
    if (opts.status) where.status = opts.status;
    if (opts.approvalStatus) where.approvalStatus = opts.approvalStatus;
    const [items, total] = await Promise.all([
      db.financeBudget.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.financeBudget.count({ where }),
    ]);
    return toList(items, total, page, pageSize);
  },

  async get(tenantId: string, id: string) {
    return db.financeBudget.findFirst({ where: { id, tenantId } });
  },

  async create(tenantId: string, userId: string, data: any) {
    return db.financeBudget.create({
      data: {
        tenantId,
        budgetCode: data.budgetCode || genCode('BUD'),
        budgetName: data.budgetName,
        budgetType: data.budgetType || 'operations',
        status: data.status || 'draft',
        description: data.description ?? null,
        fiscalYear: data.fiscalYear ?? new Date().getFullYear(),
        period: data.period || 'annual',
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        department: data.department ?? null,
        costCenter: data.costCenter ?? null,
        project: data.project ?? null,
        location: data.location ?? null,
        lines: data.lines ?? null,
        totalBudget: data.totalBudget ?? 0,
        totalAllocated: data.totalAllocated ?? 0,
        totalSpent: data.totalSpent ?? 0,
        totalRemaining: data.totalRemaining ?? 0,
        utilizationRate: data.utilizationRate ?? 0,
        approvalStatus: data.approvalStatus || 'pending',
        version: data.version || '1.0',
        tags: data.tags ?? null,
        createdBy: userId,
        createdByName: data.createdByName ?? null,
        updatedBy: userId,
      },
    });
  },

  async update(tenantId: string, userId: string, id: string, data: any) {
    const existing = await db.financeBudget.findFirst({ where: { id, tenantId } });
    if (!existing) return null;
    const allowed = [
      'budgetName',
      'budgetType',
      'status',
      'description',
      'fiscalYear',
      'period',
      'department',
      'costCenter',
      'project',
      'location',
      'lines',
      'totalBudget',
      'totalAllocated',
      'totalSpent',
      'totalRemaining',
      'utilizationRate',
      'approvalStatus',
      'approvedBy',
      'approvedByName',
      'approvedDate',
      'rejectionReason',
      'version',
      'tags',
    ];
    const patch: any = { updatedBy: userId };
    for (const key of allowed) if (data[key] !== undefined) patch[key] = data[key];
    if (patch.approvedDate && typeof patch.approvedDate === 'string')
      patch.approvedDate = new Date(patch.approvedDate);
    return db.financeBudget.update({ where: { id }, data: patch });
  },

  async remove(tenantId: string, id: string) {
    const existing = await db.financeBudget.findFirst({ where: { id, tenantId } });
    if (!existing) return false;
    await db.financeBudget.delete({ where: { id } });
    return true;
  },
};

// ---------------------------------------------------------------------------
// Budget Templates
// ---------------------------------------------------------------------------

export const TemplateRepo = {
  async list(
    tenantId: string,
    opts: { templateType?: string; page?: number; pageSize?: number } = {}
  ) {
    const page = opts.page ?? 1;
    const pageSize = opts.pageSize ?? 100;
    const where: any = { tenantId };
    if (opts.templateType) where.templateType = opts.templateType;
    const [items, total] = await Promise.all([
      db.financeBudgetTemplate.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.financeBudgetTemplate.count({ where }),
    ]);
    return toList(items, total, page, pageSize);
  },

  async get(tenantId: string, id: string) {
    return db.financeBudgetTemplate.findFirst({ where: { id, tenantId } });
  },

  async create(tenantId: string, userId: string, data: any) {
    return db.financeBudgetTemplate.create({
      data: {
        tenantId,
        templateCode: data.templateCode || genCode('TPL'),
        templateName: data.templateName,
        templateType: data.templateType || 'operations',
        status: data.status || 'active',
        description: data.description ?? null,
        templateLines: data.templateLines ?? null,
        defaultPeriod: data.defaultPeriod || 'annual',
        defaultCurrency: data.defaultCurrency || 'USD',
        includeHeadcount: data.includeHeadcount ?? false,
        includeContingency: data.includeContingency ?? false,
        contingencyPercentage: data.contingencyPercentage ?? null,
        allowedDepartments: data.allowedDepartments ?? null,
        allowedRoles: data.allowedRoles ?? null,
        createdBy: userId,
        updatedBy: userId,
      },
    });
  },

  async update(tenantId: string, userId: string, id: string, data: any) {
    const existing = await db.financeBudgetTemplate.findFirst({ where: { id, tenantId } });
    if (!existing) return null;
    const allowed = [
      'templateName',
      'templateType',
      'status',
      'description',
      'templateLines',
      'defaultPeriod',
      'defaultCurrency',
      'includeHeadcount',
      'includeContingency',
      'contingencyPercentage',
      'allowedDepartments',
      'allowedRoles',
    ];
    const patch: any = { updatedBy: userId };
    for (const key of allowed) if (data[key] !== undefined) patch[key] = data[key];
    return db.financeBudgetTemplate.update({ where: { id }, data: patch });
  },

  async recordUsage(tenantId: string, id: string) {
    const existing = await db.financeBudgetTemplate.findFirst({ where: { id, tenantId } });
    if (!existing) return null;
    return db.financeBudgetTemplate.update({
      where: { id },
      data: { usageCount: (existing.usageCount ?? 0) + 1, lastUsedDate: new Date() },
    });
  },

  async remove(tenantId: string, id: string) {
    const existing = await db.financeBudgetTemplate.findFirst({ where: { id, tenantId } });
    if (!existing) return false;
    await db.financeBudgetTemplate.delete({ where: { id } });
    return true;
  },
};

// ---------------------------------------------------------------------------
// Scenarios
// ---------------------------------------------------------------------------

export const ScenarioRepo = {
  async list(tenantId: string, opts: { page?: number; pageSize?: number } = {}) {
    const page = opts.page ?? 1;
    const pageSize = opts.pageSize ?? 100;
    const where: any = { tenantId };
    const [items, total] = await Promise.all([
      db.financeScenario.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.financeScenario.count({ where }),
    ]);
    return toList(items, total, page, pageSize);
  },

  async get(tenantId: string, id: string) {
    return db.financeScenario.findFirst({ where: { id, tenantId } });
  },

  async create(tenantId: string, userId: string, data: any) {
    return db.financeScenario.create({
      data: {
        tenantId,
        scenarioCode: data.scenarioCode || genCode('SCN'),
        scenarioName: data.scenarioName,
        scenarioType: data.scenarioType || 'custom',
        status: data.status || 'draft',
        description: data.description ?? null,
        baseBudgetId: data.baseBudgetId ?? null,
        baseBudgetName: data.baseBudgetName ?? null,
        assumptions: data.assumptions ?? null,
        adjustedLines: data.adjustedLines ?? null,
        totalAdjustedBudget: data.totalAdjustedBudget ?? 0,
        totalVarianceFromBase: data.totalVarianceFromBase ?? 0,
        variancePercentage: data.variancePercentage ?? 0,
        headcountImpact: data.headcountImpact ?? null,
        cashFlowImpact: data.cashFlowImpact ?? null,
        createdBy: userId,
        updatedBy: userId,
      },
    });
  },

  async update(tenantId: string, userId: string, id: string, data: any) {
    const existing = await db.financeScenario.findFirst({ where: { id, tenantId } });
    if (!existing) return null;
    const allowed = [
      'scenarioName',
      'scenarioType',
      'status',
      'description',
      'baseBudgetId',
      'baseBudgetName',
      'assumptions',
      'adjustedLines',
      'totalAdjustedBudget',
      'totalVarianceFromBase',
      'variancePercentage',
      'headcountImpact',
      'cashFlowImpact',
    ];
    const patch: any = { updatedBy: userId };
    for (const key of allowed) if (data[key] !== undefined) patch[key] = data[key];
    return db.financeScenario.update({ where: { id }, data: patch });
  },

  async run(tenantId: string, id: string) {
    const s = await db.financeScenario.findFirst({ where: { id, tenantId } });
    if (!s) return null;
    // Deterministic "run": apply assumptions to compute an adjusted total and
    // variance vs base. Assumptions carry baseline/scenario values; each shifts
    // the base budget by (scenarioValue - baselineValue) percent when unit is
    // a percentage, otherwise by an absolute delta.
    const assumptions: any[] = Array.isArray(s.assumptions) ? s.assumptions : [];
    const baseTotal = Number(s.totalAdjustedBudget) || Number(s.totalVarianceFromBase) || 0;
    let adjusted = baseTotal;
    for (const a of assumptions) {
      const baseline = Number(a.baselineValue) || 0;
      const scenario = Number(a.scenarioValue) || 0;
      const unit = String(a.unit || '').toLowerCase();
      if (unit.includes('%') || unit.includes('percent')) {
        adjusted += adjusted * ((scenario - baseline) / 100);
      } else {
        adjusted += scenario - baseline;
      }
    }
    const variance = adjusted - baseTotal;
    const variancePct = baseTotal !== 0 ? (variance / baseTotal) * 100 : 0;
    return db.financeScenario.update({
      where: { id },
      data: {
        status: 'active',
        totalAdjustedBudget: Number(adjusted.toFixed(2)),
        totalVarianceFromBase: Number(variance.toFixed(2)),
        variancePercentage: Number(variancePct.toFixed(2)),
        lastRunAt: new Date(),
      },
    });
  },

  async remove(tenantId: string, id: string) {
    const existing = await db.financeScenario.findFirst({ where: { id, tenantId } });
    if (!existing) return false;
    await db.financeScenario.delete({ where: { id } });
    return true;
  },
};

// ---------------------------------------------------------------------------
// Contracts
// ---------------------------------------------------------------------------

export const ContractRepo = {
  async list(
    tenantId: string,
    opts: { status?: string; vendorId?: string; page?: number; pageSize?: number } = {}
  ) {
    const page = opts.page ?? 1;
    const pageSize = opts.pageSize ?? 100;
    const where: any = { tenantId };
    if (opts.status) where.status = opts.status;
    if (opts.vendorId) where.vendorId = opts.vendorId;
    const [items, total] = await Promise.all([
      db.financeContract.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.financeContract.count({ where }),
    ]);
    return toList(items, total, page, pageSize);
  },

  async get(tenantId: string, id: string) {
    return db.financeContract.findFirst({ where: { id, tenantId } });
  },

  async create(tenantId: string, userId: string, data: any) {
    return db.financeContract.create({
      data: {
        tenantId,
        contractCode: data.contractCode || genCode('CON'),
        contractName: data.contractName,
        vendorId: data.vendorId ?? null,
        vendorName: data.vendorName ?? null,
        contractType: data.contractType || 'fixed_price',
        status: data.status || 'draft',
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        autoRenew: data.autoRenew ?? false,
        renewalNoticeDays: data.renewalNoticeDays ?? null,
        totalContractValue: data.totalContractValue ?? 0,
        currency: data.currency || 'USD',
        paymentTerms: data.paymentTerms || 'net_30',
        totalSpent: data.totalSpent ?? 0,
        remainingValue: data.remainingValue ?? data.totalContractValue ?? 0,
        utilizationRate: data.utilizationRate ?? 0,
        servicesIncluded: data.servicesIncluded ?? null,
        paymentSchedule: data.paymentSchedule ?? null,
        deliverables: data.deliverables ?? null,
        kpis: data.kpis ?? null,
        amendments: data.amendments ?? null,
        documentUrl: data.documentUrl ?? null,
        createdBy: userId,
        updatedBy: userId,
      },
    });
  },

  async update(tenantId: string, userId: string, id: string, data: any) {
    const existing = await db.financeContract.findFirst({ where: { id, tenantId } });
    if (!existing) return null;
    const allowed = [
      'contractName',
      'vendorId',
      'vendorName',
      'contractType',
      'status',
      'autoRenew',
      'renewalNoticeDays',
      'totalContractValue',
      'currency',
      'paymentTerms',
      'totalSpent',
      'remainingValue',
      'utilizationRate',
      'servicesIncluded',
      'paymentSchedule',
      'deliverables',
      'kpis',
      'amendments',
      'documentUrl',
    ];
    const patch: any = { updatedBy: userId };
    for (const key of allowed) if (data[key] !== undefined) patch[key] = data[key];
    if (data.startDate) patch.startDate = new Date(data.startDate);
    if (data.endDate) patch.endDate = new Date(data.endDate);
    return db.financeContract.update({ where: { id }, data: patch });
  },

  async recordPayment(tenantId: string, id: string, scheduleId: string, invoiceNumber: string) {
    const c = await db.financeContract.findFirst({ where: { id, tenantId } });
    if (!c) return null;
    const schedule: any[] = Array.isArray(c.paymentSchedule) ? c.paymentSchedule : [];
    let paidAmount = 0;
    const updated = schedule.map((s) => {
      if (s.id === scheduleId) {
        paidAmount = Number(s.amount) || 0;
        return { ...s, paid: true, paidDate: new Date().toISOString(), invoiceNumber };
      }
      return s;
    });
    const totalSpent = Number(c.totalSpent) + paidAmount;
    const totalValue = Number(c.totalContractValue) || 0;
    return db.financeContract.update({
      where: { id },
      data: {
        paymentSchedule: updated,
        totalSpent,
        remainingValue: totalValue - totalSpent,
        utilizationRate:
          totalValue !== 0 ? Number(((totalSpent / totalValue) * 100).toFixed(2)) : 0,
      },
    });
  },

  async remove(tenantId: string, id: string) {
    const existing = await db.financeContract.findFirst({ where: { id, tenantId } });
    if (!existing) return false;
    await db.financeContract.delete({ where: { id } });
    return true;
  },
};

// ---------------------------------------------------------------------------
// Petty Cash: funds, transactions, reconciliations, policies
// ---------------------------------------------------------------------------

export const PettyCashRepo = {
  async listFunds(tenantId: string, opts: { page?: number; pageSize?: number } = {}) {
    const page = opts.page ?? 1;
    const pageSize = opts.pageSize ?? 100;
    const where: any = { tenantId };
    const [items, total] = await Promise.all([
      db.financePettyCashFund.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.financePettyCashFund.count({ where }),
    ]);
    return toList(items, total, page, pageSize);
  },

  async getFund(tenantId: string, id: string) {
    return db.financePettyCashFund.findFirst({ where: { id, tenantId } });
  },

  async createFund(tenantId: string, userId: string, data: any) {
    return db.financePettyCashFund.create({
      data: {
        tenantId,
        fundCode: data.fundCode || genCode('PCF'),
        fundName: data.fundName,
        status: data.status || 'active',
        department: data.department ?? null,
        location: data.location ?? null,
        custodian: data.custodian ?? null,
        custodianName: data.custodianName ?? null,
        initialBalance: data.initialBalance ?? 0,
        currentBalance: data.currentBalance ?? data.initialBalance ?? 0,
        fundLimit: data.fundLimit ?? 0,
        transactionLimit: data.transactionLimit ?? 0,
        minimumBalance: data.minimumBalance ?? 0,
        requireReceipt: data.requireReceipt ?? true,
        requireApproval: data.requireApproval ?? true,
        approvalThreshold: data.approvalThreshold ?? null,
        createdBy: userId,
        updatedBy: userId,
      },
    });
  },

  async updateFund(tenantId: string, userId: string, id: string, data: any) {
    const existing = await db.financePettyCashFund.findFirst({ where: { id, tenantId } });
    if (!existing) return null;
    const allowed = [
      'fundName',
      'status',
      'department',
      'location',
      'custodian',
      'custodianName',
      'currentBalance',
      'fundLimit',
      'transactionLimit',
      'minimumBalance',
      'requireReceipt',
      'requireApproval',
      'approvalThreshold',
    ];
    const patch: any = { updatedBy: userId };
    for (const key of allowed) if (data[key] !== undefined) patch[key] = data[key];
    return db.financePettyCashFund.update({ where: { id }, data: patch });
  },

  async listTransactions(
    tenantId: string,
    opts: { fundId?: string; page?: number; pageSize?: number } = {}
  ) {
    const page = opts.page ?? 1;
    const pageSize = opts.pageSize ?? 100;
    const where: any = { tenantId };
    if (opts.fundId) where.fundId = opts.fundId;
    const [items, total] = await Promise.all([
      db.financePettyCashTransaction.findMany({
        where,
        orderBy: { transactionDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.financePettyCashTransaction.count({ where }),
    ]);
    return toList(items, total, page, pageSize);
  },

  async createTransaction(tenantId: string, userId: string, data: any) {
    const fund = data.fundId
      ? await db.financePettyCashFund.findFirst({ where: { id: data.fundId, tenantId } })
      : null;
    const amount = Number(data.amount) || 0;
    const type = data.transactionType || 'disbursement';
    let balanceAfter = fund ? Number(fund.currentBalance) : Number(data.balanceAfter) || 0;
    if (fund) {
      balanceAfter =
        type === 'disbursement' || type === 'return'
          ? Number(fund.currentBalance) - amount
          : Number(fund.currentBalance) + amount;
    }
    const txn = await db.financePettyCashTransaction.create({
      data: {
        tenantId,
        transactionCode: data.transactionCode || genCode('PCT'),
        fundId: data.fundId,
        transactionType: type,
        transactionDate: data.transactionDate ? new Date(data.transactionDate) : new Date(),
        amount,
        category: data.category ?? null,
        description: data.description ?? null,
        requestedBy: userId,
        requestedByName: data.requestedByName ?? null,
        receiptNumber: data.receiptNumber ?? null,
        vendor: data.vendor ?? null,
        requiresApproval: data.requiresApproval ?? false,
        approvalStatus: data.requiresApproval ? 'pending' : null,
        balanceAfter,
        notes: data.notes ?? null,
        createdBy: userId,
      },
    });
    if (fund) {
      await db.financePettyCashFund.update({
        where: { id: fund.id },
        data: {
          currentBalance: balanceAfter,
          totalDisbursed:
            type === 'disbursement'
              ? Number(fund.totalDisbursed) + amount
              : Number(fund.totalDisbursed),
          totalReplenished:
            type === 'replenishment'
              ? Number(fund.totalReplenished) + amount
              : Number(fund.totalReplenished),
        },
      });
    }
    return txn;
  },

  async approveTransaction(tenantId: string, userId: string, id: string) {
    const existing = await db.financePettyCashTransaction.findFirst({ where: { id, tenantId } });
    if (!existing) return null;
    return db.financePettyCashTransaction.update({
      where: { id },
      data: { approvalStatus: 'approved', approvedBy: userId, approvedDate: new Date() },
    });
  },

  async listReconciliations(tenantId: string, opts: { page?: number; pageSize?: number } = {}) {
    const page = opts.page ?? 1;
    const pageSize = opts.pageSize ?? 100;
    const where: any = { tenantId };
    const [items, total] = await Promise.all([
      db.financePettyCashReconciliation.findMany({
        where,
        orderBy: { reconciliationDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.financePettyCashReconciliation.count({ where }),
    ]);
    return toList(items, total, page, pageSize);
  },

  async createReconciliation(tenantId: string, userId: string, data: any) {
    return db.financePettyCashReconciliation.create({
      data: {
        tenantId,
        reconciliationCode: data.reconciliationCode || genCode('REC'),
        fundId: data.fundId,
        fundName: data.fundName ?? null,
        reconciliationDate: data.reconciliationDate
          ? new Date(data.reconciliationDate)
          : new Date(),
        expectedBalance: data.expectedBalance ?? 0,
        actualBalance: data.actualBalance ?? 0,
        variance:
          data.variance ?? Number(data.actualBalance ?? 0) - Number(data.expectedBalance ?? 0),
        transactionCount: data.transactionCount ?? 0,
        totalDisbursements: data.totalDisbursements ?? 0,
        totalReplenishments: data.totalReplenishments ?? 0,
        unreconciledTransactions: data.unreconciledTransactions ?? 0,
        cashOnHand: data.cashOnHand ?? 0,
        receipts: data.receipts ?? 0,
        ious: data.ious ?? 0,
        status: data.status || 'in_progress',
        varianceExplanation: data.varianceExplanation ?? null,
        reconciledBy: userId,
        reconciledByName: data.reconciledByName ?? null,
        supportingDocuments: data.supportingDocuments ?? null,
        createdBy: userId,
      },
    });
  },

  // Policies (approval / category / spending-limit rules)
  async listPolicies(tenantId: string, opts: { policyType?: string } = {}) {
    const where: any = { tenantId };
    if (opts.policyType) where.policyType = opts.policyType;
    const items = await db.financePettyCashPolicy.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return toList(items, items.length, 1, items.length || 1);
  },

  async createPolicy(tenantId: string, userId: string, data: any) {
    return db.financePettyCashPolicy.create({
      data: {
        tenantId,
        policyType: data.policyType || 'approval',
        name: data.name,
        description: data.description ?? null,
        threshold: data.threshold ?? null,
        approverRole: data.approverRole ?? null,
        monthlyLimit: data.monthlyLimit ?? null,
        requireReceipt: data.requireReceipt ?? true,
        active: data.active ?? true,
        config: data.config ?? null,
        createdBy: userId,
        updatedBy: userId,
      },
    });
  },

  async updatePolicy(tenantId: string, userId: string, id: string, data: any) {
    const existing = await db.financePettyCashPolicy.findFirst({ where: { id, tenantId } });
    if (!existing) return null;
    const allowed = [
      'policyType',
      'name',
      'description',
      'threshold',
      'approverRole',
      'monthlyLimit',
      'requireReceipt',
      'active',
      'config',
    ];
    const patch: any = { updatedBy: userId };
    for (const key of allowed) if (data[key] !== undefined) patch[key] = data[key];
    return db.financePettyCashPolicy.update({ where: { id }, data: patch });
  },

  async removePolicy(tenantId: string, id: string) {
    const existing = await db.financePettyCashPolicy.findFirst({ where: { id, tenantId } });
    if (!existing) return false;
    await db.financePettyCashPolicy.delete({ where: { id } });
    return true;
  },
};

// ---------------------------------------------------------------------------
// Finance Assets (capital / operational register)
// ---------------------------------------------------------------------------

export const AssetRepo = {
  async list(
    tenantId: string,
    opts: { assetType?: string; page?: number; pageSize?: number } = {}
  ) {
    const page = opts.page ?? 1;
    const pageSize = opts.pageSize ?? 100;
    const where: any = { tenantId };
    if (opts.assetType) where.assetType = opts.assetType;
    const [items, total] = await Promise.all([
      db.financeAsset.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.financeAsset.count({ where }),
    ]);
    return toList(items, total, page, pageSize);
  },

  async get(tenantId: string, id: string) {
    return db.financeAsset.findFirst({ where: { id, tenantId } });
  },

  async create(tenantId: string, userId: string, data: any) {
    return db.financeAsset.create({
      data: {
        tenantId,
        assetCode: data.assetCode || genCode('AST'),
        assetName: data.assetName,
        assetType: data.assetType || 'capital',
        status: data.status || 'active',
        description: data.description ?? null,
        purchasePrice: data.purchasePrice ?? 0,
        currentValue: data.currentValue ?? data.purchasePrice ?? 0,
        depreciationMethod: data.depreciationMethod || 'straight_line',
        usefulLife: data.usefulLife ?? 5,
        salvageValue: data.salvageValue ?? 0,
        accumulatedDepreciation: data.accumulatedDepreciation ?? 0,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        vendor: data.vendor ?? null,
        invoiceNumber: data.invoiceNumber ?? null,
        warrantyExpiryDate: data.warrantyExpiryDate ? new Date(data.warrantyExpiryDate) : null,
        assignedTo: data.assignedTo ?? null,
        assignedToName: data.assignedToName ?? null,
        department: data.department ?? null,
        costCenter: data.costCenter ?? null,
        location: data.location ?? null,
        serialNumber: data.serialNumber ?? null,
        quantity: data.quantity ?? 1,
        reorderPoint: data.reorderPoint ?? 0,
        unitCost: data.unitCost ?? 0,
        supplier: data.supplier ?? null,
        lastRestocked: data.lastRestocked ? new Date(data.lastRestocked) : null,
        maintenanceSchedule: data.maintenanceSchedule ?? null,
        maintenanceHistory: data.maintenanceHistory ?? null,
        notes: data.notes ?? null,
        createdBy: userId,
        updatedBy: userId,
      },
    });
  },

  async update(tenantId: string, userId: string, id: string, data: any) {
    const existing = await db.financeAsset.findFirst({ where: { id, tenantId } });
    if (!existing) return null;
    const allowed = [
      'assetName',
      'assetType',
      'status',
      'description',
      'purchasePrice',
      'currentValue',
      'depreciationMethod',
      'usefulLife',
      'salvageValue',
      'accumulatedDepreciation',
      'vendor',
      'invoiceNumber',
      'assignedTo',
      'assignedToName',
      'department',
      'costCenter',
      'location',
      'serialNumber',
      'quantity',
      'reorderPoint',
      'unitCost',
      'supplier',
      'maintenanceSchedule',
      'maintenanceHistory',
      'notes',
    ];
    const patch: any = { updatedBy: userId };
    for (const key of allowed) if (data[key] !== undefined) patch[key] = data[key];
    if (data.purchaseDate) patch.purchaseDate = new Date(data.purchaseDate);
    if (data.warrantyExpiryDate) patch.warrantyExpiryDate = new Date(data.warrantyExpiryDate);
    if (data.lastRestocked) patch.lastRestocked = new Date(data.lastRestocked);
    return db.financeAsset.update({ where: { id }, data: patch });
  },

  async calculateDepreciation(tenantId: string, id: string) {
    const a = await db.financeAsset.findFirst({ where: { id, tenantId } });
    if (!a) return null;
    const cost = Number(a.purchasePrice) || 0;
    const salvage = Number(a.salvageValue) || 0;
    const life = Number(a.usefulLife) || 1;
    let annual = 0;
    if (a.depreciationMethod === 'declining_balance') {
      const rate = 2 / life;
      annual = (cost - Number(a.accumulatedDepreciation)) * rate;
    } else if (a.depreciationMethod === 'straight_line') {
      annual = (cost - salvage) / life;
    }
    annual = Math.max(0, Number(annual.toFixed(2)));
    const newAccum = Math.min(cost - salvage, Number(a.accumulatedDepreciation) + annual);
    await db.financeAsset.update({
      where: { id },
      data: { accumulatedDepreciation: newAccum, currentValue: Math.max(salvage, cost - newAccum) },
    });
    return annual;
  },

  async remove(tenantId: string, id: string) {
    const existing = await db.financeAsset.findFirst({ where: { id, tenantId } });
    if (!existing) return false;
    await db.financeAsset.delete({ where: { id } });
    return true;
  },
};

// ---------------------------------------------------------------------------
// Cost Centers (reuses existing aura_cost_center, no tenantId column)
// ---------------------------------------------------------------------------

export const CostCenterRepo = {
  async list(_tenantId: string, opts: { fiscalYear?: number } = {}) {
    const where: any = { isDeleted: false };
    if (opts.fiscalYear) where.fiscalYear = opts.fiscalYear;
    const items = await prisma.costCenter.findMany({ where, orderBy: { code: 'asc' } });
    return toList(items, items.length, 1, items.length || 1);
  },

  async create(userId: string, data: any) {
    return prisma.costCenter.create({
      data: {
        code: data.code || genCode('CC'),
        name: data.name,
        fiscalYear: data.fiscalYear ?? new Date().getFullYear(),
        allocatedBudget: data.allocatedBudget ?? 0,
        spentBudget: data.spentBudget ?? 0,
        createdBy: userId,
        updatedBy: userId,
      },
    });
  },

  async update(id: string, userId: string, data: any) {
    const existing = await prisma.costCenter.findFirst({ where: { id, isDeleted: false } });
    if (!existing) return null;
    const patch: any = { updatedBy: userId };
    for (const key of ['name', 'fiscalYear', 'allocatedBudget', 'spentBudget'] as const) {
      if (data[key] !== undefined) patch[key] = data[key];
    }
    return prisma.costCenter.update({ where: { id }, data: patch });
  },
};
