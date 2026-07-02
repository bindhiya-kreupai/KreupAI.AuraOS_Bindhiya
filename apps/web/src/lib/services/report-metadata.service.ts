/**
 * @module ReportMetadataService
 * @description Provides real (DB-backed) data-source catalogs, column metadata, and
 *              tenant-scoped preview queries for the custom report builder. Replaces the
 *              previously mocked column/preview/data-source catalogs used by the
 *              ColumnPicker, DataSourceSelector, ReportPreview, and CustomReportBuilder
 *              components.
 * @project AURA HCM Platform
 */

import { prisma } from '@/lib/database';

export type ColumnType = 'text' | 'number' | 'date' | 'boolean' | 'currency';

export interface ReportColumnMeta {
  id: string;
  name: string;
  type: ColumnType;
  category: string;
}

export interface ReportDataSourceMeta {
  id: string;
  name: string;
  description: string;
  icon: string;
  columns: ReportColumnMeta[];
  recordCount: number;
}

interface DataSourceDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  columns: ReportColumnMeta[];
  /** Count records for this data source scoped to tenant. */
  count: (tenantId: string) => Promise<number>;
  /** Run a preview query (limited rows) scoped to tenant, returning flat rows. */
  preview: (tenantId: string, limit: number) => Promise<Record<string, unknown>[]>;
}

// ---------------------------------------------------------------------------
// Data-source definitions — each column maps to a real Prisma field/relation.
// ---------------------------------------------------------------------------

