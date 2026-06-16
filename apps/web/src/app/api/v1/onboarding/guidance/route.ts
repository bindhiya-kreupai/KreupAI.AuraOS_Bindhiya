import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { onboardingGuidanceService } from '@/lib/services/onboarding-guidance.service';

export const dynamic = 'force-dynamic';

function canRead(permissions: string[]) {
  return permissions.includes('onboarding:read') || permissions.includes('employee:update');
}

function canWrite(permissions: string[]) {
  return permissions.includes('onboarding:write') || permissions.includes('employee:update');
}

export const GET = withEnhancedAuth(
  async (
    request: NextRequest,
    context: { user: { id: string; tenantId: string }; permissions: string[] }
  ) => {
    if (!canRead(context.permissions)) {
      return NextResponse.json(
        { success: false, error: { code: 'E4030', message: 'Forbidden' } },
        { status: 403 }
      );
    }

    try {
      const url = new URL(request.url);
      const action = url.searchParams.get('action');
      const countryCode = url.searchParams.get('countryCode') ?? undefined;
      const contentKey = url.searchParams.get('contentKey') ?? 'ONBOARDING_OVERVIEW';
      const status = url.searchParams.get('status') ?? undefined;

      if (action === 'resolve') {
        if (!countryCode) {
          return NextResponse.json(
            { success: false, error: { code: 'E2001', message: 'countryCode is required' } },
            { status: 400 }
          );
        }
        const data = await onboardingGuidanceService.resolve(
          context.user.tenantId,
          contentKey,
          countryCode,
          {
            userId: context.user.id,
            onboardingCaseId: url.searchParams.get('onboardingCaseId') ?? undefined,
            stage: url.searchParams.get('stage') ?? undefined,
          }
        );
        return NextResponse.json({ success: true, data });
      }

      const data = await onboardingGuidanceService.list(context.user.tenantId, {
        countryCode,
        contentKey,
        status,
      });
      return NextResponse.json({ success: true, data });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to load onboarding guidance',
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
      const auth = { tenantId: context.user.tenantId, userId: context.user.id };
      if (body.action === 'seed-defaults') {
        const data = await onboardingGuidanceService.seedDefaults(auth);
        return NextResponse.json({ success: true, data, message: 'Default guidance seeded' });
      }

      const required = [
        'contentKey',
        'countryCode',
        'title',
        'introduction',
        'objectives',
        'keyTakeaways',
      ];
      const missing = required.filter((field) => body[field] == null);
      if (missing.length) {
        return NextResponse.json(
          { success: false, error: { code: 'E2001', message: `Missing: ${missing.join(', ')}` } },
          { status: 400 }
        );
      }
      const data = await onboardingGuidanceService.createVersion(
        {
          contentKey: body.contentKey,
          countryCode: body.countryCode,
          title: body.title,
          introduction: body.introduction,
          objectives: body.objectives,
          keyTakeaways: body.keyTakeaways,
          obligations: body.obligations,
          publish: Boolean(body.publish),
        },
        auth
      );
      return NextResponse.json(
        { success: true, data, message: 'Guidance version created' },
        { status: 201 }
      );
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to update onboarding guidance',
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
          },
        },
        { status: 500 }
      );
    }
  }
);
