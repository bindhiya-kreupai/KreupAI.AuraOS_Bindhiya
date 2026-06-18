/**
 * EPIC-37 red-flag automation rule-firing test API.
 *
 * POST {
 *   rules: [{ code, expression, isActive, thresholdJson? }],
 *   event: { type, tenantId?, payload }
 * } → { verdict: { firing: [{ code, thresholds }] } }
 *
 * This endpoint lets a compliance officer dry-run a candidate
 * red-flag rule against a synthetic event before publishing the
 * rule. It calls the pure `selectFiringRules` helper — no side
 * effects, no DB writes, no real flags raised.
 */

import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { selectFiringRules } from '@/lib/services/checklist-engine/red-flag-automation.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../../_shared';

export const dynamic = 'force-dynamic';

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'risk_register:read', 'compliance:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const body = await req.json();
    if (!Array.isArray(body.rules)) return badRequest('rules (array) required');
    if (!body.event?.type) return badRequest('event.type required');
    const event = {
      type: String(body.event.type),
      tenantId: String(body.event.tenantId ?? ctx.user.tenantId),
      payload: body.event.payload ?? {},
    };
    const firing = selectFiringRules(
      body.rules.map((r: any) => ({
        code: String(r.code ?? ''),
        expression: String(r.expression ?? ''),
        isActive: r.isActive !== false,
        thresholdJson: r.thresholdJson ?? null,
      })),
      event
    );
    return ok({ verdict: { firing, totalCandidates: body.rules.length } });
  } catch (err) {
    return serverError('Failed to test red-flag automation rules', err);
  }
});
