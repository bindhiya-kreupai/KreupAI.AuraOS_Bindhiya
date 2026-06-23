import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { socialInsuranceOnboardingService } from '@/lib/services/social-insurance-onboarding.service';

export const dynamic = 'force-dynamic';

function hasPermission(permissions: string[], action: 'read' | 'write') {
  const required = action === 'read' ? 'onboarding:read' : 'onboarding:write';
  return permissions.includes(required) || permissions.includes('employee:update');
}

export const GET = withEnhancedAuth(
  async (request: NextRequest, context: { user: { tenantId: string }; permissions: string[] }) => {
    if (!hasPermission(context.permissions, 'read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing onboarding:read permission',
            messageAr: 'ممنوع: صلاحية قراءة تهيئة الموظفين غير متوفرة',
          },
        },
        { status: 403 }
      );
    }

    try {
      const url = new URL(request.url);
      const employeeId = url.searchParams.get('employeeId') ?? undefined;
      const status = url.searchParams.get('status') ?? undefined;
      const action = url.searchParams.get('action');

      if (action === 'evaluate') {
        if (!employeeId) {
          return NextResponse.json(
            {
              success: false,
              error: { code: 'E2001', message: 'employeeId is required for evaluation' },
            },
            { status: 400 }
          );
        }
        const data = await socialInsuranceOnboardingService.evaluate(
          context.user.tenantId,
          employeeId
        );
        return NextResponse.json({ success: true, data });
      }

      if (action === 'completion-gate') {
        if (!employeeId) {
          return NextResponse.json(
            {
              success: false,
              error: { code: 'E2001', message: 'employeeId is required for completion gate' },
            },
            { status: 400 }
          );
        }
        const data = await socialInsuranceOnboardingService.getCompletionGate(
          context.user.tenantId,
          employeeId
        );
        return NextResponse.json({ success: true, data });
      }

      const data = await socialInsuranceOnboardingService.list(context.user.tenantId, {
        employeeId,
        status,
      });
      return NextResponse.json({ success: true, data });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to load social insurance onboarding data',
            messageAr: 'فشل تحميل بيانات تسجيل التأمينات الاجتماعية',
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
          },
        },
        { status: 500 }
      );
    }
  }
);

export const POST = withEnhancedAuth(
  async (
    request: NextRequest,
    context: { user: { id: string; tenantId: string }; permissions: string[] }
  ) => {
    if (!hasPermission(context.permissions, 'write')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing onboarding:write permission',
            messageAr: 'ممنوع: صلاحية تعديل تهيئة الموظفين غير متوفرة',
          },
        },
        { status: 403 }
      );
    }

    try {
      const body = await request.json();
      if (!body.employeeId) {
        return NextResponse.json(
          { success: false, error: { code: 'E2001', message: 'employeeId is required' } },
          { status: 400 }
        );
      }

      const data = await socialInsuranceOnboardingService.createOrUpdate(
        {
          employeeId: body.employeeId,
          onboardingInstanceId: body.onboardingInstanceId,
          contributionWage:
            body.contributionWage == null ? undefined : Number(body.contributionWage),
          registrationReference: body.registrationReference,
          status: body.status,
          notes: body.notes,
        },
        { tenantId: context.user.tenantId, userId: context.user.id }
      );

      return NextResponse.json(
        { success: true, data, message: 'Social insurance registration prepared' },
        { status: 201 }
      );
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to prepare social insurance registration',
            messageAr: 'فشل تجهيز تسجيل التأمينات الاجتماعية',
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
          },
        },
        { status: 500 }
      );
    }
  }
);
