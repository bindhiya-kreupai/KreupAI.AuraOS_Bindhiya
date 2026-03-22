/**
 * Report Generation Job
 * Handles async report generation for large datasets
 */

import { Job, JobResult, queueService } from '../queue.service';
import { QUEUE_NAMES } from '../rabbitmq';
import { logger } from '@/lib/logger';
import { prisma } from '@aura/database';

export enum ReportType {
  ATTENDANCE_SUMMARY = 'ATTENDANCE_SUMMARY',
  PAYROLL_SUMMARY = 'PAYROLL_SUMMARY',
  LEAVE_SUMMARY = 'LEAVE_SUMMARY',
  EMPLOYEE_DIRECTORY = 'EMPLOYEE_DIRECTORY',
  STATUTORY_REPORTS = 'STATUTORY_REPORTS',
  CUSTOM_REPORT = 'CUSTOM_REPORT',
}

export enum ReportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  CSV = 'CSV',
  JSON = 'JSON',
}

export interface ReportJobData {
  reportType: ReportType;
  format: ReportFormat;
  filters: {
    companyId: string;
    departmentId?: string;
    startDate?: string;
    endDate?: string;
    employeeIds?: string[];
    [key: string]: any;
  };
  userId: string;
  userEmail?: string;
}

export interface ReportJobResult {
  reportId: string;
  reportType: ReportType;
  format: ReportFormat;
  fileUrl: string;
  fileSize: number;
  recordCount: number;
  generatedAt: string;
}

/**
 * Report generation job handler
 */
export async function processReportJob(job: Job<ReportJobData>): Promise<JobResult> {
  const startTime = performance.now();
  const { reportType, format, filters, userId, userEmail } = job.data;

  try {
    logger.info(
      { jobId: job.id, reportType, format, filters },
      'Starting report generation'
    );

    // Step 1: Fetch data based on report type
    const data = await fetchReportData(reportType, filters);
    logger.info({ jobId: job.id, recordCount: data.length }, 'Report data fetched');

    // Step 2: Generate report file
    const reportFile = await generateReportFile(reportType, format, data);
    logger.info({ jobId: job.id, fileSize: reportFile.size }, 'Report file generated');

    // Step 3: Upload to storage
    const fileUrl = await uploadReportFile(reportFile);
    logger.info({ jobId: job.id, fileUrl }, 'Report file uploaded');

    // Step 4: Send notification email with download link
    if (userEmail) {
      await queueService.enqueue(QUEUE_NAMES.EMAIL_NOTIFICATIONS, 'REPORT_READY', {
        userId,
        userEmail,
        reportType,
        fileUrl,
        recordCount: data.length,
      });
    }

    const duration = Math.round(performance.now() - startTime);

    logger.info(
      {
        jobId: job.id,
        reportType,
        recordCount: data.length,
        fileSize: reportFile.size,
        duration,
      },
      'Report generation completed'
    );

    const result: ReportJobResult = {
      reportId: reportFile.id,
      reportType,
      format,
      fileUrl,
      fileSize: reportFile.size,
      recordCount: data.length,
      generatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: result,
      duration,
    };
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);

    logger.error(
      { error, jobId: job.id, reportType, duration },
      'Report generation failed'
    );

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration,
    };
  }
}

/**
 * Fetch report data based on type
 */
async function fetchReportData(reportType: ReportType, filters: any): Promise<any[]> {
  switch (reportType) {
    case ReportType.ATTENDANCE_SUMMARY:
      return await fetchAttendanceData(filters);

    case ReportType.PAYROLL_SUMMARY:
      return await fetchPayrollData(filters);

    case ReportType.LEAVE_SUMMARY:
      return await fetchLeaveData(filters);

    case ReportType.EMPLOYEE_DIRECTORY:
      return await fetchEmployeeDirectory(filters);

    case ReportType.STATUTORY_REPORTS:
      return await fetchStatutoryData(filters);

    default:
      throw new Error(`Unsupported report type: ${reportType}`);
  }
}

