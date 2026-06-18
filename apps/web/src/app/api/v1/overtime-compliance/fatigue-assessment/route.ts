/**
 * EPIC-12 fatigue assessment API.
 *
 * POST { employeeId, proposedStart, proposedEnd, country?, appliesTo?,
 *        actorRole? } → { verdict: FatigueAssessmentVerdict }
 *
 * Resolves the active FatigueRule for the country, walks the
 * employee's 8-day attendance history, and returns the typed verdict
 * with breach reasons + DoA escalation hint.
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { fatigueAssessmentService } from '@/lib/services/overtime-compliance/fatigue-assessment.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const inputSchema = z.object({
  employeeId: z.string().min(1),
  proposedStart: z.string().datetime(),
  proposedEnd: z.string().datetime(),
  country: z.string().optional(),
  appliesTo: z.string().optional(),
  actorRole: z.string().optional(),
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'attendance:manage', 'attendance:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) {
      return badRequest('Invalid input', { issues: parsed.error.flatten() });
    }
    const body = parsed.data;
    const verdict = await fatigueAssessmentService.assess({
      tenantId: ctx.user.tenantId,
      employeeId: body.employeeId,
      proposedStart: new Date(body.proposedStart),
      proposedEnd: new Date(body.proposedEnd),
      country: body.country,
      appliesTo: body.appliesTo,
      actorRole: body.actorRole,
    });
    return ok({ verdict });
  } catch (err) {
    return serverError('Failed to assess fatigue', err);
  }
});
