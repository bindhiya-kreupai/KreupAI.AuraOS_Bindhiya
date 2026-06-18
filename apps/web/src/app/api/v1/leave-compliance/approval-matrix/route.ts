/**
 * EPIC-20 leave approval matrix API.
 *
 * Evaluates the approval chain that should fire for a proposed leave
 * request, using the pure helpers from approval-matrix.service.ts.
 *
 * POST {
 *   action: 'matchRule' | 'buildChain' | 'advanceLevel',
 *   leaveType, totalDays, country?, currentLevel? (for advanceLevel)
 * } → { rule?, chain?, advance? }
 */

import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import {
  DEFAULT_APPROVAL_MATRIX,
  advanceLevel,
  buildApproverChain,
  matchApprovalRule,
} from '@/lib/services/leave/approval-matrix.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'leave:read', 'leave:manage', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const body = await req.json();
    const action = body.action ?? 'buildChain';

    if (action === 'matchRule' || action === 'buildChain' || action === 'advanceLevel') {
      if (!body.leaveType) return badRequest('leaveType required');
      if (typeof body.totalDays !== 'number') return badRequest('totalDays (number) required');
      const rule = matchApprovalRule(DEFAULT_APPROVAL_MATRIX, {
        leaveType: body.leaveType,
        country: body.country,
        totalDays: body.totalDays,
      });
      const chain = buildApproverChain(rule);

      if (action === 'matchRule') return ok({ rule });
      if (action === 'buildChain') return ok({ rule, chain });

      // advanceLevel
      if (typeof body.currentLevel !== 'number') {
        return badRequest('currentLevel (number) required for advanceLevel');
      }
      const decision = advanceLevel(chain, body.currentLevel);
      return ok({ rule, chain, advance: decision });
    }

    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to evaluate leave approval matrix', err);
  }
});
