import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { countryOnboardingRuleService } from '@/lib/services/country-onboarding-rule.service';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(
  async (
    _request: NextRequest,
    context: { user: { tenantId: string }; permissions: string[]; params?: { id?: string } }
  ) => {
    if (
      !context.permissions.includes('onboarding:read') &&
      !context.permissions.includes('employee:update')
    ) {
      return NextResponse.json(
        { success: false, error: { code: 'E4030', message: 'Forbidden' } },
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
      const data = await countryOnboardingRuleService.getActivationGate(context.user.tenantId, id);
      return NextResponse.json({ success: true, data });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to evaluate country activation gate',
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
          },
        },
        { status: 500 }
      );
    }
  }
);
