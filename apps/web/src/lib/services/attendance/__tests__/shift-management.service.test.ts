import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { ShiftManagementService } from '../shift-management.service';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    shift: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    shiftAssignment: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    shiftRoster: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    employee: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('ShiftManagementService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockShift = {
    id: 'shift-1',
    tenantId: 'tenant-1',
    name: 'General Shift',
    code: 'GEN',
    startTime: '09:00',
    endTime: '18:00',
    breakMinutes: 60,
    gracePeriodMinutes: 15,
    halfDayHours: 4,
    fullDayHours: 8,
    weeklyOffDays: ['SAT', 'SUN'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEmployee = {
    id: 'emp-1',
    employeeId: 'E001',
    tenantId: 'tenant-1',
    shiftId: 'shift-1',
  };

  const mockShiftAssignment = {
    id: 'assign-1',
    employeeId: 'emp-1',
    shiftId: 'shift-1',
    tenantId: 'tenant-1',
    effectiveFrom: new Date('2024-01-01'),
    effectiveTo: null,
    isActive: true,
  };

  describe('createShift', () => {
    it('should create new shift successfully', async () => {
      vi.mocked(prisma.shift.create).mockResolvedValue(mockShift as any);

      const result = await ShiftManagementService.createShift('tenant-1', {
        name: 'General Shift',
        code: 'GEN',
        startTime: '09:00',
        endTime: '18:00',
        breakMinutes: 60,
        gracePeriodMinutes: 15,
        halfDayHours: 4,
        fullDayHours: 8,
        weeklyOffDays: ['SAT', 'SUN'],
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('General Shift');
      expect(prisma.shift.create).toHaveBeenCalled();
    });

    it('should validate shift times', async () => {
      await expect(
        ShiftManagementService.createShift('tenant-1', {
          name: 'Invalid Shift',
          code: 'INV',
          startTime: '18:00',
          endTime: '09:00', // End before start
          breakMinutes: 60,
        })
      ).rejects.toThrow('End time must be after start time');
    });

    it('should validate unique shift code', async () => {
      vi.mocked(prisma.shift.findFirst).mockResolvedValue(mockShift as any); // Existing shift

      await expect(
        ShiftManagementService.createShift('tenant-1', {
          name: 'Duplicate',
          code: 'GEN', // Duplicate code
          startTime: '09:00',
          endTime: '18:00',
        })
      ).rejects.toThrow('Shift code already exists');
    });

    it('should set default values for optional fields', async () => {
      vi.mocked(prisma.shift.create).mockResolvedValue({
        ...mockShift,
        gracePeriodMinutes: 0,
        breakMinutes: 0,
      } as any);

      const result = await ShiftManagementService.createShift('tenant-1', {
        name: 'Simple Shift',
        code: 'SIM',
        startTime: '09:00',
        endTime: '17:00',
      });

      expect(result.gracePeriodMinutes).toBe(0);
      expect(result.breakMinutes).toBe(0);
    });
  });

  describe('updateShift', () => {
    it('should update shift details', async () => {
      vi.mocked(prisma.shift.findUnique).mockResolvedValue(mockShift as any);
      vi.mocked(prisma.shift.update).mockResolvedValue({
        ...mockShift,
        name: 'Updated Shift',
      } as any);

      const result = await ShiftManagementService.updateShift('shift-1', 'tenant-1', {
        name: 'Updated Shift',
      });

      expect(result.name).toBe('Updated Shift');
    });

    it('should throw error if shift not found', async () => {
      vi.mocked(prisma.shift.findUnique).mockResolvedValue(null);

      await expect(
        ShiftManagementService.updateShift('shift-1', 'tenant-1', { name: 'Updated' })
      ).rejects.toThrow('Shift not found');
    });

    it('should validate shift times on update', async () => {
      vi.mocked(prisma.shift.findUnique).mockResolvedValue(mockShift as any);

      await expect(
        ShiftManagementService.updateShift('shift-1', 'tenant-1', {
          startTime: '20:00',
          endTime: '10:00',
        })
      ).rejects.toThrow('End time must be after start time');
    });
  });

  describe('deleteShift', () => {
    it('should delete shift if no active assignments', async () => {
      vi.mocked(prisma.shift.findUnique).mockResolvedValue(mockShift as any);
      vi.mocked(prisma.shiftAssignment.findMany).mockResolvedValue([]); // No assignments
      vi.mocked(prisma.shift.delete).mockResolvedValue(mockShift as any);

      await ShiftManagementService.deleteShift('shift-1', 'tenant-1');

      expect(prisma.shift.delete).toHaveBeenCalledWith({
        where: { id: 'shift-1', tenantId: 'tenant-1' },
      });
    });

    it('should throw error if shift has active assignments', async () => {
      vi.mocked(prisma.shift.findUnique).mockResolvedValue(mockShift as any);
      vi.mocked(prisma.shiftAssignment.findMany).mockResolvedValue([mockShiftAssignment] as any);

      await expect(
        ShiftManagementService.deleteShift('shift-1', 'tenant-1')
      ).rejects.toThrow('Cannot delete shift with active assignments');
    });

    it('should soft delete by marking inactive', async () => {
      vi.mocked(prisma.shift.findUnique).mockResolvedValue(mockShift as any);
      vi.mocked(prisma.shiftAssignment.findMany).mockResolvedValue([mockShiftAssignment] as any);
      vi.mocked(prisma.shift.update).mockResolvedValue({
        ...mockShift,
        isActive: false,
      } as any);

      const result = await ShiftManagementService.deactivateShift('shift-1', 'tenant-1');

      expect(result.isActive).toBe(false);
    });
  });

  describe('getShifts', () => {
    it('should return all active shifts', async () => {
      const mockShifts = [mockShift, { ...mockShift, id: 'shift-2', name: 'Night Shift' }];
      vi.mocked(prisma.shift.count).mockResolvedValue(2);
      vi.mocked(prisma.shift.findMany).mockResolvedValue(mockShifts as any);

      const result = await ShiftManagementService.getShifts('tenant-1', {
        page: 1,
        limit: 20,
      });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });

    it('should filter by active status', async () => {
      vi.mocked(prisma.shift.count).mockResolvedValue(1);
      vi.mocked(prisma.shift.findMany).mockResolvedValue([mockShift] as any);

      await ShiftManagementService.getShifts('tenant-1', { isActive: true });

      expect(prisma.shift.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
          }),
        })
      );
    });
  });

  describe('assignShift', () => {
    it('should assign shift to employee', async () => {
      vi.mocked(prisma.shift.findUnique).mockResolvedValue(mockShift as any);
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(mockEmployee as any);
      vi.mocked(prisma.shiftAssignment.findMany).mockResolvedValue([]); // No existing assignments
      vi.mocked(prisma.shiftAssignment.create).mockResolvedValue(mockShiftAssignment as any);
      vi.mocked(prisma.employee.update).mockResolvedValue({
        ...mockEmployee,
        shiftId: 'shift-1',
      } as any);

      const result = await ShiftManagementService.assignShift(
        'emp-1',
        'shift-1',
        'tenant-1',
        new Date('2024-01-01')
      );

      expect(result).toBeDefined();
      expect(result.shiftId).toBe('shift-1');
      expect(prisma.employee.update).toHaveBeenCalled();
    });

    it('should end previous shift assignment', async () => {
      vi.mocked(prisma.shift.findUnique).mockResolvedValue(mockShift as any);
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(mockEmployee as any);
      vi.mocked(prisma.shiftAssignment.findMany).mockResolvedValue([
        { ...mockShiftAssignment, id: 'assign-old' },
      ] as any);
      vi.mocked(prisma.shiftAssignment.create).mockResolvedValue(mockShiftAssignment as any);
      vi.mocked(prisma.employee.update).mockResolvedValue(mockEmployee as any);

      await ShiftManagementService.assignShift(
        'emp-1',
        'shift-1',
        'tenant-1',
        new Date('2024-01-01')
      );

      expect(prisma.shiftAssignment.update).toHaveBeenCalledWith({
        where: { id: 'assign-old' },
        data: {
          effectiveTo: expect.any(Date),
          isActive: false,
        },
      });
    });

    it('should throw error if shift not found', async () => {
      vi.mocked(prisma.shift.findUnique).mockResolvedValue(null);

      await expect(
        ShiftManagementService.assignShift('emp-1', 'shift-1', 'tenant-1', new Date())
      ).rejects.toThrow('Shift not found');
    });

    it('should throw error if employee not found', async () => {
      vi.mocked(prisma.shift.findUnique).mockResolvedValue(mockShift as any);
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null);

      await expect(
        ShiftManagementService.assignShift('emp-1', 'shift-1', 'tenant-1', new Date())
      ).rejects.toThrow('Employee not found');
    });
  });

  describe('bulkAssignShift', () => {
    it('should assign shift to multiple employees', async () => {
      const employeeIds = ['emp-1', 'emp-2', 'emp-3'];
      vi.mocked(prisma.shift.findUnique).mockResolvedValue(mockShift as any);
      vi.mocked(prisma.employee.findMany).mockResolvedValue([
        mockEmployee,
        { ...mockEmployee, id: 'emp-2' },
        { ...mockEmployee, id: 'emp-3' },
      ] as any);
      vi.mocked(prisma.shiftAssignment.create).mockResolvedValue(mockShiftAssignment as any);

      const result = await ShiftManagementService.bulkAssignShift(
        employeeIds,
        'shift-1',
        'tenant-1',
        new Date('2024-01-01')
      );

      expect(result.success).toBe(3);
      expect(result.failed).toBe(0);
      expect(prisma.shiftAssignment.create).toHaveBeenCalledTimes(3);
    });

    it('should handle partial failures gracefully', async () => {
      const employeeIds = ['emp-1', 'emp-invalid', 'emp-3'];
      vi.mocked(prisma.shift.findUnique).mockResolvedValue(mockShift as any);
      vi.mocked(prisma.employee.findMany).mockResolvedValue([
        mockEmployee,
        { ...mockEmployee, id: 'emp-3' },
      ] as any); // emp-invalid not found

      const result = await ShiftManagementService.bulkAssignShift(
        employeeIds,
        'shift-1',
        'tenant-1',
        new Date()
      );

      expect(result.success).toBe(2);
      expect(result.failed).toBe(1);
    });
  });

  describe('createShiftRoster', () => {
    it('should create shift roster for date range', async () => {
      vi.mocked(prisma.employee.findMany).mockResolvedValue([mockEmployee] as any);
      vi.mocked(prisma.shift.findUnique).mockResolvedValue(mockShift as any);
      vi.mocked(prisma.shiftRoster.create).mockResolvedValue({
        id: 'roster-1',
        employeeId: 'emp-1',
        shiftId: 'shift-1',
        date: new Date('2024-06-01'),
        tenantId: 'tenant-1',
      } as any);

      const result = await ShiftManagementService.createShiftRoster(
        'tenant-1',
        new Date('2024-06-01'),
        new Date('2024-06-07'), // 7 days
        [{ employeeId: 'emp-1', shiftId: 'shift-1' }]
      );

      expect(result.created).toBeGreaterThan(0);
      expect(prisma.shiftRoster.create).toHaveBeenCalled();
    });

    it('should skip weekends based on shift configuration', async () => {
      vi.mocked(prisma.shift.findUnique).mockResolvedValue({
        ...mockShift,
        weeklyOffDays: ['SAT', 'SUN'],
      } as any);

      const result = await ShiftManagementService.createShiftRoster(
        'tenant-1',
        new Date('2024-06-01'), // Saturday
        new Date('2024-06-02'), // Sunday
        [{ employeeId: 'emp-1', shiftId: 'shift-1' }]
      );

      expect(result.skipped).toBe(2); // Both days skipped
    });

    it('should handle rotating shifts', async () => {
      const rotationPattern = [
        { employeeId: 'emp-1', shiftId: 'shift-morning' },
        { employeeId: 'emp-1', shiftId: 'shift-evening' },
        { employeeId: 'emp-1', shiftId: 'shift-night' },
      ];

      vi.mocked(prisma.shift.findUnique).mockResolvedValue(mockShift as any);
      vi.mocked(prisma.shiftRoster.create).mockResolvedValue({} as any);

      const result = await ShiftManagementService.createRotatingRoster(
        'tenant-1',
        new Date('2024-06-01'),
        new Date('2024-06-09'), // 9 days = 3 rotations
        rotationPattern
      );

      expect(result.created).toBe(9); // 3 days per rotation * 3 rotations
    });
  });

  describe('getShiftRoster', () => {
    it('should return shift roster for date range', async () => {
      const mockRoster = [
        {
          id: 'roster-1',
          employeeId: 'emp-1',
          shiftId: 'shift-1',
          date: new Date('2024-06-01'),
          employee: mockEmployee,
          shift: mockShift,
        },
      ];
      vi.mocked(prisma.shiftRoster.findMany).mockResolvedValue(mockRoster as any);

      const result = await ShiftManagementService.getShiftRoster(
        'tenant-1',
        new Date('2024-06-01'),
        new Date('2024-06-07')
      );

      expect(result).toHaveLength(1);
      expect(result[0].employee).toBeDefined();
      expect(result[0].shift).toBeDefined();
    });

    it('should filter by employee', async () => {
      vi.mocked(prisma.shiftRoster.findMany).mockResolvedValue([]);

      await ShiftManagementService.getShiftRoster(
        'tenant-1',
        new Date('2024-06-01'),
        new Date('2024-06-07'),
        'emp-1'
      );

      expect(prisma.shiftRoster.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          employeeId: 'emp-1',
        }),
      });
    });
  });

  describe('calculateShiftAllowance', () => {
    it('should calculate shift allowance based on shift type', () => {
      const nightShift = {
        ...mockShift,
        allowancePercentage: 25, // 25% extra for night shift
      };

      const result = ShiftManagementService.calculateShiftAllowance(10000, nightShift);

      expect(result).toBe(2500); // 25% of 10,000
    });

    it('should return zero if no allowance configured', () => {
      const regularShift = {
        ...mockShift,
        allowancePercentage: 0,
      };

      const result = ShiftManagementService.calculateShiftAllowance(10000, regularShift);

      expect(result).toBe(0);
    });

    it('should handle weekend shift premium', () => {
      const weekendShift = {
        ...mockShift,
        weekendPremiumPercentage: 50, // 50% extra for weekends
      };

      const result = ShiftManagementService.calculateWeekendPremium(
        10000,
        weekendShift,
        new Date('2024-06-01') // Saturday
      );

      expect(result).toBe(5000); // 50% of 10,000
    });

    it('should not apply weekend premium on weekdays', () => {
      const shift = {
        ...mockShift,
        weekendPremiumPercentage: 50,
      };

      const result = ShiftManagementService.calculateWeekendPremium(
        10000,
        shift,
        new Date('2024-06-03') // Monday
      );

      expect(result).toBe(0);
    });
  });

  describe('getShiftViolations', () => {
    it('should detect consecutive shifts without rest', async () => {
      const mockRoster = [
        { date: new Date('2024-06-01'), shift: mockShift },
        { date: new Date('2024-06-02'), shift: mockShift },
        { date: new Date('2024-06-03'), shift: mockShift },
        { date: new Date('2024-06-04'), shift: mockShift },
        { date: new Date('2024-06-05'), shift: mockShift },
        { date: new Date('2024-06-06'), shift: mockShift },
        { date: new Date('2024-06-07'), shift: mockShift },
        { date: new Date('2024-06-08'), shift: mockShift }, // 8 consecutive days
      ];

      vi.mocked(prisma.shiftRoster.findMany).mockResolvedValue(mockRoster as any);

      const result = await ShiftManagementService.getShiftViolations('emp-1', 'tenant-1', {
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-08'),
        maxConsecutiveDays: 6,
      });

      expect(result.violations).toContain('Exceeded maximum consecutive working days');
    });

    it('should detect insufficient rest between shifts', async () => {
      const result = ShiftManagementService.checkRestPeriod(
        new Date('2024-06-01T22:00:00'), // End at 10 PM
        new Date('2024-06-02T06:00:00'), // Start at 6 AM
        8 // Requires 8 hours rest
      );

      expect(result.violation).toBe(true);
      expect(result.actualRest).toBe(8);
      expect(result.requiredRest).toBe(8);
    });
  });
});
