/**
 * EPIC-08 employee record change-request API (maker-checker for
 * sensitive field changes; inline path for non-sensitive).
 *
 * POST { action: 'propose', employeeId, changes, justification } → { record }
 * POST { action: 'approve', requestId } → { record }
 * POST { action: 'reject', requestId, reason } → { record }
 * GET  → { records: PENDING records }
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { employeeRecordChangeRequestService } from '@/lib/services/ess/record-change-request.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const inputSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('propose'),
    employeeId: z.string().min(1),
    changes: z.array(z.record(z.unknown())).min(1),
    justification: z.string().min(1),
  }),
  z.object({
    action: z.literal('approve'),
    requestId: z.string().min(1),
  }),
  z.object({
    action: z.literal('reject'),
    requestId: z.string().min(1),
    reason: z.string().min(1),
  }),
]);

export const GET = withEnhancedAuth(async (_req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'employee:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const records = await employeeRecordChangeRequestService.listPending(ctx.user.tenantId);
    return ok({ records, total: records.length });
  } catch (err) {
    return serverError('Failed to list pending record change requests', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'employee:manage', 'employee:read')) {
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
    };

    if (body.action === 'propose') {
      const record = await employeeRecordChangeRequestService.propose(
        {
          employeeId: body.employeeId,
          changes: body.changes as any,
          justification: body.justification,
        },
        auth
      );
      return ok({ record });
    }

    if (body.action === 'approve') {
      const record = await employeeRecordChangeRequestService.approve(body.requestId, auth);
      return ok({ record });
    }

    // reject
    const record = await employeeRecordChangeRequestService.reject(
      body.requestId,
      body.reason,
      auth
    );
    return ok({ record });
  } catch (err) {
    return serverError('Failed to evaluate record change request action', err);
  }
});
