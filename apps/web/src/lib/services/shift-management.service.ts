import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

export const createShiftSchema = z.object({
  tenantId: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string().optional(),
  startTime: z.string(), // HH:MM
  endTime: z.string(), // HH:MM
  graceInMinutes: z.number().default(0),
  graceOutMinutes: z.number().default(0),
  breakDuration: z.number().default(0),
  isPaidBreak: z.boolean().default(true),
  workHours: z.number(),
  weekendDays: z.array(z.string()).default([]),
  overtimeAllowed: z.boolean().default(false),
  maxOvertimeHours: z.number().default(0),
  isFlexible: z.boolean().default(false),
  flexWindow: z.number().default(0),
});

export const updateShiftSchema = createShiftSchema.partial().omit({ tenantId: true });

export const createShiftAssignmentSchema = z.object({
  tenantId: z.string(),
  employeeId: z.string(),
  shiftId: z.string(),
  effectiveFrom: z.string().or(z.date()),
  effectiveTo: z.string().or(z.date()).optional(),
  reason: z.string().optional(),
});

export const createShiftRosterSchema = z.object({
  tenantId: z.string(),
  employeeId: z.string(),
  shiftId: z.string(),
  rosterDate: z.string().or(z.date()),
  customStartTime: z.string().optional(),
  customEndTime: z.string().optional(),
  isWeekOff: z.boolean().default(false),
  isHoliday: z.boolean().default(false),
});

export const createShiftSwapSchema = z.object({
  tenantId: z.string(),
  requestorId: z.string(),
  swapWithId: z.string(),
  requestorDate: z.string().or(z.date()),
  requestorShiftId: z.string(),
  swapWithDate: z.string().or(z.date()),
  swapWithShiftId: z.string(),
  reason: z.string(),
});

export class ShiftManagementService {
  // ==================== SHIFTS ====================

