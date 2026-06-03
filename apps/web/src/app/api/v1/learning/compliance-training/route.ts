import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import {
  complianceTrainingService,
  type ComplianceCategory,
  type EnrollmentStatus,
} from '@/lib/services/compliance-training.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/learning/compliance-training
 * Compliance training assignments. Modes:
 * - default: assignments for the caller's tenant (filterable by employee, status, category)
 * - `?mode=courses`: list the mandatory courses (catalog)
 */
export const GET = withEnhancedAuth(
  async (
    request: NextRequest,
    context: { user: { id: string; tenantId: string; employeeId?: string }; permissions: string[] }
  ) => {
    try {
      const { user, permissions } = context;
      if (!permissions.includes('learning/compliance-training:read')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing learning/compliance-training:read',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }
      const { searchParams } = new URL(request.url);
      const mode = searchParams.get('mode') ?? 'assignments';

      if (mode === 'courses') {
        const courses = await complianceTrainingService.listMandatoryCourses({
          tenantId: user.tenantId,
          complianceCategory:
            (searchParams.get('complianceCategory') as ComplianceCategory) ?? undefined,
        });
        return NextResponse.json({ success: true, mode: 'courses', data: courses });
      }

      const dueBefore = searchParams.get('dueBefore');
      const employeeId = searchParams.get('employeeId') ?? user.employeeId;
      const result = await complianceTrainingService.listAssignments({
        tenantId: user.tenantId,
        employeeId,
        status: (searchParams.get('status') as EnrollmentStatus | 'PENDING') ?? undefined,
        complianceCategory:
          (searchParams.get('complianceCategory') as ComplianceCategory) ?? undefined,
        dueBefore: dueBefore ? new Date(dueBefore) : undefined,
        page: Number(searchParams.get('page')) || 1,
        limit: Number(searchParams.get('limit')) || 50,
      });

      return NextResponse.json({
        success: true,
        mode: 'assignments',
        ...result,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to fetch compliance training data',
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
          },
        },
        { status: 500 }
      );
    }
  }
);
