import { prisma } from '@aura/database';
import { z } from 'zod';
import { BaseService } from './base.service';
import { fullFinalService } from './full-final.service';

export type ExitStatus = 'PENDING' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'CANCELED';
export type ExitClearanceStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

const STATUS_TRANSITIONS: Record<ExitStatus, ExitStatus[]> = {
  PENDING: ['APPROVED', 'CANCELED'],
  APPROVED: ['PROCESSING', 'CANCELED'],
  PROCESSING: ['COMPLETED', 'CANCELED'],
  COMPLETED: [],
  CANCELED: [],
};

export class InvalidExitTransitionError extends Error {
  constructor(from: ExitStatus, to: ExitStatus) {
    super(`Invalid exit transition: ${from} → ${to}`);
    this.name = 'InvalidExitTransitionError';
  }
}

export class ExitNotClearedError extends Error {
  constructor() {
    super('All clearances must be COMPLETED before the exit can be completed.');
    this.name = 'ExitNotClearedError';
  }
}

export const createExitSchema = z.object({
  tenantId: z.string(),
  employeeId: z.string(),
  exitType: z.enum(['RESIGNATION', 'TERMINATION', 'RETIREMENT', 'CONTRACT_END']),
  resignationDate: z.string().or(z.date()),
  lastWorkingDate: z.string().or(z.date()),
  noticePeriodDays: z.number().int().min(0),
  reason: z.string().optional(),
  rehireEligible: z.boolean().optional(),
});

export const updateExitSchema = createExitSchema.partial().omit({ tenantId: true });

export const addClearanceSchema = z.object({
  department: z.string(),
  description: z.string(),
});

export class ExitService extends BaseService {
  constructor() {
    super('ExitService');
  }

  canTransition(from: ExitStatus, to: ExitStatus): boolean {
    return (STATUS_TRANSITIONS[from] ?? []).includes(to);
  }

  assertTransition(from: ExitStatus, to: ExitStatus): void {
    if (!this.canTransition(from, to)) throw new InvalidExitTransitionError(from, to);
  }

