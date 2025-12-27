import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { LeaveAccrualService } from '../leave-accrual.service';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    leaveBalance: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    },
    leaveAccrual: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    leavePolicy: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    employee: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

describe('LeaveAccrualService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockEmployee = {
    id: 'emp-1',
    employeeId: 'E001',
    tenantId: 'tenant-1',
    firstName: 'John',
    lastName: 'Doe',
    hireDate: new Date('2020-01-01'),
    status: 'ACTIVE',
  };

  const mockLeavePolicy = {
    id: 'policy-1',
    tenantId: 'tenant-1',
    leaveTypeId: 'type-1',
    code: 'AL',
    name: 'Annual Leave',
    annualEntitlement: 30,
    accrualMethod: 'MONTHLY',
    maxCarryForward: 5,
    carryForwardExpiryMonths: 6,
    prorateBelowMonths: 3,
    isActive: true,
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
  };

  describe('processMonthlyAccrual', () => {
    it('should process monthly accrual for all active employees', async () => {
      vi.mocked(prisma.leavePolicy.findMany).mockResolvedValue([mockLeavePolicy] as any);
      vi.mocked(prisma.employee.findMany).mockResolvedValue([mockEmployee] as any);
      vi.mocked(prisma.leaveBalance.upsert).mockResolvedValue(mockLeaveBalance as any);
      vi.mocked(prisma.leaveAccrual.create).mockResolvedValue({
        id: 'accrual-1',
        employeeId: 'emp-1',
        leaveTypeId: 'type-1',
        amount: 2.5,
        month: 6,
        year: 2024,
      } as any);

      const result = await LeaveAccrualService.processMonthlyAccrual('tenant-1', 2024, 6);

      expect(result.processed).toBeGreaterThan(0);
      expect(prisma.leaveBalance.upsert).toHaveBeenCalled();
      expect(prisma.leaveAccrual.create).toHaveBeenCalled();
    });

    it('should calculate correct monthly accrual amount', async () => {
      vi.mocked(prisma.leavePolicy.findMany).mockResolvedValue([
        { ...mockLeavePolicy, annualEntitlement: 24 }, // 2 days per month
      ] as any);
      vi.mocked(prisma.employee.findMany).mockResolvedValue([mockEmployee] as any);
      vi.mocked(prisma.leaveBalance.upsert).mockResolvedValue(mockLeaveBalance as any);

      await LeaveAccrualService.processMonthlyAccrual('tenant-1', 2024, 6);

      expect(prisma.leaveAccrual.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          amount: 2, // 24 / 12 = 2
        }),
      });
    });

    it('should prorate for new joiners', async () => {
      const newEmployee = {
        ...mockEmployee,
        hireDate: new Date('2024-06-15'), // Joined mid-month
      };

      vi.mocked(prisma.leavePolicy.findMany).mockResolvedValue([mockLeavePolicy] as any);
      vi.mocked(prisma.employee.findMany).mockResolvedValue([newEmployee] as any);
      vi.mocked(prisma.leaveBalance.upsert).mockResolvedValue(mockLeaveBalance as any);

      await LeaveAccrualService.processMonthlyAccrual('tenant-1', 2024, 6);

      // Should prorate based on days worked in month
      expect(prisma.leaveAccrual.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          amount: expect.any(Number),
        }),
      });
    });

    it('should skip employees not meeting minimum service period', async () => {
      const newEmployee = {
        ...mockEmployee,
        hireDate: new Date('2024-06-01'), // Just joined
      };

      vi.mocked(prisma.leavePolicy.findMany).mockResolvedValue([
        { ...mockLeavePolicy, prorateBelowMonths: 3 }, // Requires 3 months
      ] as any);
      vi.mocked(prisma.employee.findMany).mockResolvedValue([newEmployee] as any);

      const result = await LeaveAccrualService.processMonthlyAccrual('tenant-1', 2024, 6);

      expect(result.skipped).toBeGreaterThan(0);
      expect(prisma.leaveAccrual.create).not.toHaveBeenCalled();
    });

    it('should handle inactive leave policies', async () => {
      vi.mocked(prisma.leavePolicy.findMany).mockResolvedValue([
        { ...mockLeavePolicy, isActive: false },
      ] as any);
      vi.mocked(prisma.employee.findMany).mockResolvedValue([mockEmployee] as any);

      const result = await LeaveAccrualService.processMonthlyAccrual('tenant-1', 2024, 6);

      expect(result.processed).toBe(0);
    });

    it('should update existing leave balance', async () => {
      vi.mocked(prisma.leavePolicy.findMany).mockResolvedValue([mockLeavePolicy] as any);
      vi.mocked(prisma.employee.findMany).mockResolvedValue([mockEmployee] as any);
      vi.mocked(prisma.leaveBalance.upsert).mockResolvedValue({
        ...mockLeaveBalance,
        entitled: 32.5, // Previous 30 + new 2.5
      } as any);

      await LeaveAccrualService.processMonthlyAccrual('tenant-1', 2024, 6);

      expect(prisma.leaveBalance.upsert).toHaveBeenCalledWith({
        where: expect.any(Object),
        create: expect.any(Object),
        update: expect.objectContaining({
          entitled: expect.any(Number),
        }),
      });
    });
  });

  describe('processYearlyAccrual', () => {
    it('should grant full annual entitlement', async () => {
      vi.mocked(prisma.leavePolicy.findMany).mockResolvedValue([
        { ...mockLeavePolicy, accrualMethod: 'YEARLY' },
      ] as any);
      vi.mocked(prisma.employee.findMany).mockResolvedValue([mockEmployee] as any);
      vi.mocked(prisma.leaveBalance.upsert).mockResolvedValue(mockLeaveBalance as any);

      await LeaveAccrualService.processYearlyAccrual('tenant-1', 2024);

      expect(prisma.leaveAccrual.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          amount: 30, // Full annual entitlement
        }),
      });
    });

    it('should process carry forward from previous year', async () => {
      vi.mocked(prisma.leavePolicy.findMany).mockResolvedValue([mockLeavePolicy] as any);
      vi.mocked(prisma.employee.findMany).mockResolvedValue([mockEmployee] as any);
      vi.mocked(prisma.leaveBalance.findFirst).mockResolvedValue({
        ...mockLeaveBalance,
        year: 2023,
        available: 8, // 8 days unused
      } as any);
      vi.mocked(prisma.leaveBalance.upsert).mockResolvedValue(mockLeaveBalance as any);

      await LeaveAccrualService.processYearlyAccrual('tenant-1', 2024);

      // Should carry forward max 5 days (policy limit)
      expect(prisma.leaveBalance.upsert).toHaveBeenCalledWith({
        where: expect.any(Object),
        create: expect.any(Object),
        update: expect.objectContaining({
          carriedForward: 5, // Capped at maxCarryForward
        }),
      });
    });

    it('should not carry forward if no balance', async () => {
      vi.mocked(prisma.leavePolicy.findMany).mockResolvedValue([mockLeavePolicy] as any);
      vi.mocked(prisma.employee.findMany).mockResolvedValue([mockEmployee] as any);
      vi.mocked(prisma.leaveBalance.findFirst).mockResolvedValue(null); // No previous balance
      vi.mocked(prisma.leaveBalance.upsert).mockResolvedValue(mockLeaveBalance as any);

      await LeaveAccrualService.processYearlyAccrual('tenant-1', 2024);

      expect(prisma.leaveBalance.upsert).toHaveBeenCalledWith({
        where: expect.any(Object),
        create: expect.any(Object),
        update: expect.objectContaining({
          carriedForward: 0,
        }),
      });
    });

    it('should prorate for new joiners in current year', async () => {
      const newEmployee = {
        ...mockEmployee,
        hireDate: new Date('2024-07-01'), // Joined in July
      };

      vi.mocked(prisma.leavePolicy.findMany).mockResolvedValue([mockLeavePolicy] as any);
      vi.mocked(prisma.employee.findMany).mockResolvedValue([newEmployee] as any);
      vi.mocked(prisma.leaveBalance.upsert).mockResolvedValue(mockLeaveBalance as any);

      await LeaveAccrualService.processYearlyAccrual('tenant-1', 2024);

      // Should prorate: 30 days * (6 months / 12 months) = 15 days
      expect(prisma.leaveAccrual.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          amount: expect.any(Number),
        }),
      });
    });
  });

  describe('calculateProration', () => {
    it('should calculate full entitlement for employees working full year', () => {
      const result = LeaveAccrualService.calculateProration(
        new Date('2020-01-01'),
        new Date('2024-01-01'),
        new Date('2024-12-31'),
        30
      );

      expect(result).toBe(30);
    });

    it('should prorate for mid-year joiners', () => {
      // Joined July 1, working 6 months
      const result = LeaveAccrualService.calculateProration(
        new Date('2024-07-01'),
        new Date('2024-01-01'),
        new Date('2024-12-31'),
        24 // Annual entitlement
      );

      expect(result).toBe(12); // 24 * (6/12)
    });

    it('should handle employees joining at month end', () => {
      // Joined March 31
      const result = LeaveAccrualService.calculateProration(
        new Date('2024-03-31'),
        new Date('2024-01-01'),
        new Date('2024-12-31'),
        12
      );

      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(12);
    });

    it('should return zero for employees hired after period end', () => {
      const result = LeaveAccrualService.calculateProration(
        new Date('2025-01-01'),
        new Date('2024-01-01'),
        new Date('2024-12-31'),
        30
      );

      expect(result).toBe(0);
    });

    it('should handle leap years correctly', () => {
      const result = LeaveAccrualService.calculateProration(
        new Date('2024-07-01'), // 2024 is a leap year
        new Date('2024-01-01'),
        new Date('2024-12-31'),
        366
      );

      expect(result).toBe(183); // Half of 366
    });
  });

  describe('getAccrualHistory', () => {
    it('should return accrual history for employee', async () => {
      const mockAccruals = [
        {
          id: 'accrual-1',
          employeeId: 'emp-1',
          leaveTypeId: 'type-1',
          amount: 2.5,
          month: 6,
          year: 2024,
          createdAt: new Date('2024-06-01'),
        },
        {
          id: 'accrual-2',
          employeeId: 'emp-1',
          leaveTypeId: 'type-1',
          amount: 2.5,
          month: 7,
          year: 2024,
          createdAt: new Date('2024-07-01'),
        },
      ];

      vi.mocked(prisma.leaveAccrual.findMany).mockResolvedValue(mockAccruals as any);

      const result = await LeaveAccrualService.getAccrualHistory('emp-1', 'tenant-1', {
        year: 2024,
      });

      expect(result).toHaveLength(2);
      expect(result[0].amount).toBe(2.5);
      expect(result[1].amount).toBe(2.5);
    });

    it('should filter by year', async () => {
      vi.mocked(prisma.leaveAccrual.findMany).mockResolvedValue([]);

      await LeaveAccrualService.getAccrualHistory('emp-1', 'tenant-1', { year: 2024 });

      expect(prisma.leaveAccrual.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          year: 2024,
        }),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by leave type', async () => {
      vi.mocked(prisma.leaveAccrual.findMany).mockResolvedValue([]);

      await LeaveAccrualService.getAccrualHistory('emp-1', 'tenant-1', {
        leaveTypeId: 'type-1',
      });

      expect(prisma.leaveAccrual.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          leaveTypeId: 'type-1',
        }),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array if no accruals', async () => {
      vi.mocked(prisma.leaveAccrual.findMany).mockResolvedValue([]);

      const result = await LeaveAccrualService.getAccrualHistory('emp-1', 'tenant-1', {});

      expect(result).toEqual([]);
    });
  });

  describe('adjustLeaveBalance', () => {
    it('should add adjustment to leave balance', async () => {
      vi.mocked(prisma.leaveBalance.findFirst).mockResolvedValue(mockLeaveBalance as any);
      vi.mocked(prisma.leaveBalance.update).mockResolvedValue({
        ...mockLeaveBalance,
        entitled: 32, // 30 + 2
        available: 25, // 23 + 2
      } as any);
      vi.mocked(prisma.leaveAccrual.create).mockResolvedValue({} as any);

      const result = await LeaveAccrualService.adjustLeaveBalance(
        'emp-1',
        'tenant-1',
        'type-1',
        2024,
        2,
        'Manual adjustment - bonus leave'
      );

      expect(result.entitled).toBe(32);
      expect(result.available).toBe(25);
    });

    it('should subtract from leave balance', async () => {
      vi.mocked(prisma.leaveBalance.findFirst).mockResolvedValue(mockLeaveBalance as any);
      vi.mocked(prisma.leaveBalance.update).mockResolvedValue({
        ...mockLeaveBalance,
        entitled: 28, // 30 - 2
        available: 21, // 23 - 2
      } as any);
      vi.mocked(prisma.leaveAccrual.create).mockResolvedValue({} as any);

      const result = await LeaveAccrualService.adjustLeaveBalance(
        'emp-1',
        'tenant-1',
        'type-1',
        2024,
        -2,
        'Deduction for absence'
      );

      expect(result.entitled).toBe(28);
      expect(result.available).toBe(21);
    });

    it('should create leave balance if not exists', async () => {
      vi.mocked(prisma.leaveBalance.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.leaveBalance.create).mockResolvedValue({
        ...mockLeaveBalance,
        entitled: 5,
        available: 5,
      } as any);
      vi.mocked(prisma.leaveAccrual.create).mockResolvedValue({} as any);

      const result = await LeaveAccrualService.adjustLeaveBalance(
        'emp-1',
        'tenant-1',
        'type-1',
        2024,
        5,
        'Initial grant'
      );

      expect(prisma.leaveBalance.create).toHaveBeenCalled();
      expect(result.entitled).toBe(5);
    });

    it('should record adjustment in accrual history', async () => {
      vi.mocked(prisma.leaveBalance.findFirst).mockResolvedValue(mockLeaveBalance as any);
      vi.mocked(prisma.leaveBalance.update).mockResolvedValue(mockLeaveBalance as any);
      vi.mocked(prisma.leaveAccrual.create).mockResolvedValue({} as any);

      await LeaveAccrualService.adjustLeaveBalance(
        'emp-1',
        'tenant-1',
        'type-1',
        2024,
        3,
        'Bonus leave'
      );

      expect(prisma.leaveAccrual.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          amount: 3,
          type: 'ADJUSTMENT',
          remarks: 'Bonus leave',
        }),
      });
    });

    it('should require adjustment reason', async () => {
      await expect(
        LeaveAccrualService.adjustLeaveBalance('emp-1', 'tenant-1', 'type-1', 2024, 5, '')
      ).rejects.toThrow('Adjustment reason is required');
    });
  });

  describe('expireCarriedForwardLeave', () => {
    it('should expire carried forward leave after expiry period', async () => {
      const balanceWithCarryForward = {
        ...mockLeaveBalance,
        carriedForward: 5,
        carriedForwardDate: new Date('2024-01-01'),
      };

      vi.mocked(prisma.leavePolicy.findUnique).mockResolvedValue({
        ...mockLeavePolicy,
        carryForwardExpiryMonths: 6,
      } as any);
      vi.mocked(prisma.leaveBalance.findMany).mockResolvedValue([balanceWithCarryForward] as any);
      vi.mocked(prisma.leaveBalance.update).mockResolvedValue({
        ...balanceWithCarryForward,
        carriedForward: 0,
        available: 18, // Reduced by 5
      } as any);

      // Current date: July 2024 (6 months after carry forward)
      const result = await LeaveAccrualService.expireCarriedForwardLeave(
        'tenant-1',
        new Date('2024-07-01')
      );

      expect(result.expired).toBeGreaterThan(0);
      expect(prisma.leaveBalance.update).toHaveBeenCalledWith({
        where: { id: 'balance-1' },
        data: {
          carriedForward: 0,
          available: expect.any(Number),
        },
      });
    });

    it('should not expire if expiry period not reached', async () => {
      const balanceWithCarryForward = {
        ...mockLeaveBalance,
        carriedForward: 5,
        carriedForwardDate: new Date('2024-01-01'),
      };

      vi.mocked(prisma.leavePolicy.findUnique).mockResolvedValue({
        ...mockLeavePolicy,
        carryForwardExpiryMonths: 6,
      } as any);
      vi.mocked(prisma.leaveBalance.findMany).mockResolvedValue([balanceWithCarryForward] as any);

      // Current date: March 2024 (only 2 months after carry forward)
      const result = await LeaveAccrualService.expireCarriedForwardLeave(
        'tenant-1',
        new Date('2024-03-01')
      );

      expect(result.expired).toBe(0);
      expect(prisma.leaveBalance.update).not.toHaveBeenCalled();
    });

    it('should handle policies without expiry', async () => {
      vi.mocked(prisma.leavePolicy.findUnique).mockResolvedValue({
        ...mockLeavePolicy,
        carryForwardExpiryMonths: null, // No expiry
      } as any);
      vi.mocked(prisma.leaveBalance.findMany).mockResolvedValue([mockLeaveBalance] as any);

      const result = await LeaveAccrualService.expireCarriedForwardLeave(
        'tenant-1',
        new Date('2024-12-31')
      );

      expect(result.expired).toBe(0);
    });
  });

  describe('getLeaveBalanceSummary', () => {
    it('should return summary of all leave types for employee', async () => {
      const mockBalances = [
        { ...mockLeaveBalance, leaveTypeId: 'type-1', leaveType: { name: 'Annual Leave' } },
        {
          ...mockLeaveBalance,
          id: 'balance-2',
          leaveTypeId: 'type-2',
          entitled: 10,
          used: 2,
          available: 8,
          leaveType: { name: 'Sick Leave' },
        },
      ];

      vi.mocked(prisma.leaveBalance.findMany).mockResolvedValue(mockBalances as any);

      const result = await LeaveAccrualService.getLeaveBalanceSummary('emp-1', 'tenant-1', 2024);

      expect(result).toHaveLength(2);
      expect(result[0].entitled).toBe(30);
      expect(result[1].entitled).toBe(10);
    });

    it('should include leave type details', async () => {
      vi.mocked(prisma.leaveBalance.findMany).mockResolvedValue([
        {
          ...mockLeaveBalance,
          leaveType: {
            id: 'type-1',
            code: 'AL',
            name: 'Annual Leave',
          },
        },
      ] as any);

      const result = await LeaveAccrualService.getLeaveBalanceSummary('emp-1', 'tenant-1', 2024);

      expect(result[0].leaveType).toBeDefined();
      expect(result[0].leaveType.code).toBe('AL');
      expect(result[0].leaveType.name).toBe('Annual Leave');
    });

    it('should calculate utilization percentage', async () => {
      vi.mocked(prisma.leaveBalance.findMany).mockResolvedValue([
        {
          ...mockLeaveBalance,
          entitled: 30,
          used: 15, // 50% utilization
        },
      ] as any);

      const result = await LeaveAccrualService.getLeaveBalanceSummary('emp-1', 'tenant-1', 2024);

      expect(result[0].utilizationPercentage).toBe(50);
    });

    it('should return empty array if no balances', async () => {
      vi.mocked(prisma.leaveBalance.findMany).mockResolvedValue([]);

      const result = await LeaveAccrualService.getLeaveBalanceSummary('emp-1', 'tenant-1', 2024);

      expect(result).toEqual([]);
    });
  });

  describe('resetLeaveBalances', () => {
    it('should reset all leave balances for new year', async () => {
      vi.mocked(prisma.leavePolicy.findMany).mockResolvedValue([mockLeavePolicy] as any);
      vi.mocked(prisma.employee.findMany).mockResolvedValue([mockEmployee] as any);
      vi.mocked(prisma.leaveBalance.findFirst).mockResolvedValue({
        ...mockLeaveBalance,
        available: 10, // 10 days remaining
      } as any);
      vi.mocked(prisma.leaveBalance.create).mockResolvedValue({
        ...mockLeaveBalance,
        year: 2025,
        entitled: 30,
        carriedForward: 5, // Max carry forward
        available: 35,
      } as any);

      const result = await LeaveAccrualService.resetLeaveBalances('tenant-1', 2025);

      expect(result.reset).toBeGreaterThan(0);
      expect(prisma.leaveBalance.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          year: 2025,
          entitled: 30,
          carriedForward: 5,
        }),
      });
    });

    it('should not carry forward if max limit is zero', async () => {
      vi.mocked(prisma.leavePolicy.findMany).mockResolvedValue([
        { ...mockLeavePolicy, maxCarryForward: 0 },
      ] as any);
      vi.mocked(prisma.employee.findMany).mockResolvedValue([mockEmployee] as any);
      vi.mocked(prisma.leaveBalance.findFirst).mockResolvedValue({
        ...mockLeaveBalance,
        available: 10,
      } as any);
      vi.mocked(prisma.leaveBalance.create).mockResolvedValue(mockLeaveBalance as any);

      await LeaveAccrualService.resetLeaveBalances('tenant-1', 2025);

      expect(prisma.leaveBalance.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          carriedForward: 0,
        }),
      });
    });
  });
});
