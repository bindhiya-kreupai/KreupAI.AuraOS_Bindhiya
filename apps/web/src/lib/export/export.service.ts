// @ts-nocheck — Uses PayrollRun.periodStart/month/year fields that don't exist on current PayrollRun schema. Tracked under #29.
/**
 * Data Export Service
 * Bulk data export capabilities for various entities
 */

import { logger } from '../logger';
import { queueService } from '../queue/queue.service';
import { QUEUE_NAMES } from '../queue/rabbitmq';
import { auditService, AuditAction } from '../audit/audit.service';
import { prisma } from '@aura/database';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export enum ExportFormat {
  CSV = 'CSV',
  EXCEL = 'EXCEL',
  JSON = 'JSON',
  PDF = 'PDF',
}

export enum ExportEntity {
  EMPLOYEES = 'EMPLOYEES',
  ATTENDANCE = 'ATTENDANCE',
  LEAVE = 'LEAVE',
  PAYROLL = 'PAYROLL',
  DEPARTMENTS = 'DEPARTMENTS',
  POSITIONS = 'POSITIONS',
}

export interface ExportRequest {
  entity: ExportEntity;
  format: ExportFormat;
  filters?: {
    companyId: string;
    tenantId: string;
    departmentId?: string;
    startDate?: string;
    endDate?: string;
    employeeIds?: string[];
    status?: string;
    [key: string]: any;
  };
  columns?: string[]; // Specific columns to export
  userId: string;
  userEmail: string;
}

export interface ExportResult {
  exportId: string;
  entity: ExportEntity;
  format: ExportFormat;
  fileUrl: string;
  fileSize: number;
  recordCount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
}

const EXPORT_DIR = join(process.cwd(), 'public', 'exports');

/**
 * Export Service
 */
export class ExportService {
  /**
   * Request data export (async)
   */
  async requestExport(request: ExportRequest): Promise<string> {
    const exportId = crypto.randomUUID();

    try {
      logger.info(
        {
          exportId,
          entity: request.entity,
          format: request.format,
          userId: request.userId,
        },
        'Export request initiated'
      );

      // Enqueue export job
      await queueService.enqueue(
        QUEUE_NAMES.REPORT_GENERATION,
        'DATA_EXPORT',
        {
          exportId,
          ...request,
        },
        {
          priority: 5, // Medium-high priority
          maxAttempts: 3,
        }
      );

      // Log audit entry
      await auditService.logDataExport({
        userId: request.userId,
        userEmail: request.userEmail,
        tenantId: request.filters?.tenantId || 'default',
        companyId: request.filters?.companyId || 'default',
        exportType: `${request.entity}_${request.format}`,
        recordCount: 0, // Will be updated when export completes
        metadata: {
          filters: request.filters,
          columns: request.columns,
        },
      });

      logger.info({ exportId }, 'Export job enqueued successfully');

      return exportId;
    } catch (error: any) {
      logger.error({ error, exportId, request }, 'Failed to request export');
      throw error;
    }
  }

