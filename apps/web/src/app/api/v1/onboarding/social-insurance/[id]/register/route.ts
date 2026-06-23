import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { socialInsuranceOnboardingService } from '@/lib/services/social-insurance-onboarding.service';

export const dynamic = 'force-dynamic';

export const POST = withEnhancedAuth(
  async (
    request: NextRequest,
    context: {
      user: { id: string; tenantId: string };
      permissions: string[];
      params?: { id?: string };
    }
  ) => {
    if (
      !context.permissions.includes('onboarding:write') &&
      !context.permissions.includes('employee:update')
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

      const body = await request.json();
      if (!body.registrationReference) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'E2001', message: 'registrationReference is required' },
          },
          { status: 400 }
        );
      }

      const data = await socialInsuranceOnboardingService.markRegistered(
        context.user.tenantId,
        id,
        {
          registrationReference: body.registrationReference,
          registeredAt: body.registeredAt ? new Date(body.registeredAt) : undefined,
          notes: body.notes,
        },
        context.user.id
      );

      return NextResponse.json({ success: true, data, message: 'Registration marked complete' });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to mark social insurance registration complete',
            messageAr: 'فشل إكمال تسجيل التأمينات الاجتماعية',
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
          },
        },
        { status: 500 }
      );
    }
  }
);
