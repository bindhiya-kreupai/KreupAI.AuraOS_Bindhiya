/**
 * EPIC-09 organisation change-request API (department / position
 * maker-checker workflow).
 *
 * POST { action: 'propose', entity, operation, payload, justification, effectiveFrom? }
 *   → { record: OrgChangeRecord }
 *
 * POST { action: 'approve', requestId } → { record }
 * POST { action: 'reject', requestId, reason } → { record }
 * GET  → { records: OrgChangeRecord[] } (PENDING for tenant)
 */

import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { orgChangeRequestService } from '@/lib/services/organization/org-change-request.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const VALID_ENTITIES = new Set(['department', 'position']);
const VALID_OPERATIONS = new Set(['CREATE', 'UPDATE', 'DELETE']);

export const GET = withEnhancedAuth(async (_req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'organization:read', 'org:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const records = await orgChangeRequestService.listPending(ctx.user.tenantId);
    return ok({ records, total: records.length });
  } catch (err) {
    return serverError('Failed to list pending org change requests', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'organization:manage', 'org:manage', 'organization:read')) {
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
      if (!VALID_ENTITIES.has(body.entity)) {
        return badRequest('entity must be one of ' + [...VALID_ENTITIES].join(', '));
      }
      if (!VALID_OPERATIONS.has(body.operation)) {
        return badRequest('operation must be one of ' + [...VALID_OPERATIONS].join(', '));
      }
      if (!body.payload) return badRequest('payload required');
      if (!body.justification) return badRequest('justification required');
      const record = await orgChangeRequestService.propose(
        {
          entity: body.entity,
          operation: body.operation,
          payload: body.payload,
          justification: body.justification,
          effectiveFrom: body.effectiveFrom ? new Date(body.effectiveFrom) : undefined,
        },
        auth
      );
      return ok({ record });
    }

    if (body.action === 'approve') {
      if (!body.requestId) return badRequest('requestId required');
      const record = await orgChangeRequestService.approve(body.requestId, auth);
      return ok({ record });
    }

    if (body.action === 'reject') {
      if (!body.requestId) return badRequest('requestId required');
      if (!body.reason) return badRequest('reason required');
      const record = await orgChangeRequestService.reject(body.requestId, body.reason, auth);
      return ok({ record });
    }

    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to evaluate org change request action', err);
  }
});
