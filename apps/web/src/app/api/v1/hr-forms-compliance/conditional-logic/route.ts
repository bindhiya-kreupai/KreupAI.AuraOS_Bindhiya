/**
 * EPIC-33 HR forms conditional-logic API.
 *
 * POST {
 *   fields: FormField[],
 *   values: Record<string, unknown>
 * } → { verdict: { render: FormRenderResult, missingRequired: string[] } }
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import {
  findMissingRequiredFields,
  renderForm,
} from '@/lib/services/hr-forms-compliance/conditional-logic.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const inputSchema = z.object({
  fields: z.array(z.record(z.unknown())),
  values: z.record(z.unknown()).optional(),
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'hr_form:read', 'tenant:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) {
      return badRequest('Invalid input', { issues: parsed.error.flatten() });
    }
    const body = parsed.data;
    const values = body.values ?? {};
    const render = renderForm(body.fields as any, values);
    const missingRequired = findMissingRequiredFields(render, values);
    return ok({ verdict: { render, missingRequired } });
  } catch (err) {
    return serverError('Failed to evaluate HR form conditional logic', err);
  }
});