  static async findAllShifts(filter: any) {
    const { tenantId, isActive, page = 1, limit = 20, sortBy = 'name', sortOrder = 'asc' } = filter;

    const where: any = { tenantId };
    if (isActive !== undefined) where.isActive = isActive;

    const [data, total] = await Promise.all([
      prisma.shift.findMany({
        where,
        include: {
          _count: {
            select: {
              assignments: true,
              rosters: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.shift.count({ where }),
    ]);

    return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  static async findShiftById(id: string, tenantId: string) {
    return prisma.shift.findFirst({
      where: { id, tenantId },
      include: {
        assignments: {
          take: 10,
          orderBy: { effectiveFrom: 'desc' },
        },
        rosters: {
          take: 10,
          orderBy: { rosterDate: 'desc' },
        },
      },
    });
  }

  static async createShift(data: z.infer<typeof createShiftSchema>) {
    const validated = createShiftSchema.parse(data);
    return prisma.shift.create({
      data: validated,
    });
  }

  static async updateShift(id: string, tenantId: string, data: z.infer<typeof updateShiftSchema>) {
    const validated = updateShiftSchema.parse(data);
    const existing = await prisma.shift.findFirst({ where: { id, tenantId } });
    if (!existing) return null;

    return prisma.shift.update({ where: { id }, data: validated });
  }

  static async deleteShift(id: string, tenantId: string) {
    const existing = await prisma.shift.findFirst({ where: { id, tenantId } });
    if (!existing) return null;

    // Check if shift is assigned
    const assignmentCount = await prisma.shiftAssignment.count({ where: { shiftId: id } });
    if (assignmentCount > 0) {
      throw new Error('Cannot delete shift that has active assignments');
    }

    return prisma.shift.delete({ where: { id } });
  }

  static async setDefaultShift(id: string, tenantId: string) {
    const shift = await prisma.shift.findFirst({ where: { id, tenantId } });
    if (!shift) throw new Error('Shift not found');

    // Remove default from other shifts
    await prisma.shift.updateMany({
      where: { tenantId, isDefault: true },
      data: { isDefault: false },
    });

    // Set this as default
    return prisma.shift.update({
      where: { id },
      data: { isDefault: true },
    });
  }

  // ==================== SHIFT ASSIGNMENTS ====================

  static async findAllAssignments(filter: any) {
    const { tenantId, employeeId, shiftId, isActive, page = 1, limit = 50 } = filter;

    const where: any = { tenantId };
    if (employeeId) where.employeeId = employeeId;
    if (shiftId) where.shiftId = shiftId;
    if (isActive !== undefined) where.isActive = isActive;

    const [data, total] = await Promise.all([
      prisma.shiftAssignment.findMany({
        where,
        include: { shift: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { effectiveFrom: 'desc' },
      }),
      prisma.shiftAssignment.count({ where }),
    ]);

    return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  static async createAssignment(data: z.infer<typeof createShiftAssignmentSchema>, assignedBy: string) {
    const validated = createShiftAssignmentSchema.parse(data);

    // Deactivate existing assignments for this employee if any
    await prisma.shiftAssignment.updateMany({
      where: {
        tenantId: validated.tenantId,
        employeeId: validated.employeeId,
        isActive: true,
      },
      data: { isActive: false, effectiveTo: new Date() },
    });

    return prisma.shiftAssignment.create({
      data: {
        ...validated,
        effectiveFrom: new Date(validated.effectiveFrom),
        effectiveTo: validated.effectiveTo ? new Date(validated.effectiveTo) : undefined,
        assignedBy,
      },
      include: { shift: true },
    });
  }

  static async updateAssignment(id: string, tenantId: string, data: any) {
    const existing = await prisma.shiftAssignment.findFirst({ where: { id, tenantId } });
    if (!existing) return null;

    const updateData: any = { ...data };
    if (data.effectiveFrom) updateData.effectiveFrom = new Date(data.effectiveFrom);
    if (data.effectiveTo) updateData.effectiveTo = new Date(data.effectiveTo);

    return prisma.shiftAssignment.update({ where: { id }, data: updateData });
  }

  static async deleteAssignment(id: string, tenantId: string) {
    const existing = await prisma.shiftAssignment.findFirst({ where: { id, tenantId } });
    if (!existing) return null;
    return prisma.shiftAssignment.delete({ where: { id } });
  }

  // ==================== SHIFT ROSTER ====================

  static async findAllRosters(filter: any) {
    const { tenantId, employeeId, shiftId, startDate, endDate, page = 1, limit = 100 } = filter;

    const where: any = { tenantId };
    if (employeeId) where.employeeId = employeeId;
    if (shiftId) where.shiftId = shiftId;
    if (startDate && endDate) {
      where.rosterDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const [data, total] = await Promise.all([
      prisma.shiftRoster.findMany({
        where,
        include: { shift: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { rosterDate: 'asc' },
      }),
      prisma.shiftRoster.count({ where }),
    ]);

    return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  static async createRoster(data: z.infer<typeof createShiftRosterSchema>) {
    const validated = createShiftRosterSchema.parse(data);
    return prisma.shiftRoster.create({
      data: {
        ...validated,
        rosterDate: new Date(validated.rosterDate),
      },
      include: { shift: true },
    });
  }

  static async bulkCreateRosters(rosters: z.infer<typeof createShiftRosterSchema>[]) {
    const validated = rosters.map(r => ({
      ...createShiftRosterSchema.parse(r),
      rosterDate: new Date(r.rosterDate),
    }));

    return prisma.shiftRoster.createMany({
      data: validated,
      skipDuplicates: true,
    });
  }

  static async updateRoster(id: string, tenantId: string, data: any) {
    const existing = await prisma.shiftRoster.findFirst({ where: { id, tenantId } });
    if (!existing) return null;

    const updateData: any = { ...data };
    if (data.rosterDate) updateData.rosterDate = new Date(data.rosterDate);

    return prisma.shiftRoster.update({ where: { id }, data: updateData });
  }

  static async deleteRoster(id: string, tenantId: string) {
    const existing = await prisma.shiftRoster.findFirst({ where: { id, tenantId } });
    if (!existing) return null;
    return prisma.shiftRoster.delete({ where: { id } });
  }

  // ==================== SHIFT SWAP ====================

  static async findAllSwaps(filter: any) {
    const { tenantId, requestorId, swapWithId, status, page = 1, limit = 20 } = filter;

    const where: any = { tenantId };
    if (requestorId) where.requestorId = requestorId;
    if (swapWithId) where.swapWithId = swapWithId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.shiftSwapRequest.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.shiftSwapRequest.count({ where }),
    ]);

    return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  static async createSwap(data: z.infer<typeof createShiftSwapSchema>) {
    const validated = createShiftSwapSchema.parse(data);
    return prisma.shiftSwapRequest.create({
      data: {
        ...validated,
        requestorDate: new Date(validated.requestorDate),
        swapWithDate: new Date(validated.swapWithDate),
      },
    });
  }

  static async peerApproveSwap(id: string, tenantId: string, swapWithId: string) {
    const swap = await prisma.shiftSwapRequest.findFirst({ where: { id, tenantId } });
    if (!swap) throw new Error('Swap request not found');
    if (swap.swapWithId !== swapWithId) throw new Error('Unauthorized');

    return prisma.shiftSwapRequest.update({
      where: { id },
      data: {
        swapWithApproval: 'APPROVED',
        status: 'APPROVED_BY_PEER',
      },
    });
  }

  static async managerApproveSwap(id: string, tenantId: string, approvedBy: string) {
    const swap = await prisma.shiftSwapRequest.findFirst({ where: { id, tenantId } });
    if (!swap) throw new Error('Swap request not found');
    if (swap.swapWithApproval !== 'APPROVED') throw new Error('Peer approval required first');

    // Transactional roster swap — atomic success or failure
    return prisma.$transaction(async (tx) => {
      // Mark manager approval
      await tx.shiftSwapRequest.update({
        where: { id },
        data: {
          managerApproval: 'APPROVED',
          status: 'APPROVED_BY_MANAGER',
          approvedBy,
          approvedAt: new Date(),
        },
      });

      // Find requestor's roster entry for the swap date
      const requestorRoster = await tx.shiftRoster.findFirst({
        where: {
          tenantId,
          employeeId: swap.requestorId,
          rosterDate: swap.requestorDate,
        },
      });

      // Find swapWith's roster entry for the swap date
      const swapWithRoster = await tx.shiftRoster.findFirst({
        where: {
          tenantId,
          employeeId: swap.swapWithId,
          rosterDate: swap.swapWithDate,
        },
      });

      // Swap the shift assignments in the roster
      if (requestorRoster && swapWithRoster) {
        await tx.shiftRoster.update({
          where: { id: requestorRoster.id },
          data: { shiftId: swap.swapWithShiftId, status: 'SWAPPED' },
        });
        await tx.shiftRoster.update({
          where: { id: swapWithRoster.id },
          data: { shiftId: swap.requestorShiftId, status: 'SWAPPED' },
        });
      } else if (requestorRoster) {
        // Only requestor has a roster entry — create one for swapWith
        await tx.shiftRoster.update({
          where: { id: requestorRoster.id },
          data: { shiftId: swap.swapWithShiftId, status: 'SWAPPED' },
        });
        await tx.shiftRoster.create({
          data: {
            tenantId,
            employeeId: swap.swapWithId,
            shiftId: swap.requestorShiftId,
            rosterDate: swap.swapWithDate,
            status: 'SWAPPED',
          },
        });
      } else if (swapWithRoster) {
        // Only swapWith has a roster entry — create one for requestor
        await tx.shiftRoster.update({
          where: { id: swapWithRoster.id },
          data: { shiftId: swap.requestorShiftId, status: 'SWAPPED' },
        });
        await tx.shiftRoster.create({
          data: {
            tenantId,
            employeeId: swap.requestorId,
            shiftId: swap.swapWithShiftId,
            rosterDate: swap.requestorDate,
            status: 'SWAPPED',
          },
        });
      }

      // Mark swap as completed
      return tx.shiftSwapRequest.update({
        where: { id },
        data: { status: 'COMPLETED' },
      });
    });
  }

  static async rejectSwap(id: string, tenantId: string, rejectedBy: string, reason: string) {
    const swap = await prisma.shiftSwapRequest.findFirst({ where: { id, tenantId } });
    if (!swap) throw new Error('Swap request not found');

    return prisma.shiftSwapRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        approvedBy: rejectedBy,
        approvedAt: new Date(),
        rejectionReason: reason,
      },
    });
  }

  // ==================== STATISTICS ====================

  static async getStatistics(tenantId: string) {
    const [totalShifts, activeShifts, totalAssignments, activeAssignments, pendingSwaps] = await Promise.all([
      prisma.shift.count({ where: { tenantId } }),
      prisma.shift.count({ where: { tenantId, isActive: true } }),
      prisma.shiftAssignment.count({ where: { tenantId } }),
      prisma.shiftAssignment.count({ where: { tenantId, isActive: true } }),
      prisma.shiftSwapRequest.count({ where: { tenantId, status: 'PENDING' } }),
    ]);

    return {
      totalShifts,
      activeShifts,
      totalAssignments,
      activeAssignments,
      pendingSwaps,
    };
  }
}
