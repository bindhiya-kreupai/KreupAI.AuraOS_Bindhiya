import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/attendance/[id]/regularize
 * Submit a regularization request for an attendance record
 */
export const POST = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, permissions } = context;
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
      const { id } = context.params;
      const body = await request.json();

      const record = await prisma.attendanceRecord.findFirst({
        where: { id, tenantId: user.tenantId },
      });

      if (!record) {
        return NextResponse.json(
          { success: false, error: { code: 'E4001', message: 'Attendance record not found' } },
          { status: 404 }
        );
      }

      if (!body.regularizationType || !body.reason) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'E2001', message: 'regularizationType and reason are required' },
          },
          { status: 400 }
        );
      }

      // Create regularization request
      const regularization = await prisma.attendanceRegularization.create({
        data: {
          tenantId: user.tenantId,
          employeeId: record.employeeId,
          date: record.date,
          regularizationType: body.regularizationType,
          requestedClockIn: body.requestedClockIn ? new Date(body.requestedClockIn) : null,
          requestedClockOut: body.requestedClockOut ? new Date(body.requestedClockOut) : null,
          reason: body.reason,
          attachments: body.attachments || [],
          status: 'PENDING',
        },
      });

      // Mark the attendance record as pending regularization
      await prisma.attendanceRecord.update({
        where: { id },
        data: { regularizationId: regularization.id },
      });

      return NextResponse.json(
        {
          success: true,
          data: regularization,
          message: 'Regularization request submitted successfully',
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 201 }
      );
    } catch (_error) {
      console.error('[Attendance Regularize API] POST Error:', _error);
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E5001', message: 'Failed to submit regularization request' },
        },
        { status: 500 }
      );
    }
  }),
  {
    action: AuditAction.ATTENDANCE_REGULARIZED,
    resourceType: 'attendance_regularization',
    captureRequestBody: true,
    extractResourceId: (req, ctx) => ctx?.params?.id,
  }
);
