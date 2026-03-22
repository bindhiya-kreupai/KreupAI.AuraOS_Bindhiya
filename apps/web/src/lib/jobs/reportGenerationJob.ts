import { prisma } from '@aura/database';
import { exportService, ExportFormat, ExportEntity } from '../export/export.service';

export interface JobResult {
  success: boolean;
  processedCount: number;
  errors: string[];
}

interface ReportConfig {
  reportId: string;
  format: 'pdf' | 'excel' | 'csv';
  title: string;
  generatedAt: string;
  fileSize: number;
  downloadUrl: string;
}

const REPORT_TYPE_TO_ENTITY: Record<string, ExportEntity> = {
  payroll_summary: ExportEntity.PAYROLL,
  attendance_overview: ExportEntity.ATTENDANCE,
  headcount: ExportEntity.EMPLOYEES,
  employee_directory: ExportEntity.EMPLOYEES,
  tax_liability: ExportEntity.PAYROLL,
  leave_summary: ExportEntity.LEAVE,
};

const FORMAT_MAP: Record<string, ExportFormat> = {
  pdf: ExportFormat.PDF,
  excel: ExportFormat.EXCEL,
  csv: ExportFormat.CSV,
};

export async function generateReport(
  reportId: string,
  format: 'pdf' | 'excel' | 'csv'
): Promise<JobResult> {
  const errors: string[] = [];
  let processedCount = 0;

  console.log(`[ReportJob] Starting report generation: ${reportId} (format: ${format})`);

  try {
    // Step 1: Fetch report definition from database
    console.log('[ReportJob] Fetching report configuration...');
    const reportDef = await prisma.reportDefinition.findUnique({ where: { id: reportId } });

    const reportType = (reportDef as any)?.type || (reportDef as any)?.category || 'headcount';
    const reportTitle = (reportDef as any)?.name || `${reportType} Report`;
    console.log(`[ReportJob] Report type: ${reportType}`);

    // Step 2: Determine entity and run export
    const entity = REPORT_TYPE_TO_ENTITY[reportType] || ExportEntity.EMPLOYEES;
    const exportFormat = FORMAT_MAP[format] || ExportFormat.CSV;

    const request = {
      entity,
      format: exportFormat,
      filters: {
        companyId: (reportDef as any)?.tenantId || 'default',
        tenantId: (reportDef as any)?.tenantId || 'default',
      },
      userId: (reportDef as any)?.createdBy || 'system',
      userEmail: 'system@auraos.com',
    };

    console.log('[ReportJob] Querying data sources...');

    let result;
    switch (entity) {
      case ExportEntity.EMPLOYEES:
        result = await exportService.exportEmployees(request);
        break;
      case ExportEntity.ATTENDANCE:
        result = await exportService.exportAttendance(request);
        break;
      case ExportEntity.PAYROLL:
        result = await exportService.exportPayroll(request);
        break;
      default:
        result = await exportService.exportEmployees(request);
    }

    processedCount = result.recordCount;
    console.log(`[ReportJob] Retrieved ${processedCount} records`);

    // Step 3: Update report execution record if exists
    if (reportDef) {
      try {
        await prisma.reportExecution.create({
          data: {
            reportId,
            status: 'COMPLETED',
            executionTime: 0,
            exportUrl: result.fileUrl,
          },
        });
      } catch {
        // Report execution tracking is optional
      }
    }

    const config: ReportConfig = {
      reportId,
      format,
      title: reportTitle,
      generatedAt: new Date().toISOString(),
      fileSize: result.fileSize,
      downloadUrl: result.fileUrl,
    };

    console.log(`[ReportJob] Report generation complete: ${JSON.stringify(config)}`);
    return { success: true, processedCount, errors };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[ReportJob] Error: ${msg}`);
    errors.push(msg);
    return { success: false, processedCount, errors };
  }
}