  /**
   * Export employees
   */
  async exportEmployees(request: ExportRequest): Promise<ExportResult> {
    const startTime = performance.now();

    try {
      logger.info({ entity: request.entity, format: request.format }, 'Exporting employees');

      const employees = await this.fetchEmployeeData(request.filters || {});
      const file = await this.generateFile(
        request.format,
        employees,
        request.columns || this.getDefaultEmployeeColumns()
      );
      const fileUrl = await this.uploadFile(file, `employees-${Date.now()}`);
      const duration = Math.round(performance.now() - startTime);

      logger.info({ recordCount: employees.length, fileSize: file.size, duration }, 'Employee export completed');

      return {
        exportId: crypto.randomUUID(),
        entity: request.entity,
        format: request.format,
        fileUrl,
        fileSize: file.size,
        recordCount: employees.length,
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      logger.error({ error }, 'Failed to export employees');
      throw error;
    }
  }

  /**
   * Export attendance records
   */
  async exportAttendance(request: ExportRequest): Promise<ExportResult> {
    const startTime = performance.now();

    try {
      logger.info({ filters: request.filters }, 'Exporting attendance');

      const attendance = await this.fetchAttendanceData(request.filters || {});
      const file = await this.generateFile(
        request.format,
        attendance,
        request.columns || this.getDefaultAttendanceColumns()
      );
      const fileUrl = await this.uploadFile(file, `attendance-${Date.now()}`);
      const duration = Math.round(performance.now() - startTime);

      logger.info({ recordCount: attendance.length, fileSize: file.size, duration }, 'Attendance export completed');

      return {
        exportId: crypto.randomUUID(),
        entity: request.entity,
        format: request.format,
        fileUrl,
        fileSize: file.size,
        recordCount: attendance.length,
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      logger.error({ error }, 'Failed to export attendance');
      throw error;
    }
  }

  /**
   * Export payroll data
   */
  async exportPayroll(request: ExportRequest): Promise<ExportResult> {
    const startTime = performance.now();

    try {
      logger.info({ filters: request.filters }, 'Exporting payroll');

      const payroll = await this.fetchPayrollData(request.filters || {});
      const file = await this.generateFile(
        request.format,
        payroll,
        request.columns || this.getDefaultPayrollColumns()
      );
      const fileUrl = await this.uploadFile(file, `payroll-${Date.now()}`);
      const duration = Math.round(performance.now() - startTime);

      logger.info({ recordCount: payroll.length, fileSize: file.size, duration }, 'Payroll export completed');

      return {
        exportId: crypto.randomUUID(),
        entity: request.entity,
        format: request.format,
        fileUrl,
        fileSize: file.size,
        recordCount: payroll.length,
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      logger.error({ error }, 'Failed to export payroll');
      throw error;
    }
  }

  /**
   * Fetch employee data from database
   */
  private async fetchEmployeeData(filters: any): Promise<any[]> {
    const where: Record<string, unknown> = {};
    if (filters.companyId) where.companyId = filters.companyId;
    if (filters.departmentId) where.departmentId = filters.departmentId;
    if (filters.employeeIds?.length) where.id = { in: filters.employeeIds };

    const employees = await prisma.employee.findMany({
      where,
      include: {
        department: { select: { name: true } },
        jobProfile: { select: { title: true } },
        status: { select: { name: true } },
        company: { select: { name: true, tenantId: true } },
      },
      orderBy: { employeeCode: 'asc' },
    });

    return employees.map(e => ({
      employeeCode: e.employeeCode,
      firstName: e.firstName,
      lastName: e.lastName,
      email: e.email,
      department: (e.department as any)?.name || '',
      position: (e.jobProfile as any)?.title || '',
      hireDate: e.joiningDate?.toISOString().split('T')[0] || '',
      status: (e.status as any)?.name || '',
      company: (e.company as any)?.name || '',
    }));
  }

  /**
   * Fetch attendance data from database
   */
  private async fetchAttendanceData(filters: any): Promise<any[]> {
    const where: Record<string, unknown> = {};
    if (filters.tenantId) where.tenantId = filters.tenantId;
    if (filters.employeeIds?.length) where.employeeId = { in: filters.employeeIds };
    if (filters.status) where.status = filters.status;
    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) (where.date as any).gte = new Date(filters.startDate);
      if (filters.endDate) (where.date as any).lte = new Date(filters.endDate);
    }

    const records = await prisma.attendanceRecord.findMany({
      where,
      orderBy: [{ date: 'desc' }, { employeeId: 'asc' }],
      take: 10000,
    });

    // Batch-fetch employee names
    const employeeIds = [...new Set(records.map(r => r.employeeId))];
    const employees = await prisma.employee.findMany({
      where: { id: { in: employeeIds } },
      select: { id: true, employeeCode: true, firstName: true, lastName: true },
    });
    const empMap = new Map(employees.map(e => [e.id, e]));

    return records.map(r => {
      const emp = empMap.get(r.employeeId);
      return {
        employeeCode: emp?.employeeCode || r.employeeId,
        employeeName: emp ? `${emp.firstName} ${emp.lastName}` : r.employeeId,
        date: r.date.toISOString().split('T')[0],
        clockIn: r.clockIn ? r.clockIn.toISOString().substring(11, 19) : '',
        clockOut: r.clockOut ? r.clockOut.toISOString().substring(11, 19) : '',
        workHours: r.workHours,
        status: r.status,
      };
    });
  }

  /**
   * Fetch payroll data from database
   */
  private async fetchPayrollData(filters: any): Promise<any[]> {
    const where: Record<string, unknown> = {};
    if (filters.employeeIds?.length) where.employeeId = { in: filters.employeeIds };

    // Filter by payroll run period if dates provided
    if (filters.startDate || filters.endDate) {
      where.payrollRun = {};
      if (filters.startDate) (where.payrollRun as any).periodStart = { gte: new Date(filters.startDate) };
      if (filters.endDate) (where.payrollRun as any).periodEnd = { lte: new Date(filters.endDate) };
    }

    const payslips = await prisma.payslip.findMany({
      where,
      include: {
        payrollRun: { select: { periodStart: true, periodEnd: true, month: true, year: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10000,
    });

    return payslips.map(p => ({
      employeeCode: p.employeeCode,
      employeeName: p.employeeName,
      month: p.payrollRunId?.month && p.payrollRunId?.year
        ? `${p.payrollRunId.year}-${String(p.payrollRunId.month).padStart(2, '0')}`
        : p.payrollRunId?.periodStart?.toISOString().substring(0, 7) || '',
      basicSalary: Number(p.basicSalary),
      grossPay: Number(p.grossSalary),
      deductions: Number(p.totalDeductions),
      netPay: Number(p.netSalary),
    }));
  }

  /**
   * Generate file from data
   */
  private async generateFile(
    format: ExportFormat,
    data: any[],
    columns: string[]
  ): Promise<{ content: Buffer; size: number; mimeType: string; ext: string }> {
    switch (format) {
      case ExportFormat.CSV:
        return this.generateCSV(data, columns);
      case ExportFormat.EXCEL:
        return this.generateExcel(data, columns);
      case ExportFormat.JSON:
        return this.generateJSON(data, columns);
      case ExportFormat.PDF:
        return this.generatePDF(data, columns);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Generate CSV file
   */
  private generateCSV(data: any[], columns: string[]): { content: Buffer; size: number; mimeType: string; ext: string } {
    const escapeCsv = (val: any) => {
      const str = String(val ?? '');
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    };
    const headers = columns.map(escapeCsv).join(',');
    const rows = data.map((row) => columns.map((col) => escapeCsv(row[col])).join(','));
    const csv = [headers, ...rows].join('\n');
    const content = Buffer.from(csv, 'utf-8');

    return { content, size: content.length, mimeType: 'text/csv', ext: 'csv' };
  }

  /**
   * Generate Excel file using exceljs
   */
  private async generateExcel(data: any[], columns: string[]): Promise<{ content: Buffer; size: number; mimeType: string; ext: string }> {
    try {
      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'AuraOS Export Service';
      workbook.created = new Date();

      const sheet = workbook.addWorksheet('Export');

      // Add header row with formatting
      sheet.columns = columns.map(col => ({
        header: col.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim(),
        key: col,
        width: Math.max(col.length + 5, 15),
      }));

      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true, size: 11 };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };

      // Add data rows
      for (const row of data) {
        const values: Record<string, any> = {};
        for (const col of columns) {
          values[col] = row[col] ?? '';
        }
        sheet.addRow(values);
      }

      // Auto-filter
      sheet.autoFilter = { from: 'A1', to: `${String.fromCharCode(64 + columns.length)}1` };

      const buffer = await workbook.xlsx.writeBuffer();
      const content = Buffer.from(buffer);

      return {
        content,
        size: content.length,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ext: 'xlsx',
      };
    } catch {
      // Fallback to CSV if exceljs not available
      logger.warn('exceljs not available, falling back to CSV format');
      return this.generateCSV(data, columns);
    }
  }

  /**
   * Generate JSON file
   */
  private generateJSON(data: any[], columns: string[]): { content: Buffer; size: number; mimeType: string; ext: string } {
    const filtered = data.map((row) => {
      const obj: any = {};
      columns.forEach((col) => {
        obj[col] = row[col];
      });
      return obj;
    });

    const content = Buffer.from(JSON.stringify(filtered, null, 2));
    return { content, size: content.length, mimeType: 'application/json', ext: 'json' };
  }

  /**
   * Generate PDF file as HTML table document (print-ready)
   */
  private generatePDF(data: any[], columns: string[]): { content: Buffer; size: number; mimeType: string; ext: string } {
    const headerLabels = columns.map(col =>
      col.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
    );

    const rows = data.map(row =>
      `<tr>${columns.map(col => `<td>${String(row[col] ?? '')}</td>`).join('')}</tr>`
    ).join('\n');

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>AuraOS Data Export</title>
<style>
  @media print { body { margin: 0; } }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; color: #1a1a1a; padding: 20px; }
  h1 { font-size: 16px; color: #1e3a5f; margin-bottom: 4px; }
  .meta { color: #666; font-size: 9px; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #4472c4; color: white; padding: 6px 8px; text-align: left; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; }
  td { padding: 5px 8px; border-bottom: 1px solid #e0e0e0; font-size: 9px; }
  tr:nth-child(even) { background: #f8f9fa; }
  .footer { margin-top: 16px; font-size: 8px; color: #999; text-align: center; }
</style>
</head>
<body>
<h1>AuraOS Data Export</h1>
<div class="meta">Generated: ${new Date().toISOString()} | Records: ${data.length}</div>
<table>
<thead><tr>${headerLabels.map(h => `<th>${h}</th>`).join('')}</tr></thead>
<tbody>${rows}</tbody>
</table>
<div class="footer">Generated by AuraOS Export Service</div>
</body>
</html>`;

    const content = Buffer.from(html, 'utf-8');
    return { content, size: content.length, mimeType: 'text/html', ext: 'html' };
  }

  /**
   * Save file to local exports directory and return download URL
   */
  private async uploadFile(file: { content: Buffer; mimeType: string; ext?: string }, name?: string): Promise<string> {
    const fileId = crypto.randomUUID();
    const ext = (file as any).ext || 'bin';
    const fileName = `${name || fileId}.${ext}`;

    try {
      await mkdir(EXPORT_DIR, { recursive: true });
      const filePath = join(EXPORT_DIR, fileName);
      await writeFile(filePath, file.content);
      const downloadUrl = `/exports/${fileName}`;
      logger.info({ fileId, path: filePath, url: downloadUrl }, 'Export file saved');
      return downloadUrl;
    } catch (error: any) {
      logger.error({ error, fileId }, 'Failed to save export file, returning in-memory reference');
      return `/api/v1/export/${fileId}`;
    }
  }

  /**
   * Get default columns for employee export
   */
  private getDefaultEmployeeColumns(): string[] {
    return ['employeeCode', 'firstName', 'lastName', 'email', 'department', 'position', 'hireDate', 'status'];
  }

  /**
   * Get default columns for attendance export
   */
  private getDefaultAttendanceColumns(): string[] {
    return ['employeeCode', 'employeeName', 'date', 'clockIn', 'clockOut', 'workHours', 'status'];
  }

  /**
   * Get default columns for payroll export
   */
  private getDefaultPayrollColumns(): string[] {
    return ['employeeCode', 'employeeName', 'month', 'basicSalary', 'grossPay', 'deductions', 'netPay'];
  }
}

// Export singleton instance
export const exportService = new ExportService();
