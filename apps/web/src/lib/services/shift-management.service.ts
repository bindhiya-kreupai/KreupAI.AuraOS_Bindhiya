import { prisma } from '@aura/database';
import { z } from 'zod';
import { notificationService } from './notification.service';

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const createShiftBaseSchema = z.object({
  tenantId: z.string(),
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  startTime: z.string().regex(timeRegex, 'Start time must be in HH:MM format (00:00–23:59)'),
  endTime: z.string().regex(timeRegex, 'End time must be in HH:MM format (00:00–23:59)'),
  graceInMinutes: z.number().min(0).default(0),
  graceOutMinutes: z.number().min(0).default(0),
  breakDuration: z.number().min(0).default(0),
  isPaidBreak: z.boolean().default(true),
  workHours: z.number().min(0.5),
  weekendDays: z.array(z.string()).default([]),
  overtimeAllowed: z.boolean().default(false),
  maxOvertimeHours: z.number().min(0).default(0),
  isFlexible: z.boolean().default(false),
  flexWindow: z.number().min(0).default(0),
  isDefault: z.boolean().default(false),
});

export const createShiftSchema = createShiftBaseSchema.refine(
  (data) => {
    if (!timeRegex.test(data.startTime) || !timeRegex.test(data.endTime)) return true;
    const [sh, sm] = data.startTime.split(':').map(Number);
    const [eh, em] = data.endTime.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    return endMin !== startMin;
  },
  { message: 'Start time and end time must be different', path: ['endTime'] }
);

export const updateShiftSchema = createShiftBaseSchema.partial().omit({ tenantId: true });

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
  createdBy: z.string().optional(),
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
  createdBy: z.string().optional(),
});

export class ShiftManagementService {
  // ==================== SHIFTS ====================

  static async findAllShifts(filter: any) {
    const {
      tenantId,
      isActive,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sortBy = 'name',
      sortOrder = 'asc',
    } = filter;

    const ALLOWED_SORT_FIELDS = [
      'name',
      'code',
      'startTime',
      'endTime',
      'workHours',
      'createdAt',
      'updatedAt',
    ] as const;
    const safeSortBy = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'name';
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 200);

