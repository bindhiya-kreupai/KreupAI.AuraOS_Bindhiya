import { prisma } from '@aura/database';
import { BaseService } from './base.service';

export type ExpenseStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID' | 'CANCELED';

export interface LineItemInput {
  category: string;
  description?: string;
  amount: number;
  currency?: string;
  expenseDate: Date;
  receiptUrl?: string;
  merchant?: string;
}

export interface PolicyDecision {
  required: 'manager' | 'finance' | 'auto';
  warnings: string[];
  failures: string[];
}

const STATUS_TRANSITIONS: Record<ExpenseStatus, ExpenseStatus[]> = {
  DRAFT: ['SUBMITTED', 'CANCELED'],
  SUBMITTED: ['APPROVED', 'REJECTED', 'CANCELED'],
  APPROVED: ['PAID', 'CANCELED'],
  REJECTED: ['DRAFT'],
  PAID: [],
  CANCELED: [],
};

export class InvalidExpenseTransitionError extends Error {
  constructor(from: ExpenseStatus, to: ExpenseStatus) {
    super(`Invalid expense transition: ${from} → ${to}`);
    this.name = 'InvalidExpenseTransitionError';
  }
}

export class PolicyViolationError extends Error {
  failures: string[];
  constructor(failures: string[]) {
    super(`Expense violates policy: ${failures.join('; ')}`);
    this.name = 'PolicyViolationError';
    this.failures = failures;
  }
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export class ExpenseService extends BaseService {
  constructor() {
    super('ExpenseService');
  }

  canTransition(from: ExpenseStatus, to: ExpenseStatus): boolean {
    return (STATUS_TRANSITIONS[from] ?? []).includes(to);
  }

  assertTransition(from: ExpenseStatus, to: ExpenseStatus): void {
    if (!this.canTransition(from, to)) throw new InvalidExpenseTransitionError(from, to);
  }

  /**
   * Pure policy evaluation. Returns the approval lane the claim needs and a
   * list of warnings (recoverable) and failures (block submission).
   *
   * Failures: per-line amount exceeds policy.categoryCaps[category] AND no
   * justification — currently treated as warning, not failure; failure is
   * reserved for missing receipt above receiptRequiredOver.
   */
  evaluatePolicy(
    items: LineItemInput[],
    policy: {
      categoryCaps?: Record<string, number>;
      receiptRequiredOver?: number;
      requiresManagerOver?: number;
      requiresFinanceOver?: number;
    } | null
  ): PolicyDecision {
    const warnings: string[] = [];
    const failures: string[] = [];

    const total = round2(items.reduce((s, i) => s + Number(i.amount || 0), 0));

    if (policy) {
      const receiptThreshold = Number(policy.receiptRequiredOver ?? 25);
      const caps = policy.categoryCaps ?? {};
      for (const item of items) {
        if (Number(item.amount) > receiptThreshold && !item.receiptUrl) {
          failures.push(
            `Receipt required for ${item.category} line of ${item.amount} (threshold ${receiptThreshold})`
          );
        }
        const cap = Number(caps[item.category] ?? 0);
        if (cap > 0 && Number(item.amount) > cap) {
          warnings.push(
            `Line ${item.category} ${item.amount} exceeds policy cap ${cap}; needs justification`
          );
        }
      }
      const financeThreshold = Number(policy.requiresFinanceOver ?? 1000);
      const managerThreshold = Number(policy.requiresManagerOver ?? 100);
      if (total > financeThreshold) return { required: 'finance', warnings, failures };
      if (total > managerThreshold) return { required: 'manager', warnings, failures };
      return { required: 'auto', warnings, failures };
    }

    return { required: 'manager', warnings, failures };
  }

  async listClaims(params: {
    tenantId: string;
    employeeId?: string;
    status?: ExpenseStatus;
    startDate?: Date;
    endDate?: Date;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 20, 100);
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { tenantId: params.tenantId };
    if (params.employeeId) where.employeeId = params.employeeId;
    if (params.status) where.status = params.status;
    if (params.startDate || params.endDate) {
      const range: Record<string, Date> = {};
      if (params.startDate) range.gte = params.startDate;
      if (params.endDate) range.lte = params.endDate;
      where.createdAt = range;
    }
    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      prisma.expenseClaim.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: { select: { items: true } },
        },
      }),
      prisma.expenseClaim.count({ where }),
    ]);
    return { items, total, page, pageSize: limit, hasNextPage: skip + items.length < total };
  }

  async getById(id: string, tenantId: string) {
    return prisma.expenseClaim.findFirst({
      where: { id, tenantId },
      include: { items: true, policy: true },
    });
  }

  async createDraft(input: {
    tenantId: string;
    employeeId: string;
    title: string;
    description?: string;
    currency?: string;
    policyId?: string;
    items?: LineItemInput[];
    actorId: string;
  }) {
    const total = round2((input.items ?? []).reduce((s, i) => s + Number(i.amount || 0), 0));
    return prisma.expenseClaim.create({
      data: {
        tenantId: input.tenantId,
        employeeId: input.employeeId,
        title: input.title,
        description: input.description ?? null,
        currency: input.currency ?? 'USD',
        totalAmount: total,
        amount: total,
        policyId: input.policyId ?? null,
        status: 'DRAFT',
        createdBy: input.actorId,
        items: input.items
          ? {
              create: input.items.map((i) => ({
                category: i.category,
                description: i.description ?? null,
                amount: i.amount,
                currency: i.currency ?? input.currency ?? 'USD',
                expenseDate: i.expenseDate,
                receiptUrl: i.receiptUrl ?? null,
                merchant: i.merchant ?? null,
              })),
            }
          : undefined,
      },
      include: { items: true },
    });
  }

  async submit(id: string, tenantId: string, actorId: string) {
    const claim = await prisma.expenseClaim.findFirst({
      where: { id, tenantId },
      include: { items: true, policy: true },
    });
    if (!claim) return null;
    this.assertTransition(claim.status as ExpenseStatus, 'SUBMITTED');

    const decision = this.evaluatePolicy(
      claim.items.map((i) => ({
        category: i.category,
        description: i.description ?? undefined,
        amount: Number(i.amount),
        currency: i.currency,
        expenseDate: i.expenseDate,
        receiptUrl: i.receiptUrl ?? undefined,
        merchant: i.merchant ?? undefined,
      })),
      claim.policy
        ? {
            categoryCaps: (claim.policy.categoryCaps as Record<string, number>) ?? {},
            receiptRequiredOver: Number(claim.policy.receiptRequiredOver),
            requiresManagerOver: Number(claim.policy.requiresManagerOver),
            requiresFinanceOver: Number(claim.policy.requiresFinanceOver),
          }
        : null
    );

    if (decision.failures.length > 0) {
      throw new PolicyViolationError(decision.failures);
    }

    return prisma.expenseClaim.update({
      where: { id },
      data: { status: 'SUBMITTED', submittedAt: new Date(), updatedBy: actorId },
    });
  }

  async approve(id: string, tenantId: string, actorId: string) {
    const claim = await prisma.expenseClaim.findFirst({ where: { id, tenantId } });
    if (!claim) return null;
    this.assertTransition(claim.status as ExpenseStatus, 'APPROVED');
    return prisma.expenseClaim.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: actorId,
        approvedAt: new Date(),
        updatedBy: actorId,
      },
    });
  }

  async reject(id: string, tenantId: string, actorId: string, reason: string) {
    const claim = await prisma.expenseClaim.findFirst({ where: { id, tenantId } });
    if (!claim) return null;
    this.assertTransition(claim.status as ExpenseStatus, 'REJECTED');
    return prisma.expenseClaim.update({
      where: { id },
      data: {
        status: 'REJECTED',
        approvedBy: actorId, // who decided
        approvedAt: new Date(),
        rejectionReason: reason,
        updatedBy: actorId,
      },
    });
  }

  async cancel(id: string, tenantId: string, actorId: string) {
    const claim = await prisma.expenseClaim.findFirst({ where: { id, tenantId } });
    if (!claim) return null;
    this.assertTransition(claim.status as ExpenseStatus, 'CANCELED');
    return prisma.expenseClaim.update({
      where: { id },
      data: { status: 'CANCELED', updatedBy: actorId },
    });
  }

  /**
   * Mark APPROVED claim as PAID. paidReference must be the real payroll /
   * payment-rail reference — no placeholders allowed (mirrors the
   * statutory-report submission contract that closes #85).
   */
  async markPaid(id: string, tenantId: string, actorId: string, paidReference: string) {
    if (!paidReference || paidReference.trim().length < 3) {
      throw new Error('A real payment reference is required (no placeholders).');
    }
    const claim = await prisma.expenseClaim.findFirst({ where: { id, tenantId } });
    if (!claim) return null;
    this.assertTransition(claim.status as ExpenseStatus, 'PAID');
    return prisma.expenseClaim.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        paidReference,
        updatedBy: actorId,
      },
    });
  }

  // ------- Policy CRUD -------

  async listPolicies(tenantId: string) {
    return prisma.expensePolicy.findMany({
      where: { tenantId, isDeleted: false, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async createPolicy(input: {
    tenantId: string;
    name: string;
    description?: string;
    countryCode?: string;
    categoryCaps?: Record<string, number>;
    receiptRequiredOver?: number;
    requiresManagerOver?: number;
    requiresFinanceOver?: number;
    perDiemRates?: Record<string, number>;
    actorId: string;
  }) {
    return prisma.expensePolicy.create({
      data: {
        tenantId: input.tenantId,
        name: input.name,
        description: input.description ?? null,
        countryCode: input.countryCode ?? null,
        categoryCaps: (input.categoryCaps ?? {}) as object,
        receiptRequiredOver: input.receiptRequiredOver ?? 25,
        requiresManagerOver: input.requiresManagerOver ?? 100,
        requiresFinanceOver: input.requiresFinanceOver ?? 1000,
        perDiemRates: (input.perDiemRates ?? {}) as object,
        isActive: true,
        createdBy: input.actorId,
      },
    });
  }
}

export const expenseService = new ExpenseService();
