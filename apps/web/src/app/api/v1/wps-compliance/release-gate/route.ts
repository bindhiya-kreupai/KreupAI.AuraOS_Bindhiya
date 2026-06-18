/**
 * EPIC-11 WPS release-gate API (segregation of duties).
 *
 * POST { action: 'markPrepared', submissionId } → { ok: true }
 * POST { action: 'release', submissionId, force?, bypassJustification? }
 *   → { verdict: ReleaseOutcome }
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { wpsReleaseGateService } from '@/lib/services/wps-compliance/release-gate.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const inputSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('markPrepared'),
    submissionId: z.string().min(1),
  }),
  z.object({
    action: z.literal('release'),
    submissionId: z.string().min(1),
    force: z.boolean().optional(),
    bypassJustification: z.string().optional(),
    submittedAt: z.string().datetime().optional(),
  }),
]);

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'payroll:read', 'payroll:manage', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) {
      return badRequest('Invalid input', { issues: parsed.error.flatten() });
    }
    const body = parsed.data;
    const auth = {
      tenantId: ctx.user.tenantId,
      userId: ctx.user.id,
      userEmail: (ctx.user as any).email,
      roles: (ctx as any).roles ?? (ctx.user as any).roles ?? [],
    };

    if (body.action === 'markPrepared') {
      await wpsReleaseGateService.markPrepared(body.submissionId, auth);
      return ok({ ok: true });
    }

    // body.action === 'release'
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
  } catch (err) {
    return serverError('Failed to evaluate WPS release-gate action', err);
  }
});
