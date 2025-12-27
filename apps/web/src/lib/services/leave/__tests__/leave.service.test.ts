import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { LeaveService } from '../leave.service';
import type { LeaveApplication, LeavePolicy } from '@/types/leave';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    leaveApplication: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    leaveBalance: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    leavePolicy: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    employee: {
      findUnique: vi.fn(),
    },
  },
}));

describe('LeaveService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockEmployee = {
    id: 'emp-1',
    employeeId: 'E001',
    tenantId: 'tenant-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    managerId: 'mgr-1',
    departmentId: 'dept-1',
    hireDate: new Date('2020-01-01'),
  };

  const mockLeavePolicy: LeavePolicy = {
    id: 'policy-1',
    tenantId: 'tenant-1',
    leaveTypeId: 'type-1',
    name: 'Annual Leave',
    code: 'AL',
    annualEntitlement: 30,
    maxCarryForward: 5,
    minServiceDays: 90,
    allowNegativeBalance: false,
    requiresApproval: true,
    isPaid: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLeaveBalance = {
    id: 'balance-1',
    employeeId: 'emp-1',
    tenantId: 'tenant-1',
    leaveTypeId: 'type-1',
    year: 2024,
    entitled: 30,
    used: 5,
    pending: 2,
    available: 23,
    carriedForward: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLeaveApplication: LeaveApplication = {
    id: 'leave-1',
    employeeId: 'emp-1',
    tenantId: 'tenant-1',
    leaveTypeId: 'type-1',
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-06-05'),
    days: 5,
    reason: 'Family vacation',
    status: 'PENDING',
    appliedDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('applyLeave', () => {
    it('should create leave application successfully', async () => {
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(mockEmployee as any);
      vi.mocked(prisma.leavePolicy.findUnique).mockResolvedValue(mockLeavePolicy as any);
      vi.mocked(prisma.leaveBalance.findFirst).mockResolvedValue(mockLeaveBalance as any);
      vi.mocked(prisma.leaveApplication.create).mockResolvedValue(mockLeaveApplication as any);

      const result = await LeaveService.applyLeave({
        employeeId: 'emp-1',
        tenantId: 'tenant-1',
        leaveTypeId: 'type-1',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-05'),
        reason: 'Family vacation',
      });

      expect(result).toBeDefined();
      expect(result.status).toBe('PENDING');
      expect(prisma.leaveApplication.create).toHaveBeenCalled();
    });

    it('should throw error if insufficient leave balance', async () => {
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(mockEmployee as any);
      vi.mocked(prisma.leavePolicy.findUnique).mockResolvedValue(mockLeavePolicy as any);
      vi.mocked(prisma.leaveBalance.findFirst).mockResolvedValue({
        ...mockLeaveBalance,
        available: 2, // Only 2 days available
      } as any);

      await expect(
        LeaveService.applyLeave({
          employeeId: 'emp-1',
          tenantId: 'tenant-1',
          leaveTypeId: 'type-1',
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-06-05'), // Requesting 5 days
          reason: 'Vacation',
        })
      ).rejects.toThrow('Insufficient leave balance');
    });

    it('should allow negative balance if policy permits', async () => {
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(mockEmployee as any);
      vi.mocked(prisma.leavePolicy.findUnique).mockResolvedValue({
        ...mockLeavePolicy,
        allowNegativeBalance: true,
      } as any);
      vi.mocked(prisma.leaveBalance.findFirst).mockResolvedValue({
        ...mockLeaveBalance,
        available: 2,
      } as any);
      vi.mocked(prisma.leaveApplication.create).mockResolvedValue(mockLeaveApplication as any);

      const result = await LeaveService.applyLeave({
        employeeId: 'emp-1',
        tenantId: 'tenant-1',
        leaveTypeId: 'type-1',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-05'),
        reason: 'Emergency',
      });

      expect(result).toBeDefined();
      expect(prisma.leaveApplication.create).toHaveBeenCalled();
    });

    it('should validate minimum service period', async () => {
      vi.mocked(prisma.employee.findUnique).mockResolvedValue({
        ...mockEmployee,
        hireDate: new Date(), // Just hired today
      } as any);
      vi.mocked(prisma.leavePolicy.findUnique).mockResolvedValue({
        ...mockLeavePolicy,
        minServiceDays: 90, // Requires 90 days
      } as any);

      await expect(
        LeaveService.applyLeave({
          employeeId: 'emp-1',
          tenantId: 'tenant-1',
          leaveTypeId: 'type-1',
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-06-05'),
          reason: 'Vacation',
        })
      ).rejects.toThrow('Minimum service period not met');
    });

    it('should validate date range', async () => {
      await expect(
        LeaveService.applyLeave({
          employeeId: 'emp-1',
          tenantId: 'tenant-1',
          leaveTypeId: 'type-1',
          startDate: new Date('2024-06-05'),
          endDate: new Date('2024-06-01'), // End before start
          reason: 'Vacation',
        })
      ).rejects.toThrow('Invalid date range');
    });

    it('should check for overlapping leave applications', async () => {
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(mockEmployee as any);
      vi.mocked(prisma.leavePolicy.findUnique).mockResolvedValue(mockLeavePolicy as any);
      vi.mocked(prisma.leaveBalance.findFirst).mockResolvedValue(mockLeaveBalance as any);
      vi.mocked(prisma.leaveApplication.findMany).mockResolvedValue([
        mockLeaveApplication, // Existing leave in same period
      ] as any);

      await expect(
        LeaveService.applyLeave({
          employeeId: 'emp-1',
          tenantId: 'tenant-1',
          leaveTypeId: 'type-1',
          startDate: new Date('2024-06-03'),
          endDate: new Date('2024-06-07'),
          reason: 'Vacation',
        })
      ).rejects.toThrow('Overlapping leave application exists');
    });

    it('should update leave balance pending count', async () => {
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(mockEmployee as any);
      vi.mocked(prisma.leavePolicy.findUnique).mockResolvedValue(mockLeavePolicy as any);
      vi.mocked(prisma.leaveBalance.findFirst).mockResolvedValue(mockLeaveBalance as any);
      vi.mocked(prisma.leaveApplication.create).mockResolvedValue(mockLeaveApplication as any);

      await LeaveService.applyLeave({
        employeeId: 'emp-1',
        tenantId: 'tenant-1',
        leaveTypeId: 'type-1',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-05'),
        reason: 'Vacation',
      });

      expect(prisma.leaveBalance.update).toHaveBeenCalledWith({
        where: { id: 'balance-1' },
        data: { pending: expect.any(Number) },
      });
    });
  });

  describe('approveLeave', () => {
    it('should approve pending leave application', async () => {
      vi.mocked(prisma.leaveApplication.findUnique).mockResolvedValue({
        ...mockLeaveApplication,
        status: 'PENDING',
      } as any);
      vi.mocked(prisma.leaveBalance.findFirst).mockResolvedValue(mockLeaveBalance as any);
      vi.mocked(prisma.leaveApplication.update).mockResolvedValue({
        ...mockLeaveApplication,
        status: 'APPROVED',
        approvedBy: 'mgr-1',
        approvedDate: new Date(),
      } as any);

      const result = await LeaveService.approveLeave('leave-1', 'tenant-1', 'mgr-1', 'Approved');

      expect(result.status).toBe('APPROVED');
      expect(result.approvedBy).toBe('mgr-1');
    });

    it('should update leave balance on approval', async () => {
      vi.mocked(prisma.leaveApplication.findUnique).mockResolvedValue({
        ...mockLeaveApplication,
        status: 'PENDING',
        days: 5,
      } as any);
      vi.mocked(prisma.leaveBalance.findFirst).mockResolvedValue(mockLeaveBalance as any);
      vi.mocked(prisma.leaveApplication.update).mockResolvedValue({
        ...mockLeaveApplication,
        status: 'APPROVED',
      } as any);

      await LeaveService.approveLeave('leave-1', 'tenant-1', 'mgr-1');

      expect(prisma.leaveBalance.update).toHaveBeenCalledWith({
        where: { id: 'balance-1' },
        data: {
          used: expect.any(Number), // Increment used
          pending: expect.any(Number), // Decrement pending
          available: expect.any(Number), // Recalculate available
        },
      });
    });

    it('should throw error if leave is not pending', async () => {
      vi.mocked(prisma.leaveApplication.findUnique).mockResolvedValue({
        ...mockLeaveApplication,
        status: 'APPROVED',
      } as any);

      await expect(
        LeaveService.approveLeave('leave-1', 'tenant-1', 'mgr-1')
      ).rejects.toThrow('Leave application is not pending');
    });

    it('should throw error if leave not found', async () => {
      vi.mocked(prisma.leaveApplication.findUnique).mockResolvedValue(null);

      await expect(
        LeaveService.approveLeave('leave-1', 'tenant-1', 'mgr-1')
      ).rejects.toThrow('Leave application not found');
    });
  });

  describe('rejectLeave', () => {
    it('should reject pending leave application', async () => {
      vi.mocked(prisma.leaveApplication.findUnique).mockResolvedValue({
        ...mockLeaveApplication,
        status: 'PENDING',
      } as any);
      vi.mocked(prisma.leaveBalance.findFirst).mockResolvedValue(mockLeaveBalance as any);
      vi.mocked(prisma.leaveApplication.update).mockResolvedValue({
        ...mockLeaveApplication,
        status: 'REJECTED',
        rejectedBy: 'mgr-1',
        rejectedDate: new Date(),
      } as any);

      const result = await LeaveService.rejectLeave(
        'leave-1',
        'tenant-1',
        'mgr-1',
        'Not enough coverage'
      );

      expect(result.status).toBe('REJECTED');
      expect(result.rejectedBy).toBe('mgr-1');
    });

    it('should restore leave balance on rejection', async () => {
      vi.mocked(prisma.leaveApplication.findUnique).mockResolvedValue({
        ...mockLeaveApplication,
        status: 'PENDING',
        days: 5,
      } as any);
      vi.mocked(prisma.leaveBalance.findFirst).mockResolvedValue(mockLeaveBalance as any);
      vi.mocked(prisma.leaveApplication.update).mockResolvedValue({
        ...mockLeaveApplication,
        status: 'REJECTED',
      } as any);

      await LeaveService.rejectLeave('leave-1', 'tenant-1', 'mgr-1', 'Denied');

      expect(prisma.leaveBalance.update).toHaveBeenCalledWith({
        where: { id: 'balance-1' },
        data: {
          pending: expect.any(Number), // Decrement pending
          available: expect.any(Number), // Increment available
        },
      });
    });

    it('should require rejection reason', async () => {
      vi.mocked(prisma.leaveApplication.findUnique).mockResolvedValue({
        ...mockLeaveApplication,
        status: 'PENDING',
      } as any);

      await expect(
        LeaveService.rejectLeave('leave-1', 'tenant-1', 'mgr-1', '')
      ).rejects.toThrow('Rejection reason is required');
    });
  });

  describe('cancelLeave', () => {
    it('should cancel approved leave application', async () => {
      vi.mocked(prisma.leaveApplication.findUnique).mockResolvedValue({
        ...mockLeaveApplication,
        status: 'APPROVED',
        startDate: new Date('2024-12-01'), // Future date
      } as any);
      vi.mocked(prisma.leaveBalance.findFirst).mockResolvedValue(mockLeaveBalance as any);
      vi.mocked(prisma.leaveApplication.update).mockResolvedValue({
        ...mockLeaveApplication,
        status: 'CANCELLED',
      } as any);

      const result = await LeaveService.cancelLeave('leave-1', 'tenant-1', 'emp-1');

      expect(result.status).toBe('CANCELLED');
    });

    it('should restore leave balance on cancellation', async () => {
      vi.mocked(prisma.leaveApplication.findUnique).mockResolvedValue({
        ...mockLeaveApplication,
        status: 'APPROVED',
        days: 5,
        startDate: new Date('2024-12-01'),
      } as any);
      vi.mocked(prisma.leaveBalance.findFirst).mockResolvedValue(mockLeaveBalance as any);
      vi.mocked(prisma.leaveApplication.update).mockResolvedValue({
        ...mockLeaveApplication,
        status: 'CANCELLED',
      } as any);

      await LeaveService.cancelLeave('leave-1', 'tenant-1', 'emp-1');

      expect(prisma.leaveBalance.update).toHaveBeenCalledWith({
        where: { id: 'balance-1' },
        data: {
          used: expect.any(Number), // Decrement used
          available: expect.any(Number), // Increment available
        },
      });
    });

    it('should not allow cancellation of past leave', async () => {
      vi.mocked(prisma.leaveApplication.findUnique).mockResolvedValue({
        ...mockLeaveApplication,
        status: 'APPROVED',
        startDate: new Date('2024-01-01'), // Past date
      } as any);

      await expect(
        LeaveService.cancelLeave('leave-1', 'tenant-1', 'emp-1')
      ).rejects.toThrow('Cannot cancel past leave');
    });

    it('should not allow cancellation of rejected leave', async () => {
      vi.mocked(prisma.leaveApplication.findUnique).mockResolvedValue({
        ...mockLeaveApplication,
        status: 'REJECTED',
      } as any);

      await expect(
        LeaveService.cancelLeave('leave-1', 'tenant-1', 'emp-1')
      ).rejects.toThrow('Cannot cancel rejected leave');
    });
  });

  describe('getLeaveApplications', () => {
    it('should return paginated leave applications', async () => {
      const mockApplications = [mockLeaveApplication, { ...mockLeaveApplication, id: 'leave-2' }];
      vi.mocked(prisma.leaveApplication.count).mockResolvedValue(2);
      vi.mocked(prisma.leaveApplication.findMany).mockResolvedValue(mockApplications as any);

      const result = await LeaveService.getLeaveApplications('tenant-1', {
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
      vi.mocked(prisma.leaveApplication.count).mockResolvedValue(1);
      vi.mocked(prisma.leaveApplication.findMany).mockResolvedValue([mockLeaveApplication] as any);

      await LeaveService.getLeaveApplications('tenant-1', {
        employeeId: 'emp-1',
      });

      expect(prisma.leaveApplication.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            employeeId: 'emp-1',
          }),
        })
      );
    });

    it('should filter by status', async () => {
      vi.mocked(prisma.leaveApplication.count).mockResolvedValue(1);
      vi.mocked(prisma.leaveApplication.findMany).mockResolvedValue([mockLeaveApplication] as any);

      await LeaveService.getLeaveApplications('tenant-1', {
        status: 'PENDING',
      });

      expect(prisma.leaveApplication.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'PENDING',
          }),
        })
      );
    });

    it('should filter by date range', async () => {
      vi.mocked(prisma.leaveApplication.count).mockResolvedValue(1);
      vi.mocked(prisma.leaveApplication.findMany).mockResolvedValue([mockLeaveApplication] as any);

      await LeaveService.getLeaveApplications('tenant-1', {
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-30'),
      });

      expect(prisma.leaveApplication.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            startDate: expect.objectContaining({
              gte: expect.any(Date),
            }),
            endDate: expect.objectContaining({
              lte: expect.any(Date),
            }),
          }),
        })
      );
    });

    it('should sort by applied date descending by default', async () => {
      vi.mocked(prisma.leaveApplication.count).mockResolvedValue(1);
      vi.mocked(prisma.leaveApplication.findMany).mockResolvedValue([mockLeaveApplication] as any);

      await LeaveService.getLeaveApplications('tenant-1', {});

      expect(prisma.leaveApplication.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { appliedDate: 'desc' },
        })
      );
    });
  });

  describe('getLeaveBalance', () => {
    it('should return employee leave balance', async () => {
      vi.mocked(prisma.leaveBalance.findFirst).mockResolvedValue(mockLeaveBalance as any);

      const result = await LeaveService.getLeaveBalance('emp-1', 'tenant-1', 'type-1', 2024);

      expect(result).toEqual(mockLeaveBalance);
    });

    it('should return null if balance not found', async () => {
      vi.mocked(prisma.leaveBalance.findFirst).mockResolvedValue(null);

      const result = await LeaveService.getLeaveBalance('emp-1', 'tenant-1', 'type-1', 2024);

      expect(result).toBeNull();
    });

    it('should use current year if not specified', async () => {
      vi.mocked(prisma.leaveBalance.findFirst).mockResolvedValue(mockLeaveBalance as any);
      const currentYear = new Date().getFullYear();

      await LeaveService.getLeaveBalance('emp-1', 'tenant-1', 'type-1');

      expect(prisma.leaveBalance.findFirst).toHaveBeenCalledWith({
        where: expect.objectContaining({
          year: currentYear,
        }),
      });
    });
  });

  describe('getLeaveHistory', () => {
    it('should return employee leave history', async () => {
      const mockHistory = [
        mockLeaveApplication,
        { ...mockLeaveApplication, id: 'leave-2', status: 'APPROVED' },
        { ...mockLeaveApplication, id: 'leave-3', status: 'REJECTED' },
      ];
      vi.mocked(prisma.leaveApplication.findMany).mockResolvedValue(mockHistory as any);

      const result = await LeaveService.getLeaveHistory('emp-1', 'tenant-1', {
        year: 2024,
      });

      expect(result).toHaveLength(3);
      expect(result[0].status).toBe('PENDING');
      expect(result[1].status).toBe('APPROVED');
      expect(result[2].status).toBe('REJECTED');
    });

    it('should filter by year', async () => {
      vi.mocked(prisma.leaveApplication.findMany).mockResolvedValue([mockLeaveApplication] as any);

      await LeaveService.getLeaveHistory('emp-1', 'tenant-1', { year: 2024 });

      expect(prisma.leaveApplication.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            startDate: expect.objectContaining({
              gte: new Date('2024-01-01'),
              lte: new Date('2024-12-31'),
            }),
          }),
        })
      );
    });

    it('should filter by leave type', async () => {
      vi.mocked(prisma.leaveApplication.findMany).mockResolvedValue([mockLeaveApplication] as any);

      await LeaveService.getLeaveHistory('emp-1', 'tenant-1', {
        leaveTypeId: 'type-1',
      });

      expect(prisma.leaveApplication.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            leaveTypeId: 'type-1',
          }),
        })
      );
    });
  });

  describe('getPendingApprovals', () => {
    it('should return pending approvals for manager', async () => {
      const mockPendingLeaves = [
        mockLeaveApplication,
        { ...mockLeaveApplication, id: 'leave-2', employeeId: 'emp-2' },
      ];
      vi.mocked(prisma.leaveApplication.findMany).mockResolvedValue(mockPendingLeaves as any);

      const result = await LeaveService.getPendingApprovals('mgr-1', 'tenant-1');

      expect(result).toHaveLength(2);
      expect(result.every((leave) => leave.status === 'PENDING')).toBe(true);
    });

    it('should include employee details in response', async () => {
      vi.mocked(prisma.leaveApplication.findMany).mockResolvedValue([
        {
          ...mockLeaveApplication,
          employee: mockEmployee,
        },
      ] as any);

      const result = await LeaveService.getPendingApprovals('mgr-1', 'tenant-1');

      expect(result[0].employee).toBeDefined();
      expect(result[0].employee.firstName).toBe('John');
    });
  });

  describe('getLeaveStatistics', () => {
    it('should return leave statistics for employee', async () => {
      vi.mocked(prisma.leaveApplication.findMany).mockResolvedValue([
        { ...mockLeaveApplication, status: 'APPROVED', days: 5 },
        { ...mockLeaveApplication, id: 'leave-2', status: 'APPROVED', days: 3 },
        { ...mockLeaveApplication, id: 'leave-3', status: 'PENDING', days: 2 },
        { ...mockLeaveApplication, id: 'leave-4', status: 'REJECTED', days: 4 },
      ] as any);

      const result = await LeaveService.getLeaveStatistics('emp-1', 'tenant-1', 2024);

      expect(result.totalApproved).toBe(8); // 5 + 3
      expect(result.totalPending).toBe(2);
      expect(result.totalRejected).toBe(4);
      expect(result.totalApplications).toBe(4);
    });

    it('should group by leave type', async () => {
      vi.mocked(prisma.leaveApplication.findMany).mockResolvedValue([
        { ...mockLeaveApplication, leaveTypeId: 'type-1', status: 'APPROVED', days: 5 },
        { ...mockLeaveApplication, id: 'leave-2', leaveTypeId: 'type-1', status: 'APPROVED', days: 3 },
        { ...mockLeaveApplication, id: 'leave-3', leaveTypeId: 'type-2', status: 'APPROVED', days: 2 },
      ] as any);

      const result = await LeaveService.getLeaveStatistics('emp-1', 'tenant-1', 2024);

      expect(result.byLeaveType).toBeDefined();
      expect(result.byLeaveType['type-1']).toBe(8); // 5 + 3
      expect(result.byLeaveType['type-2']).toBe(2);
    });
  });

  describe('calculateWorkingDays', () => {
    it('should calculate working days excluding weekends', () => {
      // June 1-5, 2024 is Saturday to Wednesday (4 working days)
      const result = LeaveService.calculateWorkingDays(
        new Date('2024-06-01'),
        new Date('2024-06-05'),
        { excludeWeekends: true }
      );

      expect(result).toBe(4); // Mon, Tue, Wed, Thu (Sat-Sun excluded)
    });

    it('should include weekends if not excluded', () => {
      const result = LeaveService.calculateWorkingDays(
        new Date('2024-06-01'),
        new Date('2024-06-05'),
        { excludeWeekends: false }
      );

      expect(result).toBe(5); // All 5 days
    });

    it('should exclude public holidays', () => {
      const holidays = [new Date('2024-06-03')]; // Monday is holiday

      const result = LeaveService.calculateWorkingDays(
        new Date('2024-06-01'),
        new Date('2024-06-05'),
        { excludeWeekends: true, holidays }
      );

      expect(result).toBe(3); // 4 working days - 1 holiday
    });

    it('should handle same day leave', () => {
      const result = LeaveService.calculateWorkingDays(
        new Date('2024-06-03'),
        new Date('2024-06-03'),
        { excludeWeekends: true }
      );

      expect(result).toBe(1);
    });

    it('should handle half-day leave', () => {
      const result = LeaveService.calculateWorkingDays(
        new Date('2024-06-03'),
        new Date('2024-06-03'),
        { excludeWeekends: true, isHalfDay: true }
      );

      expect(result).toBe(0.5);
    });
  });

  describe('updateLeaveApplication', () => {
    it('should update leave dates', async () => {
      vi.mocked(prisma.leaveApplication.findUnique).mockResolvedValue({
        ...mockLeaveApplication,
        status: 'PENDING',
      } as any);
      vi.mocked(prisma.leaveApplication.update).mockResolvedValue({
        ...mockLeaveApplication,
        startDate: new Date('2024-06-10'),
        endDate: new Date('2024-06-15'),
      } as any);

      const result = await LeaveService.updateLeaveApplication('leave-1', 'tenant-1', {
        startDate: new Date('2024-06-10'),
        endDate: new Date('2024-06-15'),
      });

      expect(result.startDate).toEqual(new Date('2024-06-10'));
      expect(result.endDate).toEqual(new Date('2024-06-15'));
    });

    it('should not allow updating approved leave', async () => {
      vi.mocked(prisma.leaveApplication.findUnique).mockResolvedValue({
        ...mockLeaveApplication,
        status: 'APPROVED',
      } as any);

      await expect(
        LeaveService.updateLeaveApplication('leave-1', 'tenant-1', {
          startDate: new Date('2024-06-10'),
        })
      ).rejects.toThrow('Cannot update approved leave');
    });

    it('should recalculate days when dates change', async () => {
      vi.mocked(prisma.leaveApplication.findUnique).mockResolvedValue({
        ...mockLeaveApplication,
        status: 'PENDING',
      } as any);
      vi.mocked(prisma.leaveApplication.update).mockResolvedValue({
        ...mockLeaveApplication,
        days: 10,
      } as any);

      const result = await LeaveService.updateLeaveApplication('leave-1', 'tenant-1', {
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-10'),
      });

      expect(result.days).toBe(10);
    });
  });

  describe('deleteLeaveApplication', () => {
    it('should delete pending leave application', async () => {
      vi.mocked(prisma.leaveApplication.findUnique).mockResolvedValue({
        ...mockLeaveApplication,
        status: 'PENDING',
      } as any);
      vi.mocked(prisma.leaveBalance.findFirst).mockResolvedValue(mockLeaveBalance as any);
      vi.mocked(prisma.leaveApplication.delete).mockResolvedValue(mockLeaveApplication as any);

      await LeaveService.deleteLeaveApplication('leave-1', 'tenant-1');

      expect(prisma.leaveApplication.delete).toHaveBeenCalledWith({
        where: { id: 'leave-1', tenantId: 'tenant-1' },
      });
    });

    it('should restore leave balance on deletion', async () => {
      vi.mocked(prisma.leaveApplication.findUnique).mockResolvedValue({
        ...mockLeaveApplication,
        status: 'PENDING',
        days: 5,
      } as any);
      vi.mocked(prisma.leaveBalance.findFirst).mockResolvedValue(mockLeaveBalance as any);
      vi.mocked(prisma.leaveApplication.delete).mockResolvedValue(mockLeaveApplication as any);

      await LeaveService.deleteLeaveApplication('leave-1', 'tenant-1');

      expect(prisma.leaveBalance.update).toHaveBeenCalledWith({
        where: { id: 'balance-1' },
        data: {
          pending: expect.any(Number),
          available: expect.any(Number),
        },
      });
    });

    it('should not allow deleting approved leave', async () => {
      vi.mocked(prisma.leaveApplication.findUnique).mockResolvedValue({
        ...mockLeaveApplication,
        status: 'APPROVED',
      } as any);

      await expect(
        LeaveService.deleteLeaveApplication('leave-1', 'tenant-1')
      ).rejects.toThrow('Cannot delete approved leave');
    });
  });
});
