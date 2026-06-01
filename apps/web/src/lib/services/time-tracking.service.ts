import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

export const createAttendancePunchSchema = z.object({
  tenantId: z.string(),
  employeeId: z.string(),
  punchDate: z.string().or(z.date()),
  punchTime: z.string().or(z.date()),
  punchType: z.enum(['CLOCK_IN', 'CLOCK_OUT', 'BREAK_START', 'BREAK_END']),
  location: z.string().optional(),
  device: z.string().optional(),
  ipAddress: z.string().optional(),
  photo: z.string().optional(),
  notes: z.string().optional(),
});

export const updateAttendancePunchSchema = createAttendancePunchSchema.partial().omit({ tenantId: true });

export const createAttendanceRecordSchema = z.object({
  tenantId: z.string(),
  employeeId: z.string(),
  date: z.string().or(z.date()),
  shiftId: z.string().optional(),
  clockIn: z.string().or(z.date()).optional(),
  clockOut: z.string().or(z.date()).optional(),
  status: z.string(),
  remarks: z.string().optional(),
});

export class TimeTrackingService {
  // ==================== ATTENDANCE PUNCHES ====================

  static async findAllPunches(filter: any) {
    const { tenantId, employeeId, punchDate, punchType, page = 1, limit = 50, sortBy = 'punchTime', sortOrder = 'desc' } = filter;

    const where: any = { tenantId };
    if (employeeId) where.employeeId = employeeId;
    if (punchDate) where.punchDate = { gte: new Date(punchDate), lt: new Date(new Date(punchDate).getTime() + 24 * 60 * 60 * 1000) };
    if (punchType) where.punchType = punchType;

    const [data, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.attendance.count({ where }),
    ]);

    return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  static async findPunchById(id: string, tenantId: string) {
    return prisma.attendance.findFirst({
      where: { id, tenantId },
    });
  }

  static async createPunch(data: z.infer<typeof createAttendancePunchSchema>) {
    const validated = createAttendancePunchSchema.parse(data);
    return prisma.attendance.create({
      data: {
        ...validated,
        punchDate: new Date(validated.punchDate),
        punchTime: new Date(validated.punchTime),
      },
    });
  }

  static async updatePunch(id: string, tenantId: string, data: z.infer<typeof updateAttendancePunchSchema>) {
    const validated = updateAttendancePunchSchema.parse(data);
    const existing = await prisma.attendance.findFirst({ where: { id, tenantId } });
    if (!existing) return null;

    const updateData: any = { ...validated };
    if (validated.punchDate) updateData.punchDate = new Date(validated.punchDate);
    if (validated.punchTime) updateData.punchTime = new Date(validated.punchTime);

    return prisma.attendance.update({ where: { id }, data: updateData });
  }

  static async deletePunch(id: string, tenantId: string) {
    const existing = await prisma.attendance.findFirst({ where: { id, tenantId } });
    if (!existing) return null;
    return prisma.attendance.delete({ where: { id } });
  }

  static async verifyPunch(id: string, tenantId: string, verifiedBy: string) {
    const punch = await prisma.attendance.findFirst({ where: { id, tenantId } });
    if (!punch) throw new Error('Punch record not found');

    return prisma.attendance.update({
      where: { id },
      data: {
        isVerified: true,
        verifiedBy,
        verifiedAt: new Date(),
      },
    });
  }

  // ==================== ATTENDANCE RECORDS ====================

