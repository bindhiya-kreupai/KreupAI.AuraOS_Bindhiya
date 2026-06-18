/**
 * EPIC-11 WPS release-gate API (segregation of duties).
 *
 * POST { action: 'markPrepared', submissionId } → { ok: true }
 * POST { action: 'release', submissionId, force?, bypassJustification? }
 *   → { verdict: ReleaseOutcome }
 */

import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { wpsReleaseGateService } from '@/lib/services/wps-compliance/release-gate.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'payroll:read', 'payroll:manage', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const body = await req.json();
    const auth = {
      tenantId: ctx.user.tenantId,
      userId: ctx.user.id,
      userEmail: (ctx.user as any).email,
      roles: (ctx as any).roles ?? (ctx.user as any).roles ?? [],
    };

    if (body.action === 'markPrepared') {
      if (!body.submissionId) return badRequest('submissionId required');
      await wpsReleaseGateService.markPrepared(body.submissionId, auth);
      return ok({ ok: true });
    }

    if (body.action === 'release') {
      if (!body.submissionId) return badRequest('submissionId required');
      const verdict = await wpsReleaseGateService.release(
        {
          submissionId: body.submissionId,
          force: body.force === true,
          bypassJustification: body.bypassJustification,
          submittedAt: body.submittedAt ? new Date(body.submittedAt) : undefined,
        },
        auth
      );
      return ok({ verdict });
    }

    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to evaluate WPS release-gate action', err);
  }
});
