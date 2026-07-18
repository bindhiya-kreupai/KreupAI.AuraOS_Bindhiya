import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ShiftManagementService } from '../../shift-management.service';

const mockPrisma = {
  shift: {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  shiftAssignment: {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    updateMany: vi.fn(),
  },
  shiftRoster: {
    create: vi.fn(),
    createMany: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  shiftSwapRequest: {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
};

vi.mock('@aura/database', () => ({
  prisma: mockPrisma,
}));

const mockShift = {
  id: 'shift-1',
  tenantId: 'tenant-1',
  name: 'General Shift',
  code: 'GEN',
  description: 'Standard day shift',
  startTime: '09:00',
  endTime: '18:00',
  graceInMinutes: 15,
  graceOutMinutes: 15,
  breakDuration: 60,
  isPaidBreak: true,
  workHours: 8,
  weekendDays: ['FRI', 'SAT'],
  overtimeAllowed: false,
  maxOvertimeHours: 0,
  isFlexible: false,
  flexWindow: 0,
  isActive: true,
  isDefault: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockAssignment = {
  id: 'assign-1',
  employeeId: 'emp-1',
  shiftId: 'shift-1',
  tenantId: 'tenant-1',
  effectiveFrom: new Date('2024-01-01'),
  effectiveTo: null,
  isActive: true,
  assignedBy: null,
  reason: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockRoster = {
  id: 'roster-1',
  employeeId: 'emp-1',
  shiftId: 'shift-1',
  tenantId: 'tenant-1',
  rosterDate: new Date('2024-06-01'),
  customStartTime: null,
  customEndTime: null,
  isWeekOff: false,
  isHoliday: false,
  status: 'SCHEDULED',
  createdAt: new Date(),
  updatedAt: new Date(),
  shift: mockShift,
};

const mockSwap = {
  id: 'swap-1',
  tenantId: 'tenant-1',
  requestorId: 'emp-1',
  swapWithId: 'emp-2',
  requestorDate: new Date('2024-06-01'),
  requestorShiftId: 'shift-1',
  swapWithDate: new Date('2024-06-02'),
  swapWithShiftId: 'shift-2',
  reason: 'Personal',
  status: 'PENDING',
  swapWithApproval: 'PENDING',
  managerApproval: 'PENDING',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ShiftManagementService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createShift', () => {
    it('should create new shift successfully', async () => {
      mockPrisma.shift.findFirst.mockResolvedValue(null);
      mockPrisma.shift.create.mockResolvedValue(mockShift);

      const result = await ShiftManagementService.createShift({
        tenantId: 'tenant-1',
        name: 'General Shift',
        code: 'GEN',
        startTime: '09:00',
        endTime: '18:00',
        breakDuration: 60,
        graceInMinutes: 15,
        graceOutMinutes: 15,
        workHours: 8,
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('General Shift');
      expect(mockPrisma.shift.create).toHaveBeenCalled();
    });

    it('should reject duplicate shift code', async () => {
      mockPrisma.shift.findFirst.mockResolvedValue(mockShift);

      await expect(
        ShiftManagementService.createShift({
          tenantId: 'tenant-1',
          name: 'Duplicate',
          code: 'GEN',
          startTime: '09:00',
          endTime: '18:00',
          breakDuration: 60,
          workHours: 8,
        })
      ).rejects.toThrow('Shift code already exists');
    });

    it('should reject invalid time format', async () => {
      await expect(
        ShiftManagementService.createShift({
          tenantId: 'tenant-1',
          name: 'Bad',
          code: 'BAD',
          startTime: 'abc',
          endTime: '18:00',
          workHours: 8,
        })
      ).rejects.toThrow();
    });

    it('should reject when start equals end', async () => {
      await expect(
        ShiftManagementService.createShift({
          tenantId: 'tenant-1',
          name: 'Same',
          code: 'SAM',
          startTime: '09:00',
          endTime: '09:00',
          workHours: 8,
        })
      ).rejects.toThrow();
    });
  });

  describe('updateShift', () => {
    it('should update shift details', async () => {
      mockPrisma.shift.findFirst.mockResolvedValue(mockShift);
      mockPrisma.shift.update.mockResolvedValue({ ...mockShift, name: 'Updated Shift' });

      const result = await ShiftManagementService.updateShift('shift-1', 'tenant-1', {
        name: 'Updated Shift',
      });

      expect(result.name).toBe('Updated Shift');
    });

    it('should throw error if shift not found', async () => {
      mockPrisma.shift.findFirst.mockResolvedValue(null);

      await expect(
        ShiftManagementService.updateShift('shift-1', 'tenant-1', { name: 'Updated' })
      ).rejects.toThrow('Shift not found');
    });
  });

  describe('deleteShift', () => {
    it('should delete shift if no active assignments', async () => {
      mockPrisma.shiftAssignment.count.mockResolvedValue(0);
      mockPrisma.shift.delete.mockResolvedValue(mockShift);

      await ShiftManagementService.deleteShift('shift-1', 'tenant-1');

      expect(mockPrisma.shift.delete).toHaveBeenCalledWith({ where: { id: 'shift-1' } });
    });

    it('should throw error if shift has active assignments', async () => {
      mockPrisma.shiftAssignment.count.mockResolvedValue(3);

      await expect(ShiftManagementService.deleteShift('shift-1', 'tenant-1')).rejects.toThrow(
        'Cannot delete shift with active assignments'
      );
    });
  });

  describe('getShifts', () => {
    it('should return paginated shifts', async () => {
      const shifts = [mockShift, { ...mockShift, id: 'shift-2', name: 'Night Shift' }];
      mockPrisma.shift.count.mockResolvedValue(2);
      mockPrisma.shift.findMany.mockResolvedValue(shifts);

      const result = await ShiftManagementService.getShifts({
        tenantId: 'tenant-1',
        page: 1,
        limit: 20,
      });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });
  });

  describe('createAssignment', () => {
    it('should create assignment successfully', async () => {
      mockPrisma.shiftAssignment.findFirst.mockResolvedValue(null);
      mockPrisma.shiftAssignment.create.mockResolvedValue(mockAssignment);

      const result = await ShiftManagementService.createAssignment({
        tenantId: 'tenant-1',
        employeeId: 'emp-1',
        shiftId: 'shift-1',
        effectiveFrom: '2024-01-01',
      });

      expect(result).toBeDefined();
      expect(result.shiftId).toBe('shift-1');
    });

    it('should reject duplicate active assignment', async () => {
      mockPrisma.shiftAssignment.findFirst.mockResolvedValue(mockAssignment);

      await expect(
        ShiftManagementService.createAssignment({
          tenantId: 'tenant-1',
          employeeId: 'emp-1',
          shiftId: 'shift-1',
          effectiveFrom: '2024-01-01',
        })
      ).rejects.toThrow('already has an active assignment');
    });
  });

  describe('deleteAssignment', () => {
    it('should delete assignment', async () => {
      mockPrisma.shiftAssignment.findFirst.mockResolvedValue(mockAssignment);
      mockPrisma.shiftAssignment.delete.mockResolvedValue(mockAssignment);

      const result = await ShiftManagementService.deleteAssignment('assign-1', 'tenant-1');

      expect(result).toBeDefined();
    });

    it('should throw if assignment not found', async () => {
      mockPrisma.shiftAssignment.findFirst.mockResolvedValue(null);

      await expect(ShiftManagementService.deleteAssignment('assign-1', 'tenant-1')).rejects.toThrow(
        'Assignment not found'
      );
    });
  });

  describe('createRoster', () => {
    it('should create roster entry', async () => {
      mockPrisma.shiftRoster.findFirst.mockResolvedValue(null);
      mockPrisma.shiftRoster.create.mockResolvedValue(mockRoster);

      const result = await ShiftManagementService.createRoster({
        tenantId: 'tenant-1',
        employeeId: 'emp-1',
        shiftId: 'shift-1',
        rosterDate: '2024-06-01',
      });

      expect(result).toBeDefined();
      expect(result.shift).toBeDefined();
    });

    it('should reject duplicate roster entry', async () => {
      mockPrisma.shiftRoster.findFirst.mockResolvedValue(mockRoster);

      await expect(
        ShiftManagementService.createRoster({
          tenantId: 'tenant-1',
          employeeId: 'emp-1',
          shiftId: 'shift-1',
          rosterDate: '2024-06-01',
        })
      ).rejects.toThrow('already has a roster entry');
    });
  });

  describe('getRosters', () => {
    it('should return rosters for date range', async () => {
      mockPrisma.shiftRoster.findMany.mockResolvedValue([mockRoster]);

      const result = await ShiftManagementService.getRosters({
        tenantId: 'tenant-1',
        startDate: '2024-06-01',
        endDate: '2024-06-07',
      });

      expect(result.data).toHaveLength(1);
    });
  });

  describe('createSwap', () => {
    it('should create swap request', async () => {
      mockPrisma.shiftSwapRequest.create.mockResolvedValue(mockSwap);

      const result = await ShiftManagementService.createSwap({
        tenantId: 'tenant-1',
        requestorId: 'emp-1',
        swapWithId: 'emp-2',
        requestorDate: '2024-06-01',
        requestorShiftId: 'shift-1',
        swapWithDate: '2024-06-02',
        swapWithShiftId: 'shift-2',
        reason: 'Personal',
      });

      expect(result).toBeDefined();
      expect(result.status).toBe('PENDING');
    });
  });

  describe('findAllSwaps', () => {
    it('should return paginated swaps', async () => {
      mockPrisma.shiftSwapRequest.findMany.mockResolvedValue([mockSwap]);
      mockPrisma.shiftSwapRequest.count.mockResolvedValue(1);

      const result = await ShiftManagementService.findAllSwaps({
        tenantId: 'tenant-1',
        page: 1,
        limit: 20,
      });

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('findSwapById', () => {
    it('should return swap by id', async () => {
      mockPrisma.shiftSwapRequest.findFirst.mockResolvedValue(mockSwap);

      const result = await ShiftManagementService.findSwapById('swap-1', 'tenant-1');

      expect(result).toBeDefined();
      expect(result!.id).toBe('swap-1');
    });

    it('should return null if not found', async () => {
      mockPrisma.shiftSwapRequest.findFirst.mockResolvedValue(null);

      const result = await ShiftManagementService.findSwapById('missing', 'tenant-1');

      expect(result).toBeNull();
    });
  });

  describe('updateSwap', () => {
    it('should update swap', async () => {
      mockPrisma.shiftSwapRequest.findFirst.mockResolvedValue(mockSwap);
      mockPrisma.shiftSwapRequest.update.mockResolvedValue({ ...mockSwap, status: 'APPROVED' });

      const result = await ShiftManagementService.updateSwap('swap-1', 'tenant-1', {
        status: 'APPROVED',
      });

      expect(result!.status).toBe('APPROVED');
    });

    it('should return null if not found', async () => {
      mockPrisma.shiftSwapRequest.findFirst.mockResolvedValue(null);

      const result = await ShiftManagementService.updateSwap('missing', 'tenant-1', {});

      expect(result).toBeNull();
    });
  });

  describe('peerApproveSwap', () => {
    it('should approve swap by peer', async () => {
      mockPrisma.shiftSwapRequest.findFirst.mockResolvedValue(mockSwap);
      mockPrisma.shiftSwapRequest.update.mockResolvedValue({
        ...mockSwap,
        swapWithApproval: 'APPROVED',
      });

      const result = await ShiftManagementService.peerApproveSwap('swap-1', 'tenant-1', 'emp-2');

      expect(result).toBeDefined();
    });

    it('should reject if not the target employee', async () => {
      mockPrisma.shiftSwapRequest.findFirst.mockResolvedValue(mockSwap);

      await expect(
        ShiftManagementService.peerApproveSwap('swap-1', 'tenant-1', 'emp-3')
      ).rejects.toThrow('Only');
    });
  });

  describe('rejectSwap', () => {
    it('should reject swap with reason', async () => {
      mockPrisma.shiftSwapRequest.findFirst.mockResolvedValue(mockSwap);
      mockPrisma.shiftSwapRequest.update.mockResolvedValue({
        ...mockSwap,
        status: 'REJECTED',
        rejectionReason: 'Not convenient',
      });

      const result = await ShiftManagementService.rejectSwap(
        'swap-1',
        'tenant-1',
        'emp-1',
        'Not convenient'
      );

      expect(result).toBeDefined();
    });
  });
});
