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
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { selectFiringRules } from '@/lib/services/checklist-engine/red-flag-automation.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../../_shared';

export const dynamic = 'force-dynamic';

const inputSchema = z.object({
  rules: z.array(
    z.object({
      code: z.string().optional(),
      expression: z.string().optional(),
      isActive: z.boolean().optional(),
      thresholdJson: z.record(z.unknown()).optional().nullable(),
    })
  ),
  event: z.object({
    type: z.string().min(1),
    tenantId: z.string().optional(),
    payload: z.record(z.unknown()).optional(),
  }),
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'risk_register:read', 'compliance:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) {
      return badRequest('Invalid input', { issues: parsed.error.flatten() });
    }
    const body = parsed.data;
    const event = {
      type: body.event.type,
      tenantId: body.event.tenantId ?? ctx.user.tenantId,
      payload: body.event.payload ?? {},
    };
    const firing = selectFiringRules(
      body.rules.map((r) => ({
        code: r.code ?? '',
        expression: r.expression ?? '',
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
