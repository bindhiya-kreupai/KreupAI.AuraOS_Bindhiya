import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { complianceTrainingService } from '@/lib/services/compliance-training.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/learning/compliance-training/assign
 * Body: { courseId, employeeIds: string[], dueDate?: ISO }
 * Bulk-assigns a mandatory compliance course. Idempotent for already-enrolled
 * employees.
 */
export const POST = withAudit(
  withEnhancedAuth(
    async (
      request: NextRequest,
      context: { user: { id: string; tenantId: string }; permissions: string[] }
    ) => {
      try {
        if (!context.permissions.includes('learning/compliance-training:assign')) {
          return NextResponse.json(
            {
              success: false,
              error: { code: 'E4030', message: 'missing learning/compliance-training:assign' },
            },
            { status: 403 }
          );
        }
        const body = await request.json();
        if (!body?.courseId || !Array.isArray(body.employeeIds) || body.employeeIds.length === 0) {
          return NextResponse.json(
            {
              success: false,
              error: { code: 'E2001', message: 'courseId, employeeIds[] required' },
            },
            { status: 400 }
          );
        }
        const result = await complianceTrainingService.assignMandatoryCourse({
          tenantId: context.user.tenantId,
          courseId: body.courseId,
          employeeIds: body.employeeIds,
          dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
          assignedBy: context.user.id,
        });
        return NextResponse.json(
          { success: true, data: result, message: 'Assigned' },
          { status: 201 }
        );
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E5001',
              message: 'Bulk assignment failed',
              details: { error: error instanceof Error ? error.message : 'Unknown error' },
            },
          },
          { status: 500 }
        );
      }
    }
  ),
  {
    action: AuditAction.SETTINGS_UPDATED,
    resourceType: 'compliance_training_assignment',
    captureRequestBody: true,
  }
);
