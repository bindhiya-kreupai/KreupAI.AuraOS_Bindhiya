/**
 * EPIC-06 onboarding checklist API.
 *
 * POST { joiningDate, items?: OnboardingItem[] } → {
 *   verdict: {
 *     items: OnboardingItem[],
 *     summary: CompletionSummary
 *   }
 * }
 *
 * When `items` is omitted, the default pre-joining + joining-day
 * checklist is built. When supplied, the caller can pass an updated
 * snapshot (e.g. DONE statuses) and the summary is recomputed.
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import {
  buildChecklist,
  completionSummary,
} from '@/lib/services/onboarding-case.service.checklist';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const inputSchema = z.object({
  joiningDate: z.string().datetime(),
  items: z
    .array(
      z
        .object({
          dueDate: z.string().datetime().optional(),
          completedAt: z.string().datetime().optional().nullable(),
        })
        .passthrough()
    )
    .optional(),
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'employee:read', 'tenant:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) {
      return badRequest('Invalid input', { issues: parsed.error.flatten() });
    }
    const body = parsed.data;
    const joiningDate = new Date(body.joiningDate);
    let items;
    if (Array.isArray(body.items) && body.items.length > 0) {
      items = body.items.map((i: any) => ({
        ...i,
        dueDate: new Date(i.dueDate ?? joiningDate),
        completedAt: i.completedAt ? new Date(i.completedAt) : undefined,
      }));
    } else {
      items = buildChecklist(joiningDate);
    }
    const summary = completionSummary(items);
    return ok({ verdict: { items, summary } });
  } catch (err) {
    return serverError('Failed to evaluate onboarding checklist', err);
  }
});
