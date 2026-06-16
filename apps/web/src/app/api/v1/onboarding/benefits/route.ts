import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { benefitsOnboardingService } from '@/lib/services/benefits-onboarding.service';

export const dynamic = 'force-dynamic';

function hasPermission(permissions: string[], action: 'read' | 'write') {
  const required = action === 'read' ? 'onboarding:read' : 'onboarding:write';
  return (
    permissions.includes(required) ||
    permissions.includes('employee:update') ||
    permissions.includes('benefits/enrollments:read') ||
    (action === 'write' && permissions.includes('benefits/enrollments:create'))
  );
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
      const cardStatus = url.searchParams.get('cardStatus') ?? undefined;
      const action = url.searchParams.get('action');

      if (action === 'evaluate') {
        if (!employeeId) {
          return NextResponse.json(
            { success: false, error: { code: 'E2001', message: 'employeeId is required' } },
            { status: 400 }
          );
        }
        const data = await benefitsOnboardingService.evaluate(context.user.tenantId, employeeId);
        return NextResponse.json({ success: true, data });
      }

      if (action === 'completion-gate') {
        if (!employeeId) {
          return NextResponse.json(
            { success: false, error: { code: 'E2001', message: 'employeeId is required' } },
            { status: 400 }
          );
        }
        const data = await benefitsOnboardingService.getCompletionGate(
          context.user.tenantId,
          employeeId
        );
        return NextResponse.json({ success: true, data });
      }

      const data = await benefitsOnboardingService.list(context.user.tenantId, {
        employeeId,
        cardStatus,
      });
      return NextResponse.json({ success: true, data });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to load medical benefits onboarding data',
            messageAr: 'فشل تحميل بيانات التأمين الطبي',
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

      const data = await benefitsOnboardingService.createOrUpdate(
        {
          employeeId: body.employeeId,
          planId: body.planId,
          onboardingInstanceId: body.onboardingInstanceId,
          dependentIds: Array.isArray(body.dependentIds) ? body.dependentIds : undefined,
          effectiveFrom: body.effectiveFrom ? new Date(body.effectiveFrom) : undefined,
          notes: body.notes,
        },
        { tenantId: context.user.tenantId, userId: context.user.id }
      );

      return NextResponse.json(
        { success: true, data, message: 'Medical benefits enrollment prepared' },
        { status: 201 }
      );
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to prepare medical benefits enrollment',
            messageAr: 'فشل تجهيز تسجيل التأمين الطبي',
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
          },
        },
        { status: 500 }
      );
    }
  }
);
