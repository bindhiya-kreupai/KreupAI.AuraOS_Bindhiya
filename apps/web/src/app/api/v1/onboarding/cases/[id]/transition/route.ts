import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { onboardingCaseService } from '@/lib/services/onboarding-case.service';

export const dynamic = 'force-dynamic';

function rolesFromContext(context: { roles?: string[]; user?: { roles?: string[] } }) {
  return context.roles ?? context.user?.roles ?? [];
}

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
      const data = await onboardingCaseService.evaluateStageExit(context.user.tenantId, id);
      return NextResponse.json({ success: true, data });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to evaluate onboarding case',
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
      params?: { id?: string };
    }
  ) => {
    if (
      !context.permissions.includes('onboarding:write') &&
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
      const body = await request.json();
      const auth = {
        tenantId: context.user.tenantId,
        userId: context.user.id,
        roles: rolesFromContext(context),
      };

      if (body.action === 'advance') {
        if (!body.targetStage) {
          return NextResponse.json(
            { success: false, error: { code: 'E2001', message: 'targetStage is required' } },
            { status: 400 }
          );
        }
        const data = await onboardingCaseService.advance(id, body.targetStage, body.reason, auth);
        return NextResponse.json({ success: true, data, message: 'Case advanced' });
      }

      if (body.action === 'reassign') {
        if (!body.ownerRole) {
          return NextResponse.json(
            { success: false, error: { code: 'E2001', message: 'ownerRole is required' } },
            { status: 400 }
          );
        }
        const data = await onboardingCaseService.reassign(id, body.ownerRole, body.reason, auth);
        return NextResponse.json({ success: true, data, message: 'Case reassigned' });
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
            message: 'Failed to transition onboarding case',
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
          },
        },
        { status: 500 }
      );
    }
  }
);