/**
 * Fetch attendance data from database
 */
async function fetchAttendanceData(filters: any): Promise<any[]> {
  const where: any = {};
  if (filters.companyId) where.companyId = filters.companyId;
  if (filters.startDate || filters.endDate) {
    where.date = {};
    if (filters.startDate) where.date.gte = new Date(filters.startDate);
    if (filters.endDate) where.date.lte = new Date(filters.endDate);
  }
  if (filters.employeeIds?.length) where.employeeId = { in: filters.employeeIds };

  const records = await prisma.attendance.findMany({
    where,
    include: { employee: { select: { employeeCode: true, firstName: true, lastName: true } } },
    orderBy: { date: 'asc' },
  });

  return records.map((r: any) => ({
    employeeCode: r.employee?.employeeCode ?? r.employeeId,
    employeeName: r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : r.employeeId,
    date: r.date?.toISOString?.() ?? r.date,
    clockIn: r.clockIn,
    clockOut: r.clockOut,
    workHours: r.workHours ?? null,
    status: r.status,
  }));
}

/**
 * Fetch payroll data from database
 */
async function fetchPayrollData(filters: any): Promise<any[]> {
  const where: any = {};
  if (filters.companyId) where.companyId = filters.companyId;
  if (filters.startDate) where.periodStart = { gte: new Date(filters.startDate) };
  if (filters.endDate) where.periodEnd = { lte: new Date(filters.endDate) };
  if (filters.employeeIds?.length) where.employeeId = { in: filters.employeeIds };

  const records = await prisma.payrollItem.findMany({
    where,
    include: { employee: { select: { employeeCode: true, firstName: true, lastName: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return records.map((r: any) => ({
    employeeCode: r.employee?.employeeCode ?? r.employeeId,
    employeeName: r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : r.employeeId,
    basicSalary: Number(r.basicSalary ?? 0),
    grossPay: Number(r.grossPay ?? 0),
    deductions: Number(r.totalDeductions ?? 0),
    netPay: Number(r.netPay ?? 0),
  }));
}

/**
 * Fetch leave data from database
 */
async function fetchLeaveData(filters: any): Promise<any[]> {
  const where: any = {};
  if (filters.companyId) where.tenantId = filters.companyId;
  if (filters.startDate) where.startDate = { gte: new Date(filters.startDate) };
  if (filters.endDate) where.endDate = { lte: new Date(filters.endDate) };
  if (filters.employeeIds?.length) where.employeeId = { in: filters.employeeIds };

  const records = await prisma.leaveRequest.findMany({
    where,
    include: { employee: { select: { employeeCode: true, firstName: true, lastName: true } } },
    orderBy: { appliedAt: 'desc' },
  });

  return records.map((r: any) => ({
    employeeCode: r.employee?.employeeCode ?? r.employeeId,
    employeeName: r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : r.employeeId,
    leaveType: r.leaveTypeId,
    startDate: r.startDate?.toISOString?.() ?? r.startDate,
    endDate: r.endDate?.toISOString?.() ?? r.endDate,
    days: Number(r.totalDays),
    status: r.status,
  }));
}

/**
 * Fetch employee directory from database
 */
async function fetchEmployeeDirectory(filters: any): Promise<any[]> {
  const where: any = {};
  if (filters.companyId) where.companyId = filters.companyId;
  if (filters.employeeIds?.length) where.id = { in: filters.employeeIds };

  const records = await prisma.employee.findMany({
    where,
    orderBy: { firstName: 'asc' },
  });

  return records.map((r: any) => ({
    employeeCode: r.employeeCode,
    firstName: r.firstName,
    lastName: r.lastName,
    email: r.workEmail ?? r.personalEmail,
    department: r.departmentId,
    position: r.designationId,
    hireDate: r.dateOfJoining?.toISOString?.() ?? r.dateOfJoining,
    status: r.employmentStatus,
  }));
}

/**
 * Fetch statutory data from database
 */
async function fetchStatutoryData(filters: any): Promise<any[]> {
  const where: any = {};
  if (filters.companyId) where.companyId = filters.companyId;
  if (filters.employeeIds?.length) where.employeeId = { in: filters.employeeIds };

  const records = await prisma.statutoryComponent.findMany({
    where,
    include: { employee: { select: { employeeCode: true, firstName: true, lastName: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return records.map((r: any) => ({
    employeeCode: r.employee?.employeeCode ?? r.employeeId,
    employeeName: r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : r.employeeId,
    componentType: r.componentType,
    registrationNumber: r.registrationNumber,
    employeeContribution: Number(r.employeeContribution ?? 0),
    employerContribution: Number(r.employerContribution ?? 0),
  }));
}

/**
 * Generate report file
 */
async function generateReportFile(
  reportType: ReportType,
  format: ReportFormat,
  data: any[]
): Promise<{ id: string; content: Buffer; size: number; mimeType: string }> {
  const id = crypto.randomUUID();

  switch (format) {
    case ReportFormat.CSV:
      return generateCSV(id, data);

    case ReportFormat.EXCEL:
      return generateExcel(id, data);

    case ReportFormat.PDF:
      return generatePDF(id, data);

    case ReportFormat.JSON:
      return generateJSON(id, data);

    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

/**
 * Generate CSV file
 */
function generateCSV(
  id: string,
  data: any[]
): { id: string; content: Buffer; size: number; mimeType: string } {
  if (data.length === 0) {
    const content = Buffer.from('No data available');
    return {
      id,
      content,
      size: content.length,
      mimeType: 'text/csv',
    };
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map((row) => headers.map((header) => row[header] || '').join(',')),
  ].join('\n');

  const content = Buffer.from(csv);

  return {
    id,
    content,
    size: content.length,
    mimeType: 'text/csv',
  };
}

/**
 * Generate Excel file (mock)
 */
function generateExcel(
  id: string,
  data: any[]
): { id: string; content: Buffer; size: number; mimeType: string } {
  // TODO: Implement actual Excel generation using libraries like 'exceljs'
  const content = Buffer.from(JSON.stringify(data, null, 2));

  return {
    id,
    content,
    size: content.length,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
}

/**
 * Generate PDF file (mock)
 */
function generatePDF(
  id: string,
  data: any[]
): { id: string; content: Buffer; size: number; mimeType: string } {
  // TODO: Implement actual PDF generation using libraries like 'pdfkit' or 'puppeteer'
  const content = Buffer.from(JSON.stringify(data, null, 2));

  return {
    id,
    content,
    size: content.length,
    mimeType: 'application/pdf',
  };
}

/**
 * Generate JSON file
 */
function generateJSON(
  id: string,
  data: any[]
): { id: string; content: Buffer; size: number; mimeType: string } {
  const content = Buffer.from(JSON.stringify(data, null, 2));

  return {
    id,
    content,
    size: content.length,
    mimeType: 'application/json',
  };
}

/**
 * Upload report file to storage
 */
async function uploadReportFile(file: {
  id: string;
  content: Buffer;
  mimeType: string;
}): Promise<string> {
  // TODO: Implement actual file upload to S3/Azure Blob/GCS
  // const uploadResult = await s3.upload({
  //   Bucket: 'auraos-reports',
  //   Key: `reports/${file.id}`,
  //   Body: file.content,
  //   ContentType: file.mimeType,
  // }).promise();

  // Mock URL
  const mockUrl = `https://storage.auraos.com/reports/${file.id}`;

  logger.info({ fileId: file.id, url: mockUrl }, 'File uploaded to storage');

  return mockUrl;
}

// Register the job handler
queueService.registerHandler('REPORT_GENERATION', processReportJob);