  static async findAllRecords(filter: any) {
    const { tenantId, employeeId, startDate, endDate, status, page = 1, limit = 50, sortBy = 'date', sortOrder = 'desc' } = filter;

    const where: any = { tenantId };
    if (employeeId) where.employeeId = employeeId;
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.attendanceRecord.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.attendanceRecord.count({ where }),
    ]);

    return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  static async findRecordById(id: string, tenantId: string) {
    return prisma.attendanceRecord.findFirst({
      where: { id, tenantId },
    });
  }

  static async createRecord(data: z.infer<typeof createAttendanceRecordSchema>) {
    const validated = createAttendanceRecordSchema.parse(data);

    const updateData: any = {
      ...validated,
      date: new Date(validated.date),
    };

    if (validated.clockIn) updateData.clockIn = new Date(validated.clockIn);
    if (validated.clockOut) updateData.clockOut = new Date(validated.clockOut);

    // Calculate work hours if both clock in and out exist
    if (updateData.clockIn && updateData.clockOut) {
      const diff = updateData.clockOut.getTime() - updateData.clockIn.getTime();
      updateData.workHours = diff / (1000 * 60 * 60); // Convert to hours
    }

    return prisma.attendanceRecord.create({ data: updateData });
  }

  static async updateRecord(id: string, tenantId: string, data: any) {
    const existing = await prisma.attendanceRecord.findFirst({ where: { id, tenantId } });
    if (!existing) return null;

    const updateData: any = { ...data };
    if (data.date) updateData.date = new Date(data.date);
    if (data.clockIn) updateData.clockIn = new Date(data.clockIn);
    if (data.clockOut) updateData.clockOut = new Date(data.clockOut);

    // Recalculate work hours if times are updated
    if (updateData.clockIn || updateData.clockOut) {
      const clockIn = updateData.clockIn || existing.clockIn;
      const clockOut = updateData.clockOut || existing.clockOut;
      if (clockIn && clockOut) {
        const diff = clockOut.getTime() - clockIn.getTime();
        updateData.workHours = diff / (1000 * 60 * 60);
      }
    }

    return prisma.attendanceRecord.update({ where: { id }, data: updateData });
  }

  static async deleteRecord(id: string, tenantId: string) {
    const existing = await prisma.attendanceRecord.findFirst({ where: { id, tenantId } });
    if (!existing) return null;
    return prisma.attendanceRecord.delete({ where: { id } });
  }

  static async approveRecord(id: string, tenantId: string, approvedBy: string) {
    const record = await prisma.attendanceRecord.findFirst({ where: { id, tenantId } });
    if (!record) throw new Error('Attendance record not found');

    return prisma.attendanceRecord.update({
      where: { id },
      data: {
        approvalStatus: 'APPROVED',
        approvedBy,
        approvedAt: new Date(),
      },
    });
  }

  static async rejectRecord(id: string, tenantId: string, rejectedBy: string, reason: string) {
    const record = await prisma.attendanceRecord.findFirst({ where: { id, tenantId } });
    if (!record) throw new Error('Attendance record not found');

    return prisma.attendanceRecord.update({
      where: { id },
      data: {
        approvalStatus: 'REJECTED',
        approvedBy: rejectedBy,
        approvedAt: new Date(),
        remarks: reason,
      },
    });
  }

  // ==================== STATISTICS ====================

  static async getStatistics(tenantId: string, employeeId?: string, month?: string) {
    const where: any = { tenantId };
    if (employeeId) where.employeeId = employeeId;

    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0);
      where.date = { gte: startDate, lte: endDate };
    }

    const [total, present, absent, late, pendingApproval, byStatus] = await Promise.all([
      prisma.attendanceRecord.count({ where }),
      prisma.attendanceRecord.count({ where: { ...where, status: 'PRESENT' } }),
      prisma.attendanceRecord.count({ where: { ...where, status: 'ABSENT' } }),
      prisma.attendanceRecord.count({ where: { ...where, isLate: true } }),
      prisma.attendanceRecord.count({ where: { ...where, approvalStatus: 'PENDING' } }),
      prisma.attendanceRecord.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
    ]);

    // Calculate total work hours
    const records = await prisma.attendanceRecord.findMany({
      where,
      select: { workHours: true, overtimeHours: true },
    });

    const totalWorkHours = records.reduce((sum: any, r: any) => sum + r.workHours, 0);
    const totalOvertimeHours = records.reduce((sum: any, r: any) => sum + r.overtimeHours, 0);

    return {
      total,
      present,
      absent,
      late,
      pendingApproval,
      totalWorkHours: Math.round(totalWorkHours * 10) / 10,
      totalOvertimeHours: Math.round(totalOvertimeHours * 10) / 10,
      byStatus: byStatus.map((s: any) => ({ status: s.status, count: s._count })),
    };
  }

  static async getTodayPunches(tenantId: string, employeeId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return prisma.attendance.findMany({
      where: {
        tenantId,
        employeeId,
        punchDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: { punchTime: 'asc' },
    });
  }
}
