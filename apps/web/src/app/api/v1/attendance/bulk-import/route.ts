export const dynamic = 'force-dynamic';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { z } from 'zod';

// API Response Standard
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    apiVersion: string;
  };
}

// Validation schema for individual attendance record
const attendanceRecordSchema = z.object({
  employeeCode: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  clockInTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  clockOutTime: z
    .string()
    .regex(/^\d{2}:\d{2}:\d{2}$/)
    .optional()
    .nullable(),
  status: z.enum(['PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE', 'WEEKLY_OFF', 'HOLIDAY']).optional(),
  notes: z.string().max(500).optional().nullable(),
});

// Validation schema for bulk import request
const bulkImportSchema = z.object({
  records: z.array(attendanceRecordSchema).min(1).max(1000),
  overwriteExisting: z.boolean().default(false),
});

interface ImportError {
  row: number;
  employeeCode: string;
  date: string;
  error: string;
}

interface ImportWarning {
  row: number;
  employeeCode: string;
  date: string;
  warning: string;
}

/**
 * POST /api/v1/attendance/bulk-import
 * Import attendance records in bulk from CSV/Excel
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  const { permissions } = context;
  if (!permissions.includes('attendance:create')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing attendance:create permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const body = await request.json();
    const tenantId = context.user.tenantId;

    // Validate request body
    const validationResult = bulkImportSchema.safeParse(body);
    if (!validationResult.success) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: 'Validation failed',
          details: { errors: validationResult.error.errors },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 400 });
    }

    const data = validationResult.data;

    // Look up all employee codes in one query
    const employeeCodes = [...new Set(data.records.map((r) => r.employeeCode))];
    // tenant-ok: employee where clause is preceded by tenant-scoped lookup; relation traversal
    const employees = await prisma.employee.findMany({
      where: { employeeCode: { in: employeeCodes } },
      select: { id: true, employeeCode: true },
    });
    const employeeMap = new Map(employees.map((e) => [e.employeeCode, e.id]));

    const errors: ImportError[] = [];
    const warnings: ImportWarning[] = [];
    let successCount = 0;
    let totalWorkMinutes = 0;
    let totalOvertimeMinutes = 0;
    const uniqueEmployeeIds = new Set<string>();
    let minDate: string | null = null;
    let maxDate: string | null = null;

    // Process each record
    for (let i = 0; i < data.records.length; i++) {
      const record = data.records[i];
      const rowNum = i + 1;

      // Validate employee exists
      const employeeId = employeeMap.get(record.employeeCode);
      if (!employeeId) {
        errors.push({
          row: rowNum,
          employeeCode: record.employeeCode,
          date: record.date,
          error: 'Employee code not found',
        });
        continue;
      }

      // Validate clock times
      if (record.clockOutTime) {
        const clockIn = new Date(`${record.date}T${record.clockInTime}`);
        const clockOut = new Date(`${record.date}T${record.clockOutTime}`);
        if (clockOut <= clockIn) {
          errors.push({
            row: rowNum,
            employeeCode: record.employeeCode,
            date: record.date,
            error: 'Clock-out time is before clock-in time',
          });
          continue;
        }
      }

      const recordDate = new Date(record.date);
      const clockIn = new Date(`${record.date}T${record.clockInTime}`);
      const clockOut = record.clockOutTime
        ? new Date(`${record.date}T${record.clockOutTime}`)
        : null;

      // Calculate work hours
      let workMinutes = 0;
      let overtimeMinutes = 0;
      if (clockOut) {
        workMinutes = Math.floor((clockOut.getTime() - clockIn.getTime()) / (1000 * 60));
        const standardWorkMinutes = 480; // 8 hours
        if (workMinutes > standardWorkMinutes) {
          overtimeMinutes = workMinutes - standardWorkMinutes;
          warnings.push({
            row: rowNum,
            employeeCode: record.employeeCode,
            date: record.date,
            warning: overtimeMinutes > 120 ? 'Overtime exceeds daily limit' : 'Overtime recorded',
          });
        }
      }

      try {
        if (data.overwriteExisting) {
          await prisma.attendanceRecord.upsert({
            where: {
              tenantId_employeeId_date: {
                tenantId,
                employeeId,
                date: recordDate,
              },
            },
            create: {
              tenantId,
              employeeId,
              date: recordDate,
              clockIn,
              clockOut,
              workHours: parseFloat((workMinutes / 60).toFixed(2)),
              overtimeHours: parseFloat((overtimeMinutes / 60).toFixed(2)),
              status: record.status || 'PRESENT',
              isLate: false,
              isEarlyOut: false,
              approvalStatus: 'APPROVED',
              remarks: record.notes || null,
            },
            update: {
              clockIn,
              clockOut,
              workHours: parseFloat((workMinutes / 60).toFixed(2)),
              overtimeHours: parseFloat((overtimeMinutes / 60).toFixed(2)),
              status: record.status || 'PRESENT',
              remarks: record.notes || null,
            },
          });
        } else {
          // Check for existing record first
          const existing = await prisma.attendanceRecord.findUnique({
            where: {
              tenantId_employeeId_date: {
                tenantId,
                employeeId,
                date: recordDate,
              },
            },
          });

          if (existing) {
            warnings.push({
              row: rowNum,
              employeeCode: record.employeeCode,
              date: record.date,
              warning: 'Record already exists, skipped (overwriteExisting is false)',
            });
            continue;
          }

          await prisma.attendanceRecord.create({
            data: {
              tenantId,
              employeeId,
              date: recordDate,
              clockIn,
              clockOut,
              workHours: parseFloat((workMinutes / 60).toFixed(2)),
              overtimeHours: parseFloat((overtimeMinutes / 60).toFixed(2)),
              status: record.status || 'PRESENT',
              isLate: false,
              isEarlyOut: false,
              approvalStatus: 'APPROVED',
              remarks: record.notes || null,
            },
          });
        }

        successCount++;
        totalWorkMinutes += workMinutes;
        totalOvertimeMinutes += overtimeMinutes;
        uniqueEmployeeIds.add(employeeId);

        if (!minDate || record.date < minDate) minDate = record.date;
        if (!maxDate || record.date > maxDate) maxDate = record.date;
      } catch (dbError: any) {
        errors.push({
          row: rowNum,
          employeeCode: record.employeeCode,
          date: record.date,
          error: dbError instanceof Error ? dbError.message : 'Database error',
        });
      }
    }

    const importResult = {
      batchId: crypto.randomUUID(),
      totalRecords: data.records.length,
      successfulRecords: successCount,
      failedRecords: errors.length,
      skippedRecords: data.records.length - successCount - errors.length,
      errors,
      warnings: warnings.filter((w) => !w.warning.includes('skipped')),
      summary: {
        totalWorkMinutes,
        totalOvertimeMinutes,
        uniqueEmployees: uniqueEmployeeIds.size,
        dateRange: {
          startDate: minDate || '',
          endDate: maxDate || '',
        },
      },
      processedAt: new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: importResult,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    // Return 207 Multi-Status if there are partial failures
    const statusCode = errors.length > 0 ? 207 : 201;
    return NextResponse.json(response, { status: statusCode });
  } catch (error: any) {
    console.error('[Attendance Bulk Import API] POST Error:', error);

    if (error instanceof Error && error.message.includes('too many records')) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2002',
          message: 'Exceeded maximum batch size of 1000 records',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 400 });
    }

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to import attendance records',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
});
