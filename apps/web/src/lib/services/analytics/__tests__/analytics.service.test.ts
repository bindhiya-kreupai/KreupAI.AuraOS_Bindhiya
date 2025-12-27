import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { AnalyticsService } from '../analytics.service';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    employee: {
      count: vi.fn(),
      findMany: vi.fn(),
      groupBy: vi.fn(),
    },
    leaveApplication: {
      count: vi.fn(),
      findMany: vi.fn(),
      groupBy: vi.fn(),
    },
    attendance: {
      count: vi.fn(),
      findMany: vi.fn(),
      aggregate: vi.fn(),
    },
    payroll: {
      findMany: vi.fn(),
      aggregate: vi.fn(),
    },
  },
}));

describe('AnalyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getEmployeeMetrics', () => {
    it('should return total employee count', async () => {
      vi.mocked(prisma.employee.count).mockResolvedValue(150);

      const result = await AnalyticsService.getEmployeeMetrics('tenant-1');

      expect(result.totalEmployees).toBe(150);
    });

    it('should return active and inactive employee counts', async () => {
      vi.mocked(prisma.employee.count)
        .mockResolvedValueOnce(150) // Total
        .mockResolvedValueOnce(140) // Active
        .mockResolvedValueOnce(10); // Inactive

      const result = await AnalyticsService.getEmployeeMetrics('tenant-1');

      expect(result.activeEmployees).toBe(140);
      expect(result.inactiveEmployees).toBe(10);
    });

    it('should calculate employee distribution by department', async () => {
      vi.mocked(prisma.employee.groupBy).mockResolvedValue([
        { departmentId: 'dept-1', _count: { id: 50 } },
        { departmentId: 'dept-2', _count: { id: 30 } },
        { departmentId: 'dept-3', _count: { id: 20 } },
      ] as any);

      const result = await AnalyticsService.getEmployeeMetrics('tenant-1');

      expect(result.byDepartment).toHaveLength(3);
      expect(result.byDepartment[0].count).toBe(50);
    });

    it('should calculate employee distribution by position', async () => {
      vi.mocked(prisma.employee.groupBy).mockResolvedValue([
        { positionId: 'pos-1', _count: { id: 40 } },
        { positionId: 'pos-2', _count: { id: 35 } },
      ] as any);

      const result = await AnalyticsService.getEmployeeMetrics('tenant-1');

      expect(result.byPosition).toHaveLength(2);
    });

    it('should calculate employee distribution by nationality', async () => {
      vi.mocked(prisma.employee.groupBy).mockResolvedValue([
        { nationality: 'Saudi', _count: { id: 80 } },
        { nationality: 'Indian', _count: { id: 40 } },
        { nationality: 'Egyptian', _count: { id: 30 } },
      ] as any);

      const result = await AnalyticsService.getEmployeeMetrics('tenant-1');

      expect(result.byNationality).toHaveLength(3);
      expect(result.byNationality[0].nationality).toBe('Saudi');
      expect(result.byNationality[0].count).toBe(80);
    });

    it('should calculate new hires in period', async () => {
      vi.mocked(prisma.employee.count).mockResolvedValue(15);

      const result = await AnalyticsService.getEmployeeMetrics('tenant-1', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });

      expect(result.newHires).toBe(15);
    });

    it('should calculate terminations in period', async () => {
      vi.mocked(prisma.employee.count).mockResolvedValue(8);

      const result = await AnalyticsService.getEmployeeMetrics('tenant-1', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });

      expect(result.terminations).toBe(8);
    });

    it('should calculate turnover rate', async () => {
      vi.mocked(prisma.employee.count)
        .mockResolvedValueOnce(150) // Total
        .mockResolvedValueOnce(150) // Active
        .mockResolvedValueOnce(0) // Inactive
        .mockResolvedValueOnce(15) // New hires
        .mockResolvedValueOnce(10); // Terminations

      const result = await AnalyticsService.getEmployeeMetrics('tenant-1', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });

      // Turnover rate = (terminations / average employees) * 100
      expect(result.turnoverRate).toBeGreaterThan(0);
      expect(result.turnoverRate).toBeLessThan(100);
    });
  });

  describe('getAttendanceMetrics', () => {
    it('should calculate average attendance rate', async () => {
      vi.mocked(prisma.attendance.count)
        .mockResolvedValueOnce(1000) // Total days
        .mockResolvedValueOnce(950); // Present days

      const result = await AnalyticsService.getAttendanceMetrics('tenant-1', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      });

      expect(result.attendanceRate).toBe(95); // 950/1000 * 100
    });

    it('should calculate total present, absent, and late days', async () => {
      vi.mocked(prisma.attendance.count)
        .mockResolvedValueOnce(1000) // Total
        .mockResolvedValueOnce(950) // Present
        .mockResolvedValueOnce(50) // Absent
        .mockResolvedValueOnce(120); // Late

      const result = await AnalyticsService.getAttendanceMetrics('tenant-1', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      });

      expect(result.totalPresent).toBe(950);
      expect(result.totalAbsent).toBe(50);
      expect(result.totalLate).toBe(120);
    });

    it('should calculate average working hours', async () => {
      vi.mocked(prisma.attendance.aggregate).mockResolvedValue({
        _avg: { workingHours: 8.2 },
      } as any);

      const result = await AnalyticsService.getAttendanceMetrics('tenant-1', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      });

      expect(result.averageWorkingHours).toBe(8.2);
    });

    it('should calculate total overtime hours', async () => {
      vi.mocked(prisma.attendance.aggregate).mockResolvedValue({
        _sum: { overtimeHours: 250 },
      } as any);

      const result = await AnalyticsService.getAttendanceMetrics('tenant-1', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      });

      expect(result.totalOvertimeHours).toBe(250);
    });

    it('should group attendance by department', async () => {
      vi.mocked(prisma.attendance.groupBy).mockResolvedValue([
        { departmentId: 'dept-1', _count: { id: 500 } },
        { departmentId: 'dept-2', _count: { id: 300 } },
      ] as any);

      const result = await AnalyticsService.getAttendanceMetrics('tenant-1', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      });

      expect(result.byDepartment).toHaveLength(2);
    });
  });

  describe('getLeaveMetrics', () => {
    it('should calculate total leave applications', async () => {
      vi.mocked(prisma.leaveApplication.count).mockResolvedValue(200);

      const result = await AnalyticsService.getLeaveMetrics('tenant-1', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });

      expect(result.totalApplications).toBe(200);
    });

    it('should calculate leave applications by status', async () => {
      vi.mocked(prisma.leaveApplication.count)
        .mockResolvedValueOnce(200) // Total
        .mockResolvedValueOnce(150) // Approved
        .mockResolvedValueOnce(30) // Pending
        .mockResolvedValueOnce(20); // Rejected

      const result = await AnalyticsService.getLeaveMetrics('tenant-1', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });

      expect(result.approved).toBe(150);
      expect(result.pending).toBe(30);
      expect(result.rejected).toBe(20);
      expect(result.approvalRate).toBe(75); // 150/200 * 100
    });

    it('should calculate leave by type', async () => {
      vi.mocked(prisma.leaveApplication.groupBy).mockResolvedValue([
        { leaveTypeId: 'type-1', _count: { id: 100 }, _sum: { days: 500 } },
        { leaveTypeId: 'type-2', _count: { id: 50 }, _sum: { days: 200 } },
      ] as any);

      const result = await AnalyticsService.getLeaveMetrics('tenant-1', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });

      expect(result.byType).toHaveLength(2);
      expect(result.byType[0].applications).toBe(100);
      expect(result.byType[0].totalDays).toBe(500);
    });

    it('should calculate average leave duration', async () => {
      vi.mocked(prisma.leaveApplication.aggregate).mockResolvedValue({
        _avg: { days: 5.2 },
      } as any);

      const result = await AnalyticsService.getLeaveMetrics('tenant-1', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });

      expect(result.averageDuration).toBe(5.2);
    });
  });

  describe('getPayrollMetrics', () => {
    it('should calculate total payroll cost', async () => {
      vi.mocked(prisma.payroll.aggregate).mockResolvedValue({
        _sum: { totalGross: 5000000 },
      } as any);

      const result = await AnalyticsService.getPayrollMetrics('tenant-1', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });

      expect(result.totalPayrollCost).toBe(5000000);
    });

    it('should calculate average salary', async () => {
      vi.mocked(prisma.payroll.aggregate).mockResolvedValue({
        _avg: { totalGross: 15000 },
      } as any);

      const result = await AnalyticsService.getPayrollMetrics('tenant-1', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });

      expect(result.averageSalary).toBe(15000);
    });

    it('should calculate payroll by department', async () => {
      vi.mocked(prisma.payroll.findMany).mockResolvedValue([
        { departmentId: 'dept-1', totalGross: 2000000 },
        { departmentId: 'dept-2', totalGross: 1500000 },
      ] as any);

      const result = await AnalyticsService.getPayrollMetrics('tenant-1', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });

      expect(result.byDepartment).toHaveLength(2);
    });

    it('should calculate total statutory deductions', async () => {
      vi.mocked(prisma.payroll.aggregate).mockResolvedValue({
        _sum: { totalStatutoryDeductions: 450000 },
      } as any);

      const result = await AnalyticsService.getPayrollMetrics('tenant-1', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });

      expect(result.totalStatutoryDeductions).toBe(450000);
    });
  });

  describe('getTrendAnalysis', () => {
    it('should analyze employee count trend over time', async () => {
      vi.mocked(prisma.employee.count)
        .mockResolvedValueOnce(100) // Jan
        .mockResolvedValueOnce(105) // Feb
        .mockResolvedValueOnce(110) // Mar
        .mockResolvedValueOnce(115); // Apr

      const result = await AnalyticsService.getTrendAnalysis('tenant-1', 'EMPLOYEE_COUNT', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-04-30'),
        interval: 'MONTHLY',
      });

      expect(result.dataPoints).toHaveLength(4);
      expect(result.trend).toBe('INCREASING');
      expect(result.growthRate).toBeGreaterThan(0);
    });

    it('should analyze attendance trend', async () => {
      vi.mocked(prisma.attendance.count)
        .mockResolvedValueOnce(950)
        .mockResolvedValueOnce(940)
        .mockResolvedValueOnce(960)
        .mockResolvedValueOnce(955);

      const result = await AnalyticsService.getTrendAnalysis('tenant-1', 'ATTENDANCE_RATE', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-04-30'),
        interval: 'MONTHLY',
      });

      expect(result.dataPoints).toHaveLength(4);
      expect(result.trend).toBeDefined();
    });

    it('should detect declining trend', async () => {
      vi.mocked(prisma.employee.count)
        .mockResolvedValueOnce(150)
        .mockResolvedValueOnce(145)
        .mockResolvedValueOnce(140)
        .mockResolvedValueOnce(135);

      const result = await AnalyticsService.getTrendAnalysis('tenant-1', 'EMPLOYEE_COUNT', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-04-30'),
        interval: 'MONTHLY',
      });

      expect(result.trend).toBe('DECREASING');
      expect(result.growthRate).toBeLessThan(0);
    });

    it('should detect stable trend', async () => {
      vi.mocked(prisma.employee.count)
        .mockResolvedValueOnce(150)
        .mockResolvedValueOnce(151)
        .mockResolvedValueOnce(149)
        .mockResolvedValueOnce(150);

      const result = await AnalyticsService.getTrendAnalysis('tenant-1', 'EMPLOYEE_COUNT', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-04-30'),
        interval: 'MONTHLY',
      });

      expect(result.trend).toBe('STABLE');
    });
  });

  describe('getPredictiveAnalytics', () => {
    it('should predict future employee count', async () => {
      const historicalData = [100, 105, 110, 115, 120];

      const result = AnalyticsService.predictFutureValue(historicalData, 3); // Predict next 3 months

      expect(result.predictions).toHaveLength(3);
      expect(result.predictions[0]).toBeGreaterThan(120); // Should continue trend
      expect(result.confidence).toBeDefined();
    });

    it('should predict turnover risk', async () => {
      vi.mocked(prisma.employee.findMany).mockResolvedValue([
        { id: 'emp-1', serviceYears: 0.5, lastPromotionDate: null },
        { id: 'emp-2', serviceYears: 2, lastPromotionDate: new Date('2023-01-01') },
      ] as any);

      const result = await AnalyticsService.predictTurnoverRisk('tenant-1');

      expect(result.highRiskEmployees).toBeDefined();
      expect(result.averageRiskScore).toBeGreaterThan(0);
    });

    it('should use linear regression for predictions', () => {
      const data = [10, 12, 14, 16, 18];

      const result = AnalyticsService.linearRegression(data);

      expect(result.slope).toBeCloseTo(2, 1); // Increasing by 2 each time
      expect(result.intercept).toBeGreaterThan(0);
    });
  });

  describe('getComparisonMetrics', () => {
    it('should compare current period with previous period', async () => {
      vi.mocked(prisma.employee.count)
        .mockResolvedValueOnce(150) // Current
        .mockResolvedValueOnce(140); // Previous

      const result = await AnalyticsService.getComparisonMetrics('tenant-1', 'EMPLOYEE_COUNT', {
        currentStart: new Date('2024-07-01'),
        currentEnd: new Date('2024-12-31'),
        previousStart: new Date('2024-01-01'),
        previousEnd: new Date('2024-06-30'),
      });

      expect(result.currentValue).toBe(150);
      expect(result.previousValue).toBe(140);
      expect(result.change).toBe(10);
      expect(result.changePercentage).toBeCloseTo(7.14, 1);
    });

    it('should show negative change for decline', async () => {
      vi.mocked(prisma.attendance.count)
        .mockResolvedValueOnce(900) // Current
        .mockResolvedValueOnce(950); // Previous

      const result = await AnalyticsService.getComparisonMetrics('tenant-1', 'ATTENDANCE', {
        currentStart: new Date('2024-07-01'),
        currentEnd: new Date('2024-07-31'),
        previousStart: new Date('2024-06-01'),
        previousEnd: new Date('2024-06-30'),
      });

      expect(result.change).toBe(-50);
      expect(result.changePercentage).toBeLessThan(0);
    });
  });

  describe('getDepartmentComparison', () => {
    it('should compare metrics across departments', async () => {
      vi.mocked(prisma.employee.groupBy).mockResolvedValue([
        { departmentId: 'dept-1', _count: { id: 50 } },
        { departmentId: 'dept-2', _count: { id: 30 } },
        { departmentId: 'dept-3', _count: { id: 20 } },
      ] as any);

      const result = await AnalyticsService.getDepartmentComparison('tenant-1', 'EMPLOYEE_COUNT');

      expect(result.departments).toHaveLength(3);
      expect(result.highest.departmentId).toBe('dept-1');
      expect(result.lowest.departmentId).toBe('dept-3');
    });
  });

  describe('getTopPerformers', () => {
    it('should identify top performers by attendance', async () => {
      vi.mocked(prisma.employee.findMany).mockResolvedValue([
        { id: 'emp-1', firstName: 'John', attendanceRate: 98 },
        { id: 'emp-2', firstName: 'Jane', attendanceRate: 97 },
        { id: 'emp-3', firstName: 'Bob', attendanceRate: 96 },
      ] as any);

      const result = await AnalyticsService.getTopPerformers('tenant-1', 'ATTENDANCE', {
        limit: 10,
      });

      expect(result).toHaveLength(3);
      expect(result[0].attendanceRate).toBe(98);
    });
  });

  describe('getBottlenecks', () => {
    it('should identify leave approval bottlenecks', async () => {
      vi.mocked(prisma.leaveApplication.findMany).mockResolvedValue([
        { id: 'leave-1', status: 'PENDING', appliedDate: new Date('2024-01-01') },
        { id: 'leave-2', status: 'PENDING', appliedDate: new Date('2024-01-05') },
      ] as any);

      const result = await AnalyticsService.getBottlenecks('tenant-1', 'LEAVE_APPROVAL');

      expect(result.pendingCount).toBe(2);
      expect(result.averageWaitTime).toBeGreaterThan(0);
      expect(result.oldestPending).toBeDefined();
    });
  });

  describe('getAnomalyDetection', () => {
    it('should detect attendance anomalies', async () => {
      const attendanceData = [95, 94, 96, 95, 60, 95]; // 60 is anomaly

      const result = AnalyticsService.detectAnomalies(attendanceData, 2); // 2 standard deviations

      expect(result.anomalies).toHaveLength(1);
      expect(result.anomalies[0].index).toBe(4);
      expect(result.anomalies[0].value).toBe(60);
    });

    it('should calculate z-score for anomaly detection', () => {
      const values = [10, 12, 11, 13, 50]; // 50 is outlier

      const result = AnalyticsService.calculateZScores(values);

      expect(result[4]).toBeGreaterThan(2); // Z-score for 50 should be high
    });
  });

  describe('getSeasonalAnalysis', () => {
    it('should analyze seasonal patterns in leave applications', async () => {
      vi.mocked(prisma.leaveApplication.groupBy).mockResolvedValue([
        { month: 1, _count: { id: 50 } },
        { month: 6, _count: { id: 80 } }, // Summer spike
        { month: 12, _count: { id: 90 } }, // Year-end spike
      ] as any);

      const result = await AnalyticsService.getSeasonalAnalysis('tenant-1', 'LEAVE_APPLICATIONS', {
        year: 2024,
      });

      expect(result.byMonth).toHaveLength(3);
      expect(result.peakMonth).toBe(12);
      expect(result.peakValue).toBe(90);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero employees', async () => {
      vi.mocked(prisma.employee.count).mockResolvedValue(0);

      const result = await AnalyticsService.getEmployeeMetrics('tenant-1');

      expect(result.totalEmployees).toBe(0);
      expect(result.turnoverRate).toBe(0);
    });

    it('should handle division by zero in rates', async () => {
      vi.mocked(prisma.attendance.count)
        .mockResolvedValueOnce(0) // Total
        .mockResolvedValueOnce(0); // Present

      const result = await AnalyticsService.getAttendanceMetrics('tenant-1', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      });

      expect(result.attendanceRate).toBe(0);
    });

    it('should handle empty trend data', async () => {
      const result = AnalyticsService.predictFutureValue([], 3);

      expect(result.predictions).toHaveLength(0);
      expect(result.confidence).toBe(0);
    });
  });
});
