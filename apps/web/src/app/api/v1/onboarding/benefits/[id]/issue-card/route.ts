import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { benefitsOnboardingService } from '@/lib/services/benefits-onboarding.service';

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
      !context.permissions.includes('employee:update') &&
      !context.permissions.includes('benefits/enrollments:create')
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
      if (!body.vendorReference) {
        return NextResponse.json(
          { success: false, error: { code: 'E2001', message: 'vendorReference is required' } },
          { status: 400 }
        );
      }

      const data = await benefitsOnboardingService.markCardIssued(
        context.user.tenantId,
        id,
        {
          vendorReference: body.vendorReference,
          insuranceCardStatus: body.insuranceCardStatus,
          insuranceCardIssuedAt: body.insuranceCardIssuedAt
            ? new Date(body.insuranceCardIssuedAt)
            : undefined,
          notes: body.notes,
        },
        context.user.id
      );

      return NextResponse.json({ success: true, data, message: 'Insurance card status updated' });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to update insurance card status',
            messageAr: 'فشل تحديث حالة بطاقة التأمين',
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
          },
        },
        { status: 500 }
      );
    }
  }
);
