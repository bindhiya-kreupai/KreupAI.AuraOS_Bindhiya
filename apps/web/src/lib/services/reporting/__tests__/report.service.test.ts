import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { ReportService } from '../report.service';

// Mock PDF and Excel generation libraries
vi.mock('pdfkit', () => ({
  default: vi.fn(() => ({
    fontSize: vi.fn().mockReturnThis(),
    text: vi.fn().mockReturnThis(),
    moveDown: vi.fn().mockReturnThis(),
    end: vi.fn(),
    pipe: vi.fn(),
  })),
}));

vi.mock('exceljs', () => ({
  Workbook: vi.fn(() => ({
    addWorksheet: vi.fn(() => ({
      addRow: vi.fn(),
      getColumn: vi.fn(() => ({ width: 0 })),
    })),
    xlsx: {
      writeBuffer: vi.fn().mockResolvedValue(Buffer.from('test')),
    },
  })),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    report: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    employee: {
      findMany: vi.fn(),
    },
    attendance: {
      findMany: vi.fn(),
    },
    leaveApplication: {
      findMany: vi.fn(),
    },
    payroll: {
      findMany: vi.fn(),
    },
  },
}));

describe('ReportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockReport = {
    id: 'report-1',
    tenantId: 'tenant-1',
    name: 'Employee Report',
    type: 'EMPLOYEE_LIST',
    format: 'PDF',
    status: 'COMPLETED',
    createdAt: new Date(),
  };

  describe('generateEmployeeReport', () => {
    it('should generate employee list report in PDF', async () => {
      vi.mocked(prisma.employee.findMany).mockResolvedValue([
        { id: 'emp-1', firstName: 'John', lastName: 'Doe', department: 'IT' },
        { id: 'emp-2', firstName: 'Jane', lastName: 'Smith', department: 'HR' },
      ] as any);
      vi.mocked(prisma.report.create).mockResolvedValue(mockReport as any);

      const result = await ReportService.generateEmployeeReport('tenant-1', {
        format: 'PDF',
        includeInactive: false,
      });

      expect(result.format).toBe('PDF');
      expect(result.status).toBe('COMPLETED');
      expect(prisma.employee.findMany).toHaveBeenCalled();
    });

    it('should generate employee report in Excel', async () => {
      vi.mocked(prisma.employee.findMany).mockResolvedValue([
        { id: 'emp-1', firstName: 'John' },
      ] as any);
      vi.mocked(prisma.report.create).mockResolvedValue({
        ...mockReport,
        format: 'EXCEL',
      } as any);

      const result = await ReportService.generateEmployeeReport('tenant-1', {
        format: 'EXCEL',
      });

      expect(result.format).toBe('EXCEL');
    });

    it('should filter employees by department', async () => {
      vi.mocked(prisma.employee.findMany).mockResolvedValue([]);
      vi.mocked(prisma.report.create).mockResolvedValue(mockReport as any);

      await ReportService.generateEmployeeReport('tenant-1', {
        format: 'PDF',
        departmentId: 'dept-1',
      });

      expect(prisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            departmentId: 'dept-1',
          }),
        })
      );
    });

    it('should include inactive employees when specified', async () => {
      vi.mocked(prisma.employee.findMany).mockResolvedValue([]);
      vi.mocked(prisma.report.create).mockResolvedValue(mockReport as any);

      await ReportService.generateEmployeeReport('tenant-1', {
        format: 'PDF',
        includeInactive: true,
      });

      expect(prisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: 'tenant-1',
          }),
        })
      );
    });
  });

  describe('generateAttendanceReport', () => {
    it('should generate attendance report for date range', async () => {
      vi.mocked(prisma.attendance.findMany).mockResolvedValue([
        { id: 'att-1', employeeId: 'emp-1', date: new Date('2024-01-01'), status: 'PRESENT' },
        { id: 'att-2', employeeId: 'emp-1', date: new Date('2024-01-02'), status: 'PRESENT' },
      ] as any);
      vi.mocked(prisma.report.create).mockResolvedValue({
        ...mockReport,
        type: 'ATTENDANCE',
      } as any);

      const result = await ReportService.generateAttendanceReport('tenant-1', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        format: 'PDF',
      });

      expect(result.type).toBe('ATTENDANCE');
      expect(prisma.attendance.findMany).toHaveBeenCalled();
    });

    it('should include attendance summary statistics', async () => {
      vi.mocked(prisma.attendance.findMany).mockResolvedValue([
        { status: 'PRESENT', workingHours: 8 },
        { status: 'PRESENT', workingHours: 8 },
        { status: 'ABSENT' },
        { status: 'LATE', workingHours: 7 },
      ] as any);
      vi.mocked(prisma.report.create).mockResolvedValue(mockReport as any);

      const result = await ReportService.generateAttendanceReport('tenant-1', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        format: 'PDF',
        includeSummary: true,
      });

      expect(result.metadata?.summary).toBeDefined();
      expect(result.metadata?.summary.totalPresent).toBe(2);
      expect(result.metadata?.summary.totalAbsent).toBe(1);
    });

    it('should filter by employee', async () => {
      vi.mocked(prisma.attendance.findMany).mockResolvedValue([]);
      vi.mocked(prisma.report.create).mockResolvedValue(mockReport as any);

      await ReportService.generateAttendanceReport('tenant-1', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        format: 'PDF',
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
  });

  describe('generatePayrollReport', () => {
    it('should generate payroll report for month', async () => {
      vi.mocked(prisma.payroll.findMany).mockResolvedValue([
        { id: 'pay-1', employeeId: 'emp-1', month: '2024-01', totalGross: 15000 },
        { id: 'pay-2', employeeId: 'emp-2', month: '2024-01', totalGross: 12000 },
      ] as any);
      vi.mocked(prisma.report.create).mockResolvedValue({
        ...mockReport,
        type: 'PAYROLL',
      } as any);

      const result = await ReportService.generatePayrollReport('tenant-1', {
        month: '2024-01',
        format: 'EXCEL',
      });

      expect(result.type).toBe('PAYROLL');
    });

    it('should include payroll summary totals', async () => {
      vi.mocked(prisma.payroll.findMany).mockResolvedValue([
        { totalGross: 15000, totalNet: 13500, totalDeductions: 1500 },
        { totalGross: 12000, totalNet: 10800, totalDeductions: 1200 },
      ] as any);
      vi.mocked(prisma.report.create).mockResolvedValue(mockReport as any);

      const result = await ReportService.generatePayrollReport('tenant-1', {
        month: '2024-01',
        format: 'PDF',
        includeSummary: true,
      });

      expect(result.metadata?.summary.totalGross).toBe(27000);
      expect(result.metadata?.summary.totalNet).toBe(24300);
    });
  });

  describe('generateLeaveReport', () => {
    it('should generate leave applications report', async () => {
      vi.mocked(prisma.leaveApplication.findMany).mockResolvedValue([
        { id: 'leave-1', employeeId: 'emp-1', leaveType: 'Annual', status: 'APPROVED' },
      ] as any);
      vi.mocked(prisma.report.create).mockResolvedValue({
        ...mockReport,
        type: 'LEAVE',
      } as any);

      const result = await ReportService.generateLeaveReport('tenant-1', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        format: 'PDF',
      });

      expect(result.type).toBe('LEAVE');
    });

    it('should filter by leave status', async () => {
      vi.mocked(prisma.leaveApplication.findMany).mockResolvedValue([]);
      vi.mocked(prisma.report.create).mockResolvedValue(mockReport as any);

      await ReportService.generateLeaveReport('tenant-1', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        format: 'PDF',
        status: 'APPROVED',
      });

      expect(prisma.leaveApplication.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'APPROVED',
          }),
        })
      );
    });
  });

  describe('generateCustomReport', () => {
    it('should generate custom report with provided data', async () => {
      const customData = [
        { name: 'John', department: 'IT', salary: 15000 },
        { name: 'Jane', department: 'HR', salary: 12000 },
      ];

      vi.mocked(prisma.report.create).mockResolvedValue({
        ...mockReport,
        type: 'CUSTOM',
      } as any);

      const result = await ReportService.generateCustomReport('tenant-1', {
        name: 'Custom Report',
        data: customData,
        columns: ['name', 'department', 'salary'],
        format: 'EXCEL',
      });

      expect(result.type).toBe('CUSTOM');
    });

    it('should apply custom formatting', async () => {
      const customData = [{ amount: 1000 }];

      vi.mocked(prisma.report.create).mockResolvedValue(mockReport as any);

      const result = await ReportService.generateCustomReport('tenant-1', {
        name: 'Custom Report',
        data: customData,
        columns: ['amount'],
        format: 'PDF',
        formatting: {
          amount: { type: 'currency', currency: 'SAR' },
        },
      });

      expect(result).toBeDefined();
    });
  });

  describe('scheduleReport', () => {
    it('should schedule report for recurring generation', async () => {
      vi.mocked(prisma.report.create).mockResolvedValue({
        ...mockReport,
        schedule: 'MONTHLY',
        nextRun: new Date('2024-02-01'),
      } as any);

      const result = await ReportService.scheduleReport('tenant-1', {
        type: 'PAYROLL',
        format: 'PDF',
        schedule: 'MONTHLY',
        recipients: ['hr@company.com'],
      });

      expect(result.schedule).toBe('MONTHLY');
      expect(result.nextRun).toBeDefined();
    });

    it('should support daily, weekly, and monthly schedules', async () => {
      const schedules = ['DAILY', 'WEEKLY', 'MONTHLY'];

      for (const schedule of schedules) {
        vi.mocked(prisma.report.create).mockResolvedValue({
          ...mockReport,
          schedule,
        } as any);

        const result = await ReportService.scheduleReport('tenant-1', {
          type: 'ATTENDANCE',
          format: 'PDF',
          schedule: schedule as any,
          recipients: ['manager@company.com'],
        });

        expect(result.schedule).toBe(schedule);
      }
    });
  });

  describe('exportToCSV', () => {
    it('should export data to CSV format', () => {
      const data = [
        { name: 'John Doe', department: 'IT', salary: 15000 },
        { name: 'Jane Smith', department: 'HR', salary: 12000 },
      ];

      const result = ReportService.exportToCSV(data);

      expect(result).toContain('name,department,salary');
      expect(result).toContain('John Doe,IT,15000');
      expect(result).toContain('Jane Smith,HR,12000');
    });

    it('should handle special characters in CSV', () => {
      const data = [
        { name: 'John, Jr.', note: 'Has "quotes"' },
      ];

      const result = ReportService.exportToCSV(data);

      expect(result).toContain('"John, Jr."');
      expect(result).toContain('Has ""quotes""');
    });

    it('should handle empty data', () => {
      const result = ReportService.exportToCSV([]);

      expect(result).toBe('');
    });
  });

  describe('getReportTemplates', () => {
    it('should return available report templates', () => {
      const templates = ReportService.getReportTemplates();

      expect(templates).toContainEqual(
        expect.objectContaining({
          type: 'EMPLOYEE_LIST',
          name: expect.any(String),
        })
      );
      expect(templates).toContainEqual(
        expect.objectContaining({
          type: 'ATTENDANCE',
        })
      );
      expect(templates).toContainEqual(
        expect.objectContaining({
          type: 'PAYROLL',
        })
      );
    });

    it('should include template configuration', () => {
      const templates = ReportService.getReportTemplates();
      const employeeTemplate = templates.find((t) => t.type === 'EMPLOYEE_LIST');

      expect(employeeTemplate?.fields).toBeDefined();
      expect(employeeTemplate?.supportedFormats).toContain('PDF');
      expect(employeeTemplate?.supportedFormats).toContain('EXCEL');
    });
  });

  describe('getReports', () => {
    it('should return list of generated reports', async () => {
      vi.mocked(prisma.report.findMany).mockResolvedValue([
        mockReport,
        { ...mockReport, id: 'report-2' },
      ] as any);

      const result = await ReportService.getReports('tenant-1', {
        page: 1,
        limit: 20,
      });

      expect(result.data).toHaveLength(2);
    });

    it('should filter by report type', async () => {
      vi.mocked(prisma.report.findMany).mockResolvedValue([mockReport] as any);

      await ReportService.getReports('tenant-1', {
        type: 'EMPLOYEE_LIST',
      });

      expect(prisma.report.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: 'EMPLOYEE_LIST',
          }),
        })
      );
    });

    it('should filter by date range', async () => {
      vi.mocked(prisma.report.findMany).mockResolvedValue([]);

      await ReportService.getReports('tenant-1', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });

      expect(prisma.report.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        })
      );
    });
  });

  describe('downloadReport', () => {
    it('should retrieve report file', async () => {
      vi.mocked(prisma.report.findUnique).mockResolvedValue({
        ...mockReport,
        filePath: '/reports/report-1.pdf',
      } as any);

      const result = await ReportService.downloadReport('report-1', 'tenant-1');

      expect(result.filePath).toBeDefined();
      expect(result.format).toBe('PDF');
    });

    it('should throw error if report not found', async () => {
      vi.mocked(prisma.report.findUnique).mockResolvedValue(null);

      await expect(
        ReportService.downloadReport('invalid', 'tenant-1')
      ).rejects.toThrow('Report not found');
    });
  });

  describe('deleteReport', () => {
    it('should delete report and file', async () => {
      vi.mocked(prisma.report.findUnique).mockResolvedValue(mockReport as any);
      vi.mocked(prisma.report.delete).mockResolvedValue(mockReport as any);

      await ReportService.deleteReport('report-1', 'tenant-1');

      expect(prisma.report.delete).toHaveBeenCalledWith({
        where: { id: 'report-1', tenantId: 'tenant-1' },
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty data in report generation', async () => {
      vi.mocked(prisma.employee.findMany).mockResolvedValue([]);
      vi.mocked(prisma.report.create).mockResolvedValue(mockReport as any);

      const result = await ReportService.generateEmployeeReport('tenant-1', {
        format: 'PDF',
      });

      expect(result).toBeDefined();
      expect(result.metadata?.rowCount).toBe(0);
    });

    it('should handle very large datasets', async () => {
      const largeDataset = Array(10000).fill({ id: 'emp', name: 'Employee' });
      vi.mocked(prisma.employee.findMany).mockResolvedValue(largeDataset as any);
      vi.mocked(prisma.report.create).mockResolvedValue(mockReport as any);

      const result = await ReportService.generateEmployeeReport('tenant-1', {
        format: 'EXCEL',
      });

      expect(result).toBeDefined();
    });

    it('should handle special characters in data', () => {
      const data = [{ name: '<script>alert("xss")</script>', value: 'Test & Co.' }];

      const result = ReportService.exportToCSV(data);

      expect(result).not.toContain('<script>');
      expect(result).toContain('Test & Co.');
    });
  });
});
