import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import {
  nationalisationArtificialRiskService,
  ARTIFICIAL_RISK_SIGNALS,
} from '@/lib/services/nationalisation-overlay';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    if (action === 'signals') {
      return ok(ARTIFICIAL_RISK_SIGNALS);
    }
    if (action === 'open-critical-count') {
      return ok(
        await nationalisationArtificialRiskService.openCriticalCount(
          ctx.user.tenantId,
          url.searchParams.get('program') ?? undefined
        )
      );
    }
    return ok(
      await nationalisationArtificialRiskService.list(ctx.user.tenantId, {
        program: url.searchParams.get('program') ?? undefined,
        riskBand: (url.searchParams.get('riskBand') as any) ?? undefined,
        isResolved:
          url.searchParams.get('isResolved') === null
            ? undefined
            : url.searchParams.get('isResolved') === 'true',
        employeeId: url.searchParams.get('employeeId') ?? undefined,
        evidenceMonth: url.searchParams.get('evidenceMonth') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list artificial-risk flags', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'upsert') {
      if (
        !body.employeeId ||
        !body.program ||
        !body.evidenceMonth ||
        !Array.isArray(body.triggeredSignals)
      ) {
        return badRequest('employeeId/program/evidenceMonth/triggeredSignals required');
      }
      return ok(
        await nationalisationArtificialRiskService.upsert(
          {
            employeeId: body.employeeId,
            program: body.program,
            evidenceMonth: body.evidenceMonth,
            triggeredSignals: body.triggeredSignals,
            notes: body.notes,
          },
          auth
        ),
        'Flag recorded'
      );
    }
    if (body.action === 'resolve') {
      if (!body.id || !body.resolutionReason) {
        return badRequest('id/resolutionReason required');
      }
      return ok(
        await nationalisationArtificialRiskService.resolve(
          body.id,
          { resolutionReason: body.resolutionReason },
          auth
        ),
        'Resolved'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update artificial-risk flag', err);
  }
});
