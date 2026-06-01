import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

export const createOvertimeRequestSchema = z.object({
  tenantId: z.string(),
  employeeId: z.string(),
  overtimeDate: z.string().or(z.date()),
  startTime: z.string().or(z.date()),
  endTime: z.string().or(z.date()),
  totalHours: z.number(),
  overtimeType: z.enum(['REGULAR', 'HOLIDAY', 'WEEKEND']),
  reason: z.string(),
  workDescription: z.string().optional(),
  project: z.string().optional(),
});

export const updateOvertimeRequestSchema = createOvertimeRequestSchema.partial().omit({ tenantId: true });

export const createCompOffSchema = z.object({
  tenantId: z.string(),
  employeeId: z.string(),
  earnedDate: z.string().or(z.date()),
  earnedHours: z.number(),
  expiryDate: z.string().or(z.date()),
  remarks: z.string().optional(),
});

export const createRegularizationSchema = z.object({
  tenantId: z.string(),
  employeeId: z.string(),
  date: z.string().or(z.date()),
  regularizationType: z.enum(['MISSED_PUNCH', 'EARLY_OUT', 'LATE_IN', 'WRONG_PUNCH']),
  requestedClockIn: z.string().or(z.date()).optional(),
  requestedClockOut: z.string().or(z.date()).optional(),
  reason: z.string(),
  attachments: z.array(z.string()).default([]),
});

export class OvertimeService {
  // ==================== OVERTIME REQUESTS ====================

