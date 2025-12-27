/**
 * Leave Management Service
 * Handles leave requests, balances, policies, and calendar
 */

import { prisma } from '@aura/database';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createLeaveRequestSchema = z.object({
  tenantId: z.string(),
  employeeId: z.string(),
  leaveTypeId: z.string(),
  policyId: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  totalDays: z.coerce.number(),
  halfDayStart: z.boolean().optional(),
  halfDayEnd: z.boolean().optional(),
  reason: z.string().min(10),
  contactNumber: z.string().optional(),
  addressDuringLeave: z.string().optional(),
  delegateToEmployeeId: z.string().optional(),
  documents: z.any().optional(),
});

const updateLeaveRequestSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  totalDays: z.coerce.number().optional(),
  halfDayStart: z.boolean().optional(),
  halfDayEnd: z.boolean().optional(),
  reason: z.string().optional(),
  contactNumber: z.string().optional(),
  addressDuringLeave: z.string().optional(),
  delegateToEmployeeId: z.string().optional(),
});

const createLeavePolicySchema = z.object({
  tenantId: z.string(),
  companyId: z.string().optional(),
  countryCode: z.string().optional(),
  code: z.string(),
  name: z.string(),
  nameAr: z.string().optional(),
  leaveTypeId: z.string(),
  employmentTypes: z.any().optional(),
  minServiceMonths: z.number().optional(),
  annualEntitlement: z.coerce.number(),
  accrualType: z.enum(['ANNUAL', 'MONTHLY', 'QUARTERLY', 'TENURE']).optional(),
  accrualRate: z.coerce.number().optional(),
  allowCarryForward: z.boolean().optional(),
  maxCarryForwardDays: z.coerce.number().optional(),
  carryForwardExpiryMonths: z.number().optional(),
  allowEncashment: z.boolean().optional(),
  maxEncashmentDays: z.coerce.number().optional(),
  encashmentRate: z.coerce.number().optional(),
  allowNegativeBalance: z.boolean().optional(),
  maxNegativeDays: z.coerce.number().optional(),
  minConsecutiveDays: z.number().optional(),
  maxConsecutiveDays: z.number().optional(),
  advanceNoticeDays: z.number().optional(),
  requiresApproval: z.boolean().optional(),
  requiresDocument: z.boolean().optional(),
  proRataOnJoining: z.boolean().optional(),
  proRataOnExit: z.boolean().optional(),
});

const createLeaveBalanceSchema = z.object({
  tenantId: z.string(),
  employeeId: z.string(),
  policyId: z.string(),
  leaveYear: z.number(),
  openingBalance: z.coerce.number().optional(),
  accrued: z.coerce.number().optional(),
  taken: z.coerce.number().optional(),
  adjusted: z.coerce.number().optional(),
  encashed: z.coerce.number().optional(),
  carriedForward: z.coerce.number().optional(),
  lapsed: z.coerce.number().optional(),
  currentBalance: z.coerce.number().optional(),
});

const createLeaveEncashmentSchema = z.object({
  tenantId: z.string(),
  employeeId: z.string(),
  leaveTypeId: z.string(),
  policyId: z.string(),
  requestedDays: z.coerce.number(),
  eligibleDays: z.coerce.number(),
  calculationBasis: z.enum(['BASIC', 'GROSS']),
  dailyRate: z.coerce.number(),
  totalAmount: z.coerce.number(),
  encashmentRate: z.coerce.number().optional(),
  trigger: z.enum(['YEAR_END', 'ON_RESIGNATION', 'ON_TERMINATION', 'ON_REQUEST']),
  reason: z.string().optional(),
});

// ============================================================================
// LEAVE REQUEST SERVICE
// ============================================================================

export class LeaveService {
  // --------------------------------------------------------------------------
  // Leave Requests
  // --------------------------------------------------------------------------

