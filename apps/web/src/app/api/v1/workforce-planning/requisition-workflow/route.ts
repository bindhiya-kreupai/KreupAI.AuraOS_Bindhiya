/**
 * EPIC-03-S04 — Requisition maker-checker workflow.
 *
 * POST { action: 'submit', requisitionId, justification } → { state }
 * POST { action: 'approve', requisitionId } → { state }
 * POST { action: 'reject', requisitionId, reason } → { state }
 * GET  ?requisitionId=…                          → { state | null }
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { requisitionMakerCheckerService } from '@/lib/services/workforce-planning/workforce-planning.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const inputSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('submit'),
    requisitionId: z.string().min(1),
    justification: z.string().min(5),
  }),
  z.object({ action: z.literal('approve'), requisitionId: z.string().min(1) }),
  z.object({
    action: z.literal('reject'),
    requisitionId: z.string().min(1),
    reason: z.string().min(3),
  }),
]);

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'workforce_planning:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    const requisitionId = url.searchParams.get('requisitionId');
    if (!requisitionId) return badRequest('requisitionId required');
    const state = await requisitionMakerCheckerService.findOne(requisitionId, ctx.user.tenantId);
    return ok({ state });
  } catch (err) {
    return serverError('Failed to load requisition workflow', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'workforce_planning:manage', 'workforce_planning:approve'))
    return forbidden();
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) return badRequest('Invalid input', { issues: parsed.error.flatten() });
    const body = parsed.data;
    const auth = {
      tenantId: ctx.user.tenantId,
      userId: ctx.user.id,
      userEmail: (ctx.user as any).email,
    };
    if (body.action === 'submit') {
      const state = await requisitionMakerCheckerService.submit(
        { requisitionId: body.requisitionId, justification: body.justification },
        auth
      );
      return ok({ state });
    }
    if (body.action === 'approve') {
      const state = await requisitionMakerCheckerService.approve(body.requisitionId, auth);
      return ok({ state });
    }
    const state = await requisitionMakerCheckerService.reject(
      body.requisitionId,
      body.reason,
      auth
    );
    return ok({ state });
  } catch (err) {
    return serverError('Failed to update requisition workflow', err);
  }
});
