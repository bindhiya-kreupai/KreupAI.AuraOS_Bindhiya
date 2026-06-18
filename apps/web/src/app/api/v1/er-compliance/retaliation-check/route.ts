/**
 * EPIC-25 retaliation protection API.
 *
 * GET ?employeeId=...&country=... → returns the current protection
 * window for the employee (active flag + expiry + whistleblower flag).
 *
 * POST { employeeId, actionType, country?, relatedActionId?,
 *        justification? } → assesses the proposed adverse action,
 *        ALWAYS writes the assessment to the audit log, returns the
 *        typed verdict.
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { retaliationProtectionService } from '@/lib/services/er-compliance/retaliation-protection.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const actionTypeEnum = z.enum([
  'DISCIPLINARY_ACTION',
  'TERMINATION',
  'DEMOTION',
  'SALARY_REDUCTION',
  'INVOLUNTARY_TRANSFER',
  'NEGATIVE_PERFORMANCE_REVIEW',
]);

const getQuerySchema = z.object({
  employeeId: z.string().min(1),
  country: z.string().optional().nullable(),
  asOf: z.string().datetime().optional().nullable(),
});

const postSchema = z.object({
  employeeId: z.string().min(1),
  actionType: actionTypeEnum,
  country: z.string().optional(),
  relatedActionId: z.string().optional(),
  justification: z.string().optional(),
  proposedAt: z.string().datetime().optional(),
});

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'employee:read', 'risk_register:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const url = new URL(req.url);
    const parsed = getQuerySchema.safeParse({
      employeeId: url.searchParams.get('employeeId'),
      country: url.searchParams.get('country'),
      asOf: url.searchParams.get('asOf'),
    });
    if (!parsed.success) {
      return badRequest('Invalid input', { issues: parsed.error.flatten() });
    }
    const { employeeId, country, asOf } = parsed.data;
    const window = await retaliationProtectionService.resolveProtectionWindow(
      ctx.user.tenantId,
      employeeId,
      country ?? undefined,
      asOf ? new Date(asOf) : new Date()
    );
    return ok({ window });
  } catch (err) {
    return serverError('Failed to resolve retaliation protection window', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'risk_register:manage', 'employee:manage')) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = postSchema.safeParse(raw);
    if (!parsed.success) {
      return badRequest('Invalid input', { issues: parsed.error.flatten() });
    }
    const body = parsed.data;
    const verdict = await retaliationProtectionService.assessAdverseAction(
      {
        employeeId: body.employeeId,
        actionType: body.actionType,
        country: body.country,
        relatedActionId: body.relatedActionId,
        justification: body.justification,
        proposedAt: body.proposedAt ? new Date(body.proposedAt) : undefined,
      },
      { tenantId: ctx.user.tenantId, userId: ctx.user.id, userEmail: (ctx.user as any).email }
    );
    return ok({ verdict });
  } catch (err) {
    return serverError('Failed to assess adverse action', err);
  }
});