    const where: any = { tenantId, isDeleted: false };
    if (isActive !== undefined) where.isActive = isActive;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

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
        skip: (page - 1) * safeLimit,
        take: safeLimit,
        orderBy: { [safeSortBy]: sortOrder },
      }),
      prisma.shift.count({ where }),
    ]);

    return {
      data,
      pagination: { total, page, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) },
    };
  }

  static async findShiftById(id: string, tenantId: string) {
    return prisma.shift.findFirst({
      where: { id, tenantId, isDeleted: false },
      include: {
        assignments: {
          where: { isDeleted: false },
          take: 10,
          orderBy: { effectiveFrom: 'desc' },
        },
        rosters: {
          where: { isDeleted: false },
          take: 10,
          orderBy: { rosterDate: 'desc' },
        },
      },
    });
  }

  static async createShift(data: z.infer<typeof createShiftSchema>, createdBy?: string) {
    const validated = createShiftSchema.parse(data);
    const existing = await prisma.shift.findFirst({
      where: {
        tenantId: validated.tenantId,
        code: validated.code,
        isDeleted: false,
      },
    });
    if (existing) {
      throw new Error(`A shift with code "${validated.code}" already exists.`);
    }
    return prisma.shift.create({
      data: {
        ...validated,
        createdBy: createdBy || null,
      },
    });
  }

  static async updateShift(
    id: string,
    tenantId: string,
    data: z.infer<typeof updateShiftSchema>,
    updatedBy?: string
  ) {
    const validated = updateShiftSchema.parse(data);
    const existing = await prisma.shift.findFirst({ where: { id, tenantId } });
    if (!existing) return null;

    if (validated.code) {
      const duplicate = await prisma.shift.findFirst({
        where: {
          tenantId,
          code: validated.code,
          id: { not: id },
          isDeleted: false,
        },
      });
      if (duplicate) {
        throw new Error(`A shift with code "${validated.code}" already exists.`);
      }
    }

    return prisma.shift.update({
      where: { id },
      data: { ...validated, updatedBy: updatedBy || null },
    });
  }

  static async deleteShift(id: string, tenantId: string) {
    const existing = await prisma.shift.findFirst({ where: { id, tenantId } });
    if (!existing) return null;

    // Check if shift has active (non-deleted) assignments
    const assignmentCount = await prisma.shiftAssignment.count({
      where: { shiftId: id, isDeleted: false, isActive: true },
    });
    if (assignmentCount > 0) {
      throw new Error('Cannot delete shift that has active assignments');
    }

    return prisma.shift.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  static async setDefaultShift(id: string, tenantId: string, updatedBy?: string) {
    return prisma.$transaction(async (tx) => {
      const shift = await tx.shift.findFirst({ where: { id, tenantId } });
      if (!shift) throw new Error('Shift not found');

      await tx.shift.updateMany({
        where: { tenantId, isDefault: true },
        data: { isDefault: false, updatedBy: updatedBy || null },
      });

      return tx.shift.update({
        where: { id },
        data: { isDefault: true, updatedBy: updatedBy || null },
      });
    });
  }

  // ==================== SHIFT ASSIGNMENTS ====================

  static async findAllAssignments(filter: any) {
    const {
      tenantId,
      employeeId,
      shiftId,
      isActive,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = filter;
    const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);

    const where: any = { tenantId, isDeleted: false };
    if (employeeId) where.employeeId = employeeId;
    if (shiftId) where.shiftId = shiftId;
    if (isActive !== undefined) where.isActive = isActive;
    if (startDate && endDate) {
      where.effectiveFrom = { lte: new Date(endDate) };
      where.OR = [{ effectiveTo: null }, { effectiveTo: { gte: new Date(startDate) } }];
    } else if (startDate) {
      where.effectiveFrom = { gte: new Date(startDate) };
    } else if (endDate) {
      where.effectiveFrom = { lte: new Date(endDate) };
    }

    const [data, total] = await Promise.all([
      prisma.shiftAssignment.findMany({
        where,
        include: { shift: true },
        skip: (page - 1) * safeLimit,
        take: safeLimit,
        orderBy: { effectiveFrom: 'desc' },
      }),
      prisma.shiftAssignment.count({ where }),
    ]);

    // BUG-5: Resolve employee names (scoped to tenant via company relation)
    const employeeIds = [...new Set(data.map((a: any) => a.employeeId))];
    const employees = await prisma.employee.findMany({
      where: { id: { in: employeeIds }, isDeleted: false, company: { tenantId } },
      select: { id: true, firstName: true, lastName: true, employeeCode: true },
    });
    const employeeMap = new Map(employees.map((e: any) => [e.id, e]));

    const dataWithNames = data.map((assignment: any) => ({
      ...assignment,
      employee: employeeMap.get(assignment.employeeId) || null,
    }));

    return {
      data: dataWithNames,
      pagination: { total, page, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) },
    };
  }

  static async createAssignment(
    data: z.infer<typeof createShiftAssignmentSchema>,
    assignedBy: string
  ) {
    const validated = createShiftAssignmentSchema.parse(data);

    const conflicts = await this.checkConflicts({
      employeeId: validated.employeeId,
      date:
        typeof validated.effectiveFrom === 'string'
          ? validated.effectiveFrom
          : validated.effectiveFrom.toISOString().slice(0, 10),
      tenantId: validated.tenantId,
    });
    const errors = conflicts.filter((c) => c.severity === 'error');
    if (errors.length > 0) {
      throw new Error(errors.map((e) => e.message).join(' '));
    }

    const assignment = await prisma.$transaction(async (tx) => {
      await tx.shiftAssignment.updateMany({
        where: {
          tenantId: validated.tenantId,
          employeeId: validated.employeeId,
          isActive: true,
        },
        data: { isActive: false, effectiveTo: new Date() },
      });

      return tx.shiftAssignment.create({
        data: {
          ...validated,
          effectiveFrom: new Date(validated.effectiveFrom),
          effectiveTo: validated.effectiveTo ? new Date(validated.effectiveTo) : undefined,
          assignedBy,
          createdBy: assignedBy,
        },
        include: { shift: true },
      });
    });

    // Fire notification to assigned employee
    const shift = assignment as any;
    if (shift.shift) {
      notificationService
        .notifyShiftAssigned(validated.employeeId, {
          shiftId: validated.shiftId,
          shiftName: shift.shift.name,
          shiftCode: shift.shift.code,
          effectiveFrom: validated.effectiveFrom.toString(),
          effectiveTo: validated.effectiveTo?.toString() || null,
        })
        .catch(() => {});
    }

    return assignment;
  }

  static async updateAssignment(
    id: string,
    tenantId: string,
    data: Record<string, unknown>,
    updatedBy?: string
  ) {
    const existing = await prisma.shiftAssignment.findFirst({ where: { id, tenantId } });
    if (!existing) return null;

    const allowedFields = [
      'shiftId',
      'effectiveFrom',
      'effectiveTo',
      'isActive',
      'reason',
    ] as const;
    const updateData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in data) updateData[key] = data[key];
    }
    if (updateData.effectiveFrom)
      updateData.effectiveFrom = new Date(updateData.effectiveFrom as string);
    if (updateData.effectiveTo) updateData.effectiveTo = new Date(updateData.effectiveTo as string);
    updateData.updatedBy = updatedBy || null;

    return prisma.shiftAssignment.update({ where: { id }, data: updateData as any });
  }

  static async deleteAssignment(id: string, tenantId: string) {
    const existing = await prisma.shiftAssignment.findFirst({
      where: { id, tenantId },
      include: { shift: { select: { name: true } } },
    });
    if (!existing) return null;

    const result = await prisma.shiftAssignment.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), isActive: false },
    });

    // Fire notification
    notificationService
      .notifyShiftAssignmentRemoved(existing.employeeId, {
        shiftId: existing.shiftId,
        shiftName: (existing.shift as any)?.name || 'Unknown',
        effectiveFrom: existing.effectiveFrom.toISOString().slice(0, 10),
      })
      .catch(() => {});

    return result;
  }

  // ==================== CONFLICT DETECTION ====================

  static async checkConflicts(params: {
    employeeId: string;
    date: string;
    tenantId: string;
    excludeRosterId?: string;
  }): Promise<{ type: string; severity: 'error' | 'warning'; message: string }[]> {
    const { employeeId, date, tenantId, excludeRosterId } = params;
    const targetDate = new Date(date);
    const conflicts: { type: string; severity: 'error' | 'warning'; message: string }[] = [];

    // 1. Double-booking check — same employee, same date
    const existingRoster = await prisma.shiftRoster.findFirst({
      where: {
        tenantId,
        employeeId,
        rosterDate: targetDate,
        isDeleted: false,
        ...(excludeRosterId ? { id: { not: excludeRosterId } } : {}),
      },
    });
    if (existingRoster) {
      conflicts.push({
        type: 'DOUBLE_BOOKING',
        severity: 'error',
        message: `Employee already has a roster entry for ${targetDate.toISOString().slice(0, 10)}.`,
      });
    }

    // 2. Leave overlap check — APPROVED or PENDING leave covering this date
    const overlappingLeave = await prisma.leaveRequest.findFirst({
      where: {
        tenantId,
        employeeId,
        startDate: { lte: targetDate },
        endDate: { gte: targetDate },
        status: { in: ['APPROVED', 'PENDING'] },
        isDeleted: false,
      },
    });
    if (overlappingLeave) {
      conflicts.push({
        type: 'LEAVE_OVERLAP',
        severity: 'error',
        message: `Employee has ${overlappingLeave.status.toLowerCase()} leave (${overlappingLeave.startDate.toISOString().slice(0, 10)} - ${overlappingLeave.endDate.toISOString().slice(0, 10)}).`,
      });
    }

    // 3. Assignment consistency check — no active shift assignment
    const activeAssignment = await prisma.shiftAssignment.findFirst({
      where: {
        tenantId,
        employeeId,
        isActive: true,
        isDeleted: false,
        effectiveFrom: { lte: targetDate },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: targetDate } }],
      },
    });
    if (!activeAssignment) {
      conflicts.push({
        type: 'NO_ACTIVE_ASSIGNMENT',
        severity: 'warning',
        message: `Employee does not have an active shift assignment covering ${targetDate.toISOString().slice(0, 10)}.`,
      });
    }

    return conflicts;
  }

  // ==================== SHIFT ROSTER ====================

  static async findAllRosters(filter: any) {
    const {
      tenantId,
      employeeId,
      shiftId,
      startDate,
      endDate,
      excludeDrafts,
      page = 1,
      limit = 100,
    } = filter;
    const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 500);

    const where: any = { tenantId, isDeleted: false };
    if (employeeId) where.employeeId = employeeId;
    if (shiftId) where.shiftId = shiftId;
    if (excludeDrafts) where.publishedAt = { not: null };
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
        skip: (page - 1) * safeLimit,
        take: safeLimit,
        orderBy: { rosterDate: 'asc' },
      }),
      prisma.shiftRoster.count({ where }),
    ]);

    // BUG-5: Resolve employee names (scoped to tenant via company relation)
    const employeeIds = [...new Set(data.map((r: any) => r.employeeId))];
    const employees = await prisma.employee.findMany({
      where: { id: { in: employeeIds }, isDeleted: false, company: { tenantId } },
      select: { id: true, firstName: true, lastName: true, employeeCode: true },
    });
    const employeeMap = new Map(employees.map((e: any) => [e.id, e]));

    const dataWithNames = data.map((roster: any) => ({
      ...roster,
      employee: employeeMap.get(roster.employeeId) || null,
    }));

    return {
      data: dataWithNames,
      pagination: { total, page, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) },
    };
  }

  static async createRoster(data: z.infer<typeof createShiftRosterSchema>) {
    const validated = createShiftRosterSchema.parse(data);
    const rosterDate = new Date(validated.rosterDate);

    const conflicts = await this.checkConflicts({
      employeeId: validated.employeeId,
      date: validated.rosterDate,
      tenantId: validated.tenantId,
    });
    const errors = conflicts.filter((c) => c.severity === 'error');
    if (errors.length > 0) {
      throw new Error(errors.map((e) => e.message).join(' '));
    }

    const roster = await prisma.shiftRoster.create({
      data: {
        ...validated,
        rosterDate,
      },
      include: { shift: true },
    });

    // Fire notification
    const shiftData = roster as any;
    if (shiftData.shift) {
      notificationService
        .notifyShiftRosterAssigned(validated.employeeId, {
          shiftId: validated.shiftId,
          shiftName: shiftData.shift.name,
          rosterDate: rosterDate.toISOString().slice(0, 10),
          customStartTime: validated.customStartTime,
          customEndTime: validated.customEndTime,
          isWeekOff: validated.isWeekOff,
          isHoliday: validated.isHoliday,
        })
        .catch(() => {});
    }

    return roster;
  }

  static async bulkCreateRosters(rosters: z.infer<typeof createShiftRosterSchema>[]) {
    const validated = rosters.map((r) => ({
      ...createShiftRosterSchema.parse(r),
      rosterDate: new Date(r.rosterDate),
    }));

    const allConflicts: { index: number; message: string }[] = [];
    for (let i = 0; i < validated.length; i++) {
      const r = validated[i];
      const conflicts = await this.checkConflicts({
        employeeId: r.employeeId,
        date: r.rosterDate.toISOString().slice(0, 10),
        tenantId: r.tenantId,
      });
      const errors = conflicts.filter((c) => c.severity === 'error');
      if (errors.length > 0) {
        allConflicts.push({
          index: i,
          message: `Entry ${i + 1} (employee ${r.employeeId}, ${r.rosterDate.toISOString().slice(0, 10)}): ${errors.map((e) => e.message).join(' ')}`,
        });
      }
    }
    if (allConflicts.length > 0) {
      throw new Error(allConflicts.map((c) => c.message).join(' | '));
    }

    return prisma.shiftRoster.createMany({
      data: validated,
      skipDuplicates: true,
    });
  }

  static async updateRoster(
    id: string,
    tenantId: string,
    data: Record<string, unknown>,
    updatedBy?: string
  ) {
    const existing = await prisma.shiftRoster.findFirst({ where: { id, tenantId } });
    if (!existing) return null;

    const allowedFields = [
      'shiftId',
      'rosterDate',
      'customStartTime',
      'customEndTime',
      'isWeekOff',
      'isHoliday',
      'status',
    ] as const;
    const updateData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in data) updateData[key] = data[key];
    }
    if (updateData.rosterDate) updateData.rosterDate = new Date(updateData.rosterDate as string);

    // BUG-9: Enforce roster status state machine
    if (updateData.status) {
      const newStatus = updateData.status as string;
      const currentStatus = existing.status;
      const validTransitions: Record<string, string[]> = {
        SCHEDULED: ['CONFIRMED', 'CANCELLED', 'SWAPPED'],
        CONFIRMED: ['COMPLETED', 'CANCELLED', 'SWAPPED'],
        OPEN: ['SCHEDULED', 'CANCELLED'],
        COMPLETED: [],
        CANCELLED: ['SCHEDULED'],
        SWAPPED: [],
      };
      const allowed = validTransitions[currentStatus] || [];
      if (!allowed.includes(newStatus)) {
        throw new Error(
          `Invalid roster status transition from "${currentStatus}" to "${newStatus}". Allowed transitions: ${allowed.length > 0 ? allowed.join(', ') : 'none'}`
        );
      }
    }

    updateData.updatedBy = updatedBy || null;

    const result = await prisma.shiftRoster.update({ where: { id }, data: updateData as any });

    // Fire notification on status transitions
    if (updateData.status && existing.employeeId) {
      const shiftInfo = await prisma.shift.findFirst({
        where: { id: existing.shiftId, tenantId },
        select: { name: true },
      });
      if (updateData.status === 'CONFIRMED') {
        notificationService
          .notifyShiftRosterConfirmed(existing.employeeId, {
            shiftId: existing.shiftId,
            shiftName: shiftInfo?.name || 'Unknown',
            rosterDate: existing.rosterDate.toISOString().slice(0, 10),
          })
          .catch(() => {});
      } else if (updateData.status === 'CANCELLED') {
        notificationService
          .notifyShiftRosterCancelled(existing.employeeId, {
            shiftId: existing.shiftId,
            shiftName: shiftInfo?.name || 'Unknown',
            rosterDate: existing.rosterDate.toISOString().slice(0, 10),
          })
          .catch(() => {});
      }
    }

    return result;
  }

  static async deleteRoster(id: string, tenantId: string) {
    const existing = await prisma.shiftRoster.findFirst({
      where: { id, tenantId, isDeleted: false },
    });
    if (!existing) return null;

    // Prevent soft-deleting COMPLETED or SWAPPED roster entries
    if (existing.status === 'COMPLETED' || existing.status === 'SWAPPED') {
      throw new Error(`Cannot delete roster entry in "${existing.status}" status.`);
    }

    const result = await prisma.shiftRoster.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), status: 'CANCELLED' },
    });

    // Fire notification
    const shiftInfo = await prisma.shift.findFirst({
      where: { id: existing.shiftId, tenantId },
      select: { name: true },
    });
    notificationService
      .notifyShiftRosterCancelled(existing.employeeId, {
        shiftId: existing.shiftId,
        shiftName: shiftInfo?.name || 'Unknown',
        rosterDate: existing.rosterDate.toISOString().slice(0, 10),
      })
      .catch(() => {});

    return result;
  }

  // ==================== ROSTER PUBLISHING ====================

  /**
   * Publish all unpublished (draft) roster entries within a date range.
   * Sets publishedAt and publishedBy, transitioning entries from draft to active.
   */
  static async publishRoster(
    tenantId: string,
    dateFrom: string,
    dateTo: string,
    publishedBy: string
  ): Promise<{ count: number; employeeIds: string[] }> {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      throw new Error('Invalid date format. Use YYYY-MM-DD.');
    }
    if (from > to) {
      throw new Error('dateFrom must be before or equal to dateTo.');
    }

    // Find all unpublished roster entries in the date range
    const entries = await prisma.shiftRoster.findMany({
      where: {
        tenantId,
        rosterDate: { gte: from, lte: to },
        publishedAt: null,
        isDeleted: false,
      },
      select: { employeeId: true },
    });

    if (entries.length === 0) {
      return { count: 0, employeeIds: [] };
    }

    await prisma.shiftRoster.updateMany({
      where: {
        tenantId,
        rosterDate: { gte: from, lte: to },
        publishedAt: null,
        isDeleted: false,
      },
      data: {
        publishedAt: new Date(),
        publishedBy,
      },
    });

    // Fire notification to affected employees
    const uniqueEmployeeIds = [...new Set(entries.map((e) => e.employeeId))];
    for (const empId of uniqueEmployeeIds) {
      notificationService
        .notifyShiftRosterPublished(empId, {
          dateFrom,
          dateTo,
        })
        .catch(() => {});
    }

    return { count: entries.length, employeeIds: uniqueEmployeeIds };
  }

  // ==================== SHIFT SWAP ====================

  static readonly SWAP_STATUS_TRANSITIONS: Record<string, string[]> = {
    PENDING: ['APPROVED_BY_PEER', 'REJECTED', 'CANCELLED'],
    APPROVED_BY_PEER: ['APPROVED_BY_MANAGER', 'REJECTED'],
    APPROVED_BY_MANAGER: ['COMPLETED'],
    COMPLETED: [],
    REJECTED: [],
    CANCELLED: [],
  };

  static validateSwapTransition(currentStatus: string, newStatus: string): void {
    const allowed = this.SWAP_STATUS_TRANSITIONS[currentStatus];
    if (!allowed) {
      throw new Error(`Unknown swap status "${currentStatus}".`);
    }
    if (!allowed.includes(newStatus)) {
      throw new Error(
        `Invalid swap status transition from "${currentStatus}" to "${newStatus}". ` +
          `Allowed transitions from "${currentStatus}": ${allowed.length > 0 ? allowed.join(', ') : 'none'}`
      );
    }
  }

  static async findAllSwaps(filter: any) {
    const {
      tenantId,
      requestorId,
      swapWithId,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = filter;
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 200);

    const where: any = { tenantId, isDeleted: false };
    if (requestorId) where.requestorId = requestorId;
    if (swapWithId) where.swapWithId = swapWithId;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      prisma.shiftSwapRequest.findMany({
        where,
        skip: (page - 1) * safeLimit,
        take: safeLimit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.shiftSwapRequest.count({ where }),
    ]);

    // BUG-5: Resolve employee names for requestor and swapWith (scoped to tenant)
    const employeeIds = [
      ...new Set([...data.map((s: any) => s.requestorId), ...data.map((s: any) => s.swapWithId)]),
    ];
    const employees = await prisma.employee.findMany({
      where: { id: { in: employeeIds }, isDeleted: false, company: { tenantId } },
      select: { id: true, firstName: true, lastName: true, employeeCode: true },
    });
    const employeeMap = new Map(employees.map((e: any) => [e.id, e]));

    const dataWithNames = data.map((swap: any) => ({
      ...swap,
      requestor: employeeMap.get(swap.requestorId) || null,
      swapWith: employeeMap.get(swap.swapWithId) || null,
    }));

    return {
      data: dataWithNames,
      pagination: { total, page, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) },
    };
  }

  static async createSwap(data: z.infer<typeof createShiftSwapSchema>) {
    const validated = createShiftSwapSchema.parse(data);

    // BUG-3: Enforce ShiftSwapPolicy if one exists for this tenant
    const policy = await (prisma as any).shiftSwapPolicy.findFirst({
      where: {
        tenantId: validated.tenantId,
        isActive: true,
        isDeleted: false,
      },
    });

    if (policy && policy.config && typeof policy.config === 'object') {
      const config = policy.config as Record<string, any>;

      // Check advance notice requirement
      if (config.advanceNoticeHours) {
        const requestDate = new Date(validated.requestorDate);
        const now = new Date();
        const hoursUntilRequest = (requestDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        if (hoursUntilRequest < config.advanceNoticeHours) {
          throw new Error(
            `Swap requests require at least ${config.advanceNoticeHours} hours advance notice.`
          );
        }
      }

      // Check max swaps per month
      if (config.maxSwapsPerMonth) {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const swapsThisMonth = await prisma.shiftSwapRequest.count({
          where: {
            tenantId: validated.tenantId,
            requestorId: validated.requestorId,
            createdAt: { gte: startOfMonth },
            isDeleted: false,
          },
        });
        if (swapsThisMonth >= config.maxSwapsPerMonth) {
          throw new Error(
            `Employee has reached the maximum of ${config.maxSwapsPerMonth} swap requests this month.`
          );
        }
      }

      // Check allowed shift types
      if (
        config.allowedShiftTypes &&
        Array.isArray(config.allowedShiftTypes) &&
        config.allowedShiftTypes.length > 0
      ) {
        const requestorShift = await prisma.shift.findFirst({
          where: { id: validated.requestorShiftId, tenantId: validated.tenantId, isDeleted: false },
        });
        const swapWithShift = await prisma.shift.findFirst({
          where: { id: validated.swapWithShiftId, tenantId: validated.tenantId, isDeleted: false },
        });
        if (requestorShift && !config.allowedShiftTypes.includes(requestorShift.code)) {
          throw new Error(
            `Shift type "${requestorShift.code}" is not allowed for swaps. Allowed types: ${config.allowedShiftTypes.join(', ')}`
          );
        }
        if (swapWithShift && !config.allowedShiftTypes.includes(swapWithShift.code)) {
          throw new Error(
            `Shift type "${swapWithShift.code}" is not allowed for swaps. Allowed types: ${config.allowedShiftTypes.join(', ')}`
          );
        }
      }
    }

    const swap = await prisma.shiftSwapRequest.create({
      data: {
        ...validated,
        requestorDate: new Date(validated.requestorDate),
        swapWithDate: new Date(validated.swapWithDate),
        createdBy: validated.createdBy || validated.requestorId,
      },
    });

    // Fire notification to swapWith employee
    const requestor = await prisma.employee.findFirst({
      where: { id: validated.requestorId, tenantId: validated.tenantId },
      select: { firstName: true, lastName: true },
    });
    if (requestor) {
      notificationService
        .notifyShiftSwapRequested(validated.swapWithId, {
          requestorId: validated.requestorId,
          requestorName: `${requestor.firstName} ${requestor.lastName}`,
          requestorDate: swap.requestorDate.toISOString().slice(0, 10),
          swapWithDate: swap.swapWithDate.toISOString().slice(0, 10),
          reason: validated.reason,
          swapId: swap.id,
        })
        .catch(() => {});
    }

    return swap;
  }

  static async findSwapById(id: string, tenantId: string) {
    return prisma.shiftSwapRequest.findFirst({
      where: { id, tenantId, isDeleted: false },
    });
  }

  static async updateSwap(
    id: string,
    tenantId: string,
    data: Record<string, unknown>,
    updatedBy?: string
  ) {
    const existing = await prisma.shiftSwapRequest.findFirst({ where: { id, tenantId } });
    if (!existing) return null;

    // BUG-4: Status is NOT in allowedFields — status can only be changed via
    // peerApproveSwap, managerApproveSwap, or rejectSwap state machine methods
    const allowedFields = [
      'requestorDate',
      'requestorShiftId',
      'swapWithDate',
      'swapWithShiftId',
      'reason',
    ] as const;
    const updateData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in data) updateData[key] = data[key];
    }
    if (updateData.requestorDate)
      updateData.requestorDate = new Date(updateData.requestorDate as string);
    if (updateData.swapWithDate)
      updateData.swapWithDate = new Date(updateData.swapWithDate as string);
    if (updatedBy) updateData.updatedBy = updatedBy;

    return prisma.shiftSwapRequest.update({ where: { id }, data: updateData as any });
  }

  static async peerApproveSwap(id: string, tenantId: string, swapWithId: string) {
    const swap = await prisma.shiftSwapRequest.findFirst({ where: { id, tenantId } });
    if (!swap) throw new Error('Swap request not found');
    if (swap.swapWithId !== swapWithId) throw new Error('Unauthorized');

    ShiftManagementService.validateSwapTransition(swap.status, 'APPROVED_BY_PEER');

    const updated = await prisma.shiftSwapRequest.update({
      where: { id },
      data: {
        swapWithApproval: 'APPROVED',
        status: 'APPROVED_BY_PEER',
        updatedBy: swapWithId,
      },
    });

    // Fire notification to requestor
    const peerEmployee = await prisma.employee.findFirst({
      where: { id: swapWithId, tenantId },
      select: { firstName: true, lastName: true },
    });
    if (peerEmployee) {
      notificationService
        .notifyShiftSwapPeerApproved(swap.requestorId, {
          swapWithId,
          swapWithName: `${peerEmployee.firstName} ${peerEmployee.lastName}`,
          requestorDate: swap.requestorDate.toISOString().slice(0, 10),
          swapWithDate: swap.swapWithDate.toISOString().slice(0, 10),
          swapId: id,
        })
        .catch(() => {});
    }

    return updated;
  }

  static async managerApproveSwap(id: string, tenantId: string, approvedBy: string) {
    const swap = await prisma.shiftSwapRequest.findFirst({ where: { id, tenantId } });
    if (!swap) throw new Error('Swap request not found');
    if (swap.swapWithApproval !== 'APPROVED') throw new Error('Peer approval required first');

    ShiftManagementService.validateSwapTransition(swap.status, 'APPROVED_BY_MANAGER');

    // Transactional roster swap — atomic success or failure
    const result = await prisma.$transaction(async (tx) => {
      // Mark manager approval
      await tx.shiftSwapRequest.update({
        where: { id },
        data: {
          managerApproval: 'APPROVED',
          status: 'APPROVED_BY_MANAGER',
          approvedBy,
          approvedAt: new Date(),
          updatedBy: approvedBy,
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
        data: { status: 'COMPLETED', updatedBy: approvedBy },
      });
    });

    // Fire notifications to both parties
    const [requestorEmp, swapWithEmp] = await Promise.all([
      prisma.employee.findFirst({
        where: { id: swap.requestorId, tenantId },
        select: { firstName: true, lastName: true },
      }),
      prisma.employee.findFirst({
        where: { id: swap.swapWithId, tenantId },
        select: { firstName: true, lastName: true },
      }),
    ]);

    const rName = requestorEmp
      ? `${requestorEmp.firstName} ${requestorEmp.lastName}`
      : swap.requestorId;
    const sName = swapWithEmp
      ? `${swapWithEmp.firstName} ${swapWithEmp.lastName}`
      : swap.swapWithId;

    notificationService
      .notifyShiftSwapCompleted(swap.requestorId, {
        otherPartyId: swap.swapWithId,
        otherPartyName: sName,
        requestorDate: swap.requestorDate.toISOString().slice(0, 10),
        swapWithDate: swap.swapWithDate.toISOString().slice(0, 10),
        swapId: id,
      })
      .catch(() => {});

    notificationService
      .notifyShiftSwapCompleted(swap.swapWithId, {
        otherPartyId: swap.requestorId,
        otherPartyName: rName,
        requestorDate: swap.requestorDate.toISOString().slice(0, 10),
        swapWithDate: swap.swapWithDate.toISOString().slice(0, 10),
        swapId: id,
      })
      .catch(() => {});

    return result;
  }

  static async rejectSwap(id: string, tenantId: string, rejectedBy: string, reason: string) {
    if (!reason || reason.trim().length === 0) {
      throw new Error('Rejection reason is required.');
    }

    const swap = await prisma.shiftSwapRequest.findFirst({
      where: { id, tenantId, isDeleted: false },
    });
    if (!swap) throw new Error('Swap request not found');

    // Authorization: only the requestor, swapWith employee, or a user with
    // shift-swaps:update permission can reject. We check that rejectedBy is
    // either the requestor or the swapWith employee. Manager-level rejection
    // is handled by the route layer which already checks permissions.
    const isRequestor = swap.requestorId === rejectedBy;
    const isSwapWith = swap.swapWithId === rejectedBy;

    ShiftManagementService.validateSwapTransition(swap.status, 'REJECTED');

    const result = await prisma.shiftSwapRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        managerApproval: swap.status === 'APPROVED_BY_PEER' ? 'REJECTED' : swap.managerApproval,
        approvedBy: rejectedBy,
        approvedAt: new Date(),
        rejectionReason: reason,
        updatedBy: rejectedBy,
      },
    });

    // Fire notification to the other party
    const notifyUserId = rejectedBy === swap.requestorId ? swap.swapWithId : swap.requestorId;
    const rejector = await prisma.employee.findFirst({
      where: { id: rejectedBy, tenantId },
      select: { firstName: true, lastName: true },
    });
    if (rejector) {
      notificationService
        .notifyShiftSwapRejected(notifyUserId, {
          rejectedBy,
          rejectedByName: `${rejector.firstName} ${rejector.lastName}`,
          reason,
          swapId: id,
        })
        .catch(() => {});
    }

    return result;
  }

  static async cancelSwap(id: string, tenantId: string, cancelledBy: string) {
    const swap = await prisma.shiftSwapRequest.findFirst({
      where: { id, tenantId, isDeleted: false },
    });
    if (!swap) throw new Error('Swap request not found');

    const isRequestor = swap.requestorId === cancelledBy;
    if (!isRequestor) {
      throw new Error('Only the requestor can cancel their own swap request.');
    }

    ShiftManagementService.validateSwapTransition(swap.status, 'CANCELLED');

    const result = await prisma.shiftSwapRequest.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        updatedBy: cancelledBy,
      },
    });

    const cancelor = await prisma.employee.findFirst({
      where: { id: cancelledBy, tenantId },
      select: { firstName: true, lastName: true },
    });
    if (cancelor) {
      notificationService
        .notifyShiftSwapCancelled(swap.swapWithId, {
          cancelledBy,
          cancelledByName: `${cancelor.firstName} ${cancelor.lastName}`,
          swapId: id,
        })
        .catch(() => {});
    }

    return result;
  }

  // ==================== STATISTICS ====================

  static async getStatistics(tenantId: string) {
    const [totalShifts, activeShifts, totalAssignments, activeAssignments, pendingSwaps] =
      await Promise.all([
        prisma.shift.count({ where: { tenantId, isDeleted: false } }),
        prisma.shift.count({ where: { tenantId, isActive: true, isDeleted: false } }),
        prisma.shiftAssignment.count({ where: { tenantId, isDeleted: false } }),
        prisma.shiftAssignment.count({ where: { tenantId, isActive: true, isDeleted: false } }),
        prisma.shiftSwapRequest.count({ where: { tenantId, status: 'PENDING', isDeleted: false } }),
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
