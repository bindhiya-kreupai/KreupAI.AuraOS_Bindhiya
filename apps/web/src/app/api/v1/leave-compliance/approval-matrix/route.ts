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
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import {
  DEFAULT_APPROVAL_MATRIX,
  advanceLevel,
  buildApproverChain,
  matchApprovalRule,
} from '@/lib/services/leave/approval-matrix.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const baseShape = {
  leaveType: z.string().min(1),
  totalDays: z.number(),
  country: z.string().optional(),
};

const inputSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('matchRule'), ...baseShape }),
  z.object({ action: z.literal('buildChain'), ...baseShape }),
  z.object({
    action: z.literal('advanceLevel'),
    ...baseShape,
    currentLevel: z.number(),
  }),
]);

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'leave:read', 'leave:manage', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    // default action to 'buildChain' when missing
    const withAction =
      raw && typeof raw === 'object' && raw.action ? raw : { ...raw, action: 'buildChain' };
    const parsed = inputSchema.safeParse(withAction);
    if (!parsed.success) {
      return badRequest('Invalid input', { issues: parsed.error.flatten() });
    }
    const body = parsed.data;

    const rule = matchApprovalRule(DEFAULT_APPROVAL_MATRIX, {
      leaveType: body.leaveType,
      country: body.country,
      totalDays: body.totalDays,
    });
    const chain = buildApproverChain(rule);

    if (body.action === 'matchRule') return ok({ rule });
    if (body.action === 'buildChain') return ok({ rule, chain });

    // advanceLevel
    const decision = advanceLevel(chain, body.currentLevel);
    return ok({ rule, chain, advance: decision });
  } catch (err) {
    return serverError('Failed to evaluate leave approval matrix', err);
  }
});