const DATA_SOURCES: DataSourceDef[] = [
  {
    id: 'employees',
    name: 'Employees',
    description: 'Employee demographics, roles, and status',
    icon: 'Users',
    columns: [
      { id: 'employeeCode', name: 'Employee ID', type: 'text', category: 'Identity' },
      { id: 'firstName', name: 'First Name', type: 'text', category: 'Identity' },
      { id: 'lastName', name: 'Last Name', type: 'text', category: 'Identity' },
      { id: 'email', name: 'Email', type: 'text', category: 'Contact' },
      { id: 'department', name: 'Department', type: 'text', category: 'Organization' },
      { id: 'jobProfile', name: 'Job Title', type: 'text', category: 'Organization' },
      { id: 'location', name: 'Location', type: 'text', category: 'Organization' },
      { id: 'status', name: 'Status', type: 'text', category: 'Employment' },
      { id: 'joiningDate', name: 'Joining Date', type: 'date', category: 'Employment' },
    ],
    count: (tenantId) =>
      prisma.employee.count({ where: { company: { tenantId }, isDeleted: false } }),
    preview: async (tenantId, limit) => {
      const rows = await prisma.employee.findMany({
        where: { company: { tenantId }, isDeleted: false },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          department: { select: { name: true } },
          jobProfile: { select: { title: true } },
          location: { select: { name: true } },
          status: { select: { name: true } },
        },
      });
      return rows.map((e) => ({
        employeeCode: e.employeeCode,
        firstName: e.firstName,
        lastName: e.lastName,
        email: e.email,
        department: e.department?.name ?? null,
        jobProfile: e.jobProfile?.title ?? null,
        location: e.location?.name ?? null,
        status: e.status?.name ?? null,
        joiningDate: e.joiningDate?.toISOString() ?? null,
      }));
    },
  },
  {
    id: 'attendance',
    name: 'Time & Attendance',
    description: 'Clock-in/out records and worked hours',
    icon: 'Clock',
    columns: [
      { id: 'date', name: 'Date', type: 'date', category: 'Time' },
      { id: 'clockIn', name: 'Clock In', type: 'date', category: 'Time' },
      { id: 'clockOut', name: 'Clock Out', type: 'date', category: 'Time' },
      { id: 'workHours', name: 'Worked Hours', type: 'number', category: 'Time' },
      { id: 'overtimeHours', name: 'Overtime Hours', type: 'number', category: 'Time' },
      { id: 'status', name: 'Status', type: 'text', category: 'Status' },
    ],
    count: (tenantId) => prisma.attendanceRecord.count({ where: { tenantId } }),
    preview: async (tenantId, limit) => {
      const rows = await prisma.attendanceRecord.findMany({
        where: { tenantId },
        orderBy: { date: 'desc' },
        take: limit,
      });
      return rows.map((r) => {
        const rec = r as Record<string, unknown>;
        return {
          date: rec.date instanceof Date ? rec.date.toISOString() : (rec.date ?? null),
          clockIn: rec.clockIn instanceof Date ? rec.clockIn.toISOString() : (rec.clockIn ?? null),
          clockOut:
            rec.clockOut instanceof Date ? rec.clockOut.toISOString() : (rec.clockOut ?? null),
          workHours: (rec.workHours as number) ?? null,
          overtimeHours: (rec.overtimeHours as number) ?? null,
          status: (rec.status as string) ?? null,
        };
      });
    },
  },
  {
    id: 'leave',
    name: 'Leave & Absence',
    description: 'Leave requests, dates, and status',
    icon: 'Calendar',
    columns: [
      { id: 'startDate', name: 'Start Date', type: 'date', category: 'Period' },
      { id: 'endDate', name: 'End Date', type: 'date', category: 'Period' },
      { id: 'totalDays', name: 'Days', type: 'number', category: 'Period' },
      { id: 'status', name: 'Status', type: 'text', category: 'Leave' },
    ],
    count: (tenantId) => prisma.leaveRequest.count({ where: { tenantId } }),
    preview: async (tenantId, limit) => {
      const rows = await prisma.leaveRequest.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
      return rows.map((r) => {
        const rec = r as Record<string, unknown>;
        return {
          startDate:
            rec.startDate instanceof Date ? rec.startDate.toISOString() : (rec.startDate ?? null),
          endDate: rec.endDate instanceof Date ? rec.endDate.toISOString() : (rec.endDate ?? null),
          totalDays: rec.totalDays == null ? null : Number(rec.totalDays),
          status: (rec.status as string) ?? null,
        };
      });
    },
  },
  {
    id: 'payroll',
    name: 'Payroll & Compensation',
    description: 'Payslip earnings, deductions, and net pay',
    icon: 'DollarSign',
    columns: [
      { id: 'grossSalary', name: 'Gross Pay', type: 'currency', category: 'Earnings' },
      { id: 'netSalary', name: 'Net Pay', type: 'currency', category: 'Earnings' },
      { id: 'totalDeductions', name: 'Total Deductions', type: 'currency', category: 'Deductions' },
      { id: 'status', name: 'Status', type: 'text', category: 'Status' },
    ],
    count: (tenantId) => prisma.payslip.count({ where: { payrollRun: { tenantId } } }),
    preview: async (tenantId, limit) => {
      const rows = await prisma.payslip.findMany({
        where: { payrollRun: { tenantId } },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
      return rows.map((r) => {
        const rec = r as Record<string, unknown>;
        const toNum = (v: unknown) => (v == null ? null : Number(v));
        return {
          grossSalary: toNum(rec.grossSalary),
          netSalary: toNum(rec.netSalary),
          totalDeductions: toNum(rec.totalDeductions),
          status: (rec.status as string) ?? null,
        };
      });
    },
  },
];

export class ReportMetadataService {
  /** List all data sources (columns only, no counts) — cheap. */
  static listDataSourceDefs(): DataSourceDef[] {
    return DATA_SOURCES;
  }

  /** List data sources with tenant-scoped record counts. */
  static async getDataSources(tenantId: string): Promise<ReportDataSourceMeta[]> {
    return Promise.all(
      DATA_SOURCES.map(async (ds) => {
        let recordCount = 0;
        try {
          recordCount = await ds.count(tenantId);
        } catch {
          recordCount = 0;
        }
        return {
          id: ds.id,
          name: ds.name,
          description: ds.description,
          icon: ds.icon,
          columns: ds.columns,
          recordCount,
        };
      })
    );
  }

  /** Columns for a single data source. */
  static getColumns(dataSourceId: string): ReportColumnMeta[] {
    return DATA_SOURCES.find((d) => d.id === dataSourceId)?.columns ?? [];
  }

  /**
   * Preview rows for a data source, projected to the requested columns (if any).
   * Returns real, tenant-scoped data.
   */
  static async preview(
    dataSourceId: string,
    tenantId: string,
    selectedColumns: string[],
    limit = 25
  ): Promise<{
    columns: ReportColumnMeta[];
    rows: Record<string, unknown>[];
    totalRows: number;
  }> {
    const ds = DATA_SOURCES.find((d) => d.id === dataSourceId);
    if (!ds) {
      return { columns: [], rows: [], totalRows: 0 };
    }

    const safeLimit = Math.min(Math.max(limit, 1), 100);

    const cols =
      selectedColumns.length > 0
        ? ds.columns.filter((c) => selectedColumns.includes(c.id))
        : ds.columns;
    const effectiveCols = cols.length > 0 ? cols : ds.columns;

    let totalRows = 0;
    let rawRows: Record<string, unknown>[] = [];
    try {
      [totalRows, rawRows] = await Promise.all([
        ds.count(tenantId),
        ds.preview(tenantId, safeLimit),
      ]);
    } catch {
      totalRows = 0;
      rawRows = [];
    }

    // Project rows to only the effective columns.
    const projected = rawRows.map((row) => {
      const out: Record<string, unknown> = {};
      for (const c of effectiveCols) {
        out[c.id] = row[c.id] ?? null;
      }
      return out;
    });

    return { columns: effectiveCols, rows: projected, totalRows };
  }
}

export default ReportMetadataService;
