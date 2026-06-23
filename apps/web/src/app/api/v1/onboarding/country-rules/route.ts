import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { countryOnboardingRuleService } from '@/lib/services/country-onboarding-rule.service';

export const dynamic = 'force-dynamic';

function canRead(permissions: string[]) {
  return permissions.includes('onboarding:read') || permissions.includes('employee:update');
}

function canWrite(permissions: string[]) {
  return permissions.includes('onboarding:write') || permissions.includes('employee:update');
}

export const GET = withEnhancedAuth(
  async (request: NextRequest, context: { user: { tenantId: string }; permissions: string[] }) => {
    if (!canRead(context.permissions)) {
      return NextResponse.json(
        { success: false, error: { code: 'E4030', message: 'Forbidden' } },
        { status: 403 }
      );
    }

    try {
      const url = new URL(request.url);
      const countryCode = url.searchParams.get('countryCode') ?? undefined;
      const action = url.searchParams.get('action');

      if (action === 'resolve') {
        if (!countryCode) {
          return NextResponse.json(
            { success: false, error: { code: 'E2001', message: 'countryCode is required' } },
            { status: 400 }
          );
        }
        const data = await countryOnboardingRuleService.resolveRule(
          context.user.tenantId,
          countryCode
        );
        return NextResponse.json({ success: true, data });
      }

      const data = await countryOnboardingRuleService.listRules(context.user.tenantId, countryCode);
      return NextResponse.json({ success: true, data });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to load country onboarding rules',
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
    if (!canWrite(context.permissions)) {
      return NextResponse.json(
        { success: false, error: { code: 'E4030', message: 'Forbidden' } },
        { status: 403 }
      );
    }

    try {
      const body = await request.json();
      if (body.action === 'seed-defaults') {
        const data = await countryOnboardingRuleService.ensureDefaultRules({
          tenantId: context.user.tenantId,
          userId: context.user.id,
        });
        return NextResponse.json({ success: true, data, message: 'Default GCC rules seeded' });
      }

      if (body.action === 'instantiate') {
        if (!body.employeeId) {
          return NextResponse.json(
            { success: false, error: { code: 'E2001', message: 'employeeId is required' } },
            { status: 400 }
          );
        }
        const data = await countryOnboardingRuleService.instantiateForEmployee(
          { tenantId: context.user.tenantId, userId: context.user.id },
          body.employeeId,
          body.onboardingInstanceId
        );
        return NextResponse.json({ success: true, data, message: 'Country tasks instantiated' });
      }

      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Unsupported action' } },
        { status: 400 }
      );
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to update country onboarding rules',
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
          },
        },
        { status: 500 }
      );
    }
  }
);
