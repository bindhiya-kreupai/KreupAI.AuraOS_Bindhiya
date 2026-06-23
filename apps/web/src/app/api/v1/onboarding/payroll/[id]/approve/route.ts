import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { payrollOnboardingService } from '@/lib/services/payroll-onboarding.service';

export const dynamic = 'force-dynamic';

export const POST = withEnhancedAuth(
  async (
    _request: NextRequest,
    context: {
      user: { id: string; tenantId: string };
      permissions: string[];
      params?: { id?: string };
    }
  ) => {
    if (
      !context.permissions.includes('onboarding:write') &&
      !context.permissions.includes('employee:update') &&
      !context.permissions.includes('payroll:update')
    ) {
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
      const id = context.params?.id;
      if (!id) {
        return NextResponse.json(
          { success: false, error: { code: 'E2001', message: 'id is required' } },
          { status: 400 }
        );
      }

      const data = await payrollOnboardingService.approve(
        context.user.tenantId,
        id,
        context.user.id
      );
      return NextResponse.json({ success: true, data, message: 'Payroll profile approved' });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to approve payroll profile',
            messageAr: 'فشل اعتماد ملف الرواتب',
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
          },
        },
        { status: 500 }
      );
    }
  }
);
