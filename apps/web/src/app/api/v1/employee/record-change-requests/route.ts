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
import { withEnhancedAuth } from '@/lib/auth';
import { employeeRecordChangeRequestService } from '@/lib/services/ess/record-change-request.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

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
    const body = await req.json();
    const auth = {
      tenantId: ctx.user.tenantId,
      userId: ctx.user.id,
      userEmail: (ctx.user as any).email,
    };

    if (body.action === 'propose') {
      if (!body.employeeId) return badRequest('employeeId required');
      if (!Array.isArray(body.changes) || body.changes.length === 0) {
        return badRequest('changes (non-empty array) required');
      }
      if (!body.justification) return badRequest('justification required');
      const record = await employeeRecordChangeRequestService.propose(
        {
          employeeId: body.employeeId,
          changes: body.changes,
          justification: body.justification,
        },
        auth
      );
      return ok({ record });
    }

    if (body.action === 'approve') {
      if (!body.requestId) return badRequest('requestId required');
      const record = await employeeRecordChangeRequestService.approve(body.requestId, auth);
      return ok({ record });
    }

    if (body.action === 'reject') {
      if (!body.requestId) return badRequest('requestId required');
      if (!body.reason) return badRequest('reason required');
      const record = await employeeRecordChangeRequestService.reject(
        body.requestId,
        body.reason,
        auth
      );
      return ok({ record });
    }

    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to evaluate record change request action', err);
  }
});