  static async findAll(filter: any) {
    const { tenantId, employeeId, status, overtimeType, startDate, endDate, page = 1, limit = 50, sortBy = 'overtimeDate', sortOrder = 'desc' } = filter;

    const where: any = { tenantId };
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;
    if (overtimeType) where.overtimeType = overtimeType;
    if (startDate && endDate) {
      where.overtimeDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const [data, total] = await Promise.all([
      prisma.overtimeRequest.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.overtimeRequest.count({ where }),
    ]);

    return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  static async findById(id: string, tenantId: string) {
    return prisma.overtimeRequest.findFirst({
      where: { id, tenantId },
    });
  }

  static async create(data: z.infer<typeof createOvertimeRequestSchema>) {
    const validated = createOvertimeRequestSchema.parse(data);
    return prisma.overtimeRequest.create({
      data: {
        ...validated,
        overtimeDate: new Date(validated.overtimeDate),
        startTime: new Date(validated.startTime),
        endTime: new Date(validated.endTime),
      },
    });
  }

  static async update(id: string, tenantId: string, data: z.infer<typeof updateOvertimeRequestSchema>) {
    const validated = updateOvertimeRequestSchema.parse(data);
    const existing = await prisma.overtimeRequest.findFirst({ where: { id, tenantId } });
    if (!existing) return null;

    const updateData: any = { ...validated };
    if (validated.overtimeDate) updateData.overtimeDate = new Date(validated.overtimeDate);
    if (validated.startTime) updateData.startTime = new Date(validated.startTime);
    if (validated.endTime) updateData.endTime = new Date(validated.endTime);

    return prisma.overtimeRequest.update({ where: { id }, data: updateData });
  }

  static async delete(id: string, tenantId: string) {
    const existing = await prisma.overtimeRequest.findFirst({ where: { id, tenantId } });
    if (!existing) return null;
    return prisma.overtimeRequest.delete({ where: { id } });
  }

  static async approve(id: string, tenantId: string, approvedBy: string) {
    const overtime = await prisma.overtimeRequest.findFirst({ where: { id, tenantId } });
    if (!overtime) throw new Error('Overtime request not found');
    if (overtime.status !== 'PENDING') throw new Error('Only pending requests can be approved');

    return prisma.overtimeRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy,
        approvedAt: new Date(),
      },
    });
  }

  static async reject(id: string, tenantId: string, rejectedBy: string, reason: string) {
    const overtime = await prisma.overtimeRequest.findFirst({ where: { id, tenantId } });
    if (!overtime) throw new Error('Overtime request not found');
    if (overtime.status !== 'PENDING') throw new Error('Only pending requests can be rejected');

    return prisma.overtimeRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        approvedBy: rejectedBy,
        approvedAt: new Date(),
        rejectionReason: reason,
      },
    });
  }

  static async verify(id: string, tenantId: string, verifiedBy: string, actualHours: number) {
    const overtime = await prisma.overtimeRequest.findFirst({ where: { id, tenantId } });
    if (!overtime) throw new Error('Overtime request not found');
    if (overtime.status !== 'APPROVED') throw new Error('Only approved requests can be verified');

    return prisma.overtimeRequest.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        actualHours,
        verifiedBy,
        verifiedAt: new Date(),
      },
    });
  }

  static async convertToCompOff(id: string, tenantId: string) {
    const overtime = await prisma.overtimeRequest.findFirst({ where: { id, tenantId } });
    if (!overtime) throw new Error('Overtime request not found');
    if (overtime.status !== 'APPROVED') throw new Error('Only approved overtime can be converted to comp-off');

    // Create comp-off
    const expiryDate = new Date(overtime.overtimeDate);
    expiryDate.setMonth(expiryDate.getMonth() + 3); // 3 months validity

    await prisma.compOffRequest.create({
      data: {
        tenantId,
        employeeId: overtime.employeeId,
        earnedDate: overtime.overtimeDate,
        earnedHours: overtime.totalHours,
        expiryDate,
        status: 'EARNED',
        remarks: `Generated from overtime request on ${overtime.overtimeDate.toLocaleDateString()}`,
      },
    });

    // Mark overtime as compensated
    return prisma.overtimeRequest.update({
      where: { id },
      data: {
        compensationType: 'COMP_OFF',
        isCompensated: true,
        compensatedAt: new Date(),
      },
    });
  }

  // ==================== COMP-OFF MANAGEMENT ====================

  static async findAllCompOffs(filter: any) {
    const { tenantId, employeeId, status, page = 1, limit = 50 } = filter;

    const where: any = { tenantId };
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.compOffRequest.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { earnedDate: 'desc' },
      }),
      prisma.compOffRequest.count({ where }),
    ]);

    return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  static async createCompOff(data: z.infer<typeof createCompOffSchema>) {
    const validated = createCompOffSchema.parse(data);
    return prisma.compOffRequest.create({
      data: {
        ...validated,
        earnedDate: new Date(validated.earnedDate),
        expiryDate: new Date(validated.expiryDate),
      },
    });
  }

  static async applyCompOff(id: string, tenantId: string, appliedDate: Date) {
    const compOff = await prisma.compOffRequest.findFirst({ where: { id, tenantId } });
    if (!compOff) throw new Error('Comp-off not found');
    if (compOff.status !== 'EARNED') throw new Error('Only earned comp-offs can be applied');

    return prisma.compOffRequest.update({
      where: { id },
      data: {
        status: 'APPLIED',
        appliedDate,
      },
    });
  }

  static async approveCompOff(id: string, tenantId: string, approvedBy: string) {
    const compOff = await prisma.compOffRequest.findFirst({ where: { id, tenantId } });
    if (!compOff) throw new Error('Comp-off not found');
    if (compOff.status !== 'APPLIED') throw new Error('Only applied comp-offs can be approved');

    return prisma.compOffRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy,
        approvedAt: new Date(),
      },
    });
  }

  static async availCompOff(id: string, tenantId: string) {
    const compOff = await prisma.compOffRequest.findFirst({ where: { id, tenantId } });
    if (!compOff) throw new Error('Comp-off not found');
    if (compOff.status !== 'APPROVED') throw new Error('Only approved comp-offs can be availed');

    return prisma.compOffRequest.update({
      where: { id },
      data: { status: 'AVAILED' },
    });
  }

  // ==================== ATTENDANCE REGULARIZATION ====================

  static async findAllRegularizations(filter: any) {
    const { tenantId, employeeId, status, page = 1, limit = 50 } = filter;

    const where: any = { tenantId };
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.attendanceRegularization.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      prisma.attendanceRegularization.count({ where }),
    ]);

    return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  static async createRegularization(data: z.infer<typeof createRegularizationSchema>) {
    const validated = createRegularizationSchema.parse(data);

    const createData: any = {
      ...validated,
      date: new Date(validated.date),
    };

    if (validated.requestedClockIn) createData.requestedClockIn = new Date(validated.requestedClockIn);
    if (validated.requestedClockOut) createData.requestedClockOut = new Date(validated.requestedClockOut);

    return prisma.attendanceRegularization.create({ data: createData });
  }

  static async approveRegularization(id: string, tenantId: string, approvedBy: string) {
    const regularization = await prisma.attendanceRegularization.findFirst({ where: { id, tenantId } });
    if (!regularization) throw new Error('Regularization request not found');

    // Update the actual attendance record
    if (regularization.requestedClockIn || regularization.requestedClockOut) {
      await prisma.attendanceRecord.updateMany({
        where: {
          tenantId,
          employeeId: regularization.employeeId,
          date: regularization.date,
        },
        data: {
          clockIn: regularization.requestedClockIn || undefined,
          clockOut: regularization.requestedClockOut || undefined,
          isRegularized: true,
          regularizationId: id,
        },
      });
    }

    return prisma.attendanceRegularization.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy,
        approvedAt: new Date(),
      },
    });
  }

  static async rejectRegularization(id: string, tenantId: string, rejectedBy: string, reason: string) {
    const regularization = await prisma.attendanceRegularization.findFirst({ where: { id, tenantId } });
    if (!regularization) throw new Error('Regularization request not found');

    return prisma.attendanceRegularization.update({
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

  static async getStatistics(tenantId: string, employeeId?: string) {
    const where: any = { tenantId };
    if (employeeId) where.employeeId = employeeId;

    const [totalOvertime, pendingOvertime, approvedOvertime, totalCompOff, availableCompOff, pendingRegularization] = await Promise.all([
      prisma.overtimeRequest.count({ where }),
      prisma.overtimeRequest.count({ where: { ...where, status: 'PENDING' } }),
      prisma.overtimeRequest.count({ where: { ...where, status: 'APPROVED' } }),
      prisma.compOffRequest.count({ where }),
      prisma.compOffRequest.count({ where: { ...where, status: 'EARNED' } }),
      prisma.attendanceRegularization.count({ where: { ...where, status: 'PENDING' } }),
    ]);

    // Calculate total hours
    const overtimeRecords = await prisma.overtimeRequest.findMany({
      where: { ...where, status: 'APPROVED' },
      select: { totalHours: true, actualHours: true },
    });

    const totalOvertimeHours = overtimeRecords.reduce((sum: any, r: any) => sum + (r.actualHours || r.totalHours), 0);

    const compOffRecords = await prisma.compOffRequest.findMany({
      where: { ...where, status: 'EARNED' },
      select: { earnedHours: true },
    });

    const totalCompOffHours = compOffRecords.reduce((sum: any, r: any) => sum + r.earnedHours, 0);

    return {
      totalOvertime,
      pendingOvertime,
      approvedOvertime,
      totalOvertimeHours: Math.round(totalOvertimeHours * 10) / 10,
      totalCompOff,
      availableCompOff,
      totalCompOffHours: Math.round(totalCompOffHours * 10) / 10,
      pendingRegularization,
    };
  }
}
