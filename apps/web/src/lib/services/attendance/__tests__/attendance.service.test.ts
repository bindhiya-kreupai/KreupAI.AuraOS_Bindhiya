import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { AttendanceService } from '../attendance.service';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    attendance: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    employee: {
      findUnique: vi.fn(),
    },
    shift: {
      findUnique: vi.fn(),
    },
    attendanceRegularization: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('AttendanceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockEmployee = {
    id: 'emp-1',
    employeeId: 'E001',
    tenantId: 'tenant-1',
    firstName: 'John',
    lastName: 'Doe',
    shiftId: 'shift-1',
  };

  const mockShift = {
    id: 'shift-1',
    tenantId: 'tenant-1',
    name: 'General Shift',
    startTime: '09:00',
    endTime: '18:00',
    gracePeriodMinutes: 15,
    halfDayHours: 4,
    fullDayHours: 8,
  };

  const mockAttendance = {
    id: 'att-1',
    employeeId: 'emp-1',
    tenantId: 'tenant-1',
    date: new Date('2024-06-15'),
    clockIn: new Date('2024-06-15T09:00:00'),
    clockOut: new Date('2024-06-15T18:00:00'),
    status: 'PRESENT',
    workingHours: 8,
    overtimeHours: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('clockIn', () => {
    it('should create clock-in record', async () => {
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(mockEmployee as any);
      vi.mocked(prisma.shift.findUnique).mockResolvedValue(mockShift as any);
      vi.mocked(prisma.attendance.findFirst).mockResolvedValue(null); // No existing attendance
      vi.mocked(prisma.attendance.create).mockResolvedValue(mockAttendance as any);

      const result = await AttendanceService.clockIn('emp-1', 'tenant-1', new Date('2024-06-15T09:00:00'));

      expect(result).toBeDefined();
      expect(result.clockIn).toBeDefined();
      expect(prisma.attendance.create).toHaveBeenCalled();
    });

    it('should mark as late if after grace period', async () => {
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(mockEmployee as any);
      vi.mocked(prisma.shift.findUnique).mockResolvedValue(mockShift as any);
      vi.mocked(prisma.attendance.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.attendance.create).mockResolvedValue({
        ...mockAttendance,
        clockIn: new Date('2024-06-15T09:30:00'), // 30 mins late
        isLate: true,
        lateMinutes: 30,
      } as any);

      const result = await AttendanceService.clockIn(
        'emp-1',
        'tenant-1',
        new Date('2024-06-15T09:30:00')
      );

      expect(result.isLate).toBe(true);
      expect(result.lateMinutes).toBe(30);
    });

    it('should not mark as late within grace period', async () => {
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(mockEmployee as any);
      vi.mocked(prisma.shift.findUnique).mockResolvedValue(mockShift as any);
      vi.mocked(prisma.attendance.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.attendance.create).mockResolvedValue({
        ...mockAttendance,
        clockIn: new Date('2024-06-15T09:10:00'), // 10 mins late, within grace
        isLate: false,
        lateMinutes: 0,
      } as any);

      const result = await AttendanceService.clockIn(
        'emp-1',
        'tenant-1',
        new Date('2024-06-15T09:10:00')
      );

      expect(result.isLate).toBe(false);
    });

    it('should throw error if already clocked in', async () => {
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(mockEmployee as any);
      vi.mocked(prisma.attendance.findFirst).mockResolvedValue(mockAttendance as any); // Already exists

      await expect(
        AttendanceService.clockIn('emp-1', 'tenant-1', new Date('2024-06-15T09:00:00'))
      ).rejects.toThrow('Already clocked in');
    });

    it('should throw error if employee not found', async () => {
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null);

      await expect(
        AttendanceService.clockIn('emp-1', 'tenant-1', new Date())
      ).rejects.toThrow('Employee not found');
    });
  });

  describe('clockOut', () => {
    it('should update clock-out record', async () => {
      vi.mocked(prisma.attendance.findFirst).mockResolvedValue({
        ...mockAttendance,
        clockOut: null, // Not clocked out yet
      } as any);
      vi.mocked(prisma.shift.findUnique).mockResolvedValue(mockShift as any);
      vi.mocked(prisma.attendance.update).mockResolvedValue(mockAttendance as any);

      const result = await AttendanceService.clockOut(
        'emp-1',
        'tenant-1',
        new Date('2024-06-15T18:00:00')
      );

      expect(result.clockOut).toBeDefined();
      expect(prisma.attendance.update).toHaveBeenCalled();
    });

    it('should calculate working hours', async () => {
      vi.mocked(prisma.attendance.findFirst).mockResolvedValue({
        ...mockAttendance,
        clockIn: new Date('2024-06-15T09:00:00'),
        clockOut: null,
      } as any);
      vi.mocked(prisma.shift.findUnique).mockResolvedValue(mockShift as any);
      vi.mocked(prisma.attendance.update).mockResolvedValue({
        ...mockAttendance,
        clockOut: new Date('2024-06-15T18:00:00'),
        workingHours: 8, // 9 hours - 1 hour break
      } as any);

      const result = await AttendanceService.clockOut(
        'emp-1',
        'tenant-1',
        new Date('2024-06-15T18:00:00')
      );

      expect(result.workingHours).toBe(8);
    });

    it('should calculate overtime hours', async () => {
      vi.mocked(prisma.attendance.findFirst).mockResolvedValue({
        ...mockAttendance,
        clockIn: new Date('2024-06-15T09:00:00'),
        clockOut: null,
      } as any);
      vi.mocked(prisma.shift.findUnique).mockResolvedValue(mockShift as any);
      vi.mocked(prisma.attendance.update).mockResolvedValue({
        ...mockAttendance,
        clockOut: new Date('2024-06-15T20:00:00'), // 2 hours overtime
        workingHours: 10,
        overtimeHours: 2,
      } as any);

      const result = await AttendanceService.clockOut(
        'emp-1',
        'tenant-1',
        new Date('2024-06-15T20:00:00')
      );

      expect(result.overtimeHours).toBe(2);
    });

    it('should mark as early departure', async () => {
      vi.mocked(prisma.attendance.findFirst).mockResolvedValue({
        ...mockAttendance,
        clockIn: new Date('2024-06-15T09:00:00'),
        clockOut: null,
      } as any);
      vi.mocked(prisma.shift.findUnique).mockResolvedValue(mockShift as any);
      vi.mocked(prisma.attendance.update).mockResolvedValue({
        ...mockAttendance,
        clockOut: new Date('2024-06-15T16:00:00'), // Left 2 hours early
        isEarlyDeparture: true,
        earlyDepartureMinutes: 120,
      } as any);

      const result = await AttendanceService.clockOut(
        'emp-1',
        'tenant-1',
        new Date('2024-06-15T16:00:00')
      );

      expect(result.isEarlyDeparture).toBe(true);
      expect(result.earlyDepartureMinutes).toBe(120);
    });

    it('should mark as half day if insufficient hours', async () => {
      vi.mocked(prisma.attendance.findFirst).mockResolvedValue({
        ...mockAttendance,
        clockIn: new Date('2024-06-15T09:00:00'),
        clockOut: null,
      } as any);
      vi.mocked(prisma.shift.findUnique).mockResolvedValue(mockShift as any);
      vi.mocked(prisma.attendance.update).mockResolvedValue({
        ...mockAttendance,
        clockOut: new Date('2024-06-15T13:00:00'), // Only 4 hours
        workingHours: 3,
        status: 'HALF_DAY',
      } as any);

      const result = await AttendanceService.clockOut(
        'emp-1',
        'tenant-1',
        new Date('2024-06-15T13:00:00')
      );

      expect(result.status).toBe('HALF_DAY');
    });

    it('should throw error if not clocked in', async () => {
      vi.mocked(prisma.attendance.findFirst).mockResolvedValue(null);

      await expect(
        AttendanceService.clockOut('emp-1', 'tenant-1', new Date())
      ).rejects.toThrow('Not clocked in');
    });

    it('should throw error if already clocked out', async () => {
      vi.mocked(prisma.attendance.findFirst).mockResolvedValue(mockAttendance as any); // Already has clockOut

      await expect(
        AttendanceService.clockOut('emp-1', 'tenant-1', new Date())
      ).rejects.toThrow('Already clocked out');
    });
  });

  describe('getAttendance', () => {
    it('should return attendance records with pagination', async () => {
      const mockRecords = [mockAttendance, { ...mockAttendance, id: 'att-2' }];
      vi.mocked(prisma.attendance.count).mockResolvedValue(2);
      vi.mocked(prisma.attendance.findMany).mockResolvedValue(mockRecords as any);

      const result = await AttendanceService.getAttendance('tenant-1', {
        page: 1,
        limit: 20,
      });

      expect(result.data).toHaveLength(2);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      });
    });

    it('should filter by employee', async () => {
      vi.mocked(prisma.attendance.count).mockResolvedValue(1);
      vi.mocked(prisma.attendance.findMany).mockResolvedValue([mockAttendance] as any);

      await AttendanceService.getAttendance('tenant-1', {
        employeeId: 'emp-1',
      });

      expect(prisma.attendance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            employeeId: 'emp-1',
          }),
        })
      );
    });

    it('should filter by date range', async () => {
      vi.mocked(prisma.attendance.count).mockResolvedValue(1);
      vi.mocked(prisma.attendance.findMany).mockResolvedValue([mockAttendance] as any);

      await AttendanceService.getAttendance('tenant-1', {
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-30'),
      });

      expect(prisma.attendance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            date: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        })
      );
    });

    it('should filter by status', async () => {
      vi.mocked(prisma.attendance.count).mockResolvedValue(1);
      vi.mocked(prisma.attendance.findMany).mockResolvedValue([mockAttendance] as any);

      await AttendanceService.getAttendance('tenant-1', {
        status: 'PRESENT',
      });

      expect(prisma.attendance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'PRESENT',
          }),
        })
      );
    });
  });

  describe('markAbsent', () => {
    it('should mark employee as absent', async () => {
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(mockEmployee as any);
      vi.mocked(prisma.attendance.findFirst).mockResolvedValue(null); // No attendance record
      vi.mocked(prisma.attendance.create).mockResolvedValue({
        ...mockAttendance,
        status: 'ABSENT',
        clockIn: null,
        clockOut: null,
      } as any);

      const result = await AttendanceService.markAbsent('emp-1', 'tenant-1', new Date('2024-06-15'));

      expect(result.status).toBe('ABSENT');
      expect(result.clockIn).toBeNull();
      expect(result.clockOut).toBeNull();
    });

    it('should throw error if attendance already exists', async () => {
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(mockEmployee as any);
      vi.mocked(prisma.attendance.findFirst).mockResolvedValue(mockAttendance as any);

      await expect(
        AttendanceService.markAbsent('emp-1', 'tenant-1', new Date('2024-06-15'))
      ).rejects.toThrow('Attendance record already exists');
    });
  });

  describe('requestRegularization', () => {
    it('should create regularization request', async () => {
      vi.mocked(prisma.attendance.findFirst).mockResolvedValue({
        ...mockAttendance,
        isLate: true,
        lateMinutes: 30,
      } as any);
      vi.mocked(prisma.attendanceRegularization.create).mockResolvedValue({
        id: 'reg-1',
        attendanceId: 'att-1',
        employeeId: 'emp-1',
        tenantId: 'tenant-1',
        reason: 'Traffic jam',
        status: 'PENDING',
      } as any);

      const result = await AttendanceService.requestRegularization(
        'att-1',
        'tenant-1',
        'Traffic jam'
      );

      expect(result.status).toBe('PENDING');
      expect(result.reason).toBe('Traffic jam');
    });

    it('should require regularization reason', async () => {
      vi.mocked(prisma.attendance.findFirst).mockResolvedValue(mockAttendance as any);

      await expect(
        AttendanceService.requestRegularization('att-1', 'tenant-1', '')
      ).rejects.toThrow('Regularization reason is required');
    });

    it('should throw error if attendance not found', async () => {
      vi.mocked(prisma.attendance.findFirst).mockResolvedValue(null);

      await expect(
        AttendanceService.requestRegularization('att-1', 'tenant-1', 'Traffic')
      ).rejects.toThrow('Attendance record not found');
    });
  });

  describe('approveRegularization', () => {
    it('should approve regularization request', async () => {
      vi.mocked(prisma.attendanceRegularization.findUnique).mockResolvedValue({
        id: 'reg-1',
        attendanceId: 'att-1',
        status: 'PENDING',
      } as any);
      vi.mocked(prisma.attendanceRegularization.update).mockResolvedValue({
        id: 'reg-1',
        status: 'APPROVED',
        approvedBy: 'mgr-1',
      } as any);
      vi.mocked(prisma.attendance.update).mockResolvedValue({
        ...mockAttendance,
        isLate: false,
        lateMinutes: 0,
      } as any);

      const result = await AttendanceService.approveRegularization('reg-1', 'tenant-1', 'mgr-1');

      expect(result.status).toBe('APPROVED');
      expect(result.approvedBy).toBe('mgr-1');
    });

    it('should update attendance record on approval', async () => {
      vi.mocked(prisma.attendanceRegularization.findUnique).mockResolvedValue({
        id: 'reg-1',
        attendanceId: 'att-1',
        status: 'PENDING',
      } as any);
      vi.mocked(prisma.attendanceRegularization.update).mockResolvedValue({
        id: 'reg-1',
        status: 'APPROVED',
      } as any);
      vi.mocked(prisma.attendance.update).mockResolvedValue(mockAttendance as any);

      await AttendanceService.approveRegularization('reg-1', 'tenant-1', 'mgr-1');

      expect(prisma.attendance.update).toHaveBeenCalled();
    });

    it('should throw error if not pending', async () => {
      vi.mocked(prisma.attendanceRegularization.findUnique).mockResolvedValue({
        id: 'reg-1',
        status: 'APPROVED',
      } as any);

      await expect(
        AttendanceService.approveRegularization('reg-1', 'tenant-1', 'mgr-1')
      ).rejects.toThrow('Regularization is not pending');
    });
  });

  describe('getAttendanceSummary', () => {
    it('should return attendance summary for employee', async () => {
      vi.mocked(prisma.attendance.findMany).mockResolvedValue([
        { ...mockAttendance, status: 'PRESENT', workingHours: 8, overtimeHours: 0 },
        { ...mockAttendance, id: 'att-2', status: 'PRESENT', workingHours: 8, overtimeHours: 2 },
        { ...mockAttendance, id: 'att-3', status: 'ABSENT' },
        { ...mockAttendance, id: 'att-4', status: 'HALF_DAY', workingHours: 4 },
        { ...mockAttendance, id: 'att-5', status: 'PRESENT', isLate: true, lateMinutes: 30 },
      ] as any);

      const result = await AttendanceService.getAttendanceSummary(
        'emp-1',
        'tenant-1',
        new Date('2024-06-01'),
        new Date('2024-06-30')
      );

      expect(result.totalDays).toBe(5);
      expect(result.present).toBe(3);
      expect(result.absent).toBe(1);
      expect(result.halfDay).toBe(1);
      expect(result.totalWorkingHours).toBe(20); // 8 + 8 + 4
      expect(result.totalOvertimeHours).toBe(2);
      expect(result.lateDays).toBe(1);
    });

    it('should calculate attendance percentage', async () => {
      vi.mocked(prisma.attendance.findMany).mockResolvedValue([
        { ...mockAttendance, status: 'PRESENT' },
        { ...mockAttendance, id: 'att-2', status: 'PRESENT' },
        { ...mockAttendance, id: 'att-3', status: 'PRESENT' },
        { ...mockAttendance, id: 'att-4', status: 'ABSENT' },
      ] as any);

      const result = await AttendanceService.getAttendanceSummary(
        'emp-1',
        'tenant-1',
        new Date('2024-06-01'),
        new Date('2024-06-30')
      );

      expect(result.attendancePercentage).toBe(75); // 3 out of 4
    });
  });

  describe('getBulkAttendance', () => {
    it('should return attendance for multiple employees', async () => {
      vi.mocked(prisma.attendance.findMany).mockResolvedValue([
        mockAttendance,
        { ...mockAttendance, id: 'att-2', employeeId: 'emp-2' },
      ] as any);

      const result = await AttendanceService.getBulkAttendance(
        'tenant-1',
        ['emp-1', 'emp-2'],
        new Date('2024-06-15')
      );

      expect(result).toHaveLength(2);
      expect(result[0].employeeId).toBe('emp-1');
      expect(result[1].employeeId).toBe('emp-2');
    });

    it('should handle date range', async () => {
      vi.mocked(prisma.attendance.findMany).mockResolvedValue([mockAttendance] as any);

      await AttendanceService.getBulkAttendance(
        'tenant-1',
        ['emp-1'],
        new Date('2024-06-01'),
        new Date('2024-06-30')
      );

      expect(prisma.attendance.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          date: expect.objectContaining({
            gte: expect.any(Date),
            lte: expect.any(Date),
          }),
        }),
      });
    });
  });

  describe('updateAttendance', () => {
    it('should update attendance record', async () => {
      vi.mocked(prisma.attendance.findUnique).mockResolvedValue(mockAttendance as any);
      vi.mocked(prisma.attendance.update).mockResolvedValue({
        ...mockAttendance,
        status: 'PRESENT',
      } as any);

      const result = await AttendanceService.updateAttendance('att-1', 'tenant-1', {
        status: 'PRESENT',
      });

      expect(result.status).toBe('PRESENT');
    });

    it('should throw error if attendance not found', async () => {
      vi.mocked(prisma.attendance.findUnique).mockResolvedValue(null);

      await expect(
        AttendanceService.updateAttendance('att-1', 'tenant-1', { status: 'PRESENT' })
      ).rejects.toThrow('Attendance record not found');
    });
  });

  describe('deleteAttendance', () => {
    it('should delete attendance record', async () => {
      vi.mocked(prisma.attendance.findUnique).mockResolvedValue(mockAttendance as any);
      vi.mocked(prisma.attendance.delete).mockResolvedValue(mockAttendance as any);

      await AttendanceService.deleteAttendance('att-1', 'tenant-1');

      expect(prisma.attendance.delete).toHaveBeenCalledWith({
        where: { id: 'att-1', tenantId: 'tenant-1' },
      });
    });
  });
});
