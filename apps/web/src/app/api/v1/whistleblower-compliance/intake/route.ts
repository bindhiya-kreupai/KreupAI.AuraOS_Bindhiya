/**
 * EPIC-31 — Anonymous report intake (maker-checker via AuditLog).
 *
 * POST { action: 'submit', input: ... }   — Anonymous intake. No auth user is recorded; only tenant.
 * POST { action: 'triage', input: ... }   — Triager (checker). Must hold whistleblower:write.
 * POST { action: 'reject', input: ... }   — Triager rejects with reason.
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { whistleblowerIntakeService } from '@/lib/services/whistleblower-compliance/whistleblower.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const submitSchema = z.object({
  action: z.literal('submit'),
  input: z.object({
    category: z.string().min(1),
    body: z.string().min(10),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  }),
});

const triageSchema = z.object({
  action: z.literal('triage'),
  input: z.object({ reportId: z.string().uuid() }),
});

const rejectSchema = z.object({
  action: z.literal('reject'),
  input: z.object({ reportId: z.string().uuid(), reason: z.string().min(5) }),
});

const inputSchema = z.discriminatedUnion('action', [submitSchema, triageSchema, rejectSchema]);

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) return badRequest('Invalid input', { issues: parsed.error.flatten() });
    const body = parsed.data;

    if (body.action === 'submit') {
      // Intake is anonymous — anyone authenticated to the tenant can file.
      if (!hasAny(ctx.permissions, 'whistleblower:submit', 'compliance:read', 'dashboard:read')) {
        return forbidden();
      }
      const state = await whistleblowerIntakeService.submitAnonymous(body.input, ctx.user.tenantId);
      return ok({ state });
    }
    if (body.action === 'triage') {
      if (!hasAny(ctx.permissions, 'whistleblower:write', 'compliance:write')) return forbidden();
      const state = await whistleblowerIntakeService.triage(body.input.reportId, {
        tenantId: ctx.user.tenantId,
        userId: ctx.user.id,
      });
      return ok({ state });
    }
    // reject
    if (!hasAny(ctx.permissions, 'whistleblower:write', 'compliance:write')) return forbidden();
    const state = await whistleblowerIntakeService.reject(body.input.reportId, body.input.reason, {
      tenantId: ctx.user.tenantId,
      userId: ctx.user.id,
    });
    return ok({ state });
  } catch (err) {
    return serverError('Failed to process whistleblower intake', err);
  }
});
