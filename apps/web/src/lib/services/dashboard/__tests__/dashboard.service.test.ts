import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { DashboardService } from '../dashboard.service';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    dashboard: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    widget: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    employee: {
      count: vi.fn(),
    },
    attendance: {
      count: vi.fn(),
      aggregate: vi.fn(),
    },
    leaveApplication: {
      count: vi.fn(),
    },
    payroll: {
      aggregate: vi.fn(),
    },
  },
}));

describe('DashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockDashboard = {
    id: 'dash-1',
    tenantId: 'tenant-1',
    userId: 'user-1',
    name: 'HR Dashboard',
    isDefault: false,
    layout: [],
    createdAt: new Date(),
  };

  const mockWidget = {
    id: 'widget-1',
    dashboardId: 'dash-1',
    type: 'EMPLOYEE_COUNT',
    title: 'Total Employees',
    position: { x: 0, y: 0, w: 4, h: 2 },
    config: {},
  };

  describe('createDashboard', () => {
    it('should create new dashboard', async () => {
      vi.mocked(prisma.dashboard.create).mockResolvedValue(mockDashboard as any);

      const result = await DashboardService.createDashboard('tenant-1', 'user-1', {
        name: 'HR Dashboard',
      });

      expect(result.name).toBe('HR Dashboard');
      expect(prisma.dashboard.create).toHaveBeenCalled();
    });

    it('should create default dashboard', async () => {
      vi.mocked(prisma.dashboard.create).mockResolvedValue({
        ...mockDashboard,
        isDefault: true,
      } as any);

      const result = await DashboardService.createDashboard('tenant-1', 'user-1', {
        name: 'Default Dashboard',
        isDefault: true,
      });

      expect(result.isDefault).toBe(true);
    });
  });

  describe('getDashboards', () => {
    it('should return user dashboards', async () => {
      vi.mocked(prisma.dashboard.findMany).mockResolvedValue([
        mockDashboard,
        { ...mockDashboard, id: 'dash-2', name: 'Custom Dashboard' },
      ] as any);

      const result = await DashboardService.getDashboards('tenant-1', 'user-1');

      expect(result).toHaveLength(2);
    });

    it('should return default dashboard first', async () => {
      vi.mocked(prisma.dashboard.findMany).mockResolvedValue([
        mockDashboard,
        { ...mockDashboard, id: 'dash-2', isDefault: true },
      ] as any);

      const result = await DashboardService.getDashboards('tenant-1', 'user-1');

      expect(result[0].isDefault).toBe(true);
    });
  });

  describe('updateDashboard', () => {
    it('should update dashboard properties', async () => {
      vi.mocked(prisma.dashboard.findUnique).mockResolvedValue(mockDashboard as any);
      vi.mocked(prisma.dashboard.update).mockResolvedValue({
        ...mockDashboard,
        name: 'Updated Dashboard',
      } as any);

      const result = await DashboardService.updateDashboard('dash-1', 'tenant-1', {
        name: 'Updated Dashboard',
      });

      expect(result.name).toBe('Updated Dashboard');
    });

    it('should update dashboard layout', async () => {
      const newLayout = [
        { i: 'widget-1', x: 0, y: 0, w: 4, h: 2 },
        { i: 'widget-2', x: 4, y: 0, w: 4, h: 2 },
      ];

      vi.mocked(prisma.dashboard.findUnique).mockResolvedValue(mockDashboard as any);
      vi.mocked(prisma.dashboard.update).mockResolvedValue({
        ...mockDashboard,
        layout: newLayout,
      } as any);

      const result = await DashboardService.updateDashboard('dash-1', 'tenant-1', {
        layout: newLayout,
      });

      expect(result.layout).toEqual(newLayout);
    });
  });

  describe('addWidget', () => {
    it('should add widget to dashboard', async () => {
      vi.mocked(prisma.dashboard.findUnique).mockResolvedValue(mockDashboard as any);
      vi.mocked(prisma.widget.create).mockResolvedValue(mockWidget as any);

      const result = await DashboardService.addWidget('dash-1', 'tenant-1', {
        type: 'EMPLOYEE_COUNT',
        title: 'Total Employees',
        position: { x: 0, y: 0, w: 4, h: 2 },
      });

      expect(result.type).toBe('EMPLOYEE_COUNT');
      expect(result.title).toBe('Total Employees');
    });

    it('should validate widget type', async () => {
      vi.mocked(prisma.dashboard.findUnique).mockResolvedValue(mockDashboard as any);

      await expect(
        DashboardService.addWidget('dash-1', 'tenant-1', {
          type: 'INVALID_TYPE' as any,
          title: 'Test',
          position: { x: 0, y: 0, w: 4, h: 2 },
        })
      ).rejects.toThrow('Invalid widget type');
    });
  });

  describe('getWidgetData - Employee Widgets', () => {
    it('should get employee count widget data', async () => {
      vi.mocked(prisma.employee.count).mockResolvedValue(150);

      const result = await DashboardService.getWidgetData('tenant-1', {
        type: 'EMPLOYEE_COUNT',
      });

      expect(result.value).toBe(150);
      expect(result.type).toBe('number');
    });

    it('should get new hires widget data', async () => {
      vi.mocked(prisma.employee.count).mockResolvedValue(12);

      const result = await DashboardService.getWidgetData('tenant-1', {
        type: 'NEW_HIRES',
        config: {
          period: 'THIS_MONTH',
        },
      });

      expect(result.value).toBe(12);
      expect(result.label).toContain('This Month');
    });

    it('should get department distribution widget data', async () => {
      vi.mocked(prisma.employee.groupBy).mockResolvedValue([
        { departmentId: 'dept-1', _count: { id: 50 } },
        { departmentId: 'dept-2', _count: { id: 30 } },
      ] as any);

      const result = await DashboardService.getWidgetData('tenant-1', {
        type: 'DEPARTMENT_DISTRIBUTION',
      });

      expect(result.type).toBe('chart');
      expect(result.chartType).toBe('pie');
      expect(result.data).toHaveLength(2);
    });
  });

  describe('getWidgetData - Attendance Widgets', () => {
    it('should get attendance rate widget data', async () => {
      vi.mocked(prisma.attendance.count)
        .mockResolvedValueOnce(1000) // Total
        .mockResolvedValueOnce(950); // Present

      const result = await DashboardService.getWidgetData('tenant-1', {
        type: 'ATTENDANCE_RATE',
        config: { period: 'THIS_MONTH' },
      });

      expect(result.value).toBe(95);
      expect(result.unit).toBe('%');
    });

    it('should get average working hours widget data', async () => {
      vi.mocked(prisma.attendance.aggregate).mockResolvedValue({
        _avg: { workingHours: 8.3 },
      } as any);

      const result = await DashboardService.getWidgetData('tenant-1', {
        type: 'AVG_WORKING_HOURS',
        config: { period: 'THIS_WEEK' },
      });

      expect(result.value).toBe(8.3);
      expect(result.unit).toBe('hours');
    });

    it('should get overtime hours widget data', async () => {
      vi.mocked(prisma.attendance.aggregate).mockResolvedValue({
        _sum: { overtimeHours: 120 },
      } as any);

      const result = await DashboardService.getWidgetData('tenant-1', {
        type: 'OVERTIME_HOURS',
        config: { period: 'THIS_MONTH' },
      });

      expect(result.value).toBe(120);
    });
  });

  describe('getWidgetData - Leave Widgets', () => {
    it('should get pending leave requests widget data', async () => {
      vi.mocked(prisma.leaveApplication.count).mockResolvedValue(25);

      const result = await DashboardService.getWidgetData('tenant-1', {
        type: 'PENDING_LEAVES',
      });

      expect(result.value).toBe(25);
      expect(result.actionable).toBe(true);
    });

    it('should get leave trend widget data', async () => {
      vi.mocked(prisma.leaveApplication.groupBy).mockResolvedValue([
        { month: 1, _count: { id: 50 } },
        { month: 2, _count: { id: 60 } },
        { month: 3, _count: { id: 55 } },
      ] as any);

      const result = await DashboardService.getWidgetData('tenant-1', {
        type: 'LEAVE_TREND',
        config: { period: 'LAST_3_MONTHS' },
      });

      expect(result.type).toBe('chart');
      expect(result.chartType).toBe('line');
      expect(result.data).toHaveLength(3);
    });
  });

  describe('getWidgetData - Payroll Widgets', () => {
    it('should get payroll cost widget data', async () => {
      vi.mocked(prisma.payroll.aggregate).mockResolvedValue({
        _sum: { totalGross: 2500000 },
      } as any);

      const result = await DashboardService.getWidgetData('tenant-1', {
        type: 'PAYROLL_COST',
        config: { period: 'THIS_MONTH' },
      });

      expect(result.value).toBe(2500000);
      expect(result.formatted).toContain('2,500,000');
    });

    it('should get average salary widget data', async () => {
      vi.mocked(prisma.payroll.aggregate).mockResolvedValue({
        _avg: { totalGross: 15000 },
      } as any);

      const result = await DashboardService.getWidgetData('tenant-1', {
        type: 'AVG_SALARY',
      });

      expect(result.value).toBe(15000);
    });
  });

  describe('getWidgetData - KPI Widgets', () => {
    it('should get turnover rate widget data', async () => {
      vi.mocked(prisma.employee.count)
        .mockResolvedValueOnce(150) // Total employees
        .mockResolvedValueOnce(12); // Terminations

      const result = await DashboardService.getWidgetData('tenant-1', {
        type: 'TURNOVER_RATE',
        config: { period: 'THIS_YEAR' },
      });

      expect(result.value).toBeGreaterThan(0);
      expect(result.unit).toBe('%');
      expect(result.trend).toBeDefined();
    });

    it('should show trend indicator', async () => {
      vi.mocked(prisma.employee.count)
        .mockResolvedValueOnce(150)
        .mockResolvedValueOnce(12)
        .mockResolvedValueOnce(140)
        .mockResolvedValueOnce(8);

      const result = await DashboardService.getWidgetData('tenant-1', {
        type: 'TURNOVER_RATE',
        config: { period: 'THIS_YEAR', showTrend: true },
      });

      expect(result.trend).toBeDefined();
      expect(result.trend?.direction).toMatch(/up|down|stable/);
    });
  });

  describe('getWidgetData - Custom Widgets', () => {
    it('should support custom SQL query widgets', async () => {
      const result = await DashboardService.getWidgetData('tenant-1', {
        type: 'CUSTOM',
        config: {
          query: 'SELECT COUNT(*) as count FROM employees WHERE status = ?',
          params: ['ACTIVE'],
        },
      });

      expect(result.type).toBe('custom');
    });
  });

  describe('refreshWidget', () => {
    it('should refresh widget data', async () => {
      vi.mocked(prisma.widget.findUnique).mockResolvedValue(mockWidget as any);
      vi.mocked(prisma.employee.count).mockResolvedValue(152);

      const result = await DashboardService.refreshWidget('widget-1', 'tenant-1');

      expect(result.value).toBe(152);
      expect(result.lastUpdated).toBeDefined();
    });

    it('should cache widget data', async () => {
      vi.mocked(prisma.widget.findUnique).mockResolvedValue(mockWidget as any);
      vi.mocked(prisma.employee.count).mockResolvedValue(150);

      // First call
      await DashboardService.refreshWidget('widget-1', 'tenant-1');

      // Second call should use cache
      const result = await DashboardService.refreshWidget('widget-1', 'tenant-1', {
        useCache: true,
        cacheDuration: 300, // 5 minutes
      });

      expect(result.cached).toBe(true);
    });
  });

  describe('removeWidget', () => {
    it('should remove widget from dashboard', async () => {
      vi.mocked(prisma.widget.findUnique).mockResolvedValue(mockWidget as any);
      vi.mocked(prisma.widget.delete).mockResolvedValue(mockWidget as any);

      await DashboardService.removeWidget('widget-1', 'tenant-1');

      expect(prisma.widget.delete).toHaveBeenCalledWith({
        where: { id: 'widget-1' },
      });
    });
  });

  describe('cloneDashboard', () => {
    it('should clone existing dashboard', async () => {
      vi.mocked(prisma.dashboard.findUnique).mockResolvedValue({
        ...mockDashboard,
        widgets: [mockWidget],
      } as any);
      vi.mocked(prisma.dashboard.create).mockResolvedValue({
        ...mockDashboard,
        id: 'dash-2',
        name: 'HR Dashboard (Copy)',
      } as any);

      const result = await DashboardService.cloneDashboard('dash-1', 'tenant-1', 'user-1');

      expect(result.name).toContain('Copy');
      expect(result.id).not.toBe('dash-1');
    });
  });

  describe('exportDashboard', () => {
    it('should export dashboard configuration', async () => {
      vi.mocked(prisma.dashboard.findUnique).mockResolvedValue({
        ...mockDashboard,
        widgets: [mockWidget, { ...mockWidget, id: 'widget-2' }],
      } as any);

      const result = await DashboardService.exportDashboard('dash-1', 'tenant-1');

      expect(result.dashboard).toBeDefined();
      expect(result.widgets).toHaveLength(2);
      expect(result.version).toBe('1.0');
    });
  });

  describe('importDashboard', () => {
    it('should import dashboard from configuration', async () => {
      const config = {
        dashboard: { name: 'Imported Dashboard', layout: [] },
        widgets: [mockWidget],
        version: '1.0',
      };

      vi.mocked(prisma.dashboard.create).mockResolvedValue(mockDashboard as any);
      vi.mocked(prisma.widget.create).mockResolvedValue(mockWidget as any);

      const result = await DashboardService.importDashboard('tenant-1', 'user-1', config);

      expect(result).toBeDefined();
      expect(prisma.dashboard.create).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing widget data gracefully', async () => {
      vi.mocked(prisma.employee.count).mockRejectedValue(new Error('Database error'));

      const result = await DashboardService.getWidgetData('tenant-1', {
        type: 'EMPLOYEE_COUNT',
      });

      expect(result.error).toBeDefined();
      expect(result.value).toBe(0);
    });

    it('should handle division by zero in percentage calculations', async () => {
      vi.mocked(prisma.attendance.count)
        .mockResolvedValueOnce(0) // Total
        .mockResolvedValueOnce(0); // Present

      const result = await DashboardService.getWidgetData('tenant-1', {
        type: 'ATTENDANCE_RATE',
      });

      expect(result.value).toBe(0);
    });

    it('should handle empty chart data', async () => {
      vi.mocked(prisma.employee.groupBy).mockResolvedValue([]);

      const result = await DashboardService.getWidgetData('tenant-1', {
        type: 'DEPARTMENT_DISTRIBUTION',
      });

      expect(result.data).toHaveLength(0);
      expect(result.empty).toBe(true);
    });
  });
});