  static async findAllRequests(filter: any = {}) {
    const {
      tenantId,
      employeeId,
      status,
      leaveTypeId,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = filter;

    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;
    if (leaveTypeId) where.leaveTypeId = leaveTypeId;
    if (startDate) where.startDate = { gte: new Date(startDate) };
    if (endDate) where.endDate = { lte: new Date(endDate) };

    const [total, data] = await Promise.all([
      prisma.leaveRequest.count({ where }),
      prisma.leaveRequest.findMany({
        where,
        orderBy: { appliedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async findRequestById(id: string, tenantId: string) {
    return prisma.leaveRequest.findFirst({
      where: { id, tenantId },
    });
  }

  static async createRequest(data: z.infer<typeof createLeaveRequestSchema>) {
    const validated = createLeaveRequestSchema.parse(data);
    return prisma.leaveRequest.create({
      data: {
        ...validated,
        startDate: new Date(validated.startDate),
        endDate: new Date(validated.endDate),
      },
    });
  }

  static async updateRequest(
    id: string,
    tenantId: string,
    data: z.infer<typeof updateLeaveRequestSchema>
  ) {
    const validated = updateLeaveRequestSchema.parse(data);

    const updateData: any = { ...validated };
    if (validated.startDate) updateData.startDate = new Date(validated.startDate);
    if (validated.endDate) updateData.endDate = new Date(validated.endDate);

    return prisma.leaveRequest.update({
      where: { id },
      data: updateData,
    });
  }

  static async deleteRequest(id: string, tenantId: string) {
    return prisma.leaveRequest.delete({
      where: { id },
    });
  }

  static async approveRequest(id: string, tenantId: string, approvedBy: string) {
    const request = await prisma.leaveRequest.findFirst({
      where: { id, tenantId },
    });

    if (!request) throw new Error('Leave request not found');
    if (request.status !== 'PENDING') throw new Error('Leave request already processed');

    // Update leave request
    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy,
        approvedAt: new Date(),
      },
    });

    // Deduct from balance
    if (request.policyId && !request.balanceDeducted) {
      const balance = await prisma.leaveBalance.findFirst({
        where: {
          tenantId,
          employeeId: request.employeeId,
          policyId: request.policyId,
        },
      });

      if (balance) {
        const taken = Number(balance.taken) + Number(request.totalDays);
        const currentBalance = Number(balance.currentBalance) - Number(request.totalDays);

        await prisma.leaveBalance.update({
          where: { id: balance.id },
          data: {
            taken,
            currentBalance,
            lastUpdated: new Date(),
          },
        });

        await prisma.leaveRequest.update({
          where: { id },
          data: {
            balanceDeducted: true,
            balanceId: balance.id,
          },
        });
      }
    }

    return updated;
  }

  static async rejectRequest(
    id: string,
    tenantId: string,
    rejectedBy: string,
    rejectionReason: string
  ) {
    const request = await prisma.leaveRequest.findFirst({
      where: { id, tenantId },
    });

    if (!request) throw new Error('Leave request not found');
    if (request.status !== 'PENDING') throw new Error('Leave request already processed');

    return prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedBy,
        rejectedAt: new Date(),
        rejectionReason,
      },
    });
  }

  static async cancelRequest(
    id: string,
    tenantId: string,
    cancelledBy: string,
    cancellationReason: string
  ) {
    const request = await prisma.leaveRequest.findFirst({
      where: { id, tenantId },
    });

    if (!request) throw new Error('Leave request not found');
    if (!['PENDING', 'APPROVED'].includes(request.status)) {
      throw new Error('Cannot cancel this leave request');
    }

    // Restore balance if already deducted
    if (request.balanceDeducted && request.balanceId) {
      const balance = await prisma.leaveBalance.findUnique({
        where: { id: request.balanceId },
      });

      if (balance) {
        const taken = Number(balance.taken) - Number(request.totalDays);
        const currentBalance = Number(balance.currentBalance) + Number(request.totalDays);

        await prisma.leaveBalance.update({
          where: { id: balance.id },
          data: {
            taken,
            currentBalance,
            lastUpdated: new Date(),
          },
        });
      }
    }

    return prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledBy,
        cancelledAt: new Date(),
        cancellationReason,
        balanceDeducted: false,
      },
    });
  }

  static async getRequestStatistics(tenantId: string, employeeId?: string) {
    const where: any = { tenantId };
    if (employeeId) where.employeeId = employeeId;

    const [total, pending, approved, rejected, cancelled] = await Promise.all([
      prisma.leaveRequest.count({ where }),
      prisma.leaveRequest.count({ where: { ...where, status: 'PENDING' } }),
      prisma.leaveRequest.count({ where: { ...where, status: 'APPROVED' } }),
      prisma.leaveRequest.count({ where: { ...where, status: 'REJECTED' } }),
      prisma.leaveRequest.count({ where: { ...where, status: 'CANCELLED' } }),
    ]);

    const requests = await prisma.leaveRequest.findMany({
      where: { ...where, status: 'APPROVED' },
      select: { totalDays: true },
    });

    const totalDaysTaken = requests.reduce(
      (sum, r) => sum + Number(r.totalDays),
      0
    );

    return {
      total,
      pending,
      approved,
      rejected,
      cancelled,
      totalDaysTaken,
    };
  }

  // --------------------------------------------------------------------------
  // Leave Policies
  // --------------------------------------------------------------------------

  static async findAllPolicies(filter: any = {}) {
    const { tenantId, isActive, page = 1, limit = 50 } = filter;

    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [total, data] = await Promise.all([
      prisma.leavePolicy.count({ where }),
      prisma.leavePolicy.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async findPolicyById(id: string, tenantId: string) {
    return prisma.leavePolicy.findFirst({
      where: { id, tenantId },
      include: { balances: true },
    });
  }

  static async createPolicy(data: z.infer<typeof createLeavePolicySchema>) {
    const validated = createLeavePolicySchema.parse(data);
    return prisma.leavePolicy.create({
      data: validated,
    });
  }

  static async updatePolicy(id: string, tenantId: string, data: any) {
    return prisma.leavePolicy.update({
      where: { id },
      data,
    });
  }

  static async deletePolicy(id: string, tenantId: string) {
    // Check if policy has balances
    const balanceCount = await prisma.leaveBalance.count({
      where: { policyId: id },
    });

    if (balanceCount > 0) {
      throw new Error('Cannot delete policy with existing balances. Deactivate instead.');
    }

    return prisma.leavePolicy.delete({
      where: { id },
    });
  }

  // --------------------------------------------------------------------------
  // Leave Balances
  // --------------------------------------------------------------------------

  static async findAllBalances(filter: any = {}) {
    const { tenantId, employeeId, policyId, leaveYear, page = 1, limit = 50 } = filter;

    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (employeeId) where.employeeId = employeeId;
    if (policyId) where.policyId = policyId;
    if (leaveYear) where.leaveYear = parseInt(leaveYear);

    const [total, data] = await Promise.all([
      prisma.leaveBalance.count({ where }),
      prisma.leaveBalance.findMany({
        where,
        include: { policy: true },
        orderBy: { lastUpdated: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async findBalanceById(id: string, tenantId: string) {
    return prisma.leaveBalance.findFirst({
      where: { id, tenantId },
      include: { policy: true },
    });
  }

  static async getBalanceByEmployee(
    tenantId: string,
    employeeId: string,
    leaveYear?: number
  ) {
    const year = leaveYear || new Date().getFullYear();

    return prisma.leaveBalance.findMany({
      where: {
        tenantId,
        employeeId,
        leaveYear: year,
      },
      include: { policy: true },
    });
  }

  static async createBalance(data: z.infer<typeof createLeaveBalanceSchema>) {
    const validated = createLeaveBalanceSchema.parse(data);
    return prisma.leaveBalance.create({
      data: validated,
    });
  }

  static async updateBalance(id: string, tenantId: string, data: any) {
    return prisma.leaveBalance.update({
      where: { id },
      data: {
        ...data,
        lastUpdated: new Date(),
      },
    });
  }

  static async adjustBalance(
    id: string,
    tenantId: string,
    adjustment: number,
    reason: string
  ) {
    const balance = await prisma.leaveBalance.findFirst({
      where: { id, tenantId },
    });

    if (!balance) throw new Error('Balance not found');

    const adjusted = Number(balance.adjusted) + adjustment;
    const currentBalance = Number(balance.currentBalance) + adjustment;

    return prisma.leaveBalance.update({
      where: { id },
      data: {
        adjusted,
        currentBalance,
        lastUpdated: new Date(),
      },
    });
  }

  // --------------------------------------------------------------------------
  // Leave Calendar
  // --------------------------------------------------------------------------

  static async getLeaveCalendar(
    tenantId: string,
    startDate: Date,
    endDate: Date,
    departmentId?: string
  ) {
    const where: any = {
      tenantId,
      status: 'APPROVED',
      startDate: { lte: endDate },
      endDate: { gte: startDate },
    };

    const requests = await prisma.leaveRequest.findMany({
      where,
      orderBy: { startDate: 'asc' },
    });

    return requests;
  }

  // --------------------------------------------------------------------------
  // Leave Encashment
  // --------------------------------------------------------------------------

  static async findAllEncashments(filter: any = {}) {
    const { tenantId, employeeId, status, page = 1, limit = 50 } = filter;

    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;

    const [total, data] = await Promise.all([
      prisma.leaveEncashment.count({ where }),
      prisma.leaveEncashment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async createEncashment(data: z.infer<typeof createLeaveEncashmentSchema>) {
    const validated = createLeaveEncashmentSchema.parse(data);
    return prisma.leaveEncashment.create({
      data: validated,
    });
  }

  static async approveEncashment(id: string, tenantId: string, approvedBy: string) {
    const encashment = await prisma.leaveEncashment.findFirst({
      where: { id, tenantId },
    });

    if (!encashment) throw new Error('Encashment request not found');
    if (encashment.status !== 'PENDING') throw new Error('Already processed');

    // Update balance
    const balance = await prisma.leaveBalance.findFirst({
      where: {
        tenantId,
        employeeId: encashment.employeeId,
        policyId: encashment.policyId,
      },
    });

    if (balance) {
      const encashed = Number(balance.encashed) + Number(encashment.requestedDays);
      const currentBalance = Number(balance.currentBalance) - Number(encashment.requestedDays);

      await prisma.leaveBalance.update({
        where: { id: balance.id },
        data: {
          encashed,
          currentBalance,
          lastUpdated: new Date(),
        },
      });
    }

    return prisma.leaveEncashment.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy,
        approvedAt: new Date(),
        approvedDays: encashment.requestedDays,
      },
    });
  }
}