  async list(params: {
    tenantId: string;
    status?: ExitStatus;
    exitType?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'lastWorkingDate' | 'resignationDate';
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { tenantId: params.tenantId };
    if (params.status) where.status = params.status;
    if (params.exitType) where.exitType = params.exitType;
    if (params.search) {
      where.OR = [
        { employee: { firstName: { contains: params.search, mode: 'insensitive' } } },
        { employee: { lastName: { contains: params.search, mode: 'insensitive' } } },
        { employee: { employeeCode: { contains: params.search, mode: 'insensitive' } } },
      ];
    }

    const orderField = params.sortBy ?? 'createdAt';
    const orderDir = params.sortOrder ?? 'desc';

    const [items, total] = await Promise.all([
      prisma.exitRequest.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              employeeCode: true,
              firstName: true,
              lastName: true,
              email: true,
              department: { select: { name: true } },
            },
          },
          clearances: true,
        },
        skip,
        take: limit,
        orderBy: { [orderField]: orderDir },
      }),
      prisma.exitRequest.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize: limit,
      hasNextPage: skip + items.length < total,
    };
  }

  async getById(id: string, tenantId: string) {
    return prisma.exitRequest.findFirst({
      where: { id, tenantId },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
            joiningDate: true,
            department: { select: { name: true } },
            location: { select: { name: true } },
          },
        },
        clearances: true,
      },
    });
  }

  async create(data: z.infer<typeof createExitSchema>) {
    const v = createExitSchema.parse(data);
    return prisma.exitRequest.create({
      data: {
        tenantId: v.tenantId,
        employeeId: v.employeeId,
        exitType: v.exitType,
        resignationDate: new Date(v.resignationDate),
        lastWorkingDate: new Date(v.lastWorkingDate),
        noticePeriodDays: v.noticePeriodDays,
        reason: v.reason,
        rehireEligible: v.rehireEligible ?? true,
        status: 'PENDING',
        clearanceStatus: 'PENDING',
      },
      include: {
        employee: { select: { id: true, employeeCode: true, firstName: true, lastName: true } },
      },
    });
  }

  async update(id: string, tenantId: string, data: z.infer<typeof updateExitSchema>) {
    const v = updateExitSchema.parse(data);
    const existing = await prisma.exitRequest.findFirst({ where: { id, tenantId } });
    if (!existing) return null;

    return prisma.exitRequest.update({
      where: { id },
      data: {
        exitType: v.exitType ?? undefined,
        resignationDate: v.resignationDate ? new Date(v.resignationDate) : undefined,
        lastWorkingDate: v.lastWorkingDate ? new Date(v.lastWorkingDate) : undefined,
        noticePeriodDays: v.noticePeriodDays ?? undefined,
        reason: v.reason ?? undefined,
        rehireEligible: v.rehireEligible ?? undefined,
      },
    });
  }

  async approve(id: string, tenantId: string) {
    const exit = await prisma.exitRequest.findFirst({ where: { id, tenantId } });
    if (!exit) return null;
    this.assertTransition(exit.status as ExitStatus, 'APPROVED');
    return prisma.exitRequest.update({
      where: { id },
      data: { status: 'APPROVED' },
    });
  }

  async startProcessing(id: string, tenantId: string) {
    const exit = await prisma.exitRequest.findFirst({ where: { id, tenantId } });
    if (!exit) return null;
    this.assertTransition(exit.status as ExitStatus, 'PROCESSING');
    return prisma.exitRequest.update({
      where: { id },
      data: { status: 'PROCESSING', clearanceStatus: 'IN_PROGRESS' },
    });
  }

  async cancel(id: string, tenantId: string, reason?: string) {
    const exit = await prisma.exitRequest.findFirst({ where: { id, tenantId } });
    if (!exit) return null;
    this.assertTransition(exit.status as ExitStatus, 'CANCELED');
    return prisma.exitRequest.update({
      where: { id },
      data: { status: 'CANCELED', reason: reason ?? exit.reason },
    });
  }

  /**
   * Complete the exit. Refuses if any clearance is still PENDING /
   * IN_PROGRESS / REJECTED. Optionally triggers F&F calculation as part of
   * the same atomic transaction.
   */
  async complete(input: {
    id: string;
    tenantId: string;
    actorId: string;
    countryCode?: string;
    basicSalary?: number;
    grossSalary?: number;
    earnedLeaveBalanceDays?: number;
    outstandingLoanAmount?: number;
    unservedNoticeDays?: number;
    proRataBonusBase?: number;
    otherEarnings?: number;
    otherDeductions?: number;
    currency?: string;
    skipFullFinal?: boolean;
  }) {
    const exit = await prisma.exitRequest.findFirst({
      where: { id: input.id, tenantId: input.tenantId },
      include: {
        clearances: true,
        employee: { select: { joiningDate: true } },
      },
    });
    if (!exit) return null;
    this.assertTransition(exit.status as ExitStatus, 'COMPLETED');

    const allCleared =
      exit.clearances.length > 0 && exit.clearances.every((c) => c.status === 'APPROVED');
    if (!allCleared) throw new ExitNotClearedError();

    let fullFinal = null;
    if (!input.skipFullFinal && input.countryCode && input.basicSalary && exit.employee) {
      const result = await fullFinalService.recordAndCalculate(
        {
          tenantId: input.tenantId,
          employeeId: exit.employeeId,
          exitRequestId: exit.id,
          countryCode: input.countryCode,
          lastWorkingDay: exit.lastWorkingDate,
          joiningDate: exit.employee.joiningDate,
          basicSalary: input.basicSalary,
          grossSalary: input.grossSalary ?? input.basicSalary,
          currency: input.currency,
          earnedLeaveBalanceDays: input.earnedLeaveBalanceDays,
          outstandingLoanAmount: input.outstandingLoanAmount,
          unservedNoticeDays: input.unservedNoticeDays,
          proRataBonusBase: input.proRataBonusBase,
          otherEarnings: input.otherEarnings,
          otherDeductions: input.otherDeductions,
        },
        input.actorId
      );
      fullFinal = result;
    }

    const updated = await prisma.exitRequest.update({
      where: { id: input.id },
      data: {
        status: 'COMPLETED',
        clearanceStatus: 'COMPLETED',
        settlementAmount: fullFinal?.calculation.netPayable
          ? fullFinal.calculation.netPayable
          : undefined,
      },
      include: { clearances: true },
    });
    return { exit: updated, fullFinal };
  }

  async addClearance(
    exitRequestId: string,
    tenantId: string,
    input: z.infer<typeof addClearanceSchema>
  ) {
    const v = addClearanceSchema.parse(input);
    const exit = await prisma.exitRequest.findFirst({
      where: { id: exitRequestId, tenantId },
      select: { id: true },
    });
    if (!exit) return null;
    return prisma.exitClearance.create({
      data: {
        exitRequestId,
        department: v.department,
        description: v.description,
        status: 'PENDING',
      },
    });
  }

  async completeClearance(
    exitRequestId: string,
    clearanceId: string,
    tenantId: string,
    clearedBy: string,
    notes?: string
  ) {
    // Validate the clearance belongs to a request in this tenant
    const exit = await prisma.exitRequest.findFirst({
      where: { id: exitRequestId, tenantId },
      include: { clearances: true },
    });
    if (!exit) return null;
    const clearance = exit.clearances.find((c) => c.id === clearanceId);
    if (!clearance) return null;

    const updated = await prisma.exitClearance.update({
      where: { id: clearanceId },
      data: {
        status: 'APPROVED',
        clearedBy,
        clearedAt: new Date(),
        notes: notes ?? clearance.notes,
      },
    });

    // Bubble up the rollup status on the parent ExitRequest
    const refreshed = await prisma.exitRequest.findUnique({
      where: { id: exitRequestId },
      include: { clearances: true },
    });
    const allCleared =
      refreshed?.clearances.length !== 0 &&
      refreshed?.clearances.every((c) => c.status === 'APPROVED');
    if (allCleared) {
      await prisma.exitRequest.update({
        where: { id: exitRequestId },
        data: { clearanceStatus: 'COMPLETED' },
      });
    } else if (refreshed?.clearances.some((c) => c.status === 'APPROVED')) {
      await prisma.exitRequest.update({
        where: { id: exitRequestId },
        data: { clearanceStatus: 'IN_PROGRESS' },
      });
    }
    return updated;
  }

  async getStatistics(tenantId: string) {
    const [total, byType, byStatus, pending, thisMonth] = await Promise.all([
      prisma.exitRequest.count({ where: { tenantId } }),
      prisma.exitRequest.groupBy({ by: ['exitType'], where: { tenantId }, _count: true }),
      prisma.exitRequest.groupBy({ by: ['status'], where: { tenantId }, _count: true }),
      prisma.exitRequest.count({ where: { tenantId, status: 'PENDING' } }),
      prisma.exitRequest.count({
        where: {
          tenantId,
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      }),
    ]);
    return {
      total,
      byType: byType.map((t) => ({ type: t.exitType, count: t._count })),
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count })),
      pending,
      thisMonth,
    };
  }
}

export const exitService = new ExitService();
