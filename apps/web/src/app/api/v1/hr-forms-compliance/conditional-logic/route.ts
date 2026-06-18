/**
 * EPIC-33 HR forms conditional-logic API.
 *
 * POST {
 *   fields: FormField[],
 *   values: Record<string, unknown>
 * } → { verdict: { render: FormRenderResult, missingRequired: string[] } }
 */

import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import {
  findMissingRequiredFields,
  renderForm,
} from '@/lib/services/hr-forms-compliance/conditional-logic.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'hr_form:read', 'tenant:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const body = await req.json();
    if (!Array.isArray(body.fields)) return badRequest('fields (array) required');
    const values = body.values && typeof body.values === 'object' ? body.values : {};
    const render = renderForm(body.fields, values);
    const missingRequired = findMissingRequiredFields(render, values);
    return ok({ verdict: { render, missingRequired } });
  } catch (err) {
    return serverError('Failed to evaluate HR form conditional logic', err);
  }
});
