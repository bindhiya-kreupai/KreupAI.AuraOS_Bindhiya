import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { onboardingCaseService } from '@/lib/services/onboarding-case.service';

export const dynamic = 'force-dynamic';

function rolesFromContext(context: { roles?: string[]; user?: { roles?: string[] } }) {
  return context.roles ?? context.user?.roles ?? [];
}

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
      const stage = url.searchParams.get('stage') ?? undefined;
      const status = url.searchParams.get('status') ?? undefined;
      const data = await onboardingCaseService.listCases(context.user.tenantId, { stage, status });
      return NextResponse.json({ success: true, data });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to load onboarding cases',
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
    context: {
      user: { id: string; tenantId: string; roles?: string[] };
      permissions: string[];
      roles?: string[];
    }
  ) => {
    if (!canWrite(context.permissions)) {
      return NextResponse.json(
        { success: false, error: { code: 'E4030', message: 'Forbidden' } },
        { status: 403 }
      );
    }

    try {
      const body = await request.json();
      const auth = {
        tenantId: context.user.tenantId,
        userId: context.user.id,
        roles: rolesFromContext(context),
      };

      if (body.action === 'seed-governance') {
        const data = await onboardingCaseService.ensureDefaultGovernance(auth);
        return NextResponse.json({ success: true, data, message: 'Default governance seeded' });
      }

      if (body.action === 'offer-accepted') {
        const required = ['countryCode', 'legalEntityId', 'employmentType', 'targetJoinDate'];
        const missing = required.filter((field) => !body[field]);
        if (missing.length) {
          return NextResponse.json(
            { success: false, error: { code: 'E2001', message: `Missing: ${missing.join(', ')}` } },
            { status: 400 }
          );
        }
        const data = await onboardingCaseService.consumeOfferAccepted(
          {
            offerId: body.offerId,
            candidateName: body.candidateName,
            candidateEmail: body.candidateEmail,
            countryCode: body.countryCode,
            legalEntityId: body.legalEntityId,
            employmentType: body.employmentType,
            targetJoinDate: new Date(body.targetJoinDate),
            onboardingInstanceId: body.onboardingInstanceId,
            employeeId: body.employeeId,
          },
          auth
        );
        return NextResponse.json(
          { success: true, data, message: 'Onboarding case created' },
          { status: 201 }
        );
      }

      if (body.action === 'escalate-breaches') {
        const data = await onboardingCaseService.escalateBreachedCases(
          context.user.tenantId,
          context.user.id
        );
        return NextResponse.json({ success: true, data, message: 'SLA breaches escalated' });
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
            message: 'Failed to update onboarding cases',
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
          },
        },
        { status: 500 }
      );
    }
  }
);
